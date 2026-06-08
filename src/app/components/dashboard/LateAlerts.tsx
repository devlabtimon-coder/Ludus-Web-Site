import { AlertCircle } from 'lucide-react';
import { Avatar } from '../shared/Avatar';
import { Button } from '../shared/Button';

interface LateAlert {
  id: string;
  endDate: string;
  gameTitleSnapshot: string;
  user?: {
    name: string;
    email: string;
    avatar?: string | null;  // 👇 ADICIONADO AQUI
    picture?: string | null; // 👇 ADICIONADO AQUI
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
      <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="text-red-600" size={24} />
          <h2 className="text-xl font-bold text-red-900">Alertas de Atraso</h2>
        </div>
        <p className="text-red-700 text-sm text-center py-4">Nenhum aluguel atrasado</p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="text-red-600" size={24} />
        <h2 className="text-xl font-bold text-red-900">Alertas de Atraso</h2>
      </div>

      <div className="space-y-3">
        {alerts.slice(0, 3).map((alert) => {
          const daysLate = getDaysLate(alert.endDate);
          return (
            <div key={alert.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={alert.user?.name || 'Usuário'}
                    src={alert.user?.avatar || alert.user?.picture} // 👇 PROPRIEDADE DA FOTO ADICIONADA AQUI
                    color={getAvatarColor(alert.user?.email || 'default@email.com')}
                    size="sm"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{alert.gameTitleSnapshot}</p>
                    <p className="text-sm text-gray-600">{alert.user?.name || 'Usuário'}</p>
                  </div>
                </div>
                <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                  {daysLate} {daysLate === 1 ? 'dia' : 'dias'}
                </span>
              </div>
              <Button variant="danger" size="sm" fullWidth>
                Notificar Usuário
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}