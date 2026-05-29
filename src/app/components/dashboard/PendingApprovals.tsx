import { useState, useEffect } from 'react';
import { Clock, Check, X, Loader2 } from 'lucide-react';
import { Avatar } from '../shared/Avatar';
import { api } from '../../../services/api';
import { toast } from 'sonner';

interface PendingRental {
  id: string;
  startDate: string;
  status: string;
  gameTitleSnapshot: string;
  user?: {
    name: string;
    email: string;
    avatar?: string | null;
    picture?: string | null;
  };
}

interface PendingApprovalsProps {
  approvals: PendingRental[];
  onActionComplete?: () => void;
}

export function PendingApprovals({ approvals, onActionComplete }: PendingApprovalsProps) {
  // 1. Estado local para manter a lista e permitir remoção imediata
  const [localApprovals, setLocalApprovals] = useState<PendingRental[]>(approvals);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 2. Sincroniza com as props sempre que a lista do pai mudar
  useEffect(() => {
    setLocalApprovals(approvals);
  }, [approvals]);

  const handleStatusChange = async (id: string, status: 'ACTIVE' | 'CANCELED') => {
    setLoadingId(id);
    try {
      await api.patch(`/admin/rentals/${id}/status`, { status });
      toast.success(status === 'ACTIVE' ? 'Aluguel aprovado!' : 'Aluguel rejeitado.');
      
      // 3. Remove o item da tela imediatamente
      setLocalApprovals(prev => prev.filter(item => item.id !== id));
      
      // Notifica o pai para atualizar outros dados se necessário
      if (onActionComplete) onActionComplete();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao processar aluguel.");
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getAvatarColor = (email: string) => {
    const colors = ['#B4A7D6', '#FFDAC1', '#FFB6B9', '#95E1D3', '#FFE66D'];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!localApprovals || localApprovals.length === 0) {
    return (
      <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-yellow-700" size={24} />
          <h2 className="text-xl font-bold text-yellow-900">Pendências</h2>
        </div>
        <p className="text-yellow-700 text-sm text-center py-4">Nenhuma aprovação pendente</p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-yellow-700" size={24} />
        <h2 className="text-xl font-bold text-yellow-900">Pendências</h2>
      </div>

      <div className="space-y-3">
        {localApprovals.slice(0, 3).map((approval) => (
          <div key={approval.id} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <Avatar
                  name={approval.user?.name || 'Usuário'}
                  color={getAvatarColor(approval.user?.email || 'default@email.com')}
                  src={approval.user?.avatar || approval.user?.picture}
                  size="sm"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{approval.user?.name || 'Usuário'}</p>
                  <p className="text-sm text-gray-600">{approval.gameTitleSnapshot}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Solicitado em {formatDate(approval.startDate)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => handleStatusChange(approval.id, 'ACTIVE')}
                disabled={loadingId === approval.id}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-3 py-2 rounded-lg font-semibold transition-colors"
              >
                {loadingId === approval.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                Aprovar
              </button>
              <button 
                onClick={() => handleStatusChange(approval.id, 'CANCELED')}
                disabled={loadingId === approval.id}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-2 rounded-lg font-semibold transition-colors"
              >
                {loadingId === approval.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                Rejeitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}