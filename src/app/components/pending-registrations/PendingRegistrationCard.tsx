import { Check, X, AlertCircle } from 'lucide-react';
import { Avatar } from '../shared/Avatar';

interface PendingRegistrationCardProps {
  user: any;
  isSelected?: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function PendingRegistrationCard({
  user,
  isSelected,
  onSelect,
  onApprove,
  onReject,
}: PendingRegistrationCardProps) {
  
  const getBorderColor = () => {
    if (user.documentFrontImage && user.documentBackImage && user.addressProof) return 'border-l-[#22C55E]';
    return 'border-l-[#FBBC04]'; // Amarelo Ludus para incompletos
  };

  const getDocumentBadge = (url: string | null, label: string) => {
    if (url) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-semibold">
          <Check size={12} /> {label}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-[#FFF9E6] text-[#9A6B00] rounded text-[10px] font-semibold">
        <AlertCircle size={12} /> {label}
      </span>
    );
  };

  return (
    <div
      onClick={onSelect}
      className={`bg-[#F8F9FA] rounded-lg p-4 border-l-4 ${getBorderColor()} cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-[#04096E] bg-white shadow-md' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar e Informações */}
        <Avatar name={user.name} color="#04096E" size="md" />

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{user.name}</h3>
          <p className="text-sm text-gray-600 truncate">{user.email}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-[#04096E] font-semibold">{user.phone || 'Sem telefone'}</span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onApprove(); }}
            className="p-2 bg-[#22C55E] hover:bg-green-600 text-white rounded-lg transition-colors"
            title="Aprovar"
          >
            <Check size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReject(); }}
            className="p-2 bg-[#E62325] hover:bg-red-600 text-white rounded-lg transition-colors"
            title="Rejeitar"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Indicadores de Documentos (Abaixo das infos) */}
      <div className="flex gap-1 mt-3 flex-wrap">
        {getDocumentBadge(user.documentFrontImage, 'RG Frente')}
        {getDocumentBadge(user.documentBackImage, 'RG Verso')}
        {getDocumentBadge(user.addressProof, 'Comp. Endereço')}
      </div>
    </div>
  );
}