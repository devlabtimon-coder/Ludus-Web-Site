import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../services/api';
import { mechanicService } from '../services/mechanicService';
import { Mechanic } from '../types/api';

export function useMechanics() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  // `loading` é só a primeira carga; ao recarregar (`refreshing`) a lista antiga continua na tela.
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedOnce = useRef(false);

  const loadMechanics = useCallback(async () => {
    const isRefresh = loadedOnce.current;
    try {
      if (isRefresh) setRefreshing(true);
      else { setError(null); setLoading(true); }
      const data = await mechanicService.getAllAdmin();
      setMechanics(data);
      loadedOnce.current = true;
      setError(null);
    } catch (err: any) {
      console.error('Erro ao carregar mecânicas:', err);
      if (isRefresh) toast.error(getErrorMessage(err, 'Erro ao atualizar a lista de mecânicas.'));
      else setError(getErrorMessage(err, 'Erro ao carregar mecânicas'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMechanics();
  }, [loadMechanics]);

  const createMechanic = async (data: Partial<Mechanic>) => {
    try {
      await mechanicService.create(data);
      await loadMechanics();
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || 'Erro ao criar mecânica');
    }
  };

  const updateMechanic = async (id: string, data: Partial<Mechanic>) => {
    try {
      await mechanicService.update(id, data);
      await loadMechanics();
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || 'Erro ao atualizar mecânica');
    }
  };

  const deleteMechanic = async (id: string) => {
    try {
      await mechanicService.delete(id);
      await loadMechanics();
    } catch (err: any) {
      throw new Error(err?.response?.data?.error || 'Erro ao excluir mecânica');
    }
  };

  return {
    mechanics,
    total: mechanics.length,
    loading,
    refreshing,
    error,
    createMechanic,
    updateMechanic,
    deleteMechanic,
    refetch: loadMechanics,
  };
}