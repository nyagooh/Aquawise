import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { TimePoint, timeSeriesData } from '../data/mockData';

type Param = 'temperature' | 'turbidity' | 'ph' | 'dissolvedOxygen' | 'conductivity' | 'nitrates';

const PARAMS: { key: Param; label: string; color: string; unit: string; safeMax: number }[] = [
  { key: 'temperature',     label: 'Temperature',       color: '#f97316', unit: '°C',     safeMax: 30 },
  { key: 'turbidity',       label: 'Turbidity',         color: '#8b5cf6', unit: 'NTU',    safeMax: 5 },
  { key: 'ph',              label: 'pH Level',          color: '#06b6d4', unit: 'pH',     safeMax: 8.5 },
  { key: 'dissolvedOxygen', label: 'Dissolved Oxygen',  color: '#22c55e', unit: 'mg/L',   safeMax: 14 },
  { key: 'nitrates',        label: 'Nitrates',          color: '#ef4444', unit: 'mg/L',   safeMax: 10 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-600 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function WaterQualityChart() {
  const [selected, setSelected] = useState<Param>('turbidity');
  const param = PARAMS.find(p => p.key === selected)!;

  // Show every other label on small data sets
  const ticks = timeSeriesData
    .filter((_, i) => i % 4 === 0)
    .map(d => d.time);

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="section-title mb-0">24-Hour Water Quality Trend</h2>
        {/* Parameter selector pills */}
        <div className="flex flex-wrap gap-1.5">
          {PARAMS.map(p => (
            <button
              key={p.key}
              onClick={() => setSelected(p.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selected === p.key
                  ? 'text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
              style={selected === p.key ? { background: p.color } : {}}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={timeSeriesData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="time"
            ticks={ticks}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            unit={` ${param.unit}`}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Safe max reference line */}
          <ReferenceLine
            y={param.safeMax}
            stroke="#ef4444"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{ value: 'Safe limit', position: 'insideTopRight', fontSize: 10, fill: '#ef4444' }}
          />
          <Line
            type="monotone"
            dataKey={selected}
            name={param.label}
            stroke={param.color}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-slate-400 mt-3">
        Showing last 24 hours · Real sensors: Temperature, Turbidity · Others simulated for demo
      </p>
    </div>
  );
}
