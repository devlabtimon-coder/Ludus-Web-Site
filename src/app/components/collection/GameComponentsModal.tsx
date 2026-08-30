import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { X, Box, Plus, Minus, Trash2, Loader2, Edit3, Save } from 'lucide-react';

interface ComponentItem {
  id: string;
  name: string;
  quantity: number;
}

interface GameComponentsModalProps {
  isOpen: boolean;
  gameId: string;
  gameTitle: string;
  onClose: () => void;
}

export function GameComponentsModal({ isOpen, gameId, gameTitle, onClose }: GameComponentsModalProps) {
  const [items, setItems] = useState<ComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);
  
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && gameId) {
      loadComponents();
      cancelEdit();
    }
  }, [isOpen, gameId]);

  const loadComponents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/games/${gameId}/components`);
      setItems(res.data || []);
    } catch (e) {
      setError("Não foi possível carregar os componentes.");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setName("");
    setQuantity("1");
    setError(null);
  };

  const handleEditClick = (item: ComponentItem) => {
    setEditingItemId(item.id);
    setName(item.name);
    setQuantity(item.quantity.toString());
    setError(null);
    document.querySelector('.overflow-y-auto')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity);
    
    if (!name.trim() || qty < 1 || isNaN(qty)) {
      setError("Preencha o nome e uma quantidade válida.");
      return;
    }

    try {
      if (editingItemId) {
        const res = await api.patch(`/games/${gameId}/components/${editingItemId}`, { 
          name: name.trim(), 
          quantity: qty 
        });
        setItems(items.map(i => i.id === editingItemId ? res.data : i).sort((a, b) => a.name.localeCompare(b.name)));
        cancelEdit();
      } else {
        const res = await api.post(`/games/${gameId}/components`, { 
          name: name.trim(), 
          quantity: qty 
        });
        setItems([res.data, ...items].sort((a, b) => a.name.localeCompare(b.name)));
        setName("");
        setQuantity("1");
        setError(null);
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || "Erro ao salvar componente.");
    }
  };

  const handleUpdateQty = async (id: string, newQty: number) => {
    if (newQty < 1) return;
    setItems(items.map(item => item.id === id ? { ...item, quantity: newQty } : item));
    try {
      await api.patch(`/games/${gameId}/components/${id}`, { quantity: newQty });
    } catch {
      loadComponents();
    }
  };

  const handleDelete = async (id: string) => {
    setItems(items.filter(item => item.id !== id));
    if (editingItemId === id) cancelEdit();
    try {
      await api.delete(`/games/${gameId}/components/${id}`);
    } catch {
      loadComponents();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#31358B]">Componentes</h2>
            <p className="text-sm text-gray-500 mt-1">{gameTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 pb-2">
          <form onSubmit={handleSubmit} className={`p-4 rounded-2xl border transition-colors relative overflow-hidden ${editingItemId ? 'bg-blue-50/80 border-blue-300' : 'bg-[#F7F8FF] border-[#31358B]/10'}`}>
            {editingItemId && (
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
            )}
            
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: editingItemId ? '#2563EB' : '#31358B' }}>
                {editingItemId ? <Edit3 size={16} /> : <Box size={16} />}
                {editingItemId ? 'Editando Componente' : 'Adicionar Novo'}
              </h3>
              {editingItemId && (
                <button type="button" onClick={cancelEdit} className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors bg-white px-2 py-1 rounded-lg border border-gray-200">
                  Cancelar
                </button>
              )}
            </div>

            <div className="flex gap-3 mb-3">
              <div className="flex-1 bg-white flex items-center px-3 rounded-xl border border-gray-200 focus-within:border-[#31358B]/30 transition-colors">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Cartas, Peões..." className="w-full py-3 outline-none text-sm font-semibold" />
              </div>
              <div className="w-24 bg-white flex items-center px-3 rounded-xl border border-gray-200 focus-within:border-[#31358B]/30 transition-colors">
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" className="w-full py-3 outline-none text-sm font-semibold text-center" />
              </div>
            </div>

            <button type="submit" className="w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 text-white bg-[#31358B] hover:bg-[#25286b]">
              {editingItemId ? <Save size={18} /> : <Plus size={18} />} 
              {editingItemId ? 'Salvar Alterações' : 'Adicionar Componente'}
            </button>
            {error && <p className="text-red-500 text-xs font-bold mt-3 text-center">{error}</p>}
          </form>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#31358B]" size={32} /></div>
          ) : items.length === 0 ? (
            <p className="text-center text-gray-500 py-10 font-medium">Nenhum componente cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className={`flex items-center p-3 rounded-2xl border transition-colors ${editingItemId === item.id ? 'bg-blue-50/50 border-blue-300' : 'bg-[#F7F8FF] border-[#31358B]/10'}`}>
                  <div className="flex-1 px-2">
                    <p className="font-bold text-[#31358B]">{item.name}</p>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5">Quantidade</p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white px-2 py-1.5 rounded-xl border border-gray-200 mr-3">
                    <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><Minus size={16}/></button>
                    <span className="font-bold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500"><Plus size={16}/></button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEditClick(item)} className={`p-2.5 rounded-xl transition ${editingItemId === item.id ? 'bg-blue-100 text-blue-700' : 'bg-white hover:bg-blue-50 border border-gray-100 text-gray-400 hover:text-blue-600'}`}>
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2.5 bg-white hover:bg-red-50 border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}