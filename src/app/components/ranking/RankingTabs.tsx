import { Crown, ChevronDown, Gamepad2, Trophy, Tag, Users } from 'lucide-react';
import { Avatar } from '../shared/Avatar';

export const CATEGORY_COLORS: Record<string, string> = {
  Starter: '#10B981',
  Family: '#FBBC04',
  Expert: '#31358B',
  Ultragamer: '#04096D',
};

export const TIER_COLORS: Record<string, string> = {
  LATAO: '#78716C',
  BRONZE: '#CD7F32',
  PRATA: '#9CA3AF',
  OURO: '#FBBC04',
  DIAMANTE: '#60A5FA',
};

export const TIER_GRADIENTS: Record<string, string> = {
  LATAO: 'linear-gradient(135deg,#78716C,#57534E)',
  BRONZE: 'linear-gradient(135deg,#CD7F32,#B86A20)',
  PRATA: 'linear-gradient(135deg,#9CA3AF,#6B7280)',
  OURO: 'linear-gradient(135deg,#FBBC04,#E5AA00)',
  DIAMANTE: 'linear-gradient(135deg,#60A5FA,#3B82F6)',
};

export const GAME_CAT_OPTIONS = [
  { value: 'all', label: 'Todas as categorias' },
  { value: 'latao', label: 'Latão' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'prata', label: 'Prata' },
  { value: 'ouro', label: 'Ouro' },
  { value: 'diamante', label: 'Diamante' },
];

export const SORT_OPTIONS = [
  { value: 'rating', label: 'Melhor avaliado' },
  { value: 'rentals', label: 'Mais alugados' },
];

function getHighResImage(url?: string | null) {
  if (!url) return null;
  return url
    .replace("_t.jpg", ".jpg")
    .replace("_t.jpeg", ".jpeg")
    .replace("_t.png", ".png");
}

export function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category] ?? '#6B7280';
  return (
    <span
      className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: color + '15', color, border: `1px solid ${color}30` }}
    >
      {category}
    </span>
  );
}

