import { useState, useEffect, useCallback, useRef } from 'react';
import { usersService } from '../services';
import { getErrorMessage } from '../services/api';
import type { AdminUsersQuery } from '../services/usersService';
import { User } from '../types/api';

interface UserMetrics {
  totalMembers: number;
  vipUltragamer: number;
  newRegistrations: number;
  // false se a varredura parou no teto de páginas (contagem de VIPs pode estar abaixo do real).
  complete: boolean;
}

const RECENT_DAYS = 7;

// Lista paginada e filtrada no servidor. `initialLoading` só vale para a primeira carga;
// nas seguintes (`refreshing`) os dados antigos continuam na tela até chegar a resposta.
export function useUsers(query: AdminUsersQuery = {}) {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [ultragamerUsers, setUltragamerUsers] = useState<User[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);
  const loadedOnce = useRef(false);
  const queryKey = JSON.stringify(query);

  const loadUsers = useCallback(async () => {
    const id = ++requestId.current;
    if (loadedOnce.current) setRefreshing(true);
    try {
      const result = await usersService.getUsersPage(JSON.parse(queryKey));
      // Resposta de uma busca antiga (texto digitado depois) é descartada.
      if (id !== requestId.current) return;
      setUsers(result.data);
      setTotal(result.total);
      setTotalPages(Math.max(1, result.totalPages));
      setError(null);
      loadedOnce.current = true;
      setHasLoaded(true);
    } catch (err: any) {
      if (id !== requestId.current) return;
      setError(getErrorMessage(err, 'Erro ao carregar usuários'));
      console.error('Erro ao carregar usuários:', err);
    } finally {
      if (id === requestId.current) {
        setInitialLoading(false);
        setRefreshing(false);
      }
    }
  }, [queryKey]);

  // A API não filtra por categoria nem por data de cadastro: os cartões varrem todas as páginas
  // (de 100 em 100) em vez de olhar só a página exibida.
  const loadMetrics = useCallback(async () => {
    try {
      const { users: allUsers, total: totalMembers, complete } = await usersService.getAllUsers();
      const since = new Date();
      since.setDate(since.getDate() - RECENT_DAYS);

      const ultragamers = allUsers.filter((u) => u.clientCategory === 'ULTRAGAMER');
      const recents = allUsers.filter((u) => u.createdAt && new Date(u.createdAt) >= since);

      setUltragamerUsers(ultragamers);
      setRecentUsers(recents);
      setMetrics({
        totalMembers,
        vipUltragamer: ultragamers.length,
        newRegistrations: recents.length,
        complete,
      });
    } catch (err) {
      console.error('Erro ao carregar métricas de usuários:', err);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const refetch = useCallback(async () => {
    await Promise.all([loadUsers(), loadMetrics()]);
  }, [loadUsers, loadMetrics]);

  return {
    metrics,
    users,
    ultragamerUsers,
    recentUsers,
    total,
    totalPages,
    initialLoading,
    refreshing,
    hasLoaded,
    // Compatibilidade: `loading` é só a primeira carga.
    loading: initialLoading,
    error,
    refetch,
  };
}
