import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { currentReadings } from '../data/mockData';

export default function ParameterRadar() {
  const data = currentReadings.map(r => {
    // Normalize value to 0-100 within safe range
    const range = r.safeMax - r.safeMin;
    const pct = Math.min(100, Math.max(0, ((r.value - r.safeMin) / range) * 100));
    return {
      parameter: r.name,
      score: Math.round(pct),
      fullMark: 100,
    };
  });

  return (
    <div className="card">
      <h2 className="section-title">Parameter Health Radar</h2>
      <p className="text-xs text-slate-400 -mt-2 mb-4">
        Shows where each parameter sits within its safe range (0 = at min, 100 = at max)
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={data} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="parameter"
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
          />
          <Radar
            name="Current Level"
            dataKey="score"
            stroke="#0091d7"
            fill="#0091d7"
            fillOpacity={0.18}
            strokeWidth={2}
          />
          <Tooltip
            formatter={(v: any) => [`${v}% of safe range`, 'Level']}
            contentStyle={{ fontSize: 11, borderRadius: 12, border: '1px solid #e2e8f0' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
