import { SensorReading } from '../data/mockData';
import { getSensorRisk, getSensorPercent } from '../utils/riskCalculator';

interface SensorCardProps {
  reading: SensorReading;
}

const riskColors = {
  safe:    { bar: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  badge: 'badge-safe',    label: 'Normal' },
  warning: { bar: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50',  badge: 'badge-warning', label: 'Elevated' },
  danger:  { bar: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50',    badge: 'badge-danger',  label: 'Critical' },
};

export default function SensorCard({ reading }: SensorCardProps) {
  const risk = getSensorRisk(reading);
  const pct  = getSensorPercent(reading);
  const c    = riskColors[risk];

  return (
    <div className={`card flex flex-col gap-3 ${risk === 'danger' ? 'border-red-200' : risk === 'warning' ? 'border-amber-200' : ''}`}>
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{reading.icon}</span>
          <div>
            <p className="text-sm font-semibold text-slate-700">{reading.name}</p>
            {!reading.isReal && (
              <span className="text-[10px] text-slate-400 font-medium">Simulated</span>
            )}
          </div>
        </div>
        <span className={c.badge}>{c.label}</span>
      </div>

      {/* Value */}
      <div className="flex items-end gap-1">
        <span className={`text-3xl font-extrabold tracking-tight ${c.text}`}>
          {reading.value}
        </span>
        <span className="text-sm text-slate-400 mb-1 font-medium">{reading.unit}</span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${c.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-400">Min {reading.safeMin} {reading.unit}</span>
          <span className="text-[10px] text-slate-400">Max {reading.safeMax} {reading.unit}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-50 pt-2">
        {reading.description}
      </p>
    </div>
  );
}
