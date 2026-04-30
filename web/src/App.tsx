import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingLayout from './pages/landing/LandingLayout';
import LandingHome from './pages/landing/Home';
import LandingAbout from './pages/landing/About';
import LandingContact from './pages/landing/Contact';
import Dashboard from './pages/Dashboard';
import LocationDetail from './pages/LocationDetail';
import Alerts from './pages/Alerts';
import Predictive from './pages/Predictive';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import Account from './pages/Account';
import Historical from './pages/Historical';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <Routes>
      {/* Root redirect → landing home */}
      <Route index element={<Navigate to="/home" replace />} />

      {/* Public landing routes */}
      <Route element={<LandingLayout />}>
        <Route path="/home" element={<LandingHome />} />
        <Route path="/about" element={<LandingAbout />} />
        <Route path="/contact" element={<LandingContact />} />
      </Route>

      {/* Auth pages (publicly accessible) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated app — redirects to /home if not logged in */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/locations/:id" element={<LocationDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/predictive" element={<Predictive />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/historical" element={<Historical />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
