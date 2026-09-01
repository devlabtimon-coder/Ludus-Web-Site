import { useState } from 'react';
import { Filter, Download, Loader2 } from 'lucide-react';
import { Avatar } from '../shared/Avatar';
import { RentalStatus } from '../../../types/api';
import type { Rental as BaseRental } from '../../../types/api';
import { ReturnChecklistModal } from './ReturnChecklistModal'; 

export interface Rental extends BaseRental {
  user: BaseRental['user'] & {
    avatar?: string | null;
    picture?: string | null;
  };
}

interface RentalsTableProps {
  rentals: Rental[];
 
  onUpdateStatus?: (id: string, status: RentalStatus, extraData?: { applyPenalty: boolean; penaltyReason: string }) => void;
}

export function RentalsTable({ rentals, onUpdateStatus }: RentalsTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
 
  const [returnModalRental, setReturnModalRental] = useState<Rental | null>(null);

  const handleUpdate = async (id: string, status: RentalStatus, extraData?: any) => {
    setLoadingId(id);
    try {
      await onUpdateStatus?.(id, status, extraData);
    } finally {
      setLoadingId(null);
    }
  };

  const getRentalStatusInfo = (rental: Rental) => {
    const now = Date.now();
    const isOverdue = rental.status === 'ACTIVE' && new Date(rental.endDate).getTime() < now;
    if (isOverdue) return { label: 'Atrasado', color: 'text-red-600 font-bold bg-red-50 px-2 py-1 rounded-md' };
    
    const isNoShow = rental.status === 'PENDING' && new Date(rental.endDate).getTime() < now;
    if (isNoShow) return { label: 'Não Retirado', color: 'text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-md' };
    
    const statusMap: Record<string, { label: string, color: string }> = {
      'PENDING': { label: 'Aguardando Retirada', color: 'text-blue-600 font-semibold' },
      'ACTIVE': { label: 'Com o Aluno', color: 'text-indigo-600 font-semibold' },
      'RETURNED': { label: 'Devolvido', color: 'text-green-600 font-semibold' },
      'CANCELED': { label: 'Cancelado', color: 'text-red-800 font-semibold' }
    };
    return statusMap[rental.status] || { label: rental.status, color: 'text-gray-600' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const isTooEarlyToApprove = (startDate: string) => {
    const startMs = new Date(startDate).getTime();
    const nowMs = Date.now();
    const fifteenMinutesMs = 15 * 60 * 1000;
    return nowMs < startMs - fifteenMinutesMs;
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mt-4 sm:mt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Gerenciamento de Empréstimos</h2>
          <div className="flex gap-2 self-end sm:self-auto">
            <button className="bg-[#0A1628] hover:bg-[#152745] text-white p-2 rounded-lg transition-colors">
              <Filter size={18} />
            </button>
            <button className="bg-[#0A1628] hover:bg-[#152745] text-white p-2 rounded-lg transition-colors">
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full min-w-[900px]">
              <thead className="bg-[#F7F8FF]">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 sm:py-4 px-4 text-xs font-semibold text-[#31358B] uppercase">Usuário</th>
                  <th className="text-left py-3 sm:py-4 px-4 text-xs font-semibold text-[#31358B] uppercase">Jogo</th>
                  <th className="text-left py-3 sm:py-4 px-4 text-xs font-semibold text-[#31358B] uppercase">Período</th>
                  <th className="text-left py-3 sm:py-4 px-4 text-xs font-semibold text-[#31358B] uppercase">Status</th>
                  <th className="text-left py-3 sm:py-4 px-4 text-xs font-semibold text-[#31358B] uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((rental) => {
                  const statusInfo = getRentalStatusInfo(rental);
                  const userName = rental.user?.name || 'Usuário Desconhecido';
                  const isLoading = loadingId === rental.id;
                  const tooEarly = rental.status === 'PENDING' && isTooEarlyToApprove(rental.startDate);
                  
                  return (
                    <tr key={rental.id} className="border-b border-gray-100 hover:bg-gray-50 bg-white">
                      <td className="py-3 sm:py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={userName} size="md" src={rental.user?.avatar || rental.user?.picture} />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{userName}</p>
                            <p className="text-xs text-gray-500 truncate">{rental.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-4 font-medium text-sm text-gray-800">{rental.game?.title || rental.gameTitleSnapshot}</td>
                      <td className="py-3 sm:py-4 px-4 text-sm text-gray-600">
                        <div className="whitespace-nowrap">{formatDate(rental.startDate)} às {formatTime(rental.startDate)}</div>
                        <div className="text-xs text-gray-400 whitespace-nowrap">até {formatDate(rental.endDate)}</div>
                      </td>
                      <td className="py-3 sm:py-4 px-4">
                        <span className={`text-[13px] ${statusInfo.color}`}>{statusInfo.label}</span>
                      </td>
                      <td className="py-3 sm:py-4 px-4">
                        <div className="flex gap-2">
                          
                         
                          {rental.status === 'PENDING' && (
                            <>
                              <button 
                                disabled={isLoading || tooEarly}
                                onClick={() => handleUpdate(rental.id, 'ACTIVE')}
                                title={tooEarly ? "A liberação ocorre 15 min antes do horário agendado." : "Aprovar retirada"}
                                className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1 font-bold ${
                                  tooEarly || isLoading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }`}
                              >
                                {isLoading ? <Loader2 size={12} className="animate-spin" /> : 'Aprovar'}
                              </button>
                              <button 
                                disabled={isLoading}
                                onClick={() => handleUpdate(rental.id, 'CANCELED')}
                                className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-full hover:bg-red-100 transition-all flex items-center gap-1 font-bold"
                              >
                                Rejeitar
                              </button>
                            </>
                          )}

                          
                          {rental.status === 'ACTIVE' && (
                            <button 
                              disabled={isLoading}
                              onClick={() => setReturnModalRental(rental)} 
                              className="text-xs bg-green-700 text-white px-3 py-1.5 rounded-full hover:bg-green-800 transition-all disabled:opacity-50 flex items-center gap-1 font-bold"
                            >
                              {isLoading ? <Loader2 size={12} className="animate-spin" /> : 'Devolver (Checklist)'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      
      <ReturnChecklistModal
        isOpen={!!returnModalRental}
        onClose={() => setReturnModalRental(null)}
        rental={returnModalRental}
        onConfirm={(applyPenalty, penaltyReason) => {
      
          handleUpdate(returnModalRental!.id, 'RETURNED', { applyPenalty, penaltyReason });
          setReturnModalRental(null);
        }}
      />
    </>
  );
}