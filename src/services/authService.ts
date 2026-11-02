import { api } from './api';
import { User } from '../types/api';

interface LoginCredentials {
  email: string;
  senha: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

// O painel é só para administradores: sessão de outro papel nunca fica salva.
export const isAdminUser = (user: Pick<User, 'role'> | null | undefined) => user?.role === 'ADMIN';

export const authService = {
  // Não grava nada: quem chama confere o papel e só então salva a sessão.
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  loginWithGoogle: async (token: string) => {
    const response = await api.post<LoginResponse>('/auth/google', { token });
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getStoredUser: (): User | null => {
    const user = localStorage.getItem('user');
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },

  saveSession: (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Sessão válida para o painel: token salvo e usuário salvo com papel ADMIN.
  hasAdminSession: () => {
    if (!localStorage.getItem('token')) return false;
    return isAdminUser(authService.getStoredUser());
  },
};