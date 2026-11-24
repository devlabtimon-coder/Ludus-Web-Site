import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { DashboardPage } from './pages/DashboardPage';
import { RentalsPage } from './pages/RentalsPage';
import { CollectionPage } from './pages/CollectionPage';
import { UsersPage } from './pages/UsersPage';
import { LoginPage } from './pages/LoginPage';
import { PendingRegistrationsPage } from './pages/PendingRegistrationsPage'; 
import { MechanicsPage } from './pages/MechanicsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ForgotPassword } from './pages/ForgotPassword';
import { TemporadasPage } from './pages/TemporadasPage';
import { RankingPage } from './pages/RankingPage';
import { AdminLogsPage } from './pages/AdminLogsPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { AboutPage } from './pages/AboutPage';
import { BrindesPage } from './pages/BrindesPage';
import { authService, isAdminUser } from '../services/authService';
import { useAdminUser } from '../hooks';
import { PAGE_AREA, canAccessArea } from '../config/adminAreas';

// Só entra quem tem token e usuário salvo com papel ADMIN; qualquer outra sessão é descartada.
// Com `page`, a área dela também precisa estar liberada (senão volta ao Dashboard).
const ProtectedRoute = ({ children, page = 'dashboard' }: { children: React.ReactNode; page?: string }) => {
  const user = useAdminUser();
  if (!authService.hasAdminSession()) {
    authService.logout();
    return <Navigate to="/login" replace />;
  }
  if (!canAccessArea(user, PAGE_AREA[page] ?? null)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Ao abrir o painel, confere papel e áreas na API: quem foi promovido, mudou
// de permissão ou deixou de ser admin vê o painel certo sem novo login.
function SessionSync() {
  useEffect(() => {
    if (!authService.hasAdminSession()) return;
    authService
      .refreshStoredUser()
      .then((user) => {
        if (!isAdminUser(user)) {
          authService.logout();
          window.location.href = '/login';
        }
      })
      .catch(() => undefined);
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" />
      <SessionSync />

      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Rotas Privadas (Protegidas) */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute page="dashboard"><DashboardPage /></ProtectedRoute>} />
        <Route path="/acervo" element={<ProtectedRoute page="acervo"><CollectionPage /></ProtectedRoute>} />
        <Route path="/emprestimos" element={<ProtectedRoute page="emprestimos"><RentalsPage /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute page="usuarios"><UsersPage /></ProtectedRoute>} />
        
        {/* Rota corrigida para a página completa */}
        <Route path="/cadastro" element={<ProtectedRoute page="cadastro"><PendingRegistrationsPage /></ProtectedRoute>} />
        
        <Route path="/relatorios" element={<ProtectedRoute page="relatorios"><ReportsPage /></ProtectedRoute>} />
        <Route path="/mecanicas" element={<ProtectedRoute page="mecanicas"><MechanicsPage /></ProtectedRoute>} />
        <Route path="/temporadas" element={<ProtectedRoute page="temporadas"><TemporadasPage /></ProtectedRoute>} />
        <Route path="/ranking" element={<ProtectedRoute page="ranking"><RankingPage /></ProtectedRoute>} />
        <Route path="/brindes" element={<ProtectedRoute page="brindes"><BrindesPage /></ProtectedRoute>} />
        <Route path="/auditoria" element={<ProtectedRoute page="auditoria"><AdminLogsPage /></ProtectedRoute>} />
        <Route path="/manutencao" element={<ProtectedRoute page="manutencao"><MaintenancePage /></ProtectedRoute>} />
        <Route path="/sobre-app" element={<ProtectedRoute page="sobre-app"><AboutPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}