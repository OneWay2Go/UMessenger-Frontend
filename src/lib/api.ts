import axios, { AxiosInstance } from 'axios';
import type { AddUserDTO, LoginResponse, User, Chat, Message, AddMessageDto, AddChatDto, AddChatUserDto, GlobalSearchResponse, UpdateMessageDto } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7047';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newAccessToken = await this.refreshAuthToken();
            if (newAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return this.client(originalRequest);
            }
          } catch (err) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async refreshAuthToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return null;
    }

    try {
      const { data } = await this.client.post('/user/refresh-token', null, {
        headers: { refreshToken },
      });
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.accessToken;
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      throw err;
    }
  }

  // Auth
  async register(data: AddUserDTO) {
    return this.client.post<LoginResponse>('/user/register', data);
  }

  async login(data: AddUserDTO) {
    const response = await this.client.post<LoginResponse>('/user/log-in', data);
    if (response.data.accessToken && response.data.refreshToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }

  // Search
  async globalSearch(query: string) {
    return this.client.get<GlobalSearchResponse>(`/chat/global-search?searchText=${query}`);
  }

  // Users
  async getAllUsers() {
    return this.client.get<User[]>('/user/get-all');
  }

  async getUserById(id: number) {
    return this.client.get<User>(`/user/get-by-id/${id}`);
  }

  async updateUser(id: number, data: Partial<User>) {
    return this.client.put<User>(`/user/update/${id}`, data);
  }

  async searchUsers(query: string) {
    return this.client.get<User[]>(`/user/search?query=${query}`);
  }

  // Chats
  async getAllChats() {
    return this.client.get<Chat[]>('/chat/get-all');
  }

  async getChatById(id: number) {
    return this.client.get<Chat>(`/chat/get-by-id?id=${id}`);
  }

  async getOrCreateOneOnOneChat(secondUserId: number) {
    return this.client.get<Chat>(`/chat/one-on-one?secondUserId=${secondUserId}`);
  }

  async addChat(data: AddChatDto) {
    return this.client.post<Chat>('/chat/add', data);
  }

  async updateChat(id: number, name: string) {
    return this.client.put('/chat/update', { id, name });
  }

  async removeChat(id: number) {
    return this.client.delete(`/chat/remove?id=${id}`);
  }

  // Chat Users
  async addChatUser(data: AddChatUserDto) {
    return this.client.post('/chat-user/add', data);
  }

  async removeChatUser(id: number) {
    return this.client.delete(`/chat-user/remove?id=${id}`);
  }

  // Messages
  async getAllMessages() {
    return this.client.get<Message[]>('/message/get-all');
  }

  async getMessageById(id: number) {
    return this.client.get<Message>(`/message/get-by-id?id=${id}`);
  }

  async getMessagesByChatId(chatId: number) {
    return this.client.get<Message[]>(`/message/get-by-chat/${chatId}`);
  }

  async addMessage(data: AddMessageDto) {
    return this.client.post<Message>('/message/add', data);
  }

  async updateMessage(data: UpdateMessageDto) {
    return this.client.put('/message/update-user-check', data);
  }

  async removeMessage(id: number) {
    return this.client.delete(`/message/remove-user-check?id=${id}`);
  }
}

export const apiClient = new ApiClient();
