import api from './api';
import type { Message, AddMessageDto, UpdateMessageDto } from '../types/message';

export const messageService = {
  getAll: async (): Promise<Message[]> => {
    const response = await api.get<Message[]>('/message/get-all');
    return response.data;
  },

  getById: async (id: number): Promise<Message> => {
    const response = await api.get<Message>('/message/get-by-id', { params: { id } });
    return response.data;
  },

  getByChatId: async (chatId: number): Promise<Message[]> => {
    const response = await api.get<Message[]>(`/message/get-by-chat/${chatId}`);
    return response.data;
  },

  add: async (dto: AddMessageDto): Promise<number> => {
    const response = await api.post<number>('/message/add', dto);
    return response.data;
  },

  update: async (dto: UpdateMessageDto): Promise<void> => {
    await api.put('/message/update-user-check', dto);
  },

  remove: async (id: number): Promise<void> => {
    await api.delete('/message/remove-user-check', { params: { id } });
  },
};

