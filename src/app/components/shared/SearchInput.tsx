import { Search, X, Loader2 } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
}

// Campo de busca controlado; o debounce fica com quem usa (useDebouncedValue).
export function SearchInput({ value, onChange, placeholder = 'Buscar...', loading = false, className = '' }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#04096D] [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
        {loading ? (
          <Loader2 size={16} className="animate-spin text-gray-400" />
        ) : value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-0.5 rounded text-gray-400 hover:text-gray-700"
            title="Limpar busca"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
