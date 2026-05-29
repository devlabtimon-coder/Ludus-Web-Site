import { EyeOff, Eye, AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface InactivateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  gameName: string;
  activeRentalsCount?: number;
  isActive: boolean;
}

export function InactivateGameModal({ isOpen, onClose, onConfirm, gameName, activeRentalsCount = 0, isActive }: InactivateGameModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isActive && !reason.trim()) {
      setError('Por favor, informe o motivo da inativação');
      return;
    }
    onConfirm(reason);
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[440px] p-6 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-end">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="text-gray-500" size={24} />
          </button>
        </div>

        <div className="px-4 pb-4 text-center">
          <div className="flex justify-center mb-6">
            <div className={`rounded-2xl p-5 ${isActive ? 'bg-[#FBBC04]/10' : 'bg-[#2E7D32]/10'}`}>
              {isActive 
                ? <EyeOff className="text-[#9A6B00]" size={42} strokeWidth={2} /> 
                : <Eye className="text-[#2E7D32]" size={42} strokeWidth={2} />
              }
            </div>
          </div>

          <h2 className={`text-2xl font-black mb-2 ${isActive ? 'text-[#9A6B00]' : 'text-[#2E7D32]'}`}>
            {isActive ? 'Inativar Jogo?' : 'Reativar Jogo?'}
          </h2>
          <p className="text-lg font-bold text-[#04096D] mb-4">"{gameName}"</p>
          <p className="text-gray-600 mb-6 text-sm">
            {isActive
              ? 'O jogo ficará invisível para novos aluguéis, mas o histórico será preservado.'
              : 'O jogo voltará a aparecer no catálogo para os alunos.'}
          </p>

          {isActive && activeRentalsCount > 0 && (
            <div className="bg-[#FBBC04]/10 border border-[#FBBC04]/30 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="text-[#9A6B00] flex-shrink-0" size={20} />
              <p className="text-sm text-[#9A6B00] text-left">
                Este jogo possui <span className="font-black">{activeRentalsCount} aluguéis ativos</span>. Eles não serão afetados pela inativação.
              </p>
            </div>
          )}

          {isActive && (
            <div className="mb-8 text-left">
              <label className="block text-sm font-bold text-[#04096D] mb-2">Motivo da Inativação *</label>
              <textarea
                value={reason}
                onChange={(e) => { setReason(e.target.value); setError(''); }}
                placeholder="Ex: Faltam peças, caixa rasgada..."
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm resize-none transition-all ${
                  error ? 'border-[#E62325] focus:ring-[#E62325]/20' : 'border-gray-200 focus:border-[#04096D] focus:ring-[#04096D]/20'
                }`}
              />
              {error && <p className="text-[#E62325] font-bold text-xs mt-2">{error}</p>}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleConfirm}
              className={`w-full py-4 rounded-xl font-black transition-all text-white active:scale-[0.98] ${
                isActive ? 'bg-[#FBBC04] hover:bg-[#e0a800] text-[#04096D] shadow-lg shadow-[#FBBC04]/20' : 'bg-[#2E7D32] hover:bg-[#256629] shadow-lg shadow-[#2E7D32]/20'
              }`}
            >
              {isActive ? 'Confirmar Inativação' : 'Confirmar Reativação'}
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