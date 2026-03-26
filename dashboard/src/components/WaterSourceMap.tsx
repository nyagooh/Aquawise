import { waterSources } from '../data/mockData';

const cfg = {
  safe:    { color: '#2BB5A0', label: 'Safe',    text: 'text-accent-dark dark:text-accent' },
  warning: { color: '#f59e0b', label: 'Caution', text: 'text-amber-600 dark:text-amber-400' },
  danger:  { color: '#ef4444', label: 'Danger',  text: 'text-red-600 dark:text-red-400' },
};

export default function WaterSourceMap() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Monitoring Stations</h2>
          <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">{waterSources.length} stations active</p>
        </div>
        <div className="flex gap-3">
          {(['safe', 'warning', 'danger'] as const).map(r => {
            const n = waterSources.filter(s => s.risk === r).length;
            return n > 0 ? (
              <div key={r} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: cfg[r].color }} />
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">{n}</span>
              </div>
            ) : null;
          })}
        </div>
      </div>

      <div className="space-y-2">
        {waterSources.map(s => {
          const c = cfg[s.risk];
          return (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70 dark:bg-gray-800/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-colors">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.color, boxShadow: `0 0 0 4px ${c.color}15` }} />
              <p className="flex-1 text-[13px] font-semibold text-gray-700 dark:text-gray-200 truncate">{s.name}</p>
              <span className={`text-[10px] font-bold ${c.text}`}>{c.label}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 w-16 text-right flex-shrink-0">{s.lastUpdated}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
