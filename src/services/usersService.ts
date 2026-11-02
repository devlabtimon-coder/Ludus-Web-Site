import { api } from './api';
import { User, PaginatedResponse, RegistrationStatus } from '../types/api';
import { MAX_PAGE_LIMIT, toPaginated } from './pagination';

export interface AdminUsersQuery {
  q?: string;
  registrationStatus?: RegistrationStatus;
  blocked?: boolean;
  page?: number;
  limit?: number;
}

function buildParams(params?: AdminUsersQuery) {
  const queryParams: Record<string, string | number> = {};
  if (params?.q?.trim()) queryParams.q = params.q.trim();
  if (params?.registrationStatus) queryParams.registrationStatus = params.registrationStatus;
  if (params?.blocked !== undefined) queryParams.blocked = params.blocked ? 'true' : 'false';
  queryParams.page = params?.page ?? 1;
  queryParams.limit = Math.min(params?.limit ?? 50, MAX_PAGE_LIMIT);
  return queryParams;
}

export const usersService = {
  // Página filtrada no servidor. Sem filtro de cadastro a API ordena do mais novo para o mais antigo;
  // com registrationStatus=PENDING, do mais antigo (fila de análise).
  getUsersPage: async (params?: AdminUsersQuery): Promise<PaginatedResponse<User>> => {
    const queryParams = buildParams(params);
    const response = await api.get<any>('/admin/users', { params: queryParams });
    return toPaginated<User>(response.data, Number(queryParams.page), Number(queryParams.limit));
  },

  getUsers: async (params?: AdminUsersQuery): Promise<User[]> => {
    const page = await usersService.getUsersPage(params);
    return page.data;
  },

  // Só o total que bate com o filtro (pede 1 item e usa o `total` da resposta).
  countUsers: async (params?: Omit<AdminUsersQuery, 'page' | 'limit'>): Promise<number> => {
    const page = await usersService.getUsersPage({ ...params, page: 1, limit: 1 });
    return page.total;
  },

  // Percorre todas as páginas (de 100 em 100). Usado só onde a API não tem filtro próprio
  // (ex.: contagem por categoria), com teto de páginas para não pesar.
  getAllUsers: async (maxPages = 50): Promise<{ users: User[]; total: number; complete: boolean }> => {
    const users: User[] = [];
    let total = 0;
    for (let page = 1; page <= maxPages; page++) {
      const result = await usersService.getUsersPage({ page, limit: MAX_PAGE_LIMIT });
      users.push(...result.data);
      total = result.total;
      if (page >= result.totalPages || result.data.length === 0) {
        return { users, total, complete: true };
      }
    }
    return { users, total, complete: false };
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
