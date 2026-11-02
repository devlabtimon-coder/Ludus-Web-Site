import { api } from './api';
import { Rental, RentalStatus, PaginatedResponse } from '../types/api';
import { MAX_PAGE_LIMIT, toPaginated } from './pagination';

export interface AdminRentalsQuery {
  status?: RentalStatus | 'ALL';
  q?: string;
  overdue?: boolean;
  page?: number;
  limit?: number;
}

function buildParams(params?: AdminRentalsQuery) {
  const queryParams: Record<string, string | number> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.q?.trim()) queryParams.q = params.q.trim();
  if (params?.overdue) queryParams.overdue = 'true';
  queryParams.page = params?.page ?? 1;
  queryParams.limit = Math.min(params?.limit ?? 50, MAX_PAGE_LIMIT);
  return queryParams;
}

export const rentalsService = {
  // Página filtrada no servidor (status, busca, atraso). A API ordena do mais recente para o mais antigo.
  getAdminRentalsPage: async (params?: AdminRentalsQuery): Promise<PaginatedResponse<Rental>> => {
    const queryParams = buildParams(params);
    const response = await api.get<any>('/admin/rentals', { params: queryParams });
    return toPaginated<Rental>(response.data, Number(queryParams.page), Number(queryParams.limit));
  },

  getAdminRentals: async (params?: AdminRentalsQuery): Promise<Rental[]> => {
    const page = await rentalsService.getAdminRentalsPage(params);
    return page.data;
  },

  // Só o total que bate com o filtro (pede 1 item e usa o `total` da resposta).
  countAdminRentals: async (params?: Omit<AdminRentalsQuery, 'page' | 'limit'>): Promise<number> => {
    const page = await rentalsService.getAdminRentalsPage({ ...params, page: 1, limit: 1 });
    return page.total;
  },

  // Devoluções cuja retirada foi neste mês. Como a lista vem por data de início decrescente,
  // basta paginar até achar um empréstimo anterior ao início do mês.
  countReturnedSince: async (since: Date, maxPages = 10): Promise<number> => {
    let count = 0;
    for (let page = 1; page <= maxPages; page++) {
      const result = await rentalsService.getAdminRentalsPage({ status: 'RETURNED', page, limit: MAX_PAGE_LIMIT });
      for (const rental of result.data) {
        if (new Date(rental.startDate) < since) return count;
        count++;
      }
      if (page >= result.totalPages || result.data.length === 0) break;
    }
    return count;
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
