import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { currentReadings } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';
import { Activity } from 'lucide-react';

export default function ParameterRadar() {
  const { theme } = useTheme();
  const dk = theme === 'dark';

  const data = currentReadings.map(r => {
    const range = r.safeMax - r.safeMin;
    return { parameter: r.name, score: Math.round(Math.min(100, Math.max(0, ((r.value - r.safeMin) / range) * 100))) };
  });

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-xl p-2.5" style={{ background: 'rgba(15,110,140,0.08)' }}>
          <Activity size={18} className="text-primary dark:text-primary-dark" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-txt dark:text-txt-dark">Parameter Health</h2>
          <p className="text-xs text-txt-muted dark:text-txt-dark-muted mt-0.5">Position within safe range</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke={dk ? '#1F2E3A' : '#E3EEF5'} />
          <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 10, fill: dk ? '#6B8796' : '#6B8796', fontWeight: 600 }} />
          <Radar name="Level" dataKey="score" stroke={dk ? '#1CA9C9' : '#0F6E8C'} fill={dk ? '#1CA9C9' : '#0F6E8C'} fillOpacity={dk ? 0.06 : 0.08} strokeWidth={2} />
          <Tooltip
            formatter={(v: any) => [`${v}%`, 'In safe range']}
            contentStyle={{ fontSize: 11, fontWeight: 600, borderRadius: 12, border: dk ? '1px solid #1F2E3A' : '1px solid #E3EEF5', background: dk ? '#121A22' : '#FFFFFF', color: dk ? '#E6F1F5' : '#1A2B34' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
