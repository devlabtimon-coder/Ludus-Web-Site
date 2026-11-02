import { api } from './api';
import { gamesService } from './gamesService';
import { rentalsService } from './rentalsService';
import { usersService } from './usersService';

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

export const dashboardService = {
  getDashboardData: async () => {
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
      gamesService.getGames(),
      rentalsService.countAdminRentals({ status: 'ACTIVE' }),
      usersService.countUsers({ registrationStatus: 'PENDING' }),
      usersService.countUsers({ blocked: false }),
      usersService.countUsers({ blocked: false, registrationStatus: 'REJECTED' }),
      rentalsService.getAdminRentalsPage({ status: 'ALL', page: 1, limit: 5 }),
      rentalsService.getAdminRentalsPage({ overdue: true, page: 1, limit: 20 }),
      rentalsService.getAdminRentalsPage({ status: 'PENDING', page: 1, limit: 20 }),
      getTopGames(),
    ]);

    const safeGames = Array.isArray(games) ? games : [];

    return {
      metrics: {
        totalGames: safeGames.length,
        activeRentals,
        // O cartão leva à fila de cadastros, então conta cadastros aguardando análise.
        pendingApprovals: pendingRegistrations,
        // Não bloqueados e sem cadastro rejeitado.
        activeUsers: Math.max(0, notBlockedUsers - rejectedNotBlockedUsers),
      },
      // A API já entrega do mais recente para o mais antigo.
      recentRentals: recentPage.data,
      topGames,
      lateAlerts: latePage.data,
      lateAlertsTotal: latePage.total,
      pendingApprovals: pendingRentalsPage.data,
      pendingRentalsTotal: pendingRentalsPage.total,
    };
  },
};
