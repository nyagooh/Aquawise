import { Droplets, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { waterSources, recentAlerts } from '../data/mockData';
import { RiskScore } from '../utils/riskCalculator';

interface SummaryStatsProps {
  risk: RiskScore;
}

export default function SummaryStats({ risk }: SummaryStatsProps) {
  const stationCount = waterSources.length;
  const safeStations = waterSources.filter(s => s.risk === 'safe').length;
  const activeAlerts = recentAlerts.filter(a => a.risk === 'danger' || a.risk === 'warning').length;
  const resolvedToday = recentAlerts.filter(a => a.time === 'Yesterday').length;

  const stats = [
    {
      icon: <Droplets size={20} className="text-blue-500" />,
      bg: 'bg-blue-50',
      value: stationCount,
      label: 'Monitoring Stations',
      sub: 'Across Nairobi region',
    },
    {
      icon: <CheckCircle2 size={20} className="text-green-500" />,
      bg: 'bg-green-50',
      value: `${safeStations}/${stationCount}`,
      label: 'Stations Safe',
      sub: `${stationCount - safeStations} need attention`,
    },
    {
      icon: <AlertTriangle size={20} className="text-amber-500" />,
      bg: 'bg-amber-50',
      value: activeAlerts,
      label: 'Active Alerts',
      sub: `${resolvedToday} resolved today`,
    },
    {
      icon: <Activity size={20} className="text-purple-500" />,
      bg: 'bg-purple-50',
      value: `${risk.score}%`,
      label: 'Overall Risk Score',
      sub: risk.label + ' — AI assessed',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="card flex items-center gap-4">
          <div className={`${s.bg} rounded-xl p-3 flex-shrink-0`}>
            {s.icon}
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-extrabold text-slate-800 leading-tight">{s.value}</p>
            <p className="text-xs font-semibold text-slate-600 truncate">{s.label}</p>
            <p className="text-[10px] text-slate-400 truncate">{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
