import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MetricCard } from '../components/dashboard/MetricCard';
import { RecentRentals } from '../components/dashboard/RecentRentals';
import { TopGames } from '../components/dashboard/TopGames';
import { LateAlerts } from '../components/dashboard/LateAlerts';
import { PendingApprovals } from '../components/dashboard/PendingApprovals';
import { Loading } from '../components/shared/Loading';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { Plus, Info, Bell, Users } from 'lucide-react';

// 👉 IMPORTANTE: Mantendo o hook da API real em vez do mockData!
import { useDashboard } from '../../hooks';

interface DashboardPageProps {
  onNavigate?: (page: 'dashboard' | 'acervo' | 'emprestimos' | 'usuarios' | 'cadastro' | 'relatorios') => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  // Puxa os dados verdadeiros do backend
  const {
    metrics,
    recentRentals,
    topGames,
    lateAlerts,
    pendingApprovals,
    loading,
    error,
    refetch,
  } = useDashboard();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="dashboard" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-8">
          
          <div className="grid grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Jogos Totais"
              value={metrics?.totalGames || 0}
              subtext="+4 este mês"
              icon={<Plus size={96} strokeWidth={1.5} />}
              variant="yellow"
            />
            
            <MetricCard
              title="Aluguéis Ativos"
              value={metrics?.activeRentals || 0}
              subtext="85% capacidade"
              icon={<Info size={96} strokeWidth={1.5} />}
              variant="white"
            />
            
            <MetricCard
              title="Aprovações Pendentes"
              value={metrics?.pendingApprovals || 0}
              subtext="Requer atenção"
              icon={<Bell size={96} strokeWidth={1.5} />}
              variant="dark"
            />
            
            <MetricCard
              title="Usuários Ativos"
              value={metrics?.activeUsers || 0}
              subtext="12 novos hoje"
              icon={<Users size={96} strokeWidth={1.5} />}
              variant="white-yellow" 
            />
          </div>

          <div className="mb-8">
            <RecentRentals rentals={recentRentals} />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <TopGames games={topGames} />
            </div>

            <div className="space-y-6">
              <LateAlerts alerts={lateAlerts} />
              <PendingApprovals approvals={pendingApprovals} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}