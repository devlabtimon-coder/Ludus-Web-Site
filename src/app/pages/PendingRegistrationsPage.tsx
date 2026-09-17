import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { RegistrationMetricCard } from '../components/pending-registrations/RegistrationMetricCard';
import { PendingRegistrationCard } from '../components/pending-registrations/PendingRegistrationCard';
import { RegistrationDetailsPanel } from '../components/pending-registrations/RegistrationDetailsPanel';
import { Clock, FileText, AlertTriangle, Download, Filter, X } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface PendingRegistrationsPageProps {
  onNavigate?: (page: any) => void;
  onLogout?: () => void;
}

export function PendingRegistrationsPage({ onNavigate, onLogout }: PendingRegistrationsPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'complete' | 'incomplete'>('all');

  const isIfmaMode = import.meta.env.VITE_IFMA_MODE === 'true';

  const checkIsComplete = (u: any) =>
    isIfmaMode
      ? !!(u.enrollmentProof && u.documentFile)
      : !!(u.documentFile && u.addressProof && u.selfieWithId);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      
      
      const usersList = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      const pendings = usersList.filter((u: any) => u.registrationStatus === 'PENDING');
      setPendingUsers(pendings);
      
      if (pendings.length > 0 && !selectedId) {
        setSelectedId(pendings[0].id);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários pendentes:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/admin/users/${id}/approve-docs`);
      toast.success("Cadastro aprovado com sucesso!");
      setSelectedId(null);
      fetchUsers();
    } catch (error) {
      toast.error("Erro ao aprovar cadastro.");
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await api.patch(`/admin/users/${id}/reject-docs`, { reason });
      toast.success("Cadastro rejeitado!");
      setSelectedId(null);
      fetchUsers();
    } catch (error) {
      toast.error("Erro ao rejeitar cadastro.");
    }
  };

  const handleRequestResendDoc = async (id: string, documentName: string) => {
    try {
    
      const cleanDocumentName = documentName.replace(/^\d+\.\s*/, '');
      
      await api.post(`/admin/users/${id}/request-doc`, { documentName: cleanDocumentName });
      toast.success(`Solicitação de reenvio (${cleanDocumentName}) enviada ao usuário!`);
    } catch (error: any) {
      console.error("Erro detalhado ao solicitar reenvio:", error?.response || error);
      toast.error(error?.response?.data?.error || "Erro ao enviar notificação de reenvio.");
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
              value={pendingUsers.length.toString().padStart(2, '0')}
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
              tag="Completos"
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
              tag="Incompletos"
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
                    Cadastros Aguardando Aprovação ({filteredUsers.length})
                  </h2>
                  <div className="flex gap-2">
                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                      <Download className="text-gray-600" size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {filteredUsers.length === 0 ? (
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
                        onReject={() => {
                          const reason = window.prompt("Motivo da rejeição:");
                          if (reason) handleReject(user.id, reason);
                        }}
                      />
                    ))
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
    </div>
  );
}