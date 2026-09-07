import { Crown, ChevronDown, Gamepad2, Trophy, Tag, Users } from 'lucide-react';
import { Avatar } from '../shared/Avatar';


export const LEVEL_COLORS: Record<string, string> = {
  Iniciante: '#6B7280',
  Explorador: '#10B981',
  Estrategista: '#3B82F6',
  Campeão: '#8B5CF6',
  Lenda: '#FBBC04',
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

export function LevelBadge({ levelName }: { levelName?: string }) {
  const name = levelName || 'Iniciante';
  const color = LEVEL_COLORS[name] ?? '#6B7280';
  
  return (
    <span
      className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full"
      style={{ background: color + '15', color, border: `1px solid ${color}30` }}
    >
      {name}
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
                <p className="text-white/70 text-[10px] sm:text-[11px] mt-0.5">@{top3[1].email.split('@')[0]}</p>
                <p className="font-black mt-1 text-base sm:text-xl" style={{ color: '#FBBC04' }}>{(top3[1].points || 0).toLocaleString()} pts</p>
                <p className="text-white/60 text-[10px] sm:text-[11px]">{top3[1].totalRentalsCount || 0} aluguéis</p>
                <div className="mt-1.5"><LevelBadge levelName={top3[1].levelName} /></div>
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
                <p className="text-white/70 text-[11px] sm:text-[12px] mt-0.5">@{top3[0].email.split('@')[0]}</p>
                <p className="font-black mt-1.5 text-2xl sm:text-3xl drop-shadow-sm" style={{ color: '#FBBC04' }}>{(top3[0].points || 0).toLocaleString()} pts</p>
                <p className="text-white/60 text-[11px] sm:text-[12px]">{top3[0].totalRentalsCount || 0} aluguéis</p>
                <div className="mt-2"><LevelBadge levelName={top3[0].levelName} /></div>
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
                <p className="text-white/70 text-[10px] sm:text-[11px] mt-0.5">@{top3[2].email.split('@')[0]}</p>
                <p className="font-black mt-1 text-base sm:text-xl" style={{ color: '#FBBC04' }}>{(top3[2].points || 0).toLocaleString()} pts</p>
                <p className="text-white/60 text-[10px] sm:text-[11px]">{top3[2].totalRentalsCount || 0} aluguéis</p>
                <div className="mt-1.5"><LevelBadge levelName={top3[2].levelName} /></div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        {usersRest.length === 0 && <p className="p-6 sm:p-8 text-center text-gray-500 font-medium">Nenhum outro usuário rankeado.</p>}
        {usersRest.map((u, i) => (
          <div key={u.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0">
            <span className="w-6 sm:w-8 font-bold text-center text-gray-400 text-xs sm:text-sm">{i + 4}º</span>
            <Avatar name={u.name} src={u.avatar || u.picture} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#1A1A2E] text-sm sm:text-base truncate">{u.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <LevelBadge levelName={u.levelName} />
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500">{u.totalRentalsCount || 0} aluguéis</span>
              </div>
            </div>
            <div className="text-right pl-2 sm:pl-0">
              <p className="font-black text-sm sm:text-base" style={{ color: '#04096D' }}>{(u.points || 0).toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400">PTS</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GamesTab({ games }: { games: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      {games.length === 0 && <p className="col-span-2 p-6 sm:p-8 text-center text-gray-500 font-medium bg-white rounded-2xl border border-gray-100">Nenhum jogo no ranking.</p>}
      {games.map((g, i) => {
        const tColor = TIER_COLORS[g.tier] ?? '#E5E7EB';
        const tGrad = TIER_GRADIENTS[g.tier] ?? 'linear-gradient(135deg, #E5E7EB, #9CA3AF)';
        const rating = typeof g.rating === "number" ? g.rating.toFixed(1) : "0.0";
        return (
          <div key={g.id} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 px-2 sm:px-3 py-1 bg-gray-900 text-white font-black text-xs sm:text-sm rounded-bl-xl z-10 flex items-center gap-1 shadow-sm">
              <Trophy size={12} className="text-[#FBBC04]" /> #{i + 1}
            </div>
            
            <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg sm:rounded-xl overflow-hidden shadow-inner relative flex-shrink-0 bg-gray-100">
              {g.cover ? (
                <img src={getHighResImage(g.cover) || ''} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Gamepad2 size={24} color="#9CA3AF" /></div>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div>
                <h3 className="font-bold text-[#1A1A2E] text-sm sm:text-base leading-tight mb-1.5 sm:mb-2 line-clamp-2 pr-8">{g.title}</h3>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md text-white shadow-sm" style={{ background: tGrad }}>
                    <Tag size={10} /> {g.tier}
                  </span>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100">
                    <span className="text-[10px] sm:text-[11px] font-black text-yellow-700">{rating}</span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-yellow-600/70">({g.ratingsCount || 0})</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-50">
                <Users size={12} className="text-gray-400" />
                <span className="text-xs sm:text-sm font-black text-[#04096D]">{g.rentalsCount || 0}</span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-500">aluguéis</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}