export function Select({
  label, options, value, onChange,
}: {
  label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full sm:w-auto pl-3 pr-8 h-10 sm:h-9 text-sm font-medium rounded-xl sm:rounded-lg border focus:outline-none cursor-pointer transition-colors hover:border-[#04096D]"
        style={{ borderColor: '#E5E7EB', color: '#1A1A2E', background: '#fff' }}
        aria-label={label}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9CA3AF' }} />
    </div>
  );
}

export function UsersTab({ top3, usersRest }: { top3: any[], usersRest: any[] }) {
  return (
    <div className="flex flex-col gap-5">
      {top3.length > 0 && (
        <div className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-8 flex justify-center items-end gap-4 sm:gap-12 flex-wrap pt-12 sm:pt-16 shadow-lg" style={{ background: 'linear-gradient(135deg,#04096D,#31358B)' }}>
          {top3[1] && (
            <div className="flex flex-col items-center gap-2 mb-2 sm:mb-4">
              <div style={{ position: 'relative' }}>
                <Avatar name={top3[1].name} src={top3[1].avatar || top3[1].picture} size="lg" />
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full whitespace-nowrap border border-white/20 z-10" style={{ background: '#E2E8F0', color: '#04096D' }}>2º Lugar</span>
              </div>
              <div className="mt-3 sm:mt-4 text-center">
                <p className="font-bold text-white text-xs sm:text-sm">{top3[1].name}</p>
                <p className="text-white/70 text-[10px] sm:text-[11px] mt-0.5">@{top3[1].nick}</p>
                <p className="font-black mt-1 text-base sm:text-xl" style={{ color: '#FBBC04' }}>{(top3[1].pts || 0).toLocaleString()} pts</p>
                <p className="text-white/60 text-[10px] sm:text-[11px]">{top3[1].rentals || 0} aluguéis</p>
                <div className="mt-1.5"><CategoryBadge category={top3[1].category} /></div>
              </div>
            </div>
          )}
          
          {top3[0] && (
            <div className="flex flex-col items-center gap-2 -translate-y-4 sm:-translate-y-8">
              <Crown size={30} style={{ color: '#FBBC04' }} className="drop-shadow-md sm:w-9 sm:h-9" />
              <div style={{ position: 'relative' }}>
                <div className="p-1 rounded-full bg-[#FBBC04] shadow-xl">
                  <Avatar name={top3[0].name} src={top3[0].avatar || top3[0].picture} size="lg" />
                </div>
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[11px] sm:text-[12px] font-black px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap shadow-lg z-10" style={{ background: '#FBBC04', color: '#04096D' }}>1º Lugar</span>
              </div>
              <div className="mt-4 sm:mt-5 text-center">
                <p className="font-bold text-white text-sm sm:text-lg">{top3[0].name}</p>
                <p className="text-white/70 text-[11px] sm:text-[12px] mt-0.5">@{top3[0].nick}</p>
                <p className="font-black mt-1.5 text-2xl sm:text-3xl drop-shadow-sm" style={{ color: '#FBBC04' }}>{(top3[0].pts || 0).toLocaleString()} pts</p>
                <p className="text-white/60 text-[11px] sm:text-[12px]">{top3[0].rentals || 0} aluguéis</p>
                <div className="mt-2"><CategoryBadge category={top3[0].category} /></div>
              </div>
            </div>
          )}

          {top3[2] && (
            <div className="flex flex-col items-center gap-2 mb-2 sm:mb-4">
              <div style={{ position: 'relative' }}>
                <Avatar name={top3[2].name} src={top3[2].avatar || top3[2].picture} size="lg" />
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full whitespace-nowrap border border-white/20 z-10" style={{ background: '#CD7F32', color: '#FFF' }}>3º Lugar</span>
              </div>
              <div className="mt-3 sm:mt-4 text-center">
                <p className="font-bold text-white text-xs sm:text-sm">{top3[2].name}</p>
                <p className="text-white/70 text-[10px] sm:text-[11px] mt-0.5">@{top3[2].nick}</p>
                <p className="font-black mt-1 text-base sm:text-xl" style={{ color: '#FBBC04' }}>{(top3[2].pts || 0).toLocaleString()} pts</p>
                <p className="text-white/60 text-[10px] sm:text-[11px]">{top3[2].rentals || 0} aluguéis</p>
                <div className="mt-1.5"><CategoryBadge category={top3[2].category} /></div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        {usersRest.length === 0 && <p className="p-6 sm:p-8 text-center text-gray-500 font-medium text-sm">Nenhum outro usuário encontrado.</p>}
        {usersRest.map((u, i) => (
          <div key={u.id} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 hover:bg-[#F7F8FF] transition-colors cursor-default" style={{ padding: '14px 16px', borderBottom: i < usersRest.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
            <span className="font-black text-base sm:text-lg w-8 sm:w-10 flex-shrink-0 text-center" style={{ color: '#94A3B8' }}>{u.pos}</span>
            <div className="flex-shrink-0">
              <Avatar name={u.name} src={u.avatar || u.picture} size="md" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate text-[#04096D]">{u.name}</p>
              <p className="text-xs font-medium truncate text-gray-500">@{u.nick}</p>
            </div>
            <div className="hidden md:block flex-shrink-0 w-28 text-center"><CategoryBadge category={u.category} /></div>
            <div className="text-right flex-shrink-0 w-24 sm:w-32">
              <p className="font-black text-base sm:text-lg" style={{ color: '#FBBC04' }}>{(u.pts || 0).toLocaleString()}</p>
              <p className="text-[11px] sm:text-xs font-semibold text-gray-500">{u.rentals || 0} aluguéis</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GamesTab({ 
  processedGames, 
  maxGameRentals, 
  catFilter, 
  setCatFilter, 
  sortBy, 
  setSortBy 
}: any) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Select label="Categoria" options={GAME_CAT_OPTIONS} value={catFilter} onChange={setCatFilter} />
        <Select label="Ordenar" options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {processedGames.map((g: any) => {
          const fillPct = ((g.rentals || 0) / maxGameRentals) * 100;
          const highResCover = getHighResImage(g.cover);
          return (
            <div key={g.name} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative flex items-center justify-center shrink-0 overflow-hidden bg-gray-100" style={{ height: 160 }}>
                {highResCover ? (
                  <img src={highResCover} alt={g.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <span className="absolute font-black select-none pointer-events-none" style={{ fontSize: 110, color: 'rgba(0,0,0,0.08)', lineHeight: 1, top: 16 }}>{g.name[0]}</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                <span className="absolute top-3 left-3 text-[12px] sm:text-[13px] font-black px-2.5 py-0.5 rounded-md shadow-sm z-10" style={{ background: '#04096D', color: '#FBBC04' }}>#{g.pos}</span>
                <span className="absolute top-3 right-3 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-black/40 text-white backdrop-blur-sm z-10">{g.category}</span>
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col">
                <p className="font-black text-[15px] sm:text-[16px] text-[#04096D] line-clamp-2 leading-tight">{g.name}</p>
                <div className="flex items-center gap-3 sm:gap-4 mt-auto pt-4 text-xs font-bold text-gray-600">
                  <span className="flex items-center gap-1"><Gamepad2 size={15} className="text-[#31358B]" /> {g.rentals || 0} aluguéis</span>
                  <span className="flex items-center gap-1"><Trophy size={15} className="text-[#FBBC04]" /> {(g.rating || 0).toFixed(1)}</span>
                </div>
                <div className="mt-3 sm:mt-4 rounded-full overflow-hidden bg-gray-100 h-2">
                  <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, background: '#31358B' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CategoriesTab({ userCatBars, gameCatBars, insights }: any) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {insights.map((ins: any, i: number) => {
          const Icon = ins.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 flex flex-col gap-2 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mb-2" style={{ background: ins.color + '15' }}>
                <Icon size={24} style={{ color: ins.color }} strokeWidth={2.5} />
              </div>
              <p className="font-black text-xl leading-tight text-[#04096D]">{ins.value}</p>
              <p className="text-xs font-bold text-gray-500">{ins.sub}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider mt-2 pt-2 border-t border-gray-100 text-gray-400">{ins.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm overflow-hidden">
          <p className="font-black text-lg mb-6 text-[#04096D]">Usuários por Categoria</p>
          <div className="flex flex-col gap-5">
            {userCatBars.map((b: any) => (
              <div key={b.label} className="flex items-center gap-3 sm:gap-4">
                <span className="flex-shrink-0 text-xs sm:text-sm font-bold text-gray-600 text-right w-20 sm:w-24">{b.label}</span>
                <div className="flex-1 rounded-md bg-gray-100 h-6 overflow-hidden">
                  <div className="h-full flex items-center px-3 transition-all rounded-md" style={{ width: `${((b.count || 0) / Math.max(...userCatBars.map((x: any)=>x.count || 0), 1)) * 100}%`, background: b.color, minWidth: 40 }}>
                    <span className="text-[11px] font-black text-white">{b.count || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm overflow-hidden">
          <p className="font-black text-lg mb-6 text-[#04096D]">Jogos por Categoria (Tier)</p>
          <div className="flex flex-col gap-5">
            {gameCatBars.map((b: any) => (
              <div key={b.label} className="flex items-center gap-3 sm:gap-4">
                <span className="flex-shrink-0 text-xs sm:text-sm font-bold text-gray-600 text-right w-20 sm:w-24">{b.label}</span>
                <div className="flex-1 rounded-md bg-gray-100 h-6 overflow-hidden">
                  <div className="h-full flex items-center px-3 transition-all rounded-md" style={{ width: `${((b.count || 0) / Math.max(...gameCatBars.map((x: any)=>x.count || 0), 1)) * 100}%`, background: b.color, minWidth: 40 }}>
                    <span className="text-[11px] font-black text-white">{b.count || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}