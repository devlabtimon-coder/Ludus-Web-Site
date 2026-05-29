import { useState } from 'react';
import { Info, ChevronRight, ChevronDown, User, Users, Trophy, Diamond } from 'lucide-react';
import { UserCategoryBadge } from './UserCategoryBadge';

export function CategoryProgressionCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Categorias mapeadas com os ícones do Lucide e as cores da identidade visual do app
  const categories = [
    { 
      name: 'STARTER' as const, 
      criteria: '0-10 aluguéis realizados',
      icon: User,
      iconColor: 'text-[#8B7355]', // Marrom/Bronze
      iconBg: 'bg-[#8B7355]/10'
    },
    { 
      name: 'FAMILY' as const, 
      criteria: '11-30 aluguéis realizados',
      icon: Users,
      iconColor: 'text-[#2E7D32]', // Verde
      iconBg: 'bg-[#2E7D32]/10'
    },
    { 
      name: 'EXPERT' as const, 
      criteria: '31-60 aluguéis realizados',
      icon: Trophy,
      iconColor: 'text-[#1565C0]', // Azul
      iconBg: 'bg-[#1565C0]/10'
    },
    { 
      name: 'ULTRAGAMER' as const, 
      criteria: '61+ aluguéis realizados',
      icon: Diamond,
      iconColor: 'text-[#6A1B9A]', // Roxo
      iconBg: 'bg-[#6A1B9A]/10'
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="bg-[#04096D]/10 p-2 rounded-xl">
            <Info className="text-[#04096D]" size={20} />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">
            Progressão de Categoria
          </h3>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#04096D] hover:text-[#070e99] text-sm font-bold transition-all flex items-center gap-2 bg-[#F7F8FF] px-4 py-2.5 rounded-xl border border-transparent hover:border-[#04096D]/20 w-fit"
        >
          {isExpanded ? 'Ocultar Detalhes' : 'Ver Regras'}
          {isExpanded ? <ChevronDown size={16} strokeWidth={2.5} /> : <ChevronRight size={16} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Linha do Tempo Visual */}
      <div className="flex flex-wrap items-center gap-3">
        {categories.map((category, index) => (
          <div key={category.name} className="flex items-center gap-3">
            <UserCategoryBadge category={category.name} />
            {index < categories.length - 1 && (
              <ChevronRight className="text-gray-300" size={20} strokeWidth={3} />
            )}
          </div>
        ))}
      </div>

      {/* Detalhes Expandidos (Com Ícones) */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {categories.map((category) => {
            const IconComponent = category.icon;
            
            return (
              <div 
                key={category.name} 
                className="bg-[#F7F8FF] rounded-xl p-4 border border-transparent hover:border-[#04096D]/20 transition-colors flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  {/* Ícone customizado da categoria */}
                  <div className={`p-2.5 rounded-xl ${category.iconBg}`}>
                    <IconComponent className={category.iconColor} size={20} />
                  </div>
                  <UserCategoryBadge category={category.name} />
                </div>
                
                <p className="text-sm text-gray-600 mt-auto bg-white/60 p-3 rounded-lg border border-gray-100">
                  <span className="font-bold text-gray-900 block mb-1">Critério de alcance:</span> 
                  {category.criteria}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}