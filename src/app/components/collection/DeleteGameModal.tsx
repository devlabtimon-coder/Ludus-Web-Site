import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  gameName: string;
  activeRentalsCount?: number;
}

export function DeleteGameModal({ isOpen, onClose, onConfirm, gameName, activeRentalsCount = 0 }: DeleteGameModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[420px] p-6 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-end">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="text-gray-500" size={24} />
          </button>
        </div>

        <div className="px-4 pb-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-[#E62325]/10 rounded-2xl p-5">
              <Trash2 className="text-[#E62325]" size={42} strokeWidth={2} />
            </div>
          </div>

          <h2 className="text-2xl font-black text-[#E62325] mb-2">Excluir Jogo?</h2>
          <p className="text-lg font-bold text-[#04096D] mb-4">"{gameName}"</p>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            Esta ação não pode ser desfeita. Todos os exemplares e histórico associados serão removidos permanentemente.
          </p>

          {activeRentalsCount > 0 && (
            <div className="bg-[#FBBC04]/10 border border-[#FBBC04]/30 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="text-[#9A6B00] flex-shrink-0" size={20} />
              <p className="text-sm text-[#9A6B00] text-left">
                <span className="font-bold">Atenção:</span> este jogo possui <span className="font-black">{activeRentalsCount} empréstimos ativos</span>. Finalize-os antes de excluir.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={onConfirm}
              disabled={activeRentalsCount > 0}
              className={`w-full py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${
                activeRentalsCount > 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#E62325] hover:bg-[#c91d20] text-white active:scale-[0.98] shadow-lg shadow-[#E62325]/20'
              }`}
            >
              <Trash2 size={18} strokeWidth={2.5} />
              Confirmar Exclusão
            </button>
            <button
              onClick={onClose}
              className="w-full bg-[#F7F8FF] hover:bg-[#EEF0FF] text-[#04096D] font-black py-4 rounded-xl transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}