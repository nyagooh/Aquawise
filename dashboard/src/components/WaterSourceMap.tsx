import { MapPin, ArrowUpRight } from 'lucide-react';
import { waterSources } from '../data/mockData';
import { useState } from 'react';

const cfg = {
  safe:    { color: '#3CBF7A', label: 'Safe' },
  warning: { color: '#F4B740', label: 'Caution' },
  danger:  { color: '#E85D5D', label: 'Danger' },
};

export default function WaterSourceMap() {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl p-2.5" style={{ background: 'rgba(15,110,140,0.08)' }}>
            <MapPin size={18} className="text-primary dark:text-primary-dark" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-txt dark:text-txt-dark">Monitoring Stations</h2>
            <p className="text-xs text-txt-muted dark:text-txt-dark-muted mt-0.5">{waterSources.length} stations active</p>
          </div>
        </div>
        <div className="flex gap-3">
          {(['safe', 'warning', 'danger'] as const).map(r => {
            const n = waterSources.filter(s => s.risk === r).length;
            return n ? <div key={r} className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: cfg[r].color }} /><span className="text-2xs font-semibold text-txt-secondary dark:text-txt-dark-secondary">{n}</span></div> : null;
          })}
        </div>
      </div>

      <div className="space-y-2">
        {waterSources.map(s => {
          const c = cfg[s.risk];
          const isSelected = selectedStation === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedStation(isSelected ? null : s.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 text-left group ${
                isSelected
                  ? 'bg-primary/5 dark:bg-primary-dark/10 ring-1 ring-primary/20 dark:ring-primary-dark/20'
                  : 'bg-surface-subtle/60 dark:bg-surface-subtle-dark/60 hover:bg-surface-subtle dark:hover:bg-surface-subtle-dark'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
              <p className="flex-1 text-sm font-semibold text-txt dark:text-txt-dark truncate">{s.name}</p>
              <span className="text-2xs font-bold" style={{ color: c.color }}>{c.label}</span>
              <span className="text-2xs text-txt-muted dark:text-txt-dark-muted w-16 text-right flex-shrink-0">{s.lastUpdated}</span>
              <ArrowUpRight size={12} className="text-txt-muted dark:text-txt-dark-muted opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
