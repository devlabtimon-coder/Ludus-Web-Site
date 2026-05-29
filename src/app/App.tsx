import { useEffect, useState } from 'react';

import { DashboardPage } from './pages/DashboardPage';
import { RentalsPage } from './pages/RentalsPage';
import { CollectionPage } from './pages/CollectionPage';
import { UsersPage } from './pages/UsersPage';
import { LoginPage } from './pages/LoginPage';

type PageType =
  | 'dashboard'
  | 'acervo'
  | 'emprestimos'
  | 'usuarios'
  | 'cadastro'
  | 'relatorios'
  | 'login';

export default function App() {
  // VERIFICA TOKEN
  const getInitialPage = (): PageType => {
    const token =
      localStorage.getItem('token');

    // SEM TOKEN = LOGIN
    if (!token) {
      return 'login';
    }

    // COM TOKEN = DASHBOARD
    return 'dashboard';
  };

  const [currentPage, setCurrentPage] =
    useState<PageType>(
      getInitialPage()
    );

  // SINCRONIZA URL
  useEffect(() => {
    if (currentPage === 'login') {
      window.history.pushState(
        {},
        '',
        '/login'
      );
    } else {
      window.history.pushState(
        {},
        '',
        '/'
      );
    }
  }, [currentPage]);

  // LOGIN
  const handleLogin = () => {
    setCurrentPage('dashboard');
  };

  // LOGOUT REAL
  const handleLogout = () => {
    // LIMPA AUTH
    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'user'
    );

    sessionStorage.clear();

    // REDIRECIONA
    setCurrentPage('login');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return (
          <LoginPage
            onLogin={handleLogin}
          />
        );

      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
          />
        );

      case 'acervo':
        return (
          <CollectionPage
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
          />
        );

      case 'emprestimos':
        return (
          <RentalsPage
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
          />
        );

      case 'usuarios':
        return (
          <UsersPage
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
          />
        );

      default:
        return (
          <DashboardPage
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
          />
        );
    }
  };

  return renderPage();
}