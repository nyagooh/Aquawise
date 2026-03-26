import { SensorReading } from '../data/mockData';
import { getSensorRisk, getSensorPercent } from '../utils/riskCalculator';

interface SensorCardProps {
  reading: SensorReading;
}

const riskConfig = {
  safe:    { barColor: '#22c55e', textColor: '#15803d', bgColor: '#f0fdf4', badge: 'Safe',     dot: 'bg-green-400' },
  warning: { barColor: '#f59e0b', textColor: '#b45309', bgColor: '#fffbeb', badge: 'Elevated', dot: 'bg-amber-400' },
  danger:  { barColor: '#ef4444', textColor: '#b91c1c', bgColor: '#fef2f2', badge: 'Critical', dot: 'bg-red-400'   },
};

export default function SensorCard({ reading }: SensorCardProps) {
  const risk = getSensorRisk(reading);
  const pct  = getSensorPercent(reading);
  const c    = riskConfig[risk];

  return (
    <div
      className="bg-white rounded-2xl border p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
      style={{ borderColor: risk !== 'safe' ? c.barColor + '40' : '#f1f5f9' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{reading.icon}</span>
          <div>
            <p className="text-sm font-bold text-slate-700 leading-tight">{reading.name}</p>
            {!reading.isReal && (
              <span className="text-[10px] text-slate-400 font-medium">Simulated</span>
            )}
          </div>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: c.bgColor, color: c.textColor }}
        >
          {c.badge}
        </span>
      </div>

      {/* Big value */}
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold leading-none" style={{ color: c.textColor }}>
          {reading.value}
        </span>
        <span className="text-sm text-slate-400 font-medium">{reading.unit}</span>
      </div>

      {/* Gradient progress bar */}
      <div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: c.barColor }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-slate-400">{reading.safeMin} {reading.unit} min</span>
          <span className="text-[10px] text-slate-400">{reading.safeMax} {reading.unit} max</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-50">
        {reading.description}
      </p>
    </div>
  );
}
