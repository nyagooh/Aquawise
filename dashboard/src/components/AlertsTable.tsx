import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { recentAlerts } from '../data/mockData';

const cfg = {
  safe:    { icon: <CheckCircle size={14} />, color: '#3CBF7A', bg: 'rgba(60,191,122,0.08)',  label: 'Resolved' },
  warning: { icon: <AlertTriangle size={14} />, color: '#F4B740', bg: 'rgba(244,183,64,0.08)', label: 'Warning' },
  danger:  { icon: <XCircle size={14} />,       color: '#E85D5D', bg: 'rgba(232,93,93,0.08)',  label: 'Critical' },
  info:    { icon: <CheckCircle size={14} />,    color: '#0F6E8C', bg: 'rgba(15,110,140,0.08)', label: 'Info' },
};

export default function AlertsTable() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-txt dark:text-txt-dark">Recent Alerts</h2>
          <p className="text-xs text-txt-muted dark:text-txt-dark-muted mt-0.5">Latest warnings from stations</p>
        </div>
        <button className="text-xs font-bold text-primary dark:text-primary-dark hover:text-primary-hover dark:hover:text-primary-dark-hover transition-colors">View all</button>
      </div>

      <div className="space-y-2">
        {recentAlerts.map(a => {
          const c = cfg[a.risk];
          return (
            <div key={a.id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-subtle/50 dark:hover:bg-surface-subtle-dark/50 transition-colors">
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
