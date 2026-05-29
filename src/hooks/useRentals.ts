import { useState, useEffect } from 'react';
import { rentalsService } from '../services';
import { Rental, RentalStatus } from '../types/api';

interface RentalMetrics {
  active: number;
  late: number;
  pending: number;
  returnedThisMonth: number;
}

export function useRentals(filters?: {
  status?: RentalStatus | 'ALL';
  q?: string;
  overdue?: boolean;
}) {
  const [metrics, setMetrics] = useState<RentalMetrics | null>(null);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRentals();
  }, [filters]);

  const loadRentals = async () => {
    try {
      setLoading(true);
      setError(null);

      const rentalsData = await rentalsService.getAdminRentals(filters);
      setRentals(rentalsData);

      // Calcular métricas
      const now = new Date();
      const active = rentalsData.filter(r => r.status === 'ACTIVE').length;
      const late = rentalsData.filter(r =>
        (r.status === 'PENDING' || r.status === 'ACTIVE') &&
        new Date(r.endDate) < now
      ).length;
      const pending = rentalsData.filter(r => r.status === 'PENDING').length;

      // Devolvidos no mês atual
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const returnedThisMonth = rentalsData.filter(r =>
        r.status === 'RETURNED' &&
        new Date(r.startDate) >= startOfMonth
      ).length;

      setMetrics({
        active,
        late,
        pending,
        returnedThisMonth,
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar empréstimos');
      console.error('Erro ao carregar empréstimos:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: RentalStatus) => {
    try {
      await rentalsService.updateRentalStatus(id, status);
      await loadRentals();
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao atualizar status');
    }
  };

  return {
    metrics,
    rentals,
    total: rentals.length,
    loading,
    error,
    updateStatus,
    refetch: loadRentals,
  };
}
