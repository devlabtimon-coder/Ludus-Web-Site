import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { Game, GameTier } from '../../../types/api';
import { X, Trash2, Save, Package, RefreshCw, Loader2 } from 'lucide-react';
import { GameComponentsModal } from './GameComponentsModal';
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
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [tier, setTier] = useState<GameTier>("BRONZE");
  const [available, setAvailable] = useState(true);
  const [description, setDescription] = useState("");
  const [howToPlayUrl, setHowToPlayUrl] = useState("");
  
  const [isComponentsOpen, setIsComponentsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingMechanics, setIsSyncingMechanics] = useState(false); // 👈 Novo estado para as mecânicas

  useEffect(() => {
    if (game) {
      setTitle(game.title || "");
      setPrice(String(game.price || ""));
      setTier(game.tier || "BRONZE");
      setAvailable(game.available !== false);
      setDescription(game.description || "");
      setHowToPlayUrl(game.howToPlayUrl || "");
    }
  }, [game]);

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
      toast.error("Erro ao puxar dados externos. Verifique se a API externa está respondendo.");
    } finally {
      setIsSyncing(false);
    }
  };

  // 👇 NOVA FUNÇÃO: Sincronizar Mecânicas
  const handleSyncMechanics = async () => {
    if (!game) return;
    setIsSyncingMechanics(true);
    try {
      await api.post(`/games/${game.id}/sync-mechanics`);
      toast.success("Mecânicas sincronizadas com sucesso!");
      onSaved(); // Força a atualização da lista por trás do modal, se necessário
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Erro ao puxar mecânicas. Este jogo tem ID da Ludopedia?");
    } finally {
      setIsSyncingMechanics(false);
    }
  };

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

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Título e Preço */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-bold text-[#31358B]">Título do Jogo</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-[#F0F2FF] rounded-xl px-4 py-3 outline-none text-[#222] font-semibold" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#31358B]">Preço (R$/dia)</label>
                <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-[#F0F2FF] rounded-xl px-4 py-3 outline-none text-[#222] font-semibold" />
              </div>
            </div>

            {/* Tier */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#31358B]">Categoria (Tier)</label>
              <div className="flex flex-wrap gap-2">
                {TIERS.map(t => (
                  <button key={t.value} onClick={() => setTier(t.value)} className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all ${tier === t.value ? 'text-white' : 'bg-transparent'}`} style={{ backgroundColor: tier === t.value ? t.color : 'transparent', borderColor: t.color, color: tier === t.value ? '#fff' : t.color }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Switch e URL */}
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
                <input type="text" value={howToPlayUrl} onChange={e => setHowToPlayUrl(e.target.value)} placeholder="https://youtube.com/..." className="w-full bg-[#F0F2FF] rounded-xl px-4 py-3 outline-none text-[#222] font-semibold text-sm" />
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#31358B]">Descrição</label>
                
                <button 
                  onClick={handleRefetchDescription}
                  disabled={isSyncing}
                  className="text-[12px] font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
                  title="Tentar puxar a tradução novamente da BGG/Ludopedia"
                >
                  {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  {isSyncing ? "Buscando..." : "Refazer Tradução"}
                </button>
              </div>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={5} 
                className="w-full bg-[#F0F2FF] rounded-xl px-4 py-3 outline-none text-[#222] font-medium resize-none leading-relaxed" 
                placeholder="Escreva sobre o jogo..." 
              />
            </div>

            {/* Componentes e Mecânicas */}
            <div className="space-y-3 pt-2">
              <button onClick={() => setIsComponentsOpen(true)} className="w-full flex items-center justify-between bg-[#FBBC04] p-4 rounded-xl font-bold text-[#31358B] hover:brightness-105 transition">
                <span className="flex items-center gap-2"><Package size={20} /> Gerenciar Componentes</span>
                <span>&rarr;</span>
              </button>

              {/* 👇 NOVO BOTÃO: SINCRONIZAR MECÂNICAS 👇 */}
              <button 
                onClick={handleSyncMechanics} 
                disabled={isSyncingMechanics}
                className="w-full flex items-center justify-center bg-[#F0F2FF] border border-[#31358B]/10 p-4 rounded-xl font-bold text-[#31358B] hover:bg-[#E2E6FF] transition disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  {isSyncingMechanics ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
                  {isSyncingMechanics ? "Buscando Mecânicas..." : "Sincronizar Mecânicas (Ludopedia)"}
                </span>
              </button>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50">
            <button onClick={handleDelete} disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-3.5 rounded-xl transition disabled:opacity-50">
              <Trash2 size={18}/> Excluir
            </button>
            <button onClick={handleSave} disabled={loading} className="flex-[2] flex items-center justify-center gap-2 bg-[#31358B] hover:bg-[#25286b] text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50">
              <Save size={18}/> Salvar Alterações
            </button>
          </div>
        </div>
      </div>

      <GameComponentsModal isOpen={isComponentsOpen} gameId={game.id} gameTitle={game.title} onClose={() => setIsComponentsOpen(false)} />
    </>
  );
}