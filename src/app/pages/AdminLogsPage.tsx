import { useState, useEffect } from 'react';
import { 
  Loader2, ShieldAlert, Ban, CheckCircle, FileText, 
  Package, ArrowRightLeft, Ticket, Calendar, Search,
  Trophy, Gamepad2, Boxes, Puzzle, Tags, Info, Trash2, AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Avatar } from '../components/shared/Avatar';
import { api, getErrorMessage } from '../../services/api';

interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  entityId: string | null;
  details: any;
  createdAt: string;
  admin: {
    name: string;
    email: string;
    avatar?: string | null;
    picture?: string | null;
  };
}

interface ActionMeta {
  label: string;
  color: string;
  icon: LucideIcon;
}

const COLORS = {
  red: 'text-red-700 bg-red-50 border-red-200',
  green: 'text-green-700 bg-green-50 border-green-200',
  emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  blue: 'text-blue-700 bg-blue-50 border-blue-200',
  indigo: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  orange: 'text-orange-700 bg-orange-50 border-orange-200',
  yellow: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  purple: 'text-purple-700 bg-purple-50 border-purple-200',
  fuchsia: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200',
  gold: 'text-[#9A6B00] bg-[#FFF9E6] border-[#FBBC04]',
  gray: 'text-gray-700 bg-gray-100 border-gray-300',
};

// Mapa exato código → rótulo. Antes era por `includes`, e UNBLOCK_USER caía em "Bloqueio"
// porque contém BLOCK_USER.
const ACTION_META: Record<string, ActionMeta> = {
  BLOCK_USER: { label: 'Bloqueio de Usuário', color: COLORS.red, icon: Ban },
  UNBLOCK_USER: { label: 'Desbloqueio de Usuário', color: COLORS.green, icon: CheckCircle },
  VERIFY_ACADEMIC_MANUAL: { label: 'Vínculo SUAP Manual', color: COLORS.blue, icon: FileText },
  APPROVE_DOCS: { label: 'Aprovação de Documentos', color: COLORS.green, icon: CheckCircle },
  REJECT_DOCS: { label: 'Rejeição de Documentos', color: COLORS.orange, icon: ShieldAlert },
  REQUEST_DOC: { label: 'Solicitação de Documento', color: COLORS.yellow, icon: FileText },
  CHANGE_RENTAL_STATUS_RETURNED: { label: 'Devolução de Aluguel', color: COLORS.emerald, icon: Package },
  CHANGE_RENTAL_STATUS_CANCELED: { label: 'Cancelamento de Aluguel', color: COLORS.red, icon: Ban },
  CHANGE_RENTAL_STATUS_ACTIVE: { label: 'Aprovação de Retirada', color: COLORS.indigo, icon: Package },
  CHANGE_USER_CATEGORY: { label: 'Ajuste de Categoria', color: COLORS.purple, icon: ArrowRightLeft },
  UPDATE_GAME_TIER: { label: 'Ajuste de Tier (Jogo)', color: COLORS.fuchsia, icon: ArrowRightLeft },
  GENERATE_COUPONS: { label: 'Geração de Cupons', color: COLORS.gold, icon: Ticket },
  GENERATE_SEASON_COUPONS: { label: 'Geração de Cupons da Temporada', color: COLORS.gold, icon: Ticket },
  UPDATE_ABOUT_PAGE: { label: 'Edição da Página Sobre', color: COLORS.blue, icon: Info },
  CREATE_SEASON: { label: 'Criação de Temporada', color: COLORS.green, icon: Trophy },
  UPDATE_SEASON: { label: 'Edição de Temporada', color: COLORS.blue, icon: Trophy },
  DELETE_SEASON: { label: 'Exclusão de Temporada', color: COLORS.red, icon: Trash2 },
  CREATE_GAME: { label: 'Cadastro de Jogo', color: COLORS.green, icon: Gamepad2 },
  UPDATE_GAME: { label: 'Edição de Jogo', color: COLORS.blue, icon: Gamepad2 },
  DELETE_GAME: { label: 'Exclusão de Jogo', color: COLORS.red, icon: Trash2 },
  INACTIVATE_GAME: { label: 'Inativação de Jogo', color: COLORS.orange, icon: Gamepad2 },
  CREATE_COPY: { label: 'Cadastro de Exemplar', color: COLORS.green, icon: Boxes },
  UPDATE_COPY: { label: 'Edição de Exemplar', color: COLORS.blue, icon: Boxes },
  DELETE_COPY: { label: 'Exclusão de Exemplar', color: COLORS.red, icon: Trash2 },
  CREATE_COMPONENT: { label: 'Cadastro de Componente', color: COLORS.green, icon: Puzzle },
  UPDATE_COMPONENT: { label: 'Edição de Componente', color: COLORS.blue, icon: Puzzle },
  DELETE_COMPONENT: { label: 'Exclusão de Componente', color: COLORS.red, icon: Trash2 },
  CREATE_MECHANIC: { label: 'Cadastro de Mecânica', color: COLORS.green, icon: Tags },
  UPDATE_MECHANIC: { label: 'Edição de Mecânica', color: COLORS.blue, icon: Tags },
  DELETE_MECHANIC: { label: 'Exclusão de Mecânica', color: COLORS.red, icon: Trash2 },
};

