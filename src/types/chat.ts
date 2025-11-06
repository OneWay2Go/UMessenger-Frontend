import { ChatType } from './enums';
import type { ChatUser } from './chatUser';

export interface Chat {
  id: number;
  name: string;
  type: ChatType;
  chatImageUrl?: string;
  createdAt: string;
  isDeleted: boolean;
}

export interface ChatDto {
  id: number;
  name: string;
  type: ChatType;
  chatImageUrl?: string;
  createdAt: string;
  currentUserRole: string;
  chatUsers: ChatUser[];
}

export interface AddChatDto {
  name: string;
  chatType: ChatType;
}

export interface UpdateChatDto {
  id: number;
  name: string;
}

export interface GlobalSearchResponseDto {
  users?: User[];
  chats?: Chat[];
  userExistingChats?: Chat[];
}

import type { User } from './user';

