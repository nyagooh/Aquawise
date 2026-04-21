import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import HistoricalPage from './pages/HistoricalPage';
import PredictivePage from './pages/PredictivePage';
import AlertsPage from './pages/AlertsPage';
import LocationDetailPage from './pages/LocationDetailPage';
import AccountPage from './pages/AccountPage';
import SettingsPage from './pages/SettingsPage';
import SitemapPage from './pages/SitemapPage';
import StyleGuidePage from './pages/StyleGuidePage';
import StatisticsPage from './pages/StatisticsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/historical" element={<HistoricalPage />} />
          <Route path="/predictive" element={<PredictivePage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/locations" element={<LocationDetailPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/sitemap" element={<SitemapPage />} />
          <Route path="/style-guide" element={<StyleGuidePage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
