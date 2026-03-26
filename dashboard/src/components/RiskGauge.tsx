import { RiskScore } from '../utils/riskCalculator';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props { risk: RiskScore; }

export default function RiskGauge({ risk }: Props) {
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const radius = 72;
  const circ = Math.PI * radius;
  const offset = circ - (risk.score / 100) * circ;
  const Icon = risk.level === 'safe' ? ShieldCheck : risk.level === 'warning' ? ShieldAlert : ShieldX;

  return (
    <div className="card p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Overall Risk</h2>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg" style={{ background: dk ? `${risk.color}15` : risk.bgColor, color: risk.color }}>
          {risk.label}
        </span>
      </div>

      <div className="flex flex-col items-center my-2">
        <div className="relative">
          <svg width="170" height="95" viewBox="0 0 170 95">
            <path d="M 11 85 A 74 74 0 0 1 159 85" fill="none" stroke={dk ? '#21262d' : '#F0F2F5'} strokeWidth="12" strokeLinecap="round" />
            <path d="M 11 85 A 74 74 0 0 1 159 85" fill="none" stroke={risk.color} strokeWidth="12" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5">
            <Icon size={18} style={{ color: risk.color }} />
            <span className="text-[28px] font-extrabold leading-none mt-0.5" style={{ color: risk.color }}>{risk.score}</span>
            <span className="text-[10px] text-gray-400 font-medium">/ 100</span>
          </div>
        </div>
        <div className="flex w-40 justify-between text-[9px] font-bold -mt-0.5">
          <span className="text-accent">Safe</span>
          <span className="text-amber-500">Caution</span>
          <span className="text-red-500">Danger</span>
        </div>
      </div>

      <div className="rounded-xl p-3.5 mt-2" style={{ background: dk ? `${risk.color}10` : risk.bgColor }}>
        <p className="text-[11px] font-bold mb-0.5" style={{ color: risk.color }}>What this means</p>
        <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">{risk.recommendation}</p>
      </div>

      {risk.factors.length > 0 ? (
        <div className="mt-3 space-y-1.5">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.12em]">Contributing factors</p>
          {risk.factors.map((f, i) => (
            <div key={i} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-800/40 rounded-xl p-2.5">
              <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${f.impact === 'high' ? 'bg-red-500' : 'bg-amber-400'}`} />
              <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-snug">{f.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-accent/5 dark:bg-accent/10 rounded-xl p-3 mt-3">
          <ShieldCheck size={14} className="text-accent flex-shrink-0" />
          <p className="text-[11px] text-accent-dark dark:text-accent font-semibold">All parameters within safe limits</p>
        </div>
      )}
    </div>
  );
}
