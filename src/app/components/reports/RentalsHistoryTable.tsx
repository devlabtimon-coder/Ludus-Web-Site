import { Eye, FileText } from 'lucide-react';
import { Avatar } from '../shared/Avatar';
import { Badge } from '../shared/Badge'; // Mantido caso você tenha este componente para o Status

interface Rental {
  id: string;
  user: {
    name: string;
    email: string;
    membershipNumber: string;
  };
  game: string;
  category: 'LATAO' | 'BRONZE' | 'PRATA' | 'OURO' | 'DIAMANTE';
  startDate: string;
  endDate: string;
  duration: number;
  status: 'Em Andamento' | 'Atrasado' | 'Concluído' | 'Pendente';
}

interface RentalsHistoryTableProps {
  rentals: Rental[];
  total: number;
}

export function RentalsHistoryTable({ rentals, total }: RentalsHistoryTableProps) {
  const getAvatarColor = (email: string) => {
    const colors = ['#04096E', '#22C55E', '#FBBC04', '#E62325', '#8B5CF6'];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      DIAMANTE: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
      OURO: 'bg-[#FFF9E6] text-[#9A6B00] border border-[#FBBC04]',
      PRATA: 'bg-gray-100 text-gray-700 border border-gray-300',
      BRONZE: 'bg-orange-100 text-orange-800 border border-orange-200',
      LATAO: 'bg-amber-50 text-amber-900 border border-amber-200',
    };

    return (
      <span className={`${styles[category]} px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider`}>
        {category}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Histórico de Empréstimos</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 uppercase">Período:</span>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#04096E]"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#04096E]"
            />
          </div>
          
          <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#04096E]">
            <option>Todos os jogos</option>
          </select>
          
          <button className="bg-[#04096E] hover:bg-blue-900 text-white px-4 py-1.5 rounded-lg font-semibold text-sm transition-colors">
            Filtrar
          </button>
          
          <button className="flex items-center gap-2 bg-[#FBBC04] hover:bg-[#E5AA00] text-[#04096E] px-4 py-1.5 rounded-lg font-bold text-sm transition-colors ml-auto xl:ml-0">
            <FileText size={16} />
            Gerar PDF
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Usuário</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Jogo</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Tier</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Retirada</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Devolução</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Tempo</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide text-center">Info</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => (
              <tr key={rental.id} className="border-b border-gray-100 hover:bg-[#F8F9FA] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={rental.user.name}
                      color={getAvatarColor(rental.user.email)}
                      size="sm"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{rental.user.name}</p>
                      <p className="text-xs text-gray-500">{rental.user.membershipNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm font-semibold text-[#04096E]">{rental.game}</td>
                <td className="py-3 px-4">{getCategoryBadge(rental.category)}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{rental.startDate}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{rental.endDate}</td>
                <td className="py-3 px-4 text-sm font-bold text-gray-700">
                  {rental.duration} dias
                </td>
                <td className="py-3 px-4">
                  <Badge status={rental.status} />
                </td>
                <td className="py-3 px-4 text-center">
                  <button className="p-1.5 hover:bg-gray-200 rounded transition-colors" title="Ver Detalhes">
                    <Eye className="text-[#04096E]" size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rodapé com Paginação */}
      <div className="flex items-center justify-between mt-6 pt-4">
        <p className="text-sm font-medium text-gray-500">
          Mostrando <span className="font-bold text-gray-900">1-{rentals.length}</span> de <span className="font-bold text-gray-900">{total.toLocaleString('pt-BR')}</span> empréstimos
        </p>
        <div className="flex gap-1.5">
          <button className="bg-[#04096E] text-white px-3 py-1.5 rounded-md font-bold text-sm transition-colors">
            1
          </button>
          <button className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-md font-bold text-sm transition-colors">
            2
          </button>
          <button className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-md font-bold text-sm transition-colors">
            3
          </button>
        </div>
      </div>
    </div>
  );
}