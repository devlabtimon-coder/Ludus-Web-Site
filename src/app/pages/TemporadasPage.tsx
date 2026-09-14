import { useState, useMemo, useEffect } from 'react';
import { Trophy, Clock, Users, Ticket, CalendarPlus, ChevronDown } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { api } from '../../services/api';
import { toast } from 'sonner';

import {
  diffDays, ProgressBar, StatusBadge,
  ModalGerarCupons,
  Tab1TodasTemporadas, Tab2Progressao, Tab3Requisitos, Tab4Historico
} from '../components/seasons/SeasonsTabs';

import { ModalGerenciarTemporada } from '../components/seasons/ModalGerenciarTemporada';

interface TemporadasPageProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function TemporadasPage({ onNavigate, onLogout }: TemporadasPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null); // <-- Temporada em exibição
  const [progressData, setProgressData] = useState<any[]>([]);
  const [couponsData, setCouponsData] = useState<any[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [gerarCuponsTemporada, setGerarCuponsTemporada] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/seasons');
      setSeasons(res.data);
      // Se não houver selecionada, seleciona a ativa ou a primeira da lista
      if (res.data.length > 0 && !selectedSeasonId) {
        const active = res.data.find((s: any) => s.status === 'ativa');
        setSelectedSeasonId(active ? active.id : res.data[0].id);
      }
    } catch (e) {
      toast.error("Erro ao carregar temporadas");
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/admin/seasons/coupons');
      setCouponsData(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchData();
    fetchCoupons();
  }, []);

  // Temporada atualmente inspecionada (seja ela ativa ou encerrada)
  const temporadaSelecionada = useMemo(() => {
    return seasons.find(s => s.id === selectedSeasonId) || seasons.find(s => s.status === 'ativa') || seasons[0] || null;
  }, [seasons, selectedSeasonId]);

  const fetchProgress = async (id: string) => {
    try {
      const res = await api.get(`/admin/seasons/${id}/progress`);
      setProgressData(res.data);
    } catch (e) {
      toast.error("Erro ao carregar progresso da temporada");
    }
  };

  // CORRIGIDO: Dispara a busca sempre que a temporada selecionada mudar (mesmo encerrada)
  useEffect(() => {
    if (temporadaSelecionada?.id) {
      fetchProgress(temporadaSelecionada.id);
    }
  }, [temporadaSelecionada?.id]);

  const TABS = ['Todas as Temporadas', 'Ranking e Progresso', 'Requisitos e Recompensas', 'Histórico de Cupons'];

  const shortName = temporadaSelecionada ? temporadaSelecionada.name : '—';
  const dateRange = temporadaSelecionada
    ? `${new Date(temporadaSelecionada.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${new Date(temporadaSelecionada.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : '—';

  const isEncerrada = temporadaSelecionada?.status === 'encerrada';
  const diasRestantes = temporadaSelecionada ? Math.max(0, diffDays(temporadaSelecionada.endDate, new Date())) : 0;
  const totalDias = temporadaSelecionada ? Math.max(1, diffDays(temporadaSelecionada.endDate, temporadaSelecionada.startDate)) : 1;
  const decorridos = temporadaSelecionada ? diffDays(new Date(), temporadaSelecionada.startDate) : 0;
  const percentualDecorrido = isEncerrada ? 100 : Math.min(100, Math.max(0, Math.round((decorridos / totalDias) * 100)));
  const corUrgencia = isEncerrada ? '#6B7280' : diasRestantes <= 7 ? '#EF4444' : '#F97316';

  const rewardLevels = [2, 3, 4, 5];

  const usersEligible = useMemo(() => {
    return progressData.filter(u => u.currentLevel >= 2);
  }, [progressData]);

  const totalCuponsPendentes = useMemo(() => {
    return progressData.reduce((acc, u) => {
      if (u.currentLevel < 2) return acc;
      const reached = rewardLevels.filter(lvl => lvl <= u.currentLevel);
      const emitted = Array.isArray(u.cuponsEmitidos) ? u.cuponsEmitidos : [];
      const pendingCount = reached.filter(lvl => !emitted.includes(lvl)).length;
      return acc + pendingCount;
    }, 0);
  }, [progressData]);

  const handleSelectSeasonFromTable = (seasonId: string) => {
    setSelectedSeasonId(seasonId);
    setActiveTab(1); // Vai direto para a aba de Ranking e Progresso
  };

  return (
    <div className="flex h-screen bg-[#F5F5F7]">
      <Sidebar activePage="temporadas" onNavigate={onNavigate} onLogout={onLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} onMenuToggle={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8">

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-black text-[28px]" style={{ color: '#04096D' }}>Temporadas</h1>
              <p className="text-[14px] mt-0.5 text-gray-500">Gerencie as temporadas e acompanhe o ranking consolidado</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Seletor Rápido de Temporada */}
              {seasons.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedSeasonId || ''}
                    onChange={(e) => setSelectedSeasonId(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 text-[#04096D] text-sm font-bold py-2.5 pl-4 pr-10 rounded-xl shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#04096D]"
                  >
                    {seasons.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.status.toUpperCase()})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}

              <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 text-white text-[14px] font-bold transition-all hover:opacity-95 bg-[#04096D]" style={{ borderRadius: 10 }}>
                <CalendarPlus size={16} /> + Nova Temporada
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className="rounded-2xl p-5 text-white" style={{ background: '#04096D' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10">
                  <Trophy size={20} style={{ color: '#FBBC04' }} />
                </div>
                <span className="text-[12px] font-semibold text-white/70">Temporada em Foco</span>
              </div>
              <div className="text-[20px] font-black leading-tight truncate" title={shortName}>{shortName}</div>
              <div className="text-[12px] text-white/60 mt-0.5 mb-3">{dateRange}</div>
              {temporadaSelecionada && <StatusBadge status={temporadaSelecionada.status} />}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50"><Clock size={20} style={{ color: corUrgencia }} /></div>
                <span className="text-[12px] font-semibold text-gray-500">{isEncerrada ? 'Situação' : 'Dias Restantes'}</span>
              </div>
              <div className="text-[28px] font-black leading-tight" style={{ color: corUrgencia }}>
                {isEncerrada ? 'Encerrada' : diasRestantes}
              </div>
              <ProgressBar value={percentualDecorrido} color={corUrgencia} height={6} />
              <div className="text-[11px] text-gray-400 mt-1">
                {isEncerrada ? '100% finalizada' : `${percentualDecorrido}% decorrido`}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50"><Users size={20} style={{ color: '#22C55E' }} /></div>
                <span className="text-[12px] font-semibold text-gray-500">Usuários Elegíveis</span>
              </div>
              <div className="text-[32px] font-black leading-tight text-green-500">{usersEligible.length}</div>
              <div className="text-[12px] text-gray-400 mt-0.5 mb-2">atingiram nível 2 ou superior</div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50"><Ticket size={20} style={{ color: '#04096D' }} /></div>
                <span className="text-[12px] font-semibold text-gray-500">Cupons Pendentes</span>
              </div>
              <div className="text-[32px] font-black leading-tight text-[#04096D]">{totalCuponsPendentes}</div>
              <div className="text-[12px] text-gray-400 mt-0.5 mb-3">disponíveis para emissão</div>
              <button
                onClick={() => setGerarCuponsTemporada(temporadaSelecionada)}
                disabled={!temporadaSelecionada || totalCuponsPendentes === 0}
                className="w-full h-8 rounded-lg text-[12px] font-bold border border-[#04096D] text-[#04096D] transition-all hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Gerar Agora
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden border border-gray-100">
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {TABS.map((tab, i) => (
                <button
                  key={i} onClick={() => setActiveTab(i)}
                  className="flex-shrink-0 px-5 py-3.5 text-[13px] font-semibold transition-all whitespace-nowrap"
                  style={activeTab === i ? { color: '#04096D', borderBottom: '2px solid #04096D' } : { color: '#9CA3AF', borderBottom: '2px solid transparent' }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 0 && (
                <Tab1TodasTemporadas
                  seasons={seasons}
                  selectedSeasonId={selectedSeasonId}
                  onSelectSeason={handleSelectSeasonFromTable}
                  onGerarCupons={(t: any) => setGerarCuponsTemporada(t)}
                  fetchSeasons={fetchData} 
                />
              )}
              {activeTab === 1 && (
                <Tab2Progressao 
                  progressData={progressData} 
                  temporadaNome={temporadaSelecionada?.name} 
                />
              )}
              {activeTab === 2 && <Tab3Requisitos temporadaAtiva={temporadaSelecionada} />}
              {activeTab === 3 && <Tab4Historico couponsData={couponsData} />}
            </div>
          </div>
        </main>
      </div>

      <ModalGerenciarTemporada 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSalvar={fetchData} 
        season={null} 
      />

      <ModalGerarCupons 
        isOpen={!!gerarCuponsTemporada} 
        temporada={gerarCuponsTemporada} 
        progressData={progressData} 
        onClose={() => setGerarCuponsTemporada(null)} 
        onSuccess={() => {
          fetchCoupons();
          if (temporadaSelecionada) fetchProgress(temporadaSelecionada.id);
        }} 
      />
    </div>
  );
}