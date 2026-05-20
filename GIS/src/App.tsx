import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Landing from './pages/Landing';
import DemoHub from './pages/DemoHub';
import Dashboard from './pages/Dashboard';
import GISMap from './pages/GISMap';
import Alerts from './pages/Alerts';
import NRW from './pages/NRW';
import Sensors from './pages/Sensors';
import Reports from './pages/Reports';

function ProtectedApp() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/demo" element={<DemoHub />} />
      <Route path="/demo/upload" element={<DemoHub />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/gis"       element={<ProtectedRoute><GISMap /></ProtectedRoute>} />
      <Route path="/alerts"    element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
      <Route path="/nrw"       element={<ProtectedRoute><NRW /></ProtectedRoute>} />
      <Route path="/sensors"   element={<ProtectedRoute><Sensors /></ProtectedRoute>} />
      <Route path="/reports"   element={<ProtectedRoute><Reports /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
}
