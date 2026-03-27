import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
import { waterSources, recentAlerts, regionPredictions } from '../data/mockData';
import { useNavigation } from '../context/NavigationContext';

interface Props { selectedRegion: string; }

export default function SummaryStats({ selectedRegion }: Props) {
  const { setActivePage } = useNavigation();
  const safe = waterSources.filter(s => s.risk === 'safe').length;
  const alerts = recentAlerts.filter(a => a.risk === 'danger' || a.risk === 'warning').length;

  const regions = selectedRegion === 'all' ? regionPredictions : regionPredictions.filter(r => r.id === selectedRegion);
  const avgRisk = Math.round(regions.reduce((s, r) => s + r.contaminationProbability, 0) / regions.length);
  const regionLabel = selectedRegion === 'all' ? 'All regions' : regions[0]?.region || '';

  const stats = [
    { label: 'Monitoring Stations', value: waterSources.length, change: '+2', sub: 'this week', up: true, onClick: () => setActivePage('stations') },
    { label: 'Stations Safe', value: `${safe}/${waterSources.length}`, change: 'Stable', sub: 'no change', up: true, onClick: () => setActivePage('stations') },
    { label: 'Active Alerts', value: alerts, change: alerts > 0 ? 'Monitor' : 'Clear', sub: 'need attention', up: false, onClick: () => setActivePage('alerts') },
    { label: `Risk — ${regionLabel}`, value: `${avgRisk}%`, change: avgRisk < 30 ? 'Low' : avgRisk < 50 ? 'Moderate' : 'High', sub: '7-day avg', up: avgRisk < 40, onClick: () => setActivePage('predictions') },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <button key={i} onClick={s.onClick} className="card px-6 py-5 text-left group relative">
          <ArrowUpRight size={15} className="absolute top-4 right-4 text-txt-muted/30 dark:text-txt-dark-muted/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-xs font-medium text-txt-muted dark:text-txt-dark-muted">{s.label}</p>
          <p className="text-2xl font-extrabold text-txt dark:text-txt-dark tracking-tight mt-1.5">{s.value}</p>
          <div className="flex items-center gap-1.5 mt-2.5">
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
