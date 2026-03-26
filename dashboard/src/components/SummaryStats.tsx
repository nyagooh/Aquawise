import { Droplets, ShieldCheck, AlertTriangle, BrainCircuit, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { waterSources, recentAlerts, regionPredictions } from '../data/mockData';
import { RiskScore } from '../utils/riskCalculator';

interface Props { risk: RiskScore; }

export default function SummaryStats({ risk }: Props) {
  const safe = waterSources.filter(s => s.risk === 'safe').length;
  const alerts = recentAlerts.filter(a => a.risk === 'danger' || a.risk === 'warning').length;
  const avgRisk = Math.round(regionPredictions.reduce((s, r) => s + r.contaminationProbability, 0) / regionPredictions.length);

  const stats = [
    { icon: <Droplets size={20} />, iconColor: '#0F6E8C', iconBg: 'rgba(15,110,140,0.08)', value: waterSources.length, label: 'Total Stations', trend: <span className="flex items-center gap-0.5 text-ok"><TrendingUp size={10} /><span className="text-2xs font-bold">+2</span></span> },
    { icon: <ShieldCheck size={20} />, iconColor: '#3CBF7A', iconBg: 'rgba(60,191,122,0.08)', value: `${safe}/${waterSources.length}`, label: 'Stations Safe', trend: <span className="flex items-center gap-0.5 text-ok"><TrendingUp size={10} /><span className="text-2xs font-bold">Stable</span></span> },
    { icon: <AlertTriangle size={20} />, iconColor: '#F4B740', iconBg: 'rgba(244,183,64,0.08)', value: alerts, label: 'Active Alerts', trend: alerts > 0 ? <span className="flex items-center gap-0.5 text-warn"><Minus size={10} /><span className="text-2xs font-bold">Monitor</span></span> : <span className="text-2xs font-bold text-ok">Clear</span> },
    { icon: <BrainCircuit size={20} />, iconColor: '#0F6E8C', iconBg: 'rgba(15,110,140,0.08)', value: `${avgRisk}%`, label: 'Avg. Risk', trend: <span className="flex items-center gap-0.5 text-ok"><TrendingDown size={10} /><span className="text-2xs font-bold">Falling</span></span> },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="card px-5 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="rounded-xl p-2.5" style={{ background: s.iconBg }}>
              <span style={{ color: s.iconColor }}>{s.icon}</span>
            </div>
            {s.trend}
          </div>
          <p className="text-2xl font-extrabold text-txt dark:text-txt-dark tracking-tight">{s.value}</p>
          <p className="text-sm font-medium text-txt-secondary dark:text-txt-dark-secondary mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
