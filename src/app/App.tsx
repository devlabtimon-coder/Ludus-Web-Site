import { useEffect, useState } from 'react';

import { DashboardPage } from './pages/DashboardPage';
import { RentalsPage } from './pages/RentalsPage';
import { CollectionPage } from './pages/CollectionPage';
import { UsersPage } from './pages/UsersPage';
import { LoginPage } from './pages/LoginPage';
import { PendingRegistrationsPage } from './pages/PendingRegistrationsPage';
import { MechanicsPage } from './pages/MechanicsPage';
import { ReportsPage } from './pages/ReportsPage'; 
import { ForgotPassword } from './pages/ForgotPassword';

import { RankingPage } from './pages/RankingPage';

type PageType =
  | 'dashboard'
  | 'acervo'
  | 'emprestimos'
  | 'usuarios'
  | 'cadastro'
  | 'relatorios'
  | 'mecanicas'
  | 'temporadas'
  | 'ranking'
  | 'login'
  | 'forgot-password';

export default function App() {
  const getInitialPage = (): PageType => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      if (window.location.pathname === '/forgot-password') {
        return 'forgot-password';
      }
      return 'login';
    }
   
    return 'dashboard';
  };

  const [currentPage, setCurrentPage] = useState<PageType>(getInitialPage());
  
  useEffect(() => {
    if (currentPage === 'login') {
      window.history.pushState({}, '', '/login');
    } else if (currentPage === 'forgot-password') {
      window.history.pushState({}, '', '/forgot-password');
    } else {
      window.history.pushState({}, '', '/');
    }
  }, [currentPage]);
  
  const handleLogin = () => {
    setCurrentPage('dashboard');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    setCurrentPage('login');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onLogin={handleLogin} onForgotPassword={() => setCurrentPage('forgot-password')} />;
      case 'forgot-password':
        return <ForgotPassword onBack={() => setCurrentPage('login')} />;
      case 'dashboard':
        return <DashboardPage onNavigate={(page: any) => setCurrentPage(page)} onLogout={handleLogout} />;
      case 'acervo':
        return <CollectionPage onNavigate={(page: any) => setCurrentPage(page)} onLogout={handleLogout} />;
      case 'emprestimos':
        return <RentalsPage onNavigate={(page: any) => setCurrentPage(page)} onLogout={handleLogout} />;
      case 'usuarios':
        return <UsersPage onNavigate={(page: any) => setCurrentPage(page)} onLogout={handleLogout} />;
      case 'cadastro':
        return <PendingRegistrationsPage onNavigate={(page: any) => setCurrentPage(page)} onLogout={handleLogout} />;
      case 'relatorios':
        return <ReportsPage onNavigate={(page: any) => setCurrentPage(page)} onLogout={handleLogout} />;
      case 'mecanicas':
        return <MechanicsPage onNavigate={(page: any) => setCurrentPage(page)} onLogout={handleLogout} />;
  
      case 'ranking':
        return <RankingPage onNavigate={(page: any) => setCurrentPage(page)} onLogout={handleLogout} />;
      default:
        return <DashboardPage onNavigate={(page: any) => setCurrentPage(page)} onLogout={handleLogout} />;
    }
  };

  return renderPage();
}