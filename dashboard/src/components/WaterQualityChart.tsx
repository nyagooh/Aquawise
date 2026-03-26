import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, ReferenceLine,
} from 'recharts';
import { timeSeriesData } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

type Param = 'temperature' | 'turbidity' | 'ph' | 'dissolvedOxygen' | 'nitrates';

interface ParamDef {
  key: Param; label: string; color: string; unit: string;
  safeMin: number; safeMax: number; explain: string;
}

const PARAMS: ParamDef[] = [
  { key: 'temperature',     label: 'Temperature',      color: '#0B8ED9', unit: '°C',   safeMin: 15,  safeMax: 30,   explain: 'Should stay between 15°C and 30°C. High temps reduce dissolved oxygen and encourage bacteria.' },
  { key: 'turbidity',       label: 'Turbidity',        color: '#8b5cf6', unit: 'NTU',  safeMin: 0,   safeMax: 5,    explain: 'Measures water cloudiness. Below 5 NTU is considered safe. Higher values signal contamination.' },
  { key: 'ph',              label: 'pH Level',         color: '#2BB5A0', unit: 'pH',   safeMin: 6.5, safeMax: 8.5,  explain: 'A healthy range is 6.5 to 8.5. Outside this range the water becomes harmful.' },
  { key: 'dissolvedOxygen', label: 'Dissolved Oxygen', color: '#22c55e', unit: 'mg/L', safeMin: 6,   safeMax: 14,   explain: 'Below 6 mg/L signals pollution. Fish and aquatic life need oxygen-rich water.' },
  { key: 'nitrates',        label: 'Nitrates',         color: '#ef4444', unit: 'mg/L', safeMin: 0,   safeMax: 10,   explain: 'Fertiliser runoff raises nitrates. Below 10 mg/L is safe. Higher causes harmful algae blooms.' },
];

function ChartTooltip({ active, payload, label, param }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value as number;
  const inSafe = val >= param.safeMin && val <= param.safeMax;
  return (
    <div className="bg-white dark:bg-[#161b22] border border-[#E8ECF1] dark:border-[#21262d] rounded-2xl shadow-xl p-4 min-w-[170px]">
      <p className="text-[11px] text-gray-400 font-medium mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-xl font-extrabold text-gray-900 dark:text-white">{val}</span>
        <span className="text-xs text-gray-400">{param.unit}</span>
      </div>
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${
        inSafe ? 'bg-accent/10 text-accent-dark dark:text-accent' : 'bg-red-500/10 text-red-600 dark:text-red-400'
      }`}>
        <span className={`w-2 h-2 rounded-full ${inSafe ? 'bg-accent' : 'bg-red-500'}`} />
        {inSafe ? 'Within safe range' : 'Outside safe range'}
      </div>
    </div>
  );
}

export default function WaterQualityChart() {
  const [selected, setSelected] = useState<Param>('turbidity');
  const { theme } = useTheme();
  const param = PARAMS.find(p => p.key === selected)!;
  const dk = theme === 'dark';

  const values = timeSeriesData.map(d => (d as any)[selected] as number);
  const yMin = Math.floor(Math.min(Math.min(...values), param.safeMin) * 0.9);
  const yMax = Math.ceil(Math.max(Math.max(...values), param.safeMax) * 1.1);
  const ticks = timeSeriesData.filter((_, i) => i % 4 === 0).map(d => d.time);

  return (
    <div className="card p-5">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Water Quality Trend</h2>
          <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">24-hour monitoring data</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PARAMS.map(p => (
            <button
              key={p.key}
              onClick={() => setSelected(p.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 ${
                selected === p.key
                  ? 'text-white shadow-md'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              style={selected === p.key ? { background: p.color, boxShadow: `0 4px 12px ${p.color}33` } : undefined}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2.5 mb-4 px-4 py-3 rounded-xl bg-brand-light/50 dark:bg-brand/5 border border-brand/10">
        <span className="text-brand text-sm font-bold mt-0.5">i</span>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
          <strong className="text-gray-700 dark:text-gray-200">How to read:</strong> {param.explain}{' '}
          The <span className="text-accent font-bold">green area</span> is the safe zone — readings should stay inside it.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={timeSeriesData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id={`grad-${selected}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={param.color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={param.color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={dk ? '#21262d' : '#F0F2F5'} vertical={false} />
          <ReferenceArea y1={param.safeMin} y2={param.safeMax} fill={dk ? 'rgba(43,181,160,0.04)' : 'rgba(43,181,160,0.07)'} stroke="none" />
          <ReferenceLine y={param.safeMax} stroke={dk ? '#1e8a7a' : '#2BB5A0'} strokeDasharray="6 4" strokeWidth={1} label={{ value: `Max ${param.safeMax}${param.unit}`, position: 'insideTopLeft', fontSize: 10, fill: '#2BB5A0' }} />
          <ReferenceLine y={param.safeMin} stroke={dk ? '#1e8a7a' : '#2BB5A0'} strokeDasharray="6 4" strokeWidth={1} label={{ value: `Min ${param.safeMin}${param.unit}`, position: 'insideBottomLeft', fontSize: 10, fill: '#2BB5A0' }} />
          <XAxis dataKey="time" ticks={ticks} tick={{ fontSize: 10, fill: dk ? '#484f58' : '#9ca3af', fontWeight: 500 }} axisLine={false} tickLine={false} dy={8} />
          <YAxis domain={[yMin, yMax]} tick={{ fontSize: 10, fill: dk ? '#484f58' : '#9ca3af', fontWeight: 500 }} axisLine={false} tickLine={false} width={46} />
          <Tooltip content={(props: any) => <ChartTooltip {...props} param={param} />} cursor={{ stroke: dk ? '#30363d' : '#e5e7eb', strokeWidth: 1 }} />
          <Area type="monotone" dataKey={selected} stroke={param.color} strokeWidth={2.5} fill={`url(#grad-${selected})`} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: param.color }} />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-5 mt-3 pt-3 border-t border-[#E8ECF1] dark:border-[#21262d]">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 rounded-full" style={{ background: param.color }} />
          <span className="text-[10px] text-gray-400 font-medium">{param.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-2.5 rounded-sm bg-accent/15 border border-accent/25" />
          <span className="text-[10px] text-gray-400 font-medium">Safe zone</span>
        </div>
      </div>
    </div>
  );
}
