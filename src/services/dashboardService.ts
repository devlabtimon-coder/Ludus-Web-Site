import { api } from './api';
import { Rental, Game, User } from '../types/api';
import { gamesService } from './gamesService';
import { rentalsService } from './rentalsService';
import { usersService } from './usersService';

export const dashboardService = {
  // Buscar dados completos do dashboard
  getDashboardData: async () => {
    // Buscar dados em paralelo
    const [games, rentals, users] = await Promise.all([
      gamesService.getGames(),
      rentalsService.getAdminRentals(),
      usersService.getUsers(),
    ]);

    // Calcular métricas
    const totalGames = games.length;
    const activeRentals = rentals.filter(r =>
      r.status === 'PENDING' || r.status === 'ACTIVE'
    ).length;
    const pendingApprovals = rentals.filter(r => r.status === 'PENDING').length;
    const activeUsers = users.filter(u =>
      u.emailVerified && u.phoneVerified
    ).length;

    // Aluguéis recentes (últimos 5)
    const recentRentals = rentals
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5);

    // Alertas de atraso
    const now = new Date();
    const lateRentals = rentals.filter(r =>
      (r.status === 'PENDING' || r.status === 'ACTIVE') &&
      new Date(r.endDate) < now
    );

    // Jogos mais alugados (top 6)
    const gameRentalCount = rentals.reduce((acc, rental) => {
      const gameTitle = rental.game?.title || rental.gameTitleSnapshot;
      acc[gameTitle] = (acc[gameTitle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topGames = Object.entries(gameRentalCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, rentals]) => ({ name, rentals }));

    return {
      metrics: {
        totalGames,
        activeRentals,
        pendingApprovals,
        activeUsers,
      },
      recentRentals,
      topGames,
      lateAlerts: lateRentals,
      pendingApprovals: rentals.filter(r => r.status === 'PENDING'),
    };
  },
};
