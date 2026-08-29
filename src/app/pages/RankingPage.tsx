import { useState, useEffect, useMemo } from 'react';
import { Download, Loader2, Trophy, Gamepad2, Tag, Users } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { 
  UsersTab, GamesTab, CategoriesTab, 
  CATEGORY_COLORS, TIER_COLORS, TIER_GRADIENTS, Select 
} from '../components/ranking/RankingTabs';

interface RankingPageProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

type Tab = 'usuarios' | 'jogos' | 'categorias';

const TABS: { key: Tab; label: string }[] = [
  { key: 'usuarios', label: 'Usuários' },
  { key: 'jogos', label: 'Jogos' },
  { key: 'categorias', label: 'Categorias' },
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
      const rawCat = u.clientCategory || 'STARTER';
      const category = rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase();
      
      return {
        pos: index + 1,
        id: u.id,
        name: u.name,
        nick: u.email.split('@')[0],
        category,
        pts: Number(u.points) || 0,
        rentals: Number(u.totalRentalsCount) || 0,
        avatar: u.avatar,
        picture: u.picture,
        color: CATEGORY_COLORS[category] || '#9CA3AF',
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
        name: g.title,
        cover: g.cover,
        maker: g.mechanics?.[0] || 'Jogo de Tabuleiro',
        category: tier,
        catColor: TIER_COLORS[tier] || '#9CA3AF',
        rentals: Number(g.rentalsCount) || 0, 
        rating: Number(g.rating) || 0,
        onTime: 95,
        headerGrad: TIER_GRADIENTS[tier] || TIER_GRADIENTS.PRATA
      };
    });
  }, [games, catFilter, sortBy]);

  const maxGameRentals = Math.max(...processedGames.map(g => g.rentals), 1);

  const USER_CAT_BARS = useMemo(() => {
    const counts: Record<string, number> = { Starter: 0, Family: 0, Expert: 0, Ultragamer: 0 };
    users.forEach(u => {
      const rawCat = u.clientCategory || 'STARTER';
      const cat = rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase();
      if (counts[cat] !== undefined) counts[cat]++;
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count, color: CATEGORY_COLORS[label] }))
      .sort((a, b) => b.count - a.count);
  }, [users]);

  const GAME_CAT_BARS = useMemo(() => {
    const counts: Record<string, number> = { LATAO: 0, BRONZE: 0, PRATA: 0, OURO: 0, DIAMANTE: 0 };
    games.forEach(g => {
      const tier = g.tier || 'BRONZE';
      if (counts[tier] !== undefined) counts[tier]++;
    });
    return Object.entries(counts)
      .map(([label, count]) => ({ label, count, color: TIER_COLORS[label] }))
      .sort((a, b) => b.count - a.count);
  }, [games]);

  const INSIGHTS = [
    { icon: Trophy, value: TOP3[0]?.name || 'N/A', sub: TOP3[0]?.category || '-', label: 'Líder do Período', color: '#FBBC04' },
    { icon: Gamepad2, value: processedGames[0]?.name || 'N/A', sub: `${(processedGames[0]?.rating || 0).toFixed(1)} de nota`, label: 'Jogo Melhor Avaliado', color: '#04096D' },
    { icon: Tag, value: USER_CAT_BARS[0]?.label || 'N/A', sub: `${USER_CAT_BARS[0]?.count || 0} usuários`, label: 'Categoria Dominante', color: '#10B981' },
    { icon: Users, value: users.length.toString(), sub: 'Alunos ativos', label: 'Total de Jogadores', color: '#31358B' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F2FF]">
      <Sidebar activePage="ranking" onNavigate={onNavigate} onLogout={onLogout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header notificationCount={0} onLogout={onLogout} onMenuToggle={() => setSidebarOpen(o => !o)} />

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
                <GamesTab 
                  processedGames={processedGames} 
                  maxGameRentals={maxGameRentals} 
                  catFilter={catFilter} 
                  setCatFilter={setCatFilter} 
                  sortBy={sortBy} 
                  setSortBy={setSortBy} 
                />
              )}

              {activeTab === 'categorias' && (
                <CategoriesTab 
                  userCatBars={USER_CAT_BARS} 
                  gameCatBars={GAME_CAT_BARS} 
                  insights={INSIGHTS} 
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}