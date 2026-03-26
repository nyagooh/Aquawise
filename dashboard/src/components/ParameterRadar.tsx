import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { currentReadings } from '../data/mockData';

export default function ParameterRadar() {
  const data = currentReadings.map(r => {
    const range = r.safeMax - r.safeMin;
    const pct = Math.min(100, Math.max(0, ((r.value - r.safeMin) / range) * 100));
    return { parameter: r.name, score: Math.round(pct) };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="mb-1">
        <h2 className="text-sm font-bold text-slate-700">Parameter Health</h2>
        <p className="text-xs text-slate-400">Position within safe range for each metric</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="#f1f5f9" />
          <PolarAngleAxis dataKey="parameter" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
          <Radar
            name="Level"
            dataKey="score"
            stroke="#0ea5e9"
            fill="#0ea5e9"
            fillOpacity={0.12}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(v: any) => [`${v}%`, 'In safe range']}
            contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
