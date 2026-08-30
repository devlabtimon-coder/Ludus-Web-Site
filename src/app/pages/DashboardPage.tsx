import { useState } from 'react';
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

import { useDashboard } from '../../hooks';

interface DashboardPageProps {
  onNavigate?: (page: 'dashboard' | 'acervo' | 'emprestimos' | 'usuarios' | 'cadastro' | 'relatorios' | 'login') => void;
  onLogout?: () => void;
}

export function DashboardPage({ onNavigate, onLogout }: DashboardPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
     
      <Sidebar
        activePage="dashboard"
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <Header 
          notificationCount={pendingApprovals?.length || 0}
          onLogout={onLogout} 
          onMenuToggle={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          <h1 className="text-2xl sm:text-3xl font-bold text-[#02096D] mb-6 sm:mb-8">
            Visão Geral
          </h1>

        
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <MetricCard
              title="Jogos Totais"
              value={metrics?.totalGames || 0}
              subtext="+4 este mês"
              icon={<Plus size={80} strokeWidth={1.5} />}
              variant="yellow"
            />
            
            <MetricCard
              title="Aluguéis Ativos"
              value={metrics?.activeRentals || 0}
              subtext="85% capacidade"
              icon={<Info size={80} strokeWidth={1.5} />}
              variant="white"
            />
            
            <MetricCard
              title="Aprovações Pendentes"
              value={metrics?.pendingApprovals || 0}
              subtext="Requer atenção"
              icon={<Bell size={80} strokeWidth={1.5} />}
              variant="dark"
            />
            
            <MetricCard
              title="Usuários Ativos"
              value={metrics?.activeUsers || 0}
              subtext="12 novos hoje"
              icon={<Users size={80} strokeWidth={1.5} />}
              variant="white-yellow" 
            />
          </div>

          <div className="mb-6 sm:mb-8">
            <RecentRentals rentals={recentRentals} />
          </div>

          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
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