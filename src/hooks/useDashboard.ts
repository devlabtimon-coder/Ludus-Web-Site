import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '../services';
import { getErrorMessage } from '../services/api';
import { authService } from '../services/authService';
import { canAccessArea } from '../config/adminAreas';

// null: a área do número não está liberada para este admin.
interface DashboardMetrics {
  totalGames: number | null;
  activeRentals: number | null;
  pendingApprovals: number | null;
  activeUsers: number | null;
}

// `initialLoading` só vale para a primeira carga; nas seguintes (`refreshing`)
// o painel continua na tela com os dados antigos até chegar a resposta.
export function useDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentRentals, setRecentRentals] = useState<any[]>([]);
  const [topGames, setTopGames] = useState<Array<{ name: string; rentals: number }>>([]);
  const [lateAlerts, setLateAlerts] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [pendingRentalsTotal, setPendingRentalsTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadedOnce = useRef(false);
  // Só a carga mais recente vale: uma feita com permissões antigas pode terminar depois.
  const latestLoad = useRef(0);

  const loadDashboardData = useCallback(async () => {
    const loadId = ++latestLoad.current;
    const isStale = () => loadId !== latestLoad.current;
    try {
      if (loadedOnce.current) setRefreshing(true);
      setError(null);

      const user = authService.getStoredUser();
      const data = await dashboardService.getDashboardData((area) => canAccessArea(user, area));
      if (isStale()) return;

      setMetrics(data.metrics);
      setRecentRentals(data.recentRentals);
      setTopGames(data.topGames);
      setLateAlerts(data.lateAlerts);
      setPendingApprovals(data.pendingApprovals);
      setPendingRentalsTotal(data.pendingRentalsTotal);
      loadedOnce.current = true;
      setHasLoaded(true);
    } catch (err: any) {
      if (isStale()) return;
      setError(getErrorMessage(err, 'Erro ao carregar dados do dashboard'));
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      if (!isStale()) {
        setInitialLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Recarrega só se as áreas mudaram (o usuário salvo é atualizado ao abrir o painel).
  useEffect(() => {
    const permissionsKey = () => {
      const user = authService.getStoredUser();
      return JSON.stringify([user?.isSuperAdmin, user?.adminAreas]);
    };
    let last = permissionsKey();
    return authService.onUserUpdated(() => {
      const next = permissionsKey();
      if (next === last) return;
      last = next;
      loadDashboardData();
    });
  }, [loadDashboardData]);

  return {
    metrics,
    recentRentals,
    topGames,
    lateAlerts,
    pendingApprovals,
    pendingRentalsTotal,
    initialLoading,
    refreshing,
    hasLoaded,
    // Compatibilidade: `loading` é só a primeira carga.
    loading: initialLoading,
    error,
    refetch: loadDashboardData,
  };
}
