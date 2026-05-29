import { api } from './api';
import { Rental, RentalStatus } from '../types/api';

export const rentalsService = {
  // Listar aluguéis (admin) com filtros
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

  // Atualizar status do aluguel (admin)
  updateRentalStatus: async (id: string, status: RentalStatus) => {
    const response = await api.patch<Rental>(`/admin/rentals/${id}/status`, {
      status,
    });
    return response.data;
  },

  // Listar meus aluguéis (usuário)
  getMyRentals: async () => {
    const response = await api.get<Rental[]>('/rentals');
    return response.data;
  },

  // Criar novo aluguel (usuário)
  createRental: async (data: { gameId: string; copyId?: string }) => {
    const response = await api.post<Rental>('/rentals', data);
    return response.data;
  },
};
