import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Textarea } from '../ui/textarea';

export interface ConfirmReasonOptions {
  label: string;
  placeholder?: string;
  // Obrigatório por padrão: o botão de confirmar só libera com texto.
  required?: boolean;
}

export interface ConfirmOptions {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  reason?: ConfirmReasonOptions;
  // Texto mostrado se a ação falhar sem mensagem da API.
  errorMessage?: string;
  // Pode ser assíncrono: o diálogo fica aberto até terminar e, se falhar, mostra o erro e deixa tentar de novo.
  onConfirm: (reason: string) => void | Promise<void>;
}

interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mensagem da API quando houver; erro de rede/HTTP sem corpo usa o texto padrão (o do axios vem em inglês).
export function getErrorMessage(error: any, fallback: string) {
  const apiMessage = error?.response?.data?.error || error?.response?.data?.message;
  if (typeof apiMessage === 'string' && apiMessage) return apiMessage;
  if (error?.isAxiosError) return fallback;
  return error?.message || fallback;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  reason,
  errorMessage = 'Não foi possível concluir a ação. Tente novamente.',
  onConfirm,
}: ConfirmDialogProps) {
  const [reasonText, setReasonText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReasonText('');
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  const reasonRequired = !!reason && reason.required !== false;
  const canConfirm = !submitting && (!reasonRequired || reasonText.trim().length > 0);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(reasonText.trim());
      onOpenChange(false);
    } catch (err: any) {
      setError(getErrorMessage(err, errorMessage));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmClass =
    variant === 'danger'
      ? 'bg-[#E62325] hover:bg-red-700 text-white'
      : 'bg-[#04096E] hover:bg-[#02065A] text-white';

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!submitting) onOpenChange(next);
      }}
    >
      {/* Acima dos modais da tela (alguns usam z-[60] e z-[100]), já que costuma abrir de dentro deles. */}
      <AlertDialogPortal>
        <AlertDialogOverlay className="z-[200]" />
        <AlertDialogPrimitive.Content className="fixed top-[50%] left-[50%] z-[200] grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border bg-white p-6 shadow-lg sm:max-w-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0A1628] font-bold">{title}</AlertDialogTitle>
            {description && (
              <AlertDialogDescription className="text-gray-600">{description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>

          {reason && (
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                {reason.label}
                {reasonRequired && <span className="text-[#E62325]"> *</span>}
              </label>
              <Textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder={reason.placeholder}
                rows={3}
                disabled={submitting}
                className="bg-white min-h-20"
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>{cancelLabel}</AlertDialogCancel>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${confirmClass}`}
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {confirmLabel}
            </button>
          </AlertDialogFooter>
        </AlertDialogPrimitive.Content>
      </AlertDialogPortal>
    </AlertDialog>
  );
}

// Uso: const { requestConfirm, confirmDialog } = useConfirmDialog(); ... requestConfirm({...}); e renderizar {confirmDialog}.
export function useConfirmDialog() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);

  const requestConfirm = useCallback((next: ConfirmOptions) => {
    setOptions(next);
    setOpen(true);
  }, []);

  const confirmDialog = options ? (
    <ConfirmDialog {...options} open={open} onOpenChange={setOpen} />
  ) : null;

  return { requestConfirm, confirmDialog };
}
