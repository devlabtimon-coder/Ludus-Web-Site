import { useState, useEffect } from 'react';
import { 
  X, ChevronLeft, Heart, Star, Users, Clock, Smile, 
  Shield, Diamond, Info, FileText, Package, PlayCircle, ChevronDown, Loader2
} from 'lucide-react';
import { Game } from '../../../types/api';
import { api } from '../../../services/api';

interface GamePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game | null;
}

const TIER_META: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  LATAO: { label: "Latão", color: "#8B7355", bg: "#F5EFE6", icon: Shield },
  BRONZE: { label: "Bronze", color: "#CD7F32", bg: "#FBF0E6", icon: Shield },
  PRATA: { label: "Prata", color: "#7A7A7A", bg: "#F2F2F2", icon: Shield },
  OURO: { label: "Ouro", color: "#B8860B", bg: "#FFFBE6", icon: Star },
  DIAMANTE: { label: "Diamante", color: "#0277BD", bg: "#E3F2FD", icon: Diamond },
};

export function GamePreviewModal({ isOpen, onClose, game }: GamePreviewModalProps) {
  const [tab, setTab] = useState<'description' | 'components' | 'howtoplay'>('description');
  const [statusExpanded, setStatusExpanded] = useState(false);
  const [componentsList, setComponentsList] = useState<any[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(false);

  const hasHowToPlay = !!((game as any)?.howToPlayUrl && (game as any).howToPlayUrl.trim());

  useEffect(() => {
    if (tab === 'howtoplay' && !hasHowToPlay) {
      setTab('description');
    }
  }, [tab, hasHowToPlay]);

  useEffect(() => {
    if (isOpen && game?.id) {
      const existingComponents = (game as any).components;
      
      if (existingComponents && existingComponents.length > 0) {
        setComponentsList(existingComponents);
      } else {
        setLoadingComponents(true);
        api.get(`/games/${game.id}/components`)
          .then(res => setComponentsList(res.data || []))
          .catch(() => setComponentsList([]))
          .finally(() => setLoadingComponents(false));
      }
    } else {
      setComponentsList([]);
      setTab('description');
      setStatusExpanded(false);
    }
  }, [isOpen, game]);

  if (!isOpen || !game) return null;

  const getHighResImage = (url?: string | null) => {
    if (!url) return null;
    return url.replace("_t.jpg", ".jpg");
  };

  const avgRating = Number((game as any).rating ?? 0);
  const ratingsCount = typeof (game as any).ratingsCount === 'number' ? (game as any).ratingsCount : 0;

  const tierKey = game.tier ? game.tier.toUpperCase() : 'PRATA';
  const tierMeta = TIER_META[tierKey] || TIER_META.PRATA;
  const TierIcon = tierMeta.icon;

  const isAvailable = game.isActive && game.available;
  const statusText = isAvailable ? "Disponível agora" : "Indisponível no momento";
  const statusColor = isAvailable ? "#2E7D32" : "#E62325";
  const statusBg = isAvailable ? "#EAF7EE" : "#FFE9EA";

  const renderPlayers = () => {
    if (!game.minPlayers && !game.maxPlayers) return null;
    let label = "";
    if (game.minPlayers && game.maxPlayers) {
      label = game.minPlayers === game.maxPlayers ? `${game.minPlayers} jog.` : `${game.minPlayers}-${game.maxPlayers} jog.`;
    } else if (game.minPlayers) {
      label = `${game.minPlayers}+ jog.`;
    } else if (game.maxPlayers) {
      label = `Até ${game.maxPlayers} jog.`;
    }
    return (
      <div className="flex items-center gap-2 bg-[#F5F5F7] px-3 h-[38px] rounded-xl">
        <Users size={16} color="#6A6A6A" />
        <span className="text-[12.5px] font-bold text-[#6A6A6A]">{label}</span>
      </div>
    );
  };

  const renderTime = () => {
    const minT = (game as any).minTime;
    const maxT = (game as any).maxTime;
    if (!minT && !maxT) return null;
    let label = "";
    if (minT && maxT) {
      label = minT === maxT ? `${minT} min` : `${minT}-${maxT} min`;
    } else if (minT) {
      label = `${minT} min`;
    } else if (maxT) {
      label = `${maxT} min`;
    }
    return (
      <div className="flex items-center gap-2 bg-[#F5F5F7] px-3 h-[38px] rounded-xl">
        <Clock size={16} color="#6A6A6A" />
        <span className="text-[12.5px] font-bold text-[#6A6A6A]">{label}</span>
      </div>
    );
  };

  const renderAge = () => {
    if (!(game as any).minAge) return null;
    return (
      <div className="flex items-center gap-2 bg-[#F5F5F7] px-3 h-[38px] rounded-xl">
        <Smile size={16} color="#6A6A6A" />
        <span className="text-[12.5px] font-bold text-[#6A6A6A]">{(game as any).minAge}+ anos</span>
      </div>
    );
  };

  const mechanicsList = (game as any).mechanics || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
      >
        <X size={24} />
      </button>

      <div className="relative w-full max-w-[375px] h-[812px] max-h-[90vh] bg-white rounded-[40px] border-[8px] border-black shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="absolute top-0 inset-x-0 h-6 bg-black rounded-b-3xl w-40 mx-auto z-50"></div>

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative bg-white pb-32">
          
          <div className="relative w-full aspect-[3/2.7] bg-gray-200">
            {game.cover ? (
              <img src={getHighResImage(game.cover) || ''} alt={game.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">Sem Capa</div>
            )}
            
            <div className="absolute top-10 left-4 w-[42px] h-[42px] rounded-[14px] bg-[#0A1F5C] flex items-center justify-center shadow-md">
              <ChevronLeft size={22} color="#fff" strokeWidth={3} />
            </div>
            <div className="absolute top-10 right-4 w-[42px] h-[42px] rounded-[14px] bg-[#0A1F5C] flex items-center justify-center shadow-md">
              <Heart size={22} color="#fff" />
            </div>
          </div>

          <div className="relative -mt-8 bg-white rounded-t-[32px] px-5 pt-6 pb-6">
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <Star size={18} className={avgRating >= 1 ? "text-[#FFC107] fill-[#FFC107]" : "text-[#BDBDBD]"} />
                <Star size={18} className={avgRating >= 2 ? "text-[#FFC107] fill-[#FFC107]" : "text-[#BDBDBD]"} />
                <Star size={18} className={avgRating >= 3 ? "text-[#FFC107] fill-[#FFC107]" : "text-[#BDBDBD]"} />
                <Star size={18} className={avgRating >= 4 ? "text-[#FFC107] fill-[#FFC107]" : "text-[#BDBDBD]"} />
                <Star size={18} className={avgRating >= 5 ? "text-[#FFC107] fill-[#FFC107]" : "text-[#BDBDBD]"} />
                <span className="text-[13px] font-extrabold text-[#6A6A6A] ml-1">
                  {avgRating.toFixed(1)} <span className="text-[#8B8EA1]">({ratingsCount})</span>
                </span>
              </div>
              <div className="bg-[#F1F3F7] h-[34px] px-3 rounded-xl flex items-center justify-center">
                <span className="text-[12.5px] font-extrabold text-[#0A1F5C]">Avaliar</span>
              </div>
            </div>

            <h1 className="text-[24px] font-black text-[#444] leading-[30px] mt-2 mb-2">{game.title}</h1>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3" style={{ backgroundColor: tierMeta.bg }}>
              <TierIcon size={14} color={tierMeta.color} />
              <span className="text-xs font-extrabold" style={{ color: tierMeta.color }}>
                Tier {tierMeta.label}
              </span>
            </div>

            <div 
              className="flex items-center justify-between mt-2 cursor-pointer"
              onClick={() => setStatusExpanded(!statusExpanded)}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: statusBg }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }}></div>
                <span className="text-xs font-black" style={{ color: statusColor }}>{statusText}</span>
              </div>
              <ChevronDown size={16} color="#8B8EA1" className={`transition-transform ${statusExpanded ? 'rotate-180' : ''}`} />
            </div>

            {statusExpanded && (
              <div className="mt-3 bg-[#F7F8FF] rounded-2xl p-3 border border-[#31358B]/10">
                <p className="text-xs font-extrabold text-[#8B8EA1]">Prazo de aluguel</p>
                <p className="text-sm font-black text-[#31358B] mt-1">Por agendamento</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-4">
              {renderPlayers()}
              {renderTime()}
              {renderAge()}
            </div>

            {mechanicsList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 mb-1">
                {mechanicsList.map((mech: any, i: number) => (
                  <div key={i} className="bg-[#F0F2FF] border border-[#31358B]/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                    <Info size={13} color="#31358B" />
                    <span className="text-[11px] font-bold text-[#31358B]">
                      {typeof mech === 'string' ? mech : mech.namePt || mech.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-1.5 mt-4">
              <button 
                onClick={() => setTab('description')}
                className={`flex-1 h-[42px] rounded-xl flex items-center justify-center gap-1 transition-colors ${tab === 'description' ? 'bg-[#FBBC04]' : 'bg-[#F2F4F8]'}`}
              >
                <FileText size={16} color={tab === 'description' ? '#fff' : '#7A8194'} />
                <span className={`text-[11px] font-extrabold ${tab === 'description' ? 'text-white' : 'text-[#7A8194]'}`}>Descrição</span>
              </button>
              
              <button 
                onClick={() => setTab('components')}
                className={`flex-1 h-[42px] rounded-xl flex items-center justify-center gap-1 transition-colors ${tab === 'components' ? 'bg-[#0A1F5C]' : 'bg-[#F2F4F8]'}`}
              >
                <Package size={16} color={tab === 'components' ? '#fff' : '#7A8194'} />
                <span className={`text-[11px] font-extrabold ${tab === 'components' ? 'text-white' : 'text-[#7A8194]'}`}>Componentes</span>
              </button>
              
              {hasHowToPlay && (
                <button 
                  onClick={() => setTab('howtoplay')}
                  className={`flex-1 h-[42px] rounded-xl flex items-center justify-center gap-1 transition-colors ${tab === 'howtoplay' ? 'bg-[#E53935]' : 'bg-[#F2F4F8]'}`}
                >
                  <PlayCircle size={16} color={tab === 'howtoplay' ? '#fff' : '#7A8194'} />
                  <span className={`text-[11px] font-extrabold ${tab === 'howtoplay' ? 'text-white' : 'text-[#7A8194]'}`}>Como jogar</span>
                </button>
              )}
            </div>

            <div className="mt-4 px-1">
              {tab === 'description' && (
                <div>
                  <h3 className="text-base font-extrabold text-[#444] mb-2">Descrição</h3>
                  <p className="text-sm text-[#5F5F5F] leading-[21px] text-justify whitespace-pre-line">
                    {game.description || "Sem descrição ainda. Em breve teremos mais detalhes sobre este jogo."}
                  </p>
                </div>
              )}
              {tab === 'components' && (
                <div>
                  <h3 className="text-base font-extrabold text-[#444] mb-2">Componentes</h3>
                  {loadingComponents ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="animate-spin text-[#0A1F5C]" size={28} />
                    </div>
                  ) : componentsList.length > 0 ? (
                    <div className="flex flex-col gap-2 mt-3">
                      {componentsList.map((c: any, idx: number) => (
                        <div key={idx} className="bg-[#F6F6F6] p-3 rounded-[10px] flex justify-between items-center">
                          <span className="text-sm font-semibold text-[#333]">{c.name}</span>
                          <span className="text-sm font-bold text-[#555]">x{c.quantity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#777] font-semibold mt-3">
                      Nenhum componente cadastrado para este jogo.
                    </p>
                  )}
                </div>
              )}
              {tab === 'howtoplay' && hasHowToPlay && (
                <div>
                  <h3 className="text-base font-extrabold text-[#444] mb-2">Como jogar</h3>
                  <div className="w-full h-48 bg-black rounded-xl flex items-center justify-center relative overflow-hidden">
                    <a href={(game as any).howToPlayUrl} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <PlayCircle size={48} color="#fff" className="opacity-80" />
                    </a>
                  </div>
                  <a href={(game as any).howToPlayUrl} target="_blank" rel="noreferrer" className="mt-3 bg-[#F0F2FF] h-12 rounded-xl flex items-center justify-center">
                    <span className="text-[#31358B] font-bold">Abrir no YouTube</span>
                  </a>
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 pb-[34px] pt-2 px-[18px] bg-transparent pointer-events-none">
          <div className="bg-white rounded-[22px] px-[18px] py-[14px] flex flex-row justify-between items-center shadow-[0_4px_25px_rgba(0,0,0,0.15)] pointer-events-auto">
            <div>
              <p className="text-[22px] font-black text-[#2E7D32] leading-none">
                R${(game.price || 0).toFixed(2)} <span className="text-[14px] font-bold text-[#777]">/ dia</span>
              </p>
            </div>
            
            {isAvailable ? (
              <div className="bg-[#0A1F5C] h-[52px] px-[28px] rounded-[18px] flex items-center justify-center cursor-not-allowed">
                <span className="text-white font-black text-base">Alugar</span>
              </div>
            ) : (
              <div className="bg-[#FBBC04] h-[52px] px-[20px] rounded-[18px] flex items-center justify-center gap-2 cursor-not-allowed">
                <div className="relative">
                  <span className="text-[#111] font-black text-sm">Me avise</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}