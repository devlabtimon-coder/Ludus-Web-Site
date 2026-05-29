import { GameTier } from '../../../types/api';

interface CategoryBadgeProps {
  category: GameTier;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const styles: Record<GameTier, string> = {
    OURO: 'bg-yellow-400 text-yellow-900',
    DIAMANTE: 'bg-cyan-400 text-cyan-900',
    PRATA: 'bg-gray-300 text-gray-700',
    BRONZE: 'bg-orange-400 text-orange-900',
    LATAO: 'bg-amber-200 text-amber-800',
  };

  return (
    <span className={`${styles[category]} px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-block`}>
      {category}
    </span>
  );
}
