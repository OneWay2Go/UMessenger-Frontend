export interface User {
  id: number;
  email: string;
  username?: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface Chat {
  id: number;
  name: string;
  chatType: ChatType;
  lastMessage?: Message;
  unreadCount?: number;
}

export enum ChatType {
  Private = 0,
  Group = 1,
}

export interface Message {
  id: number;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  isAttachment: boolean;
  senderId: number;
  chatId: number;
  createdAt: string;
  sender?: User;
}

export interface AddUserDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface AddMessageDto {
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  isAttachment: boolean;
  senderId: number;
  chatId: number;
}

export interface AddChatDto {
  name: string;
  chatType: ChatType;
}

export interface AddChatUserDto {
  chatId: number;
  userId: number;
}
