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

  // Cores adaptadas para servirem como marca d'água de fundo
  const iconColors = {
    dark: 'text-white',
    white: iconColor || 'text-gray-300', 
    yellow: iconColor || 'text-[#04096E]',
  };

  // Níveis de transparência para cada cor de fundo
  const watermarkOpacities = {
    dark: 'opacity-10',
    white: 'opacity-[0.15]',
    yellow: 'opacity-10',
  };

  return (
    <div className={`${variants[variant]} rounded-xl p-6 relative shadow-sm overflow-hidden`}>
      {/* Ícone gigante no fundo (Estilo Ludus) */}
      <div className={`absolute -right-6 -bottom-6 pointer-events-none transition-transform duration-300 group-hover:scale-110 ${watermarkOpacities[variant]}`}>
        <Icon className={iconColors[variant]} size={140} strokeWidth={1.5} />
      </div>

      {/* Conteúdo (z-10 para garantir que fica por cima do ícone) */}
      <div className="relative z-10 space-y-3">
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