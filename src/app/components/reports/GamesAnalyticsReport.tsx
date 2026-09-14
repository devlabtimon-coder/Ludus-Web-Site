import { useState, useMemo } from 'react';
import { 
  Package, 
  Flame, 
  Snowflake, 
  AlertTriangle, 
  Star, 
  ArrowUpDown, 
  Search, 
  Tag, 
  ShieldAlert,
  Clock,
  Gamepad2
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';

export interface GameReportItem {
  id: string;
  title: string;
  cover?: string | null;
  tier: string;
  totalCopies: number;
  activeRentals: number;
  totalRentalsPeriod: number;
  maintenanceCount: number;
  avgRating: number;
  ratingsCount: number;
  turnoverRate: number; 
}

interface GamesAnalyticsReportProps {
  gamesData?: GameReportItem[];
}

export function GamesAnalyticsReport({ gamesData = [] }: GamesAnalyticsReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [sortBy, setSortBy] = useState<'turnover' | 'rentals' | 'maintenance' | 'rating'>('turnover');

  
  const topDemandGames = useMemo(() => {
    return [...gamesData].sort((a, b) => b.totalRentalsPeriod - a.totalRentalsPeriod).slice(0, 5);
  }, [gamesData]);

 
  const idleGames = useMemo(() => {
    return gamesData.filter(g => g.totalRentalsPeriod === 0);
  }, [gamesData]);


  const problemGames = useMemo(() => {
    return gamesData.filter(g => g.maintenanceCount > 0).sort((a, b) => b.maintenanceCount - a.maintenanceCount);
  }, [gamesData]);

  
  const filteredGames = useMemo(() => {
    return gamesData
      .filter(g => {
        const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTier = selectedTier === 'all' || (g.tier || '').toLowerCase() === selectedTier.toLowerCase();
        return matchesSearch && matchesTier;
      })
      .sort((a, b) => {
        if (sortBy === 'turnover') return b.turnoverRate - a.turnoverRate;
        if (sortBy === 'rentals') return b.totalRentalsPeriod - a.totalRentalsPeriod;
        if (sortBy === 'maintenance') return b.maintenanceCount - a.maintenanceCount;
        if (sortBy === 'rating') return b.avgRating - a.avgRating;
        return 0;
      });
  }, [gamesData, searchTerm, selectedTier, sortBy]);

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Flame size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Alta Rotatividade</p>
            <p className="text-2xl font-black text-[#04096D]">{topDemandGames[0]?.title || '—'}</p>
            <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
              {topDemandGames[0] ? `${topDemandGames[0].totalRentalsPeriod} aluguéis no período` : 'Sem registros'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Snowflake size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Jogos Ociosos</p>
            <p className="text-2xl font-black text-[#04096D]">{idleGames.length} títulos</p>
            <p className="text-[11px] font-semibold text-gray-400 mt-0.5">0 aluguéis no período selecionado</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sinistralidade</p>
            <p className="text-2xl font-black text-[#E62325]">
              {problemGames.reduce((acc, g) => acc + g.maintenanceCount, 0)} avarias
            </p>
            <p className="text-[11px] font-semibold text-gray-400 mt-0.5">
              Distribuídas em {problemGames.length} títulos
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 text-[#04096D] flex items-center justify-center shrink-0">
            <Package size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total de Cópias Físicas</p>
            <p className="text-2xl font-black text-[#04096D]">
              {gamesData.reduce((acc, g) => acc + g.totalCopies, 0)} un.
            </p>
            <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Em circulação no acervo</p>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <Flame className="text-orange-500" size={20} /> Top 5 com Maior Giro
            </h3>
            <span className="text-xs font-bold text-gray-400 uppercase">Aluguéis no período</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDemandGames} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis dataKey="title" type="category" width={110} tick={{ fontSize: 11, fill: '#04096D', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#04096D', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} 
                  formatter={(val: any) => [`${val} aluguéis`, 'Volume']}
                />
                <Bar dataKey="totalRentalsPeriod" radius={[0, 6, 6, 0]}>
                  {topDemandGames.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#FBBC04' : '#04096D'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

       
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={20} /> Títulos Críticos (Avarias & Manutenção)
            </h3>
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Atenção</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-64 pr-1">
            {problemGames.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                <Package size={36} className="text-green-500 mb-2 opacity-50" />
                <p className="text-sm font-bold text-gray-600">Nenhum jogo com histórico de avarias!</p>
              </div>
            ) : (
              problemGames.map((g) => (
                <div key={g.id} className="flex items-center justify-between p-3 bg-red-50/50 border border-red-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 font-black text-xs flex items-center justify-center">
                      {g.maintenanceCount}x
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{g.title}</p>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{g.tier}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-md">
                      Requer vistoria
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Auditoria Individual por Jogo</h3>
            <p className="text-xs sm:text-sm text-gray-500">Métricas completas de giro, estoque e satisfação</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar jogo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#04096D] w-48 sm:w-56"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="py-1.5 px-3 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#04096D]"
            >
              <option value="all">Todos os Tiers</option>
              <option value="ouro">Ouro</option>
              <option value="prata">Prata</option>
              <option value="bronze">Bronze</option>
              <option value="diamante">Diamante</option>
              <option value="latao">Latão</option>
            </select>

           
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1.5 px-3 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#04096D]"
            >
              <option value="turnover">Maior Taxa de Giro</option>
              <option value="rentals">Mais Alugados</option>
              <option value="maintenance">Mais Avariados</option>
              <option value="rating">Melhor Avaliação</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left text-[13px] min-w-[800px]">
              <thead className="bg-[#F7F8FF] border-b border-gray-200 text-gray-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Jogo</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4 text-center">Cópias</th>
                  <th className="py-3 px-4 text-center">Aluguéis (Período)</th>
                  <th className="py-3 px-4 text-center">Taxa de Giro</th>
                  <th className="py-3 px-4 text-center">Avaliação</th>
                  <th className="py-3 px-4 text-center">Avarias</th>
                </tr>
              </thead>
              <tbody>
                {filteredGames.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400 font-semibold">
                      Nenhum jogo localizado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredGames.map((g) => (
                    <tr key={g.id} className="border-b border-gray-50 hover:bg-gray-50/50 bg-white">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {g.cover ? (
                              <img src={g.cover} alt={g.title} className="w-full h-full object-cover" />
                            ) : (
                              <Gamepad2 size={18} className="text-gray-400" />
                            )}
                          </div>
                          <p className="font-bold text-[#04096D] truncate max-w-[200px]">{g.title}</p>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase">
                          {g.tier}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-gray-800">
                        {g.totalCopies}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-[#04096D] text-sm">
                          {g.totalRentalsPeriod}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`font-bold text-xs ${g.turnoverRate >= 50 ? 'text-green-600' : g.turnoverRate > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                            {g.turnoverRate}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded font-bold text-xs border border-yellow-200/50">
                          <Star size={12} className="text-[#FBBC04] fill-[#FBBC04]" />
                          <span>{g.avgRating > 0 ? g.avgRating.toFixed(1) : '—'}</span>
                          <span className="text-[10px] text-gray-400 font-normal">({g.ratingsCount})</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {g.maintenanceCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                            {g.maintenanceCount} avaria{g.maintenanceCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs font-semibold">0</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}