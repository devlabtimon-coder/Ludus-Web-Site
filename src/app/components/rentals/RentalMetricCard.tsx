import { ReactNode } from 'react';

interface RentalMetricCardProps {
  title: string;
  value: number | string;
  tag?: string;
  icon?: ReactNode;
  variant: 'yellow' | 'white-red' | 'dark-blue' | 'white-green';
  onClick?: () => void; // <-- Propriedade de clique
}

export function RentalMetricCard({ title, value, tag, icon, variant, onClick }: RentalMetricCardProps) {

  const cardStyles = {
    yellow: 'bg-[#FAB208] border border-[#1F2937] text-[#02096D]',
    'white-red': 'bg-white border border-[#1F2937] text-[#02096D]',
    'dark-blue': 'bg-[#04096D] border border-[#1F2937] text-white',
    'white-green': 'bg-white border border-[#1F2937] text-[#02096D]',
  };

  const titleStyles = {
    yellow: 'text-black',
    'white-red': 'text-[#02096D]',
    'dark-blue': 'text-[#9CA3AF]',
    'white-green': 'text-[#02096D]',
  };

  const valueStyles = {
    yellow: 'text-[#02096D]',
    'white-red': 'text-[#FC090D]', 
    'dark-blue': 'text-white',
    'white-green': 'text-[#10B981]', 
  };

  
  const tagStyles = {
    yellow: 'bg-[#02096D]/10 text-[#02096D]',
    'white-red': 'bg-[#FC090D]/10 text-[#FC090D]',
    'dark-blue': 'bg-white/10 text-white',
    'white-green': 'bg-[#10B981]/10 text-[#10B981]',
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${cardStyles[variant]} 
        rounded-2xl p-6 h-[139px] flex flex-col justify-between relative overflow-hidden font-sans select-none
        ${onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all active:scale-[0.98]' : ''}
      `}
    >
      <div className="flex flex-col gap-1 z-10">
        <h3 className={`${titleStyles[variant]} text-[10px] font-bold tracking-wider uppercase`}>
          {title}
        </h3>
        
        <p className={`${valueStyles[variant]} text-[36px] font-bold leading-[40px]`}>
          {value}
        </p>
      </div>

      {tag && (
        <div className="z-10 flex items-center mt-auto">
          <span className={`${tagStyles[variant]} text-[10px] font-bold px-3 py-1 rounded-full`}>
            {tag}
          </span>
        </div>
      )}

      {icon && (
        <div className="absolute right-[-15px] bottom-[-15px] text-current opacity-10 pointer-events-none z-0">
          {icon}
        </div>
      )}
    </div>
  );
}