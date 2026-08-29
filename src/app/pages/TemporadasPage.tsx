import { useState, useMemo, useEffect } from 'react';
import { Trophy, Clock, Users, Ticket, CalendarPlus } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { api } from '../../services/api';
import { toast } from 'sonner';
import {
  diffDays, ProgressBar, StatusBadge,
  ModalAdicionarTemporada, ModalGerarCupons,
  Tab1TodasTemporadas, Tab2Progressao, Tab3Requisitos, Tab4Historico
} from '../components/seasons/SeasonsTabs';

interface TemporadasPageProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

export function TemporadasPage({ onNavigate, onLogout }: TemporadasPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [seasons, setSeasons] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [couponsData, setCouponsData] = useState<any[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [gerarCuponsTemporada, setGerarCuponsTemporada] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/seasons');
      setSeasons(res.data);
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

  const temporadaAtiva = useMemo(() => seasons.find(s => s.status === 'ativa'), [seasons]);

  const fetchProgress = async (id: string) => {
    try {
      const res = await api.get(`/admin/seasons/${id}/progress`);
      setProgressData(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    if (temporadaAtiva) fetchProgress(temporadaAtiva.id);
  }, [temporadaAtiva?.id]);

  const TABS = ['Todas as Temporadas', 'Progressão de Usuários', 'Requisitos e Recompensas', 'Histórico de Cupons'];

  const shortName = temporadaAtiva ? temporadaAtiva.name : '—';
  const dateRange = temporadaAtiva
    ? `${new Date(temporadaAtiva.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${new Date(temporadaAtiva.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : '—';

  const diasRestantes = temporadaAtiva ? Math.max(0, diffDays(temporadaAtiva.endDate, new Date())) : 0;
  const totalDias = temporadaAtiva ? Math.max(1, diffDays(temporadaAtiva.endDate, temporadaAtiva.startDate)) : 1;
  const decorridos = temporadaAtiva ? diffDays(new Date(), temporadaAtiva.startDate) : 0;
  const percentualDecorrido = Math.min(100, Math.max(0, Math.round((decorridos / totalDias) * 100)));
  const corUrgencia = diasRestantes <= 7 ? '#EF4444' : '#F97316';

  const usersEligible = progressData.filter(u => u.pct >= 100);

  return (
    <div className="flex h-screen bg-[#F5F5F7]">
      <Sidebar activePage="temporadas" onNavigate={onNavigate} onLogout={onLogout} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} onMenuToggle={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8">

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-black text-[28px]" style={{ color: '#04096D' }}>Temporadas</h1>
              <p className="text-[14px] mt-0.5 text-gray-500">Gerencie as temporadas e acompanhe a progressão dos usuários</p>
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 text-white text-[14px] font-bold transition-all hover:opacity-95 bg-[#04096D]" style={{ borderRadius: 10 }}>
              <CalendarPlus size={16} /> + Nova Temporada
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className="rounded-2xl p-5 text-white" style={{ background: '#04096D' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10">
                  <Trophy size={20} style={{ color: '#FBBC04' }} />
                </div>
                <span className="text-[12px] font-semibold text-white/70">Temporada Ativa</span>
              </div>
              <div className="text-[22px] font-black leading-tight">{shortName}</div>
              <div className="text-[12px] text-white/60 mt-0.5 mb-3">{dateRange}</div>
              {temporadaAtiva && <StatusBadge status="ativa" />}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-50"><Clock size={20} style={{ color: '#F97316' }} /></div>
                <span className="text-[12px] font-semibold text-gray-500">Dias Restantes</span>
              </div>
              <div className="text-[32px] font-black leading-tight" style={{ color: corUrgencia }}>{diasRestantes}</div>
              <ProgressBar value={percentualDecorrido} color="#F97316" height={6} />
              <div className="text-[11px] text-gray-400 mt-1">{percentualDecorrido}% decorrido</div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50"><Users size={20} style={{ color: '#22C55E' }} /></div>
                <span className="text-[12px] font-semibold text-gray-500">Usuários Elegíveis</span>
              </div>
              <div className="text-[32px] font-black leading-tight text-green-500">{usersEligible.length}</div>
              <div className="text-[12px] text-gray-400 mt-0.5 mb-2">completaram requisitos 100%</div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50"><Ticket size={20} style={{ color: '#04096D' }} /></div>
                <span className="text-[12px] font-semibold text-gray-500">Cupons Pendentes</span>
              </div>
              <div className="text-[32px] font-black leading-tight text-[#04096D]">{usersEligible.filter(u => !u.cupomEmitido).length}</div>
              <div className="text-[12px] text-gray-400 mt-0.5 mb-3">para gerar agora</div>
              <button
                onClick={() => setGerarCuponsTemporada(temporadaAtiva)}
                disabled={!temporadaAtiva}
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
                  onGerarCupons={(t: any) => setGerarCuponsTemporada(t)}
                />
              )}
              {activeTab === 1 && <Tab2Progressao progressData={progressData} />}
              {activeTab === 2 && <Tab3Requisitos temporadaAtiva={temporadaAtiva} />}
              {activeTab === 3 && <Tab4Historico couponsData={couponsData} />}
            </div>
          </div>
        </main>
      </div>

      <ModalAdicionarTemporada isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSalvar={fetchData} />
      <ModalGerarCupons isOpen={!!gerarCuponsTemporada} temporada={gerarCuponsTemporada} progressData={progressData} onClose={() => setGerarCuponsTemporada(null)} onSuccess={fetchCoupons} />
    </div>
  );
}