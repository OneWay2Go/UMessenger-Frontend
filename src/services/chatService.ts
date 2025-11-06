import api from './api';
import type { Chat, ChatDto, AddChatDto, UpdateChatDto, GlobalSearchResponseDto } from '../types/chat';
import type { AddChatUserDto } from '../types/chatUser';

export const chatService = {
  getAll: async (): Promise<ChatDto[]> => {
    const response = await api.get<ChatDto[]>('/chat/get-all');
    return response.data;
  },

  getById: async (id: number): Promise<ChatDto> => {
    const response = await api.get<ChatDto>('/chat/get-by-id', { params: { id } });
    return response.data;
  },

  globalSearch: async (searchText: string): Promise<GlobalSearchResponseDto> => {
    const response = await api.get<GlobalSearchResponseDto>('/chat/global-search', {
      params: { searchText },
    });
    return response.data;
  },

  oneOnOne: async (secondUserId: number): Promise<Chat> => {
    const response = await api.get<Chat>('/chat/one-on-one', { params: { secondUserId } });
    return response.data;
  },

  add: async (dto: AddChatDto): Promise<number> => {
    const response = await api.post<number>('/chat/add', dto);
    return response.data;
  },

  update: async (dto: UpdateChatDto): Promise<void> => {
    await api.put('/chat/update', dto);
  },

  remove: async (id: number): Promise<void> => {
    await api.delete('/chat/remove', { params: { id } });
  },

  addChatUser: async (dto: AddChatUserDto): Promise<void> => {
    await api.post('/chat-user/add', dto);
  },

  removeChatUser: async (id: number): Promise<void> => {
    await api.delete('/chat-user/remove', { params: { id } });
  },
};

