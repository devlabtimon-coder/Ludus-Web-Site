import { api } from './api';
import { Mechanic } from '../types/api';

export const mechanicService = {

  getAllAdmin: async (): Promise<Mechanic[]> => {
    const response = await api.get('/mechanics/admin');
    return response.data;
  },

  create: async (data: Partial<Mechanic>): Promise<Mechanic> => {
    const response = await api.post('/mechanics', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Mechanic>): Promise<Mechanic> => {
    const response = await api.patch(`/mechanics/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/mechanics/${id}`);
  },

  bulkCreate: async (mechanicsArray: any[]): Promise<{ message: string, count: number }> => {
    const response = await api.post('/mechanics/bulk', { mechanics: mechanicsArray });
    return response.data;
  }
};