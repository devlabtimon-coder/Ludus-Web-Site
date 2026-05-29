import { useState } from 'react';
import { api } from '../../../services/api';
import { X, Search, CheckCircle2, Loader2 } from 'lucide-react';

interface LudopediaGame {
  id: number;
  name: string;
  image: string;
}

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddGameModal({ isOpen, onClose, onAdded }: AddGameModalProps) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LudopediaGame[]>([]);
  const [addingGameId, setAddingGameId] = useState<number | null>(null);
  const [addedGameIds, setAddedGameIds] = useState<number[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!search.trim() || addingGameId !== null) return;
    setHasSearched(true);
    setLoading(true);
    try {
      const response = await api.get<LudopediaGame[]>(`/games/search-ludopedia?q=${encodeURIComponent(search)}`);
      setResults(response.data);
    } catch (error) {
      alert("Erro ao buscar jogos na Ludopedia.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGame = async (game: LudopediaGame) => {
    if (addingGameId !== null || addedGameIds.includes(game.id)) return;
    setAddingGameId(game.id);
    try {
      await api.post("/games", {
        ludopediaId: game.id,
        title: game.name,
        cover: game.image,
        price: 3, // Preço padrão inicial
      });
      setAddedGameIds((prev) => [...prev, game.id]);
      onAdded(); // Atualiza a tabela por trás
    } catch (error: any) {
      alert(error?.response?.data?.error || "Erro ao adicionar jogo");
    } finally {
      setAddingGameId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#31358B]">Buscar na Ludopedia</h2>
            <p className="text-sm text-gray-500 mt-1">Adicione novos títulos ao acervo</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 pb-2">
          <form onSubmit={handleSearch} className="flex items-center gap-3 bg-[#F0F2FF] px-4 py-1 rounded-2xl border border-transparent focus-within:border-[#31358B]/20 transition-all">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Digite o nome do jogo..."
              className="flex-1 bg-transparent py-3 text-[#31358B] font-medium outline-none placeholder:text-gray-400"
            />
            <button type="submit" disabled={loading} className="bg-[#31358B] hover:bg-[#25286b] text-white px-5 py-2 rounded-xl font-semibold text-sm transition disabled:opacity-50">
              Buscar
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40">
              <Loader2 className="animate-spin text-[#31358B] mb-4" size={32} />
              <p className="text-gray-500 font-medium">Buscando na base de dados...</p>
            </div>
          ) : results.length === 0 && hasSearched ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Nenhum resultado encontrado para "{search}".</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((item) => {
                const isAdded = addedGameIds.includes(item.id);
                const isAddingThis = addingGameId === item.id;

                return (
                  <div key={item.id} className="flex items-center bg-white border border-gray-100 p-3 rounded-2xl shadow-sm hover:shadow-md transition">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1 px-4">
                      <p className="font-bold text-[#31358B] line-clamp-1">{item.name}</p>
                    </div>
                    <button
                      onClick={() => handleAddGame(item)}
                      disabled={isAdded || isAddingThis}
                      className={`min-w-[100px] h-10 flex items-center justify-center rounded-xl font-semibold text-sm transition-all ${
                        isAdded ? 'bg-green-100 text-green-700' : 'bg-[#FBBC04] text-[#31358B] hover:brightness-105'
                      } disabled:opacity-70`}
                    >
                      {isAddingThis ? <Loader2 size={18} className="animate-spin" /> : isAdded ? <><CheckCircle2 size={16} className="mr-1"/> Adicionado</> : 'Adicionar'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}