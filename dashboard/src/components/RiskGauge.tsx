import { RiskScore } from '../utils/riskCalculator';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props { risk: RiskScore; }

export default function RiskGauge({ risk }: Props) {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const radius = 72;
  const circumference = Math.PI * radius;
  const offset = circumference - (risk.score / 100) * circumference;
  const Icon = risk.level === 'safe' ? ShieldCheck : risk.level === 'warning' ? ShieldAlert : ShieldX;

  const bgDark = risk.level === 'safe' ? 'rgba(34,197,94,0.1)' : risk.level === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';

  return (
    <div className="card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">AI Risk Assessment</h2>
        <span
          className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
          style={{
            background: dark ? bgDark : risk.bgColor,
            color: risk.color,
          }}
        >
          {risk.label}
        </span>
      </div>

      {/* Gauge */}
      <div className="flex flex-col items-center my-2">
        <div className="relative">
          <svg width="180" height="100" viewBox="0 0 180 100">
            <path d="M 14 90 A 76 76 0 0 1 166 90" fill="none" stroke={dark ? '#1e293b' : '#f1f5f9'} strokeWidth="14" strokeLinecap="round" />
            <path
              d="M 14 90 A 76 76 0 0 1 166 90"
              fill="none"
              stroke={risk.color}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <Icon size={18} style={{ color: risk.color }} />
            <span className="text-3xl font-extrabold leading-none mt-0.5" style={{ color: risk.color }}>{risk.score}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">/ 100</span>
          </div>
        </div>
        <div className="flex w-44 justify-between text-[10px] font-bold -mt-0.5">
          <span className="text-emerald-500">Safe</span>
          <span className="text-amber-500">Caution</span>
          <span className="text-red-500">Danger</span>
        </div>
      </div>

      {/* Recommendation */}
      <div
        className="rounded-xl p-3.5 mt-2"
        style={{ background: dark ? bgDark : risk.bgColor }}
      >
        <p className="text-xs font-bold mb-1" style={{ color: risk.color }}>What this means</p>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{risk.recommendation}</p>
      </div>

      {/* Risk factors */}
      {risk.factors.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.12em]">Contributing factors</p>
          {risk.factors.map((f, i) => (
            <div key={i} className="flex items-start gap-2 bg-slate-50 dark:bg-gray-800/50 rounded-xl p-2.5">
              <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${f.impact === 'high' ? 'bg-red-500' : 'bg-amber-400'}`} />
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{f.message}</p>
            </div>
          ))}
        </div>
      )}

      {risk.factors.length === 0 && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 mt-3">
          <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">All parameters within safe limits</p>
        </div>
      )}
    </div>
  );
}
