import { api } from './api';
import { Rental, RentalStatus } from '../types/api';

export const rentalsService = {

  getAdminRentals: async (params?: {
    status?: RentalStatus | 'ALL';
    q?: string;
    overdue?: boolean;
  }) => {
    const queryParams: any = {};
    if (params?.status) queryParams.status = params.status;
    if (params?.q) queryParams.q = params.q;
    if (params?.overdue) queryParams.overdue = 'true';

    const response = await api.get<Rental[]>('/admin/rentals', {
      params: queryParams,
    });
    return response.data;
  },

  
  updateRentalStatus: async (id: string, status: RentalStatus) => {
    const response = await api.patch<Rental>(`/admin/rentals/${id}/status`, {
      status,
    });
    return response.data;
  },
  
  getMyRentals: async () => {
    const response = await api.get<Rental[]>('/rentals');
    return response.data;
  },

 
  createRental: async (data: { gameId: string; copyId?: string }) => {
    const response = await api.post<Rental>('/rentals', data);
    return response.data;
  },
};
