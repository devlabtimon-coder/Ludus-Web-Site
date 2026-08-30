import { useState, useMemo } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MechanicsTable } from '../components/mechanics/MechanicsTable';
import { Loading } from '../components/shared/Loading';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { useMechanics } from '../../hooks/useMechanics';

import { Plus, BookOpen, Trophy, Gamepad2 } from 'lucide-react';
import { Mechanic } from '../../types/api';
import { MechanicModal } from '../components/mechanics/MechanicModal';
import { toast } from 'sonner';

import { MechanicCard } from '../components/mechanics/MechanicCard';

interface MechanicsPageProps {
  onNavigate: (page: any) => void;
  onLogout?: () => void;
}

export function MechanicsPage({ onNavigate, onLogout }: MechanicsPageProps) {
  const { 
    mechanics, 
    loading, 
    error, 
    refetch, 
    deleteMechanic, 
    createMechanic, 
    updateMechanic 
  } = useMechanics();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState<Mechanic | null>(null);

  const totalMecanicas = mechanics.length;
  const totalAtivas = mechanics.filter(m => m.active).length;
  
  const mostUsed = useMemo(() => {
    if (mechanics.length === 0) return null;
    return [...mechanics].sort((a, b) => (b.games?.length || 0) - (a.games?.length || 0))[0];
  }, [mechanics]);

  const totalJogosUnicos = useMemo(() => {
    const gamesSet = new Set<string>();
    mechanics.forEach(m => {
      if (m.games) {
        m.games.forEach(g => gamesSet.add(g));
      }
    });
    return gamesSet.size;
  }, [mechanics]);
  
  const handleAddClick = () => {
    setEditingMechanic(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (mechanic: Mechanic) => {
    setEditingMechanic(mechanic);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (mechanic: Mechanic) => {
    if (window.confirm(`Tem certeza que deseja excluir a mecânica "${mechanic.namePt}"?\nEla será removida de todos os jogos vinculados.`)) {
      await deleteMechanic(mechanic.id);
    }
  };

  const handleSave = async (id: string | null, data: Partial<Mechanic>) => {
    try {
      if (id) {
        await updateMechanic(id, data);
        toast.success("Mecânica atualizada com sucesso!");
      } else {
        await createMechanic(data);
        toast.success("Nova mecânica cadastrada!");
      }
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      
      <Sidebar 
        activePage="mecanicas" 
        onNavigate={onNavigate} 
        onLogout={onLogout}
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
  
        <Header onLogout={onLogout} onMenuToggle={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#04096D]">Gestão de Mecânicas</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Gerencie o dicionário de mecânicas e tags do aplicativo</p>
            </div>
            
            <button 
              onClick={handleAddClick}
              className="bg-[#04096D] hover:bg-[#070e99] text-white px-5 py-3 rounded-xl font-black text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-[#04096D]/20 whitespace-nowrap"
            >
              <Plus size={18} strokeWidth={3} />
              Nova Mecânica
            </button>
          </div>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <MechanicCard 
              variant="dark" 
              title="Total de Mecânicas" 
              value={totalMecanicas} 
              subtext={`${totalAtivas} ativas no sistema`} 
              icon={<BookOpen size={80} />} 
            />
            
            <MechanicCard 
              variant="yellow" 
              title="Mecânica Mais Usada" 
              value={mostUsed ? (mostUsed.games?.length || 0) : 0} 
              subtext={mostUsed ? mostUsed.namePt : 'Nenhuma'} 
              icon={<Trophy size={80} />} 
            />
            
            <MechanicCard 
              variant="white" 
              title="Jogos Mapeados" 
              value={totalJogosUnicos} 
              subtext="No acervo com mecânicas" 
              icon={<Gamepad2 size={80} />} 
            />
          </div>

          <MechanicsTable 
            mechanics={mechanics} 
            onEditClick={handleEditClick} 
            onDeleteClick={handleDeleteClick} 
          />
        </main>
      </div>

      <MechanicModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mechanic={editingMechanic}
        onSave={handleSave}
      />
    </div>
  );
}