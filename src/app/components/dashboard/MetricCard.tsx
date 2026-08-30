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
    <div className={`${cardStyles[variant]} rounded-2xl p-5 sm:p-6 min-h-[120px] sm:h-[139px] flex flex-col justify-between relative overflow-hidden font-sans select-none shadow-sm transition-all`}>
      
      <div className="flex flex-col gap-1 z-10">
        <h3 className={`${titleStyles[variant]} text-[10px] sm:text-[11px] font-bold tracking-wider uppercase line-clamp-1`}>
          {title}
        </h3>
        
        <p className="font-bold text-3xl sm:text-[36px] leading-tight sm:leading-[40px]">
          {value}
        </p>
      </div>

      <p className={`${subtextStyles[variant]} text-[10px] sm:text-[11px] font-bold z-10 mt-2 sm:mt-0`}>
        {subtext}
      </p>

      <div className="absolute right-[-10px] bottom-[-10px] sm:right-[-15px] sm:bottom-[-15px] text-current opacity-10 pointer-events-none z-0 scale-75 sm:scale-100 transition-transform">
        {icon}
      </div>
    </div>
  );
}