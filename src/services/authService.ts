import api from './api';
import type { AddUserDTO, LoginResponse } from '../types/user';

export const authService = {
  register: async (dto: AddUserDTO): Promise<string> => {
    const response = await api.post<string>('/user/register', dto);
    return response.data;
  },

  login: async (dto: AddUserDTO): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/user/log-in', dto);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await api.post<{ accessToken: string; refreshToken: string }>(
      '/user/refresh-token',
      {},
      {
        headers: {
          refreshToken: refreshToken,
        },
      }
    );
    return response.data;
  },
};

