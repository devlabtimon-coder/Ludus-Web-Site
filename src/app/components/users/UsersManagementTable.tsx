import { useState } from 'react';
import { Ban, MoreVertical, Loader2 } from 'lucide-react'; 
import { User, ClientCategory } from '../../../types/api';
import { Avatar } from '../shared/Avatar';
import { UserCategoryBadge } from './UserCategoryBadge';
import { EditCategoryModal } from './EditCategoryModal';
import { UserDetailsModal } from './UserDetailsModal'; 
import { api } from '../../../services/api';
import { toast } from 'sonner';

interface UsersManagementTableProps {
  users: User[];
  totalUsers?: number;
  currentUserId?: string;
  onUpdateCategory: (userId: string, category: ClientCategory) => Promise<void>;
  onRefresh: () => void;
}

export function UsersManagementTable({ users, totalUsers, currentUserId, onUpdateCategory, onRefresh }: UsersManagementTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null); 
  const [detailsUser, setDetailsUser] = useState<User | null>(null);   
  const [loadingBlockId, setLoadingBlockId] = useState<string | null>(null);

  const handleToggleBlock = async (user: User) => {
    if (currentUserId === user.id) {
      toast.error("Você não pode bloquear a si mesmo.");
      return;
    }
    const action = user.isBlocked ? "desbloquear" : "bloquear";
    const confirmed = window.confirm(`Tem certeza que deseja ${action} o usuário ${user.name}?`);
    
    if (!confirmed) return;

    setLoadingBlockId(user.id);
    try {
      await api.patch(`/admin/users/${user.id}/block`, { isBlocked: !user.isBlocked });
      toast.success(user.isBlocked ? "Usuário desbloqueado!" : "Usuário bloqueado!");
      onRefresh();
    } catch (err) {
      toast.error("Erro ao alterar status de bloqueio.");
    } finally {
      setLoadingBlockId(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mt-4 sm:mt-0">
        <div className="space-y-3 sm:space-y-4">
          {users.map((user) => {
            const isCurrentUser = currentUserId === user.id;
            
            return (
              <div key={user.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 sm:gap-0 ${user.isBlocked ? 'bg-red-50 border-red-200' : 'bg-[#F7F8FF] border-transparent hover:border-[#31358B]/10'}`}>
                
                {/* Avatar + Info */}
                <div 
                  className="flex items-center gap-3 sm:gap-4 cursor-pointer w-full sm:w-auto" 
                  onClick={() => setDetailsUser(user)}
                >
                  <Avatar name={user.name} size="md" src={user.avatar || user.picture || user.image} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 truncate">{user.name}</p>
                      {isCurrentUser && (
                        <span className="text-[10px] font-bold bg-[#31358B]/10 text-[#31358B] px-2 py-0.5 rounded-full shrink-0">Você</span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-200 sm:border-transparent">
                  <div className="sm:block">
                    <UserCategoryBadge category={user.clientCategory} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setDetailsUser(user)}
                      className="p-2 sm:hover:bg-white rounded-lg text-gray-400 hover:text-[#31358B] transition-colors bg-white sm:bg-transparent border sm:border-transparent border-gray-200"
                      title="Ver detalhes"
                    >
                      <MoreVertical size={16} />
                    </button>
                    
                    {!isCurrentUser && (
                      <button 
                        onClick={() => handleToggleBlock(user)}
                        disabled={loadingBlockId === user.id}
                        className={`p-2 rounded-lg transition-colors border sm:border-transparent ${user.isBlocked ? 'text-red-600 bg-red-100 border-red-200' : 'text-gray-400 hover:text-red-500 bg-white sm:bg-transparent border-gray-200'}`}
                        title={user.isBlocked ? "Desbloquear Usuário" : "Bloquear Usuário"}
                      >
                        {loadingBlockId === user.id ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
                      </button>
                    )}
                    
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="bg-white border border-[#31358B] text-[#31358B] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#31358B] hover:text-white transition-colors whitespace-nowrap"
                    >
                      Alterar Categoria
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <EditCategoryModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onSave={(cat: ClientCategory) => selectedUser && onUpdateCategory(selectedUser.id, cat)}
      />
      <UserDetailsModal
        user={detailsUser}
        isOpen={!!detailsUser}
        onClose={() => setDetailsUser(null)}
      />
    </>
  );
}