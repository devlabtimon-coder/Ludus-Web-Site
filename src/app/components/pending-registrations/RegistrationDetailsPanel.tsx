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
  const [previewFile, setPreviewFile] = useState<{ url: string; isPdf: boolean } | null>(null);
  const isIfmaMode = import.meta.env.VITE_IFMA_MODE === 'true';

  if (!registration) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 h-full flex items-center justify-center min-h-[300px]">
        <p className="text-gray-400 text-center font-bold text-sm sm:text-base">
          Selecione um cadastro para ver os detalhes
        </p>
      </div>
    );
  }

  const hasAllDocs = isIfmaMode
    ? !!(
        registration.enrollmentProof &&
        registration.documentFrontImage &&
        registration.documentBackImage
      )
    : !!(
        registration.documentFrontImage &&
        registration.documentBackImage &&
        registration.addressProof &&
        registration.selfieWithId
      );

  const renderStatusBadge = () => {
    if (registration.registrationStatus === 'APPROVED') {
      return (
        <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 border border-green-300 rounded-full text-xs font-bold uppercase">
          Aprovado
        </span>
      );
    }
    if (registration.registrationStatus === 'REJECTED') {
      return (
        <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 border border-red-300 rounded-full text-xs font-bold uppercase">
          Rejeitado
        </span>
      );
    }
    if (!hasAllDocs) {
      return (
        <span className="inline-block mt-2 px-3 py-1 bg-[#FFF9E6] text-[#9A6B00] border border-[#FBBC04] rounded-full text-xs font-bold uppercase">
          Documentos Pendentes
        </span>
      );
    }
    return (
      <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-[#04096E] border border-[#04096E]/30 rounded-full text-xs font-bold uppercase">
        Aguardando Análise
      </span>
    );
  };

  const renderDocument = (title: string, url: string | null) => {
    if (url) {
      const isActuallyPdf = url.toLowerCase().includes('.pdf');
      return (
        <div key={title} className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="text-[#04096E] shrink-0" size={32} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs sm:text-sm text-gray-900 truncate">{title}</p>
              <p className="text-[11px] text-green-600 font-semibold">Anexado</p>
            </div>
            <Check className="text-green-500 shrink-0" size={20} />
          </div>
          <button
            onClick={() => setPreviewFile({ url, isPdf: isActuallyPdf })}
            className="w-full bg-[#04096E]/10 text-[#04096E] px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#04096E]/20 transition-colors text-center flex justify-center items-center gap-1.5"
          >
            <ExternalLink size={14} /> Abrir Arquivo
          </button>
        </div>
      );
    }

    return (
      <div key={title} className="bg-[#FFF9E6] border-2 border-dashed border-[#FBBC04] rounded-xl p-3 sm:p-4 text-center">
        <Upload className="text-[#B8860B] mx-auto mb-2" size={24} />
        <p className="text-xs sm:text-sm font-bold text-[#9A6B00] mb-2">{title} não enviado</p>
        <button
          onClick={() => onRequestResendDoc && onRequestResendDoc(registration.id, title)}
          className="bg-[#FBBC04] hover:bg-[#E5AA00] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
        >
          Solicitar Reenvio
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 h-full flex flex-col relative z-0">
        <div className="flex-1 overflow-y-auto pr-1 sm:pr-2">
          

          <div className="text-center mb-6">
            <Avatar 
              name={registration.name} 
              src={registration.avatar || registration.picture} 
              color="#04096E" 
              size="lg" 
            />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-3 truncate px-2">{registration.name}</h2>
            <p className="text-xs sm:text-sm text-gray-500 truncate px-2">{registration.email}</p>
            {renderStatusBadge()}
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <User className="text-gray-600" size={18} />
              <h3 className="font-bold text-sm sm:text-base text-gray-900">Dados Pessoais</h3>
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              {isIfmaMode && registration.matricula && (
                <div className="flex justify-between gap-2">
                  <span className="text-gray-600">Matrícula:</span>
                  <span className="font-bold text-[#04096E]">{registration.matricula}</span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span className="text-gray-600">CPF:</span>
                <span className="font-medium text-gray-900">{registration.cpf || 'Não informado'}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-gray-600">Telefone:</span>
                <span className="font-medium text-gray-900">{registration.phone || 'Não informado'}</span>
              </div>
              {!isIfmaMode && (
                <div>
                  <span className="text-gray-600">Endereço:</span>
                  <p className="text-xs font-medium text-gray-900 mt-1 leading-relaxed">
                    {registration.address || 'Não informado'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-100 mb-6" />

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Folder className="text-gray-600" size={18} />
              <h3 className="font-bold text-sm sm:text-base text-gray-900">Documentos Anexados</h3>
            </div>
            <div className="space-y-3">
              {isIfmaMode ? (
                <>
                  {renderDocument("1. Comprovante SUAP", registration.enrollmentProof)}
                  {renderDocument("2. Frente do RG/CNH", registration.documentFrontImage)}
                  {renderDocument("3. Verso do RG/CNH", registration.documentBackImage)}
                </>
              ) : (
                <>
                  {renderDocument("1. Selfie c/ Documento", registration.selfieWithId)}
                  {renderDocument("2. Frente do RG/CNH", registration.documentFrontImage)}
                  {renderDocument("3. Verso do RG/CNH", registration.documentBackImage)}
                  {renderDocument("4. Comprovante de Endereço", registration.addressProof)}
                </>
              )}
            </div>
          </div>

          <hr className="border-gray-100 mb-6" />

          <div className="mb-4">
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              Motivo (Apenas para rejeição)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo caso rejeite os documentos..."
              className="w-full border border-gray-300 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#04096E] focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>

  
        <div className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-gray-100 shrink-0">
          <button
            onClick={() => onApprove(registration.id)}
            disabled={!hasAllDocs}
            className={`w-full sm:flex-1 font-bold py-3 rounded-xl transition-colors text-xs sm:text-sm h-11 flex items-center justify-center ${
              hasAllDocs
                ? 'bg-[#22C55E] hover:bg-green-600 text-white shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Aprovar
          </button>
          <button
            onClick={() => {
              if(!reason.trim()) return alert("Preencha o motivo para rejeitar!");
              onReject(registration.id, reason);
              setReason("");
            }}
            className="w-full sm:flex-1 bg-[#E62325] hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors text-xs sm:text-sm h-11 flex items-center justify-center shadow-sm"
          >
            Rejeitar
          </button>
        </div>
      </div>

      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <button
            onClick={() => setPreviewFile(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
          >
            <X size={24} />
          </button>
          
          {previewFile.isPdf ? (
            <div className="w-full max-w-4xl h-[85vh] bg-white rounded-2xl relative z-40 flex flex-col overflow-hidden shadow-2xl">
              <div className="bg-gray-100 p-3 flex justify-between items-center border-b border-gray-200">
                <span className="font-bold text-[#04096E] text-xs sm:text-sm flex items-center gap-2">
                  <FileText size={18} /> Visualizador de PDF
                </span>
                <a 
                  href={previewFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white bg-[#04096E] px-3 py-1.5 rounded-lg hover:bg-blue-900 text-xs font-bold flex items-center gap-1 transition"
                >
                  <ExternalLink size={14} /> Abrir em nova aba
                </a>
              </div>
              <iframe 
                src={`https://docs.google.com/gview?url=${encodeURIComponent(previewFile.url)}&embedded=true`}
                className="w-full flex-1"
                title="PDF Viewer"
              />
            </div>
          ) : (
            <img
              src={previewFile.url}
              alt="Preview do Documento"
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl relative z-40"
            />
          )}
        </div>
      )}
    </>
  );
}