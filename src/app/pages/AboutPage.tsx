import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AlertCircle, ArrowDown, ArrowUp, Award, BarChart3, Bell, BookOpen, Bookmark, Building2, Check,
  ChevronDown, Database, Dices, Eye, Globe, GraduationCap, Heart, Info, LayoutGrid, Loader2, Mail,
  MessageCircle, Plus, RotateCcw, Save, Search, ShieldCheck, Smartphone, Star, Trash2, Trophy, Users, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import logoDice from '../../assets/images/logo-dice.png';
import { Loading } from '../components/shared/Loading';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import {
  ABOUT_COLORS, ABOUT_ICONS, ABOUT_INTEGRATION_STATUS, ABOUT_VERSION_STATUS, aboutService, newItemId,
  type AboutColor, type AboutContent, type AboutIcon,
} from '../../services/aboutService';

type TabId = 'identidade' | 'funcionalidades' | 'missao' | 'responsaveis' | 'versao' | 'integracoes';

const TABS: { id: TabId; label: string }[] = [
  { id: 'identidade', label: 'Identidade e descrição' },
  { id: 'funcionalidades', label: 'O que o app oferece' },
  { id: 'missao', label: 'Propósito' },
  { id: 'responsaveis', label: 'Responsáveis' },
  { id: 'versao', label: 'Versão e atualizações' },
  { id: 'integracoes', label: 'APIs e integrações' },
];

const ICONS: Record<AboutIcon, typeof LayoutGrid> = {
  grid: LayoutGrid, search: Search, bookmark: Bookmark, bell: Bell, graduation: GraduationCap,
  phone: Smartphone, trophy: Trophy, chart: BarChart3, users: Users, building: Building2, award: Award,
  database: Database, globe: Globe, mail: Mail, message: MessageCircle, shield: ShieldCheck,
  book: BookOpen, star: Star, dice: Dices, heart: Heart,
};

const ICON_LABELS: Record<AboutIcon, string> = {
  grid: 'Grade', search: 'Busca', bookmark: 'Marcador', bell: 'Sino', graduation: 'Formatura',
  phone: 'Celular', trophy: 'Troféu', chart: 'Gráfico', users: 'Pessoas', building: 'Instituição',
  award: 'Medalha', database: 'Banco de dados', globe: 'Globo', mail: 'E-mail', message: 'Mensagem',
  shield: 'Escudo', book: 'Livro', star: 'Estrela', dice: 'Dados', heart: 'Coração',
};

// Mesmas cores dos cards da tela Sobre no app.
const COLORS: Record<AboutColor, { bg: string; fg: string; label: string }> = {
  blue: { bg: '#EEF0FF', fg: '#31358B', label: 'Azul' },
  yellow: { bg: '#FFF6D9', fg: '#9A6B00', label: 'Amarelo' },
  red: { bg: '#FFE9EA', fg: '#E62325', label: 'Vermelho' },
  green: { bg: '#E8F7EC', fg: '#1F7A39', label: 'Verde' },
};

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  'Estável': { bg: '#DCFCE7', fg: '#15803D' },
  'Ativa': { bg: '#DCFCE7', fg: '#15803D' },
  'Beta': { bg: '#FEF3C7', fg: '#B45309' },
  'Integração prevista': { bg: '#FEF3C7', fg: '#B45309' },
  'Em desenvolvimento': { bg: '#EEF0FF', fg: '#31358B' },
  'Serviço configurável': { bg: '#EEF0FF', fg: '#31358B' },
  'Em manutenção': { bg: '#FFE9EA', fg: '#B3193A' },
  'Descontinuada': { bg: '#F3F4F6', fg: '#6B7280' },
};

const inputClass =
  'w-full px-3 py-2.5 rounded-xl bg-[#F7F8FF] border border-[#E5E7EB] text-sm text-gray-900 focus:outline-none focus:border-[#31358B] focus:ring-2 focus:ring-[#31358B]/15';

