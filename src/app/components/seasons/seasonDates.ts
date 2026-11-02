// Temporadas valem por dia do calendário de São Paulo, não pelo fuso de quem abre o painel.
export const SEASON_TIME_ZONE = 'America/Sao_Paulo';

// ISO salvo na API → "AAAA-MM-DD" do dia em São Paulo (valor do <input type="date">).
export function toSaoPauloDateInput(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-CA', { timeZone: SEASON_TIME_ZONE });
}

// Data de temporada para exibir em listas, sempre no fuso de São Paulo.
export function formatSeasonDate(iso?: string | null, options: Intl.DateTimeFormatOptions = {}): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR', { timeZone: SEASON_TIME_ZONE, ...options });
}
