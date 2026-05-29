import { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { Avatar } from '../shared/Avatar';

interface HeaderProps {
  notificationCount?: number;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export function Header({ notificationCount = 0 }: HeaderProps) {
  // Estado atualizado para incluir campos de avatar/imagem
  const [userData, setUserData] = useState<{ 
    name: string; 
    email: string; 
    avatar?: string | null; 
    picture?: string | null; 
  } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (e) {
        console.error('Erro ao ler dados do usuário:', e);
      }
    }
  }, []);

  const userName = userData?.name || 'Admin';
  const userEmail = userData?.email?.toUpperCase() || 'ADMIN@LUDUS.COM';
  // A URL da imagem real:
  const userAvatar = userData?.avatar || userData?.picture;

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar jogos, usuários..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 text-white rounded-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="text-gray-600" size={24} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </div>

          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>
          
          {/* Agora passando o src com a imagem real */}
          <Avatar 
            name={userName} 
            color="#3b82f6" 
            src={userAvatar} 
          />
        </div>
      </div>
    </header>
  );
}