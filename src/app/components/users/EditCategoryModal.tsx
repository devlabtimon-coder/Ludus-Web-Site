import { useState, useEffect } from 'react';
import { X, CheckCircle, User, Users, Trophy, Diamond } from 'lucide-react';
import { ClientCategory } from '../../../types/api';

// Mapeamento visual das categorias (Ícones e Cores do Ludus)
const CATEGORY_META = {
  STARTER: { 
    label: 'Starter', 
    icon: User, 
    colorText: 'text-[#8B7355]', 
    borderColor: 'border-[#8B7355]', 
    bgIcon: 'bg-[#8B7355]/10', 
    bgActive: 'bg-[#8B7355]/5' 
  },
  FAMILY: { 
    label: 'Family', 
    icon: Users, 
    colorText: 'text-[#2E7D32]', 
    borderColor: 'border-[#2E7D32]', 
    bgIcon: 'bg-[#2E7D32]/10', 
    bgActive: 'bg-[#2E7D32]/5' 
  },
  EXPERT: { 
    label: 'Expert', 
    icon: Trophy, 
    colorText: 'text-[#1565C0]', 
    borderColor: 'border-[#1565C0]', 
    bgIcon: 'bg-[#1565C0]/10', 
    bgActive: 'bg-[#1565C0]/5' 
  },
  ULTRAGAMER: { 
    label: 'Ultragamer', 
    icon: Diamond, 
    colorText: 'text-[#6A1B9A]', 
    borderColor: 'border-[#6A1B9A]', 
    bgIcon: 'bg-[#6A1B9A]/10', 
    bgActive: 'bg-[#6A1B9A]/5' 
  },
};

const CATEGORIES: ClientCategory[] = ['STARTER', 'FAMILY', 'EXPERT', 'ULTRAGAMER'];

export function EditCategoryModal({ user, isOpen, onClose, onSave }: any) {
  const [picked, setPicked] = useState<ClientCategory>('STARTER');

  // Garante que ao abrir o modal, a categoria atual do usuário esteja selecionada
  useEffect(() => {
    if (user?.clientCategory) {
      setPicked(user.clientCategory);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4 sm:p-0">
      <div className="bg-white w-full sm:max-w-md rounded-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-black text-[#04096D]">Alterar Categoria</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="text-gray-500" size={24} />
          </button>
        </div>
        
        <p className="text-sm font-semibold text-gray-500 mb-6">
          Usuário: <span className="text-[#04096D]">{user?.name}</span>
        </p>

        {/* Lista de Opções */}
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const IconComponent = meta.icon;
            const isPicked = picked === cat;

            return (
              <button
                key={cat}
                onClick={() => setPicked(cat)}
                className={`w-full flex items-center p-3 rounded-2xl border-2 transition-all duration-200 outline-none ${
                  isPicked 
                    ? `${meta.borderColor} ${meta.bgActive} shadow-sm` 
                    : 'border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                {/* Ícone da Categoria */}
                <div className={`p-3 rounded-xl ${meta.bgIcon} mr-4`}>
                  <IconComponent className={meta.colorText} size={22} />
                </div>

                {/* Nome da Categoria */}
                <span className={`flex-1 text-left font-bold uppercase text-sm tracking-wide ${isPicked ? meta.colorText : 'text-gray-600'}`}>
                  {meta.label}
                </span>

                {/* Check de Seleção */}
                {isPicked && (
                  <div className="pr-2 animate-in zoom-in duration-200">
                    <CheckCircle className={meta.colorText} size={24} strokeWidth={2.5} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Botão de Salvar */}
        <button 
          onClick={() => { onSave(picked); onClose(); }}
          className="w-full mt-8 bg-[#04096D] text-white py-4 rounded-2xl font-black text-[15px] hover:bg-[#070e99] active:scale-[0.98] transition-all shadow-lg shadow-[#04096D]/20"
        >
          Confirmar Categoria
        </button>
      </div>
    </div>
  );
}