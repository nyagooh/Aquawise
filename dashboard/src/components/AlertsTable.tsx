import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { recentAlerts } from '../data/mockData';

const riskConfig = {
  safe:    { icon: <CheckCircle size={14} className="text-green-500" />,   bg: 'bg-green-50',  text: 'text-green-700',  label: 'Resolved'  },
  warning: { icon: <AlertTriangle size={14} className="text-amber-500" />, bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Warning'   },
  danger:  { icon: <XCircle size={14} className="text-red-500" />,         bg: 'bg-red-50',    text: 'text-red-700',    label: 'Critical'  },
  info:    { icon: <CheckCircle size={14} className="text-blue-500" />,    bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Info'      },
};

export default function AlertsTable() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-slate-700">Recent Alerts &amp; Incidents</h2>
          <p className="text-xs text-slate-400">Latest warnings from all monitoring stations</p>
        </div>
        <button className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors">
          View all →
        </button>
      </div>

      <div className="space-y-2">
        {recentAlerts.map((alert) => {
          const c = riskConfig[alert.risk];
          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors"
            >
              {/* Icon */}
              <div className={`${c.bg} rounded-lg p-2 flex-shrink-0 mt-0.5`}>
                {c.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-800">{alert.source}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500">{alert.parameter}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs font-semibold text-slate-700">{alert.value}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{alert.action}</p>
              </div>

              {/* Right: badge + time */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                  {c.label}
                </span>
                <span className="text-[10px] text-slate-400">{alert.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
