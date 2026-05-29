// Tipos baseados no Schema Prisma do backend

export type ClientCategory = 'STARTER' | 'FAMILY' | 'EXPERT' | 'ULTRAGAMER';
export type GameTier = 'LATAO' | 'BRONZE' | 'PRATA' | 'OURO' | 'DIAMANTE';
export type RentalStatus = 'PENDING' | 'ACTIVE' | 'RETURNED' | 'CANCELED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  picture?: string | null;
  points: number;
  level: number;
  role: string;
  matricula?: string | null;
  isAcademicVerified: boolean;
  clientCategory: ClientCategory;
  totalRentalsCount: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface Game {
  id: string;
  ludopediaId?: number;
  title: string;
  description?: string;
  price: number;
  available: boolean;
  cover?: string;
  allowOriginalRental: boolean;
  rating: number;
  ratingsCount?: number;
  howToPlayUrl?: string;
  isActive: boolean;
  isVisible: boolean;
  tier: GameTier;
  minPlayers: number;
  maxPlayers?: number;
  minAge: number;
  minTime: number;
  maxTime?: number;
  
  // Campos calculados pela sua API:
  copiesCount: number;
  availableCopiesCount: number;
  isAvailableNow: boolean;
}

export interface GameCopy {
  id: string;
  number: number;
  code?: string | null;
  condition?: string | null;
  available: boolean;
  gameId: string;
}

export interface Rental {
  id: string;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  userId: string;
  gameId?: string | null;
  copyId?: string | null;
  gameTitleSnapshot: string;
  gameCoverSnapshot?: string | null;
  copyCodeSnapshot?: string | null;
  copyNumberSnapshot?: number | null;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  game?: {
    id: string;
    title: string;
    cover?: string | null;
    price: number;
  } | null;
  copy?: {
    id: string;
    code?: string | null;
    number: number;
    condition?: string | null;
  } | null;
}

export interface DashboardMetrics {
  totalGames: number;
  activeRentals: number;
  pendingApprovals: number;
  activeUsers: number;
}

export interface CollectionMetrics {
  totalTitles: number;
  available: number;
  rented: number;
  maintenance: number;
}

export interface RentalMetrics {
  active: number;
  late: number;
  pending: number;
  returnedThisMonth: number;
}

export interface UserMetrics {
  totalMembers: number;
  vipUltragamer: number;
  newRegistrations: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
