import {
  LayoutDashboard,
  Gamepad2,
  Users,
  UserPlus,
  FileText,
  ArrowLeftRight,
  X,
  Tags,
  Trophy,
  Calendar
} from 'lucide-react';
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
  isOpen,
  onClose
}: SidebarProps) {
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
      <div className="mb-8 sm:mb-10 pt-2">
        <img
          src={logoFull}
          alt="Ludus"
          className="w-[160px] sm:w-[190px] object-contain mx-auto"
        />
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-hide pr-1">
        <ul className="space-y-1.5 sm:space-y-2">
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
                  h-[48px]
                  sm:h-[52px]
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
                <span className="text-[14px] sm:text-[15px] font-medium">
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );

  return (
    <>
      <aside
        className="
          hidden
          md:flex
          w-[260px]
          min-w-[260px]
          h-screen
          sticky
          top-0
          flex-col
          bg-[#05058C]
          px-5
          py-6
          z-30
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
              backdrop-blur-xs
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
              animate-in slide-in-from-left duration-200
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
    </>
  );
}