import axios from 'axios';

// Configuração da baseURL - será localhost inicialmente
const baseURL = import.meta.env.VITE_API_URL || 'http://110.24.8.226:3000';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição para adicionar token
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

// Interceptor de resposta para tratamento de erros
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

    // 👉 NOVA VERIFICAÇÃO AQUI: Identifica se a requisição foi para a rota de login
    const isLoginRequest = url.includes('/login') || url.includes('/auth/login');

    // Tratamento de erro 401 - Não autorizado
    // 👉 AGORA ELE SÓ RECARREGA A PÁGINA SE NÃO FOR UM ERRO DE LOGIN
    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirecionar para login
      window.location.href = '/login';
    }

    // Tratamento de erro 403 - Verificação pendente
    if (status === 403 && !isVerifyRelated) {
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (code === 'EMAIL_NOT_VERIFIED') {
        // Redirecionar para verificação de email
        console.warn('Email não verificado:', user?.email);
      }

      if (code === 'PHONE_NOT_VERIFIED') {
        // Redirecionar para verificação de telefone
        console.warn('Telefone não verificado:', user?.phone);
      }
    }

    return Promise.reject(error);
  }
);