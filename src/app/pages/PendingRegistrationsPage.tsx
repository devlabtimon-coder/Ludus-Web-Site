import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { RegistrationMetricCard } from '../components/pending-registrations/RegistrationMetricCard';
import { PendingRegistrationCard } from '../components/pending-registrations/PendingRegistrationCard';
import { RegistrationDetailsPanel } from '../components/pending-registrations/RegistrationDetailsPanel';
import { Clock, FileText, AlertTriangle, Download } from 'lucide-react';
import { api } from '../../services/api';

interface PendingRegistrationsPageProps {
  onNavigate?: (page: any) => void;
  onLogout?: () => void;
}

export function PendingRegistrationsPage({ onNavigate, onLogout }: PendingRegistrationsPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Integração com API
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      // Supondo a rota do seu backend que lista os usuários pendentes
      const res = await api.get('/admin/users'); 
      const pendings = res.data.filter((u: any) => u.registrationStatus === 'PENDING');
      setPendingUsers(pendings);

      if (pendings.length > 0 && !selectedId) {
        setSelectedId(pendings[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/admin/users/${id}/approve-docs`);
      alert("Cadastro Aprovado!");
      setSelectedId(null);
      fetchUsers();
    } catch (error) {
      alert("Erro ao aprovar.");
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await api.patch(`/admin/users/${id}/reject-docs`, { reason });
      alert("Cadastro Rejeitado!");
      setSelectedId(null);
      fetchUsers();
    } catch (error) {
      alert("Erro ao rejeitar.");
    }
  };

  const selectedRegistration = pendingUsers.find(u => u.id === selectedId) || null;

  // Calculando métricas dinâmicas
  const completos = pendingUsers.filter(u => u.documentFrontImage && u.documentBackImage && u.addressProof).length;
  const incompletos = pendingUsers.length - completos;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activePage="cadastro"
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} onMenuToggle={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8">
          {/* Cabeçalho */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0A1628] mb-2">Cadastro Pendente</h1>
            <p className="text-sm md:text-base text-gray-500">Gerencie e aprove os cadastros enviados pelos usuários</p>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <RegistrationMetricCard
              label="AGUARDANDO ANÁLISE"
              value={pendingUsers.length.toString().padStart(2, '0')}
              tag="Total na fila"
              icon={Clock}
              variant="dark"
              tagColor="blue"
            />
            <RegistrationMetricCard
              label="DOCUMENTOS ENVIADOS"
              value={completos.toString().padStart(2, '0')}
              tag="Completos"
              icon={FileText}
              variant="white"
              tagColor="green"
              iconColor="text-green-500"
            />
            <RegistrationMetricCard
              label="DOC. PENDENTES"
              value={incompletos.toString().padStart(2, '0')}
              tag="Incompletos"
              icon={AlertTriangle}
              variant="yellow"
              tagColor="red"
              iconColor="text-[#04096E]"
            />
          </div>

          {/* Layout de Duas Colunas */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
            
            {/* Coluna Esquerda - Lista de Cadastros */}
            <div className="xl:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 h-full min-h-[500px] flex flex-col">
                {/* Header da Tabela */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Cadastros Aguardando Aprovação</h2>
                  <div className="flex gap-2">
                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      <Download className="text-gray-600" size={20} />
                    </button>
                  </div>
                </div>

                {/* Lista de Cadastros */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                  {pendingUsers.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 font-bold">Nenhum cadastro pendente no momento!</div>
                  ) : (
                    pendingUsers.map((user) => (
                      <PendingRegistrationCard
                        key={user.id}
                        user={user}
                        isSelected={selectedId === user.id}
                        onSelect={() => setSelectedId(user.id)}
                        onApprove={() => handleApprove(user.id)}
                        onReject={() => {
                          const reason = window.prompt("Motivo da rejeição:");
                          if(reason) handleReject(user.id, reason);
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Coluna Direita - Detalhes */}
            <div className="col-span-1 h-[650px]">
              <RegistrationDetailsPanel
                registration={selectedRegistration}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}