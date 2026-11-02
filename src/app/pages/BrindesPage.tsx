import { useRef, useState } from 'react';
import { Gift, Search, Loader2, CheckCircle2, AlertTriangle, User, Calendar, Mail, IdCard, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useConfirmDialog } from '../components/shared/ConfirmDialog';
import {
  couponsService,
  couponErrorMessage,
  describeReward,
  formatDeliveredAt,
  normalizeCouponCode,
  validityText,
  COUPON_REWARD_LABEL,
  COUPON_STATUS_CLASS,
  COUPON_STATUS_LABEL,
  type RedeemableCoupon,
} from '../../services/couponsService';

// Balcão da biblioteca: o aluno mostra o código do brinde, o admin confere e dá baixa (uso único).
export function BrindesPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<RedeemableCoupon | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { requestConfirm, confirmDialog } = useConfirmDialog();

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const normalized = normalizeCouponCode(code);
    if (!normalized || loading) return;
    setCode(normalized);
    setLoading(true);
    setError(null);
    setCoupon(null);
    try {
      const found = await couponsService.findByCode(normalized);
      if (!found) setError('Nenhum brinde encontrado com esse código. Confira as letras e os números.');
      else setCoupon(found);
    } catch (err) {
      setError(couponErrorMessage(err, 'Não foi possível buscar o código. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setCoupon(null);
    setError(null);
    inputRef.current?.focus();
  };

  const handleRedeem = (current: RedeemableCoupon) => {
    const studentName = current.student?.name ?? 'o aluno';
    requestConfirm({
      title: 'Dar baixa no brinde?',
      description: (
        <>
          Confirme que <strong>{studentName}</strong> recebeu <strong>{describeReward(current)}</strong>. Depois da
          baixa, o código <strong className="font-mono">{current.code}</strong> não pode ser usado de novo.
        </>
      ),
      confirmLabel: 'Dar baixa',
      variant: 'default',
      errorMessage: 'Não foi possível dar baixa no brinde. Tente novamente.',
      onConfirm: async () => {
        try {
          const updated = await couponsService.redeem(current.code);
          setCoupon({
            ...current,
            ...(updated ?? {}),
            status: 'USADO',
            usedAt: updated?.usedAt ?? new Date().toISOString(),
          });
          toast.success(`Brinde entregue para ${studentName}.`);
        } catch (err: any) {
          // Reflete na tela o que o servidor informou (já usado ou expirado) e mostra o motivo no diálogo.
          const apiCode = err?.response?.data?.code;
          if (apiCode === 'COUPON_ALREADY_USED') setCoupon({ ...current, status: 'USADO' });
          if (apiCode === 'COUPON_EXPIRED') setCoupon({ ...current, status: 'EXPIRADO' });
          throw new Error(couponErrorMessage(err, 'Não foi possível dar baixa no brinde. Tente novamente.'));
        }
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="bg-[#FFF4D1] p-2.5 sm:p-3 rounded-2xl flex-shrink-0">
              <Gift className="text-[#B7860B] w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#04096D]">Brindes</h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1">
                Confira o código que o aluno mostra no app e dê baixa ao entregar o brinde
              </p>
            </div>
          </div>

          <div className="max-w-2xl space-y-5">
            <form
              onSubmit={handleSearch}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5"
            >
              <label htmlFor="coupon-code" className="text-sm font-bold text-[#31358B] block mb-2">
                Código do brinde
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="coupon-code"
                  ref={inputRef}
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex.: NVL3-S2-AB12CD"
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 bg-[#F0F2FF] rounded-xl px-4 py-3 outline-none text-[#04096D] font-mono font-bold tracking-wider placeholder:font-sans placeholder:font-medium placeholder:tracking-normal placeholder:text-gray-400 focus:ring-2 focus:ring-[#31358B]/20"
                />
                <button
                  type="submit"
                  disabled={loading || !normalizeCouponCode(code)}
                  className="inline-flex items-center justify-center gap-2 bg-[#31358B] hover:bg-[#25286b] text-white px-6 py-3 rounded-xl font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  Buscar
                </button>
              </div>
            </form>

            {error && (
              <div role="alert" className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            {coupon && <CouponCard coupon={coupon} onRedeem={handleRedeem} onClear={handleClear} />}
          </div>
        </main>
      </div>

      {confirmDialog}
    </div>
  );
}

function CouponCard({
  coupon,
  onRedeem,
  onClear,
}: {
  coupon: RedeemableCoupon;
  onRedeem: (c: RedeemableCoupon) => void;
  onClear: () => void;
}) {
  const { student } = coupon;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <code className="font-mono text-lg font-black text-[#04096D] tracking-wider">{coupon.code}</code>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${COUPON_STATUS_CLASS[coupon.status]}`}>
          {COUPON_STATUS_LABEL[coupon.status]}
        </span>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
            {COUPON_REWARD_LABEL[coupon.rewardType]}
          </p>
          <p className="text-lg font-bold text-gray-900">{describeReward(coupon)}</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-gray-600">
            {coupon.seasonName && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" /> {coupon.seasonName}
              </span>
            )}
            {coupon.status !== 'USADO' && <span>{validityText(coupon.expiresAt)}</span>}
          </div>
        </div>

        <div className="bg-[#F7F8FF] rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Aluno</p>
          {student ? (
            <>
              <p className="flex items-center gap-2 font-bold text-[#04096D]">
                <User size={15} className="text-[#31358B]" /> {student.name}
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={14} className="text-gray-400" /> {student.email ?? 'E-mail não informado'}
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <IdCard size={14} className="text-gray-400" /> Matrícula: {student.matricula ?? 'não informada'}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Dados do aluno não informados.</p>
          )}
          <p className="text-xs text-gray-500 pt-1">Confira se é o mesmo aluno antes de entregar.</p>
        </div>

        {coupon.status === 'ATIVO' && (
          <button
            type="button"
            onClick={() => onRedeem(coupon)}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#FBBC04] hover:brightness-105 text-[#04096D] h-12 rounded-xl font-bold transition"
          >
            <Gift size={18} /> Dar baixa
          </button>
        )}

        {coupon.status === 'USADO' && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800 font-semibold text-sm">
            <CheckCircle2 size={18} className="text-green-600" />
            {coupon.usedAt ? formatDeliveredAt(coupon.usedAt) : 'Brinde já entregue'}
          </div>
        )}

        {coupon.status === 'EXPIRADO' && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-600 font-semibold text-sm">
            <AlertTriangle size={18} className="text-gray-400" />
            Código expirado: o brinde não pode mais ser entregue.
          </div>
        )}

        {coupon.status !== 'ATIVO' && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#31358B] hover:underline"
          >
            <RotateCcw size={15} /> Buscar outro código
          </button>
        )}
      </div>
    </div>
  );
}