// Código novo que ainda não está no mapa: "SOME_NEW_ACTION" vira "Some new action".
const humanizeAction = (action: string) => {
  const text = action.replace(/[_-]+/g, ' ').trim().toLowerCase();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : 'Ação desconhecida';
};

const getActionMeta = (action: string): ActionMeta =>
  ACTION_META[(action || '').toUpperCase()] || { label: humanizeAction(action || ''), color: COLORS.gray, icon: ShieldAlert };

export function AdminLogsPage() { // <-- Props removidas
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/logs?limit=100');
      setLogs(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch (err) {
      setError(getErrorMessage(err, "Erro ao carregar o histórico de auditoria."));
    } finally {
      setLoading(false);
    }
  };

  // A busca também casa com o rótulo em português (ex.: "desbloqueio").
  const term = searchTerm.trim().toLowerCase();
  const filteredLogs = logs.filter(log => 
    !term ||
    (log.admin?.name || '').toLowerCase().includes(term) ||
    (log.admin?.email || '').toLowerCase().includes(term) ||
    (log.action || '').toLowerCase().includes(term) ||
    getActionMeta(log.action).label.toLowerCase().includes(term) ||
    (log.entityId && log.entityId.toLowerCase().includes(term))
  );

  const formatDetails = (details: any) => {
    if (!details) return <span className="text-gray-400 italic">Sem detalhes</span>;
    if (typeof details !== 'object') return String(details);
    
    return (
      <div className="flex flex-col gap-1">
        {Object.entries(details).map(([key, value]) => (
          <span key={key} className="text-[11px] bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-600 inline-block w-fit">
            <strong className="text-gray-800 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {String(value)}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#F5F5F7] overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-black text-[28px] text-[#04096D] leading-tight">Logs de Auditoria</h1>
              <p className="mt-1 text-sm font-medium text-gray-500">Histórico inalterável de ações críticas executadas por administradores</p>
            </div>
            
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar admin, ação ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#04096D]/20 text-sm bg-white"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-[#F7F8FF] border-b border-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-xs font-bold text-[#31358B] uppercase tracking-wide">Data e Hora</th>
                    <th className="py-4 px-6 text-xs font-bold text-[#31358B] uppercase tracking-wide">Administrador</th>
                    <th className="py-4 px-6 text-xs font-bold text-[#31358B] uppercase tracking-wide">Ação Realizada</th>
                    <th className="py-4 px-6 text-xs font-bold text-[#31358B] uppercase tracking-wide">ID Alvo</th>
                    <th className="py-4 px-6 text-xs font-bold text-[#31358B] uppercase tracking-wide">Contexto / Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <Loader2 className="animate-spin text-[#04096D] mx-auto mb-2" size={32} />
                        <p className="text-gray-500 font-medium">Carregando histórico...</p>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <AlertTriangle className="text-red-500 mx-auto mb-3" size={36} />
                        <p className="text-gray-900 font-bold mb-1">Não foi possível carregar o histórico.</p>
                        <p className="text-sm text-gray-500 mb-4">{error}</p>
                        <button
                          onClick={fetchLogs}
                          className="px-4 py-2 rounded-xl bg-[#04096D] hover:bg-[#070e99] text-white text-sm font-bold transition-colors"
                        >
                          Tentar novamente
                        </button>
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <ShieldAlert className="text-gray-300 mx-auto mb-3" size={42} />
                        <p className="text-gray-500 font-medium">
                          {term ? 'Nenhum log encontrado para esta busca.' : 'Nenhum log de auditoria encontrado.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const meta = getActionMeta(log.action);
                      const Icon = meta.icon;
                      return (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleDateString('pt-BR')} às {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              
                              <Avatar 
                                name={log.admin.name} 
                                src={log.admin.avatar || log.admin.picture} 
                                size="sm" 
                                color="#04096D" 
                              />
                              <div>
                                <p className="text-sm font-bold text-gray-900">{log.admin.name}</p>
                                <p className="text-xs text-gray-500">{log.admin.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold uppercase tracking-wide whitespace-nowrap ${meta.color}`}>
                              <Icon size={14} />
                              {meta.label}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {log.entityId ? log.entityId.split('-')[0] + '...' : 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            {formatDetails(log.details)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {!loading && !error && filteredLogs.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Exibindo os {filteredLogs.length} logs mais recentes</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}