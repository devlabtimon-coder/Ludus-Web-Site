import { useState, useMemo } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { RentalMetricCard } from '../components/rentals/RentalMetricCard';
import { RentalsTable } from '../components/rentals/RentalsTable';
import { RentalsFilters, VisualRentalStatus, SortOption } from '../components/rentals/RentalsFilters';
import { Loading } from '../components/shared/Loading';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { PlaySquare, AlertCircle, Clock, CheckCircle } from 'lucide-react';

// 👉 Aqui está o pulo do gato: puxando a API real!
import { useRentals } from '../../hooks';

interface RentalsPageProps {
  onNavigate?: (page: 'dashboard' | 'acervo' | 'emprestimos' | 'usuarios' | 'cadastro' | 'relatorios' | 'login') => void;
  onLogout?: () => void;
}

export function RentalsPage({ onNavigate, onLogout }: RentalsPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<VisualRentalStatus>('todos');
  const [selectedSort, setSelectedSort] = useState<SortOption>('recent');

  // Variáveis da API Real
  const { metrics, rentals, loading, error, refetch, updateStatus } = useRentals();

  // Aplica o filtro e ordenação da UI em cima dos dados que vieram do banco
  const filteredAndSortedRentals = useMemo(() => {
    if (!rentals) return [];
    
    let filtered = [...rentals];
    const now = new Date();

    if (selectedStatus !== 'todos') {
      filtered = filtered.filter(rental => {
        const endDate = new Date(rental.endDate);
        const isLate = (rental.status === 'ACTIVE' || rental.status === 'PENDING') && endDate < now;

        if (selectedStatus === 'andamento') return rental.status === 'ACTIVE' && !isLate;
        if (selectedStatus === 'atrasado') return isLate;
        if (selectedStatus === 'pendente') return rental.status === 'PENDING' && !isLate;
        if (selectedStatus === 'concluido') return rental.status === 'RETURNED';
        return true;
      });
    }

    filtered.sort((a, b) => {
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

    return filtered;
  }, [rentals, selectedStatus, selectedSort]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activePage="emprestimos"
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} onMenuToggle={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 xl:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#02096D] mb-6 md:mb-8">Empréstimos</h1>

          {/* Cards usando as métricas do banco de dados */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <RentalMetricCard
              title="Ativos"
              value={metrics?.active || 0}
              tag="Rodando"
              icon={<PlaySquare size={96} strokeWidth={1.5} />}
              variant="yellow"
            />
            <RentalMetricCard
              title="Em Atraso"
              value={metrics?.late || 0}
              tag="Ação necessária"
              icon={<AlertCircle size={96} strokeWidth={1.5} />}
              variant="white-red"
            />
            <RentalMetricCard
              title="Pendentes"
              value={metrics?.pending || 0}
              tag="Aguardando retirada"
              icon={<Clock size={96} strokeWidth={1.5} />}
              variant="dark-blue"
            />
            <RentalMetricCard
              title="Devolvidos (Mês)"
              value={metrics?.returnedThisMonth || 0}
              tag="Últimos 30 dias"
              icon={<CheckCircle size={96} strokeWidth={1.5} />}
              variant="white-green"
            />
          </div>

          <RentalsFilters
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            resultCount={filteredAndSortedRentals.length}
          />

          <RentalsTable 
            rentals={filteredAndSortedRentals} 
            onUpdateStatus={updateStatus} 
          />
        </main>
      </div>
    </div>
  );
}