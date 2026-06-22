import { Edit, Trash2, EyeOff, Eye, Layers } from 'lucide-react';
import { Game } from '../../../types/api';
import { CategoryBadge } from './CategoryBadge';
import { StatusIndicator } from './StatusIndicator';

interface GamesCatalogTableProps {
  games: Game[];
  onEditClick: (game: Game) => void;
  onDeleteClick?: (game: Game) => void;
  onInactivateClick?: (game: Game) => void;
  onManageCopiesClick: (game: Game) => void;
}

// 👇 CORREÇÃO: onManageCopiesClick adicionado aqui dentro das chaves { ... }
export function GamesCatalogTable({ 
  games, 
  onEditClick, 
  onDeleteClick, 
  onInactivateClick, 
  onManageCopiesClick 
}: GamesCatalogTableProps) {
  
  const getStatus = (game: Game): 'Disponível' | 'Alugado' | 'Manutenção' => {
    // Ajuste "isActive" para a propriedade real do seu banco caso seja diferente
    if (!game.isActive) return 'Manutenção';
    return game.available ? 'Disponível' : 'Alugado';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Catálogo de Jogos</h2>
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead className="bg-[#F7F8FF]">
            <tr>
              <th className="text-left py-4 px-5 text-xs font-bold text-[#31358B] uppercase tracking-wide">Jogo</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-[#31358B] uppercase tracking-wide">Categoria</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-[#31358B] uppercase tracking-wide">Status</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-[#31358B] uppercase tracking-wide">Preço</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-[#31358B] uppercase tracking-wide">Ações</th>
            </tr>
          </thead>
          <tbody>
            {games.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500 font-medium">Nenhum jogo encontrado para estes filtros.</td>
              </tr>
            ) : (
              games.map((game) => (
                <tr key={game.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors bg-white">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      {game.cover && <img src={game.cover} alt="Capa" className="w-10 h-10 rounded-lg object-cover shadow-sm" />}
                      <div>
                        <p className="font-bold text-gray-900">{game.title}</p>
                        <p className="text-xs text-gray-500">{game.minPlayers}-{game.maxPlayers || '+'} jogadores</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5"><CategoryBadge category={game.tier} /></td>
                  <td className="py-4 px-5"><StatusIndicator status={getStatus(game)} /></td>
                  <td className="py-4 px-5">
                    <span className="text-sm font-bold text-[#04096D]">R$ {(game.price || 0).toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">

                      <button 
                        onClick={() => onManageCopiesClick(game)} 
                        title="Gerenciar Exemplares (Cópias Físicas)"
                        className="bg-indigo-50 hover:bg-indigo-100 text-[#31358B] p-2.5 rounded-lg transition-colors font-semibold"
                      >
                        <Layers size={16} />
                      </button>

                      <button 
                        onClick={() => onEditClick(game)} 
                        title="Editar Jogo"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2.5 rounded-lg transition-colors font-semibold"
                      >
                        <Edit size={16} />
                      </button>
                      
                      {onInactivateClick && (
                        <button 
                          onClick={() => onInactivateClick(game)} 
                          title={game.isActive ? "Inativar Jogo" : "Reativar Jogo"}
                          className={`p-2.5 rounded-lg transition-colors font-semibold ${
                            game.isActive ? 'bg-orange-50 hover:bg-orange-100 text-orange-600' : 'bg-green-50 hover:bg-green-100 text-green-600'
                          }`}
                        >
                          {game.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      )}

                      {onDeleteClick && (
                        <button 
                          onClick={() => onDeleteClick(game)} 
                          title="Excluir Jogo"
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-2.5 rounded-lg transition-colors font-semibold"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        <div className="bg-gray-50 px-5 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Exibindo {games.length} resultados</p>
        </div>
      </div>
    </div>
  );
}