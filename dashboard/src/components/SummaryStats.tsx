import { Droplets, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { waterSources, recentAlerts } from '../data/mockData';
import { RiskScore } from '../utils/riskCalculator';

interface Props { risk: RiskScore; }

export default function SummaryStats({ risk }: Props) {
  const safe = waterSources.filter(s => s.risk === 'safe').length;
  const alerts = recentAlerts.filter(a => a.risk === 'danger' || a.risk === 'warning').length;

  const stats = [
    { icon: <Droplets size={20} />, bg: 'bg-blue-500', value: waterSources.length, label: 'Total Stations', sub: 'Active & monitoring' },
    { icon: <CheckCircle2 size={20} />, bg: 'bg-emerald-500', value: `${safe}/${waterSources.length}`, label: 'Stations Safe', sub: `${waterSources.length - safe} need attention` },
    { icon: <AlertTriangle size={20} />, bg: alerts ? 'bg-amber-500' : 'bg-slate-400', value: alerts, label: 'Active Alerts', sub: 'Requiring action' },
    { icon: <Activity size={20} />, bg: risk.level === 'safe' ? 'bg-emerald-500' : risk.level === 'warning' ? 'bg-amber-500' : 'bg-red-500', value: `${risk.score}%`, label: 'Risk Score', sub: `${risk.label} — AI assessed` },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="card p-4 flex items-center gap-3.5">
          <div className={`${s.bg} rounded-xl p-2.5 text-white flex-shrink-0`}>
            {s.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xl font-extrabold text-slate-800 dark:text-white leading-tight">{s.value}</p>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{s.label}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
