import { Search, X, Plus } from 'lucide-react';

export type GameCategory = 'todos' | 'latao' | 'bronze' | 'prata' | 'ouro' | 'diamante';
export type GameStatus = 'todos' | 'disponivel' | 'alugado' | 'manutencao' | 'inativo';
export type SortOption = 'az' | 'za' | 'mais-alugado' | 'mais-recente';

interface CollectionFiltersBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: GameCategory;
  onCategoryChange: (category: GameCategory) => void;
  selectedStatus: GameStatus;
  onStatusChange: (status: GameStatus) => void;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
  onAddGame: () => void;
}

const categoryOptions = [
  { value: 'todos', label: 'Todos os Tiers' },
  { value: 'latao', label: 'LATÃO' },
  { value: 'bronze', label: 'BRONZE' },
  { value: 'prata', label: 'PRATA' },
  { value: 'ouro', label: 'OURO' },
  { value: 'diamante', label: 'DIAMANTE' },
];

const statusOptions = [
  { value: 'todos', label: 'Todos os Status' },
  { value: 'disponivel', label: 'Disponível' },
  { value: 'alugado', label: 'Alugado' },
  { value: 'manutencao', label: 'Em Manutenção' },
  { value: 'inativo', label: 'Inativo' },
];

const sortOptions = [
  { value: 'az', label: 'A-Z' },
  { value: 'za', label: 'Z-A' },
  { value: 'mais-alugado', label: 'Mais Alugado' },
  { value: 'mais-recente', label: 'Mais Recente' },
];

export function CollectionFiltersBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedSort,
  onSortChange,
  onClearFilters,
  onAddGame
}: CollectionFiltersBarProps) {
  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'todos' || selectedStatus !== 'todos' || selectedSort !== 'az';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-6 sm:mb-8">
      <div className="flex flex-col xl:flex-row gap-3 sm:gap-4">
        
      
        <div className="w-full xl:max-w-xs relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar jogo..."
            className="w-full pl-11 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#04096D]/20 focus:border-[#04096D] text-sm transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap xl:flex-nowrap gap-2 sm:gap-3 w-full">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as GameCategory)}
            className="w-full sm:flex-1 min-w-[140px] px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#04096D]/20 focus:border-[#04096D] text-sm bg-white font-medium text-gray-700 cursor-pointer"
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as GameStatus)}
            className="w-full sm:flex-1 min-w-[140px] px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#04096D]/20 focus:border-[#04096D] text-sm bg-white font-medium text-gray-700 cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full sm:flex-1 min-w-[140px] px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#04096D]/20 focus:border-[#04096D] text-sm bg-white font-medium text-gray-700 cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

  
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 xl:ml-auto w-full xl:w-auto mt-1 sm:mt-0">
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 hover:text-[#E62325] text-sm font-bold transition-colors px-3 py-2.5 sm:py-2 rounded-xl hover:bg-red-50 border border-gray-200 sm:border-transparent"
            >
              <X size={18} strokeWidth={2.5} />
              <span className="inline">Limpar</span>
            </button>
          )}
          <button
            onClick={onAddGame}
            className="bg-[#04096D] hover:bg-[#070e99] text-white px-5 py-3 rounded-xl font-black text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-[#04096D]/20 whitespace-nowrap w-full sm:w-auto"
          >
            <Plus size={18} strokeWidth={3} />
            Novo Jogo
          </button>
        </div>

      </div>
    </div>
  );
}