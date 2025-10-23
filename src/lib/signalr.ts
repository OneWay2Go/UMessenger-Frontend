import * as signalR from '@microsoft/signalr';
import type { Message, AddMessageDto } from '@/types/api';
import { apiClient } from '@/lib/api';

const HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL || 'https://localhost:7047/hubs/message';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private messageCallbacks: ((message: Message) => void)[] = [];
  private messageEditedCallbacks: ((messageId: number, newContent: string) => void)[] = [];
  private messageDeletedCallbacks: ((chatId: number, messageId: number) => void)[] = [];
  private connectionPromise: Promise<void> | null = null;

  start(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: async () => {
          let token = localStorage.getItem('token');
          if (token) {
            return token;
          }
          token = await apiClient.refreshAuthToken();
          return token || '';
        },
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveMessage', (message: Message) => {
      this.messageCallbacks.forEach((callback) => callback(message));
    });

    this.connection.on('OnMessageEdited', (messageId: number, newContent: string) => {
      this.messageEditedCallbacks.forEach((callback) => callback(messageId, newContent));
    });

    this.connection.on('OnMessageDeleted', (chatId: number, messageId: number) => {
      this.messageDeletedCallbacks.forEach((callback) => callback(chatId, messageId));
    });

    this.connectionPromise = this.connection.start()
      .then(() => {
        console.log('SignalR Connected');
      })
      .catch(err => {
        console.error('SignalR Connection Error:', err);
        this.connectionPromise = null; // Reset on failure
        throw err; // Re-throw to propagate the error
      });
      
    return this.connectionPromise;
  }

  async stop() {
    await this.connection?.stop();
    this.connectionPromise = null;
    this.connection = null;
  }

  async addToGroup(chatId: string) {
    await this.connectionPromise;
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('AddToGroup', chatId);
    } else {
      console.warn('SignalR connection not in "Connected" state when calling addToGroup.');
      throw new Error('SignalR connection not established.');
    }
  }

  async removeFromGroup(chatId: string) {
    await this.connectionPromise;
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('RemoveFromGroup', chatId);
    } else {
      console.warn('SignalR connection not in "Connected" state when calling removeFromGroup.');
      throw new Error('SignalR connection not established.');
    }
  }

  async sendMessage(message: AddMessageDto) {
    await this.connectionPromise;
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('SendMessage', message);
    } else {
      console.warn('SignalR connection not in "Connected" state when calling sendMessage.');
      throw new Error('SignalR connection not established.');
    }
  }

  onMessage(callback: (message: Message) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback);
    };
  }

  onMessageEdited(callback: (messageId: number, newContent: string) => void) {
    this.messageEditedCallbacks.push(callback);
    return () => {
      this.messageEditedCallbacks = this.messageEditedCallbacks.filter((cb) => cb !== callback);
    };
  }

  onMessageDeleted(callback: (chatId: number, messageId: number) => void) {
    this.messageDeletedCallbacks.push(callback);
    return () => {
      this.messageDeletedCallbacks = this.messageDeletedCallbacks.filter((cb) => cb !== callback);
    };
  }
}
export const signalRService = new SignalRService();
