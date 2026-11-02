import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { gamesService } from '../services';
import { getErrorMessage } from '../services/api';
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
  // `loading` é só a primeira carga; ao recarregar (`refreshing`) a lista antiga continua na tela,
  // para não desmontar a página e os modais abertos (ex.: busca do "Adicionar jogo").
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedOnce = useRef(false);

  // Usamos useCallback para que a função não seja recriada a cada renderização
  const loadGames = useCallback(async () => {
    const isRefresh = loadedOnce.current;
    try {
      if (isRefresh) setRefreshing(true);
      else { setError(null); setLoading(true); }

      const gamesData = await gamesService.getGames(filters);
      setGames(gamesData);
      loadedOnce.current = true;
      setError(null);
    } catch (err: any) {
      console.error('Erro ao carregar jogos:', err);
      if (isRefresh) toast.error(getErrorMessage(err, 'Erro ao atualizar a lista de jogos.'));
      else setError(getErrorMessage(err, 'Erro ao carregar jogos'));
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    refreshing,
    error,
    createGame,
    updateGame,
    deleteGame,
    refetch: loadGames, // Usado na CollectionPage após excluir/editar
  };
}