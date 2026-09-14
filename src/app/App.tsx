import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Rotas Privadas (Protegidas) */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/acervo" element={<ProtectedRoute><CollectionPage /></ProtectedRoute>} />
        <Route path="/emprestimos" element={<ProtectedRoute><RentalsPage /></ProtectedRoute>} />
        <Route path="/usuarios" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/cadastro" element={<ProtectedRoute><PendingRegistrationsPage /></ProtectedRoute>} />
        <Route path="/relatorios" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/mecanicas" element={<ProtectedRoute><MechanicsPage /></ProtectedRoute>} />
        <Route path="/temporadas" element={<ProtectedRoute><TemporadasPage /></ProtectedRoute>} />
        <Route path="/ranking" element={<ProtectedRoute><RankingPage /></ProtectedRoute>} />
        <Route path="/auditoria" element={<ProtectedRoute><AdminLogsPage /></ProtectedRoute>} />
        <Route path="/manutencao" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />

       
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}