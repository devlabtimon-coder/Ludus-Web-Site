import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

import { useAdminUser, useDashboard } from '../../hooks';
import { canAccessArea } from '../../config/adminAreas';

interface DashboardPageProps {
  onLogout?: () => void;
}

export function DashboardPage({ onLogout }: DashboardPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const {
    metrics,
    recentRentals,
    topGames,
    lateAlerts,
    pendingApprovals,
    pendingRentalsTotal,
    initialLoading,
    hasLoaded,
    error,
    refetch,
  } = useDashboard();

  // Cada bloco aparece só com a área liberada para este admin.
  const user = useAdminUser();
  const canRentals = canAccessArea(user, 'RENTALS');
  const canReports = canAccessArea(user, 'REPORTS');
  const metricCards = [metrics?.totalGames, metrics?.activeRentals, metrics?.pendingApprovals, metrics?.activeUsers];
  const hasAnyBlock = metricCards.some((v) => v !== null && v !== undefined) || canRentals || canReports;

  if (initialLoading) {
    return <Loading />;
  }

  if (error && !hasLoaded) {
    return <ErrorMessage message={error} onRetry={refetch} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          notificationCount={canRentals ? pendingRentalsTotal : 0}
          onLogout={onLogout} 
          onMenuToggle={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#02096D] mb-6 sm:mb-8">
            Visão Geral
          </h1>

          {error && hasLoaded && (
            <div role="alert" className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="font-semibold">{error}</span>
              <button
                onClick={refetch}
                className="self-start sm:self-auto bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {metrics?.totalGames != null && (
              <MetricCard
                title="Jogos Totais"
                value={metrics.totalGames}
                subtext="Clique para ver o Acervo"
                icon={<Plus size={80} strokeWidth={1.5} />}
                variant="yellow"
                onClick={() => navigate('/acervo')}
              />
            )}

            {metrics?.activeRentals != null && (
              <MetricCard
                title="Aluguéis Ativos"
                value={metrics.activeRentals}
                subtext="Clique para ver Empréstimos"
                icon={<Info size={80} strokeWidth={1.5} />}
                variant="white"
                onClick={() => navigate('/emprestimos')}
              />
            )}

            {metrics?.pendingApprovals != null && (
              <MetricCard
                title="Aprovações Pendentes"
                value={metrics.pendingApprovals}
                subtext="Clique para ver Cadastros"
                icon={<Bell size={80} strokeWidth={1.5} />}
                variant="dark"
                onClick={() => navigate('/cadastro')}
              />
            )}

            {metrics?.activeUsers != null && (
              <MetricCard
                title="Usuários Ativos"
                value={metrics.activeUsers}
                subtext="Clique para ver Usuários"
                icon={<Users size={80} strokeWidth={1.5} />}
                variant="white-yellow"
                onClick={() => navigate('/usuarios')}
              />
            )}
          </div>

          {!hasAnyBlock && (
            <div className="rounded-2xl border border-[#31358B]/10 bg-white px-6 py-10 text-center shadow-sm">
              <p className="text-lg font-bold text-[#02096D]">Bem-vindo ao painel do Ludus</p>
              <p className="mt-2 text-sm text-gray-600">Use o menu para acessar as áreas liberadas para você.</p>
            </div>
          )}

          {canRentals && (
            <div className="mb-6 sm:mb-8">
              <RecentRentals rentals={recentRentals} />
            </div>
          )}

          {(canRentals || canReports) && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {canReports && (
                <div className={canRentals ? 'xl:col-span-2' : 'xl:col-span-3'}>
                  <TopGames games={topGames} />
                </div>
              )}

              {canRentals && (
                <div className={canReports ? 'space-y-6' : 'space-y-6 xl:col-span-3'}>
                  <LateAlerts alerts={lateAlerts} />
                  <PendingApprovals approvals={pendingApprovals} onActionComplete={refetch} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}