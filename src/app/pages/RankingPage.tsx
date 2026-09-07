import { useState, useMemo, useEffect } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { 
  UsersTab, 
  GamesTab, 
  TIER_COLORS, 
  TIER_GRADIENTS, 
  Select,
  GAME_CAT_OPTIONS,
  SORT_OPTIONS
} from '../components/ranking/RankingTabs';


export function getLevelTitle(levelNumber: number) {
  switch (levelNumber) {
    case 1: return "Iniciante";
    case 2: return "Explorador";
    case 3: return "Estrategista";
    case 4: return "Campeão";
    case 5: return "Lenda";
    default: return `Nível ${levelNumber}`;
  }
}


export const LEVEL_COLORS: Record<string, string> = {
  Iniciante: '#6B7280',
  Explorador: '#10B981',
  Estrategista: '#3B82F6',
  Campeão: '#8B5CF6',
  Lenda: '#FBBC04',
};

interface RankingPageProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

type Tab = 'usuarios' | 'jogos';

const TABS: { key: Tab; label: string }[] = [
  { key: 'usuarios', label: 'Usuários' },
  { key: 'jogos', label: 'Jogos' },
];

export function RankingPage({ onNavigate, onLogout }: RankingPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>('usuarios');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('current');

  const [users, setUsers] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [catFilter, setCatFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    api.get('/admin/seasons')
      .then(res => setSeasons(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let usersEndpoint = '/admin/users';
        if (selectedSeasonId !== 'current') {
          usersEndpoint = `/admin/seasons/${selectedSeasonId}/ranking`;
        }

        const [usersRes, gamesRes] = await Promise.all([
          api.get(usersEndpoint),
          api.get('/games') 
        ]);

        const sortedUsers = usersRes.data
          .filter((u: any) => u.role === 'USER' && !u.isBlocked)
          .sort((a: any, b: any) => {
            const ptsA = Number(a.points) || 0;
            const ptsB = Number(b.points) || 0;
            if (ptsB !== ptsA) return ptsB - ptsA;
            const rentsA = Number(a.totalRentalsCount) || 0;
            const rentsB = Number(b.totalRentalsCount) || 0;
            return rentsB - rentsA;
          });
        
        setUsers(sortedUsers);
        setGames(gamesRes.data);
      } catch (error) {
        toast.error("Erro ao carregar dados do ranking");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSeasonId]);

  const seasonOptions = useMemo(() => {
    const options = [{ value: 'current', label: 'Temporada Atual (Ativa)' }];
    seasons.forEach(s => {
      options.push({ value: s.id, label: `${s.name} (${s.status.toUpperCase()})` });
    });
    return options;
  }, [seasons]);

  const topUsers = useMemo(() => {
    return users.map((u, index) => {
      const levelNum = Number(u.level) || 1;
      const levelName = getLevelTitle(levelNum);
      
      return {
        pos: index + 1,
        id: u.id,
        name: u.name,
        email: u.email,
        nick: u.email.split('@')[0],
        levelName: levelName,
        pts: Number(u.points) || 0,
        totalRentalsCount: Number(u.totalRentalsCount) || 0,
        avatar: u.avatar,
        picture: u.picture,
        color: LEVEL_COLORS[levelName] || '#9CA3AF',
        returnRate: 100, 
        delta: 0, 
      };
    });
  }, [users]);

  const TOP3 = topUsers.slice(0, 3);
  const USERS_REST = topUsers.slice(3, 50); 

  const processedGames = useMemo(() => {
    let filtered = games;
    if (catFilter !== 'all') {
      filtered = filtered.filter(g => (g.tier || '').toLowerCase() === catFilter);
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      const rentsA = Number(a.rentalsCount) || 0;
      const rentsB = Number(b.rentalsCount) || 0;
      return rentsB - rentsA;
    }).map((g, index) => {
      const tier = g.tier || 'BRONZE';
      return {
        pos: index + 1,
        id: g.id,
        title: g.title,
        cover: g.cover,
        maker: g.mechanics?.[0] || 'Jogo de Tabuleiro',
        tier: tier,
        catColor: TIER_COLORS[tier] || '#9CA3AF',
        rentalsCount: Number(g.rentalsCount) || 0, 
        rating: Number(g.rating) || 0,
        ratingsCount: Number(g.ratingsCount) || 0,
        headerGrad: TIER_GRADIENTS[tier] || TIER_GRADIENTS.PRATA
      };
    });
  }, [games, catFilter, sortBy]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F2FF]">
      <Sidebar activePage="ranking" onNavigate={onNavigate} onLogout={onLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
  
        <Header onLogout={onLogout} onMenuToggle={() => setSidebarOpen(o => !o)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-black" style={{ fontSize: 32, color: '#04096D', lineHeight: 1.2 }}>Ranking de Temporadas</h1>
              <p className="mt-1 text-sm font-medium text-gray-500">Consulte o desempenho dos alunos na temporada atual ou em ciclos anteriores</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Select label="Temporada" options={seasonOptions} value={selectedSeasonId} onChange={setSelectedSeasonId} />
              <button className="flex items-center gap-2 h-9 px-5 rounded-lg font-bold text-sm transition-all hover:bg-[#04096D] hover:text-white bg-white text-[#04096D] border border-[#04096D] shadow-sm">
                <Download size={15} strokeWidth={2.5} /> Exportar
              </button>
            </div>
          </div>

          <div className="border-b-2 mb-8 border-gray-200">
            <div className="flex gap-2">
              {TABS.map(tab => (
                <button
                  key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className="px-6 py-3.5 text-sm font-bold transition-all relative rounded-t-xl"
                  style={activeTab === tab.key ? { color: '#04096D', background: '#FFFFFF', borderBottom: '3px solid #04096D' } : { color: '#6B7280', background: 'transparent', borderBottom: '3px solid transparent' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-[#04096D]" size={48} />
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              {activeTab === 'usuarios' && <UsersTab top3={TOP3} usersRest={USERS_REST} />}
              
              {activeTab === 'jogos' && (
                <div className="space-y-6">
                 
                  <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <Select label="Categoria" options={GAME_CAT_OPTIONS} value={catFilter} onChange={setCatFilter} />
                    <Select label="Ordenar por" options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />
                  </div>
               
                  <GamesTab games={processedGames} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}