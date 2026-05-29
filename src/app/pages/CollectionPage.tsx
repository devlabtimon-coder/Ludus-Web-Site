import { useState, useMemo } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { CollectionMetricCard } from '../components/collection/CollectionMetricCard';
import { GamesCatalogTable } from '../components/collection/GamesCatalogTable';
import { Loading } from '../components/shared/Loading';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { useGames } from '../../hooks';
import { Library, CheckCircle2, PackageMinus, Wrench } from 'lucide-react';
import { Game } from '../../../types/api';
import { api } from '../../services/api';
import { toast } from 'sonner';

// Modais e Filtros
import { CollectionFiltersBar, GameCategory, GameStatus, SortOption } from '../components/collection/CollectionFiltersBar';
import { AddGameModal } from '../components/collection/AddGameModal';
import { EditGameModal } from '../components/collection/EditGameModal';
import { DeleteGameModal } from '../components/collection/DeleteGameModal';
import { InactivateGameModal } from '../components/collection/InactivateGameModal';

interface CollectionPageProps {
  onNavigate: (
    page: 'dashboard' | 'acervo' | 'emprestimos' | 'usuarios' | 'cadastro' | 'relatorios' | 'login'
  ) => void;
  onLogout?: () => void;
}

export function CollectionPage({ onNavigate }: CollectionPageProps) {
  const { metrics, games, loading, error, refetch } = useGames();
  
  // Controle de estado dos Modais
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deletingGame, setDeletingGame] = useState<Game | null>(null);
  const [inactivatingGame, setInactivatingGame] = useState<Game | null>(null);

  // Controle de estado dos Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('todos');
  const [selectedStatus, setSelectedStatus] = useState<GameStatus>('todos');
  const [selectedSort, setSelectedSort] = useState<SortOption>('az');

  // Lógica de Filtro e Ordenação
  const filteredGames = useMemo(() => {
    if (!games) return [];
    let filtered = [...games];

    // Busca
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Categoria/Tier
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(game => game.tier?.toLowerCase() === selectedCategory);
    }

    // Status baseado nas flags reais da sua API
    if (selectedStatus !== 'todos') {
      if (selectedStatus === 'disponivel') {
        filtered = filtered.filter(g => g.isActive && g.isAvailableNow);
      } else if (selectedStatus === 'alugado') {
        filtered = filtered.filter(g => g.isActive && !g.isAvailableNow);
      } else if (selectedStatus === 'inativo') {
        filtered = filtered.filter(g => !g.isActive);
      } else if (selectedStatus === 'manutencao') {
        // Exemplo: se você usar o campo "available" como false manual mas isActive=true
        filtered = filtered.filter(g => g.isActive && g.available === false && !g.isAvailableNow);
      }
    }

    // Ordenação
    filtered.sort((a, b) => {
      const titleA = a.title || '';
      const titleB = b.title || '';
      
      switch (selectedSort) {
        case 'az': return titleA.localeCompare(titleB);
        case 'za': return titleB.localeCompare(titleA);
        default: return 0;
      }
    });

    return filtered;
  }, [games, searchTerm, selectedCategory, selectedStatus, selectedSort]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('todos');
    setSelectedStatus('todos');
    setSelectedSort('az');
  };

  // ==========================================
  // FUNÇÕES DE AÇÃO NA API 
  // ==========================================

  const handleDeleteConfirm = async () => {
    if (!deletingGame) return;
    
    try {
      await api.delete(`/games/${deletingGame.id}`); //[cite: 1]
      toast.success("Jogo excluído permanentemente!");
      setDeletingGame(null);
      refetch(); // Recarrega a tabela[cite: 1]
    } catch (err: any) {
      // Retorna 409 se houver aluguéis ativos[cite: 1]
      if (err.response?.status === 409) {
        toast.error("Não é possível excluir: jogo possui aluguéis ativos."); //[cite: 1]
      } else {
        toast.error("Erro ao excluir o jogo do acervo.");
      }
    }
  };

  const handleInactivateConfirm = async (reason: string) => {
    if (!inactivatingGame) return;
    
    // Se o jogo está inativo, a ação será ativá-lo (true), e vice-versa
    const willBeActive = inactivatingGame.isActive === false; 
    
    try {
      await api.patch(`/games/${inactivatingGame.id}`, { //[cite: 1]
        isActive: willBeActive, //[cite: 1]
        isVisible: willBeActive, // Esconde do app também[cite: 1]
      });

      toast.success(willBeActive ? "Jogo reativado no catálogo!" : "Jogo inativado com sucesso!");
      setInactivatingGame(null);
      refetch(); // Recarrega a tabela
    } catch (err) {
      toast.error("Erro ao alterar o status do jogo.");
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="acervo" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-8">
          <h1 className="text-3xl font-bold text-[#04096D] mb-8">Acervo Digital</h1>

          {/* Métricas */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <CollectionMetricCard
              title="Total de Títulos"
              value={(metrics?.totalTitles || 0).toLocaleString('pt-BR')}
              tag="Em catálogo"
              icon={<Library size={96} strokeWidth={1.5} />}
              variant="dark-blue"
            />
            <CollectionMetricCard
              title="Disponíveis"
              value={metrics?.available || 0}
              tag="Prontos para jogo"
              icon={<CheckCircle2 size={96} strokeWidth={1.5} />}
              variant="white-orange"
            />
            <CollectionMetricCard
              title="Alugados"
              value={metrics?.rented || 0}
              tag="Em circulação"
              icon={<PackageMinus size={96} strokeWidth={1.5} />}
              variant="yellow"
            />
            <CollectionMetricCard
              title="Manutenção"
              value={metrics?.maintenance || 0}
              tag="Requer atenção"
              icon={<Wrench size={96} strokeWidth={1.5} />}
              variant="white-red"
            />
          </div>

          {/* Barra de Filtros Nova */}
          <CollectionFiltersBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            onClearFilters={handleClearFilters}
            onAddGame={() => setIsAddOpen(true)}
          />

          {/* Tabela de Jogos */}
          <GamesCatalogTable 
            games={filteredGames} 
            onAddClick={() => setIsAddOpen(true)}
            onEditClick={(game) => setEditingGame(game)}
            onDeleteClick={(game) => setDeletingGame(game)}
            onInactivateClick={(game) => setInactivatingGame(game)}
          />
        </main>
      </div>

      {/* Renderização dos Modais */}
      <AddGameModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onAdded={refetch} 
      />
      
      <EditGameModal 
        game={editingGame} 
        onClose={() => setEditingGame(null)} 
        onSaved={refetch} 
      />

      <DeleteGameModal
        isOpen={!!deletingGame}
        onClose={() => setDeletingGame(null)}
        onConfirm={handleDeleteConfirm}
        gameName={deletingGame?.title || ''}
        // Na sua API o jogo retorna activeRentalsCount? Se não, deixe como 0 e o erro 409 cuida da trava visual
        activeRentalsCount={0} 
      />

      <InactivateGameModal
        isOpen={!!inactivatingGame}
        onClose={() => setInactivatingGame(null)}
        onConfirm={handleInactivateConfirm}
        gameName={inactivatingGame?.title || ''}
        activeRentalsCount={0} 
        isActive={inactivatingGame?.isActive !== false} // Passa o status real atual para o Modal
      />
    </div>
  );
}