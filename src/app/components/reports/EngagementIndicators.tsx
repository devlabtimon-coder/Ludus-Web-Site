import { TrendingUp, TrendingDown, Star, UserPlus } from 'lucide-react';
import { Avatar } from '../shared/Avatar';

interface TopUser {
  name: string;
  email: string;
  rentals: number;
  category: 'ULTRAGAMER' | 'EXPERT' | 'FAMILY';
}

interface EngagementIndicatorsProps {
  activeUsers: number;
  activeUsersChange: number;
  inactiveUsers: number;
  inactiveUsersChange: number;
  avgRentalsPerUser: number;
  newUsers: number;
  topUsers: TopUser[];
}

export function EngagementIndicators({
  activeUsers,
  activeUsersChange,
  inactiveUsers,
  inactiveUsersChange,
  avgRentalsPerUser,
  newUsers,
  topUsers,
}: EngagementIndicatorsProps) {
  
  const getCategoryBadge = (category: 'ULTRAGAMER' | 'EXPERT' | 'FAMILY') => {
    const styles = {
      ULTRAGAMER: 'bg-[#04096E] text-[#FBBC04]', // Azul Escuro c/ texto Amarelo
      EXPERT: 'bg-gray-800 text-white',
      FAMILY: 'bg-[#FBBC04] text-[#04096E]', // Amarelo c/ texto Azul
    };

    const labels = {
      ULTRAGAMER: 'Ultragamer',
      EXPERT: 'Expert',
      FAMILY: 'Family',
    };

    return (
      <span className={`${styles[category]} px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider`}>
        {labels[category]}
      </span>
    );
  };

  const getAvatarColor = (email: string) => {
    const colors = ['#04096E', '#22C55E', '#FBBC04', '#E62325', '#8B5CF6'];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Engajamento de Usuários</h2>
        <span className="px-3 py-1 bg-[#EFF6FF] text-[#04096E] rounded-full text-xs font-bold">
          Últimos 30 dias
        </span>
      </div>

      {/* Grid de Mini Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Usuários que alugaram */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Alugaram</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-[#04096E]">{activeUsers}</p>
            <span className="flex items-center gap-1 text-xs font-bold text-[#22C55E]">
              <TrendingUp size={14} strokeWidth={3} />
              +{activeUsersChange}%
            </span>
          </div>
        </div>

        {/* Usuários inativos */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Inativos +30d</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-[#E62325]">{inactiveUsers}</p>
            <span className="flex items-center gap-1 text-xs font-bold text-[#E62325]">
              <TrendingDown size={14} strokeWidth={3} />
            </span>
          </div>
        </div>

        {/* Média de aluguéis/usuário */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Média p/ Usuário</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900">{avgRentalsPerUser}</p>
            <Star className="text-[#FBBC04]" size={18} fill="currentColor" />
          </div>
        </div>

        {/* Novos usuários */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Novos (Período)</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-[#22C55E]">{newUsers}</p>
            <UserPlus className="text-[#22C55E]" size={18} />
          </div>
        </div>
      </div>

      {/* Top 3 Usuários Mais Ativos */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Top 3 Usuários Mais Ativos</h3>
        <div className="space-y-3">
          {topUsers.map((user, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg hover:shadow-sm transition-all">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                {index + 1}
              </div>
              <Avatar name={user.name} color={getAvatarColor(user.email)} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-[#04096E]">{user.rentals} aluguéis</p>
                <div className="mt-1">
                  {getCategoryBadge(user.category)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}