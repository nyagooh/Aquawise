import { waterSources } from '../data/mockData';

const riskCfg = {
  safe:    { dot: 'bg-emerald-400', ring: 'ring-emerald-400/20', label: 'Safe',    text: 'text-emerald-600 dark:text-emerald-400', barBg: 'bg-emerald-500' },
  warning: { dot: 'bg-amber-400',   ring: 'ring-amber-400/20',   label: 'Caution', text: 'text-amber-600 dark:text-amber-400',     barBg: 'bg-amber-500'   },
  danger:  { dot: 'bg-red-400',     ring: 'ring-red-400/20',     label: 'Danger',  text: 'text-red-600 dark:text-red-400',         barBg: 'bg-red-500'     },
};

export default function WaterSourceMap() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Monitoring Stations</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{waterSources.length} active stations</p>
        </div>
        <div className="flex items-center gap-3">
          {(['safe', 'warning', 'danger'] as const).map(r => {
            const count = waterSources.filter(s => s.risk === r).length;
            if (!count) return null;
            return (
              <div key={r} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${riskCfg[r].dot}`} />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Station list */}
      <div className="space-y-2">
        {waterSources.map(source => {
          const c = riskCfg[source.risk];
          return (
            <div
              key={source.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 dark:bg-gray-800/40 hover:bg-slate-100 dark:hover:bg-gray-800/70 transition-colors"
            >
              {/* Status dot with ring */}
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ring-4 ${c.dot} ${c.ring}`} />

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">
                  {source.name}
                </p>
              </div>

              {/* Status label */}
              <span className={`text-[11px] font-bold ${c.text}`}>
                {c.label}
              </span>

              {/* Updated time */}
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0 w-16 text-right">
                {source.lastUpdated}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
