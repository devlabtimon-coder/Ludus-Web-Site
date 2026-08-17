import axios from 'axios';


const baseURL = import.meta.env.VITE_API_URL || 'http://110.24.8.226:3000';

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

   
    const isLoginRequest = url.includes('/login') || url.includes('/auth/login');


    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      window.location.href = '/login';
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