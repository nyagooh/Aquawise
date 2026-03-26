import { Droplets, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { waterSources, recentAlerts } from '../data/mockData';
import { RiskScore } from '../utils/riskCalculator';

interface SummaryStatsProps {
  risk: RiskScore;
}

export default function SummaryStats({ risk }: SummaryStatsProps) {
  const safeStations = waterSources.filter(s => s.risk === 'safe').length;
  const activeAlerts = recentAlerts.filter(a => a.risk === 'danger' || a.risk === 'warning').length;

  const stats = [
    {
      icon: <Droplets size={22} />,
      iconBg: 'bg-blue-500',
      value: waterSources.length,
      label: 'Monitoring Stations',
      sub: 'Nairobi region',
      trend: null,
    },
    {
      icon: <CheckCircle2 size={22} />,
      iconBg: 'bg-emerald-500',
      value: `${safeStations}/${waterSources.length}`,
      label: 'Stations Safe',
      sub: `${waterSources.length - safeStations} need attention`,
      trend: null,
    },
    {
      icon: <AlertTriangle size={22} />,
      iconBg: activeAlerts > 0 ? 'bg-amber-500' : 'bg-slate-400',
      value: activeAlerts,
      label: 'Active Alerts',
      sub: 'Requiring action',
      trend: null,
    },
    {
      icon: <Activity size={22} />,
      iconBg: risk.level === 'safe' ? 'bg-emerald-500' : risk.level === 'warning' ? 'bg-amber-500' : 'bg-red-500',
      value: `${risk.score}%`,
      label: 'Risk Score',
      sub: `${risk.label} · AI assessed`,
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
          <div className={`${s.iconBg} rounded-2xl p-3 text-white flex-shrink-0`}>
            {s.icon}
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-800 leading-tight">{s.value}</p>
            <p className="text-sm font-semibold text-slate-600">{s.label}</p>
            <p className="text-xs text-slate-400">{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
