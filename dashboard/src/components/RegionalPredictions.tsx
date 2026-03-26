import { TrendingUp, TrendingDown, Minus, BrainCircuit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { regionPredictions, RegionPrediction } from '../data/mockData';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const riskCfg = {
  safe:    { color: '#3CBF7A', bg: 'rgba(60,191,122,0.08)',  label: 'Low Risk' },
  warning: { color: '#F4B740', bg: 'rgba(244,183,64,0.08)',  label: 'Medium Risk' },
  danger:  { color: '#E85D5D', bg: 'rgba(232,93,93,0.08)',   label: 'High Risk' },
};

const trendIcon = {
  rising:  <TrendingUp size={12} className="text-err" />,
  falling: <TrendingDown size={12} className="text-ok" />,
  stable:  <Minus size={12} className="text-warn" />,
};

function MiniBar({ data }: { data: RegionPrediction['forecastDays'] }) {
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const barColor = (s: number) => s < 25 ? '#3CBF7A' : s < 55 ? '#F4B740' : '#E85D5D';

  return (
    <ResponsiveContainer width="100%" height={64}>
      <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <XAxis dataKey="day" tick={{ fontSize: 9, fill: dk ? '#6B8796' : '#9BB3C0' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} hide />
        <Tooltip
          contentStyle={{ fontSize: 10, borderRadius: 10, border: dk ? '1px solid #1F2E3A' : '1px solid #E3EEF5', background: dk ? '#121A22' : '#fff', color: dk ? '#E6F1F5' : '#1A2B34' }}
          formatter={(v: any) => [`${v}/100`, 'Risk']}
        />
        <Bar dataKey="score" radius={[3, 3, 0, 0]} maxBarSize={14}>
          {data.map((e, i) => <Cell key={i} fill={barColor(e.score)} fillOpacity={0.75} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function RegionalPredictions() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="rounded-xl p-2.5" style={{ background: 'rgba(15,110,140,0.08)' }}>
          <BrainCircuit size={20} className="text-primary dark:text-primary-dark" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-txt dark:text-txt-dark">AI Water Quality Predictions</h2>
          <p className="text-xs text-txt-muted dark:text-txt-dark-muted">7-day contamination forecast per region</p>
        </div>
      </div>

      <div className="space-y-2">
        {regionPredictions.map(region => {
          const c = riskCfg[region.riskLevel];
          const open = expanded === region.id;

          return (
            <div key={region.id} className="rounded-xl border border-line dark:border-line-dark overflow-hidden">
              <button
                onClick={() => setExpanded(open ? null : region.id)}
                className="w-full flex items-center gap-4 px-4 py-3.5 text-left hover:bg-surface-subtle/50 dark:hover:bg-surface-subtle-dark/50 transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-txt dark:text-txt-dark">{region.region}</p>
                  <p className="text-2xs text-txt-muted dark:text-txt-dark-muted truncate">{region.prediction}</p>
                </div>

                <div className="hidden sm:flex flex-col items-center w-14 flex-shrink-0">
                  <span className="text-md font-extrabold" style={{ color: c.color }}>{region.contaminationProbability}%</span>
                  <span className="text-[8px] text-txt-muted dark:text-txt-dark-muted font-semibold uppercase">Risk</span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {trendIcon[region.nextRisk]}
                  <span className="text-2xs font-bold text-txt-secondary dark:text-txt-dark-secondary capitalize">{region.nextRisk}</span>
                </div>

                <span className="text-2xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0" style={{ background: c.bg, color: c.color }}>{c.label}</span>

                <svg className={`w-4 h-4 text-txt-muted dark:text-txt-dark-muted transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open && (
                <div className="px-4 pb-4 border-t border-line dark:border-line-dark bg-surface-subtle/30 dark:bg-surface-subtle-dark/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-2xs font-semibold text-txt-muted dark:text-txt-dark-muted uppercase tracking-wider mb-2">7-Day Forecast</p>
                      <MiniBar data={region.forecastDays} />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-2xs font-semibold text-txt-muted dark:text-txt-dark-muted uppercase tracking-wider">AI Assessment</p>
                        <p className="text-xs text-txt-secondary dark:text-txt-dark-secondary mt-1 leading-relaxed">{region.prediction}</p>
                      </div>
                      <div className="flex gap-5">
                        <div>
                          <p className="text-2xs text-txt-muted dark:text-txt-dark-muted font-semibold">Top Concern</p>
                          <p className="text-sm font-semibold text-txt dark:text-txt-dark">{region.topConcern}</p>
                        </div>
                        <div>
                          <p className="text-2xs text-txt-muted dark:text-txt-dark-muted font-semibold">Score</p>
                          <p className="text-sm font-bold" style={{ color: c.color }}>{region.riskScore}/100</p>
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
