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
  currentUserId?: string; // 👈 Adicionamos isso para identificar quem está logado
  onUpdateCategory: (userId: string, category: ClientCategory) => Promise<void>;
  onRefresh: () => void;
}

export function UsersManagementTable({ users, totalUsers, currentUserId, onUpdateCategory, onRefresh }: UsersManagementTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null); 
  const [detailsUser, setDetailsUser] = useState<User | null>(null);   
  const [loadingBlockId, setLoadingBlockId] = useState<string | null>(null);

  const handleToggleBlock = async (user: User) => {
    // Trava de segurança extra caso o botão apareça por algum bug visual
    if (currentUserId === user.id) {
      toast.error("Você não pode bloquear a si mesmo.");
      return;
    }

    const action = user.isBlocked ? "desbloquear" : "bloquear";
    const confirmed = window.confirm(`Tem certeza que deseja ${action} o usuário ${user.name}?`);
    
    if (!confirmed) return;

    setLoadingBlockId(user.id);
    try {
      await api.patch(`/admin/users/${user.id}/block`, { 
        isBlocked: !user.isBlocked 
      });
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {users.map((user) => {
            const isCurrentUser = currentUserId === user.id; // 👈 Verifica se é o dono da conta
            
            return (
              <div key={user.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${user.isBlocked ? 'bg-red-50 border-red-200' : 'bg-[#F7F8FF] border-transparent hover:border-[#31358B]/10'}`}>
                
                {/* Avatar + Info */}
                <div 
                  className="flex items-center gap-4 cursor-pointer" 
                  onClick={() => setDetailsUser(user)}
                >
                  <Avatar name={user.name} size="md" src={user.avatar || user.picture || user.image} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">{user.name}</p>
                      {isCurrentUser && (
                        <span className="text-[10px] font-bold bg-[#31358B]/10 text-[#31358B] px-2 py-0.5 rounded-full">Você</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="hidden sm:block">
                    <UserCategoryBadge category={user.clientCategory} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Botão de Ver Detalhes */}
                    <button 
                      onClick={() => setDetailsUser(user)}
                      className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-[#31358B] transition-colors"
                      title="Ver detalhes"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {/* Botão de Bloqueio - SÓ APARECE SE NÃO FOR ELE MESMO */}
                    {!isCurrentUser && (
                      <button 
                        onClick={() => handleToggleBlock(user)}
                        disabled={loadingBlockId === user.id}
                        className={`p-2 rounded-lg transition-colors ${user.isBlocked ? 'text-red-600 bg-red-100' : 'text-gray-400 hover:text-red-500'}`}
                        title={user.isBlocked ? "Desbloquear Usuário" : "Bloquear Usuário"}
                      >
                        {loadingBlockId === user.id ? <Loader2 size={18} className="animate-spin" /> : <Ban size={18} />}
                      </button>
                    )}
                    
                    {/* Botão de Alterar Categoria */}
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="bg-white border border-[#31358B] text-[#31358B] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#31358B] hover:text-white transition-colors"
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