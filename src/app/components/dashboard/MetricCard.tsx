import { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtext: string; 
  icon: ReactNode;
  variant?: 'yellow' | 'white' | 'dark' | 'white-yellow';
}

export function MetricCard({ title, value, subtext, icon, variant = 'white' }: MetricCardProps) {
  const cardStyles = {
    yellow: 'bg-[#FAB208] border border-[#1F2937] text-[#02096D]',
    white: 'bg-white border border-[#1F2937] text-[#02096D]',
    dark: 'bg-[#04096D] border border-[#1F2937] text-white',
    'white-yellow': 'bg-white border border-[#1F2937] text-[#EAB308]',
  };

  const titleStyles = {
    yellow: 'text-black',
    white: 'text-[#02096D]',
    dark: 'text-[#9CA3AF]',
    'white-yellow': 'text-[#FBBC04]',
  };

  const subtextStyles = {
    yellow: 'text-[#1E293B]',
    white: 'text-[#02096D]',
    dark: 'text-white',
    'white-yellow': 'text-[#FAB208]',
  };

  return (
    <div className={`${cardStyles[variant]} rounded-2xl p-6 h-[139px] flex flex-col justify-between relative overflow-hidden font-sans select-none`}>
      
      <div className="flex flex-col gap-1 z-10">
        <h3 className={`${titleStyles[variant]} text-[10px] font-bold tracking-wider uppercase`}>
          {title}
        </h3>
        
        <p className="font-bold text-[36px] leading-[40px]">
          {value}
        </p>
      </div>

      <p className={`${subtextStyles[variant]} text-[10px] font-bold z-10`}>
        {subtext}
      </p>

      <div className="absolute right-[-15px] bottom-[-15px] text-current opacity-10 pointer-events-none z-0">
        {icon}
      </div>
    </div>
  );
}