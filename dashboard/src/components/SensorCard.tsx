import { SensorReading } from '../data/mockData';
import { getSensorRisk, getSensorPercent } from '../utils/riskCalculator';

interface Props { reading: SensorReading; }

const cfg = {
  safe:    { bar: '#2BB5A0', text: 'text-accent-dark dark:text-accent', badge: 'bg-accent/10 text-accent-dark dark:text-accent', label: 'Normal' },
  warning: { bar: '#f59e0b', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', label: 'Elevated' },
  danger:  { bar: '#ef4444', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-500/10 text-red-600 dark:text-red-400', label: 'Critical' },
};

export default function SensorCard({ reading }: Props) {
  const risk = getSensorRisk(reading);
  const pct  = getSensorPercent(reading);
  const c    = cfg[risk];

  return (
    <div className="card px-4 py-4 flex flex-col gap-2">
      {/* Top: icon + name + badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base leading-none">{reading.icon}</span>
          <span className="text-[12px] font-bold text-gray-700 dark:text-gray-200 truncate">{reading.name}</span>
        </div>
        {reading.isReal && (
          <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand/10 text-brand dark:bg-brand/20">Sensor</span>
        )}
      </div>

      {/* Value */}
      <div className="flex items-end justify-between mt-1">
        <div className="flex items-baseline gap-1">
          <span className="text-[26px] font-extrabold leading-none tracking-tight text-gray-900 dark:text-white">
            {reading.value}
          </span>
          <span className="text-[11px] text-gray-400 font-medium">{reading.unit}</span>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{c.label}</span>
      </div>

      {/* Bar */}
      <div className="mt-1">
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: c.bar }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-gray-400 dark:text-gray-600">{reading.safeMin}{reading.unit}</span>
          <span className="text-[9px] text-gray-400 dark:text-gray-600">{reading.safeMax}{reading.unit}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">{reading.description}</p>
    </div>
  );
}
