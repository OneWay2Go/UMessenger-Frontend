import * as signalR from '@microsoft/signalr';
import type { Message } from '@/types/api';

const HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL || 'https://your-api-url.com/chatHub';

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private messageCallbacks: ((message: Message) => void)[] = [];

  async start() {
    if (this.connection) {
      return;
    }

    const token = localStorage.getItem('token');
    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token || '',
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('ReceiveMessage', (message: Message) => {
      this.messageCallbacks.forEach((callback) => callback(message));
    });

    try {
      await this.connection.start();
      console.log('SignalR Connected');
    } catch (err) {
      console.error('SignalR Connection Error:', err);
      setTimeout(() => this.start(), 5000);
    }
  }

  async stop() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  async joinChat(chatId: number) {
    if (this.connection) {
      await this.connection.invoke('JoinChat', chatId);
    }
  }

  async leaveChat(chatId: number) {
    if (this.connection) {
      await this.connection.invoke('LeaveChat', chatId);
    }
  }

  async sendMessage(chatId: number, content: string) {
    if (this.connection) {
      await this.connection.invoke('SendMessage', chatId, content);
    }
  }

  onMessage(callback: (message: Message) => void) {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback);
    };
  }
}

export const signalRService = new SignalRService();
