import { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { UsersMetricCard } from "../components/users/UsersMetricCard";
import { CategoryProgressionCard } from "../components/users/CategoryProgressionCard"; // <-- Importado aqui
import { UsersManagementTable } from "../components/users/UsersManagementTable";
import { Loading } from "../components/shared/Loading";
import { ErrorMessage } from "../components/shared/ErrorMessage";
import { Users, Star, UserPlus } from "lucide-react";
import { useUsers } from "../../hooks";
import { api } from "../../services/api";
import { toast } from "sonner";
import { ClientCategory } from "../../../types/api";

interface UsersPageProps {
  onNavigate: (
    page:
      | "dashboard"
      | "acervo"
      | "emprestimos"
      | "usuarios"
      | "cadastro"
      | "relatorios"
      | "login",
  ) => void;
  onLogout?: () => void;
}

export function UsersPage({ onNavigate, onLogout }: UsersPageProps) {
  const { metrics, users, total, loading, error, refetch } = useUsers();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleUpdateCategory = async (
    userId: string,
    category: ClientCategory,
  ) => {
    try {
      await api.patch(`/categories/users/${userId}/category`, {
        clientCategory: category,
      });
      toast.success("Categoria alterada com sucesso!");
      refetch();
    } catch (err) {
      console.error("Erro ao alterar categoria:", err);
      toast.error("Erro ao atualizar categoria do usuário.");
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activePage="usuarios"
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onLogout={onLogout}
          onMenuToggle={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-8">
          <h1 className="text-3xl font-bold text-[#02096D] mb-8">
            Gestão de Usuários
          </h1>

          <div className="grid grid-cols-3 gap-6 mb-8">
            <UsersMetricCard
              title="Total de Membros"
              value={(metrics?.totalMembers || 0).toLocaleString("pt-BR")}
              tag="Na plataforma"
              icon={<Users size={96} strokeWidth={1.5} />}
              variant="dark-blue"
            />
            <UsersMetricCard
              title="VIPs Ultragamer"
              value={metrics?.vipUltragamer || 0}
              tag="Alto engajamento"
              icon={<Star size={96} strokeWidth={1.5} />}
              variant="white-gold"
            />
            <UsersMetricCard
              title="Novos Cadastros"
              value={metrics?.newRegistrations || 0}
              tag="Últimos 7 dias"
              icon={<UserPlus size={96} strokeWidth={1.5} />}
              variant="yellow"
            />
          </div>

          {/* O novo card entra aqui! */}
          <CategoryProgressionCard />

          <UsersManagementTable
            users={users}
            totalUsers={total}
            onUpdateCategory={handleUpdateCategory}
            onRefresh={refetch}
          />
        </main>
      </div>
    </div>
  );
}