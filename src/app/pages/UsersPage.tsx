
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { UsersMetricCard } from "../components/users/UsersMetricCard";
import { CategoryProgressionCard } from "../components/users/CategoryProgressionCard";
import { UsersManagementTable } from "../components/users/UsersManagementTable";
import { Loading } from "../components/shared/Loading";
import { ErrorMessage } from "../components/shared/ErrorMessage";
import { Users, Star, UserPlus, Filter, X } from "lucide-react";
import { useUsers } from "../../hooks";
import { api } from "../../services/api";
import { toast } from "sonner";
import { ClientCategory } from "../../types/api";

export function UsersPage() { 
  const navigate = useNavigate(); 
  const { metrics, users, total, loading, error, refetch } = useUsers();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ultragamer' | 'recent'>('all');

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

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    let list = [...users];

    if (selectedFilter === 'ultragamer') {
      list = list.filter((u) => u.clientCategory === 'ULTRAGAMER');
    } else if (selectedFilter === 'recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      list = list.filter((u) => u.createdAt && new Date(u.createdAt) >= sevenDaysAgo);
    }

    return list;
  }, [users, selectedFilter]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        activePage="usuarios"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuToggle={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#02096D] mb-6 sm:mb-8">
            Gestão de Usuários
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <UsersMetricCard
              title="Total de Membros"
              value={(metrics?.totalMembers || 0).toLocaleString("pt-BR")}
              tag="Na plataforma"
              icon={<Users size={80} strokeWidth={1.5} />}
              variant="dark-blue"
              onClick={() => {
                setSelectedFilter('all');
                toast.info("Exibindo todos os membros");
              }}
            />
            <UsersMetricCard
              title="VIPs Ultragamer"
              value={metrics?.vipUltragamer || 0}
              tag="Alto engajamento"
              icon={<Star size={80} strokeWidth={1.5} />}
              variant="white-gold"
              onClick={() => {
                const next = selectedFilter === 'ultragamer' ? 'all' : 'ultragamer';
                setSelectedFilter(next);
                if (next === 'ultragamer') toast.info("Filtrando por membros Ultragamer");
              }}
            />
            <UsersMetricCard
              title="Novos Cadastros"
              value={metrics?.newRegistrations || 0}
              tag="Últimos 7 dias"
              icon={<UserPlus size={80} strokeWidth={1.5} />}
              variant="yellow"
              onClick={() => {
                const next = selectedFilter === 'recent' ? 'all' : 'recent';
                setSelectedFilter(next);
                if (next === 'recent') toast.info("Filtrando cadastros dos últimos 7 dias");
              }}
            />
          </div>

        
          {selectedFilter !== 'all' && (
            <div className="mb-6 flex items-center justify-between bg-blue-50 border border-blue-200 text-[#02096D] px-4 py-3 rounded-2xl text-sm font-bold animate-in fade-in duration-200">
              <span className="flex items-center gap-2">
                <Filter size={16} />
                Filtro ativo: {selectedFilter === 'ultragamer' ? 'Membros VIP Ultragamer' : 'Novos Cadastros (Últimos 7 dias)'}
              </span>
              <button
                onClick={() => setSelectedFilter('all')}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white px-3 py-1.5 rounded-xl border border-blue-200 transition-colors shadow-xs"
              >
                <X size={14} /> Limpar filtro
              </button>
            </div>
          )}

          <CategoryProgressionCard />

          <UsersManagementTable
            users={filteredUsers}
            totalUsers={filteredUsers.length}
            onUpdateCategory={handleUpdateCategory}
            onRefresh={refetch}
          />
        </main>
      </div>
    </div>
  );
}