import { ReactNode } from 'react';

interface UsersMetricCardProps {
  title: string;
  value: number | string;
  tag?: string;
  icon?: ReactNode;
  variant: 'dark-blue' | 'white-gold' | 'yellow';
}

export function UsersMetricCard({ title, value, tag, icon, variant }: UsersMetricCardProps) {
  // Cores baseadas na identidade visual da Ludus
  const cardStyles = {
    'dark-blue': 'bg-[#04096D] border border-[#1F2937] text-white',
    'white-gold': 'bg-white border border-[#1F2937] text-[#02096D]',
    yellow: 'bg-[#FAB208] border border-[#1F2937] text-[#02096D]',
  };

  const titleStyles = {
    'dark-blue': 'text-[#9CA3AF]',
    'white-gold': 'text-[#02096D]',
    yellow: 'text-black',
  };

  const valueStyles = {
    'dark-blue': 'text-white',
    'white-gold': 'text-[#F5A623]', // Dourado/Laranja
    yellow: 'text-[#02096D]',
  };

  // Cores do "Pill" (a tag arredondada)
  const tagStyles = {
    'dark-blue': 'bg-white/10 text-white',
    'white-gold': 'bg-[#F5A623]/10 text-[#F5A623]',
    yellow: 'bg-[#02096D]/10 text-[#02096D]',
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