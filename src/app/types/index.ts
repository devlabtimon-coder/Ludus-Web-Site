export interface Game {
  id: string;
  name: string;
  category?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'active' | 'inactive' | 'pending';
  registrationDate?: string;
}

export interface Rental {
  id: string;
  user: User;
  game: Game;
  date: string;
  dueDate: string;
  status: 'Em Andamento' | 'Atrasado' | 'Concluído';
}

export interface Alert {
  id: string;
  game: Game;
  user: User;
  daysLate: number;
}

export interface PendingApproval {
  id: string;
  user: User;
  requestDate: string;
}

export interface GameStats {
  name: string;
  rentals: number;
}

export interface DashboardMetrics {
  totalGames: number;
  activeRentals: number;
  pendingApprovals: number;
  activeUsers: number;
}
