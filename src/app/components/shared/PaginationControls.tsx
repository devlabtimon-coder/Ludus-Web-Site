import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  itemLabel?: { singular: string; plural: string };
}

export function PaginationControls({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  loading = false,
  itemLabel = { singular: 'resultado', plural: 'resultados' },
}: PaginationControlsProps) {
  if (total === 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const label = total === 1 ? itemLabel.singular : itemLabel.plural;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 text-xs sm:text-sm text-gray-600">
      <span className="flex items-center gap-2">
        {loading && <Loader2 size={14} className="animate-spin text-[#04096D]" />}
        Exibindo <span className="font-semibold text-gray-800">{first}–{last}</span> de{' '}
        <span className="font-semibold text-gray-800">{total.toLocaleString('pt-BR')}</span> {label}
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} /> Anterior
          </button>
          <span className="font-semibold text-gray-700 whitespace-nowrap">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 bg-white font-semibold hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próxima <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
