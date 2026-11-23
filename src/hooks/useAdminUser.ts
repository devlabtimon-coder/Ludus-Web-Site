import { useEffect, useState } from 'react';
import { authService } from '../services/authService';

// Usuário logado no painel, atualizado quando papel ou áreas mudam.
export function useAdminUser() {
  const [user, setUser] = useState(() => authService.getStoredUser());

  useEffect(() => authService.onUserUpdated(() => setUser(authService.getStoredUser())), []);

  return user;
}
