import { useState, useEffect } from 'react';
import { X, Loader2, Save, Tags } from 'lucide-react';
import { Mechanic } from '../../../types/api';

interface MechanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string | null, data: Partial<Mechanic>) => Promise<void>;
  mechanic: Mechanic | null;
}

export function MechanicModal({ isOpen, onClose, onSave, mechanic }: MechanicModalProps) {
  const [namePt, setNamePt] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState('');
  const [definition, setDefinition] = useState('');
  const [icon, setIcon] = useState('settings');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mechanic) {
      setNamePt(mechanic.namePt || '');
      setNameEn(mechanic.nameEn || '');
      setCategory(mechanic.category || '');
      setDefinition(mechanic.definition || '');
      setIcon(mechanic.icon || 'settings');
      setActive(mechanic.active !== false);
    } else {
      setNamePt('');
      setNameEn('');
      setCategory('');
      setDefinition('');
      setIcon('settings');
      setActive(true);
    }
    setError('');
  }, [mechanic, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namePt.trim() || !category.trim()) {
      setError('Nome em Português e Categoria são obrigatórios.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSave(mechanic ? mechanic.id : null, {
        namePt,
        nameEn,
        category,
        definition,
        icon,
        active,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar mecânica.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-t-[24px] sm:rounded-[24px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex bg-[#F0F2FF] p-2.5 rounded-xl text-[#31358B]">
              <Tags size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#31358B]">
                {mechanic ? 'Editar Mecânica' : 'Nova Mecânica'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {mechanic ? 'Atualize as informações no dicionário' : 'Adicione uma nova mecânica'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <form id="mechanic-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-[#31358B]">Nome (Português) *</label>
                <input 
                  type="text" 
                  value={namePt} 
                  onChange={(e) => setNamePt(e.target.value)} 
                  placeholder="Ex: Alocação de Trabalhadores"
                  className="w-full bg-[#F0F2FF] border border-transparent focus:border-[#31358B]/30 rounded-xl px-4 py-3 outline-none text-[#222] font-semibold text-sm transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-[#31358B]">Nome (Inglês)</label>
                <input 
                  type="text" 
                  value={nameEn} 
                  onChange={(e) => setNameEn(e.target.value)} 
                  placeholder="Ex: Worker Placement"
                  className="w-full bg-[#F0F2FF] border border-transparent focus:border-[#31358B]/30 rounded-xl px-4 py-3 outline-none text-[#222] font-semibold text-sm transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-[#31358B]">Categoria *</label>
                <input 
                  type="text" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  placeholder="Ex: Mecânica Principal"
                  className="w-full bg-[#F0F2FF] border border-transparent focus:border-[#31358B]/30 rounded-xl px-4 py-3 outline-none text-[#222] font-semibold text-sm transition-all"
                />
              </div>
              <div className="bg-[#F7F8FF] p-3.5 rounded-xl flex items-center justify-between border border-[#31358B]/10">
                <span className="font-bold text-[#31358B] text-sm">Status Ativo</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={active} onChange={e => setActive(e.target.checked)} />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-[#31358B]">Definição</label>
              <textarea 
                value={definition} 
                onChange={(e) => setDefinition(e.target.value)} 
                rows={4}
                placeholder="Explique como essa mecânica funciona..."
                className="w-full bg-[#F0F2FF] border border-transparent focus:border-[#31358B]/30 rounded-xl px-4 py-3 outline-none text-[#222] font-medium text-sm resize-none transition-all"
              />
            </div>
          </form>
        </div>
        
        <div className="p-4 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 bg-gray-50">
          <button 
            type="button" 
            onClick={onClose} 
            className="w-full sm:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3.5 rounded-xl transition text-sm"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="mechanic-form" 
            disabled={loading} 
            className="w-full sm:flex-[2] flex items-center justify-center gap-2 bg-[#31358B] hover:bg-[#25286b] text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-[#31358B]/20 disabled:opacity-60 text-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? 'Salvando...' : 'Salvar Mecânica'}
          </button>
        </div>
      </div>
    </div>
  );
}