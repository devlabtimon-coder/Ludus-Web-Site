export interface RentalDetail {
  id: string;
  user: {
    name: string;
    memberId: string;
    avatar: string;
  };
  game: string;
  checkoutDate: string;
  returnDate: string;
  status: 'ATRASADO' | 'PENDENTE' | 'EM ANDAMENTO' | 'CONCLUÍDO';
}

export const rentalMetrics = {
  active: {
    value: 24,
    trend: '+12% vs mês',
  },
  late: {
    value: 3,
    tag: 'Ação necessária',
  },
  pending: {
    value: 15,
    tag: 'Aguardando',
  },
  returned: {
    value: 142,
    tag: 'Fluxo estável',
  },
};

export const activeRentals: RentalDetail[] = [
  {
    id: '1',
    user: {
      name: 'Ricardo Camargo',
      memberId: 'Sócio #4421',
      avatar: '#E8A598',
    },
    game: 'Terraforming Mars',
    checkoutDate: '12/10/2023',
    returnDate: '19/10/2023',
    status: 'ATRASADO',
  },
  {
    id: '2',
    user: {
      name: 'Marina Lins',
      memberId: 'Sócio #2290',
      avatar: '#A8B8E6',
    },
    game: 'Wingspan',
    checkoutDate: '',
    returnDate: '',
    status: 'PENDENTE',
  },
  {
    id: '3',
    user: {
      name: 'Jorge Silva',
      memberId: 'Sócio #8812',
      avatar: '#C9B8A0',
    },
    game: 'Catan',
    checkoutDate: '21/10/2023',
    returnDate: '28/10/2023',
    status: 'EM ANDAMENTO',
  },
  {
    id: '4',
    user: {
      name: 'Amanda Souza',
      memberId: 'Sócio #3115',
      avatar: '#9BC4B5',
    },
    game: 'Azul',
    checkoutDate: '15/10/2023',
    returnDate: '22/10/2023',
    status: 'CONCLUÍDO',
  },
];
