import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MetricCard } from '../components/dashboard/MetricCard';
import { PendingApprovals } from '../components/dashboard/PendingApprovals';
import { LateAlerts } from '../components/dashboard/LateAlerts';
import { RecentRentals } from '../components/dashboard/RecentRentals';
import { TopGames } from '../components/dashboard/TopGames';
import { Gamepad2, ArrowLeftRight, Clock, Users } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface DashboardPageProps {
  onNavigate: (page: any) => void;
  onLogout: () => void;
}

export function DashboardPage({ onNavigate, onLogout }: DashboardPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    totalGames: 0,
    activeRentals: 0,
    pendingApprovals: 0,
    activeUsers: 0,
  });
  const [recentRentals, setRecentRentals] = useState([]);
  const [lateAlerts, setLateAlerts] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [topGames, setTopGames] = useState([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [metricsRes, rentalsRes, alertsRes, pendingRes, topGamesRes] = await Promise.all([
        api.get('/admin/dashboard/metrics').catch(() => ({ data: { totalGames: 0, activeRentals: 0, pendingApprovals: 0, activeUsers: 0 } })),
        api.get('/admin/rentals/recent').catch(() => ({ data: [] })),
        api.get('/admin/rentals/late').catch(() => ({ data: [] })),
        api.get('/admin/rentals/pending').catch(() => ({ data: [] })),
        api.get('/admin/games/top').catch(() => ({ data: [] })),
      ]);

      setMetrics(metricsRes.data);
      setRecentRentals(rentalsRes.data);
      setLateAlerts(alertsRes.data);
      setPendingApprovals(pendingRes.data);
      setTopGames(topGamesRes.data);
    } catch (error) {
      toast.error("Erro ao carregar dados do dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex w-full overflow-x-hidden">
      

      <Sidebar
        activePage="dashboard"
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

 
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          notificationCount={pendingApprovals.length} 
          onMenuToggle={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          
         
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#04096E]">Visão Geral</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Acompanhe os principais indicadores e atividades da Ludus.</p>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            <MetricCard
              title="Total de Jogos"
              value={metrics.totalGames}
              subtext="Cadastrados no acervo"
              icon={<Gamepad2 size={80} />}
              variant="white"
            />
            <MetricCard
              title="Empréstimos Ativos"
              value={metrics.activeRentals}
              subtext="Jogos com alunos"
              icon={<ArrowLeftRight size={80} />}
              variant="yellow"
            />
            <MetricCard
              title="Pendências"
              value={metrics.pendingApprovals}
              subtext="Aguardando retirada"
              icon={<Clock size={80} />}
              variant="white-yellow"
            />
            <MetricCard
              title="Usuários Ativos"
              value={metrics.activeUsers}
              subtext="Membros engajados"
              icon={<Users size={80} />}
              variant="dark"
            />
          </div>

  
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PendingApprovals 
              approvals={pendingApprovals} 
              onActionComplete={loadDashboardData} 
            />
            <LateAlerts 
              alerts={lateAlerts} 
            />
          </div>

          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <RecentRentals rentals={recentRentals} />
            </div>
            <div className="xl:col-span-1">
              <TopGames games={topGames} />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}