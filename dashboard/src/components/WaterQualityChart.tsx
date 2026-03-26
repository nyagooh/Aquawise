import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, ReferenceLine,
} from 'recharts';
import { timeSeriesData } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

type Param = 'temperature' | 'turbidity' | 'ph' | 'dissolvedOxygen' | 'nitrates';

interface ParamDef {
  key: Param;
  label: string;
  color: string;
  unit: string;
  safeMin: number;
  safeMax: number;
  explain: string;
}

const PARAMS: ParamDef[] = [
  { key: 'temperature',     label: 'Temperature',      color: '#f97316', unit: '°C',   safeMin: 15,  safeMax: 30,   explain: 'Should stay between 15°C and 30°C. High temperatures reduce oxygen and encourage bacteria growth.' },
  { key: 'turbidity',       label: 'Turbidity',        color: '#8b5cf6', unit: 'NTU',  safeMin: 0,   safeMax: 5,    explain: 'Measures water cloudiness. Below 5 NTU is safe. Higher values could mean contamination.' },
  { key: 'ph',              label: 'pH Level',         color: '#0ea5e9', unit: 'pH',   safeMin: 6.5, safeMax: 8.5,  explain: 'Measures how acidic or alkaline water is. A healthy range is 6.5 to 8.5.' },
  { key: 'dissolvedOxygen', label: 'Dissolved Oxygen', color: '#22c55e', unit: 'mg/L', safeMin: 6,   safeMax: 14,   explain: 'Oxygen dissolved in water. Below 6 mg/L means the water may be polluted.' },
  { key: 'nitrates',        label: 'Nitrates',         color: '#ef4444', unit: 'mg/L', safeMin: 0,   safeMax: 10,   explain: 'Nutrients from fertiliser. Below 10 mg/L is safe. Higher can cause harmful algae blooms.' },
];

function HumanTooltip({ active, payload, label, param }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value as number;
  const inSafe = val >= param.safeMin && val <= param.safeMax;

  return (
    <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl shadow-xl p-4 min-w-[180px]">
      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-xl font-extrabold" style={{ color: param.color }}>{val}</span>
        <span className="text-xs text-slate-400">{param.unit}</span>
      </div>
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
        inSafe
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      }`}>
        <span className={`w-2 h-2 rounded-full ${inSafe ? 'bg-emerald-500' : 'bg-red-500'}`} />
        {inSafe ? 'Within safe range' : 'Outside safe range'}
      </div>
    </div>
  );
}

export default function WaterQualityChart() {
  const [selected, setSelected] = useState<Param>('turbidity');
  const { theme } = useTheme();
  const param = PARAMS.find(p => p.key === selected)!;
  const dark = theme === 'dark';

  // Calculate Y axis domain with padding
  const values = timeSeriesData.map(d => (d as any)[selected] as number);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const yMin = Math.floor(Math.min(dataMin, param.safeMin) * 0.9);
  const yMax = Math.ceil(Math.max(dataMax, param.safeMax) * 1.1);

  // Show every 4th tick for readability
  const tickIdxs = timeSeriesData.map((d, i) => ({ time: d.time, i })).filter((_, i) => i % 4 === 0).map(d => d.time);

  return (
    <div className="card p-5">
      {/* Header row */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">24-Hour Water Quality Trend</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            How water quality has changed in the last 24 hours
          </p>
        </div>
        {/* Parameter pills */}
        <div className="flex flex-wrap gap-1.5">
          {PARAMS.map(p => {
            const isActive = selected === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setSelected(p.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'text-white shadow-md'
                    : 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-700'
                }`}
                style={isActive ? { background: p.color } : undefined}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation banner */}
      <div className="flex items-start gap-2.5 mb-4 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-100 dark:border-gray-700/50">
        <span className="text-sm mt-0.5" style={{ color: param.color }}>i</span>
        <div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-0.5">How to read this chart</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {param.explain}{' '}
            The <span className="text-emerald-600 dark:text-emerald-400 font-semibold">green shaded area</span> shows the safe range.
            If the line goes outside the green area, water quality needs attention.
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={timeSeriesData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id={`grad-${selected}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor={param.color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={param.color} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={dark ? '#1e293b' : '#f1f5f9'}
            vertical={false}
          />

          {/* Safe zone green band */}
          <ReferenceArea
            y1={param.safeMin}
            y2={param.safeMax}
            fill={dark ? 'rgba(34,197,94,0.06)' : 'rgba(34,197,94,0.08)'}
            stroke="none"
          />

          {/* Safe zone boundaries */}
          <ReferenceLine
            y={param.safeMax}
            stroke={dark ? '#166534' : '#86efac'}
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{ value: `Safe max: ${param.safeMax}${param.unit}`, position: 'insideTopLeft', fontSize: 10, fill: dark ? '#4ade80' : '#16a34a' }}
          />
          <ReferenceLine
            y={param.safeMin}
            stroke={dark ? '#166534' : '#86efac'}
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{ value: `Safe min: ${param.safeMin}${param.unit}`, position: 'insideBottomLeft', fontSize: 10, fill: dark ? '#4ade80' : '#16a34a' }}
          />

          <XAxis
            dataKey="time"
            ticks={tickIdxs}
            tick={{ fontSize: 11, fill: dark ? '#475569' : '#94a3b8', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 11, fill: dark ? '#475569' : '#94a3b8', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            content={(props: any) => <HumanTooltip {...props} param={param} />}
            cursor={{ stroke: dark ? '#334155' : '#e2e8f0', strokeWidth: 1 }}
          />

          <Area
            type="monotone"
            dataKey={selected}
            stroke={param.color}
            strokeWidth={2.5}
            fill={`url(#grad-${selected})`}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff', fill: param.color }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 pt-3 border-t border-slate-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 rounded-full" style={{ background: param.color }} />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{param.label} readings</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/30" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Safe zone ({param.safeMin}–{param.safeMax} {param.unit})</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Real sensor</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 ml-2" />
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Simulated</span>
        </div>
      </div>
    </div>
  );
}
