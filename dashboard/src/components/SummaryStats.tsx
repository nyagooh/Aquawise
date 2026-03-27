import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
import { waterSources, recentAlerts, regionPredictions } from '../data/mockData';
import { RiskScore } from '../utils/riskCalculator';
import { useNavigation } from '../context/NavigationContext';

interface Props { risk: RiskScore; }

export default function SummaryStats({ risk }: Props) {
  const { setActivePage } = useNavigation();
  const safe = waterSources.filter(s => s.risk === 'safe').length;
  const alerts = recentAlerts.filter(a => a.risk === 'danger' || a.risk === 'warning').length;
  const avgRisk = Math.round(regionPredictions.reduce((s, r) => s + r.contaminationProbability, 0) / regionPredictions.length);

  const stats = [
    { label: 'Total Stations', value: waterSources.length, change: '+2', sub: 'this week', up: true, onClick: () => setActivePage('stations') },
    { label: 'Stations Safe', value: `${safe}/${waterSources.length}`, change: 'Stable', sub: 'no change', up: true, onClick: () => setActivePage('stations') },
    { label: 'Active Alerts', value: alerts, change: alerts > 0 ? 'Monitor' : 'Clear', sub: 'attention', up: false, onClick: () => setActivePage('alerts') },
    { label: 'Avg. Risk Score', value: `${avgRisk}%`, change: 'Falling', sub: 'improving', up: true, onClick: () => setActivePage('predictions') },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((s, i) => (
        <button key={i} onClick={s.onClick} className="card px-6 py-6 text-left group relative">
          <ArrowUpRight size={16} className="absolute top-5 right-5 text-primary/20 dark:text-primary-dark/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-xs font-medium text-txt-muted dark:text-txt-dark-muted uppercase tracking-wide">{s.label}</p>
          <p className="text-3xl font-extrabold text-txt dark:text-txt-dark tracking-tight mt-2">{s.value}<span className="text-lg text-txt-muted dark:text-txt-dark-muted font-normal">.00</span></p>
          <div className="flex items-center gap-1.5 mt-3">
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${s.up ? 'text-primary dark:text-primary-dark' : 'text-txt-muted dark:text-txt-dark-muted'}`}>
              {s.up ? <TrendingUp size={12} /> : <Minus size={12} />}
              {s.change}
            </span>
            <span className="text-xs text-txt-muted dark:text-txt-dark-muted">{s.sub}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
