import { useState } from 'react';
import { X, AlertCircle, Ticket, Trophy, Star, Edit, Trash2 } from 'lucide-react';
import { api } from '../../../services/api';
import { toast } from 'sonner';
import { ModalGerenciarTemporada } from './ModalGerenciarTemporada';

export const NIVEL_ORDER = ['starter', 'family', 'expert', 'ultragamer'] as const;
export type Nivel = typeof NIVEL_ORDER[number];

export const NIVEL_LABELS: Record<Nivel, string> = {
  starter: 'Starter',
  family: 'Family',
  expert: 'Expert',
  ultragamer: 'Ultragamer',
};

export const NIVEL_EMOJIS: Record<Nivel, string> = {
  starter: '🌱',
  family: '🏠',
  expert: '⚔️',
  ultragamer: '💎',
};

export const NIVEL_COLORS: Record<Nivel, { bg: string; text: string; border: string; primary: string }> = {
  starter: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', primary: '#10B981' },
  family: { bg: '#FEF9C3', text: '#854D0E', border: '#FDE047', primary: '#FBBC04' },
  expert: { bg: '#F5F3FF', text: '#31358B', border: '#DDD6FE', primary: '#31358B' },
  ultragamer: { bg: '#EEF0FF', text: '#04096D', border: '#C7D2FE', primary: '#04096D' },
};

export const SEASONAL_LEVELS: Record<number, string> = {
  1: 'Iniciante',
  2: 'Explorador',
  3: 'Estrategista',
  4: 'Campeão',
  5: 'Lenda',
};

export const SEASONAL_POINTS: Record<number, number> = {
  2: 100,
  3: 300,
  4: 700,
  5: 1500,
};

export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  ativa: { label: 'Ativa', bg: '#DCFCE7', text: '#15803D' },
  proxima: { label: 'Próxima', bg: '#EEF2FF', text: '#4338CA' },
  encerrada: { label: 'Encerrada', bg: '#F3F4F6', text: '#6B7280' },
};

export function diffDays(d1: Date | string, d2: Date | string) {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const diffTime = date1.getTime() - date2.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function ProgressBar({ value, color, height = 6 }: { value: number; color: string; height?: number }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: '#F3F4F6' }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.encerrada;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      {status === 'ativa' && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#22C55E' }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#22C55E' }} />
        </span>
      )}
      {cfg.label}
    </span>
  );
}

export function NivelBadge({ nivel }: { nivel: Nivel }) {
  const c = NIVEL_COLORS[nivel] || NIVEL_COLORS.starter;
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {NIVEL_EMOJIS[nivel]} {NIVEL_LABELS[nivel]}
    </span>
  );
}

export function Avatar({ name, nivel }: { name: string; nivel: Nivel }) {
  const c = NIVEL_COLORS[nivel] || NIVEL_COLORS.starter;
  const initials = name ? name.split(' ').slice(0, 2).map(n => n[0]).join('') : '?';
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
      style={{ background: c.bg, color: c.text }}
    >
      {initials}
    </div>
  );
}

