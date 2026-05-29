import { useState, useEffect, useCallback, useMemo } from 'react';
import { gamesService } from '../services';
import { Game } from '../types/api';

interface CollectionMetrics {
  totalTitles: number;
  available: number;
  rented: number;
  maintenance: number;
}

export function useGames(filters?: {
  q?: string;
  status?: 'ALL' | 'AVAILABLE' | 'RENTED';
}) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usamos useCallback para que a função não seja recriada a cada renderização
  const loadGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const gamesData = await gamesService.getGames(filters);
      setGames(gamesData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar jogos');
      console.error('Erro ao carregar jogos:', err);
    } finally {
      setLoading(false);
    }
    // Stringify garante que objetos com mesmos valores não acionem re-renders
  }, [JSON.stringify(filters || {})]); 

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  // useMemo calcula as métricas automaticamente de forma performática
  // baseando-se nas flags calculadas lá na sua game.routes.ts
  const metrics = useMemo<CollectionMetrics>(() => {
    return {
      totalTitles: games.length,
      
      // Disponível: Ativo E com cópias livres agora
      available: games.filter(g => g.isActive && g.isAvailableNow).length,
      
      // Alugado: Ativo, NÃO tem cópias livres agora, e NÃO está inativado manualmente (available=true)
      rented: games.filter(g => g.isActive && !g.isAvailableNow && g.available !== false).length,
      
      // Manutenção/Inativo: Inativado pelo sistema (isActive=false) OU inativado manualmente (available=false) sem cópias
      maintenance: games.filter(g => !g.isActive || (g.isActive && g.available === false && !g.isAvailableNow)).length,
    };
  }, [games]);

  const createGame = async (gameData: Partial<Game>) => {
    try {
      await gamesService.createGame(gameData);
      await loadGames();
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao criar jogo');
    }
  };

  const updateGame = async (id: string, gameData: Partial<Game>) => {
    try {
      await gamesService.updateGame(id, gameData);
      await loadGames();
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao atualizar jogo');
    }
  };

  const deleteGame = async (id: string) => {
    try {
      await gamesService.deleteGame(id);
      await loadGames();
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao deletar jogo');
    }
  };

  return {
    metrics,
    games,
    total: games.length,
    loading,
    error,
    createGame,
    updateGame,
    deleteGame,
    refetch: loadGames, // Usado na CollectionPage após excluir/editar
  };
}