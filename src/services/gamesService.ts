import { api } from './api';
import { Game } from '../types/api';

export const gamesService = {
  // Listar jogos (com filtros opcionais)
  getGames: async (params?: {
    q?: string;
    status?: 'ALL' | 'AVAILABLE' | 'RENTED';
    players?: number;
    age?: number;
    priceMin?: number;
    priceMax?: number;
    timeMax?: number;
    stars?: number;
  }) => {
    const response = await api.get<Game[]>('/games', { params });
    return response.data;
  },

  // Buscar jogo por ID
  getGameById: async (id: string) => {
    const response = await api.get<Game>(`/games/${id}`);
    return response.data;
  },

  // Criar novo jogo (apenas admin)
  createGame: async (gameData: Partial<Game>) => {
    const response = await api.post<Game>('/games', gameData);
    return response.data;
  },

  // Atualizar jogo (apenas admin)
  updateGame: async (id: string, gameData: Partial<Game>) => {
    const response = await api.put<Game>(`/games/${id}`, gameData);
    return response.data;
  },

  // Deletar jogo (apenas admin)
  deleteGame: async (id: string) => {
    const response = await api.delete(`/games/${id}`);
    return response.data;
  },
};
