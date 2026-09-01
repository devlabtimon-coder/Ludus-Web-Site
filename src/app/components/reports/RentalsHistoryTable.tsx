import { Eye, FileText } from 'lucide-react';
import { Avatar } from '../shared/Avatar';
import { Badge } from '../shared/Badge';
import { generateAdminReportPDF } from '../../../services/pdf.service';

interface Rental {
  id: string;
  user: {
    name: string;
    email: string;
    membershipNumber: string;
    avatar?: string | null;
    picture?: string | null;
  };
  game: string;
  category: 'LATAO' | 'BRONZE' | 'PRATA' | 'OURO' | 'DIAMANTE';
  startDate: string;
  endDate: string;
  duration: number;
  status: 'Em Andamento' | 'Atrasado' | 'Concluído' | 'Pendente' | 'Cancelado';
}

interface RentalsHistoryTableProps {
  rentals: Rental[];
  total: number;
  fullReportData?: any;
  periodCode?: string;
}

export function RentalsHistoryTable({ rentals, total, fullReportData, periodCode }: RentalsHistoryTableProps) {
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Histórico de Empréstimos</h2>
        
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button 
            onClick={() => fullReportData && periodCode ? generateAdminReportPDF(fullReportData, periodCode) : null}
            className="flex items-center justify-center gap-2 bg-[#FBBC04] hover:bg-[#E5AA00] text-[#04096E] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-colors w-full sm:w-auto ml-auto xl:ml-0"
          >
            <FileText size={16} />
            Gerar PDF
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[950px] text-left border-collapse">
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
                <tr key={rental.id} className="border-b border-gray-100 hover:bg-[#F8F9FA] transition-colors bg-white">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={rental.user.name}
                        src={rental.user.avatar || rental.user.picture}
                        color={getAvatarColor(rental.user.email)}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{rental.user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{rental.user.membershipNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-[#04096E] truncate max-w-[150px]">{rental.game}</td>
                  <td className="py-3 px-4">{getCategoryBadge(rental.category)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{rental.startDate}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{rental.endDate}</td>
                  <td className="py-3 px-4 text-sm font-bold text-gray-700 whitespace-nowrap">
                    {rental.duration} dias
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={rental.status as any} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors inline-flex" title="Ver Detalhes">
                      <Eye className="text-[#04096E]" size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs sm:text-sm font-medium text-gray-500 text-center sm:text-left">
          Mostrando <span className="font-bold text-gray-900">1-{rentals.length}</span> de <span className="font-bold text-gray-900">{total.toLocaleString('pt-BR')}</span> empréstimos
        </p>
      </div>
    </div>
  );
}