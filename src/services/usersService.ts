import { api } from './api';
import { User } from '../types/api';

export const usersService = {
  getUsers: async () => {
    const response = await api.get<any>('/admin/users');
   
    return Array.isArray(response.data) ? response.data : (response.data.data || []);
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