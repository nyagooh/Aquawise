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
    {
      label: 'Total Stations',
      value: waterSources.length,
      sub: 'Active monitoring',
      trend: { dir: 'up' as const, text: '+2 this week' },
      onClick: () => setActivePage('stations'),
    },
    {
      label: 'Stations Safe',
      value: `${safe}/${waterSources.length}`,
      sub: 'Within safe range',
      trend: { dir: 'stable' as const, text: 'Stable' },
      onClick: () => setActivePage('stations'),
    },
    {
      label: 'Active Alerts',
      value: alerts,
      sub: 'Require attention',
      trend: { dir: 'stable' as const, text: 'Monitoring' },
      onClick: () => setActivePage('alerts'),
    },
    {
      label: 'Avg. Risk Score',
      value: `${avgRisk}%`,
      sub: 'Across all regions',
      trend: { dir: 'down' as const, text: 'Falling' },
      onClick: () => setActivePage('predictions'),
    },
  ];

  const TrendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus };

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((s, i) => {
        const Icon = TrendIcon[s.trend.dir];
        const trendColor = s.trend.dir === 'down' || s.trend.dir === 'up' ? 'text-ok' : 'text-txt-muted dark:text-txt-dark-muted';
        return (
          <button
            key={i}
            onClick={s.onClick}
            className="card px-6 py-6 text-left group relative"
          >
            <ArrowUpRight size={16} className="absolute top-5 right-5 text-txt-muted dark:text-txt-dark-muted opacity-0 group-hover:opacity-60 transition-opacity" />
            <p className="text-xs font-medium text-txt-muted dark:text-txt-dark-muted mb-1">{s.label}</p>
            <p className="text-3xl font-extrabold text-txt dark:text-txt-dark tracking-tight">{s.value}</p>
            <p className="text-xs text-txt-muted dark:text-txt-dark-muted mt-1">{s.sub}</p>
            <div className={`flex items-center gap-1 mt-3 ${trendColor}`}>
              <Icon size={12} />
              <span className="text-xs font-semibold">{s.trend.text}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
