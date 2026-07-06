import { Check, X, AlertCircle, MapPin, IdCard } from 'lucide-react';
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
  const isIfmaMode = import.meta.env.VITE_IFMA_MODE === 'true';

  const getBorderColor = () => {
    const hasAllDocs = isIfmaMode
      ? user.enrollmentProof && user.documentFrontImage && user.documentBackImage
      : user.documentFrontImage && user.documentBackImage && user.addressProof && user.selfieWithId;

    if (hasAllDocs) {
        return 'border-l-[#22C55E]';
    }
    return 'border-l-[#FBBC04]'; // Amarelo Ludus para incompletos
  };

  const getDocumentBadge = (url: string | null, label: string) => {
    if (url) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-semibold shrink-0">
          <Check size={12} /> {label}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 bg-[#FFF9E6] text-[#9A6B00] rounded text-[10px] font-semibold shrink-0">
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
        <Avatar
           name={user.name}
           src={user.avatar || user.picture}
           color="#04096E"
           size="md"
         />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{user.name}</h3>
          <p className="text-sm text-gray-600 truncate">
            {isIfmaMode && user.matricula ? `Matrícula: ${user.matricula}` : user.email}
          </p>
          
          <div className="flex flex-col gap-1.5 mt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#04096E] font-semibold">
                {user.phone || 'Sem telefone'}
              </span>
              
              {user.cpf && (
                <span className="flex items-center gap-1 text-xs text-gray-600 font-medium border-l border-gray-300 pl-3">
                  <IdCard size={12} className="text-gray-400" />
                  {user.cpf}
                </span>
              )}
            </div>
            {!isIfmaMode && user.address && (
              <div
                 className="flex items-center gap-1.5 text-xs text-gray-500 truncate"
                 title={user.address}
              >
                <MapPin size={12} className="shrink-0 text-gray-400" />
                <span className="truncate">{user.address}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Ações rápidas */}
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

      {/* Indicadores de Documentos */}
      <div className="flex gap-1.5 mt-4 pt-3 border-t border-gray-200 overflow-x-auto pb-1 scrollbar-hide">
        {isIfmaMode ? (
          <>
            {getDocumentBadge(user.enrollmentProof, 'SUAP')}
            {getDocumentBadge(user.documentFrontImage, 'RG Frente')}
            {getDocumentBadge(user.documentBackImage, 'RG Verso')}
          </>
        ) : (
          <>
            {getDocumentBadge(user.selfieWithId, 'Selfie')}
            {getDocumentBadge(user.documentFrontImage, 'RG Frente')}
            {getDocumentBadge(user.documentBackImage, 'RG Verso')}
            {getDocumentBadge(user.addressProof, 'Endereço')}
          </>
        )}
      </div>
    </div>
  );
}