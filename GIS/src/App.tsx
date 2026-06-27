import { Routes, Route } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import NetworksHub from './pages/NetworksHub';
import Dashboard from './pages/Dashboard';
import GISMap from './pages/GISMap';
import Alerts from './pages/Alerts';
import Leaks from './pages/Leaks';
import NRW from './pages/NRW';
import Sensors from './pages/Sensors';
import Reports from './pages/Reports';
import Attribute from './pages/Attribute';

function Protected({ element }: { element: React.ReactNode }) {
  return <AuthGuard>{element}</AuthGuard>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/networks" element={<Protected element={<NetworksHub />} />} />
      <Route path="/networks/upload" element={<Protected element={<NetworksHub />} />} />
      <Route path="/dashboard" element={<Protected element={<Dashboard />} />} />
      <Route path="/gis" element={<Protected element={<GISMap />} />} />
      <Route path="/alerts" element={<Protected element={<Alerts />} />} />
      <Route path="/leaks" element={<Protected element={<Leaks />} />} />
      <Route path="/nrw" element={<Protected element={<NRW />} />} />
      <Route path="/sensors" element={<Protected element={<Sensors />} />} />
      <Route path="/reports" element={<Protected element={<Reports />} />} />
      <Route path="/attribute" element={<Protected element={<Attribute />} />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
