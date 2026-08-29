import { useState } from 'react';
import { X, AlertCircle, Ticket, Trophy, Star } from 'lucide-react';
import { api } from '../../../services/api';
import { toast } from 'sonner';

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
  ultragamer: '👑',
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
  5: 'Lenda'
};

export const SEASONAL_POINTS: Record<number, number> = {
  2: 100,
  3: 300,
  4: 700,
  5: 1500
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
      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
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
      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
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

export function ModalAdicionarTemporada({ isOpen, onClose, onSalvar }: any) {
  const [form, setForm] = useState({ nome: '', dataInicio: '', dataFim: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');

  if (!isOpen) return null;

  const getSuggestedName = (dateStr: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const s = month <= 3 ? 'S1' : month <= 6 ? 'S2' : month <= 9 ? 'S3' : 'S4';
    return `Temporada ${year} - ${s}`;
  };

  const handleDataInicioChange = (val: string) => {
    const suggested = getSuggestedName(val);
    setForm(f => ({ ...f, dataInicio: val, nome: f.nome || suggested }));
    setErrors(e => ({ ...e, dataInicio: '' }));
  };

  const getDurationDays = (): number | null => {
    if (!form.dataInicio || !form.dataFim) return null;
    return diffDays(new Date(form.dataFim), new Date(form.dataInicio));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.nome || form.nome.trim().length < 5) errs.nome = 'Nome deve ter no mínimo 5 caracteres';
    if (!form.dataInicio) errs.dataInicio = 'Data de início é obrigatória';
    if (!form.dataFim) errs.dataFim = 'Data de fim é obrigatória';
    const dur = getDurationDays();
    if (dur !== null && dur < 7) errs.dataFim = 'A temporada deve ter pelo menos 7 dias';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSalvar = async (overrideActive = false) => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await api.post('/admin/seasons', {
        nome: form.nome,
        dataInicio: new Date(form.dataInicio).toISOString(),
        dataFim: new Date(form.dataFim).toISOString(),
        overrideActive
      });
      toast.success("Temporada criada com sucesso!");
      onSalvar();
      onClose();
    } catch (e: any) {
      if (e.response?.data?.code === "ACTIVE_SEASON_EXISTS") {
        setConflictMessage(e.response.data.error);
        setShowConfirm(true);
      } else {
        toast.error("Erro ao criar temporada.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const duration = getDurationDays();

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center">
          <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
          <h2 className="text-xl font-black text-gray-900 mb-2">Atenção!</h2>
          <p className="text-sm text-gray-600 mb-6">{conflictMessage}</p>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowConfirm(false)} 
              className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => handleSalvar(true)} 
              disabled={isLoading} 
              className="flex-1 py-3 rounded-xl font-bold text-[#04096D] bg-[#FBBC04] hover:brightness-105 flex justify-center items-center transition-all disabled:opacity-50"
            >
              {isLoading ? 'Aguarde...' : 'Sim, Substituir'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 pt-6 pb-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #04096D, #31358B)' }}>
          <div>
            <h2 className="text-white font-black text-[18px]">Nova Temporada</h2>
            <p className="text-white/75 text-[13px] mt-0.5">Crie um novo ciclo de corrida por pontos</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/15 transition-colors">
            <X size={18} className="text-white" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {(form.nome || form.dataInicio) && (
            <div className="rounded-xl p-4 text-white" style={{ background: 'linear-gradient(135deg, #04096D, #31358B)' }}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1">Pré-visualização</div>
              <div className="font-black text-[15px]">{form.nome || ' '}</div>
              {form.dataInicio && form.dataFim && (
                <div className="text-[12px] text-white/80 mt-1">
                  {new Date(form.dataInicio).toLocaleDateString('pt-BR')} — {new Date(form.dataFim).toLocaleDateString('pt-BR')}
                  {duration !== null && duration > 0 && <span className="ml-2 text-white/60">({duration} dias)</span>}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Nome da Temporada</label>
            <input
              type="text" value={form.nome}
              onChange={e => { setForm(f => ({ ...f, nome: e.target.value })); setErrors(er => ({ ...er, nome: '' })); }}
              className="w-full px-3 py-2.5 rounded-xl border text-[13px] focus:outline-none transition-all"
              placeholder="Ex: Temporada 2026 - S3"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Data de Início</label>
              <input type="date" value={form.dataInicio} onChange={e => handleDataInicioChange(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border text-[13px] focus:outline-none transition-all" />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">Data de Fim</label>
              <input type="date" value={form.dataFim} onChange={e => setForm(f => ({ ...f, dataFim: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border text-[13px] focus:outline-none transition-all" />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-all">Cancelar</button>
          <button onClick={() => handleSalvar(false)} disabled={isLoading} className="flex-1 h-11 rounded-xl text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:opacity-95 disabled:opacity-60" style={{ background: '#04096D' }}>
            {isLoading ? <span className="animate-spin">⏳</span> : 'Salvar Temporada'}
          </button>
        </div>
      </div>
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
      valor: reward ? (reward.tipo === 'percentual' ? `${reward.valor}% OFF` : `R$ ${reward.valor} OFF`) : '--'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-[17px] font-black text-[#04096D]">
              Gerar Cupons — {temporada.name}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
            <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-blue-700">
              Esta ação irá gerar cupons para todos os usuários elegíveis de acordo com o <strong>Nível Sazonal</strong> que eles alcançaram.<br/>
              <strong>Total estimado: {elegiveis.length} cupons.</strong>
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-[12px]">
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

export function Tab1TodasTemporadas({ seasons, onGerarCupons }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide">Temporada</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide">Período</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
          </tr>
        </thead>
        <tbody>
          {seasons.map((t: any) => (
            <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
              <td className="px-4 py-3 font-semibold text-[#04096D]">{t.name}</td>
              <td className="px-4 py-3 text-gray-600">
                {new Date(t.startDate).toLocaleDateString('pt-BR')} — {new Date(t.endDate).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-3 flex gap-2">
                {t.status === 'ativa' && (
                  <button onClick={() => onGerarCupons(t)} className="w-8 h-8 rounded-lg bg-blue-50 text-[#04096D] flex items-center justify-center hover:bg-blue-100 transition"><Ticket size={14}/></button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Tab2Progressao({ progressData }: { progressData: any[] }) {
  const sortedData = [...progressData].sort((a, b) => b.avaliacoes - a.avaliacoes);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-gray-100">
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
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={u.nome} nivel={u.nivel as Nivel} />
                    <div>
                      <div className="font-semibold text-gray-900">{u.nome}</div>
                      <NivelBadge nivel={u.nivel as Nivel} />
                    </div>
                  </div>
                </td>
                
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 font-bold text-[#04096D]">
                    <Trophy size={14} className="text-[#FBBC04]" /> 
                    Nível {u.currentLevel} - {SEASONAL_LEVELS[u.currentLevel]}
                  </span>
                </td>

                <td className="px-4 py-3">
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

                <td className="px-4 py-3">
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
                <span className="text-[28px] leading-none">{level === 5 ? '👑' : '⭐'}</span>
                <div>
                  <div className={`font-black text-[18px] ${level === 5 ? 'text-white' : 'text-[#04096D]'}`}>
                    Nível {level} - {SEASONAL_LEVELS[level]}
                  </div>
                </div>
              </div>
              <div className={`font-black text-xl ${level === 5 ? 'text-white drop-shadow-md' : 'text-[#31358B]'}`}>
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
                   <span key={i} className="inline-block text-[12px] font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-[#04096D] border border-blue-100">
                      🎁 {cp.tipo === 'percentual' ? `${cp.valor}% OFF` : `R$${cp.valor} OFF`} - {cp.descricao}
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
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-gray-100">
            {['Usuário', 'Temporada', 'Nível Atingido', 'Código', 'Valor', 'Status'].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {couponsData.map((c) => (
            <tr key={c.id} className="border-b border-gray-50">
              <td className="px-4 py-3 font-semibold text-gray-900">{c.usuario}</td>
              <td className="px-4 py-3 text-gray-600">{c.temporada}</td>
              <td className="px-4 py-3">
                <span className="bg-[#F0F2FF] text-[#04096D] border border-[#31358B]/20 font-bold px-2 py-1 rounded-md text-[11px]">
                  {c.nivel}
                </span>
              </td>
              <td className="px-4 py-3"><code className="bg-gray-100 px-2 py-1 rounded-md font-mono">{c.codigo}</code></td>
              <td className="px-4 py-3 font-bold text-[#04096D]">{c.valor}</td>
              <td className="px-4 py-3">
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