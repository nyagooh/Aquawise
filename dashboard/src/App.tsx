import './index.css';
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
    <div className="min-h-screen bg-slate-50">
      <Header alertCount={alertCount} />

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Summary KPIs */}
        <SummaryStats risk={risk} />

        {/* Row 2: Sensor cards grid */}
        <section>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Live Sensor Readings</h2>
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 live-dot" />
              Updating live
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentReadings.map(r => (
              <SensorCard key={r.id} reading={r} />
            ))}
          </div>
        </section>

        {/* Row 3: Chart full width */}
        <WaterQualityChart />

        {/* Row 4: Risk gauge + Map + Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <RiskGauge risk={risk} />
          <WaterSourceMap />
          <ParameterRadar />
        </div>

        {/* Row 5: Alerts table */}
        <AlertsTable />

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-100">
          <span className="font-semibold text-slate-500">Uhai WashWise</span> — Water Quality Intelligence Platform
          &nbsp;·&nbsp; Data updates every 60 seconds &nbsp;·&nbsp;
          Real sensors: Temperature &amp; Turbidity &nbsp;·&nbsp; All others simulated for demo
        </footer>
      </main>
    </div>
  );
}
