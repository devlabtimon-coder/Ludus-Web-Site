import { useState, useEffect } from 'react';
import { X, Save, Gift, Loader2 } from 'lucide-react';
import { api } from '../../../services/api';
import { toast } from 'sonner';

const LEVELS = [2, 3, 4, 5];

const DEFAULT_REWARDS = LEVELS.reduce((acc, lvl) => {
  acc[`nivel${lvl}`] = { tipo: 'percentual', valor: '', descricao: '' };
  return acc;
}, {} as any);

export function ModalGerenciarTemporada({ isOpen, onClose, onSalvar, season }: any) {
  const [form, setForm] = useState({ nome: '', dataInicio: '', dataFim: '' });
  const [rewards, setRewards] = useState(DEFAULT_REWARDS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (season) {
        setForm({
          nome: season.name || '',
          dataInicio: season.startDate ? season.startDate.split('T')[0] : '',
          dataFim: season.endDate ? season.endDate.split('T')[0] : '',
        });

        const mappedRewards = { ...DEFAULT_REWARDS };
        LEVELS.forEach((lvl) => {
          const r = season.rewards?.[`nivel${lvl}`]?.cuponsGerados?.[0];
          if (r) {
            mappedRewards[`nivel${lvl}`] = {
              tipo: r.tipo,
              valor: String(r.valor),
              descricao: r.descricao,
            };
          }
        });
        setRewards(mappedRewards);
      } else {
        setForm({ nome: '', dataInicio: '', dataFim: '' });
        setRewards(DEFAULT_REWARDS);
      }
    }
  }, [isOpen, season]);

  if (!isOpen) return null;

  const updateReward = (level: number, field: string, value: string) => {
    setRewards((prev: any) => ({
      ...prev,
      [`nivel${level}`]: { ...prev[`nivel${level}`], [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.dataInicio || !form.dataFim) {
      return toast.error("Preencha o nome e as datas da temporada.");
    }

    setLoading(true);

    const formattedRewards: any = {};
    LEVELS.forEach((lvl) => {
      const rw = rewards[`nivel${lvl}`];
      if (rw.valor && rw.descricao) {
        formattedRewards[`nivel${lvl}`] = {
          cuponsGerados: [
            {
              tipo: rw.tipo,
              valor: Number(rw.valor),
              descricao: rw.descricao,
            },
          ],
        };
      }
    });

    try {
      const payload = {
        nome: form.nome,
        dataInicio: new Date(`${form.dataInicio}T00:00:00-03:00`).toISOString(),
        dataFim: new Date(`${form.dataFim}T23:59:59-03:00`).toISOString(),
        recompensas: formattedRewards,
      };

      if (season) {
        await api.patch(`/admin/seasons/${season.id}`, payload);
        toast.success("Temporada atualizada com sucesso!");
      } else {
        await api.post("/admin/seasons", payload);
        toast.success("Nova temporada criada!");
      }

      onSalvar();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao salvar a temporada.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#04096D]/10 p-2.5 rounded-xl">
              <Gift size={22} className="text-[#04096D]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#04096D]">
                {season ? "Editar Temporada" : "Nova Temporada"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Configure as regras e recompensas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="season-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Informações Básicas</h3>
              
              <div>
                <label className="text-sm font-bold text-gray-700">Nome da Temporada</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Temporada de Férias 2026"
                  className="w-full mt-1.5 bg-[#F7F8FF] border border-transparent focus:border-[#04096D]/30 rounded-xl px-4 py-3 outline-none text-[#222] font-semibold text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700">Data de Início</label>
                  <input
                    type="date"
                    value={form.dataInicio}
                    onChange={(e) => setForm({ ...form, dataInicio: e.target.value })}
                    className="w-full mt-1.5 bg-[#F7F8FF] border border-transparent focus:border-[#04096D]/30 rounded-xl px-4 py-3 outline-none text-[#222] font-semibold text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">Data de Encerramento</label>
                  <input
                    type="date"
                    value={form.dataFim}
                    onChange={(e) => setForm({ ...form, dataFim: e.target.value })}
                    className="w-full mt-1.5 bg-[#F7F8FF] border border-transparent focus:border-[#04096D]/30 rounded-xl px-4 py-3 outline-none text-[#222] font-semibold text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Recompensas por Nível</h3>
              
              {LEVELS.map((lvl) => {
                const rw = rewards[`nivel${lvl}`];
                return (
                  <div key={lvl} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#FBBC04]" />
                    <h4 className="font-bold text-[#04096D] mb-3 text-sm flex items-center gap-2">
                      Desbloqueio do Nível {lvl}
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600">Descrição Visual (App)</label>
                        <input
                          type="text"
                          value={rw.descricao}
                          onChange={(e) => updateReward(lvl, "descricao", e.target.value)}
                          placeholder="Ex: 15% OFF em qualquer aluguel"
                          className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none text-[#222] text-sm"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-600">Tipo de Recompensa</label>
                          <select
                            value={rw.tipo}
                            onChange={(e) => updateReward(lvl, "tipo", e.target.value)}
                            className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none text-[#222] text-sm cursor-pointer"
                          >
                            <option value="percentual">Percentual (%)</option>
                            <option value="fixo">Valor Fixo (R$)</option>
                            <option value="brinde">Vale-Brinde (Item Físico)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600">
                            {rw.tipo === 'brinde' ? 'Quantidade (Itens)' : 'Valor Numérico'}
                          </label>
                          <input
                            type="number"
                            value={rw.valor}
                            onChange={(e) => updateReward(lvl, "valor", e.target.value)}
                            placeholder={rw.tipo === 'percentual' ? "Ex: 15" : rw.tipo === 'fixo' ? "Ex: 10" : "Ex: 1"}
                            className="w-full mt-1 bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none text-[#222] text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3.5 rounded-xl transition text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="season-form"
            disabled={loading}
            className="flex-[2] flex items-center justify-center gap-2 bg-[#04096D] hover:bg-[#070e99] text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-[#04096D]/20 disabled:opacity-60 text-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? 'Salvando...' : 'Salvar Temporada'}
          </button>
        </div>

      </div>
    </div>
  );
}