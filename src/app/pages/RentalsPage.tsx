import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { RentalMetricCard } from '../components/rentals/RentalMetricCard';
import { RentalsTable } from '../components/rentals/RentalsTable';
import { RentalsFilters, VisualRentalStatus, SortOption } from '../components/rentals/RentalsFilters';
import { Loading } from '../components/shared/Loading';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { PlaySquare, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { SearchInput } from '../components/shared/SearchInput';
import { PaginationControls } from '../components/shared/PaginationControls';

import { useRentals } from '../../hooks';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import type { AdminRentalsQuery } from '../../services/rentalsService';
import type { RentalStatus } from '../../types/api';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface RentalsPageProps {
  onNavigate?: (
    page:
      | 'dashboard'
      | 'acervo'
      | 'emprestimos'
      | 'usuarios'
      | 'cadastro'
      | 'relatorios'
      | 'mecanicas'
      | 'temporadas'
      | 'ranking'
      | 'auditoria'
      | 'manutencao'
      | 'login'
  ) => void;
  onLogout?: () => void;
}

const PAGE_SIZE = 25;

// Cada filtro visual vira um filtro da API, para valer sobre todos os empréstimos e não só a página carregada.
const STATUS_QUERY: Record<VisualRentalStatus, Pick<AdminRentalsQuery, 'status' | 'overdue'>> = {
  todos: { status: 'ALL' },
  pendente: { status: 'PENDING' },
  andamento: { status: 'ACTIVE' },
  atrasado: { overdue: true },
  devolvido: { status: 'RETURNED' },
  cancelado: { status: 'CANCELED' },
};

export function RentalsPage({ onNavigate, onLogout }: RentalsPageProps) {
  const [searchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<VisualRentalStatus>('todos');
  const [selectedSort, setSelectedSort] = useState<SortOption>('recent');
  const [search, setSearch] = useState(() => searchParams.get('q') || '');
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  // A página volta para 1 sempre que o filtro ou a busca mudam (sem disparar uma consulta extra).
  const filterKey = `${selectedStatus}|${debouncedSearch}`;
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;

  const query = useMemo<AdminRentalsQuery>(() => ({
    ...STATUS_QUERY[selectedStatus],
    q: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  }), [selectedStatus, debouncedSearch, page]);

  const { metrics, rentals, total, totalPages, initialLoading, refreshing, hasLoaded, error, refetch } = useRentals(query);

  const toggleStatus = (status: VisualRentalStatus) => {
    setSelectedStatus(selectedStatus === status ? 'todos' : status);
  };

  const handleUpdateStatus = async (id: string, status: RentalStatus, extraData?: { applyPenalty: boolean; penaltyReason: string }) => {
    try {
      await api.patch(`/admin/rentals/${id}/status`, { status, ...extraData });
    } catch (error) {
      // A situação pode ter mudado (ex.: outro admin já agiu): recarrega e devolve o erro para o diálogo.
      refetch();
      throw error;
    }
    toast.success('Status do aluguel atualizado com sucesso!');
    refetch();
  };

  // A ordenação vale para a página exibida; a API já entrega do mais recente para o mais antigo.
  const sortedRentals = useMemo(() => {
    const sorted = [...rentals];
    sorted.sort((a, b) => {
      const userA = a.user?.name || '';
      const userB = b.user?.name || '';
      const gameA = a.game?.title || a.gameTitleSnapshot || '';
      const gameB = b.game?.title || b.gameTitleSnapshot || '';

      switch (selectedSort) {
        case 'user-asc': return userA.localeCompare(userB);
        case 'user-desc': return userB.localeCompare(userA);
        case 'game-asc': return gameA.localeCompare(gameB);
        case 'game-desc': return gameB.localeCompare(gameA);
        case 'recent': return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        case 'oldest': return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'due-soon': return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        default: return 0;
      }
    });
    return sorted;
  }, [rentals, selectedSort]);

  if (initialLoading) return <Loading />;
  if (error && !hasLoaded) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        activePage="emprestimos"
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

        <main className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#02096D] mb-6 md:mb-8">
            Empréstimos
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <RentalMetricCard
              title="Ativos"
              value={metrics?.active || 0}
              tag="Rodando"
              icon={<PlaySquare size={80} strokeWidth={1.5} />}
              variant="yellow"
              onClick={() => toggleStatus('andamento')}
            />
            <RentalMetricCard
              title="Em Atraso"
              value={metrics?.late || 0}
              tag="Ação necessária"
              icon={<AlertCircle size={80} strokeWidth={1.5} />}
              variant="white-red"
              onClick={() => toggleStatus('atrasado')}
            />
            <RentalMetricCard
              title="Pendentes"
              value={metrics?.pending || 0}
              tag="Aguardando retirada"
              icon={<Clock size={80} strokeWidth={1.5} />}
              variant="dark-blue"
              onClick={() => toggleStatus('pendente')}
            />
            <RentalMetricCard
              title="Devolvidos (Mês)"
              value={metrics?.returnedThisMonth || 0}
              tag="Retirados neste mês"
              icon={<CheckCircle size={80} strokeWidth={1.5} />}
              variant="white-green"
              onClick={() => toggleStatus('devolvido')}
            />
          </div>

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por aluno, e-mail, jogo ou código do exemplar"
            loading={refreshing && search.trim() !== '' && search.trim() === debouncedSearch}
            className="mb-4"
          />

          <RentalsFilters
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            resultCount={total}
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
            <RentalsTable 
              rentals={sortedRentals} 
              onUpdateStatus={handleUpdateStatus} 
              emptyMessage={debouncedSearch ? 'Nenhum empréstimo encontrado para esta busca.' : 'Nenhum empréstimo encontrado para este filtro.'}
            />
          </div>

          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={PAGE_SIZE}
            loading={refreshing}
            onPageChange={(next) => setPageState({ key: filterKey, page: next })}
            itemLabel={{ singular: 'empréstimo', plural: 'empréstimos' }}
          />
        </main>
      </div>
    </div>
  );
}
