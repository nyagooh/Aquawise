import './index.css';
import { ThemeProvider, useTheme } from './context/ThemeContext';
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

const risk = calculateOverallRisk(currentReadings);
const alertCount = recentAlerts.filter(a => a.risk === 'danger' || a.risk === 'warning').length;

function Dashboard() {
  const { theme } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'dark bg-[#0d1117]' : 'bg-[#F5F7FB]'}`}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header alertCount={alertCount} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">

            {/* KPIs */}
            <SummaryStats risk={risk} />

            {/* Sensor readings */}
            <section>
              <div className="flex items-center gap-2.5 mb-3">
                <h2 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Live Sensor Readings</h2>
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-accent bg-accent/8 dark:bg-accent/15 border border-accent/15 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent live-dot" />
                  Updating
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {currentReadings.map(r => <SensorCard key={r.id} reading={r} />)}
              </div>
            </section>

            {/* Chart + Risk Gauge */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2">
                <WaterQualityChart />
              </div>
              <RiskGauge risk={risk} />
            </div>

            {/* Regional AI Predictions */}
            <RegionalPredictions />

            {/* Stations + Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <WaterSourceMap />
              <ParameterRadar />
            </div>

            {/* Alerts */}
            <AlertsTable />

            {/* Footer */}
            <footer className="pb-4 text-center text-[10px] text-gray-300 dark:text-gray-600">
              Uhai WashWise · Water Quality Intelligence Platform · Real sensors: Temperature &amp; Turbidity · Others simulated for demo
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
      <Dashboard />
    </ThemeProvider>
  );
}
