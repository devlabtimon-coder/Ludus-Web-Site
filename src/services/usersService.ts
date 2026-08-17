import { api } from './api';
import { User } from '../types/api';

export const usersService = {
 
  getUsers: async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  
  updateProfile: async (userData: Partial<User>) => {
    const response = await api.patch<User>('/users/profile', userData);
    return response.data;
  },
};
