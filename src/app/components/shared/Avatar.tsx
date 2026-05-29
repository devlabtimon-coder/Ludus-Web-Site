import { useState, useEffect } from 'react';

interface AvatarProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  src?: string | null;
}

export function Avatar({ name, color = '#31358B', size = 'md', src }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  
  // 1. Forçamos o HTTPS e garantimos que é uma string válida
  const secureSrc = src ? src.replace(/^http:/i, 'https:') : null;

  // Resetamos o erro caso o src mude (ex: login efetuado)
  useEffect(() => {
    setImgError(false);
  }, [src]);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  const initials = name
    .split(' ')
    .filter((n) => n.length > 0)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (secureSrc && !imgError) {
    return (
      <img
        src={secureSrc}
        alt={name}
        // referrerPolicy="no-referrer" ajuda a contornar bloqueios do Google/Servidores
        referrerPolicy="no-referrer"
        className={`${sizeClasses[size]} rounded-full object-cover shadow-sm bg-gray-100`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold shadow-sm`}
      style={{ backgroundColor: color }}
    >
      {initials || '?'}
    </div>
  );
}