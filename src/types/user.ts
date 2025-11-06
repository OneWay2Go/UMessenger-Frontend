import { Role } from './role';

export interface User {
  id: number;
  username?: string;
  displayName?: string;
  email: string;
  emailConfirmationCode?: number;
  isEmailConfirmed: boolean;
  password: string;
  role: Role;
  bio?: string;
  profileImageUrl?: string;
  createdAt: string;
  lastSeen?: string;
  isDeleted: boolean;
}

export interface AddUserDTO {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  username?: string;
  displayName?: string;
  bio?: string;
  profileImageUrl?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

