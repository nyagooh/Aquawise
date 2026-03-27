import { AlertTriangle, CheckCircle, XCircle, ArrowUpRight } from 'lucide-react';
import { recentAlerts } from '../data/mockData';
import { useState } from 'react';

const cfg = {
  safe:    { icon: <CheckCircle size={14} />, color: '#3CBF7A', bg: 'rgba(60,191,122,0.08)',  label: 'Resolved' },
  warning: { icon: <AlertTriangle size={14} />, color: '#F4B740', bg: 'rgba(244,183,64,0.08)', label: 'Warning' },
  danger:  { icon: <XCircle size={14} />,       color: '#E85D5D', bg: 'rgba(232,93,93,0.08)',  label: 'Critical' },
  info:    { icon: <CheckCircle size={14} />,    color: '#0F6E8C', bg: 'rgba(15,110,140,0.08)', label: 'Info' },
};

type Filter = 'all' | 'danger' | 'warning' | 'safe';

export default function AlertsTable() {
  const [filter, setFilter] = useState<Filter>('all');
  const [showAll, setShowAll] = useState(false);

  const filtered = filter === 'all' ? recentAlerts : recentAlerts.filter(a => a.risk === filter);
  const displayed = showAll ? filtered : filtered.slice(0, 4);

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'danger', label: 'Critical' },
    { key: 'warning', label: 'Warning' },
    { key: 'safe', label: 'Resolved' },
  ];

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(15,110,140,0.08)' }}>
            <AlertTriangle size={18} className="text-primary dark:text-primary-dark" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-txt dark:text-txt-dark">Recent Alerts</h2>
            <p className="text-xs text-txt-muted dark:text-txt-dark-muted mt-0.5">{recentAlerts.length} alerts from stations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex gap-1">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => { setFilter(f.key); setShowAll(false); }}
                className={`px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all ${
                  filter === f.key
                    ? 'bg-primary dark:bg-primary-dark text-white'
                    : 'text-txt-muted dark:text-txt-dark-muted hover:bg-surface-subtle dark:hover:bg-surface-subtle-dark hover:text-txt-secondary dark:hover:text-txt-dark-secondary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {displayed.map(a => {
          const c = cfg[a.risk];
          return (
            <div key={a.id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-subtle/50 dark:hover:bg-surface-subtle-dark/50 transition-colors cursor-pointer group">
              <div className="rounded-lg p-2 flex-shrink-0" style={{ background: c.bg }}>
                <span style={{ color: c.color }}>{c.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-txt dark:text-txt-dark">{a.source}</span>
                  <span className="text-txt-muted dark:text-txt-dark-muted opacity-40">|</span>
                  <span className="text-xs text-txt-secondary dark:text-txt-dark-secondary">{a.parameter}</span>
                  <span className="text-xs font-semibold text-txt dark:text-txt-dark">{a.value}</span>
                </div>
                <p className="text-2xs text-txt-muted dark:text-txt-dark-muted mt-0.5 truncate">{a.action}</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0" style={{ background: c.bg, color: c.color }}>{c.label}</span>
              <span className="text-2xs text-txt-muted dark:text-txt-dark-muted flex-shrink-0 w-16 text-right">{a.time}</span>
              <ArrowUpRight size={12} className="text-txt-muted dark:text-txt-dark-muted opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
            </div>
          );
        })}
      </div>

      {filtered.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2.5 text-xs font-bold text-primary dark:text-primary-dark hover:text-primary-hover dark:hover:text-primary-dark-hover rounded-xl hover:bg-surface-subtle dark:hover:bg-surface-subtle-dark transition-colors"
        >
          {showAll ? 'Show less' : `View all ${filtered.length} alerts`}
        </button>
      )}
    </div>
  );
}
