import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { recentAlerts } from '../data/mockData';

const cfg = {
  safe:    { icon: <CheckCircle size={14} />,   color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'Resolved',  labelBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  warning: { icon: <AlertTriangle size={14} />,  color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20',   label: 'Warning',   labelBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'       },
  danger:  { icon: <XCircle size={14} />,        color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20',       label: 'Critical',  labelBg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'               },
  info:    { icon: <CheckCircle size={14} />,    color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20',     label: 'Info',      labelBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'           },
};

export default function AlertsTable() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Recent Alerts</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Latest warnings from monitoring stations</p>
        </div>
        <button className="text-xs font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
          View all
        </button>
      </div>

      <div className="space-y-2">
        {recentAlerts.map(alert => {
          const c = cfg[alert.risk];
          return (
            <div
              key={alert.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-800/40 transition-colors"
            >
              <div className={`${c.bg} rounded-lg p-2 flex-shrink-0`}>
                <span className={c.color}>{c.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{alert.source}</span>
                  <span className="text-slate-300 dark:text-gray-700">·</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{alert.parameter}</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{alert.value}</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{alert.action}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${c.labelBg} flex-shrink-0`}>
                {c.label}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0 w-16 text-right">{alert.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