function move<T>(list: T[], index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function AboutPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('identidade');
  const [content, setContent] = useState<AboutContent | null>(null);
  const [saved, setSaved] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newChip, setNewChip] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { updatedAt: at, ...data } = await aboutService.getForAdmin();
      setContent(data);
      setSaved(JSON.stringify(data));
      setUpdatedAt(at);
      setError(null);
    } catch {
      setError('Não foi possível carregar a página Sobre.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const dirty = useMemo(() => content !== null && JSON.stringify(content) !== saved, [content, saved]);

  // Avisa antes de sair da página com alterações não publicadas.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const update = (fn: (c: AboutContent) => AboutContent) => setContent((c) => (c ? fn(c) : c));

  const handleSave = async () => {
    if (!content) return;
    setSaving(true);
    try {
      const { updatedAt: at, ...data } = await aboutService.save(content);
      setContent(data);
      setSaved(JSON.stringify(data));
      setUpdatedAt(at);
      toast.success('Página Sobre publicada. O app já mostra a nova versão.');
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Não foi possível salvar a página Sobre. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (!saved) return;
    setContent(JSON.parse(saved));
  };

  const addChip = () => {
    const chip = newChip.trim();
    if (!chip || !content) return;
    update((c) => ({ ...c, identity: { ...c.identity, chips: [...c.identity.chips, chip] } }));
    setNewChip('');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#04096D]">Página Sobre do app</h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                Edite o que aparece em Perfil › Sobre o Ludus no aplicativo.
                {updatedAt && <> Última publicação: {new Date(updatedAt).toLocaleString('pt-BR')}.</>}
              </p>
            </div>
            {content && (
              <div className="flex flex-wrap items-center gap-2">
                {dirty && (
                  <span className="text-xs font-bold text-[#B45309] bg-[#FEF3C7] px-3 py-1.5 rounded-full">
                    Alterações não publicadas
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleDiscard}
                  disabled={!dirty || saving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  <RotateCcw size={16} /> Descartar
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="xl:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#31358B] text-[#31358B] text-sm font-semibold hover:bg-[#EEF0FF]"
                >
                  <Eye size={16} /> Pré-visualizar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!dirty || saving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#31358B] hover:bg-[#272B73] text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : dirty ? <Save size={16} /> : <Check size={16} />}
                  {saving ? 'Publicando…' : dirty ? 'Salvar e publicar' : 'Publicado'}
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <Loading />
          ) : error || !content ? (
            <ErrorMessage message={error || 'Não foi possível carregar a página Sobre.'} onRetry={load} />
          ) : (
            <div className="flex gap-6 items-start">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-x-1 mb-5 border-b border-gray-200">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === tab.id ? 'text-[#31358B] border-[#31358B]' : 'text-gray-500 border-transparent hover:text-gray-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="max-w-3xl space-y-5">
                  {activeTab === 'identidade' && (
                    <>
                      <Card title="Identidade do projeto">
                        <Field label="Nome do aplicativo" hint={`${content.identity.appName.length}/40`}>
                          <input
                            className={inputClass}
                            maxLength={40}
                            value={content.identity.appName}
                            onChange={(e) => update((c) => ({ ...c, identity: { ...c.identity, appName: e.target.value } }))}
                          />
                        </Field>
                        <Field label="Subtítulo do cabeçalho" hint={`${content.identity.subtitle.length}/120`}>
                          <input
                            className={inputClass}
                            maxLength={120}
                            value={content.identity.subtitle}
                            onChange={(e) => update((c) => ({ ...c, identity: { ...c.identity, subtitle: e.target.value } }))}
                          />
                        </Field>
                        <Field label="Texto de apresentação" hint={`${content.identity.description.length}/1200`}>
                          <textarea
                            className={`${inputClass} resize-y leading-relaxed`}
                            rows={6}
                            maxLength={1200}
                            value={content.identity.description}
                            onChange={(e) => update((c) => ({ ...c, identity: { ...c.identity, description: e.target.value } }))}
                          />
                        </Field>
                      </Card>

                      <Card title="Chips institucionais" description="Etiquetas curtas exibidas abaixo do texto de apresentação (até 8).">
                        <div className="flex flex-wrap gap-2">
                          {content.identity.chips.map((chip, i) => (
                            <span key={`${chip}-${i}`} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full text-xs font-bold bg-[#EEF0FF] text-[#31358B]">
                              {chip}
                              <button
                                type="button"
                                aria-label={`Remover ${chip}`}
                                onClick={() => update((c) => ({ ...c, identity: { ...c.identity, chips: c.identity.chips.filter((_, j) => j !== i) } }))}
                                className="p-0.5 rounded-full hover:bg-white text-[#31358B]/70 hover:text-[#B3193A]"
                              >
                                <X size={13} />
                              </button>
                            </span>
                          ))}
                          {content.identity.chips.length === 0 && <span className="text-sm text-gray-400">Nenhum chip.</span>}
                        </div>
                        <div className="flex gap-2">
                          <input
                            className={inputClass}
                            maxLength={40}
                            placeholder="Novo chip…"
                            value={newChip}
                            onChange={(e) => setNewChip(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addChip()}
                            disabled={content.identity.chips.length >= 8}
                          />
                          <button
                            type="button"
                            onClick={addChip}
                            disabled={!newChip.trim() || content.identity.chips.length >= 8}
                            className="px-3 rounded-xl bg-[#31358B] text-white disabled:opacity-40"
                            aria-label="Adicionar chip"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </Card>

                      <Card title="Logo">
                        <p className="text-sm text-gray-500">
                          A tela usa a logo do dado do Ludus. A troca da imagem pelo painel fica para uma próxima versão.
                        </p>
                      </Card>
                    </>
                  )}

                  {activeTab === 'funcionalidades' && (
                    <Card
                      title="Funcionalidades do aplicativo"
                      description='Cards da seção "O que o app oferece". Use as setas para ordenar e o olho para ocultar sem apagar.'
                      action={
                        <AddButton
                          disabled={content.features.length >= 12}
                          onClick={() =>
                            update((c) => ({
                              ...c,
                              features: [
                                ...c.features,
                                { id: newItemId('feat'), icon: 'grid', color: 'blue', title: 'Nova funcionalidade', description: 'Descreva o que ela permite fazer.', visible: true },
                              ],
                            }))
                          }
                        >
                          Adicionar funcionalidade
                        </AddButton>
                      }
                    >
                      {content.features.map((f, i) => (
                        <ItemRow
                          key={f.id}
                          visible={f.visible}
                          onToggle={() => update((c) => ({ ...c, features: c.features.map((x) => (x.id === f.id ? { ...x, visible: !x.visible } : x)) }))}
                          onUp={i > 0 ? () => update((c) => ({ ...c, features: move(c.features, i, -1) })) : undefined}
                          onDown={i < content.features.length - 1 ? () => update((c) => ({ ...c, features: move(c.features, i, 1) })) : undefined}
                          onRemove={() => update((c) => ({ ...c, features: c.features.filter((x) => x.id !== f.id) }))}
                          leading={<IconBadge icon={f.icon} color={f.color} />}
                        >
                          <input
                            className={`${inputClass} font-bold`}
                            maxLength={60}
                            value={f.title}
                            onChange={(e) => update((c) => ({ ...c, features: c.features.map((x) => (x.id === f.id ? { ...x, title: e.target.value } : x)) }))}
                            aria-label="Título"
                          />
                          <textarea
                            className={`${inputClass} resize-y`}
                            rows={2}
                            maxLength={300}
                            value={f.description}
                            onChange={(e) => update((c) => ({ ...c, features: c.features.map((x) => (x.id === f.id ? { ...x, description: e.target.value } : x)) }))}
                            aria-label="Descrição"
                          />
                          <div className="flex flex-wrap gap-2">
                            <IconSelect value={f.icon} onChange={(icon) => update((c) => ({ ...c, features: c.features.map((x) => (x.id === f.id ? { ...x, icon } : x)) }))} />
                            <select
                              className={`${inputClass} w-auto`}
                              value={f.color}
                              onChange={(e) => update((c) => ({ ...c, features: c.features.map((x) => (x.id === f.id ? { ...x, color: e.target.value as AboutColor } : x)) }))}
                              aria-label="Cor"
                            >
                              {ABOUT_COLORS.map((color) => (
                                <option key={color} value={color}>{COLORS[color].label}</option>
                              ))}
                            </select>
                          </div>
                        </ItemRow>
                      ))}
                      {content.features.length === 0 && <Empty>Nenhuma funcionalidade. A seção não aparece no app.</Empty>}
                    </Card>
                  )}

                  {activeTab === 'missao' && (
                    <Card
                      title="Propósito do projeto"
                      action={<Toggle on={content.mission.visible} label="Exibir no app" onChange={(v) => update((c) => ({ ...c, mission: { ...c.mission, visible: v } }))} />}
                    >
                      <Field label="Missão" hint={`${content.mission.mission.length}/1200`}>
                        <textarea
                          className={`${inputClass} resize-y leading-relaxed`}
                          rows={6}
                          maxLength={1200}
                          value={content.mission.mission}
                          onChange={(e) => update((c) => ({ ...c, mission: { ...c.mission, mission: e.target.value } }))}
                        />
                      </Field>
                      <Field label="Visão (opcional)" hint={`${content.mission.vision.length}/600`}>
                        <textarea
                          className={`${inputClass} resize-y leading-relaxed`}
                          rows={3}
                          maxLength={600}
                          value={content.mission.vision}
                          onChange={(e) => update((c) => ({ ...c, mission: { ...c.mission, vision: e.target.value } }))}
                        />
                      </Field>
                    </Card>
                  )}

                  {activeTab === 'responsaveis' && (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">Seção "Projeto" da tela Sobre.</p>
                        <Toggle on={content.team.visible} label="Exibir no app" onChange={(v) => update((c) => ({ ...c, team: { ...c.team, visible: v } }))} />
                      </div>
                      <Card title="Instituição">
                        <input
                          className={inputClass}
                          maxLength={200}
                          value={content.team.institution}
                          onChange={(e) => update((c) => ({ ...c, team: { ...c.team, institution: e.target.value } }))}
                          aria-label="Nome da instituição"
                        />
                      </Card>
                      <Card
                        title="Equipe de desenvolvimento"
                        action={
                          <AddButton
                            disabled={content.team.members.length >= 30}
                            onClick={() => update((c) => ({ ...c, team: { ...c.team, members: [...c.team.members, { id: newItemId('membro'), name: 'Novo integrante', role: '', visible: true }] } }))}
                          >
                            Adicionar
                          </AddButton>
                        }
                      >
                        {content.team.members.map((m, i) => (
                          <ItemRow
                            key={m.id}
                            compact
                            visible={m.visible}
                            onToggle={() => update((c) => ({ ...c, team: { ...c.team, members: c.team.members.map((x) => (x.id === m.id ? { ...x, visible: !x.visible } : x)) } }))}
                            onUp={i > 0 ? () => update((c) => ({ ...c, team: { ...c.team, members: move(c.team.members, i, -1) } })) : undefined}
                            onDown={i < content.team.members.length - 1 ? () => update((c) => ({ ...c, team: { ...c.team, members: move(c.team.members, i, 1) } })) : undefined}
                            onRemove={() => update((c) => ({ ...c, team: { ...c.team, members: c.team.members.filter((x) => x.id !== m.id) } }))}
                          >
                            <div className="grid sm:grid-cols-2 gap-2">
                              <input
                                className={inputClass}
                                maxLength={80}
                                placeholder="Nome"
                                value={m.name}
                                onChange={(e) => update((c) => ({ ...c, team: { ...c.team, members: c.team.members.map((x) => (x.id === m.id ? { ...x, name: e.target.value } : x)) } }))}
                                aria-label="Nome"
                              />
                              <input
                                className={inputClass}
                                maxLength={80}
                                placeholder="Função (opcional)"
                                value={m.role}
                                onChange={(e) => update((c) => ({ ...c, team: { ...c.team, members: c.team.members.map((x) => (x.id === m.id ? { ...x, role: e.target.value } : x)) } }))}
                                aria-label="Função"
                              />
                            </div>
                          </ItemRow>
                        ))}
                        {content.team.members.length === 0 && <Empty>Nenhum integrante cadastrado.</Empty>}
                      </Card>
                      <Card title="Orientação">
                        <Field label="Nome">
                          <input
                            className={inputClass}
                            maxLength={80}
                            value={content.team.advisor}
                            onChange={(e) => update((c) => ({ ...c, team: { ...c.team, advisor: e.target.value } }))}
                          />
                        </Field>
                        <Field label="Titulação (opcional)">
                          <input
                            className={inputClass}
                            maxLength={120}
                            placeholder="Ex.: Professora do IFMA Campus Timon"
                            value={content.team.advisorTitle}
                            onChange={(e) => update((c) => ({ ...c, team: { ...c.team, advisorTitle: e.target.value } }))}
                          />
                        </Field>
                      </Card>
                    </>
                  )}

                  {activeTab === 'versao' && (
                    <>
                      <Card title="Versão do aplicativo">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-[#EEF0FF] text-[#31358B]">
                          <Info size={18} className="flex-shrink-0 mt-0.5" />
                          <p className="text-sm">O número da versão vem do aplicativo instalado no celular, então nunca diverge da loja. Aqui você define o status exibido ao lado dele.</p>
                        </div>
                        <Field label="Status">
                          <select
                            className={`${inputClass} w-auto`}
                            value={content.version.status}
                            onChange={(e) => update((c) => ({ ...c, version: { ...c.version, status: e.target.value as AboutContent['version']['status'] } }))}
                          >
                            {ABOUT_VERSION_STATUS.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </Field>
                      </Card>
                      <Card
                        title="Histórico de atualizações"
                        description="Aparece no app como uma lista recolhível, na ordem abaixo (a mais recente primeiro)."
                        action={
                          <AddButton
                            disabled={content.version.changelog.length >= 30}
                            onClick={() => update((c) => ({ ...c, version: { ...c.version, changelog: [{ id: newItemId('versao'), version: '', title: '', description: '' }, ...c.version.changelog] } }))}
                          >
                            Adicionar atualização
                          </AddButton>
                        }
                      >
                        {content.version.changelog.map((entry, i) => (
                          <ItemRow
                            key={entry.id}
                            onUp={i > 0 ? () => update((c) => ({ ...c, version: { ...c.version, changelog: move(c.version.changelog, i, -1) } })) : undefined}
                            onDown={i < content.version.changelog.length - 1 ? () => update((c) => ({ ...c, version: { ...c.version, changelog: move(c.version.changelog, i, 1) } })) : undefined}
                            onRemove={() => update((c) => ({ ...c, version: { ...c.version, changelog: c.version.changelog.filter((x) => x.id !== entry.id) } }))}
                          >
                            <div className="grid grid-cols-[110px_1fr] gap-2">
                              <input
                                className={inputClass}
                                maxLength={20}
                                placeholder="1.1.0"
                                value={entry.version}
                                onChange={(e) => update((c) => ({ ...c, version: { ...c.version, changelog: c.version.changelog.map((x) => (x.id === entry.id ? { ...x, version: e.target.value } : x)) } }))}
                                aria-label="Versão"
                              />
                              <input
                                className={`${inputClass} font-bold`}
                                maxLength={80}
                                placeholder="Título da atualização"
                                value={entry.title}
                                onChange={(e) => update((c) => ({ ...c, version: { ...c.version, changelog: c.version.changelog.map((x) => (x.id === entry.id ? { ...x, title: e.target.value } : x)) } }))}
                                aria-label="Título"
                              />
                            </div>
                            <textarea
                              className={`${inputClass} resize-y`}
                              rows={2}
                              maxLength={600}
                              placeholder="O que mudou nesta versão"
                              value={entry.description}
                              onChange={(e) => update((c) => ({ ...c, version: { ...c.version, changelog: c.version.changelog.map((x) => (x.id === entry.id ? { ...x, description: e.target.value } : x)) } }))}
                              aria-label="Descrição"
                            />
                          </ItemRow>
                        ))}
                        {content.version.changelog.length === 0 && <Empty>Nenhuma atualização registrada.</Empty>}
                      </Card>
                    </>
                  )}

                  {activeTab === 'integracoes' && (
                    <Card
                      title="APIs e integrações"
                      description="Serviços externos usados pelo Ludus, exibidos de forma informativa no app."
                      action={
                        <AddButton
                          disabled={content.integrations.length >= 15}
                          onClick={() =>
                            update((c) => ({
                              ...c,
                              integrations: [...c.integrations, { id: newItemId('api'), icon: 'globe', name: 'Nova integração', usage: 'Para que o serviço é usado.', status: 'Integração prevista', visible: true }],
                            }))
                          }
                        >
                          Adicionar integração
                        </AddButton>
                      }
                    >
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-[#D97706]" />
                        <p className="text-xs text-[#92400E]">Não coloque chaves, tokens ou credenciais aqui. Esta seção é pública para todos os usuários do app.</p>
                      </div>
                      {content.integrations.map((api, i) => (
                        <ItemRow
                          key={api.id}
                          visible={api.visible}
                          onToggle={() => update((c) => ({ ...c, integrations: c.integrations.map((x) => (x.id === api.id ? { ...x, visible: !x.visible } : x)) }))}
                          onUp={i > 0 ? () => update((c) => ({ ...c, integrations: move(c.integrations, i, -1) })) : undefined}
                          onDown={i < content.integrations.length - 1 ? () => update((c) => ({ ...c, integrations: move(c.integrations, i, 1) })) : undefined}
                          onRemove={() => update((c) => ({ ...c, integrations: c.integrations.filter((x) => x.id !== api.id) }))}
                          leading={<IconBadge icon={api.icon} color="blue" />}
                        >
                          <input
                            className={`${inputClass} font-bold`}
                            maxLength={60}
                            value={api.name}
                            onChange={(e) => update((c) => ({ ...c, integrations: c.integrations.map((x) => (x.id === api.id ? { ...x, name: e.target.value } : x)) }))}
                            aria-label="Nome"
                          />
                          <input
                            className={inputClass}
                            maxLength={300}
                            value={api.usage}
                            onChange={(e) => update((c) => ({ ...c, integrations: c.integrations.map((x) => (x.id === api.id ? { ...x, usage: e.target.value } : x)) }))}
                            aria-label="Uso"
                          />
                          <div className="flex flex-wrap gap-2">
                            <IconSelect value={api.icon} onChange={(icon) => update((c) => ({ ...c, integrations: c.integrations.map((x) => (x.id === api.id ? { ...x, icon } : x)) }))} />
                            <select
                              className={`${inputClass} w-auto font-semibold`}
                              style={{ background: STATUS_STYLE[api.status]?.bg, color: STATUS_STYLE[api.status]?.fg }}
                              value={api.status}
                              onChange={(e) => update((c) => ({ ...c, integrations: c.integrations.map((x) => (x.id === api.id ? { ...x, status: e.target.value as typeof api.status } : x)) }))}
                              aria-label="Status"
                            >
                              {ABOUT_INTEGRATION_STATUS.map((s) => <option key={s}>{s}</option>)}
                            </select>
                          </div>
                        </ItemRow>
                      ))}
                      {content.integrations.length === 0 && <Empty>Nenhuma integração. A seção não aparece no app.</Empty>}
                    </Card>
                  )}
                </div>
              </div>

              <aside className="hidden xl:block w-[340px] flex-shrink-0 sticky top-0">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pré-visualização no app</p>
                <PhoneFrame>
                  <AboutPreview content={content} />
                </PhoneFrame>
              </aside>
            </div>
          )}
        </main>
      </div>

      {showPreview && content && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center"
              aria-label="Fechar pré-visualização"
            >
              <X size={18} />
            </button>
            <PhoneFrame>
              <AboutPreview content={content} />
            </PhoneFrame>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Blocos do editor ────────────────────────────────────────────────────────

function Card({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function AddButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#31358B] hover:bg-[#272B73] text-white text-sm font-semibold disabled:opacity-40"
    >
      <Plus size={15} /> {children}
    </button>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="flex items-center gap-2 text-sm font-semibold text-gray-600">
      {label}
      <span className={`relative w-10 h-6 rounded-full transition-colors ${on ? 'bg-[#22C55E]' : 'bg-gray-300'}`}>
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'left-5' : 'left-1'}`} />
      </span>
    </button>
  );
}

function ItemRow({
  children, leading, visible, compact, onToggle, onUp, onDown, onRemove,
}: {
  children: ReactNode;
  leading?: ReactNode;
  visible?: boolean;
  compact?: boolean;
  onToggle?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onRemove: () => void;
}) {
  const btn = 'w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent';
  return (
    <div className={`flex gap-3 rounded-xl border border-gray-200 bg-[#FAFAFC] ${compact ? 'p-2.5 items-center' : 'p-3.5 items-start'} ${visible === false ? 'opacity-60' : ''}`}>
      {leading}
      <div className="flex-1 min-w-0 space-y-2">{children}</div>
      <div className={`flex flex-shrink-0 ${compact ? 'flex-row' : 'flex-col'} gap-0.5`}>
        <button type="button" className={btn} onClick={onUp} disabled={!onUp} aria-label="Mover para cima"><ArrowUp size={15} /></button>
        <button type="button" className={btn} onClick={onDown} disabled={!onDown} aria-label="Mover para baixo"><ArrowDown size={15} /></button>
        {onToggle && (
          <button type="button" className={btn} onClick={onToggle} aria-label={visible ? 'Ocultar no app' : 'Mostrar no app'} title={visible ? 'Visível no app' : 'Oculto no app'}>
            {visible ? <Eye size={15} /> : <Eye size={15} className="text-gray-300" />}
          </button>
        )}
        <button type="button" className={`${btn} hover:text-[#B3193A]`} onClick={onRemove} aria-label="Remover"><Trash2 size={15} /></button>
      </div>
    </div>
  );
}

function IconBadge({ icon, color }: { icon: AboutIcon; color: AboutColor }) {
  const Icon = ICONS[icon];
  return (
    <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: COLORS[color].bg, color: COLORS[color].fg }}>
      <Icon size={20} />
    </span>
  );
}

function IconSelect({ value, onChange }: { value: AboutIcon; onChange: (v: AboutIcon) => void }) {
  return (
    <select className={`${inputClass} w-auto`} value={value} onChange={(e) => onChange(e.target.value as AboutIcon)} aria-label="Ícone">
      {ABOUT_ICONS.map((icon) => (
        <option key={icon} value={icon}>Ícone: {ICON_LABELS[icon]}</option>
      ))}
    </select>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-gray-400 text-center py-4">{children}</p>;
}

// ─── Pré-visualização (espelha a tela Sobre do app) ──────────────────────────

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[320px] h-[640px] rounded-[2.4rem] bg-[#0B0D2E] p-2.5 shadow-xl">
      <div className="w-full h-full rounded-[2rem] overflow-y-auto scrollbar-hide bg-[#31358B]">{children}</div>
    </div>
  );
}

function AboutPreview({ content }: { content: AboutContent }) {
  const [openLog, setOpenLog] = useState(false);
  const features = content.features.filter((f) => f.visible);
  const members = content.team.members.filter((m) => m.visible);
  const integrations = content.integrations.filter((i) => i.visible);
  const status = STATUS_STYLE[content.version.status];

  return (
    <div className="text-[12px]">
      <div className="px-4 pt-6 pb-4 text-white">
        <p className="text-[17px] font-black leading-tight">Sobre o {content.identity.appName || 'Ludus'}</p>
        {content.identity.subtitle && <p className="text-[11px] font-bold text-white/80 mt-0.5">{content.identity.subtitle}</p>}
      </div>
      <div className="bg-white rounded-t-[24px] px-3.5 pt-4 pb-6 min-h-[540px] space-y-1">
        <div className="bg-[#F7F8FF] rounded-2xl p-3.5 text-center border border-[#31358B]/10">
          <div className="mx-auto w-12 h-12 rounded-full bg-white border border-[#31358B]/10 flex items-center justify-center p-1.5">
            <img src={logoDice} alt="" className="w-full h-full object-contain" />
          </div>
          <p className="mt-2 text-[16px] font-black text-[#31358B]">{content.identity.appName}</p>
          <p className="mt-1.5 text-[11px] font-bold text-[#5F6475] leading-relaxed whitespace-pre-line">{content.identity.description}</p>
          {content.identity.chips.length > 0 && (
            <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
              {content.identity.chips.map((chip, i) => (
                <span key={`${chip}-${i}`} className="px-2 py-1 rounded-full bg-[#EEF0FF] text-[#31358B] text-[10px] font-black">{chip}</span>
              ))}
            </div>
          )}
        </div>

        {features.length > 0 && (
          <>
            <PreviewTitle>O que o app oferece</PreviewTitle>
            {features.map((f) => {
              const Icon = ICONS[f.icon];
              return (
                <div key={f.id} className="flex gap-2.5 p-2.5 mt-2 rounded-2xl border border-[#31358B]/10">
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: COLORS[f.color].bg, color: COLORS[f.color].fg }}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-black text-[#31358B] text-[12px]">{f.title}</p>
                    <p className="text-[10.5px] font-bold text-[#666D7E] leading-snug mt-0.5">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {content.mission.visible && (content.mission.mission || content.mission.vision) && (
          <>
            <PreviewTitle>Propósito</PreviewTitle>
            <div className="mt-2 rounded-2xl bg-[#F7F8FF] p-3 space-y-2">
              {content.mission.mission && <p className="text-[11px] font-bold text-[#5F6475] leading-relaxed whitespace-pre-line">{content.mission.mission}</p>}
              {content.mission.vision && (
                <p className="text-[11px] font-bold text-[#5F6475] leading-relaxed">
                  <span className="text-[#31358B] font-black">Visão: </span>
                  {content.mission.vision}
                </p>
              )}
            </div>
          </>
        )}

        {content.team.visible && (
          <>
            <PreviewTitle>Projeto</PreviewTitle>
            <div className="mt-2 rounded-2xl bg-[#F7F8FF] p-3 space-y-2.5">
              {content.team.institution && <PreviewInfo icon={Building2} label="Instituição" value={content.team.institution} />}
              {members.length > 0 && (
                <PreviewInfo icon={Users} label="Equipe" value={members.map((m) => (m.role ? `${m.name} (${m.role})` : m.name)).join(', ')} />
              )}
              {content.team.advisor && (
                <PreviewInfo icon={Award} label="Orientação" value={content.team.advisorTitle ? `${content.team.advisor} · ${content.team.advisorTitle}` : content.team.advisor} />
              )}
            </div>
          </>
        )}

        <PreviewTitle>Aplicativo</PreviewTitle>
        <div className="mt-2 rounded-2xl bg-[#F7F8FF] p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-[#7A7E8B]">Versão</p>
            <p className="text-[15px] font-black text-[#31358B]">1.0.0 <span className="text-[9px] font-bold text-gray-400">(do app)</span></p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: status?.bg, color: status?.fg }}>{content.version.status}</span>
        </div>
        {content.version.changelog.length > 0 && (
          <div className="mt-2 rounded-2xl border border-[#31358B]/10 p-3">
            <button type="button" className="w-full flex items-center justify-between font-black text-[#31358B] text-[11px]" onClick={() => setOpenLog((o) => !o)}>
              Histórico de versões
              <ChevronDown size={14} className={`transition-transform ${openLog ? 'rotate-180' : ''}`} />
            </button>
            {openLog && (
              <div className="mt-2 space-y-2">
                {content.version.changelog.map((entry) => (
                  <div key={entry.id}>
                    <p className="text-[10px] font-black text-[#31358B]">v{entry.version || '?'} · {entry.title}</p>
                    {entry.description && <p className="text-[10px] font-bold text-[#666D7E]">{entry.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {integrations.length > 0 && (
          <>
            <PreviewTitle>APIs e integrações</PreviewTitle>
            {integrations.map((api) => {
              const Icon = ICONS[api.icon];
              const s = STATUS_STYLE[api.status];
              return (
                <div key={api.id} className="flex items-center gap-2 p-2.5 mt-2 rounded-2xl border border-[#31358B]/10">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#EEF0FF] text-[#31358B]"><Icon size={14} /></span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[#31358B] text-[11px]">{api.name}</p>
                    <p className="text-[10px] font-bold text-[#666D7E] leading-snug">{api.usage}</p>
                  </div>
                  <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold" style={{ background: s?.bg, color: s?.fg }}>{api.status}</span>
                </div>
              );
            })}
          </>
        )}

        <div className="mt-4 rounded-[18px] bg-[#31358B] p-3">
          <p className="text-white font-black text-[13px]">{content.identity.appName} ©</p>
          <p className="text-white/85 font-bold text-[10.5px] mt-1 leading-snug">
            Uma solução criada para fortalecer o acesso ao acervo de jogos e transformar a experiência de uso em algo mais organizado, moderno e significativo.
          </p>
        </div>
      </div>
    </div>
  );
}

function PreviewTitle({ children }: { children: ReactNode }) {
  return (
    <div className="pt-4">
      <p className="text-[14px] font-black text-[#31358B]">{children}</p>
      <div className="mt-1.5 w-7 h-1 rounded-full bg-[#FBBC04]" />
    </div>
  );
}

function PreviewInfo({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-black text-[#31358B]"><Icon size={13} /> {label}</p>
      <p className="mt-1 text-[10.5px] font-bold text-[#5F6475] leading-snug">{value}</p>
    </div>
  );
}
