import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '../services';
import { getErrorMessage } from '../services/api';

interface DashboardMetrics {
  totalGames: number;
  activeRentals: number;
  pendingApprovals: number;
  activeUsers: number;
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

  const loadDashboardData = useCallback(async () => {
    try {
      if (loadedOnce.current) setRefreshing(true);
      setError(null);

      const data = await dashboardService.getDashboardData();

      setMetrics(data.metrics);
      setRecentRentals(data.recentRentals);
      setTopGames(data.topGames);
      setLateAlerts(data.lateAlerts);
      setPendingApprovals(data.pendingApprovals);
      setPendingRentalsTotal(data.pendingRentalsTotal);
      loadedOnce.current = true;
      setHasLoaded(true);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Erro ao carregar dados do dashboard'));
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
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
