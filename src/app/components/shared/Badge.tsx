interface BadgeProps {
  // Adicionamos 'Em Análise' ao tipo do status
  status: 'Em Análise' | 'Em Andamento' | 'Atrasado' | 'Concluído';
}

export function Badge({ status }: BadgeProps) {
  const styles = {
    'Em Análise': 'bg-amber-100 text-amber-700', // Usei tons de âmbar/amarelo para "pendente/análise"
    'Em Andamento': 'bg-blue-100 text-blue-700',
    'Atrasado': 'bg-red-100 text-red-700',
    'Concluído': 'bg-green-100 text-green-700',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}