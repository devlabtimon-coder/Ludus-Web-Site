import { useState, useEffect } from 'react';
import { usersService } from '../services';
import { User, ClientCategory } from '../types/api';

interface UserMetrics {
  totalMembers: number;
  vipUltragamer: number;
  newRegistrations: number;
}

export function useUsers() {
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const usersData = await usersService.getUsers();
      setUsers(usersData);

      // Calcular métricas
      const totalMembers = usersData.length;
      const vipUltragamer = usersData.filter(u =>
        u.clientCategory === 'ULTRAGAMER'
      ).length;

      // Novos cadastros (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const newRegistrations = usersData.filter(u =>
        new Date(u.createdAt) >= sevenDaysAgo
      ).length;

      setMetrics({
        totalMembers,
        vipUltragamer,
        newRegistrations,
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    users,
    total: users.length,
    loading,
    error,
    refetch: loadUsers,
  };
}
