import { useState, useEffect } from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { Avatar } from '../shared/Avatar';

interface HeaderProps {
  notificationCount?: number;
  onLogout?: () => void;
  onMenuToggle?: () => void;
}

export function Header({ notificationCount = 0, onMenuToggle }: HeaderProps) {
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
  const userAvatar = userData?.avatar || userData?.picture;

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4">
      <div className="flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 md:hidden">
          <button 
            onClick={onMenuToggle}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu size={26} />
          </button>
          
          <div className="font-black text-xl tracking-tight flex items-center">
            <span className="text-[#E62325]">L</span>
            <span className="text-[#FBBC04]">U</span>
            <span className="text-[#04096D]">D</span>
            <span className="text-[#22C55E]">U</span>
            <span className="text-[#F97316]">S</span>
          </div>
        </div>

        <div className="hidden md:block flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar jogos, usuários..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#F7F8FF] text-[#04096D] font-medium rounded-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#31358B]/20 transition-all border border-transparent focus:border-[#31358B]/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4 ml-auto">
          <button className="relative p-2 hover:bg-gray-50 rounded-full transition-colors">
            <Bell className="text-gray-600" size={22} />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#E62325] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#04096D]">{userName}</p>
            <p className="text-xs font-semibold text-gray-500">{userEmail}</p>
          </div>
          
          <Avatar 
            name={userName} 
            color="#04096D" 
            src={userAvatar} 
            size="md"
          />
        </div>
      </div>
    </header>
  );
}