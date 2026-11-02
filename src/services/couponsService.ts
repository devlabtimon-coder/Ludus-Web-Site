import { api } from './api';

// Cupons de temporada são brindes: o aluno mostra o código na biblioteca e o admin dá baixa aqui (uso único).
// As funções de normalização aceitam o formato antigo de /admin/seasons/coupons (status 'ativo' | 'utilizado' |
// 'expirado', tipo 'Vale-Brinde') e o novo contrato (rewardType BRINDE | PERCENTUAL | FIXO, status ATIVO | USADO | EXPIRADO).

export type CouponStatus = 'ATIVO' | 'USADO' | 'EXPIRADO';
export type CouponRewardType = 'BRINDE' | 'PERCENTUAL' | 'FIXO';

export interface CouponStudent {
  name: string;
  email: string | null;
  matricula: string | null;
}

export interface RedeemableCoupon {
  code: string;
  rewardType: CouponRewardType;
  description: string | null;
  value: number | null;
  status: CouponStatus;
  // null = vale até o fim da próxima temporada.
  expiresAt: string | null;
  usedAt: string | null;
  seasonName: string | null;
  student: CouponStudent | null;
}

export const COUPON_STATUS_LABEL: Record<CouponStatus, string> = {
  ATIVO: 'Ativo',
  USADO: 'Usado',
  EXPIRADO: 'Expirado',
};

export const COUPON_STATUS_CLASS: Record<CouponStatus, string> = {
  ATIVO: 'bg-green-100 text-green-700',
  USADO: 'bg-blue-100 text-[#04096D]',
  EXPIRADO: 'bg-gray-100 text-gray-500',
};

export const COUPON_REWARD_LABEL: Record<CouponRewardType, string> = {
  BRINDE: 'Brinde',
  PERCENTUAL: 'Desconto percentual',
  FIXO: 'Desconto em valor',
};

// Código digitado ou colado: sem espaços nas pontas e em maiúsculas.
export function normalizeCouponCode(raw: string): string {
  return raw.trim().replace(/\s+/g, '').toUpperCase();
}

export function normalizeCouponStatus(raw: unknown, expiresAt?: string | null, usedAt?: string | null): CouponStatus {
  const value = String(raw ?? '').trim().toUpperCase();
  if (value === 'USADO' || value === 'UTILIZADO' || value === 'USED' || value === 'REDEEMED') return 'USADO';
  if (value === 'EXPIRADO' || value === 'EXPIRED') return 'EXPIRADO';
  if (value === 'ATIVO' || value === 'ACTIVE') return 'ATIVO';
  if (usedAt) return 'USADO';
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) return 'EXPIRADO';
  return 'ATIVO';
}

export function normalizeRewardType(raw: unknown): CouponRewardType {
  const value = String(raw ?? '').trim().toUpperCase();
  if (value === 'PERCENTUAL' || value === 'PERCENTAGE') return 'PERCENTUAL';
  if (value === 'FIXO' || value === 'VALOR FIXO' || value === 'FIXED') return 'FIXO';
  // BRINDE, VALE-BRINDE, REWARD_LEVEL_N e qualquer outro: brinde.
  return 'BRINDE';
}

const text = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

// Resposta de GET /admin/coupons/:code: aceita { coupon, student, season } ou tudo no mesmo objeto (ou lista).
export function parseRedeemableCoupon(data: any): RedeemableCoupon | null {
  const raw = Array.isArray(data) ? data[0] : data?.coupon && typeof data.coupon === 'object' ? { ...data, ...data.coupon } : data;
  if (!raw || typeof raw !== 'object' || !text(raw.code ?? raw.codigo)) return null;

  const s = raw.student ?? raw.user ?? raw.aluno ?? null;
  const student: CouponStudent | null = s
    ? {
        name: text(s.name) ?? text(s.nome) ?? 'Aluno sem nome',
        email: text(s.email),
        matricula: text(s.matricula) ?? text(s.registration) ?? text(s.enrollment) ?? text(s.academicId),
      }
    : text(raw.usuario)
      ? { name: raw.usuario, email: null, matricula: null }
      : null;

  const expiresAt = text(raw.expiresAt) ?? text(raw.expiraEm);
  const usedAt = text(raw.usedAt) ?? text(raw.redeemedAt);

  return {
    code: text(raw.code ?? raw.codigo)!,
    rewardType: normalizeRewardType(raw.rewardType ?? raw.type ?? raw.tipo),
    description: text(raw.description) ?? text(raw.descricao),
    value: num(raw.value),
    status: normalizeCouponStatus(raw.status, expiresAt, usedAt),
    expiresAt,
    usedAt,
    seasonName: text(raw.seasonName) ?? text(raw.season?.name) ?? text(raw.temporada),
    student,
  };
}

// Texto da recompensa: descrição cadastrada; descontos antigos sem descrição mostram o valor.
export function describeReward(c: { rewardType: CouponRewardType; description: string | null; value: number | null }): string {
  if (c.description) return c.description;
  if (c.rewardType === 'PERCENTUAL' && c.value != null) return `${c.value}% de desconto`;
  if (c.rewardType === 'FIXO' && c.value != null) return `R$ ${c.value.toFixed(2)} de desconto`;
  return 'Brinde da temporada';
}

// Datas sempre no fuso de São Paulo (o da biblioteca), não no de quem abre o painel.
const TIME_ZONE = 'America/Sao_Paulo';

export function formatDate(iso: string): string {
  // "AAAA-MM-DD" (formato antigo da lista) já é o dia: não converte fuso para não voltar um dia.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (dateOnly) return `${dateOnly[3]}/${dateOnly[2]}/${dateOnly[1]}`;
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: TIME_ZONE, day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: TIME_ZONE, day: '2-digit', month: '2-digit' });
}

export function formatDeliveredAt(iso: string): string {
  const time = new Date(iso).toLocaleTimeString('pt-BR', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit' });
  return `Entregue em ${formatShortDate(iso)} às ${time}`;
}

export function validityText(expiresAt: string | null): string {
  return expiresAt ? `Válido até ${formatDate(expiresAt)}` : 'Válido até o fim da próxima temporada';
}

// Mensagens amigáveis para os erros previstos no contrato da baixa.
export function couponErrorMessage(error: any, fallback: string): string {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;
  if (status === 404) return 'Nenhum brinde encontrado com esse código. Confira as letras e os números.';
  if (code === 'COUPON_ALREADY_USED') return 'Este brinde já foi entregue antes. Não é possível dar baixa de novo.';
  if (code === 'COUPON_EXPIRED') return 'Este código expirou e não pode mais ser trocado pelo brinde.';
  if (!error?.response) return 'Sem conexão com o servidor. Verifique a internet e tente de novo.';
  const apiMessage = error?.response?.data?.error || error?.response?.data?.message;
  return typeof apiMessage === 'string' && apiMessage ? apiMessage : fallback;
}

export const couponsService = {
  async findByCode(code: string): Promise<RedeemableCoupon | null> {
    const res = await api.get(`/admin/coupons/${encodeURIComponent(code)}`);
    return parseRedeemableCoupon(res.data);
  },

  async redeem(code: string): Promise<RedeemableCoupon | null> {
    const res = await api.patch(`/admin/coupons/${encodeURIComponent(code)}/redeem`);
    return parseRedeemableCoupon(res.data);
  },
};
