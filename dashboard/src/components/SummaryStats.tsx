import { Droplets, ShieldCheck, AlertTriangle, BrainCircuit, TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
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
    {
      icon: <Droplets size={20} />,
      value: waterSources.length,
      label: 'Total Stations',
      trend: <span className="flex items-center gap-0.5 text-ok"><TrendingUp size={10} /><span className="text-2xs font-bold">+2</span></span>,
      onClick: () => setActivePage('stations'),
    },
    {
      icon: <ShieldCheck size={20} />,
      value: `${safe}/${waterSources.length}`,
      label: 'Stations Safe',
      trend: <span className="flex items-center gap-0.5 text-ok"><TrendingUp size={10} /><span className="text-2xs font-bold">Stable</span></span>,
      onClick: () => setActivePage('stations'),
    },
    {
      icon: <AlertTriangle size={20} />,
      value: alerts,
      label: 'Active Alerts',
      trend: alerts > 0
        ? <span className="flex items-center gap-0.5 text-warn"><Minus size={10} /><span className="text-2xs font-bold">Monitor</span></span>
        : <span className="text-2xs font-bold text-ok">Clear</span>,
      onClick: () => setActivePage('alerts'),
    },
    {
      icon: <BrainCircuit size={20} />,
      value: `${avgRisk}%`,
      label: 'Avg. Risk',
      trend: <span className="flex items-center gap-0.5 text-ok"><TrendingDown size={10} /><span className="text-2xs font-bold">Falling</span></span>,
      onClick: () => setActivePage('predictions'),
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <button
          key={i}
          onClick={s.onClick}
          className="card px-5 py-5 text-left group hover:shadow-card-hover transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="rounded-xl p-2.5" style={{ background: 'rgba(15,110,140,0.08)' }}>
              <span className="text-primary dark:text-primary-dark">{s.icon}</span>
            </div>
            <div className="flex items-center gap-2">
              {s.trend}
              <ArrowUpRight size={14} className="text-txt-muted dark:text-txt-dark-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-txt dark:text-txt-dark tracking-tight">{s.value}</p>
          <p className="text-sm font-medium text-txt-secondary dark:text-txt-dark-secondary mt-0.5">{s.label}</p>
        </button>
      ))}
    </div>
  );
}
