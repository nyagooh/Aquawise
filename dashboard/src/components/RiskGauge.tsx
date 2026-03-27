import { RiskScore } from '../utils/riskCalculator';
import { ShieldCheck, ShieldAlert, ShieldX, Gauge } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props { risk: RiskScore; }

const levelCfg = {
  safe:    { color: '#3CBF7A', bg: 'rgba(60,191,122,0.08)' },
  warning: { color: '#F4B740', bg: 'rgba(244,183,64,0.08)' },
  danger:  { color: '#E85D5D', bg: 'rgba(232,93,93,0.08)' },
};

export default function RiskGauge({ risk }: Props) {
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const c = levelCfg[risk.level];
  const r = 72, circ = Math.PI * r, off = circ - (risk.score / 100) * circ;
  const Icon = risk.level === 'safe' ? ShieldCheck : risk.level === 'warning' ? ShieldAlert : ShieldX;

  return (
    <div className="card p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(15,110,140,0.08)' }}>
            <Gauge size={18} className="text-primary dark:text-primary-dark" />
          </div>
          <h2 className="text-lg font-bold text-txt dark:text-txt-dark">Overall Risk</h2>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: c.bg, color: c.color }}>{risk.label}</span>
      </div>

      <div className="flex flex-col items-center my-2">
        <div className="relative">
          <svg width="170" height="95" viewBox="0 0 170 95">
            <path d="M 11 85 A 74 74 0 0 1 159 85" fill="none" stroke={dk ? '#1F2E3A' : '#E3EEF5'} strokeWidth="12" strokeLinecap="round" />
            <path d="M 11 85 A 74 74 0 0 1 159 85" fill="none" stroke={c.color} strokeWidth="12" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5">
            <Icon size={18} style={{ color: c.color }} />
            <span className="text-3xl font-extrabold leading-none mt-0.5" style={{ color: c.color }}>{risk.score}</span>
            <span className="text-2xs text-txt-muted dark:text-txt-dark-muted font-medium">/ 100</span>
          </div>
        </div>
        <div className="flex w-40 justify-between text-[9px] font-bold -mt-0.5">
          <span className="text-ok">Safe</span>
          <span className="text-warn">Caution</span>
          <span className="text-err">Danger</span>
        </div>
      </div>

      <div className="rounded-xl p-4 mt-3" style={{ background: c.bg }}>
        <p className="text-xs font-bold mb-1" style={{ color: c.color }}>What this means</p>
        <p className="text-xs text-txt-secondary dark:text-txt-dark-secondary leading-relaxed">{risk.recommendation}</p>
      </div>

      {risk.factors.length > 0 ? (
        <div className="mt-3 space-y-1.5">
          <p className="text-2xs font-semibold text-txt-muted dark:text-txt-dark-muted uppercase tracking-[0.1em]">Factors</p>
          {risk.factors.map((f, i) => (
            <div key={i} className="flex items-start gap-2 bg-surface-subtle dark:bg-surface-subtle-dark rounded-xl p-2.5">
              <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${f.impact === 'high' ? 'bg-err' : 'bg-warn'}`} />
              <p className="text-2xs text-txt-secondary dark:text-txt-dark-secondary leading-snug">{f.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl p-3 mt-3" style={{ background: 'rgba(60,191,122,0.06)' }}>
          <ShieldCheck size={14} className="text-ok flex-shrink-0" />
          <p className="text-xs font-semibold text-ok">All parameters within safe limits</p>
        </div>
      )}
    </div>
  );
}
