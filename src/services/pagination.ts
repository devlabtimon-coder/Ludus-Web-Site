import { PaginatedResponse } from '../types/api';

// Limite máximo aceito pela API nas listagens administrativas.
export const MAX_PAGE_LIMIT = 100;

// Aceita tanto a resposta paginada ({ data, total, page, totalPages }) quanto um array puro (versões antigas da API).
export function toPaginated<T>(body: any, page: number, limit: number): PaginatedResponse<T> {
  if (Array.isArray(body)) {
    return { data: body, total: body.length, page: 1, limit: body.length, totalPages: 1 };
  }
  const data: T[] = Array.isArray(body?.data) ? body.data : [];
  const total = typeof body?.total === 'number' ? body.total : data.length;
  const resolvedLimit = typeof body?.limit === 'number' ? body.limit : limit;
  return {
    data,
    total,
    page: typeof body?.page === 'number' ? body.page : page,
    limit: resolvedLimit,
    totalPages: typeof body?.totalPages === 'number' ? body.totalPages : Math.max(1, Math.ceil(total / Math.max(1, resolvedLimit))),
  };
}
