import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import GISMap from './pages/GISMap';
import Alerts from './pages/Alerts';
import NRW from './pages/NRW';
import Sensors from './pages/Sensors';
import Reports from './pages/Reports';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/gis" element={<GISMap />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/nrw" element={<NRW />} />
      <Route path="/sensors" element={<Sensors />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
