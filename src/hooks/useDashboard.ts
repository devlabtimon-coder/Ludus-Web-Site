import { useState, useEffect } from 'react';
import { dashboardService } from '../services';

interface DashboardMetrics {
  totalGames: number;
  activeRentals: number;
  pendingApprovals: number;
  activeUsers: number;
}

export function useDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentRentals, setRecentRentals] = useState<any[]>([]);
  const [topGames, setTopGames] = useState<Array<{ name: string; rentals: number }>>([]);
  const [lateAlerts, setLateAlerts] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await dashboardService.getDashboardData();

      setMetrics(data.metrics);
      setRecentRentals(data.recentRentals);
      setTopGames(data.topGames);
      setLateAlerts(data.lateAlerts);
      setPendingApprovals(data.pendingApprovals);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do dashboard');
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    recentRentals,
    topGames,
    lateAlerts,
    pendingApprovals,
    loading,
    error,
    refetch: loadDashboardData,
  };
}
