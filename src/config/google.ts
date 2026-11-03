// ID do cliente OAuth do Google (login de admin). Vem do ambiente; vazio desliga o botão do Google.
export const GOOGLE_CLIENT_ID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? '';
export const GOOGLE_LOGIN_ENABLED = GOOGLE_CLIENT_ID !== '';

if (!GOOGLE_LOGIN_ENABLED) {
  console.error('VITE_GOOGLE_CLIENT_ID não definida: o login com Google fica desligado (veja .env.example).');
}
