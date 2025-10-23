export interface User {
  id: number;
  email: string;
  username: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface Chat {
  id: number;
  name: string;
  type: ChatType;
  lastMessage?: Message;
  unreadCount?: number;
  users: User[];
  chatImageUrl?: string;
  currentUserRole?: string;
}

export enum ChatType {
  Private = 0,
  PrivateGroup = 1,
  PrivateChannel = 2,
  PublicGroup = 3,
  PublicChannel = 4,
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
  sentAt: string;
  sender?: User;
  isDeleted?: boolean;
}

export interface GlobalSearchResponse {
  users: User[];
  chats: Chat[];
  publicGroups: Chat[];
}

export interface AddUserDTO {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
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

export interface UpdateMessageDto {
    id: number;
    content: string;
}

export interface AddChatDto {
  name: string;
  chatType: ChatType;
}

export interface AddChatUserDto {
  chatId: number;
  userId: number;
}
