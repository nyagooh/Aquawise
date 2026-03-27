import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { currentReadings } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';
import { ArrowUpRight } from 'lucide-react';

export default function ParameterRadar() {
  const { theme } = useTheme();
  const dk = theme === 'dark';

  const data = currentReadings.map(r => {
    const range = r.safeMax - r.safeMin;
    return { parameter: r.name, score: Math.round(Math.min(100, Math.max(0, ((r.value - r.safeMin) / range) * 100))) };
  });

  return (
    <div className="card p-7">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-lg font-bold text-txt dark:text-txt-dark">Parameter Health</h2>
        <ArrowUpRight size={14} className="text-txt-muted dark:text-txt-dark-muted" />
      </div>
      <p className="text-xs text-txt-muted dark:text-txt-dark-muted mb-4">Position within safe range</p>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke={dk ? '#1A2730' : '#E8EFF5'} />
          <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 10, fill: dk ? '#5E7A8A' : '#8FA8B8', fontWeight: 600 }} />
          <Radar name="Level" dataKey="score" stroke={dk ? '#1CA9C9' : '#0F6E8C'} fill={dk ? '#1CA9C9' : '#0F6E8C'} fillOpacity={dk ? 0.06 : 0.08} strokeWidth={2} />
          <Tooltip
            formatter={(v: any) => [`${v}%`, 'In safe range']}
            contentStyle={{ fontSize: 11, fontWeight: 600, borderRadius: 14, border: dk ? '1px solid #1A2730' : '1px solid #E0EBF2', background: dk ? '#111920' : '#FFFFFF', color: dk ? '#E6F1F5' : '#1A2B34' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
