import './index.css';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SummaryStats from './components/SummaryStats';
import SensorCard from './components/SensorCard';
import WaterQualityChart from './components/WaterQualityChart';
import RiskGauge from './components/RiskGauge';
import WaterSourceMap from './components/WaterSourceMap';
import AlertsTable from './components/AlertsTable';
import ParameterRadar from './components/ParameterRadar';
import RegionalPredictions from './components/RegionalPredictions';
import { currentReadings, recentAlerts } from './data/mockData';
import { calculateOverallRisk } from './utils/riskCalculator';
import { useEffect, useRef, useCallback } from 'react';

const risk = calculateOverallRisk(currentReadings);
const alertCount = recentAlerts.filter(a => a.risk === 'danger' || a.risk === 'warning').length;

function Dashboard() {
  const { theme } = useTheme();
  const { registerSection, activePage } = useNavigation();
  const mainRef = useRef<HTMLElement>(null);
  const sensorsRef = useRef<HTMLElement>(null);
  const stationsRef = useRef<HTMLElement>(null);
  const predictionsRef = useRef<HTMLElement>(null);
  const alertsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    registerSection('main', mainRef.current);
    registerSection('sensors', sensorsRef.current);
    registerSection('stations', stationsRef.current);
    registerSection('predictions', predictionsRef.current);
    registerSection('alerts', alertsRef.current);
  }, [registerSection]);

  // Track scroll position to update active nav
  const handleScroll = useCallback(() => {
    if (!mainRef.current) return;
    const scrollTop = mainRef.current.scrollTop;
    const offset = mainRef.current.offsetTop + 80;

    const sections = [
      { page: 'alerts' as const, ref: alertsRef },
      { page: 'predictions' as const, ref: predictionsRef },
      { page: 'stations' as const, ref: stationsRef },
      { page: 'sensors' as const, ref: sensorsRef },
    ];

    for (const s of sections) {
      if (s.ref.current && s.ref.current.offsetTop - offset <= scrollTop) {
        // Don't call setActivePage here to avoid scroll loops — just visual tracking
        return;
      }
    }
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    if (el) el.addEventListener('scroll', handleScroll, { passive: true });
    return () => { if (el) el.removeEventListener('scroll', handleScroll); };
  }, [handleScroll]);

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'dark' : ''}`} style={{ background: theme === 'dark' ? '#0A0F14' : '#F7FAFC' }}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header alertCount={alertCount} />

        <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">

            <SummaryStats risk={risk} />

            {/* Sensors */}
            <section ref={sensorsRef}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xs font-semibold text-txt-muted dark:text-txt-dark-muted uppercase tracking-[0.12em]">Live Sensor Readings</h2>
                  <span className="flex items-center gap-1.5 text-[9px] font-bold text-ok px-2 py-0.5 rounded-md" style={{ background: 'rgba(60,191,122,0.08)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-ok live-dot" />
                    Updating
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {currentReadings.map(r => <SensorCard key={r.id} reading={r} />)}
              </div>
            </section>

            {/* Chart + Risk */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2"><WaterQualityChart /></div>
              <RiskGauge risk={risk} />
            </div>

            {/* AI Predictions */}
            <section ref={predictionsRef}>
              <RegionalPredictions />
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

            <footer className="pb-4 text-center text-2xs text-txt-muted dark:text-txt-dark-muted">
              Uhai WashWise · Water Quality Intelligence · Real sensors: Temperature &amp; Turbidity · Others simulated
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
