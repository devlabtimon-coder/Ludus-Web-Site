import { ClientCategory } from '../../../types/api';

interface UserCategoryBadgeProps {
  category: ClientCategory;
}

export function UserCategoryBadge({ category }: UserCategoryBadgeProps) {
  const styles: Record<ClientCategory, string> = {
    ULTRAGAMER: 'bg-blue-900 text-white',
    FAMILY: 'bg-yellow-600 text-white',
    EXPERT: 'bg-purple-700 text-white',
    STARTER: 'bg-gray-600 text-white',
  };

  const labels: Record<ClientCategory, string> = {
    ULTRAGAMER: 'Ultragamer',
    FAMILY: 'Family',
    EXPERT: 'Expert',
    STARTER: 'Starter',
  };

  return (
    <span className={`${styles[category]} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-block`}>
      {labels[category]}
    </span>
  );
}
