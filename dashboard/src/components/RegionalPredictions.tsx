import { TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { regionPredictions, RegionPrediction } from '../data/mockData';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Props { selectedRegion: string; }

const riskCfg = {
  safe:    { color: '#22C55E', bg: 'rgba(34,197,94,0.06)', label: 'Low Risk' },
  warning: { color: '#EAB308', bg: 'rgba(234,179,8,0.06)', label: 'Medium' },
  danger:  { color: '#EF4444', bg: 'rgba(239,68,68,0.06)', label: 'High Risk' },
};

const trendIcon = {
  rising:  <TrendingUp size={13} className="text-err" />,
  falling: <TrendingDown size={13} className="text-ok" />,
  stable:  <Minus size={13} className="text-txt-muted dark:text-txt-dark-muted" />,
};

function MiniBar({ data }: { data: RegionPrediction['forecastDays'] }) {
  const { theme } = useTheme();
  const dk = theme === 'dark';
  const barColor = (s: number) => s < 25 ? (dk ? '#60A5FA' : '#2563EB') : s < 55 ? '#EAB308' : '#EF4444';

  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: dk ? '#64748B' : '#64748B' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} hide />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 12, border: dk ? '1px solid #1E293B' : '1px solid #E2E8F0', background: dk ? '#131C2E' : '#fff', color: dk ? '#F1F5F9' : '#0F172A' }}
          formatter={(v: any) => [`${v}/100`, 'Risk Score']}
        />
        <Bar dataKey="score" radius={[5, 5, 0, 0]} maxBarSize={18}>
          {data.map((e, i) => <Cell key={i} fill={barColor(e.score)} fillOpacity={0.85} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function RegionalPredictions({ selectedRegion }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const regions = selectedRegion === 'all' ? regionPredictions : regionPredictions.filter(r => r.id === selectedRegion);

  return (
    <div className="card p-7">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-txt dark:text-txt-dark">Water Quality Predictions</h2>
          <p className="text-sm text-txt-muted dark:text-txt-dark-muted mt-0.5">7-day contamination forecast · Kisumu region</p>
        </div>
        <span className="text-sm font-medium text-txt-muted dark:text-txt-dark-muted bg-surface-subtle dark:bg-surface-subtle-dark px-3 py-1.5 rounded-lg">{regions.length} {regions.length === 1 ? 'area' : 'areas'}</span>
      </div>

      <div className="space-y-3">
        {regions.map(region => {
          const c = riskCfg[region.riskLevel];
          const open = expanded === region.id;

          return (
            <div key={region.id} className={`rounded-xl border overflow-hidden transition-all duration-200 ${open ? 'border-primary/20 dark:border-primary-dark/20 shadow-md' : 'border-line dark:border-line-dark'}`}>
              <button
                onClick={() => setExpanded(open ? null : region.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${open ? 'bg-surface-subtle/60 dark:bg-surface-subtle-dark/60' : 'hover:bg-surface-subtle/40 dark:hover:bg-surface-subtle-dark/40'}`}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.color }} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-txt dark:text-txt-dark">{region.region}</p>
                  <p className="text-xs text-txt-muted dark:text-txt-dark-muted truncate mt-0.5">{region.waterBody}</p>
                </div>

                <div className="hidden sm:flex flex-col items-center w-16 flex-shrink-0">
                  <span className="text-xl font-extrabold" style={{ color: c.color }}>{region.contaminationProbability}%</span>
                  <span className="text-2xs text-txt-muted dark:text-txt-dark-muted font-medium">Risk</span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 bg-surface-subtle dark:bg-surface-subtle-dark px-2.5 py-1.5 rounded-lg">
                  {trendIcon[region.nextRisk]}
                  <span className="text-xs font-medium text-txt-secondary dark:text-txt-dark-secondary capitalize">{region.nextRisk}</span>
                </div>

                <span className="text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0" style={{ background: c.bg, color: c.color }}>{c.label}</span>

                <ChevronDown size={18} className={`text-txt-muted dark:text-txt-dark-muted transition-transform duration-300 flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 pb-5 border-t border-line dark:border-line-dark bg-surface-subtle/30 dark:bg-surface-subtle-dark/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                    <div>
                      <p className="text-xs font-semibold text-txt-secondary dark:text-txt-dark-secondary mb-3 uppercase tracking-wide">7-Day Forecast</p>
                      <MiniBar data={region.forecastDays} />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-txt-secondary dark:text-txt-dark-secondary uppercase tracking-wide">Assessment</p>
                        <p className="text-sm text-txt dark:text-txt-dark mt-1.5 leading-relaxed">{region.prediction}</p>
                      </div>
                      <div className="flex gap-8">
                        <div>
                          <p className="text-xs text-txt-muted dark:text-txt-dark-muted">Top Concern</p>
                          <p className="text-sm font-bold text-txt dark:text-txt-dark mt-0.5">{region.topConcern}</p>
                        </div>
                        <div>
                          <p className="text-xs text-txt-muted dark:text-txt-dark-muted">Risk Score</p>
                          <p className="text-sm font-extrabold mt-0.5" style={{ color: c.color }}>{region.riskScore}/100</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
