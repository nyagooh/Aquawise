import { RiskScore } from '../utils/riskCalculator';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface RiskGaugeProps {
  risk: RiskScore;
}

export default function RiskGauge({ risk }: RiskGaugeProps) {
  const radius = 72;
  const circumference = Math.PI * radius;
  const offset = circumference - (risk.score / 100) * circumference;
  const Icon = risk.level === 'safe' ? ShieldCheck : risk.level === 'warning' ? ShieldAlert : ShieldX;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-700">AI Risk Score</h2>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: risk.bgColor, color: risk.color }}
        >
          {risk.label}
        </span>
      </div>

      {/* Gauge */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width="180" height="100" viewBox="0 0 180 100">
            {/* Background arc */}
            <path d="M 14 90 A 76 76 0 0 1 166 90" fill="none" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
            {/* Colored arc */}
            <path
              d="M 14 90 A 76 76 0 0 1 166 90"
              fill="none"
              stroke={risk.color}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.6s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
            <Icon size={20} style={{ color: risk.color }} />
            <span className="text-3xl font-extrabold leading-none mt-1" style={{ color: risk.color }}>
              {risk.score}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">/ 100</span>
          </div>
        </div>

        <div className="flex w-44 justify-between text-[10px] font-bold -mt-1">
          <span className="text-green-500">Safe</span>
          <span className="text-amber-500">Caution</span>
          <span className="text-red-500">Danger</span>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-4 rounded-xl p-3" style={{ background: risk.bgColor }}>
        <p className="text-xs font-semibold mb-1" style={{ color: risk.color }}>Recommendation</p>
        <p className="text-xs text-slate-600 leading-relaxed">{risk.recommendation}</p>
      </div>

      {/* Risk factors */}
      {risk.factors.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Factors</p>
          {risk.factors.map((f, i) => (
            <div key={i} className="flex items-start gap-2 bg-slate-50 rounded-xl p-2.5">
              <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${f.impact === 'high' ? 'bg-red-500' : 'bg-amber-400'}`} />
              <p className="text-[11px] text-slate-600 leading-snug">{f.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
