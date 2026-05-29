import { useState } from 'react'; // 1. Importar useState
import { Filter, Download, Loader2 } from 'lucide-react'; // 2. Adicionar Loader2
import { Avatar } from '../shared/Avatar';
import { Rental, RentalStatus } from '../../../types/api';

interface RentalsTableProps {
  rentals: Rental[];
  onUpdateStatus?: (id: string, status: RentalStatus) => void;
}

export function RentalsTable({ rentals, onUpdateStatus }: RentalsTableProps) {
  // 3. Estado para controlar qual ID está em processamento
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdate = async (id: string, status: RentalStatus) => {
    setLoadingId(id); // Trava o botão deste aluguel
    try {
      await onUpdateStatus?.(id, status);
    } finally {
      // O pai (RentalsPage) deve atualizar a lista via hook, 
      // mas garantimos a liberação aqui caso haja erro
      setLoadingId(null);
    }
  };

  const getRentalStatusInfo = (rental: Rental) => {
    const now = Date.now();
    const isOverdue = (rental.status === 'PENDING' || rental.status === 'ACTIVE') && new Date(rental.endDate).getTime() < now;
    
    if (isOverdue) return { label: 'Atrasado', color: 'text-red-600 font-bold' };
    
    const statusMap: Record<string, { label: string, color: string }> = {
      'PENDING': { label: 'Pendente', color: 'text-blue-600' },
      'ACTIVE': { label: 'Ativo', color: 'text-indigo-600' },
      'RETURNED': { label: 'Devolvido', color: 'text-green-600' },
      'CANCELED': { label: 'Cancelado', color: 'text-red-800' }
    };
    
    return statusMap[rental.status] || { label: rental.status, color: 'text-gray-600' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Gerenciamento de Empréstimos</h2>
        <div className="flex gap-2">
          <button className="bg-[#0A1628] hover:bg-[#152745] text-white p-2 rounded-lg transition-colors">
            <Filter size={20} />
          </button>
          <button className="bg-[#0A1628] hover:bg-[#152745] text-white p-2 rounded-lg transition-colors">
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Usuário</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Jogo</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Período</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => {
              const statusInfo = getRentalStatusInfo(rental);
              const userName = rental.user?.name || 'Usuário Desconhecido';
              const isLoading = loadingId === rental.id;
              
              return (
                <tr key={rental.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        name={userName} 
                        size="md" 
                        src={rental.user?.avatar || rental.user?.picture} 
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500">{rental.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium">{rental.game?.title || rental.gameTitleSnapshot}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {formatDate(rental.startDate)} ➔ {formatDate(rental.endDate)}
                  </td>
                  <td className={`py-4 px-4 font-semibold ${statusInfo.color}`}>
                    {statusInfo.label}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      {rental.status === 'PENDING' && (
                        <>
                          <button 
                            disabled={isLoading}
                            onClick={() => handleUpdate(rental.id, 'ACTIVE')} 
                            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-1"
                          >
                            {isLoading ? <Loader2 size={12} className="animate-spin" /> : 'Aprovar'}
                          </button>
                          <button 
                            disabled={isLoading}
                            onClick={() => handleUpdate(rental.id, 'CANCELED')} 
                            className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-1"
                          >
                            {isLoading ? <Loader2 size={12} className="animate-spin" /> : 'Rejeitar'}
                          </button>
                        </>
                      )}

                      {rental.status === 'ACTIVE' && (
                        <button 
                          disabled={isLoading}
                          onClick={() => handleUpdate(rental.id, 'RETURNED')} 
                          className="text-xs bg-green-700 text-white px-3 py-1.5 rounded-full hover:bg-green-800 transition-all disabled:opacity-50 flex items-center gap-1"
                        >
                          {isLoading ? <Loader2 size={12} className="animate-spin" /> : 'Devolver'}
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
  );
}