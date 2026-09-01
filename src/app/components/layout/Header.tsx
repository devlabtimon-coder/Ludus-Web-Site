import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, LogOut, Settings, User, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Avatar } from '../shared/Avatar';
import { LogoutConfirmModal } from '../shared/LogoutConfirmModal';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { api } from '../../../services/api';
import logoFull from '../../../assets/images/logo-full.png';

interface HeaderProps {
  onLogout?: () => void;
  onMenuToggle?: () => void;
  onNavigate?: (page: string) => void;
}

export function Header({ onLogout, onMenuToggle, onNavigate }: HeaderProps) {
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    avatar?: string | null;
    picture?: string | null;
  } | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
    fetchNotifications();
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

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        api.get('/notifications/me?take=10'),
        api.get('/notifications/unread-count')
      ]);
      setNotifications(listRes.data.notifications || []);
      setUnreadCount(countRes.data.count || 0);
    } catch (e) {
      console.error("Erro ao carregar notificações", e);
    }
  };

  const markAsRead = async (id: string, route?: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
      
      if (route && onNavigate) {
        // Remove a barra inicial se existir para o nome da página bater com o App.tsx (ex: "/emprestimos" -> "emprestimos")
        onNavigate(route.replace('/', '')); 
      }
    } catch (e) {
      console.error("Erro ao marcar como lida", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })));
    } catch (e) {
      console.error("Erro ao marcar todas como lidas", e);
    }
  };

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
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-4 relative z-50">
        
        {/* Menu Mobile & Logo */}
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

        {/* Busca */}
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
          
          {/* Menu de Notificações com Radix Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative p-2 hover:bg-gray-50 rounded-full transition-colors outline-none cursor-pointer">
                <Bell className="text-gray-600" size={22} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#E62325] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-in zoom-in">
                    {unreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 rounded-2xl shadow-xl border-gray-100 mr-4 mt-2 bg-white" align="end">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                <span className="font-bold text-[#04096D]">Notificações</span>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer">
                    <CheckCircle2 size={14} /> Marcar lidas
                  </button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm font-medium">Nenhuma notificação recente.</div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id, n.data?.route)}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!n.readAt ? 'bg-blue-50/30' : ''}`}
                      >
                        <p className={`text-sm mb-1 ${!n.readAt ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{n.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{n.body}</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">
                          {new Date(n.createdAt).toLocaleDateString('pt-BR')} às {new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Menu de Perfil Original */}
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
      </header>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}