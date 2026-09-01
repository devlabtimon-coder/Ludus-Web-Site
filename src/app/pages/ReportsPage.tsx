import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { ReportKPICard } from '../components/reports/ReportKPICard';
import { TopGamesChart } from '../components/reports/TopGamesChart';
import { RentalsEvolutionChart } from '../components/reports/RentalsEvolutionChart';
import { CollectionStats } from '../components/reports/CollectionStats';
import { EngagementIndicators } from '../components/reports/EngagementIndicators';
import { RentalsHistoryTable } from '../components/reports/RentalsHistoryTable';
import { BarChart3, Dices, Clock, Users, Download, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { generateAdminReportPDF } from '../../services/pdf.service';

interface ReportsPageProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function ReportsPage({ onNavigate, onLogout }: ReportsPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState(false);
  
  const [globalPeriod, setGlobalPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const res = await api.get('/admin/reports', { params: { period: globalPeriod } });
        setReportData(res.data);
        setError(false);
      } catch (err) {
        console.error("Erro ao carregar dados de relatórios:", err);
        setError(true);
        toast.error("Não foi possível carregar os relatórios.");
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [globalPeriod]);

  if (loading && !reportData) {
    return (
      <div className="flex h-screen bg-[#F5F5F7] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#04096E]/30 border-t-[#04096E] rounded-full animate-spin"></div>
          <p className="text-[#04096E] font-bold">Processando dados reais...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="flex h-screen bg-[#F5F5F7] items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 flex flex-col items-center max-w-md text-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Relatórios Indisponíveis</h2>
          <p className="text-gray-500 mb-6">Ocorreu um erro ao gerar as estatísticas reais. Verifique se o servidor está online e os dados estão íntegros.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[#04096E] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-900 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F5F7]">
      <Sidebar activePage="relatorios" onNavigate={onNavigate} onLogout={onLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} onMenuToggle={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8 relative">
          
          {loading && (
            <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
              <div className="w-8 h-8 border-4 border-[#04096E]/30 border-t-[#04096E] rounded-full animate-spin"></div>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628] mb-2">Relatórios Gerenciais</h1>
              <p className="text-sm md:text-base text-gray-500">Acompanhe indicadores, estatísticas e evolução do acervo Ludus em tempo real</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
              <select 
                value={globalPeriod}
                onChange={(e) => setGlobalPeriod(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 md:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#04096E] bg-white cursor-pointer"
              >
                <option value="week">Semanal</option>
                <option value="month">Mensal</option>
                <option value="year">Anual</option>
              </select>
              
              {/* Botão de Exportar Conectado */}
              <button 
                onClick={() => generateAdminReportPDF(reportData, globalPeriod)}
                className="flex items-center justify-center gap-2 bg-[#04096E] hover:bg-blue-900 text-white px-3 md:px-4 py-2 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Exportar Relatório</span>
                <span className="sm:hidden">Exportar</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <ReportKPICard label="TOTAL DE EMPRÉSTIMOS" value={reportData.kpis.totalRentals.value} tag={reportData.kpis.totalRentals.tag} icon={BarChart3} variant="dark" />
            <ReportKPICard label="JOGOS ÚNICOS ALUGADOS" value={reportData.kpis.uniqueGames.value} tag={reportData.kpis.uniqueGames.tag} icon={Dices} variant="yellow" />
            <ReportKPICard label="TEMPO MÉDIO" value={reportData.kpis.avgRentalDays.value} tag={reportData.kpis.avgRentalDays.subtitle} icon={Clock} variant="white-blue" />
            <ReportKPICard label="TAXA DE ENGAJAMENTO" value={reportData.kpis.engagementRate.value} tag={reportData.kpis.engagementRate.tag} icon={Users} variant="white-green" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <TopGamesChart games={reportData.topGames} />
            <RentalsEvolutionChart data={reportData.evolution} period={globalPeriod} onPeriodChange={setGlobalPeriod} />
            <CollectionStats {...reportData.collection} />
            <EngagementIndicators {...reportData.engagement} />
          </div>

        
          <RentalsHistoryTable 
            rentals={reportData.history} 
            total={parseInt(reportData.kpis.totalRentals.value.replace(/\D/g, '')) || 0} 
            fullReportData={reportData}
            periodCode={globalPeriod}
          />
        </main>
      </div>
    </div>
  );
}