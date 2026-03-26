import { SensorReading } from '../data/mockData';
import { getSensorRisk, getSensorPercent } from '../utils/riskCalculator';

interface Props { reading: SensorReading; }

const cfg = {
  safe:    { bar: '#22c55e', text: '#16a34a', textDark: '#4ade80', bg: '#f0fdf4', bgDark: 'rgba(34,197,94,0.08)', label: 'Safe'     },
  warning: { bar: '#f59e0b', text: '#d97706', textDark: '#fbbf24', bg: '#fffbeb', bgDark: 'rgba(245,158,11,0.08)', label: 'Elevated' },
  danger:  { bar: '#ef4444', text: '#dc2626', textDark: '#f87171', bg: '#fef2f2', bgDark: 'rgba(239,68,68,0.08)',  label: 'Critical' },
};

export default function SensorCard({ reading }: Props) {
  const risk = getSensorRisk(reading);
  const pct  = getSensorPercent(reading);
  const c    = cfg[risk];

  return (
    <div className="card p-4 flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base leading-none flex-shrink-0">{reading.icon}</span>
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate">{reading.name}</span>
          {reading.isReal && (
            <span className="flex-shrink-0 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">Live</span>
          )}
        </div>
      </div>

      {/* Value + badge */}
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-[28px] font-extrabold leading-none tracking-tight" style={{ color: c.text }}>
            <span className="dark:hidden">{reading.value}</span>
            <span className="hidden dark:inline" style={{ color: c.textDark }}>{reading.value}</span>
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{reading.unit}</span>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: c.bg, color: c.text }}
        >
          <span className="dark:hidden">{c.label}</span>
        </span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 hidden dark:inline-block"
          style={{ background: c.bgDark, color: c.textDark }}
        >
          {c.label}
        </span>
      </div>

      {/* Bar */}
      <div>
        <div className="h-1.5 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: c.bar }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-400 dark:text-slate-600">{reading.safeMin}{reading.unit}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-600">{reading.safeMax}{reading.unit}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed">
        {reading.description}
      </p>
    </div>
  );
}
