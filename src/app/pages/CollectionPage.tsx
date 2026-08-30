import { useState, useMemo } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { CollectionMetricCard } from "../components/collection/CollectionMetricCard";
import { GamesCatalogTable } from "../components/collection/GamesCatalogTable";
import { Loading } from "../components/shared/Loading";
import { ErrorMessage } from "../components/shared/ErrorMessage";
import { useGames } from "../../hooks";
import { Library, CheckCircle2, PackageMinus, Wrench } from "lucide-react";
import { Game } from "../../types/api";
import { api } from "../../services/api";
import { toast } from "sonner";
import { GameCopiesModal } from "../components/collection/GameCopiesModal";
import { GamePreviewModal } from "../components/collection/GamePreviewModal"; 

import {
  CollectionFiltersBar,
  GameCategory,
  GameStatus,
  SortOption,
} from "../components/collection/CollectionFiltersBar";
import { AddGameModal } from "../components/collection/AddGameModal";
import { EditGameModal } from "../components/collection/EditGameModal";
import { DeleteGameModal } from "../components/collection/DeleteGameModal";
import { InactivateGameModal } from "../components/collection/InactivateGameModal";

interface CollectionPageProps {
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

export function CollectionPage({ onNavigate, onLogout }: CollectionPageProps) {
  const { metrics, games, loading, error, refetch } = useGames();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deletingGame, setDeletingGame] = useState<Game | null>(null);
  const [inactivatingGame, setInactivatingGame] = useState<Game | null>(null);
  

  const [previewingGame, setPreviewingGame] = useState<Game | null>(null);
  const [managingCopiesGame, setManagingCopiesGame] = useState<Game | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>("todos");
  const [selectedStatus, setSelectedStatus] = useState<GameStatus>("todos");
  const [selectedSort, setSelectedSort] = useState<SortOption>("az");


  const filteredGames = useMemo(() => {
    if (!games) return [];
    let filtered = [...games];

    if (searchTerm) {
      filtered = filtered.filter((game) =>
        game.title?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory !== "todos") {
      filtered = filtered.filter(
        (game) => game.tier?.toLowerCase() === selectedCategory,
      );
    }

    if (selectedStatus !== "todos") {
      if (selectedStatus === "disponivel") {
        filtered = filtered.filter((g) => g.isActive && g.isAvailableNow);
      } else if (selectedStatus === "alugado") {
        filtered = filtered.filter((g) => g.isActive && !g.isAvailableNow);
      } else if (selectedStatus === "inativo") {
        filtered = filtered.filter((g) => !g.isActive);
      } else if (selectedStatus === "manutencao") {
        filtered = filtered.filter(
          (g) => g.isActive && g.available === false && !g.isAvailableNow,
        );
      }
    }

    filtered.sort((a, b) => {
      const titleA = a.title || "";
      const titleB = b.title || "";

      switch (selectedSort) {
        case "az":
          return titleA.localeCompare(titleB);
        case "za":
          return titleB.localeCompare(titleA);
        default:
          return 0;
      }
    });

    return filtered;
  }, [games, searchTerm, selectedCategory, selectedStatus, selectedSort]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("todos");
    setSelectedStatus("todos");
    setSelectedSort("az");
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGame) return;

    try {
      await api.delete(`/games/${deletingGame.id}`); 
      toast.success("Jogo excluído permanentemente!");
      setDeletingGame(null);
      refetch(); 
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error("Não é possível excluir: jogo possui aluguéis ativos."); 
      } else {
        toast.error("Erro ao excluir o jogo do acervo.");
      }
    }
  };

  const handleInactivateConfirm = async (reason: string) => {
    if (!inactivatingGame) return;

    const willBeActive = inactivatingGame.isActive === false;

    try {
      await api.patch(`/games/${inactivatingGame.id}`, {
        isActive: willBeActive,
        isVisible: willBeActive, 
      });

      toast.success(
        willBeActive
          ? "Jogo reativado no catálogo!"
          : "Jogo inativado com sucesso!",
      );
      setInactivatingGame(null);
      refetch(); 
    } catch (err) {
      toast.error("Erro ao alterar o status do jogo.");
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      <Sidebar
        activePage="acervo"
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          onMenuToggle={() => setIsSidebarOpen(true)} 
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#04096D] mb-6 sm:mb-8">
            Acervo Digital
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <CollectionMetricCard
              title="Total de Títulos"
              value={(metrics?.totalTitles || 0).toLocaleString("pt-BR")}
              tag="Em catálogo"
              icon={<Library size={80} strokeWidth={1.5} />}
              variant="dark-blue"
            />
            <CollectionMetricCard
              title="Disponíveis"
              value={metrics?.available || 0}
              tag="Prontos para jogo"
              icon={<CheckCircle2 size={80} strokeWidth={1.5} />}
              variant="white-orange"
            />
            <CollectionMetricCard
              title="Alugados"
              value={metrics?.rented || 0}
              tag="Em circulação"
              icon={<PackageMinus size={80} strokeWidth={1.5} />}
              variant="yellow"
            />
            <CollectionMetricCard
              title="Manutenção"
              value={metrics?.maintenance || 0}
              tag="Requer atenção"
              icon={<Wrench size={80} strokeWidth={1.5} />}
              variant="white-red"
            />
          </div>

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

          <GamesCatalogTable
            games={filteredGames}
            onEditClick={(game) => setEditingGame(game)}
            onManageCopiesClick={(game) => setManagingCopiesGame(game)}
            onDeleteClick={(game) => setDeletingGame(game)}
            onInactivateClick={(game) => setInactivatingGame(game)}
            onPreviewClick={(game) => setPreviewingGame(game)}
          />
        </main>
      </div>

     
      <GamePreviewModal
        isOpen={!!previewingGame}
        onClose={() => setPreviewingGame(null)}
        game={previewingGame}
      />

      <GameCopiesModal
        isOpen={!!managingCopiesGame}
        gameId={managingCopiesGame?.id || ''}
        gameTitle={managingCopiesGame?.title || ''}
        gameCover={managingCopiesGame?.cover}
        onClose={() => setManagingCopiesGame(null)}
      />

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
        gameName={deletingGame?.title || ""}
        activeRentalsCount={0}
      />

      <InactivateGameModal
        isOpen={!!inactivatingGame}
        onClose={() => setInactivatingGame(null)}
        onConfirm={handleInactivateConfirm}
        gameName={inactivatingGame?.title || ""}
        activeRentalsCount={0}
        isActive={inactivatingGame?.isActive !== false} 
      />
    </div>
  );
}