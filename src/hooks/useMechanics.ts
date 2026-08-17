import { useState, useEffect, useCallback } from 'react';
import { mechanicService } from '../services/mechanicService';
import { Mechanic } from '../types/api';

export function useMechanics() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMechanics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mechanicService.getAllAdmin();
      setMechanics(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar mecânicas');
      console.error('Erro ao carregar mecânicas:', err);
    } finally {
      setLoading(false);
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
    error,
    createMechanic,
    updateMechanic,
    deleteMechanic,
    refetch: loadMechanics,
  };
}