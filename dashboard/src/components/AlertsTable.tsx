import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { recentAlerts } from '../data/mockData';

const cfg = {
  safe:    { icon: <CheckCircle size={14} />, color: 'text-emerald-500', bg: 'bg-emerald-500/8 dark:bg-emerald-500/15', lbl: 'Resolved',  lblBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  warning: { icon: <AlertTriangle size={14} />, color: 'text-amber-500', bg: 'bg-amber-500/8 dark:bg-amber-500/15', lbl: 'Warning',  lblBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400' },
  danger:  { icon: <XCircle size={14} />,       color: 'text-red-500',   bg: 'bg-red-500/8 dark:bg-red-500/15',   lbl: 'Critical', lblBg: 'bg-red-500/10 text-red-700 dark:text-red-400' },
  info:    { icon: <CheckCircle size={14} />,    color: 'text-blue-500',  bg: 'bg-blue-500/8 dark:bg-blue-500/15', lbl: 'Info',     lblBg: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
};

export default function AlertsTable() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">Recent Alerts</h2>
          <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">Latest warnings from monitoring stations</p>
        </div>
        <button className="text-[12px] font-bold text-brand hover:text-brand-dark transition-colors">View all</button>
      </div>

      <div className="space-y-2">
        {recentAlerts.map(a => {
          const c = cfg[a.risk];
          return (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
              <div className={`${c.bg} rounded-lg p-2 flex-shrink-0`}><span className={c.color}>{c.icon}</span></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-gray-800 dark:text-gray-200">{a.source}</span>
                  <span className="text-gray-300 dark:text-gray-700">·</span>
                  <span className="text-[12px] text-gray-500 dark:text-gray-400">{a.parameter}</span>
                  <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-300">{a.value}</span>
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{a.action}</p>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${c.lblBg} flex-shrink-0`}>{c.lbl}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 w-16 text-right">{a.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
