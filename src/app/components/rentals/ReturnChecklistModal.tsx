import { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Loader2, Package } from 'lucide-react';
import { api } from '../../../services/api';
import { toast } from 'sonner';

interface ReturnChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (applyPenalty: boolean, penaltyReason: string) => void;
  rental: any;
}

export function ReturnChecklistModal({ isOpen, onClose, onConfirm, rental }: ReturnChecklistModalProps) {
  const [components, setComponents] = useState<any[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && rental?.game?.id) {
      setLoading(true);
      api.get(`/games/${rental.game.id}/components`)
        .then(res => {
          const fetchedComps = res.data || [];
          setComponents(fetchedComps);
          
          
          const initialChecks: Record<string, boolean> = {};
          fetchedComps.forEach((c: any) => {
            initialChecks[c.id] = true;
          });
          setCheckedItems(initialChecks);
        })
        .catch(() => toast.error("Não foi possível carregar os componentes do jogo."))
        .finally(() => setLoading(false));
    }
  }, [isOpen, rental]);

  if (!isOpen || !rental) return null;

  const allChecked = components.every(c => checkedItems[c.id] === true);

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSubmit = () => {
    if (!allChecked && !reason.trim()) {
      toast.error("Você marcou que faltam peças. Por favor, justifique nas observações.");
      return;
    }
    
    setIsSubmitting(true);
    
    onConfirm(!allChecked, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#04096D]">Checklist de Devolução</h2>
            <p className="text-sm font-semibold text-gray-500 mt-1 line-clamp-1">{rental.game?.title || rental.gameTitleSnapshot}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="animate-spin text-[#04096D] mb-3" size={32} />
              <p className="text-gray-500 font-semibold">Buscando manual do jogo...</p>
            </div>
          ) : components.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 text-center shadow-sm">
              <Package className="text-gray-400 mx-auto mb-3" size={36} />
              <p className="text-gray-900 font-bold mb-1">Sem componentes detalhados</p>
              <p className="text-sm text-gray-500">Este jogo não possui uma lista de peças cadastrada no sistema. Faça a conferência visual padrão da caixa.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-700 mb-3">Verifique se a caixa contém:</p>
              {components.map((comp) => {
                const isOk = checkedItems[comp.id];
                return (
                  <div 
                    key={comp.id}
                    onClick={() => toggleItem(comp.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${isOk ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isOk ? 'bg-green-500' : 'bg-red-500'}`}>
                        {isOk ? <CheckCircle2 size={14} className="text-white" /> : <X size={14} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={`font-bold text-sm ${isOk ? 'text-green-900' : 'text-red-900'}`}>
                        {comp.name}
                      </span>
                    </div>
                    <span className={`font-black text-sm ${isOk ? 'text-green-700' : 'text-red-700'}`}>
                      x{comp.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          
          {!allChecked && components.length > 0 && (
            <div className="mt-6 animate-in slide-in-from-top-4 duration-300">
              <div className="bg-[#E62325]/10 border border-[#E62325]/20 p-4 rounded-xl mb-4 flex items-start gap-3">
                <AlertTriangle className="text-[#E62325] shrink-0" size={20} />
                <p className="text-sm text-[#E62325] font-semibold leading-relaxed">
                  Atenção: Ao confirmar peças faltando ou danificadas, o usuário <strong>{rental.user?.name}</strong> receberá uma punição automática de <strong>-20 pontos</strong> na temporada.
                </p>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Descreva a avaria (Obrigatório)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Faltando 2 meeples azuis e 1 carta rasgada."
                  rows={3}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#E62325] focus:ring-2 focus:ring-[#E62325]/20 text-sm resize-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 bg-white">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || isSubmitting}
            className={`flex-[2] py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg text-sm ${
              !allChecked ? 'bg-[#E62325] hover:bg-red-700 shadow-red-500/30' : 'bg-[#22C55E] hover:bg-green-600 shadow-green-500/30'
            } disabled:opacity-50`}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {isSubmitting ? 'Processando...' : !allChecked ? 'Confirmar Avaria e Devolver' : 'Devolução Perfeita'}
          </button>
        </div>

      </div>
    </div>
  );
}