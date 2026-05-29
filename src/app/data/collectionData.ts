export interface GameItem {
  id: string;
  name: string;
  manufacturer: string;
  category: 'OURO' | 'ÉPICO' | 'PRATA' | 'BRONZE' | 'LATÃO';
  status: 'Disponível' | 'Alugado' | 'Manutenção';
  quantity: {
    available: number;
    total: number;
  };
}

export const collectionMetrics = {
  totalTitles: {
    value: 1284,
    tag: '+12 este mês',
  },
  available: {
    value: 942,
    tag: '73,3% taxa',
  },
  rented: {
    value: 342,
    tag: 'Ativos agora',
  },
  maintenance: {
    value: 14,
    tag: 'Peças faltantes',
  },
};

export const gamesCatalog: GameItem[] = [
  {
    id: '1',
    name: 'Terraforming Mars',
    manufacturer: 'Galápagos Jogos',
    category: 'OURO',
    status: 'Disponível',
    quantity: { available: 4, total: 5 },
  },
  {
    id: '2',
    name: 'Gloomhaven',
    manufacturer: 'Cephalofair',
    category: 'ÉPICO',
    status: 'Alugado',
    quantity: { available: 1, total: 2 },
  },
  {
    id: '3',
    name: 'Catan: Ed. 25 Anos',
    manufacturer: 'Devir',
    category: 'PRATA',
    status: 'Disponível',
    quantity: { available: 8, total: 8 },
  },
  {
    id: '4',
    name: 'Jenga Gold',
    manufacturer: 'Hasbro',
    category: 'BRONZE',
    status: 'Disponível',
    quantity: { available: 12, total: 15 },
  },
  {
    id: '5',
    name: 'Baralho Royale',
    manufacturer: 'Copag',
    category: 'LATÃO',
    status: 'Disponível',
    quantity: { available: 45, total: 50 },
  },
];
