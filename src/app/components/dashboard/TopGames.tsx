import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GameStats } from '../../types';

interface TopGamesProps {
  games: GameStats[];
}

export function TopGames({ games }: TopGamesProps) {
  // Array de cores da identidade visual da Ludus
  const ludusColors = ['#04096D', '#FAB208', '#FC090D', '#10B981'];

  const chartData = games.map((game, index) => ({
    ...game,
    id: `game-${index}-${game.name}`,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Jogos Mais Alugados</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#374151', fontSize: 12, fontWeight: 600 }}
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: '#f9fafb' }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Bar
            dataKey="rentals"
            radius={[6, 6, 0, 0]}
            name="Aluguéis"
          >
            {chartData.map((entry, index) => (
              // Aplica a cor do array baseado no índice (ciclando as cores)
              <Cell 
                key={`cell-${entry.id}`} 
                fill={ludusColors[index % ludusColors.length]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}