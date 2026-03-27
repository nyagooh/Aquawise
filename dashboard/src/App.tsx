import './index.css';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryStats from './components/SummaryStats';
import SensorCard from './components/SensorCard';
import WaterQualityChart from './components/WaterQualityChart';
import WaterSourceMap from './components/WaterSourceMap';
import AlertsTable from './components/AlertsTable';
import ParameterRadar from './components/ParameterRadar';
import RegionalPredictions from './components/RegionalPredictions';
import { currentReadings, recentAlerts, regionPredictions } from './data/mockData';
import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

const alertCount = recentAlerts.filter(a => a.risk === 'danger' || a.risk === 'warning').length;

function Dashboard() {
  const { theme } = useTheme();
  const { registerSection } = useNavigation();
  const mainRef = useRef<HTMLElement>(null);
  const sensorsRef = useRef<HTMLElement>(null);
  const stationsRef = useRef<HTMLElement>(null);
  const predictionsRef = useRef<HTMLElement>(null);
  const alertsRef = useRef<HTMLElement>(null);
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => {
    registerSection('main', mainRef.current);
    registerSection('sensors', sensorsRef.current);
    registerSection('stations', stationsRef.current);
    registerSection('predictions', predictionsRef.current);
    registerSection('alerts', alertsRef.current);
  }, [registerSection]);

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'dark' : ''}`} style={{ background: theme === 'dark' ? '#0A0E16' : '#F0F4FA' }}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header alertCount={alertCount} />

        <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-7">

            {/* Region selector */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-txt-secondary dark:text-txt-dark-secondary">
                <MapPin size={16} className="text-primary dark:text-primary-dark" />
                <span className="text-sm font-medium">Select Region</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedRegion('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedRegion === 'all'
                      ? 'bg-primary dark:bg-primary-dark text-white dark:text-[#0A0E16] shadow-md shadow-primary/20'
                      : 'bg-white dark:bg-surface-dark border border-line dark:border-line-dark text-txt-secondary dark:text-txt-dark-secondary hover:border-primary/20 dark:hover:border-primary-dark/20 hover:text-txt dark:hover:text-txt-dark'
                  }`}
                >
                  All Regions
                </button>
                {regionPredictions.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRegion(r.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedRegion === r.id
                        ? 'bg-primary dark:bg-primary-dark text-white dark:text-[#0A0E16] shadow-md shadow-primary/20'
                        : 'bg-white dark:bg-surface-dark border border-line dark:border-line-dark text-txt-secondary dark:text-txt-dark-secondary hover:border-primary/20 dark:hover:border-primary-dark/20 hover:text-txt dark:hover:text-txt-dark'
                    }`}
                  >
                    {r.region}
                  </button>
                ))}
              </div>
            </div>

            <SummaryStats selectedRegion={selectedRegion} />

            {/* Sensors */}
            <section ref={sensorsRef}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-txt-muted dark:text-txt-dark-muted uppercase tracking-wide">Live Sensor Readings</h2>
                <span className="flex items-center gap-1.5 text-2xs font-bold text-ok px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.08)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-ok live-dot" />
                  Live
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {currentReadings.map(r => <SensorCard key={r.id} reading={r} />)}
              </div>
            </section>

            {/* Chart full width */}
            <WaterQualityChart />

            {/* Predictions */}
            <section ref={predictionsRef}>
              <RegionalPredictions selectedRegion={selectedRegion} />
            </section>

            {/* Stations + Radar */}
            <section ref={stationsRef}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WaterSourceMap />
                <ParameterRadar />
              </div>
            </section>

            <section ref={alertsRef}>
              <AlertsTable />
            </section>

            <footer className="pb-6 text-center text-xs text-txt-muted dark:text-txt-dark-muted">
              Uhai WashWise · Water Quality Intelligence · Kisumu, Kenya
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <Dashboard />
      </NavigationProvider>
    </ThemeProvider>
  );
}
