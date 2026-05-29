export interface UserMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  category: 'Ultragamer' | 'Family' | 'Expert' | 'Starter';
  status: 'Ativo' | 'Bloqueado';
  lastActivity: string;
}

export const usersMetrics = {
  totalMembers: {
    value: 1284,
    trend: '+12%',
  },
  vipUltragamer: {
    value: 42,
  },
  newRegistrations: {
    value: 42,
    period: 'Últimos 7 dias',
  },
};

export const usersList: UserMember[] = [
  {
    id: '1',
    name: 'Alexandre Silva',
    email: 'ale.silva@email.com',
    avatar: '#A8B8E6',
    category: 'Ultragamer',
    status: 'Ativo',
    lastActivity: 'Há 2 horas',
  },
  {
    id: '2',
    name: 'Beatriz Santos',
    email: 'bea_santos@gmail.com',
    avatar: '#D4AF87',
    category: 'Family',
    status: 'Ativo',
    lastActivity: 'Ontem',
  },
  {
    id: '3',
    name: 'Ricardo Gomes',
    email: 'rgomes@outlook.com',
    avatar: '#C9B8E6',
    category: 'Expert',
    status: 'Bloqueado',
    lastActivity: 'Há 1 mês',
  },
  {
    id: '4',
    name: 'Carolina Lima',
    email: 'carol.lima@design.com',
    avatar: '#B8B8B8',
    category: 'Starter',
    status: 'Ativo',
    lastActivity: 'Há 15 min',
  },
];
