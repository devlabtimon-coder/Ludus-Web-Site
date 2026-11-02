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
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { SearchInput } from "../components/shared/SearchInput";
import { PaginationControls } from "../components/shared/PaginationControls";
import { api } from "../../services/api";
import { toast } from "sonner";
import { ClientCategory, User } from "../../types/api";

const PAGE_SIZE = 25;

// Usada só nos recortes dos cartões (VIPs / novos), que já vêm completos da varredura.
const matchesSearch = (user: User, term: string) => {
  const needle = term.toLowerCase();
  return [user.name, user.email, user.matricula, user.phone]
    .some((field) => (field || "").toLowerCase().includes(needle));
};

export function UsersPage() { 
  const navigate = useNavigate(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ultragamer' | 'recent'>('all');
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  // A página volta para 1 sempre que a busca muda (sem disparar uma consulta extra).
  const [pageState, setPageState] = useState({ key: debouncedSearch, page: 1 });
  const page = pageState.key === debouncedSearch ? pageState.page : 1;

  const query = useMemo(
    () => ({ q: debouncedSearch || undefined, page, limit: PAGE_SIZE }),
    [debouncedSearch, page],
  );

  const {
    metrics,
    users,
    ultragamerUsers,
    recentUsers,
    total,
    totalPages,
    initialLoading,
    refreshing,
    hasLoaded,
    error,
    refetch,
  } = useUsers(query);

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

  // Cartões VIP / novos mostram o recorte completo vindo da varredura; o resto é a página da API.
  const cardFilteredUsers = useMemo(() => {
    if (selectedFilter === 'all') return null;
    const list = selectedFilter === 'ultragamer' ? ultragamerUsers : recentUsers;
    return debouncedSearch ? list.filter((u) => matchesSearch(u, debouncedSearch)) : list;
  }, [selectedFilter, ultragamerUsers, recentUsers, debouncedSearch]);

  if (initialLoading) return <Loading />;
  if (error && !hasLoaded) return <ErrorMessage message={error} onRetry={refetch} />;

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
              value={(metrics?.totalMembers ?? total).toLocaleString("pt-BR")}
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

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nome, e-mail, matrícula ou telefone"
            loading={refreshing && search.trim() !== '' && search.trim() === debouncedSearch}
            className="mb-4"
          />

          {error && hasLoaded && (
            <div role="alert" className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span className="font-semibold">{error}</span>
              <button
                onClick={refetch}
                className="self-start sm:self-auto bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          <div className={refreshing ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <UsersManagementTable
              users={cardFilteredUsers ?? users}
              totalUsers={cardFilteredUsers ? cardFilteredUsers.length : total}
              onUpdateCategory={handleUpdateCategory}
              onRefresh={refetch}
              emptyMessage={debouncedSearch ? 'Nenhum usuário encontrado para esta busca.' : 'Nenhum usuário encontrado.'}
            />
          </div>

          {cardFilteredUsers ? (
            <p className="mt-4 text-xs sm:text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{cardFilteredUsers.length.toLocaleString('pt-BR')}</span>{' '}
              {cardFilteredUsers.length === 1 ? 'usuário' : 'usuários'} neste filtro
            </p>
          ) : (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              loading={refreshing}
              onPageChange={(next) => setPageState({ key: debouncedSearch, page: next })}
              itemLabel={{ singular: 'usuário', plural: 'usuários' }}
            />
          )}
        </main>
      </div>
    </div>
  );
}