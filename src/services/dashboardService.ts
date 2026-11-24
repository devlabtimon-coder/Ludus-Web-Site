import { api } from './api';
import { gamesService } from './gamesService';
import { rentalsService } from './rentalsService';
import { usersService } from './usersService';
import type { AdminArea } from '../types/api';

// Os números do painel vêm do `total` de consultas filtradas na API (limit=1),
// e não de contar uma página de 50 itens.
async function getTopGames(): Promise<Array<{ name: string; rentals: number }>> {
  try {
    const res = await api.get('/admin/reports', { params: { period: 'month' } });
    const top = Array.isArray(res.data?.topGames) ? res.data.topGames : [];
    return top.map((g: any) => ({ name: g.name || 'Jogo não identificado', rentals: Number(g.count) || 0 }));
  } catch (err) {
    // Gráfico secundário: se o relatório falhar, o resto do painel continua.
    console.error('Erro ao carregar jogos mais alugados:', err);
    return [];
  }
}

type CanAccess = (area: AdminArea) => boolean;

const EMPTY_PAGE = { data: [] as any[], total: 0 };

// Cada bloco só é buscado com a área liberada (a API recusaria o resto):
// Acervo → jogos; Empréstimos → aluguéis; Usuários → cadastros e usuários;
// Relatórios → mais alugados. Sem a área, o valor vem null e o bloco some.
export const dashboardService = {
  getDashboardData: async (can: CanAccess) => {
    const when = <T,>(area: AdminArea, load: () => Promise<T>): Promise<T | null> =>
      can(area) ? load() : Promise.resolve(null);

    const [
      games,
      activeRentals,
      pendingRegistrations,
      notBlockedUsers,
      rejectedNotBlockedUsers,
      recentPage,
      latePage,
      pendingRentalsPage,
      topGames,
    ] = await Promise.all([
      when('CATALOG', () => gamesService.getGames()),
      when('RENTALS', () => rentalsService.countAdminRentals({ status: 'ACTIVE' })),
      when('USERS', () => usersService.countUsers({ registrationStatus: 'PENDING' })),
      when('USERS', () => usersService.countUsers({ blocked: false })),
      when('USERS', () => usersService.countUsers({ blocked: false, registrationStatus: 'REJECTED' })),
      when('RENTALS', () => rentalsService.getAdminRentalsPage({ status: 'ALL', page: 1, limit: 5 })),
      when('RENTALS', () => rentalsService.getAdminRentalsPage({ overdue: true, page: 1, limit: 20 })),
      when('RENTALS', () => rentalsService.getAdminRentalsPage({ status: 'PENDING', page: 1, limit: 20 })),
      when('REPORTS', getTopGames),
    ]);

    const late = latePage ?? EMPTY_PAGE;
    const pendingRentals = pendingRentalsPage ?? EMPTY_PAGE;

    return {
      metrics: {
        totalGames: games === null ? null : Array.isArray(games) ? games.length : 0,
        activeRentals,
        // O cartão leva à fila de cadastros, então conta cadastros aguardando análise.
        pendingApprovals: pendingRegistrations,
        // Não bloqueados e sem cadastro rejeitado.
        activeUsers:
          notBlockedUsers === null || rejectedNotBlockedUsers === null
            ? null
            : Math.max(0, notBlockedUsers - rejectedNotBlockedUsers),
      },
      // A API já entrega do mais recente para o mais antigo.
      recentRentals: recentPage?.data ?? [],
      topGames: topGames ?? [],
      lateAlerts: late.data,
      lateAlertsTotal: late.total,
      pendingApprovals: pendingRentals.data,
      pendingRentalsTotal: pendingRentals.total,
    };
  },
};
