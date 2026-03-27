import { SensorReading } from '../data/mockData';
import { getSensorRisk, getSensorPercent } from '../utils/riskCalculator';

interface Props { reading: SensorReading; }

const cfg = {
  safe:    { bar: '#3CBF7A', label: 'Normal',   color: '#3CBF7A', bg: 'rgba(60,191,122,0.08)' },
  warning: { bar: '#F4B740', label: 'Elevated',  color: '#F4B740', bg: 'rgba(244,183,64,0.08)' },
  danger:  { bar: '#E85D5D', label: 'Critical',  color: '#E85D5D', bg: 'rgba(232,93,93,0.08)' },
};

export default function SensorCard({ reading }: Props) {
  const risk = getSensorRisk(reading);
  const pct  = getSensorPercent(reading);
  const c    = cfg[risk];

  return (
    <div className="card px-5 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-lg leading-none">{reading.icon}</span>
          <span className="text-sm font-semibold text-txt dark:text-txt-dark truncate">{reading.name}</span>
        </div>
        {reading.isReal && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/8 text-primary dark:bg-primary-dark/10 dark:text-primary-dark">Live</span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-1">
        <span className="text-2xl font-extrabold tracking-tight text-txt dark:text-txt-dark">{reading.value}</span>
        <span className="text-xs text-txt-muted dark:text-txt-dark-muted">{reading.unit}</span>
      </div>

      <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-4" style={{ background: c.bg, color: c.color }}>{c.label}</span>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden bg-surface-subtle dark:bg-surface-subtle-dark">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: c.bar }} />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-2xs text-txt-muted dark:text-txt-dark-muted">{reading.safeMin}</span>
        <span className="text-2xs text-txt-muted dark:text-txt-dark-muted">{reading.safeMax}</span>
      </div>
    </div>
  );
}
