import { TrendingUp, TrendingDown, Minus, BrainCircuit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { regionPredictions, RegionPrediction } from '../data/mockData';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const riskCfg = {
  safe:    { color: '#2BB5A0', bg: 'bg-accent/10', text: 'text-accent-dark dark:text-accent', label: 'Low Risk' },
  warning: { color: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: 'Medium Risk' },
  danger:  { color: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', label: 'High Risk' },
};

const trendIcon = {
  rising:  <TrendingUp size={12} className="text-red-500" />,
  falling: <TrendingDown size={12} className="text-emerald-500" />,
  stable:  <Minus size={12} className="text-amber-500" />,
};

function MiniBar({ data, riskLevel }: { data: RegionPrediction['forecastDays']; riskLevel: string }) {
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const barColor = (score: number) => score < 25 ? '#2BB5A0' : score < 55 ? '#f59e0b' : '#ef4444';

  return (
    <ResponsiveContainer width="100%" height={70}>
      <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <XAxis dataKey="day" tick={{ fontSize: 9, fill: dk ? '#484f58' : '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} hide />
        <Tooltip
          contentStyle={{ fontSize: 10, borderRadius: 10, border: dk ? '1px solid #21262d' : '1px solid #E8ECF1', background: dk ? '#161b22' : '#fff' }}
          formatter={(v: any) => [`${v}/100`, 'Risk']}
          labelStyle={{ fontWeight: 700, color: dk ? '#c9d1d9' : '#1a1a2e' }}
        />
        <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={16}>
          {data.map((entry, i) => (
            <Cell key={i} fill={barColor(entry.score)} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function RegionalPredictions() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="bg-violet-500/10 dark:bg-violet-500/20 rounded-xl p-2.5">
            <BrainCircuit size={20} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">AI Water Quality Predictions</h2>
            <p className="text-[12px] text-gray-400 dark:text-gray-500">7-day contamination forecast per region</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {regionPredictions.map(region => {
          const c = riskCfg[region.riskLevel];
          const isExpanded = expanded === region.id;

          return (
            <div
              key={region.id}
              className="rounded-xl border border-[#E8ECF1] dark:border-[#21262d] overflow-hidden transition-all duration-200 hover:shadow-sm"
            >
              {/* Row header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : region.id)}
                className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                {/* Risk dot */}
                <span className="w-3 h-3 rounded-full flex-shrink-0 ring-4" style={{ background: c.color, boxShadow: `0 0 0 4px ${c.color}18` }} />

                {/* Region */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100">{region.region}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{region.prediction}</p>
                </div>

                {/* Probability gauge */}
                <div className="hidden sm:flex flex-col items-center gap-0.5 w-16 flex-shrink-0">
                  <span className="text-[16px] font-extrabold" style={{ color: c.color }}>{region.contaminationProbability}%</span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Prob.</span>
                </div>

                {/* Trend */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {trendIcon[region.nextRisk]}
                  <span className="text-[10px] font-bold text-gray-500 capitalize">{region.nextRisk}</span>
                </div>

                {/* Badge */}
                <span className={`${c.bg} ${c.text} text-[10px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0`}>
                  {c.label}
                </span>

                {/* Chevron */}
                <svg className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-[#E8ECF1] dark:border-[#21262d] bg-gray-50/30 dark:bg-gray-900/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    {/* Forecast mini chart */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">7-Day Risk Forecast</p>
                      <MiniBar data={region.forecastDays} riskLevel={region.riskLevel} />
                    </div>
                    {/* Details */}
                    <div className="space-y-2.5">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AI Assessment</p>
                        <p className="text-[12px] text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{region.prediction}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold">Top Concern</p>
                          <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200">{region.topConcern}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold">Risk Score</p>
                          <p className="text-[12px] font-semibold" style={{ color: c.color }}>{region.riskScore}/100</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold">Trend</p>
                          <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 capitalize">{region.nextRisk}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
