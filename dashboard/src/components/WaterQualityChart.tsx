import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, ReferenceLine,
} from 'recharts';
import { timeSeriesData } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';
import { BarChart3 } from 'lucide-react';

type Param = 'temperature' | 'turbidity' | 'ph' | 'dissolvedOxygen' | 'nitrates';

interface ParamDef {
  key: Param; label: string; color: string; unit: string;
  safeMin: number; safeMax: number; explain: string;
}

// Blue for baseline, green for safe context in chart
const PARAMS: ParamDef[] = [
  { key: 'temperature',     label: 'Temperature',      color: '#0F6E8C', unit: '°C',   safeMin: 15,  safeMax: 30,   explain: 'Should stay between 15–30°C. High temps reduce dissolved oxygen and promote bacteria.' },
  { key: 'turbidity',       label: 'Turbidity',        color: '#0F6E8C', unit: 'NTU',  safeMin: 0,   safeMax: 5,    explain: 'Water cloudiness. Below 5 NTU is safe. Higher values signal possible contamination.' },
  { key: 'ph',              label: 'pH Level',         color: '#0F6E8C', unit: 'pH',   safeMin: 6.5, safeMax: 8.5,  explain: 'Healthy range is 6.5–8.5. Outside this range, water becomes harmful to drink.' },
  { key: 'dissolvedOxygen', label: 'Dissolved Oxygen', color: '#0F6E8C', unit: 'mg/L', safeMin: 6,   safeMax: 14,   explain: 'Below 6 mg/L signals pollution. Aquatic life needs oxygen-rich water to survive.' },
  { key: 'nitrates',        label: 'Nitrates',         color: '#0F6E8C', unit: 'mg/L', safeMin: 0,   safeMax: 10,   explain: 'From fertiliser runoff. Below 10 mg/L is safe. Higher causes harmful algae blooms.' },
];

function ChartTooltip({ active, payload, label, param }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value as number;
  const safe = val >= param.safeMin && val <= param.safeMax;
  return (
    <div className="bg-surface dark:bg-surface-dark border border-line dark:border-line-dark rounded-2xl shadow-elevated p-4 min-w-[170px]">
      <p className="text-2xs text-txt-muted dark:text-txt-dark-muted font-medium mb-2">{label}</p>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-xl font-extrabold text-txt dark:text-txt-dark">{val}</span>
        <span className="text-xs text-txt-muted dark:text-txt-dark-muted">{param.unit}</span>
      </div>
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
        safe ? 'text-ok' : 'text-err'
      }`} style={{ background: safe ? 'rgba(60,191,122,0.08)' : 'rgba(232,93,93,0.08)' }}>
        <span className={`w-2 h-2 rounded-full ${safe ? 'bg-ok' : 'bg-err'}`} />
        {safe ? 'Within safe range' : 'Outside safe range'}
      </div>
    </div>
  );
}

export default function WaterQualityChart() {
  const [selected, setSelected] = useState<Param>('turbidity');
  const { theme } = useTheme();
  const param = PARAMS.find(p => p.key === selected)!;
  const dk = theme === 'dark';

  const vals = timeSeriesData.map(d => (d as any)[selected] as number);
  const yMin = Math.floor(Math.min(Math.min(...vals), param.safeMin) * 0.9);
  const yMax = Math.ceil(Math.max(Math.max(...vals), param.safeMax) * 1.1);
  const ticks = timeSeriesData.filter((_, i) => i % 4 === 0).map(d => d.time);

  return (
    <div className="card p-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(15,110,140,0.08)' }}>
            <BarChart3 size={18} className="text-primary dark:text-primary-dark" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-txt dark:text-txt-dark">Water Quality Trend</h2>
            <p className="text-xs text-txt-muted dark:text-txt-dark-muted mt-0.5">24-hour monitoring data</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PARAMS.map(p => (
            <button
              key={p.key}
              onClick={() => setSelected(p.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                selected === p.key
                  ? 'bg-primary dark:bg-primary-dark text-white shadow-md shadow-primary/15'
                  : 'bg-surface-subtle dark:bg-surface-subtle-dark text-txt-secondary dark:text-txt-dark-secondary hover:text-txt dark:hover:text-txt-dark'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div className="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-xl bg-surface-subtle dark:bg-surface-subtle-dark">
        <span className="text-sm font-bold text-primary dark:text-primary-dark mt-0.5">i</span>
        <p className="text-xs text-txt-secondary dark:text-txt-dark-secondary leading-relaxed">
          <strong className="text-txt dark:text-txt-dark">How to read:</strong> {param.explain}{' '}
          The <span className="text-ok font-bold">green shaded area</span> is the safe zone.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={timeSeriesData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id={`cg-${selected}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dk ? '#1CA9C9' : '#0F6E8C'} stopOpacity={0.15} />
              <stop offset="100%" stopColor={dk ? '#1CA9C9' : '#0F6E8C'} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={dk ? '#1F2E3A' : '#E3EEF5'} vertical={false} />
          <ReferenceArea y1={param.safeMin} y2={param.safeMax} fill={dk ? 'rgba(60,191,122,0.04)' : 'rgba(60,191,122,0.06)'} stroke="none" />
          <ReferenceLine y={param.safeMax} stroke="#3CBF7A" strokeDasharray="6 4" strokeWidth={1} label={{ value: `Safe max ${param.safeMax}${param.unit}`, position: 'insideTopLeft', fontSize: 10, fill: '#3CBF7A' }} />
          <ReferenceLine y={param.safeMin} stroke="#3CBF7A" strokeDasharray="6 4" strokeWidth={1} label={{ value: `Safe min ${param.safeMin}${param.unit}`, position: 'insideBottomLeft', fontSize: 10, fill: '#3CBF7A' }} />
          <XAxis dataKey="time" ticks={ticks} tick={{ fontSize: 10, fill: dk ? '#6B8796' : '#9BB3C0', fontWeight: 500 }} axisLine={false} tickLine={false} dy={8} />
          <YAxis domain={[yMin, yMax]} tick={{ fontSize: 10, fill: dk ? '#6B8796' : '#9BB3C0', fontWeight: 500 }} axisLine={false} tickLine={false} width={46} />
          <Tooltip content={(props: any) => <ChartTooltip {...props} param={param} />} cursor={{ stroke: dk ? '#1F2E3A' : '#E3EEF5', strokeWidth: 1 }} />
          <Area type="monotone" dataKey={selected} stroke={dk ? '#1CA9C9' : '#0F6E8C'} strokeWidth={2.5} fill={`url(#cg-${selected})`} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: dk ? '#121A22' : '#FFFFFF', fill: dk ? '#1CA9C9' : '#0F6E8C' }} />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-line dark:border-line-dark">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 rounded-full bg-primary dark:bg-primary-dark" />
          <span className="text-2xs text-txt-muted dark:text-txt-dark-muted font-medium">{param.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-2.5 rounded-sm" style={{ background: 'rgba(60,191,122,0.12)', border: '1px solid rgba(60,191,122,0.2)' }} />
          <span className="text-2xs text-txt-muted dark:text-txt-dark-muted font-medium">Safe zone</span>
        </div>
      </div>
    </div>
  );
}
