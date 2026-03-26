import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { currentReadings } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

export default function ParameterRadar() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const data = currentReadings.map(r => {
    const range = r.safeMax - r.safeMin;
    const pct = Math.min(100, Math.max(0, ((r.value - r.safeMin) / range) * 100));
    return { parameter: r.name, score: Math.round(pct) };
  });

  return (
    <div className="card p-5">
      <div className="mb-2">
        <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Parameter Health</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Where each reading sits within its safe range</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke={dark ? '#1e293b' : '#f1f5f9'} />
          <PolarAngleAxis
            dataKey="parameter"
            tick={{ fontSize: 10, fill: dark ? '#64748b' : '#64748b', fontWeight: 600 }}
          />
          <Radar
            name="Level"
            dataKey="score"
            stroke="#0ea5e9"
            fill="#0ea5e9"
            fillOpacity={dark ? 0.08 : 0.12}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(v: any) => [`${v}%`, 'In safe range']}
            contentStyle={{
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 12,
              border: dark ? '1px solid #1e293b' : '1px solid #e2e8f0',
              background: dark ? '#111827' : '#fff',
              color: dark ? '#e2e8f0' : '#1e293b',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
