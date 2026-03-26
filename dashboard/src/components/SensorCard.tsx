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
    <div className="card px-4 py-4">
      {/* Top */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base leading-none">{reading.icon}</span>
          <span className="text-sm font-bold text-txt dark:text-txt-dark truncate">{reading.name}</span>
        </div>
        {reading.isReal && (
          <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: 'rgba(15,110,140,0.08)', color: '#0F6E8C' }}>Sensor</span>
        )}
      </div>

      {/* Value */}
      <div className="flex items-end justify-between mb-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold tracking-tight text-txt dark:text-txt-dark">{reading.value}</span>
          <span className="text-xs text-txt-muted dark:text-txt-dark-muted font-medium">{reading.unit}</span>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.color }}>{c.label}</span>
      </div>

      {/* Bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(227,238,245,0.6)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: c.bar }} />
      </div>
      <div className="dark:opacity-0 hidden" />
      <div className="flex justify-between mt-1.5">
        <span className="text-2xs text-txt-muted dark:text-txt-dark-muted">{reading.safeMin}{reading.unit}</span>
        <span className="text-2xs text-txt-muted dark:text-txt-dark-muted">{reading.safeMax}{reading.unit}</span>
      </div>

      {/* Desc */}
      <p className="text-2xs text-txt-muted dark:text-txt-dark-muted leading-relaxed mt-2">{reading.description}</p>
    </div>
  );
}
