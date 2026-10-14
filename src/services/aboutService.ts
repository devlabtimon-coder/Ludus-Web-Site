import { api } from './api';

// Conteúdo da tela "Sobre o Ludus" do app. Espelha o schema de /about no backend.

export const ABOUT_ICONS = [
  'grid', 'search', 'bookmark', 'bell', 'graduation', 'phone', 'trophy', 'chart',
  'users', 'building', 'award', 'database', 'globe', 'mail', 'message', 'shield',
  'book', 'star', 'dice', 'heart',
] as const;
export const ABOUT_COLORS = ['blue', 'yellow', 'red', 'green'] as const;
export const ABOUT_VERSION_STATUS = ['Estável', 'Beta', 'Em desenvolvimento', 'Em manutenção'] as const;
export const ABOUT_INTEGRATION_STATUS = [
  'Ativa', 'Integração prevista', 'Serviço configurável', 'Em manutenção', 'Descontinuada',
] as const;

export type AboutIcon = (typeof ABOUT_ICONS)[number];
export type AboutColor = (typeof ABOUT_COLORS)[number];
export type AboutVersionStatus = (typeof ABOUT_VERSION_STATUS)[number];
export type AboutIntegrationStatus = (typeof ABOUT_INTEGRATION_STATUS)[number];

export interface AboutFeature {
  id: string;
  icon: AboutIcon;
  color: AboutColor;
  title: string;
  description: string;
  visible: boolean;
}

export interface AboutMember {
  id: string;
  name: string;
  role: string;
  visible: boolean;
}

export interface AboutChangelogEntry {
  id: string;
  version: string;
  title: string;
  description: string;
}

export interface AboutIntegration {
  id: string;
  icon: AboutIcon;
  name: string;
  usage: string;
  status: AboutIntegrationStatus;
  visible: boolean;
}

export interface AboutContent {
  identity: { appName: string; subtitle: string; description: string; chips: string[] };
  features: AboutFeature[];
  mission: { visible: boolean; mission: string; vision: string };
  team: { visible: boolean; institution: string; members: AboutMember[]; advisor: string; advisorTitle: string };
  version: { status: AboutVersionStatus; changelog: AboutChangelogEntry[] };
  integrations: AboutIntegration[];
}

export type AboutPayload = AboutContent & { updatedAt: string | null };

// Tira campos extras (como updatedAt) antes de enviar.
function toContent(data: AboutContent): AboutContent {
  const { identity, features, mission, team, version, integrations } = data;
  return { identity, features, mission, team, version, integrations };
}

export const aboutService = {
  getForAdmin: async () => {
    const response = await api.get<AboutPayload>('/about/admin');
    return response.data;
  },

  save: async (content: AboutContent) => {
    const response = await api.put<AboutPayload>('/about', toContent(content));
    return response.data;
  },
};

// Id curto para itens novos (o backend aceita até 40 caracteres).
export const newItemId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
