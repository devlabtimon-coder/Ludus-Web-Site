import { LucideIcon } from 'lucide-react';

interface ReportKPICardProps {
  label: string;
  value: string;
  tag: string;
  icon: LucideIcon;
  variant: 'dark' | 'yellow' | 'white-blue' | 'white-green';
}

export function ReportKPICard({ label, value, tag, icon: Icon, variant }: ReportKPICardProps) {
  const variants = {
    dark: {
      bg: 'bg-[#04096E]',
      text: 'text-white',
      label: 'text-[#FBBC04]',
      icon: 'text-white',
      tag: 'bg-white/20 text-[#FBBC04]',
    },
    yellow: {
      bg: 'bg-[#FBBC04]',
      text: 'text-[#04096E]',
      label: 'text-[#04096E]',
      icon: 'text-[#04096E]',
      tag: 'bg-[#04096E]/10 text-[#04096E]',
    },
    'white-blue': {
      bg: 'bg-white border border-gray-200',
      text: 'text-[#04096E]',
      label: 'text-gray-500',
      icon: 'text-[#04096E]',
      tag: 'text-gray-600 bg-gray-100',
    },
    'white-green': {
      bg: 'bg-white border border-gray-200',
      text: 'text-[#22C55E]',
      label: 'text-gray-500',
      icon: 'text-[#22C55E]',
      tag: 'text-gray-600 bg-gray-100',
    },
  };

  const style = variants[variant];

  return (
    <div className={`${style.bg} rounded-xl p-6 relative shadow-sm`}>
      <div className="absolute top-6 right-6 opacity-80">
        <Icon className={style.icon} size={32} />
      </div>
      <div className="space-y-3">
        <p className={`text-xs font-bold uppercase tracking-wide ${style.label}`}>{label}</p>
        <p className={`text-4xl font-bold ${style.text}`}>{value}</p>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${style.tag}`}>
          {tag}
        </span>
      </div>
    </div>
  );
}