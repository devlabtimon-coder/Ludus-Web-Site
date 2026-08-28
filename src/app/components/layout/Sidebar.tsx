import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Gamepad2,
  Users,
  UserPlus,
  FileText,
  ArrowLeftRight,
  LogOut,
  X,
  Tags,
  Trophy,
  Calendar
} from 'lucide-react';
import { Avatar } from '../shared/Avatar';
import { LogoutConfirmModal } from '../shared/LogoutConfirmModal';
import logoFull from '../../../assets/images/logo-full.png';

type PageType =
  | 'dashboard'
  | 'acervo'
  | 'emprestimos'
  | 'usuarios'
  | 'cadastro'
  | 'relatorios'
  | 'mecanicas'
  | 'temporadas'
  | 'ranking'
  | 'login';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  page: PageType;
}

interface SidebarProps {
  activePage?: PageType;
  onNavigate?: (page: PageType) => void;
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  activePage = 'dashboard',
  onNavigate,
  onLogout,
  isOpen,
  onClose
}: SidebarProps) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

  const userName = 'Admin';
  const userEmail = userData?.email || 'admin@ludus.com';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    }
    window.history.pushState({}, '', '/login');
    onNavigate?.('login');
  };

  const handleNavigate = (page: PageType) => {
    onNavigate?.(page);
    onClose?.();
  };

  const menuItems: MenuItem[] = [
    {
      icon: <LayoutDashboard size={19} />,
      label: 'Dashboard',
      active: activePage === 'dashboard',
      page: 'dashboard'
    },
    {
      icon: <Gamepad2 size={19} />,
      label: 'Acervo',
      active: activePage === 'acervo',
      page: 'acervo'
    },
    {
      icon: <Tags size={19} />,
      label: 'Mecânicas',
      active: activePage === 'mecanicas',
      page: 'mecanicas'
    },
    {
      icon: <ArrowLeftRight size={19} />,
      label: 'Empréstimos',
      active: activePage === 'emprestimos',
      page: 'emprestimos'
    },
    {
      icon: <Users size={19} />,
      label: 'Usuários',
      active: activePage === 'usuarios',
      page: 'usuarios'
    },
    {
      icon: <UserPlus size={19} />,
      label: 'Cadastro pendente',
      active: activePage === 'cadastro',
      page: 'cadastro'
    },
    {
      icon: <Trophy size={19} />,
      label: 'Ranking',
      active: activePage === 'ranking',
      page: 'ranking'
    },
    {
      icon: <Calendar size={19} />,
      label: 'Temporadas',
      active: activePage === 'temporadas',
      page: 'temporadas'
    },
    {
      icon: <FileText size={19} />,
      label: 'Relatórios',
      active: activePage === 'relatorios',
      page: 'relatorios'
    }
  ];

  const sidebarContent = (
    <>
      <div className="mb-10">
        <img
          src={logoFull}
          alt="Ludus"
          className="w-[190px] object-contain mx-auto"
        />
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="relative"
            >
              {item.active && (
                <div className="absolute left-0 top-1/2 h-8 w-[4px] -translate-y-1/2 rounded-r-full bg-[#FFC928]" />
              )}
              <button
                onClick={() => handleNavigate(item.page)}
                className={`
                  flex
                  h-[52px]
                  w-full
                  items-center
                  gap-3
                  rounded-2xl
                  px-4
                  transition-all
                  duration-200
                  ${
                    item.active
                      ? 'bg-[#1A1AB3] text-white shadow-md'
                      : 'text-white/70 hover:bg-[#1515A8] hover:text-white'
                  }
                `}
              >
                <div
                  className={`
                    ${
                      item.active
                        ? 'text-[#D7DBFF]'
                        : 'text-white/65'
                    }
                  `}
                >
                  {item.icon}
                </div>
                <span className="text-[15px] font-medium">
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto pt-4">
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                name={userName}
                color="#2563EB"
                size="sm"
                src={userData?.avatar || userData?.picture}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {userName}
                </p>
                <p className="truncate text-xs text-white/55">
                  {userEmail}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                text-red-300
                transition-all
                hover:bg-red-500/10
                hover:text-red-200
              "
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside
        className="
          hidden
          xl:flex
          w-[260px]
          min-w-[260px]
          h-screen
          flex-col
          bg-[#05058C]
          px-5
          py-6
        "
      >
        {sidebarContent}
      </aside>

      <aside
        className="
          hidden
          md:flex
          xl:hidden
          w-[260px]
          min-w-[260px]
          h-screen
          flex-col
          bg-[#05058C]
          px-5
          py-6
        "
      >
        {sidebarContent}
      </aside>

      {isOpen && (
        <>
          <div
            className="
              fixed
              inset-0
              z-40
              bg-black/50
              md:hidden
            "
            onClick={onClose}
          />
          <aside
            className="
              fixed
              left-0
              top-0
              z-50
              flex
              h-screen
              w-[260px]
              flex-col
              bg-[#05058C]
              px-5
              py-6
              shadow-2xl
              md:hidden
            "
          >
            <button
              onClick={onClose}
              className="
                absolute
                right-4
                top-4
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                text-white/70
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}