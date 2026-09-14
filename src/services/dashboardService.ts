import { gamesService } from './gamesService';
import { rentalsService } from './rentalsService';
import { usersService } from './usersService';

export const dashboardService = {
  getDashboardData: async () => {
    const [games, rentals, users] = await Promise.all([
      gamesService.getGames(),
      rentalsService.getAdminRentals(),
      usersService.getUsers(),
    ]);

    const safeRentals = Array.isArray(rentals) ? rentals : [];
    const safeUsers = Array.isArray(users) ? users : [];
    const safeGames = Array.isArray(games) ? games : [];

    const totalGames = safeGames.length;

   
    const activeRentals = safeRentals.filter(r => r.status === 'ACTIVE').length;

   
    const pendingRegistrations = safeUsers.filter((u: any) => u.registrationStatus === 'PENDING').length;
    const pendingRentals = safeRentals.filter(r => r.status === 'PENDING');
    

    const pendingApprovalsCount = pendingRegistrations > 0 
      ? pendingRegistrations 
      : pendingRentals.length;

    
    const activeUsers = safeUsers.filter((u: any) => 
      !u.isBlocked && u.registrationStatus !== 'REJECTED' && (u.role === 'USER' || !u.role)
    ).length;

   
    const recentRentals = [...safeRentals]
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5);
    const now = new Date();
    const lateRentals = safeRentals.filter(r =>
      (r.status === 'ACTIVE' || r.status === 'PENDING') &&
      new Date(r.endDate) < now
    );


    const gameRentalCount = safeRentals.reduce((acc, rental) => {
      const gameTitle = rental.game?.title || rental.gameTitleSnapshot || 'Jogo não identificado';
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
        pendingApprovals: pendingApprovalsCount,
        activeUsers,
      },
      recentRentals,
      topGames,
      lateAlerts: lateRentals,
      pendingApprovals: pendingRentals,
    };
  },
};