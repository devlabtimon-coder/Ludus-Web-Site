import { useState, useEffect, useCallback, useRef } from 'react';
import { rentalsService } from '../services';
import { getErrorMessage } from '../services/api';
import type { AdminRentalsQuery } from '../services/rentalsService';
import { Rental, RentalStatus } from '../types/api';

interface RentalMetrics {
  active: number;
  late: number;
  pending: number;
  returnedThisMonth: number;
}

// Lista paginada e filtrada no servidor. `initialLoading` só vale para a primeira carga;
// nas seguintes (`refreshing`) os dados antigos continuam na tela até chegar a resposta.
export function useRentals(query: AdminRentalsQuery = {}) {
  const [metrics, setMetrics] = useState<RentalMetrics | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);
  const loadedOnce = useRef(false);
  const queryKey = JSON.stringify(query);

  const loadRentals = useCallback(async () => {
    const id = ++requestId.current;
    if (loadedOnce.current) setRefreshing(true);
    try {
      const result = await rentalsService.getAdminRentalsPage(JSON.parse(queryKey));
      // Resposta de um filtro antigo (busca digitada depois) é descartada.
      if (id !== requestId.current) return;
      setRentals(result.data);
      setTotal(result.total);
      setTotalPages(Math.max(1, result.totalPages));
      setError(null);
      loadedOnce.current = true;
      setHasLoaded(true);
    } catch (err: any) {
      if (id !== requestId.current) return;
      setError(getErrorMessage(err, 'Erro ao carregar empréstimos'));
      console.error('Erro ao carregar empréstimos:', err);
    } finally {
      if (id === requestId.current) {
        setInitialLoading(false);
        setRefreshing(false);
      }
    }
  }, [queryKey]);

  // Contagens dos cartões vêm do `total` de consultas filtradas, não da página exibida.
  const loadMetrics = useCallback(async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const [active, late, pending, returnedThisMonth] = await Promise.all([
        rentalsService.countAdminRentals({ status: 'ACTIVE' }),
        rentalsService.countAdminRentals({ overdue: true }),
        rentalsService.countAdminRentals({ status: 'PENDING' }),
        rentalsService.countReturnedSince(startOfMonth),
      ]);
      setMetrics({ active, late, pending, returnedThisMonth });
    } catch (err) {
      console.error('Erro ao carregar métricas de empréstimos:', err);
    }
  }, []);

  useEffect(() => {
    loadRentals();
  }, [loadRentals]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const refetch = useCallback(async () => {
    await Promise.all([loadRentals(), loadMetrics()]);
  }, [loadRentals, loadMetrics]);

  const updateStatus = async (id: string, status: RentalStatus) => {
    await rentalsService.updateRentalStatus(id, status);
    await refetch();
  };

  return {
    metrics,
    rentals,
    total,
    totalPages,
    initialLoading,
    refreshing,
    hasLoaded,
    // Compatibilidade: `loading` é só a primeira carga.
    loading: initialLoading,
    error,
    updateStatus,
    refetch,
  };
}
