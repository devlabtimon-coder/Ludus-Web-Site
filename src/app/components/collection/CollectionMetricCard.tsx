import { ReactNode } from 'react';

interface CollectionMetricCardProps {
  title: string;
  value: number | string;
  tag?: string; // Coloquei como opcional
  icon?: ReactNode; // Adicionado para a marca d'água!
  variant: 'dark-blue' | 'white-orange' | 'yellow' | 'white-red';
}

export function CollectionMetricCard({ title, value, tag, icon, variant }: CollectionMetricCardProps) {
  // Cores baseadas na identidade visual da Ludus
  const cardStyles = {
    'dark-blue': 'bg-[#04096D] border border-[#1F2937] text-white',
    'white-orange': 'bg-white border border-[#1F2937] text-[#02096D]',
    yellow: 'bg-[#FAB208] border border-[#1F2937] text-[#02096D]',
    'white-red': 'bg-white border border-[#1F2937] text-[#02096D]',
  };

  const titleStyles = {
    'dark-blue': 'text-[#9CA3AF]',
    'white-orange': 'text-[#02096D]',
    yellow: 'text-black',
    'white-red': 'text-[#02096D]',
  };

  const valueStyles = {
    'dark-blue': 'text-white',
    'white-orange': 'text-[#F5A623]', // Laranja para dar destaque
    yellow: 'text-[#02096D]',
    'white-red': 'text-[#FC090D]', // Vermelho para alerta de manutenção
  };

  // Cores do "Pill" (a tag arredondada)
  const tagStyles = {
    'dark-blue': 'bg-white/10 text-white',
    'white-orange': 'bg-[#F5A623]/10 text-[#F5A623]',
    yellow: 'bg-[#02096D]/10 text-[#02096D]',
    'white-red': 'bg-[#FC090D]/10 text-[#FC090D]',
  };

  return (
    <div className={`${cardStyles[variant]} rounded-2xl p-6 h-[139px] flex flex-col justify-between relative overflow-hidden font-sans select-none`}>
      
      <div className="flex flex-col gap-1 z-10">
        <h3 className={`${titleStyles[variant]} text-[10px] font-bold tracking-wider uppercase`}>
          {title}
        </h3>
        
        <p className={`${valueStyles[variant]} text-[36px] font-bold leading-[40px]`}>
          {value}
        </p>
      </div>

      {/* Renderiza a tag apenas se ela existir */}
      {tag && (
        <div className="z-10 flex items-center mt-auto">
          <span className={`${tagStyles[variant]} text-[10px] font-bold px-3 py-1 rounded-full`}>
            {tag}
          </span>
        </div>
      )}

      {/* Ícone d'água absoluto no fundo direito */}
      {icon && (
        <div className="absolute right-[-15px] bottom-[-15px] text-current opacity-10 pointer-events-none z-0">
          {icon}
        </div>
      )}
    </div>
  );
}