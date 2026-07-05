import { apiClient } from './client';
import type { UserRole } from '../types/festival';

export interface AuthUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await apiClient.post('/auth/login/', payload);
    return response.data as { access: string; refresh: string; user: AuthUser };
  },
  me: async () => {
    const response = await apiClient.get('/auth/me/');
    return response.data as AuthUser;
  },
  logout: async (refresh?: string | null) => {
    await apiClient.post('/auth/logout/', refresh ? { refresh } : {});
  },
};
