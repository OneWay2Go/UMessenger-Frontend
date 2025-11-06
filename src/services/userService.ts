import api from './api';
import type { User, UpdateUserDto } from '../types/user';

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/user/get-all');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/user/get-by-id/${id}`);
    return response.data;
  },

  search: async (query: string): Promise<User[]> => {
    const response = await api.get<User[]>('/user/search', { params: { query } });
    return response.data;
  },

  update: async (id: number, dto: UpdateUserDto): Promise<void> => {
    await api.put(`/user/update/${id}`, dto);
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/user/remove/${id}`);
  },
};

