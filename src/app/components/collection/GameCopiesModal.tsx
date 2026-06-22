import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import {
  X,
  Hash,
  AlertCircle,
  Trash2,
  Package,
  PackagePlus,
  Loader2,
  Info,
  Edit3,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface GameCopiesModalProps {
  isOpen: boolean;
  gameId: string;
  gameTitle: string;
  gameCover?: string | null;
  onClose: () => void;
}

interface ExistingCopy {
  id: string;
  number: number;
  code: string;
  condition: string | null;
  available: boolean;
  observations?: string | null; // Adicionado
  createdAt: string;
}

const CONDITION_OPTIONS = [
  'Novo (Lacrado)',
  'Ótimo (Como Novo)',
  'Bom (Marcas leves)',
  'Regular (Desgaste visível)',
  'Com Danos (Faltam peças)'
];

function StatusBadge({ available }: { available: boolean }) {
  if (available) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-200">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Disponível
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Indisponível / Manutenção
    </span>
  );
}

export function GameCopiesModal({ isOpen, gameId, gameTitle, gameCover, onClose }: GameCopiesModalProps) {
  const [copies, setCopies] = useState<ExistingCopy[]>([]);
  const [loadingCopies, setLoadingCopies] = useState(true);
  
  // Controle de Estado do Formulário
  const [editingCopy, setEditingCopy] = useState<ExistingCopy | null>(null);
  const [condition, setCondition] = useState(CONDITION_OPTIONS[0]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [observations, setObservations] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sincroniza os inputs quando entra no modo de edição
  useEffect(() => {
    if (editingCopy) {
      setCondition(editingCopy.condition || CONDITION_OPTIONS[0]);
      setIsAvailable(editingCopy.available);
      setObservations(editingCopy.observations || "");
    } else {
      setCondition(CONDITION_OPTIONS[0]);
      setIsAvailable(true);
      setObservations("");
    }
  }, [editingCopy]);

  useEffect(() => {
    if (isOpen && gameId) {
      fetchCopies();
      setEditingCopy(null); // Reseta o form ao abrir
    }
  }, [isOpen, gameId]);

  const fetchCopies = async () => {
    setLoadingCopies(true);
    try {
      const res = await api.get(`/games/${gameId}/copies`);
      setCopies(res.data);
    } catch (err) {
      toast.error("Erro ao carregar os exemplares deste jogo.");
    } finally {
      setLoadingCopies(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingCopy) {
        // Atualiza a cópia existente
        await api.patch(`/games/copies/${editingCopy.id}`, { 
          condition, 
          available: isAvailable, 
          observations 
        });
        toast.success(`Exemplar ${editingCopy.code} atualizado!`);
      } else {
        // Cria uma nova cópia
        await api.post(`/games/${gameId}/copies`, { condition });
        toast.success("Novo exemplar adicionado ao acervo!");
      }
      
      setEditingCopy(null);
      fetchCopies();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Erro ao processar a requisição.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCopy = async (copyId: string, copyCode: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir permanentemente o exemplar ${copyCode}?`)) return;
    
    try {
      await api.delete(`/games/copies/${copyId}`);
      toast.success("Exemplar removido com sucesso.");
      if (editingCopy?.id === copyId) setEditingCopy(null); // Cancela edição se apagou
      setCopies(prev => prev.filter(c => c.id !== copyId));
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.error("Este exemplar possui histórico de aluguel e não pode ser excluído.");
      } else {
        toast.error("Erro ao excluir exemplar.");
      }
    }
  };

  const handleClose = () => {
    setEditingCopy(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header do Modal */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
          <div>
            <h2 className="text-xl font-black text-[#31358B]">Gerenciar Exemplares</h2>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              Acervo físico de: <span className="text-[#31358B] font-bold">{gameTitle}</span>
            </p>
          </div>
          <button 
            onClick={handleClose} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-6">
          
          {/* Card de Contexto do Jogo */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex items-center gap-5">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center border border-gray-200">
              {gameCover ? (
                <img src={gameCover} alt={gameTitle} className="w-full h-full object-cover" />
              ) : (
                <Package size={32} className="text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-black text-[#31358B] text-xl">{gameTitle}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Package size={14} />
                  {copies.length} cópia(s) registradas
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* FORMULÁRIO DINÂMICO (NOVO OU EDITAR)                           */}
          {/* ============================================================== */}
          <div className={`bg-white border rounded-2xl shadow-sm p-6 relative overflow-hidden transition-colors ${editingCopy ? 'border-orange-200' : 'border-[#31358B]/10'}`}>
            <div className={`absolute top-0 left-0 w-1.5 h-full ${editingCopy ? 'bg-orange-500' : 'bg-[#FBBC04]'}`} />
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#31358B] text-base flex items-center gap-2">
                {editingCopy ? <Edit3 size={18} className="text-orange-500" /> : <PackagePlus size={18} />} 
                {editingCopy ? `Editando Exemplar: ${editingCopy.code}` : 'Cadastrar Nova Caixa'}
              </h3>
              
              {editingCopy && (
                <button 
                  onClick={() => setEditingCopy(null)}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 px-3 py-1.5 rounded-lg"
                >
                  Cancelar Edição
                </button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="flex flex-col md:flex-row gap-4">
                {/* Linha 1: Condição (Aparece nos dois modos) */}
                <div className="flex-[2] w-full">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                    Condição Física do Exemplar <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={condition}
                    onChange={e => setCondition(e.target.value)}
                    className="w-full bg-[#F0F2FF] border border-transparent focus:border-[#31358B]/30 rounded-xl px-4 py-3 outline-none text-[#222] font-semibold text-sm cursor-pointer"
                  >
                    {CONDITION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Linha 1: Disponibilidade (Aparece apenas na Edição) */}
                {editingCopy && (
                  <div className="flex-1 w-full bg-[#F7F8FF] border border-[#31358B]/10 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#31358B] block text-[13px]">Disponível?</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isAvailable} 
                        onChange={e => setIsAvailable(e.target.checked)} 
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#22C55E]"></div>
                    </label>
                  </div>
                )}
              </div>

              {/* Observações (Aparece apenas na Edição) */}
              {editingCopy ? (
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                    Observações / Motivo da Indisponibilidade <span className="text-gray-400 font-normal">(Opcional)</span>
                  </label>
                  <textarea
                    value={observations}
                    onChange={e => setObservations(e.target.value)}
                    placeholder="Ex: Faltam 2 dados amarelos. Enviado para reposição."
                    rows={2}
                    className="w-full bg-[#F0F2FF] border border-transparent focus:border-[#31358B]/30 rounded-xl px-4 py-3 outline-none text-[#222] font-medium text-sm resize-none"
                  />
                </div>
              ) : (
                <div className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5">
                  <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-800 font-medium leading-relaxed">
                    O sistema irá <span className="font-bold">gerar automaticamente</span> o número e o código patrimonial desta nova caixa.
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className={`w-full md:w-auto px-6 py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2 h-[46px] ${editingCopy ? 'bg-orange-500 hover:bg-orange-600' : 'bg-[#31358B] hover:bg-[#25286b]'}`}
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : (editingCopy ? <Edit3 size={18} /> : <PackagePlus size={18} />)}
                  {isSaving ? 'Salvando...' : (editingCopy ? 'Salvar Alterações' : 'Adicionar Exemplar')}
                </button>
              </div>

            </form>
          </div>

          {/* ============================================================== */}
          {/* TABELA DE CÓPIAS EXISTENTES                                    */}
          {/* ============================================================== */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-[#F7F8FF]">
              <h3 className="font-bold text-[#31358B] text-base">Inventário Físico</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-white">
                    <th className="text-left py-3 px-6 text-[12px] font-bold text-gray-500 uppercase">Cópia</th>
                    <th className="text-left py-3 px-6 text-[12px] font-bold text-gray-500 uppercase">Patrimônio</th>
                    <th className="text-left py-3 px-6 text-[12px] font-bold text-gray-500 uppercase">Status / Condição</th>
                    <th className="text-right py-3 px-6 text-[12px] font-bold text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingCopies ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <Loader2 className="animate-spin text-[#31358B] mx-auto mb-2" size={24} />
                        <p className="text-gray-500 font-medium">Buscando exemplares...</p>
                      </td>
                    </tr>
                  ) : copies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center">
                        <AlertCircle className="text-gray-400 mx-auto mb-2" size={32} />
                        <p className="text-gray-500 font-medium">Nenhum exemplar físico registrado.</p>
                      </td>
                    </tr>
                  ) : (
                    copies.map((copy) => (
                      <tr key={copy.id} className={`border-b border-gray-50 hover:bg-gray-50/80 transition-colors ${editingCopy?.id === copy.id ? 'bg-orange-50/30' : 'bg-white'}`}>
                        
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 font-black text-[#31358B] bg-[#F0F2FF] px-2.5 py-1 rounded-lg">
                            <Hash size={14} className="text-[#31358B]/50" />
                            {copy.number}
                          </span>
                        </td>
                        
                        <td className="py-4 px-6">
                          <span className="font-mono font-bold text-[13px] text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                            {copy.code}
                          </span>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1.5 items-start">
                            <StatusBadge available={copy.available} />
                            <span className="text-gray-600 font-medium text-[12px]">
                              {copy.condition || 'Não informada'}
                            </span>
                            {copy.observations && (
                              <div className="flex items-start gap-1 mt-1 bg-yellow-50 text-yellow-800 px-2 py-1 rounded border border-yellow-100 max-w-[250px]">
                                <FileText size={12} className="mt-0.5 flex-shrink-0" />
                                <span className="text-[11px] leading-tight line-clamp-2" title={copy.observations}>
                                  {copy.observations}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-1">
                            <button 
                              onClick={() => {
                                setEditingCopy(copy);
                                // Scroll suave pro topo pra ver o formulário
                                document.querySelector('.overflow-y-auto')?.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`p-2 rounded-lg transition-colors ${editingCopy?.id === copy.id ? 'bg-orange-100 text-orange-600' : 'hover:bg-blue-50 text-gray-400 hover:text-blue-600'}`}
                              title="Editar Cópia"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCopy(copy.id, copy.code)}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" 
                              title="Excluir Cópia"
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
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}