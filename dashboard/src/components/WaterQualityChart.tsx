import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { timeSeriesData } from '../data/mockData';

type Param = 'temperature' | 'turbidity' | 'ph' | 'dissolvedOxygen' | 'nitrates';

const PARAMS: { key: Param; label: string; color: string; unit: string; safeMax: number }[] = [
  { key: 'temperature',     label: 'Temperature',      color: '#f97316', unit: '°C',   safeMax: 30   },
  { key: 'turbidity',       label: 'Turbidity',        color: '#8b5cf6', unit: 'NTU',  safeMax: 5    },
  { key: 'ph',              label: 'pH Level',         color: '#0ea5e9', unit: 'pH',   safeMax: 8.5  },
  { key: 'dissolvedOxygen', label: 'Dissolved Oxygen', color: '#22c55e', unit: 'mg/L', safeMax: 14   },
  { key: 'nitrates',        label: 'Nitrates',         color: '#ef4444', unit: 'mg/L', safeMax: 10   },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs">
      <p className="text-slate-500 mb-1.5 font-medium">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
        <span className="font-bold text-slate-800 text-sm">{p.value}</span>
        <span className="text-slate-400">{p.name}</span>
      </div>
    </div>
  );
};

export default function WaterQualityChart() {
  const [selected, setSelected] = useState<Param>('turbidity');
  const param = PARAMS.find(p => p.key === selected)!;

  const ticks = timeSeriesData.filter((_, i) => i % 6 === 0).map(d => d.time);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-bold text-slate-700">24-Hour Trend</h2>
          <p className="text-xs text-slate-400">Track how water quality changes throughout the day</p>
        </div>
        {/* Pills */}
        <div className="flex flex-wrap gap-1.5">
          {PARAMS.map(p => (
            <button
              key={p.key}
              onClick={() => setSelected(p.key)}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={
                selected === p.key
                  ? { background: p.color, color: '#fff', boxShadow: `0 2px 8px ${p.color}55` }
                  : { background: '#f8fafc', color: '#64748b' }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={timeSeriesData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"   stopColor={param.color} stopOpacity={0.15} />
              <stop offset="95%"  stopColor={param.color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="time" ticks={ticks} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={param.safeMax}
            stroke="#ef4444"
            strokeDasharray="5 3"
            strokeWidth={1.5}
            label={{ value: '⚠ Safe limit', position: 'insideTopRight', fontSize: 9, fill: '#ef4444' }}
          />
          <Area
            type="monotone"
            dataKey={selected}
            name={param.unit}
            stroke={param.color}
            strokeWidth={2.5}
            fill="url(#areaGrad)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-1.5 mt-3">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        <p className="text-[10px] text-slate-400">
          Real sensors: Temperature &amp; Turbidity · Others simulated for demo
        </p>
      </div>
    </div>
  );
}
