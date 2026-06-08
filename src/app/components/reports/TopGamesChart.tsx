import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, Line } from 'recharts';
import { useState } from 'react';

// --- TopGamesChart ---
export function TopGamesChart({ games }: { games: any[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Jogos Mais Alugados</h2>
        <span className="px-3 py-1 bg-[#EFF6FF] text-[#04096E] rounded-full text-xs font-bold">Top 6</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={games}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
          <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
          <Tooltip contentStyle={{ backgroundColor: '#04096E', border: 'none', borderRadius: '8px', color: '#fff' }} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {games.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? "#FBBC04" : "#04096E"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- RentalsEvolutionChart ---
export function RentalsEvolutionChart({ data }: { data: any[] }) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Evolução de Empréstimos</h2>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                period === p ? 'bg-[#04096E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Ano'}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRentals" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#04096E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#04096E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
          <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={{ stroke: '#E5E7EB' }} />
          <Tooltip contentStyle={{ backgroundColor: '#04096E', border: 'none', borderRadius: '8px', color: '#fff' }} />
          <Area type="monotone" dataKey="rentals" stroke="#04096E" strokeWidth={3} fill="url(#colorRentals)" dot={{ fill: '#04096E', r: 4 }} />
          <Line type="monotone" dataKey="projection" stroke="#FBBC04" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}