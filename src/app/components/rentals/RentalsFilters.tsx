import { X, ArrowUpDown } from 'lucide-react';

export type VisualRentalStatus = 'todos' | 'andamento' | 'atrasado' | 'pendente' | 'concluido';
export type SortOption = 'user-asc' | 'user-desc' | 'game-asc' | 'game-desc' | 'recent' | 'oldest' | 'due-soon';

interface RentalsFiltersProps {
  selectedStatus: VisualRentalStatus;
  onStatusChange: (status: VisualRentalStatus) => void;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultCount: number;
}

const statusFilters = [
  { value: 'todos' as const, label: 'Todos', color: 'bg-[#0A1628] text-white', borderColor: 'border-[#0A1628]', dotColor: 'bg-white' },
  { value: 'andamento' as const, label: 'Em Andamento', color: 'bg-white text-blue-600 border-blue-500', borderColor: 'border-blue-500', dotColor: 'bg-blue-500', activeColor: 'bg-blue-500 text-white' },
  { value: 'atrasado' as const, label: 'Atrasado', color: 'bg-white text-red-600 border-red-500', borderColor: 'border-red-500', dotColor: 'bg-red-500', activeColor: 'bg-red-600 text-white' },
  { value: 'pendente' as const, label: 'Pendente', color: 'bg-white text-gray-600 border-gray-400', borderColor: 'border-gray-400', dotColor: 'bg-gray-500', activeColor: 'bg-gray-500 text-white' },
  { value: 'concluido' as const, label: 'Concluído', color: 'bg-white text-green-600 border-green-500', borderColor: 'border-green-500', dotColor: 'bg-green-500', activeColor: 'bg-green-500 text-white' },
];

const sortOptions = [
  { value: 'user-asc' as const, label: 'A-Z por Usuário' },
  { value: 'user-desc' as const, label: 'Z-A por Usuário' },
  { value: 'game-asc' as const, label: 'A-Z por Jogo' },
  { value: 'game-desc' as const, label: 'Z-A por Jogo' },
  { value: 'recent' as const, label: 'Mais Recente' },
  { value: 'oldest' as const, label: 'Mais Antigo' },
  { value: 'due-soon' as const, label: 'Devolução Próxima' },
];

export function RentalsFilters({
  selectedStatus,
  onStatusChange,
  selectedSort,
  onSortChange,
  resultCount
}: RentalsFiltersProps) {
  const hasActiveFilters = selectedStatus !== 'todos';

  const handleClearFilters = () => {
    onStatusChange('todos');
    onSortChange('recent');
  };

  return (
    <div className="bg-[#F8F9FA] rounded-lg p-3 md:p-4 mb-4 md:mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {statusFilters.map((filter) => {
            const isSelected = selectedStatus === filter.value;
            return (
              <button
                key={filter.value}
                onClick={() => onStatusChange(filter.value)}
                className={`px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition-colors border flex items-center gap-2 ${
                  isSelected
                    ? filter.value === 'todos'
                      ? filter.color
                      : filter.activeColor
                    : filter.color
                }`}
              >
                {filter.value !== 'todos' && (
                  <span className={`w-2 h-2 rounded-full ${filter.dotColor}`} />
                )}
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="hidden md:block w-px h-8 bg-gray-300" />

        <div className="flex items-center gap-2 flex-1 md:flex-none">
          <ArrowUpDown className="text-gray-600" size={18} />
          <select
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="flex-1 md:w-auto bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#04096D]"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs md:text-sm font-medium transition-colors"
          >
            <X size={16} />
            Limpar Filtros
          </button>
        )}

        <div className="md:ml-auto text-xs md:text-sm text-gray-500">
          Exibindo <span className="font-semibold text-gray-700">{resultCount}</span> resultado{resultCount !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}