import { Droplets, ShieldCheck, AlertTriangle, BrainCircuit, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { waterSources, recentAlerts, regionPredictions } from '../data/mockData';
import { RiskScore } from '../utils/riskCalculator';

interface Props { risk: RiskScore; }

export default function SummaryStats({ risk }: Props) {
  const safe = waterSources.filter(s => s.risk === 'safe').length;
  const alerts = recentAlerts.filter(a => a.risk === 'danger' || a.risk === 'warning').length;
  const avgPrediction = Math.round(regionPredictions.reduce((s, r) => s + r.contaminationProbability, 0) / regionPredictions.length);

  const stats = [
    {
      icon: <Droplets size={22} />,
      iconBg: 'bg-brand/10 text-brand dark:bg-brand/20',
      value: waterSources.length,
      label: 'Total Stations',
      sub: 'All active',
      trend: <span className="flex items-center gap-0.5 text-accent text-[10px] font-bold"><TrendingUp size={10} /> +2 this month</span>,
    },
    {
      icon: <ShieldCheck size={22} />,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
      value: `${safe}/${waterSources.length}`,
      label: 'Stations Safe',
      sub: `${waterSources.length - safe} flagged`,
      trend: <span className="flex items-center gap-0.5 text-emerald-500 text-[10px] font-bold"><TrendingUp size={10} /> Improving</span>,
    },
    {
      icon: <AlertTriangle size={22} />,
      iconBg: alerts > 0 ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500',
      value: alerts,
      label: 'Active Alerts',
      sub: 'Requiring action',
      trend: alerts > 0
        ? <span className="flex items-center gap-0.5 text-amber-500 text-[10px] font-bold"><Minus size={10} /> Monitoring</span>
        : <span className="flex items-center gap-0.5 text-emerald-500 text-[10px] font-bold">All clear</span>,
    },
    {
      icon: <BrainCircuit size={22} />,
      iconBg: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400',
      value: `${avgPrediction}%`,
      label: 'Avg. Contamination Risk',
      sub: 'AI forecast across regions',
      trend: <span className="flex items-center gap-0.5 text-brand text-[10px] font-bold"><TrendingDown size={10} /> Decreasing</span>,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="card px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className={`rounded-xl p-2.5 ${s.iconBg}`}>{s.icon}</div>
            {s.trend}
          </div>
          <div>
            <p className="text-[26px] font-extrabold text-gray-900 dark:text-white leading-none tracking-tight">{s.value}</p>
            <p className="text-[12px] font-semibold text-gray-600 dark:text-gray-300 mt-1">{s.label}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
