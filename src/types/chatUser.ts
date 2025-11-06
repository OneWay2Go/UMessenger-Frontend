import type { ChatRole } from './enums';
import type { Chat } from './chat';
import type { User } from './user';

export interface ChatUser {
  id: number;
  chatId: number;
  userId: number;
  role: ChatRole;
  joinedAt: string;
  isDeleted: boolean;
  chat?: Chat;
  user?: User;
}

export interface AddChatUserDto {
  chatId: number;
  userId: number;
}

export interface UpdateChatUserDto {
  id: number;
  chatId: number;
  userId: number;
}

