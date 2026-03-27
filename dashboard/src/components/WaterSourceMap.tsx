import { waterSources } from '../data/mockData';
import { ArrowUpRight } from 'lucide-react';

const cfg = {
  safe:    { color: '#3CBF7A', label: 'Safe' },
  warning: { color: '#F4B740', label: 'Caution' },
  danger:  { color: '#E85D5D', label: 'Danger' },
};

export default function WaterSourceMap() {
  return (
    <div className="card p-7">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-txt dark:text-txt-dark">Monitoring Stations</h2>
            <ArrowUpRight size={14} className="text-txt-muted dark:text-txt-dark-muted" />
          </div>
          <p className="text-xs text-txt-muted dark:text-txt-dark-muted mt-0.5">{waterSources.length} stations active</p>
        </div>
        <div className="flex gap-4">
          {(['safe', 'warning', 'danger'] as const).map(r => {
            const n = waterSources.filter(s => s.risk === r).length;
            return n ? (
              <div key={r} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: cfg[r].color }} />
                <span className="text-xs font-medium text-txt-secondary dark:text-txt-dark-secondary">{n}</span>
              </div>
            ) : null;
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        {waterSources.map(s => {
          const c = cfg[s.risk];
          return (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-surface-subtle/50 dark:bg-surface-subtle-dark/50 hover:bg-surface-subtle dark:hover:bg-surface-subtle-dark transition-colors">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
              <p className="flex-1 text-sm font-medium text-txt dark:text-txt-dark truncate">{s.name}</p>
              <span className="text-xs font-semibold" style={{ color: c.color }}>{c.label}</span>
              <span className="text-xs text-txt-muted dark:text-txt-dark-muted w-20 text-right flex-shrink-0">{s.lastUpdated}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
