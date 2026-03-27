import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { regionPredictions, RegionPrediction } from '../data/mockData';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const riskCfg = {
  safe:    { color: '#3CBF7A', bg: 'rgba(60,191,122,0.06)', label: 'Low' },
  warning: { color: '#F4B740', bg: 'rgba(244,183,64,0.06)', label: 'Medium' },
  danger:  { color: '#E85D5D', bg: 'rgba(232,93,93,0.06)',  label: 'High' },
};

const trendIcon = {
  rising:  <TrendingUp size={12} className="text-err" />,
  falling: <TrendingDown size={12} className="text-ok" />,
  stable:  <Minus size={12} className="text-txt-muted dark:text-txt-dark-muted" />,
};

function MiniBar({ data }: { data: RegionPrediction['forecastDays'] }) {
  const { theme } = useTheme();
  const dk = theme === 'dark';
  // Use primary palette for bars — low=light, med=medium, high=saturated
  const barColor = (s: number) => s < 25 ? (dk ? '#A29BFE' : '#6C5CE7') : s < 55 ? '#F4B740' : '#E85D5D';

  return (
    <ResponsiveContainer width="100%" height={64}>
      <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: dk ? '#6B6880' : '#9490AA' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} hide />
        <Tooltip
          contentStyle={{ fontSize: 11, borderRadius: 12, border: dk ? '1px solid #1E1C2E' : '1px solid #E8E4F5', background: dk ? '#14131F' : '#fff', color: dk ? '#EEEDF5' : '#1A1A2E' }}
          formatter={(v: any) => [`${v}/100`, 'Risk']}
        />
        <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={14}>
          {data.map((e, i) => <Cell key={i} fill={barColor(e.score)} fillOpacity={0.8} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function RegionalPredictions() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="card p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-txt dark:text-txt-dark">AI Water Quality Predictions</h2>
            <ArrowUpRight size={14} className="text-txt-muted dark:text-txt-dark-muted" />
          </div>
          <p className="text-xs text-txt-muted dark:text-txt-dark-muted mt-0.5">7-day contamination forecast per region</p>
        </div>
      </div>

      <div className="space-y-3">
        {regionPredictions.map(region => {
          const c = riskCfg[region.riskLevel];
          const open = expanded === region.id;

          return (
            <div key={region.id} className="rounded-2xl border border-line dark:border-line-dark overflow-hidden">
              <button
                onClick={() => setExpanded(open ? null : region.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-surface-subtle/40 dark:hover:bg-surface-subtle-dark/40 transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-txt dark:text-txt-dark">{region.region}</p>
                  <p className="text-xs text-txt-muted dark:text-txt-dark-muted truncate mt-0.5">{region.prediction}</p>
                </div>

                <div className="hidden sm:flex flex-col items-center w-14 flex-shrink-0">
                  <span className="text-lg font-extrabold" style={{ color: c.color }}>{region.contaminationProbability}%</span>
                  <span className="text-[9px] text-txt-muted dark:text-txt-dark-muted font-medium">Risk</span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">{trendIcon[region.nextRisk]}</div>

                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: c.bg, color: c.color }}>{c.label}</span>

                <svg className={`w-4 h-4 text-txt-muted dark:text-txt-dark-muted transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open && (
                <div className="px-5 pb-5 border-t border-line dark:border-line-dark bg-surface-subtle/20 dark:bg-surface-subtle-dark/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                    <div>
                      <p className="text-xs font-semibold text-txt-muted dark:text-txt-dark-muted mb-2">7-Day Forecast</p>
                      <MiniBar data={region.forecastDays} />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-txt-muted dark:text-txt-dark-muted">AI Assessment</p>
                        <p className="text-xs text-txt-secondary dark:text-txt-dark-secondary mt-1 leading-relaxed">{region.prediction}</p>
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <p className="text-xs text-txt-muted dark:text-txt-dark-muted">Top Concern</p>
                          <p className="text-sm font-semibold text-txt dark:text-txt-dark mt-0.5">{region.topConcern}</p>
                        </div>
                        <div>
                          <p className="text-xs text-txt-muted dark:text-txt-dark-muted">Score</p>
                          <p className="text-sm font-bold mt-0.5" style={{ color: c.color }}>{region.riskScore}/100</p>
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
