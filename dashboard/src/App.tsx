import './index.css';
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

export default function App() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Fixed sidebar */}
      <Sidebar />

      {/* Right panel: header + scrollable content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header alertCount={alertCount} />

        <main className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Row 1 — KPI cards */}
          <SummaryStats risk={risk} />

          {/* Row 2 — Trend chart (wider) + Risk gauge */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2">
              <WaterQualityChart />
            </div>
            <RiskGauge risk={risk} />
          </div>

          {/* Row 3 — Sensor readings */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Sensor Readings</h2>
              <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 live-dot" />
                Updating live
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {currentReadings.map(r => (
                <SensorCard key={r.id} reading={r} />
              ))}
            </div>
          </section>

          {/* Row 4 — Map + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <WaterSourceMap />
            <ParameterRadar />
          </div>

          {/* Row 5 — Alerts */}
          <AlertsTable />

          {/* Footer */}
          <footer className="pb-2 text-center text-[10px] text-slate-300">
            Uhai WashWise · Water Quality Intelligence Platform · Real sensors: Temperature &amp; Turbidity · Others simulated
          </footer>

        </main>
      </div>
    </div>
  );
}
