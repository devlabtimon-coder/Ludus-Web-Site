import { AlertCircle } from 'lucide-react';
import { Avatar } from '../shared/Avatar';

interface LateAlert {
  id: string;
  endDate: string;
  gameTitleSnapshot: string;
  user?: {
    name: string;
    email: string;
    avatar?: string | null;
    picture?: string | null;
  };
}

interface LateAlertsProps {
  alerts: LateAlert[];
}

export function LateAlerts({ alerts }: LateAlertsProps) {
  const getDaysLate = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getAvatarColor = (email: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#95E1D3', '#FFE66D', '#A8E6CF'];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="bg-red-50 rounded-xl border border-red-200 p-5 sm:p-6 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="text-red-600" size={20} />
          <h2 className="text-lg sm:text-xl font-bold text-red-900">Alertas de Atraso</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-700 text-sm text-center">Nenhum aluguel atrasado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 rounded-xl border border-red-200 p-5 sm:p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <AlertCircle className="text-red-600" size={20} />
        <h2 className="text-lg sm:text-xl font-bold text-red-900">Alertas de Atraso</h2>
      </div>

      <div className="space-y-3 flex-1">
        {alerts.slice(0, 3).map((alert) => {
          const daysLate = getDaysLate(alert.endDate);
          return (
            <div key={alert.id} className="bg-white rounded-xl p-4 shadow-sm border border-red-100">
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar
                    name={alert.user?.name || 'Usuário'}
                    src={alert.user?.avatar || alert.user?.picture}
                    color={getAvatarColor(alert.user?.email || 'default@email.com')}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{alert.gameTitleSnapshot}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{alert.user?.name || 'Usuário'}</p>
                  </div>
                </div>
                <span className="bg-red-100 text-red-700 text-[10px] sm:text-xs font-bold px-2 py-1 rounded shrink-0 uppercase tracking-wider">
                  {daysLate} {daysLate === 1 ? 'dia' : 'dias'}
                </span>
              </div>
              <button className="w-full bg-[#E62325] hover:bg-red-700 text-white font-bold py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm transition-colors mt-1">
                Notificar Aluno
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}