import { RiskScore } from '../utils/riskCalculator';
import { ShieldCheck, ShieldAlert, ShieldX, TrendingUp } from 'lucide-react';

interface RiskGaugeProps {
  risk: RiskScore;
}

export default function RiskGauge({ risk }: RiskGaugeProps) {
  const radius = 70;
  const circumference = Math.PI * radius; // half-circle
  const offset = circumference - (risk.score / 100) * circumference;

  const Icon = risk.level === 'safe' ? ShieldCheck : risk.level === 'warning' ? ShieldAlert : ShieldX;

  const segments = [
    { color: '#22c55e', pct: 25 },
    { color: '#f59e0b', pct: 30 },
    { color: '#ef4444', pct: 45 },
  ];

  return (
    <div className="card flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-2">
        <h2 className="section-title mb-0">AI Contamination Risk</h2>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: risk.bgColor, color: risk.color }}
        >
          {risk.label}
        </span>
      </div>

      {/* Half-circle gauge */}
      <div className="relative mt-2">
        <svg width="200" height="110" viewBox="0 0 200 110">
          {/* Background track */}
          <path
            d="M 15 100 A 85 85 0 0 1 185 100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Colored fill */}
          <path
            d="M 15 100 A 85 85 0 0 1 185 100"
            fill="none"
            stroke={risk.color}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.6s ease' }}
          />
          {/* Tick marks for safe / caution / danger zones */}
          {[0, 25, 55, 100].map((pct) => {
            const angle = Math.PI * (1 - pct / 100); // 180° to 0°
            const x = 100 + 85 * Math.cos(angle);
            const y = 100 - 85 * Math.sin(angle);
            return (
              <circle key={pct} cx={x} cy={y} r="3" fill="#cbd5e1" />
            );
          })}
        </svg>

        {/* Centre score */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <Icon size={24} style={{ color: risk.color }} />
          <span className="text-4xl font-extrabold leading-none mt-1" style={{ color: risk.color }}>
            {risk.score}
          </span>
          <span className="text-xs text-slate-400 font-medium">out of 100</span>
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between w-48 text-[10px] font-semibold -mt-1 mb-3">
        <span className="text-green-600">Safe</span>
        <span className="text-amber-500">Caution</span>
        <span className="text-red-500">Danger</span>
      </div>

      {/* Risk factors */}
      {risk.factors.length > 0 ? (
        <div className="w-full space-y-1.5 mt-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk Factors</p>
          {risk.factors.map((f, i) => (
            <div key={i} className="flex items-start gap-2 bg-slate-50 rounded-xl p-2.5">
              <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${f.impact === 'high' ? 'bg-red-500' : 'bg-amber-400'}`} />
              <p className="text-xs text-slate-600">{f.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full flex items-center gap-2 bg-green-50 rounded-xl p-3 mt-2">
          <TrendingUp size={16} className="text-green-600 flex-shrink-0" />
          <p className="text-xs text-green-700 font-medium">All parameters within safe limits</p>
        </div>
      )}

      {/* Recommendation */}
      <div
        className="w-full mt-3 rounded-xl p-3"
        style={{ background: risk.bgColor }}
      >
        <p className="text-xs font-semibold mb-0.5" style={{ color: risk.color }}>Recommendation</p>
        <p className="text-xs text-slate-700">{risk.recommendation}</p>
      </div>
    </div>
  );
}
