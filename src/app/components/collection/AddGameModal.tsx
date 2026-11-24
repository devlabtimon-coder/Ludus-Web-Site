import { useRef, useState } from 'react';
import { api, getErrorMessage } from '../../../services/api';
import { X, Search, CheckCircle2, Loader2, ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { GameTier } from '../../../types/api';
import { TIERS } from './tiers';

interface LudopediaGame {
  id: number;
  name: string;
  image: string;
}

// Dados montados pela API (Ludopedia + BGG) para o admin conferir antes de salvar.
interface GameDraft {
  ludopediaId: number;
  bggId: number | null;
  title: string;
  description: string;
  rating: number;
  minPlayers: number;
  maxPlayers: number | null;
  minAge: number;
  minTime: number;
  maxTime: number | null;
  mechanics: string[];
  yearPublished: number | null;
}

// Campos do formulário de revisão (números como texto para permitir apagar).
interface ReviewForm {
  title: string;
  tier: GameTier | null;
  description: string;
  minPlayers: string;
  maxPlayers: string;
  minAge: string;
  // O app mostra uma duração só; o valor vai como mínima e máxima.
  duration: string;
  mechanics: string[];
  howToPlayUrl: string;
}

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const toText = (n: number | null | undefined) => (n === null || n === undefined ? '' : String(n));
const toInt = (s: string) => (s.trim() === '' ? null : Number(s));
// Mesma regra da API: só http(s); link sem protocolo ganha https:// lá.
const isSafeLink = (url: string) => url === '' || /^https?:\/\//i.test(url) || !/^[a-z][a-z0-9+.-]*:/i.test(url);

function validate(form: ReviewForm): string | null {
  if (!form.title.trim()) return 'Informe o título.';
  if (!form.tier) return 'Escolha a categoria (tier) do jogo.';
  const minPlayers = toInt(form.minPlayers);
  const maxPlayers = toInt(form.maxPlayers);
  const minAge = toInt(form.minAge);
  const duration = toInt(form.duration);
  const isInt = (n: number | null) => n === null || Number.isInteger(n);
  if (minPlayers === null || !isInt(minPlayers) || minPlayers < 1 || minPlayers > 100) return 'Informe o mínimo de jogadores (1 a 100).';
  if (!isInt(maxPlayers) || (maxPlayers !== null && (maxPlayers < minPlayers || maxPlayers > 100))) return 'O máximo de jogadores precisa ficar entre o mínimo e 100.';
  if (minAge === null || !isInt(minAge) || minAge < 0 || minAge > 99) return 'Informe a idade mínima (0 a 99).';
  if (duration === null || !isInt(duration) || duration < 0 || duration > 1440) return 'Informe a duração em minutos (0 a 1440).';
  if (!isSafeLink(form.howToPlayUrl.trim())) return 'O link do vídeo precisa começar com http:// ou https://.';
  return null;
}

export function AddGameModal({ isOpen, onClose, onAdded }: AddGameModalProps) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LudopediaGame[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [addedGameIds, setAddedGameIds] = useState<number[]>([]);
  const [inCatalogIds, setInCatalogIds] = useState<number[]>([]);

  // Revisão: o jogo escolhido, os dados da API e o formulário editável.
  const [previewingId, setPreviewingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<LudopediaGame | null>(null);
  const [draft, setDraft] = useState<GameDraft | null>(null);
  const [form, setForm] = useState<ReviewForm | null>(null);
  const [newMechanic, setNewMechanic] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Trava síncrona: cliques seguidos chegam antes de o botão ficar desabilitado.
  const savingRef = useRef(false);

  if (!isOpen) return null;

  const busy = previewingId !== null || saving;

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!search.trim() || busy) return;
    setHasSearched(true);
    setLoading(true);
    try {
      const response = await api.get<LudopediaGame[]>(`/games/search-ludopedia?q=${encodeURIComponent(search)}`);
      setResults(response.data);
    } catch (error) {
      toast.error("Erro ao buscar jogos na Ludopedia.");
    } finally {
      setLoading(false);
    }
  };

  // Busca os dados completos (pode levar alguns segundos: Ludopedia, BGG e tradução).
  const openReview = async (game: LudopediaGame) => {
    if (busy) return;
    setPreviewingId(game.id);
    try {
      const { data } = await api.get<GameDraft>(`/games/ludopedia/${game.id}/preview`, { params: { title: game.name } });
      setSelected(game);
      setDraft(data);
      setForm({
        title: data.title,
        tier: null,
        description: data.description ?? '',
        minPlayers: toText(data.minPlayers),
        maxPlayers: toText(data.maxPlayers),
        minAge: toText(data.minAge),
        duration: toText(data.minTime || data.maxTime || 0),
        mechanics: data.mechanics ?? [],
        howToPlayUrl: '',
      });
      setNewMechanic('');
      setFormError(null);
    } catch (error: any) {
      if (error?.response?.data?.code === 'GAME_ALREADY_EXISTS') {
        setInCatalogIds((prev) => [...prev, game.id]);
      }
      toast.error(getErrorMessage(error, 'Erro ao buscar os dados do jogo.'));
    } finally {
      setPreviewingId(null);
    }
  };

  const closeReview = () => {
    setSelected(null);
    setDraft(null);
    setForm(null);
    setFormError(null);
  };

  // Qualquer ajuste tira o erro anterior, que só volta se o problema continuar ao salvar.
  const update = (patch: Partial<ReviewForm>) => {
    setForm((current) => (current ? { ...current, ...patch } : current));
    setFormError(null);
  };

  const addMechanic = () => {
    const name = newMechanic.trim();
    if (!form || !name) return;
    if (!form.mechanics.some((m) => m.toLowerCase() === name.toLowerCase())) update({ mechanics: [...form.mechanics, name] });
    setNewMechanic('');
  };

  const handleSave = async () => {
    if (!form || !draft || !selected || savingRef.current) return;
    const error = validate(form);
    if (error) {
      setFormError(error);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setFormError(null);
    try {
      await api.post("/games", {
        ludopediaId: draft.ludopediaId,
        title: form.title.trim(),
        cover: selected.image,
        tier: form.tier,
        // Valor de referência interno (o aluguel é gratuito); o backend ainda exige o campo.
        price: 3,
        description: form.description.trim(),
        minPlayers: toInt(form.minPlayers),
        maxPlayers: toInt(form.maxPlayers),
        minAge: toInt(form.minAge),
        minTime: toInt(form.duration),
        maxTime: toInt(form.duration),
        mechanics: form.mechanics,
        bggId: draft.bggId,
        rating: draft.rating,
        howToPlayUrl: form.howToPlayUrl.trim() || null,
      });
      setAddedGameIds((prev) => [...prev, draft.ludopediaId]);
      const tierLabel = TIERS.find((t) => t.value === form.tier)?.label ?? form.tier;
      toast.success(`"${form.title.trim()}" adicionado ao acervo como ${tierLabel}.`);
      onAdded(); // Atualiza a tabela por trás
      closeReview();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Erro ao adicionar jogo.'));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-[#F0F2FF] rounded-xl px-4 py-3 outline-none text-[#222] font-semibold focus:ring-2 focus:ring-[#31358B]/20 transition-all";
  const labelClass = "text-sm font-bold text-[#31358B]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {form && (
              <button
                onClick={closeReview}
                disabled={saving}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition text-[#31358B] disabled:opacity-50"
                aria-label="Voltar aos resultados"
              >
                <ArrowLeft size={22} />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-[#31358B]">{form ? 'Revisar antes de adicionar' : 'Buscar na Ludopedia'}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {form ? 'Confira os dados vindos da Ludopedia e da BGG e ajuste o que precisar.' : 'Escolha um título para revisar e adicionar ao acervo'}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={saving} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-600" aria-label="Fechar">
            <X size={24} />
          </button>
        </div>

        {form && draft && selected ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex gap-4">
                <img src={selected.image} alt={form.title} className="w-24 h-24 rounded-2xl object-cover shrink-0 bg-gray-100" />
                <div className="flex-1 min-w-0 space-y-2">
                  <label htmlFor="review-title" className={labelClass}>Título</label>
                  <input id="review-title" type="text" value={form.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
                  <p className="text-xs text-gray-500">
                    Ludopedia #{draft.ludopediaId}
                    {draft.yearPublished ? ` · ${draft.yearPublished}` : ''}
                    {draft.bggId ? ` · BGG #${draft.bggId}` : ' · sem correspondência na BGG'}
                    {draft.rating ? ` · nota ${draft.rating.toFixed(1)}` : ''}
                  </p>
                </div>
              </div>

              <div>
                <p className={labelClass}>
                  Categoria (Tier) <span className="text-[#E62325]">*</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">Obrigatória. Define quais categorias de aluno podem alugar.</p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Categoria do jogo">
                  {TIERS.map((t) => {
                    const isSelected = form.tier === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => update({ tier: t.value })}
                        className="px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all hover:bg-gray-50"
                        style={{
                          backgroundColor: isSelected ? t.color : 'transparent',
                          borderColor: t.color,
                          color: isSelected ? '#fff' : t.color,
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <NumberField label="Jogadores (mín.)" value={form.minPlayers} onChange={(v) => update({ minPlayers: v })} min={1} className={inputClass} labelClass={labelClass} />
                <NumberField label="Jogadores (máx.)" value={form.maxPlayers} onChange={(v) => update({ maxPlayers: v })} min={1} className={inputClass} labelClass={labelClass} placeholder="Opcional" />
                <NumberField label="Idade mínima" value={form.minAge} onChange={(v) => update({ minAge: v })} min={0} className={inputClass} labelClass={labelClass} />
                <NumberField label="Duração (min)" value={form.duration} onChange={(v) => update({ duration: v })} min={0} className={inputClass} labelClass={labelClass} />
              </div>

              <div className="space-y-2">
                <p className={labelClass}>Mecânicas</p>
                <div className="flex flex-wrap gap-2">
                  {form.mechanics.length === 0 && <p className="text-xs text-gray-500">Nenhuma mecânica. Adicione abaixo, se quiser.</p>}
                  {form.mechanics.map((m) => (
                    <span key={m} className="inline-flex items-center gap-1 rounded-full bg-[#F0F2FF] pl-3 pr-1 py-1 text-xs font-bold text-[#31358B]">
                      {m}
                      <button
                        type="button"
                        onClick={() => update({ mechanics: form.mechanics.filter((x) => x !== m) })}
                        className="rounded-full p-0.5 hover:bg-[#31358B]/10"
                        aria-label={`Remover ${m}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMechanic}
                    onChange={(e) => setNewMechanic(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMechanic();
                      }
                    }}
                    placeholder="Adicionar mecânica"
                    className={`${inputClass} text-sm`}
                  />
                  <button type="button" onClick={addMechanic} className="shrink-0 rounded-xl border-2 border-[#31358B] px-3 text-[#31358B] hover:bg-[#31358B] hover:text-white transition" aria-label="Adicionar mecânica">
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="review-description" className={labelClass}>Descrição</label>
                <textarea
                  id="review-description"
                  value={form.description}
                  onChange={(e) => update({ description: e.target.value })}
                  rows={8}
                  className={`${inputClass} font-normal text-sm leading-relaxed resize-y`}
                />
                <p className="text-xs text-gray-500">Aparece para os alunos no app. Quando a BGG tem o jogo, a descrição vem traduzida de lá.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="review-video" className={labelClass}>Vídeo de como jogar (opcional)</label>
                <input
                  id="review-video"
                  type="text"
                  value={form.howToPlayUrl}
                  onChange={(e) => update({ howToPlayUrl: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className={`${inputClass} text-sm`}
                />
              </div>
            </div>

            <div className="border-t border-gray-100 px-6 py-4 space-y-3">
              {formError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {formError}
                </p>
              )}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={closeReview}
                  disabled={saving}
                  className="px-5 py-3 rounded-xl font-semibold text-sm text-[#31358B] hover:bg-gray-100 transition disabled:opacity-50"
                >
                  Voltar aos resultados
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !form.tier}
                  title={!form.tier ? 'Escolha a categoria primeiro' : undefined}
                  className="min-w-[190px] h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-sm bg-[#FBBC04] text-[#31358B] hover:brightness-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  Adicionar ao acervo
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
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
                <button type="submit" disabled={loading || busy} className="bg-[#31358B] hover:bg-[#25286b] text-white px-5 py-2 rounded-xl font-semibold text-sm transition disabled:opacity-50">
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
                    const isInCatalog = inCatalogIds.includes(item.id);
                    const isLoadingThis = previewingId === item.id;

                    return (
                      <div key={item.id} className="flex items-center bg-white border border-gray-100 p-3 rounded-2xl shadow-sm hover:shadow-md transition">
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                        <div className="flex-1 px-4 min-w-0">
                          <p className="font-bold text-[#31358B] line-clamp-1">{item.name}</p>
                          {isLoadingThis && <p className="text-xs text-gray-500">Buscando dados na Ludopedia e na BGG...</p>}
                        </div>
                        <button
                          onClick={() => openReview(item)}
                          disabled={isAdded || isInCatalog || busy}
                          className={`min-w-[110px] h-10 flex items-center justify-center rounded-xl font-semibold text-sm transition-all ${
                            isAdded || isInCatalog ? 'bg-green-100 text-green-700' : 'bg-[#FBBC04] text-[#31358B] hover:brightness-105'
                          } disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                          {isLoadingThis ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : isAdded ? (
                            <><CheckCircle2 size={16} className="mr-1" /> Adicionado</>
                          ) : isInCatalog ? (
                            'Já no acervo'
                          ) : (
                            'Revisar'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  placeholder,
  className,
  labelClass,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  placeholder?: string;
  className: string;
  labelClass: string;
}) {
  const id = `review-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={labelClass}>{label}</label>
      <input id={id} type="number" inputMode="numeric" min={min} step={1} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={className} />
    </div>
  );
}
