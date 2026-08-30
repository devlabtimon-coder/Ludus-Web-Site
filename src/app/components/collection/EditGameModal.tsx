import { useState, useEffect, useRef } from 'react';
import { api } from '../../../services/api';
import { Game, GameTier } from '../../../types/api';
import { X, Trash2, Save, Package, RefreshCw, Loader2, Tags, ChevronDown } from 'lucide-react';
import { GameComponentsModal } from './GameComponentsModal';
import { useMechanics } from '../../../hooks/useMechanics';
import { toast } from 'sonner';

interface EditGameModalProps {
  game: Game | null;
  onClose: () => void;
  onSaved: () => void;
}

const TIERS: { value: GameTier; label: string; color: string }[] = [
  { value: "LATAO", label: "Latão", color: "#8B7355" },
  { value: "BRONZE", label: "Bronze", color: "#CD7F32" },
  { value: "PRATA", label: "Prata", color: "#A0A0A0" },
  { value: "OURO", label: "Ouro", color: "#FFD700" },
  { value: "DIAMANTE", label: "Diamante", color: "#4FC3F7" },
];

export function EditGameModal({ game, onClose, onSaved }: EditGameModalProps) {
  const { mechanics: dbMechanics, loading: loadingAllMechanics } = useMechanics();
  
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [tier, setTier] = useState<GameTier>("BRONZE");
  const [available, setAvailable] = useState(true);
  const [description, setDescription] = useState("");
  const [howToPlayUrl, setHowToPlayUrl] = useState("");
  
  const [mechanicsInput, setMechanicsInput] = useState("");
  const [mechanicsList, setMechanicsList] = useState<string[]>([]);
  const [showMechanicsDropdown, setShowMechanicsDropdown] = useState(false);
  
  const [isComponentsOpen, setIsComponentsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingMechanics, setIsSyncingMechanics] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (game) {
      setTitle(game.title || "");
      setPrice(String(game.price || ""));
      setTier(game.tier || "BRONZE");
      setAvailable(game.available !== false);
      setDescription(game.description || "");
      setHowToPlayUrl(game.howToPlayUrl || "");

      const gameMechanics = (game as any).mechanics || [];
      const parsedMechanics = gameMechanics.map((m: any) => typeof m === 'string' ? m : m.namePt || m.name);
      setMechanicsList(parsedMechanics);
    }
  }, [game]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMechanicsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async () => {
    if (!game) return;
    setLoading(true);
    try {
      const numPrice = parseFloat(price.replace(',', '.'));
      
      await api.patch(`/games/${game.id}`, {
        title,
        price: isNaN(numPrice) ? 0 : numPrice,
        available,
        description,
        howToPlayUrl
      });

      if (tier !== game.tier) {
        await api.patch(`/categories/games/${game.id}/tier`, { tier });
      }

      const validMechanics = mechanicsList.map(m => m.trim()).filter(Boolean);
      await api.put(`/games/${game.id}/mechanics`, { mechanics: validMechanics });

      toast.success("Jogo atualizado com sucesso!");
      onSaved();
      onClose();
    } catch (e) {
      toast.error("Erro ao salvar jogo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!game) return;
    if (window.confirm(`Tem certeza que deseja excluir "${game.title}"?`)) {
      setLoading(true);
      try {
        await api.delete(`/games/${game.id}`);
        toast.success("Jogo excluído.");
        onSaved();
        onClose();
      } catch (e) {
        toast.error("Erro ao excluir jogo.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRefetchDescription = async () => {
    if (!game) return;
    setIsSyncing(true);
    try {
      const res = await api.post(`/games/${game.id}/sync-description`);
      
      if (res.data?.description) {
        setDescription(res.data.description);
        toast.success("Tradução refeita! Edite o que precisar e clique em Salvar.");
      } else {
        toast.info("Nenhuma descrição encontrada na BGG/Ludopedia.");
      }
    } catch (e) {
      toast.error("Erro ao puxar dados externos.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncMechanics = async () => {
    if (!game) return;
    setIsSyncingMechanics(true);
    try {
      const res = await api.post(`/games/${game.id}/sync-mechanics`);
      toast.success("Mecânicas sincronizadas com sucesso!");
      
      if (res.data && res.data.mechanics) {
         const newMechanics = res.data.mechanics.map((m: any) => typeof m === 'string' ? m : m.namePt || m.name);
         setMechanicsList(newMechanics);
      } else {
         onSaved();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Erro ao puxar mecânicas.");
    } finally {
      setIsSyncingMechanics(false);
    }
  };

  const addMechanic = (mechanic: string) => {
    const val = mechanic.trim();
    if (val && !mechanicsList.includes(val)) {
      setMechanicsList([...mechanicsList, val]);
    }
    setMechanicsInput("");
    setShowMechanicsDropdown(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMechanic(mechanicsInput);
    }
  };

  const removeMechanic = (mechanicToRemove: string) => {
    setMechanicsList(mechanicsList.filter(m => m !== mechanicToRemove));
  };

  const allMechanics = dbMechanics.map(m => m.namePt || m.name).filter(Boolean) as string[];

  const filteredMechanics = allMechanics.filter(m => 
    m && typeof m === 'string' &&
    m.toLowerCase().includes(mechanicsInput.toLowerCase()) && 
    !mechanicsList.includes(m)
  );

  if (!game) return null;

  return (
    <>
      <div className="fixed inset-0 z-[50] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-[24px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#31358B]">Editar Jogo</h2>
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">{game.title}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-bold text-[#31358B]">Título do Jogo</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#F0F2FF] rounded-xl px-4 py-3 outline-none text-[#222] font-semibold focus:ring-2 focus:ring-[#31358B]/20 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#31358B]">Preço (R$/dia)</label>
                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-[#F0F2FF] rounded-xl px-4 py-3 outline-none text-[#222] font-semibold focus:ring-2 focus:ring-[#31358B]/20 transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#31358B]">Categoria (Tier)</label>
              <div className="flex flex-wrap gap-2">
                {TIERS.map(t => (
                  <button key={t.value} onClick={() => setTier(t.value)} className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${tier === t.value ? 'text-white' : 'bg-transparent hover:bg-gray-50'}`} style={{ backgroundColor: tier === t.value ? t.color : 'transparent', borderColor: t.color, color: tier === t.value ? '#fff' : t.color }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <div className="bg-[#F7F8FF] p-4 rounded-xl flex items-center justify-between border border-[#31358B]/10">
                <span className="font-bold text-[#31358B]">Disponível para Aluguel</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={available} onChange={e => setAvailable(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#31358B]">Vídeo Tutorial (URL)</label>
                <input type="text" value={howToPlayUrl} onChange={e => setHowToPlayUrl(e.target.value)} placeholder="https://youtube.com/..." className="w-full bg-[#F0F2FF] rounded-xl px-4 py-3 outline-none text-[#222] font-semibold text-sm focus:ring-2 focus:ring-[#31358B]/20 transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#31358B]">Descrição</label>
                
                <button 
                  onClick={handleRefetchDescription}
                  disabled={isSyncing}
                  className="text-[12px] font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
                >
                  {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {isSyncing ? "Buscando..." : "Refazer Tradução"}
                </button>
              </div>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={4} 
                className="w-full bg-[#F0F2FF] rounded-xl px-4 py-3 outline-none text-[#222] font-medium resize-none leading-relaxed focus:ring-2 focus:ring-[#31358B]/20 transition-all" 
                placeholder="Escreva sobre o jogo..." 
              />
            </div>

            <div className="space-y-3 bg-[#F9FAFB] p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tags size={18} className="text-[#31358B]" />
                  <label className="text-sm font-bold text-[#31358B]">Mecânicas</label>
                </div>
                
                <button 
                  onClick={handleSyncMechanics} 
                  disabled={isSyncingMechanics}
                  className="text-[12px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg disabled:opacity-50"
                >
                  {isSyncingMechanics ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {isSyncingMechanics ? "Sincronizando..." : "Sincronizar (Ludopedia)"}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
                {mechanicsList.length === 0 ? (
                  <span className="text-sm text-gray-400 italic">Nenhuma mecânica vinculada.</span>
                ) : (
                  mechanicsList.map((mech, index) => (
                    <div key={index} className="flex items-center gap-1.5 bg-[#E2E6FF] text-[#31358B] px-3 py-1.5 rounded-lg text-sm font-bold border border-[#31358B]/10">
                      {mech}
                      <button onClick={() => removeMechanic(mech)} className="text-[#31358B]/60 hover:text-[#31358B] transition-colors ml-1">
                        <X size={14} strokeWidth={3} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <input 
                    type="text" 
                    value={mechanicsInput} 
                    onChange={e => {
                      setMechanicsInput(e.target.value);
                      setShowMechanicsDropdown(true);
                    }} 
                    onFocus={() => setShowMechanicsDropdown(true)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Selecione ou digite uma mecânica..." 
                    className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 outline-none text-[#222] font-semibold text-sm focus:ring-2 focus:ring-[#31358B]/20 transition-all" 
                  />
                  <div 
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                    onClick={() => setShowMechanicsDropdown(!showMechanicsDropdown)}
                  >
                    <ChevronDown size={18} />
                  </div>
                </div>

                {showMechanicsDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {loadingAllMechanics ? (
                      <div className="px-4 py-3 text-sm text-gray-500 italic flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" /> Carregando dicionário...
                      </div>
                    ) : filteredMechanics.length > 0 ? (
                      filteredMechanics.map((mech, idx) => (
                        <div 
                          key={idx}
                          className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors border-b border-gray-50 last:border-none"
                          onClick={() => addMechanic(mech)}
                        >
                          {mech}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 italic">
                        {mechanicsInput ? `Pressione Enter para adicionar "${mechanicsInput}"` : "Nenhuma mecânica no dicionário"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-1">
              <button onClick={() => setIsComponentsOpen(true)} className="w-full flex items-center justify-between bg-[#FBBC04] p-4 rounded-xl font-bold text-[#31358B] hover:brightness-105 transition shadow-sm">
                <span className="flex items-center gap-2"><Package size={20} /> Gerenciar Componentes Físicos</span>
                <span>&rarr;</span>
              </button>
            </div>
            
          </div>

          <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50">
            <button onClick={handleDelete} disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-3.5 rounded-xl transition disabled:opacity-50">
              <Trash2 size={18}/> Excluir
            </button>
            <button onClick={handleSave} disabled={loading} className="flex-[2] flex items-center justify-center gap-2 bg-[#31358B] hover:bg-[#25286b] text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 shadow-lg shadow-[#31358B]/20">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18}/>} 
              {loading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>

      <GameComponentsModal isOpen={isComponentsOpen} gameId={game.id} gameTitle={game.title} onClose={() => setIsComponentsOpen(false)} />
    </>
  );
}