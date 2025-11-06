import * as signalR from '@microsoft/signalr';
import type { AddMessageDto } from '../types/message';
import type { Message } from '../types/message';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7047';
const HUB_URL = `${API_BASE_URL}/hubs/message`;

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async start(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // Stop existing connection if any
    if (this.connection) {
      await this.stop();
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token available');
    }
    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => {
          const currentToken = localStorage.getItem('accessToken');
          return currentToken || '';
        },
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          }
          return null;
        },
      })
      .build();

    // Set up reconnection handlers
    this.connection.onreconnecting((error) => {
      console.log('SignalR Reconnecting...', error);
      this.reconnectAttempts++;
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR Reconnected:', connectionId);
      this.reconnectAttempts = 0;
    });

    this.connection.onclose((error) => {
      console.log('SignalR Connection Closed', error);
      this.reconnectAttempts = 0;
    });

    try {
      await this.connection.start();
      console.log('SignalR Connected');
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('SignalR Connection Error:', error);
      this.connection = null;
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log('SignalR Disconnected');
    }
  }

  async sendMessage(messageDto: AddMessageDto): Promise<void> {
    if (!this.connection) {
      await this.start();
    }
    
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('SendMessage', messageDto);
    } else if (this.connection?.state === signalR.HubConnectionState.Connecting) {
      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
        const checkConnection = () => {
          if (this.connection?.state === signalR.HubConnectionState.Connected) {
            clearTimeout(timeout);
            resolve();
          } else if (this.connection?.state === signalR.HubConnectionState.Disconnected) {
            clearTimeout(timeout);
            reject(new Error('Connection failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
      await this.connection.invoke('SendMessage', messageDto);
    } else {
      await this.start();
      if (!this.connection) {
        throw new Error('Failed to establish SignalR connection');
      }
      await this.connection.invoke('SendMessage', messageDto);
    }
  }

  async addToGroup(chatId: string): Promise<void> {
    if (!this.connection) {
      await this.start();
    }
    
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('AddToGroup', chatId);
    } else if (this.connection?.state === signalR.HubConnectionState.Connecting) {
      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);
        const checkConnection = () => {
          if (this.connection?.state === signalR.HubConnectionState.Connected) {
            clearTimeout(timeout);
            resolve();
          } else if (this.connection?.state === signalR.HubConnectionState.Disconnected) {
            clearTimeout(timeout);
            reject(new Error('Connection failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
      await this.connection.invoke('AddToGroup', chatId);
    } else {
      await this.start();
      if (!this.connection) {
        throw new Error('Failed to establish SignalR connection');
      }
      await this.connection.invoke('AddToGroup', chatId);
    }
  }

  async removeFromGroup(chatId: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('RemoveFromGroup', chatId);
    }
  }

  onReceiveMessage(callback: (message: Message) => void): void {
    if (this.connection) {
      this.connection.on('ReceiveMessage', callback);
    }
  }

  onMessageEdited(callback: (messageId: number, content: string) => void): void {
    if (this.connection) {
      this.connection.on('OnMessageEdited', callback);
    }
  }

  onMessageDeleted(callback: (chatId: number, messageId: number) => void): void {
    if (this.connection) {
      this.connection.on('OnMessageDeleted', callback);
    }
  }

  offReceiveMessage(): void {
    if (this.connection) {
      this.connection.off('ReceiveMessage');
    }
  }

  offMessageEdited(): void {
    if (this.connection) {
      this.connection.off('OnMessageEdited');
    }
  }

  offMessageDeleted(): void {
    if (this.connection) {
      this.connection.off('OnMessageDeleted');
    }
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }
}

export const signalRService = new SignalRService();

