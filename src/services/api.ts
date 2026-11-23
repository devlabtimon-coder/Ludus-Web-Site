import axios from 'axios';


// Sem endereço fixo de reserva: a URL da API vem só do ambiente (veja .env.example).
const baseURL = import.meta.env.VITE_API_URL || '';
if (!baseURL) {
  console.error('VITE_API_URL não definida: configure a URL da API no .env (veja .env.example).');
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


const NOT_ADMIN_MESSAGE = 'Acesso negado. Apenas administradores.';
export const USER_UPDATED_EVENT = 'ludus:user-updated';

// Busca o perfil (papel e áreas) e atualiza o usuário salvo; o menu e as rotas
// escutam USER_UPDATED_EVENT.
export async function syncStoredUser() {
  const { data } = await api.get('/users/me');
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem('user') || '{}') || {};
  } catch {
    stored = {};
  }
  const user = { ...stored, ...data };
  localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new Event(USER_UPDATED_EVENT));
  return user;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.code;
    const url = (error?.config?.url || '').toString();

    const isVerifyRelated =
      url.includes('/auth/verify-email') ||
      url.includes('/auth/resend-email-code') ||
      url.includes('/auth/verify-phone') ||
      url.includes('/auth/resend-code');

   
    // Erros de login (inclusive com Google) devem aparecer na tela, sem recarregá-la.
    const isLoginRequest = url.includes('/login') || url.includes('/auth/login') || url.includes('/auth/google');


    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      window.location.href = '/login';
    }

    
    // Permissão mudou com o painel aberto: deixou de ser admin (sai) ou perdeu
    // a área (atualiza o usuário salvo para o menu e as rotas acompanharem).
    if (status === 403 && !isLoginRequest && localStorage.getItem('token')) {
      if (error?.response?.data?.error === NOT_ADMIN_MESSAGE) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (code === 'ADMIN_AREA_FORBIDDEN') {
        syncStoredUser().catch(() => undefined);
      }
    }

    if (status === 403 && !isVerifyRelated) {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (code === 'EMAIL_NOT_VERIFIED') {
       
        console.warn('Email não verificado:', user?.email);
      }

      if (code === 'PHONE_NOT_VERIFIED') {
   
        console.warn('Telefone não verificado:', user?.phone);
      }
    }

    return Promise.reject(error);
  }
);

// Mensagem da API quando houver; erro de rede/HTTP sem corpo usa o texto padrão (o do axios vem em inglês).
export function getErrorMessage(error: any, fallback: string): string {
  const apiMessage = error?.response?.data?.error || error?.response?.data?.message;
  if (typeof apiMessage === 'string' && apiMessage) return apiMessage;
  if (error?.isAxiosError) return fallback;
  return error?.message || fallback;
}
