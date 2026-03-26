import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { currentReadings } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

export default function ParameterRadar() {
  const { theme } = useTheme();
  const dk = theme === 'dark';

  const data = currentReadings.map(r => {
    const range = r.safeMax - r.safeMin;
    return { parameter: r.name, score: Math.round(Math.min(100, Math.max(0, ((r.value - r.safeMin) / range) * 100))) };
  });

  return (
    <div className="card p-5">
      <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Parameter Health</h2>
      <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5 mb-2">Where each reading sits within its safe range</p>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke={dk ? '#21262d' : '#F0F2F5'} />
          <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 10, fill: dk ? '#484f58' : '#6b7280', fontWeight: 600 }} />
          <Radar name="Level" dataKey="score" stroke="#0B8ED9" fill="#0B8ED9" fillOpacity={dk ? 0.08 : 0.1} strokeWidth={2} />
          <Tooltip
            formatter={(v: any) => [`${v}%`, 'In safe range']}
            contentStyle={{ fontSize: 11, fontWeight: 600, borderRadius: 12, border: dk ? '1px solid #21262d' : '1px solid #E8ECF1', background: dk ? '#161b22' : '#fff', color: dk ? '#c9d1d9' : '#1a1a2e' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
