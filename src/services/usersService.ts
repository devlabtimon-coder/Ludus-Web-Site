import { api } from './api';
import { User } from '../types/api';

export const usersService = {
  // Listar todos os usuários
  getUsers: async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  // Buscar perfil do usuário autenticado
  getProfile: async () => {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  // Atualizar perfil
  updateProfile: async (userData: Partial<User>) => {
    const response = await api.patch<User>('/users/profile', userData);
    return response.data;
  },
};
