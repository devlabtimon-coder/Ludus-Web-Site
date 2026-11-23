import type { AdminArea, User } from '../types/api';

export type { AdminArea };

export const ADMIN_AREAS: { id: AdminArea; label: string; pages: string }[] = [
  { id: 'CATALOG', label: 'Acervo', pages: 'Acervo, Mecânicas e Manutenção' },
  { id: 'RENTALS', label: 'Empréstimos', pages: 'Empréstimos' },
  { id: 'USERS', label: 'Usuários', pages: 'Usuários e Cadastro pendente' },
  { id: 'SEASONS', label: 'Temporadas', pages: 'Temporadas, Ranking e Brindes' },
  { id: 'REPORTS', label: 'Relatórios', pages: 'Relatórios e Auditoria' },
  { id: 'ABOUT', label: 'Sobre o App', pages: 'Sobre o App' },
];

// Página (rota sem a barra) → área. O Dashboard aparece para todo admin.
export const PAGE_AREA: Record<string, AdminArea | null> = {
  dashboard: null,
  acervo: 'CATALOG',
  mecanicas: 'CATALOG',
  manutencao: 'CATALOG',
  emprestimos: 'RENTALS',
  usuarios: 'USERS',
  cadastro: 'USERS',
  ranking: 'SEASONS',
  temporadas: 'SEASONS',
  brindes: 'SEASONS',
  relatorios: 'REPORTS',
  auditoria: 'REPORTS',
  'sobre-app': 'ABOUT',
};

type AdminFields = Pick<User, 'role' | 'isSuperAdmin' | 'adminAreas'>;

export function canAccessArea(user: AdminFields | null | undefined, area: AdminArea | null) {
  if (user?.role !== 'ADMIN') return false;
  if (area === null || user.isSuperAdmin) return true;
  // Sessão salva antes das permissões por área: libera até o SessionSync
  // atualizar o usuário (a API confere a área de qualquer forma).
  if (user.isSuperAdmin === undefined) return true;
  return (user.adminAreas ?? []).includes(area);
}

export function adminAccessLabel(user: AdminFields) {
  if (user.isSuperAdmin) return 'Administrador geral';
  const labels = ADMIN_AREAS.filter((a) => user.adminAreas?.includes(a.id)).map((a) => a.label);
  return labels.length ? `Admin: ${labels.join(', ')}` : 'Admin sem áreas';
}
