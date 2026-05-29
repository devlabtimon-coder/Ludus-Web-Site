import { LucideIcon } from 'lucide-react';

interface RegistrationMetricCardProps {
  label: string;
  value: string | number;
  tag: string;
  icon: LucideIcon;
  variant: 'dark' | 'white' | 'yellow';
  tagColor?: 'blue' | 'green' | 'red';
  iconColor?: string;
}

export function RegistrationMetricCard({
  label,
  value,
  tag,
  icon: Icon,
  variant,
  tagColor = 'blue',
  iconColor,
}: RegistrationMetricCardProps) {
  const variants = {
    dark: 'bg-[#04096E] text-white', // Azul Ludus
    white: 'bg-white border border-gray-200 text-[#0A1628]',
    yellow: 'bg-[#FBBC04] text-[#04096E]', // Amarelo Ludus com texto Azul
  };

  const labelColors = {
    dark: 'text-[#FBBC04]', // Amarelo Ludus
    white: 'text-gray-500',
    yellow: 'text-[#04096E]', // Azul Ludus
  };

  const tagColors = {
    blue: 'bg-[#04096E]/10 text-[#04096E]',
    green: 'bg-green-100 text-green-700',
    red: 'bg-[#E62325]/10 text-[#E62325]',
  };

  const iconColors = {
    dark: 'text-white',
    white: iconColor || 'text-green-500',
    yellow: iconColor || 'text-[#04096E]',
  };

  return (
    <div className={`${variants[variant]} rounded-xl p-6 relative shadow-sm`}>
      <div className="absolute top-6 right-6">
        <Icon className={iconColors[variant]} size={32} />
      </div>

      <div className="space-y-3">
        <p className={`text-xs font-bold uppercase tracking-wide ${labelColors[variant]}`}>
          {label}
        </p>
        <p className="text-4xl font-bold">{value}</p>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${tagColors[tagColor]}`}>
          {tag}
        </span>
      </div>
    </div>
  );
}