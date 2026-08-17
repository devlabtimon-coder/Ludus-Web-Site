import { api } from './api';
import { Mechanic } from '../types/api';

export const mechanicService = {

  getAllAdmin: async (): Promise<Mechanic[]> => {
    const response = await api.get('/admin/mechanics');
    return response.data;
  },

  create: async (data: Partial<Mechanic>): Promise<Mechanic> => {
    const response = await api.post('/admin/mechanics', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Mechanic>): Promise<Mechanic> => {
    const response = await api.patch(`/admin/mechanics/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/mechanics/${id}`);
  }
};