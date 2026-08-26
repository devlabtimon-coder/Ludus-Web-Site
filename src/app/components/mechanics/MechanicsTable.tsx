import { Edit, Trash2, EyeOff, Eye, Settings } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Mechanic } from '../../../types/api';

interface MechanicsTableProps {
  mechanics: Mechanic[];
  onEditClick: (mechanic: Mechanic) => void;
  onDeleteClick: (mechanic: Mechanic) => void;
}

export function MechanicsTable({ mechanics, onEditClick, onDeleteClick }: MechanicsTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Dicionário de Mecânicas</h2>
      </div>
      <div className="rounded-xl overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead className="bg-[#F7F8FF]">
            <tr>
              <th className="text-left py-4 px-5 text-xs font-bold text-[#31358B] uppercase tracking-wide">Mecânica</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-[#31358B] uppercase tracking-wide">Categoria</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-[#31358B] uppercase tracking-wide">Jogos Vinculados</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-[#31358B] uppercase tracking-wide">Status</th>
              <th className="text-left py-4 px-5 text-xs font-bold text-[#31358B] uppercase tracking-wide">Ações</th>
            </tr>
          </thead>
          <tbody>
            {mechanics.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500 font-medium">Nenhuma mecânica cadastrada.</td>
              </tr>
            ) : (
              mechanics.map((mechanic) => {
                const IconComponent = mechanic.icon && (LucideIcons as any)[mechanic.icon]
                  ? (LucideIcons as any)[mechanic.icon]
                  : Settings;

                return (
                  <tr key={mechanic.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors bg-white">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#F0F2FF] text-[#31358B] flex items-center justify-center border border-[#31358B]/10">
                          <IconComponent size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{mechanic.namePt}</p>
                          {mechanic.nameEn && <p className="text-xs text-gray-500">{mechanic.nameEn}</p>}
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-5">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        {mechanic.category}
                      </span>
                    </td>

                   
                    <td className="py-4 px-5 max-w-[280px]">
                      {mechanic.games && mechanic.games.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {mechanic.games.map((game, index) => (
                            <span 
                              key={index} 
                              className="bg-[#F0F2FF] text-[#31358B] border border-[#31358B]/20 px-2 py-1 rounded-md text-[11px] font-bold whitespace-nowrap"
                            >
                              {game}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                          Nenhum jogo
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${mechanic.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className={`text-sm font-medium text-gray-700`}>
                          {mechanic.active ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditClick(mechanic)}
                          title="Editar Mecânica"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-2.5 rounded-lg transition-colors font-semibold"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDeleteClick(mechanic)}
                          title="Excluir Mecânica"
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-2.5 rounded-lg transition-colors font-semibold"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="bg-gray-50 px-5 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 font-medium">Exibindo {mechanics.length} mecânicas</p>
        </div>
      </div>
    </div>
  );
}