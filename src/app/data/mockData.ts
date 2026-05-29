import { Rental, Alert, PendingApproval, GameStats, DashboardMetrics, User, Game } from '../types';

export const metrics: DashboardMetrics = {
  totalGames: 124,
  activeRentals: 32,
  pendingApprovals: 8,
  activeUsers: 450,
};

export const recentRentals: Rental[] = [
  {
    id: '1',
    user: {
      id: 'u1',
      name: 'Maria Silva',
      email: 'maria@email.com',
      avatar: '#FF6B6B',
      status: 'active',
    },
    game: { id: 'g1', name: 'Catan' },
    date: '2026-05-12',
    dueDate: '2026-05-19',
    status: 'Em Andamento',
  },
  {
    id: '2',
    user: {
      id: 'u2',
      name: 'João Santos',
      email: 'joao@email.com',
      avatar: '#4ECDC4',
      status: 'active',
    },
    game: { id: 'g2', name: 'Wingspan' },
    date: '2026-05-10',
    dueDate: '2026-05-12',
    status: 'Atrasado',
  },
  {
    id: '3',
    user: {
      id: 'u3',
      name: 'Ana Costa',
      email: 'ana@email.com',
      avatar: '#95E1D3',
      status: 'active',
    },
    game: { id: 'g3', name: 'Azul' },
    date: '2026-05-11',
    dueDate: '2026-05-18',
    status: 'Em Andamento',
  },
  {
    id: '4',
    user: {
      id: 'u4',
      name: 'Pedro Lima',
      email: 'pedro@email.com',
      avatar: '#FFE66D',
      status: 'active',
    },
    game: { id: 'g4', name: 'Ticket to Ride' },
    date: '2026-05-09',
    dueDate: '2026-05-11',
    status: 'Atrasado',
  },
  {
    id: '5',
    user: {
      id: 'u5',
      name: 'Carla Mendes',
      email: 'carla@email.com',
      avatar: '#A8E6CF',
      status: 'active',
    },
    game: { id: 'g5', name: '7 Wonders' },
    date: '2026-05-13',
    dueDate: '2026-05-20',
    status: 'Em Andamento',
  },
];

export const lateAlerts: Alert[] = [
  {
    id: 'a1',
    game: { id: 'g2', name: 'Wingspan' },
    user: {
      id: 'u2',
      name: 'João Santos',
      email: 'joao@email.com',
      avatar: '#4ECDC4',
      status: 'active',
    },
    daysLate: 2,
  },
  {
    id: 'a2',
    game: { id: 'g4', name: 'Ticket to Ride' },
    user: {
      id: 'u4',
      name: 'Pedro Lima',
      email: 'pedro@email.com',
      avatar: '#FFE66D',
      status: 'active',
    },
    daysLate: 3,
  },
  {
    id: 'a3',
    game: { id: 'g6', name: 'Terraforming Mars' },
    user: {
      id: 'u6',
      name: 'Lucas Rocha',
      email: 'lucas@email.com',
      avatar: '#FF8B94',
      status: 'active',
    },
    daysLate: 1,
  },
];

export const pendingApprovals: PendingApproval[] = [
  {
    id: 'p1',
    user: {
      id: 'u7',
      name: 'Rafael Oliveira',
      email: 'rafael@email.com',
      avatar: '#B4A7D6',
      status: 'pending',
      registrationDate: '2026-05-13',
    },
    requestDate: '2026-05-13',
  },
  {
    id: 'p2',
    user: {
      id: 'u8',
      name: 'Beatriz Alves',
      email: 'beatriz@email.com',
      avatar: '#FFDAC1',
      status: 'pending',
      registrationDate: '2026-05-14',
    },
    requestDate: '2026-05-14',
  },
  {
    id: 'p3',
    user: {
      id: 'u9',
      name: 'Thiago Ferreira',
      email: 'thiago@email.com',
      avatar: '#FFB6B9',
      status: 'pending',
      registrationDate: '2026-05-14',
    },
    requestDate: '2026-05-14',
  },
];

export const topGames: GameStats[] = [
  { name: 'Catan', rentals: 45 },
  { name: 'Ticket to Ride', rentals: 38 },
  { name: 'Wingspan', rentals: 35 },
  { name: 'Azul', rentals: 32 },
  { name: 'Terraforming Mars', rentals: 28 },
  { name: '7 Wonders', rentals: 25 },
];
