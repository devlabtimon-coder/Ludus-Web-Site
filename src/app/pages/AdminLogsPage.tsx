import { useState, useEffect } from 'react';
import { 
  Loader2, ShieldAlert, Ban, CheckCircle, FileText, 
  Package, ArrowRightLeft, Ticket, Calendar, Search 
} from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Avatar } from '../components/shared/Avatar';
import { api } from '../../services/api';
import { toast } from 'sonner';

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
  };
}

export function AdminLogsPage({ onNavigate, onLogout }: { onNavigate?: (p: string) => void, onLogout?: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
     
      const res = await api.get('/admin/logs?limit=100');
      setLogs(res.data);
    } catch (error) {
      toast.error("Erro ao carregar o histórico de auditoria");
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.entityId && log.entityId.includes(searchTerm))
  );

  
  const getActionMeta = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('BLOCK_USER')) return { label: 'Bloqueio de Usuário', color: 'text-red-700 bg-red-50 border-red-200', icon: Ban };
    if (act.includes('UNBLOCK_USER')) return { label: 'Desbloqueio de Usuário', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle };
    if (act.includes('VERIFY_ACADEMIC')) return { label: 'Vínculo SUAP Manual', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: FileText };
    if (act.includes('APPROVE_DOCS')) return { label: 'Aprovação de Documentos', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle };
    if (act.includes('REJECT_DOCS')) return { label: 'Rejeição de Documentos', color: 'text-orange-700 bg-orange-50 border-orange-200', icon: ShieldAlert };
    if (act.includes('REQUEST_DOC')) return { label: 'Solicitação de Documento', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: FileText };
    if (act.includes('STATUS_RETURNED')) return { label: 'Devolução de Aluguel', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: Package };
    if (act.includes('STATUS_CANCELED')) return { label: 'Cancelamento de Aluguel', color: 'text-red-700 bg-red-50 border-red-200', icon: Ban };
    if (act.includes('STATUS_ACTIVE')) return { label: 'Aprovação de Retirada', color: 'text-indigo-700 bg-indigo-50 border-indigo-200', icon: Package };
    if (act.includes('CHANGE_USER_CATEGORY')) return { label: 'Ajuste de Categoria', color: 'text-purple-700 bg-purple-50 border-purple-200', icon: ArrowRightLeft };
    if (act.includes('UPDATE_GAME_TIER')) return { label: 'Ajuste de Tier (Jogo)', color: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200', icon: ArrowRightLeft };
    if (act.includes('GENERATE_COUPONS')) return { label: 'Geração de Cupons', color: 'text-[#9A6B00] bg-[#FFF9E6] border-[#FBBC04]', icon: Ticket };
    
    return { label: action, color: 'text-gray-700 bg-gray-100 border-gray-300', icon: ShieldAlert };
  };

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
      <Sidebar activePage="auditoria" onNavigate={onNavigate} onLogout={onLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onLogout={onLogout} onMenuToggle={() => setSidebarOpen(true)} />

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
                placeholder="Buscar admin ou ação..."
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
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <ShieldAlert className="text-gray-300 mx-auto mb-3" size={42} />
                        <p className="text-gray-500 font-medium">Nenhum log de auditoria encontrado.</p>
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
                              <Avatar name={log.admin.name} size="sm" color="#04096D" />
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
            {!loading && filteredLogs.length > 0 && (
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