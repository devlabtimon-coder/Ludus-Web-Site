import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { RegistrationMetricCard } from '../components/pending-registrations/RegistrationMetricCard';
import { PendingRegistrationCard } from '../components/pending-registrations/PendingRegistrationCard';
import { RegistrationDetailsPanel } from '../components/pending-registrations/RegistrationDetailsPanel';
import { Clock, FileText, AlertTriangle, Download, Filter, X, Loader2 } from 'lucide-react';
import { api, getErrorMessage } from '../../services/api';
import { usersService } from '../../services/usersService';
import { toast } from 'sonner';
import { useConfirmDialog } from '../components/shared/ConfirmDialog';

interface PendingRegistrationsPageProps {
  onNavigate?: (page: any) => void;
  onLogout?: () => void;
}

const PAGE_SIZE = 50;

export function PendingRegistrationsPage({ onNavigate, onLogout }: PendingRegistrationsPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [totalPending, setTotalPending] = useState(0);
  const [pagesLoaded, setPagesLoaded] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
  const { requestConfirm, confirmDialog } = useConfirmDialog();

  const isIfmaMode = import.meta.env.VITE_IFMA_MODE === 'true';

  const checkIsComplete = (u: any) =>
    isIfmaMode
      ? !!(u.enrollmentProof && u.documentFile)
      : !!(u.documentFile && u.addressProof && u.selfieWithId);

  // Só cadastros PENDING, filtrados na API (mais antigos primeiro). Recarrega todas as páginas
  // já abertas para a lista não "pular" itens depois de aprovar ou rejeitar alguém.
  const fetchUsers = async (pages = pagesLoaded) => {
    setError(null);
    try {
      const collected: any[] = [];
      let total = 0;
      let lastPage = 1;
      for (let page = 1; page <= pages; page++) {
        const result = await usersService.getUsersPage({ registrationStatus: 'PENDING', page, limit: PAGE_SIZE });
        // Garantia extra caso a API ainda não filtre por registrationStatus.
        collected.push(...result.data.filter((u: any) => u.registrationStatus === 'PENDING'));
        total = result.total;
        lastPage = page;
        if (page >= result.totalPages) break;
      }
      const unique = collected.filter((u, i) => collected.findIndex((x) => x.id === u.id) === i);
      setPendingUsers(unique);
      setTotalPending(total);
      setPagesLoaded(lastPage);
    } catch (err: any) {
      console.error("Erro ao buscar usuários pendentes:", err);
      setError(getErrorMessage(err, "Não foi possível carregar os cadastros pendentes."));
    }
  };

  const loadInitial = async () => {
    setLoading(true);
    await fetchUsers(1);
    setLoading(false);
  };

  const loadMore = async () => {
    setLoadingMore(true);
    await fetchUsers(pagesLoaded + 1);
    setLoadingMore(false);
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const hasMore = pendingUsers.length < totalPending;

  const completos = useMemo(() => {
    return pendingUsers.filter(checkIsComplete).length;
  }, [pendingUsers, isIfmaMode]);

  const incompletos = pendingUsers.length - completos;

  const filteredUsers = useMemo(() => {
    if (selectedFilter === 'complete') {
      return pendingUsers.filter(checkIsComplete);
    }
    if (selectedFilter === 'incomplete') {
      return pendingUsers.filter((u) => !checkIsComplete(u));
    }
    return pendingUsers;
  }, [pendingUsers, selectedFilter, isIfmaMode]);

  
  useEffect(() => {
    if (filteredUsers.length > 0) {
      const exists = filteredUsers.some((u) => u.id === selectedId);
      if (!exists) {
        setSelectedId(filteredUsers[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [filteredUsers, selectedId]);

  const approve = async (id: string) => {
    await api.patch(`/admin/users/${id}/approve-docs`);
    toast.success("Cadastro aprovado com sucesso!");
    setSelectedId(null);
    fetchUsers();
  };

  const reject = async (id: string, reason: string) => {
    await api.patch(`/admin/users/${id}/reject-docs`, { reason });
    toast.success("Cadastro rejeitado!");
    setSelectedId(null);
    fetchUsers();
  };

  // Aprovar exige os documentos obrigatórios e confirmação com o nome da pessoa.
  const handleApprove = (id: string) => {
    const user = pendingUsers.find((u) => u.id === id);
    if (!user) return;
    if (!checkIsComplete(user)) {
      toast.error("Este cadastro ainda não tem todos os documentos obrigatórios.");
      return;
    }
    requestConfirm({
      title: 'Aprovar cadastro?',
      description: `${user.name} (${user.email}) terá o cadastro aprovado e poderá alugar jogos.`,
      confirmLabel: 'Aprovar cadastro',
      variant: 'default',
      errorMessage: 'Erro ao aprovar cadastro.',
      onConfirm: () => approve(id),
    });
  };

  // Rejeição pelo cartão: pede o motivo no próprio diálogo.
  const handleRejectWithReason = (id: string) => {
    const user = pendingUsers.find((u) => u.id === id);
    if (!user) return;
    requestConfirm({
      title: 'Rejeitar cadastro?',
      description: `O cadastro de ${user.name} (${user.email}) será rejeitado e a pessoa verá o motivo informado.`,
      confirmLabel: 'Rejeitar cadastro',
      reason: { label: 'Motivo da rejeição', placeholder: 'Ex.: documento ilegível, comprovante desatualizado...' },
      errorMessage: 'Erro ao rejeitar cadastro.',
      onConfirm: (reason) => reject(id, reason),
    });
  };

  // Rejeição pelo painel de detalhes: o motivo já foi escrito lá; só confirma.
  const handleReject = (id: string, reason: string) => {
    const user = pendingUsers.find((u) => u.id === id);
    if (!user) return;
    requestConfirm({
      title: 'Rejeitar cadastro?',
      description: `O cadastro de ${user.name} (${user.email}) será rejeitado com o motivo: "${reason}".`,
      confirmLabel: 'Rejeitar cadastro',
      errorMessage: 'Erro ao rejeitar cadastro.',
      onConfirm: () => reject(id, reason),
    });
  };

  const handleRequestResendDoc = async (id: string, documentName: string) => {
    try {
      const cleanName = documentName.replace(/^\d+\.\s*/, '');
      
      const res = await api.post(`/admin/users/${id}/request-doc`, { 
        documentName: cleanName 
      });

      toast.success(res.data?.message || "Solicitação enviada com sucesso!");
    } catch (error: any) {
      console.error("Erro retornado pela API:", error);
      
      const mensagemErro = error?.response?.data?.error || "Erro desconhecido ao solicitar reenvio.";
      toast.error(mensagemErro);
    }
  };

  const selectedRegistration = pendingUsers.find((u) => u.id === selectedId) || null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        activePage="cadastro"
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          onLogout={onLogout} 
          onMenuToggle={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628] mb-2">Cadastro Pendente</h1>
            <p className="text-sm md:text-base text-gray-500">Gerencie e aprove os cadastros enviados pelos usuários</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <RegistrationMetricCard
              label="AGUARDANDO ANÁLISE"
              value={totalPending.toString().padStart(2, '0')}
              tag="Total na fila"
              icon={Clock}
              variant="dark"
              tagColor="blue"
              onClick={() => {
                setSelectedFilter('all');
                toast.info("Exibindo toda a fila de cadastros");
              }}
            />
            <RegistrationMetricCard
              label="DOCUMENTOS ENVIADOS"
              value={completos.toString().padStart(2, '0')}
              tag={hasMore ? `Completos (dos ${pendingUsers.length} carregados)` : "Completos"}
              icon={FileText}
              variant="white"
              tagColor="green"
              iconColor="text-green-500"
              onClick={() => {
                const next = selectedFilter === 'complete' ? 'all' : 'complete';
                setSelectedFilter(next);
                if (next === 'complete') toast.info("Filtrando cadastros com documentação completa");
              }}
            />
            <RegistrationMetricCard
              label="DOC. PENDENTES"
              value={incompletos.toString().padStart(2, '0')}
              tag={hasMore ? `Incompletos (dos ${pendingUsers.length} carregados)` : "Incompletos"}
              icon={AlertTriangle}
              variant="yellow"
              tagColor="red"
              iconColor="text-[#04096E]"
              onClick={() => {
                const next = selectedFilter === 'incomplete' ? 'all' : 'incomplete';
                setSelectedFilter(next);
                if (next === 'incomplete') toast.info("Filtrando cadastros com pendências de envio");
              }}
            />
          </div>

          {selectedFilter !== 'all' && (
            <div className="mb-6 flex items-center justify-between bg-blue-50 border border-blue-200 text-[#04096E] px-4 py-3 rounded-2xl text-sm font-bold animate-in fade-in duration-200">
              <span className="flex items-center gap-2">
                <Filter size={16} />
                Filtro ativo: {selectedFilter === 'complete' ? 'Documentos Completos' : 'Documentos com Pendências'}
              </span>
              <button
                onClick={() => setSelectedFilter('all')}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white px-3 py-1.5 rounded-xl border border-blue-200 transition-colors shadow-xs"
              >
                <X size={14} /> Limpar filtro
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6 items-start">
            <div className="xl:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 h-full min-h-[500px] flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">
                    Cadastros Aguardando Aprovação ({selectedFilter === 'all' ? totalPending : filteredUsers.length})
                  </h2>
                  <div className="flex gap-2">
                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                      <Download className="text-gray-600" size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <Loader2 className="animate-spin text-[#04096E] mb-3" size={28} />
                      <p className="font-bold text-sm">Carregando cadastros pendentes...</p>
                    </div>
                  ) : error ? (
                    <div role="alert" className="flex flex-col items-center justify-center text-center py-12 px-4">
                      <AlertTriangle className="text-[#E62325] mb-3" size={32} />
                      <p className="font-bold text-sm text-gray-900 mb-1">Não foi possível carregar os cadastros.</p>
                      <p className="text-sm text-gray-500 mb-4">{error}</p>
                      <button
                        onClick={loadInitial}
                        className="px-4 py-2 rounded-xl bg-[#04096E] hover:bg-[#02065A] text-white text-sm font-bold transition-colors"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 font-bold text-sm">
                      {selectedFilter === 'all'
                        ? 'Nenhum cadastro pendente no momento! 🎉'
                        : 'Nenhum cadastro encontrado para este filtro.'}
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <PendingRegistrationCard
                        key={user.id}
                        user={user}
                        isSelected={selectedId === user.id}
                        onSelect={() => setSelectedId(user.id)}
                        onApprove={() => handleApprove(user.id)}
                        onReject={() => handleRejectWithReason(user.id)}
                      />
                    ))
                  )}

                  {!loading && !error && hasMore && (
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-[#04096E] hover:bg-gray-50 transition-colors disabled:opacity-60"
                    >
                      {loadingMore && <Loader2 size={16} className="animate-spin" />}
                      Carregar mais ({pendingUsers.length} de {totalPending})
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-1 h-auto xl:h-[650px]">
              <RegistrationDetailsPanel
                registration={selectedRegistration}
                onApprove={handleApprove}
                onReject={handleReject}
                onRequestResendDoc={handleRequestResendDoc}
              />
            </div>
          </div>
        </main>
      </div>
      {confirmDialog}
    </div>
  );
}