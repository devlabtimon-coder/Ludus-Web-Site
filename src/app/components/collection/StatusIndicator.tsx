interface StatusIndicatorProps {
  status: 'Disponível' | 'Alugado' | 'Manutenção';
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const styles = {
    Disponível: {
      dot: 'bg-green-500',
      text: 'text-gray-700',
    },
    Alugado: {
      dot: 'bg-orange-500',
      text: 'text-gray-700',
    },
    Manutenção: {
      dot: 'bg-red-500',
      text: 'text-gray-700',
    },
  };

  const style = styles[status];

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
      <span className={`text-sm font-medium ${style.text}`}>{status}</span>
    </div>
  );
}