export function ModalGerarCupons({ isOpen, onClose, temporada, progressData, onSuccess }: any) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !temporada) return null;

  const elegiveis = progressData.filter((u: any) => u.currentLevel >= 2 && !u.cupomEmitido);
  const breakdown = [2, 3, 4, 5].map(level => {
    const usersInLevel = elegiveis.filter((u: any) => u.currentLevel === level);
    const reward = temporada.rewards?.[`nivel${level}`]?.cuponsGerados?.[0];
    
    return {
      nivel: `Nível ${level} - ${SEASONAL_LEVELS[level]}`,
      usuarios: usersInLevel.length,
      cupons: usersInLevel.length,
      valor: reward ? (reward.tipo === 'percentual' ? `${reward.valor}% OFF` : reward.tipo === 'fixo' ? `R$ ${reward.valor} OFF` : '🎁 Vale-Brinde') : '--'
    };
  }).filter(row => row.usuarios > 0);

  const handleGerar = async () => {
    setIsLoading(true);
    try {
      const userIds = elegiveis.map((u: any) => u.id);
      const res = await api.post(`/admin/seasons/${temporada.id}/generate-coupons`, { eligibleUserIds: userIds });
      toast.success(res.data.message);
      onSuccess();
      onClose();
    } catch (e) {
      toast.error("Erro ao gerar cupons.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-t-[24px] sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-[17px] font-black text-[#04096D] truncate pr-2">
            Gerar Cupons - {temporada.name}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
            <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-blue-700">
              Esta ação irá gerar cupons para todos os usuários elegíveis de acordo com o <strong>Nível Sazonal</strong> alcançado.<br/>
              <strong>Total estimado: {elegiveis.length} cupons.</strong>
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-[12px] min-w-[300px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2 text-gray-500 font-semibold">Nível Atingido</th>
                    <th className="text-right px-3 py-2 text-gray-500 font-semibold">Usuários</th>
                    <th className="text-right px-3 py-2 text-gray-500 font-semibold">Recompensa</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-4 text-gray-500">Nenhum usuário elegível.</td></tr>
                  ) : (
                    breakdown.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-3 py-2 font-semibold text-gray-700">{row.nivel}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{row.usuarios}</td>
                        <td className="px-3 py-2 text-right font-bold" style={{ color: '#04096D' }}>{row.valor}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-all">Cancelar</button>
          <button 
            onClick={handleGerar}
            disabled={elegiveis.length === 0 || isLoading}
            className="flex-1 h-11 rounded-xl text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:opacity-95 disabled:opacity-50"
            style={{ background: '#04096D' }}
          >
            {isLoading ? <span className="animate-spin">⏳</span> : <Ticket size={15} />}
            Confirmar e Gerar
          </button>
        </div>
      </div>
    </div>
  );
}

export function Tab1TodasTemporadas({ seasons, onGerarCupons, fetchSeasons }: any) {
  const [modalOpen, setModalOpen] = useState(false);
  const [seasonEdit, setSeasonEdit] = useState<any>(null);

  const openEdit = (season: any) => {
    setSeasonEdit(season);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a temporada "${name}"?`)) {
      try {
        await api.delete(`/admin/seasons/${id}`);
        toast.success("Temporada excluída com sucesso.");
        if (fetchSeasons) fetchSeasons();
      } catch (err: any) {
        toast.error("Erro ao excluir a temporada.");
      }
    }
  };

  return (
    <div className="overflow-x-auto scrollbar-hide rounded-xl border border-gray-100">
      <table className="w-full text-[13px] min-w-[600px] text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide">Temporada</th>
            <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide">Período</th>
            <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th className="px-4 py-3 font-semibold text-gray-500 uppercase tracking-wide text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {seasons.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-500 font-medium text-sm">
                Nenhuma temporada cadastrada.
              </td>
            </tr>
          ) : (
            seasons.map((t: any) => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 bg-white">
                <td className="px-4 py-3 font-semibold text-[#04096D]">{t.name}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {new Date(t.startDate).toLocaleDateString('pt-BR')} até {new Date(t.endDate).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {t.status === 'ativa' && (
                      <button 
                        onClick={() => onGerarCupons(t)} 
                        className="px-3 py-1.5 bg-[#04096D]/10 hover:bg-[#04096D]/20 text-[#04096D] rounded-lg text-xs font-bold transition-colors" 
                        title="Gerar Cupons"
                      >
                        Gerar Cupons
                      </button>
                    )}
                    
                    <button
                      onClick={() => openEdit(t)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar Temporada"
                    >
                      <Edit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(t.id, t.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir Temporada"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <ModalGerenciarTemporada 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSalvar={fetchSeasons} 
        season={seasonEdit} 
      />
    </div>
  );
}

export function Tab2Progressao({ progressData }: { progressData: any[] }) {
  const sortedData = [...progressData].sort((a, b) => b.avaliacoes - a.avaliacoes);
  return (
    <div className="overflow-x-auto scrollbar-hide rounded-xl border border-gray-100">
      <table className="w-full text-[13px] min-w-[700px]">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Usuário</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Nível Sazonal</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Pontos na Temporada</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Progresso p/ Lenda</th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">Cupom</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map(u => {
            const pontos = u.avaliacoes || 0;
            const pctColor = u.pct >= 100 ? '#22C55E' : u.pct >= 50 ? '#F97316' : '#31358B';
            return (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 bg-white">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={u.nome} nivel={u.nivel as Nivel} />
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate max-w-[140px]">{u.nome}</div>
                      <NivelBadge nivel={u.nivel as Nivel} />
                    </div>
                  </div>
                </td>
                
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="flex items-center gap-1.5 font-bold text-[#04096D]">
                    <Trophy size={14} className="text-[#FBBC04]" /> 
                    Nível {u.currentLevel} - {SEASONAL_LEVELS[u.currentLevel]}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="flex items-center gap-1.5 font-bold text-gray-700">
                    <Star size={14} className="text-[#04096D] opacity-50" /> 
                    {pontos} pts
                  </span>
                </td>
                <td className="px-4 py-3 min-w-[150px]">
                  <div className="flex items-center gap-3">
                    <ProgressBar value={u.pct} color={pctColor} height={8} />
                    <span className="font-black text-[12px]" style={{ color: pctColor }}>{u.pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {u.cupomEmitido ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700">Emitido</span>
                  ) : (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Pendente</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Tab3Requisitos({ temporadaAtiva }: { temporadaAtiva: any }) {
  const levels = [2, 3, 4, 5];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {levels.map(level => {
        const levelKey = `nivel${level}`;
        const rec = temporadaAtiva?.rewards?.[levelKey] || {};
        const pontuacaoNecessaria = SEASONAL_POINTS[level] || 0;
        
        return (
          <div key={level} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: level === 5 ? 'linear-gradient(135deg, #04096D, #FBBC04)' : '#F7F8FF' }}>
              <div className="flex items-center gap-3">
                <span className="text-[24px] leading-none">{level === 5 ? '👑' : '⭐'}</span>
                <div>
                  <div className={`font-black text-base sm:text-lg ${level === 5 ? 'text-white' : 'text-[#04096D]'}`}>
                    Nível {level} - {SEASONAL_LEVELS[level]}
                  </div>
                </div>
              </div>
              <div className={`font-black text-lg sm:text-xl ${level === 5 ? 'text-white drop-shadow-md' : 'text-[#31358B]'}`}>
                {pontuacaoNecessaria} pts
              </div>
            </div>
            
            <div className="px-5 py-5 space-y-3">
              <p className="text-sm font-semibold text-gray-600">
                <strong>Meta:</strong> Acumular <span className="text-[#04096D]">{pontuacaoNecessaria} pontos</span> durante o período vigente da temporada através de aluguéis e devoluções no prazo.
              </p>
              
              <hr className="border-gray-100"/>
              
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Recompensa</p>
                {rec.cuponsGerados?.map((cp: any, i: number) => (
                   <span key={i} className="inline-block text-[12px] font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-[#04096D] border border-blue-100 mr-2 mb-2">
                        {cp.tipo === 'percentual' ? `${cp.valor}% OFF` : cp.tipo === 'fixo' ? `R$${cp.valor} OFF` : '🎁 Vale-Brinde'} - {cp.descricao}
                   </span>
                ))}
                {!rec.cuponsGerados && (
                  <span className="text-sm text-gray-400 italic">Sem recompensas cadastradas.</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Tab4Historico({ couponsData }: { couponsData: any[] }) {
  return (
    <div className="overflow-x-auto scrollbar-hide rounded-xl border border-gray-100">
      <table className="w-full text-[13px] min-w-[700px]">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {['Usuário', 'Temporada', 'Nível Atingido', 'Código', 'Valor', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {couponsData.map((c) => (
            <tr key={c.id} className="border-b border-gray-50 bg-white">
              <td className="px-4 py-3 font-semibold text-gray-900">{c.usuario}</td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{c.temporada}</td>
              <td className="px-4 py-3">
                <span className="bg-[#F0F2FF] text-[#04096D] border border-[#31358B]/20 font-bold px-2 py-1 rounded-md text-[11px] whitespace-nowrap">
                  {c.nivel}
                </span>
              </td>
              <td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded-md font-mono text-xs">{c.codigo}</code></td>
              <td className="px-4 py-3 font-bold text-[#04096D] whitespace-nowrap">{c.valor}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${c.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.status.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}