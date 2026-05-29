import { X, Mail, Phone, Trophy, Gamepad2, Star, Calendar } from 'lucide-react';
import { User } from '../../../types/api';
import { Avatar } from '../shared/Avatar';
import { UserCategoryBadge } from './UserCategoryBadge';

interface UserDetailsModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4 sm:p-0">
      <div className="bg-white w-full sm:max-w-md rounded-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4 items-center">
            <Avatar name={user.name} size="lg" src={user.avatar || user.picture || user.image} />
            <div>
              <h3 className="text-xl font-black text-[#04096D] leading-tight">{user.name}</h3>
              <UserCategoryBadge category={user.clientCategory} />
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="text-gray-500" size={20} />
          </button>
        </div>

        {/* Informações de Contato */}
        <div className="space-y-3 mb-6 bg-[#F7F8FF] p-4 rounded-2xl border border-transparent">
          <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
            <Mail size={16} className="text-[#31358B]" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
              <Phone size={16} className="text-[#31358B]" />
              <span>{user.phone}</span>
            </div>
          )}
          {user.createdAt && (
            <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
              <Calendar size={16} className="text-[#31358B]" />
              <span>Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>

        {/* Grid de Estatísticas (Se os campos existirem na sua API) */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 bg-[#FBBC04]/10 rounded-lg text-[#FBBC04]">
              <Star size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold">Nível</p>
              <p className="text-sm font-black text-gray-900">{user.level || 1}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 bg-[#E62325]/10 rounded-lg text-[#E62325]">
              <Trophy size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold">Pontos</p>
              <p className="text-sm font-black text-gray-900">{user.points || 0}</p>
            </div>
          </div>
        </div>

        {/* Status da Conta */}
        <div className={`p-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm ${user.isBlocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          <div className={`w-2 h-2 rounded-full ${user.isBlocked ? 'bg-red-500' : 'bg-green-500'}`} />
          {user.isBlocked ? 'Conta Bloqueada' : 'Conta Ativa'}
        </div>

      </div>
    </div>
  );
}