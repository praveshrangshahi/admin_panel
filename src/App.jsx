import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import VehicleManagement from './pages/VehicleManagement';
import VehicleDetails from './pages/VehicleDetails';
import Clients from './pages/Clients';
import EntryExit from './pages/EntryExit';
import Reports from './pages/Reports';
import YardMap from './pages/YardMap';
import StockAudit from './pages/StockAudit';
import UsersPage from './pages/Users';
import MasterData from './pages/MasterData';
import YardManagement from './pages/YardManagement';
import ContentManagement from './pages/ContentManagement';
import ReportDetail from './pages/ReportDetail';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<Clients />} />
              <Route path="vehicles" element={<VehicleManagement />} />
              <Route path="vehicles/:id" element={<VehicleDetails />} />
              <Route path="entry-exit" element={<EntryExit />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reports/:reportId" element={<ReportDetail />} />
              <Route path="yard-map" element={<YardMap />} />
              <Route path="audit" element={<StockAudit />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="master-data" element={<MasterData />} />
              <Route path="yards" element={<YardManagement />} />
              <Route path="content" element={<ContentManagement />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
