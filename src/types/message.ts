import type { MessageStatus } from './enums';
import type { User } from './user';
import type { Chat } from './chat';

export interface Message {
  id: number;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  isAttachment: boolean;
  isDeleted: boolean;
  sentAt: string;
  status: MessageStatus;
  userId: number;
  user?: User;
  chatId: number;
  chat?: Chat;
}

export interface AddMessageDto {
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  isAttachment: boolean;
  userId: number;
  chatId: number;
}

export interface UpdateMessageDto {
  id: number;
  content: string;
}

