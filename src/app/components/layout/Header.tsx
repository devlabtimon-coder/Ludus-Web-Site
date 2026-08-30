import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, LogOut, Settings, User, ChevronDown } from 'lucide-react';
import { Avatar } from '../shared/Avatar';
import { LogoutConfirmModal } from '../shared/LogoutConfirmModal';
import logoFull from '../../../assets/images/logo-full.png';

interface HeaderProps {
  notificationCount?: number;
  onLogout?: () => void;
  onMenuToggle?: () => void;
  onNavigate?: (page: string) => void;
}

export function Header({ notificationCount = 0, onLogout, onMenuToggle, onNavigate }: HeaderProps) {
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    avatar?: string | null;
    picture?: string | null;
  } | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    setShowLogoutModal(false);
    
    if (onLogout) {
      onLogout();
    }
    
    window.history.pushState({}, '', '/login');
    if (onNavigate) {
      onNavigate('login');
    } else {
      window.location.href = '/login';
    }
  };

  const userName = userData?.name || 'Admin';
  const userEmail = userData?.email?.toUpperCase() || 'ADMIN@LUDUS.COM';
  const userAvatar = userData?.avatar || userData?.picture;

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 sm:gap-3 md:hidden">
            <button 
              onClick={onMenuToggle}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu size={26} />
            </button>
            
            <div className="flex items-center">
              <img 
                src={logoFull} 
                alt="Ludus" 
                className="w-[100px] sm:w-[120px] object-contain" 
              />
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

            <div className="relative" ref={dropdownRef}>
              <div 
                className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-gray-50 p-1.5 pr-2 rounded-full transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
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
                
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                    <p className="text-sm font-bold text-[#04096D] truncate">{userName}</p>
                    <p className="text-xs font-semibold text-gray-500 truncate">{userEmail}</p>
                  </div>
                  
                  <button 
                    onClick={() => setIsDropdownOpen(false)} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User size={18} className="text-gray-400" />
                    Meu Perfil
                  </button>
                  
                  <button 
                    onClick={() => setIsDropdownOpen(false)} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={18} className="text-gray-400" />
                    Configurações
                  </button>
                  
                  <div className="h-px bg-gray-100 my-1 mx-2"></div>
                  
                  <button 
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowLogoutModal(true);
                    }} 
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} className="text-red-500" />
                    Sair do sistema
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}