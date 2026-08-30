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
  const [localApprovals, setLocalApprovals] = useState<PendingRental[]>(approvals);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setLocalApprovals(approvals);
  }, [approvals]);

  const handleStatusChange = async (id: string, status: 'ACTIVE' | 'CANCELED') => {
    setLoadingId(id);
    try {
      await api.patch(`/admin/rentals/${id}/status`, { status });
      toast.success(status === 'ACTIVE' ? 'Aluguel aprovado!' : 'Aluguel rejeitado.');
      
      setLocalApprovals(prev => prev.filter(item => item.id !== id));
      if (onActionComplete) onActionComplete();
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      toast.error(error?.response?.data?.error || "Erro ao processar aluguel.");
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarColor = (email: string) => {
    const colors = ['#B4A7D6', '#FFDAC1', '#FFB6B9', '#95E1D3', '#FFE66D'];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const isTooEarlyToApprove = (startDate: string) => {
    const startMs = new Date(startDate).getTime();
    const nowMs = Date.now();
    const fifteenMinutesMs = 15 * 60 * 1000;
    return nowMs < startMs - fifteenMinutesMs;
  };

  if (!localApprovals || localApprovals.length === 0) {
    return (
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5 sm:p-6 h-full">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-yellow-700" size={20} />
          <h2 className="text-lg sm:text-xl font-bold text-yellow-900">Pendências</h2>
        </div>
        <p className="text-yellow-700 text-sm text-center py-4">Nenhuma aprovação pendente</p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5 sm:p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="text-yellow-700" size={20} />
        <h2 className="text-lg sm:text-xl font-bold text-yellow-900">Pendências</h2>
      </div>

      <div className="space-y-3 flex-1">
        {localApprovals.slice(0, 3).map((approval) => {
          const tooEarly = isTooEarlyToApprove(approval.startDate);
          
          return (
            <div key={approval.id} className="bg-white rounded-xl p-4 shadow-sm border border-yellow-100/50">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar
                    name={approval.user?.name || 'Usuário'}
                    color={getAvatarColor(approval.user?.email || 'default@email.com')}
                    src={approval.user?.avatar || approval.user?.picture}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{approval.user?.name || 'Usuário'}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{approval.gameTitleSnapshot}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {formatDate(approval.startDate)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleStatusChange(approval.id, 'ACTIVE')}
                  disabled={loadingId === approval.id || tooEarly}
                  title={tooEarly ? "Aprovação liberada 15 min antes do horário agendado" : "Aprovar retirada"}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    tooEarly || loadingId === approval.id 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                  }`}
                >
                  {loadingId === approval.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
                  <span className="truncate">Aprovar</span>
                </button>
                <button 
                  onClick={() => handleStatusChange(approval.id, 'CANCELED')}
                  disabled={loadingId === approval.id}
                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 px-2 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-colors"
                >
                  {loadingId === approval.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} strokeWidth={3} />}
                  <span className="truncate">Rejeitar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}