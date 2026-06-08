import { User, Folder, FileText, Check, Upload, ExternalLink, X } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '../shared/Avatar';

interface RegistrationDetailsPanelProps {
  registration: any | null;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onRequestResendDoc?: (id: string, documentName: string) => void;
}

export function RegistrationDetailsPanel({
  registration,
  onApprove,
  onReject,
  onRequestResendDoc,
}: RegistrationDetailsPanelProps) {
  const [reason, setReason] = useState("");
  // Estado para controlar a imagem em tela cheia (Modal)
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (!registration) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 h-full flex items-center justify-center">
        <p className="text-gray-400 text-center font-bold">
          Selecione um cadastro para ver os detalhes
        </p>
      </div>
    );
  }

  // Verifica se o usuário já enviou todos os 4 documentos obrigatórios
  const hasAllDocs = !!(
    registration.documentFrontImage && 
    registration.documentBackImage && 
    registration.addressProof &&
    registration.selfieWithId
  );

  // Função para renderizar o Status corretamente
  const renderStatusBadge = () => {
    if (registration.registrationStatus === 'APPROVED') {
      return (
        <span className="inline-block mt-2 px-4 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full text-xs font-bold uppercase">
          Aprovado
        </span>
      );
    }

    if (registration.registrationStatus === 'REJECTED') {
      return (
        <span className="inline-block mt-2 px-4 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full text-xs font-bold uppercase">
          Rejeitado
        </span>
      );
    }

    // Se o status é PENDING mas faltam documentos
    if (!hasAllDocs) {
      return (
        <span className="inline-block mt-2 px-4 py-1 bg-[#FFF9E6] text-[#9A6B00] border border-[#FBBC04] rounded-full text-xs font-bold uppercase">
          Documentos Pendentes
        </span>
      );
    }

    // Se o status é PENDING e ele já enviou tudo
    return (
      <span className="inline-block mt-2 px-4 py-1 bg-blue-100 text-[#04096E] border border-[#04096E]/30 rounded-full text-xs font-bold uppercase">
        Aguardando Análise
      </span>
    );
  };

  const renderDocument = (title: string, url: string | null) => {
    if (url) {
      return (
        <div key={title} className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="text-[#04096E]" size={40} />
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-900">{title}</p>
              <p className="text-xs text-green-600 font-semibold">Anexado</p>
            </div>
            <Check className="text-green-500" size={24} />
          </div>
          <div className="flex gap-2">
            {/* Em vez de target="_blank", agora abre o Modal */}
            <button 
              onClick={() => setPreviewImage(url)}
              className="flex-1 bg-[#04096E]/10 text-[#04096E] px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#04096E]/20 transition-colors text-center flex justify-center items-center gap-1"
            >
              <ExternalLink size={14} /> Abrir Imagem
            </button>
          </div>
        </div>
      );
    }

    // VISUAL DO DOCUMENTO PENDENTE COM O BOTÃO DE SOLICITAR REENVIO
    return (
      <div key={title} className="bg-[#FFF9E6] border-2 border-dashed border-[#FBBC04] rounded-lg p-4 text-center">
        <Upload className="text-[#B8860B] mx-auto mb-2" size={32} />
        <p className="text-sm font-bold text-[#9A6B00] mb-3">{title} não enviado</p>
        <button 
          onClick={() => onRequestResendDoc && onRequestResendDoc(registration.id, title)}
          className="bg-[#FBBC04] hover:bg-[#E5AA00] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
        >
          Solicitar Reenvio
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col relative z-0">
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Cabeçalho com Avatar Real, CPF e Status Dinâmico */}
          <div className="text-center mb-6">
            <Avatar 
              name={registration.name} 
              src={registration.avatar || registration.picture} 
              color="#04096E" 
              size="lg" 
            />
            <h2 className="text-xl font-bold text-gray-900 mt-3">{registration.name}</h2>
            <p className="text-sm text-gray-500">{registration.email}</p>
            {renderStatusBadge()}
          </div>

          {/* Dados Pessoais */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <User className="text-gray-600" size={20} />
              <h3 className="font-bold text-gray-900">Dados Pessoais</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">CPF:</span>
                <span className="font-medium text-gray-900">{registration.cpf || 'Não informado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telefone:</span>
                <span className="font-medium text-gray-900">{registration.phone || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-gray-600">Endereço:</span>
                <p className="text-xs font-medium text-gray-900 mt-1 leading-relaxed">
                  {registration.address || 'Não informado'}
                </p>
              </div>
            </div>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* Documentos Enviados */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Folder className="text-gray-600" size={20} />
              <h3 className="font-bold text-gray-900">Documentos Anexados</h3>
            </div>
            <div className="space-y-3">
              {renderDocument("1. Selfie c/ Documento", registration.selfieWithId)}
              {renderDocument("2. Frente do RG/CNH", registration.documentFrontImage)}
              {renderDocument("3. Verso do RG/CNH", registration.documentBackImage)}
              {renderDocument("4. Comprovante de Endereço", registration.addressProof)}
            </div>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* Observações */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Motivo (Apenas para rejeição)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo caso rejeite as fotos..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#04096E] focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 pt-4 border-t border-gray-100 shrink-0">
          <button
            onClick={() => onApprove(registration.id)}
            disabled={!hasAllDocs}
            className={`flex-1 font-bold py-3 rounded-lg transition-colors h-11 ${
              hasAllDocs 
                ? 'bg-[#22C55E] hover:bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Aprovar
          </button>
          <button
            onClick={() => {
              if(!reason.trim()) return alert("Preencha o motivo!");
              onReject(registration.id, reason);
              setReason("");
            }}
            className="flex-1 bg-[#E62325] hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors h-11"
          >
            Rejeitar
          </button>
        </div>
      </div>

      {/* MODAL DE IMAGEM AMPLIADA */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
          >
            <X size={28} />
          </button>
          
          <img 
            src={previewImage} 
            alt="Preview do Documento" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl relative z-40"
          />
        </div>
      )}
    </>
  );
}