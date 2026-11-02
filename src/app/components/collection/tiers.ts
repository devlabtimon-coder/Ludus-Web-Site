import { GameTier } from '../../../types/api';

// Categorias do jogo com os rótulos e cores usados no cadastro e na edição.
export const TIERS: { value: GameTier; label: string; color: string }[] = [
  { value: "LATAO", label: "Latão", color: "#8B7355" },
  { value: "BRONZE", label: "Bronze", color: "#CD7F32" },
  { value: "PRATA", label: "Prata", color: "#A0A0A0" },
  { value: "OURO", label: "Ouro", color: "#FFD700" },
  { value: "DIAMANTE", label: "Diamante", color: "#4FC3F7" },
];
