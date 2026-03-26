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
import { currentReadings, recentAlerts } from './data/mockData';
import { calculateOverallRisk } from './utils/riskCalculator';

const risk = calculateOverallRisk(currentReadings);
const alertCount = recentAlerts.filter(a => a.risk === 'danger' || a.risk === 'warning').length;

function Dashboard() {
  const { theme } = useTheme();

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-[#0b0f19]' : 'bg-slate-50'}`}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header alertCount={alertCount} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-5 py-5 space-y-5">

            {/* KPIs */}
            <SummaryStats risk={risk} />

            {/* Sensor readings — hero section */}
            <section>
              <div className="flex items-center gap-2.5 mb-3">
                <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Live Sensor Readings</h2>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
                  Updating
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                {currentReadings.map(r => (
                  <SensorCard key={r.id} reading={r} />
                ))}
              </div>
            </section>

            {/* Chart + Risk gauge */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2">
                <WaterQualityChart />
              </div>
              <RiskGauge risk={risk} />
            </div>

            {/* Stations + Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <WaterSourceMap />
              <ParameterRadar />
            </div>

            {/* Alerts */}
            <AlertsTable />

            {/* Footer */}
            <footer className="pb-3 text-center text-[10px] text-slate-300 dark:text-slate-600">
              Uhai WashWise · Water Quality Intelligence · Real sensors: Temperature &amp; Turbidity · Others simulated for demo
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
