import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { recentAlerts } from '../data/mockData';

const riskIcon = {
  safe:    <CheckCircle size={14} className="text-green-500" />,
  warning: <AlertTriangle size={14} className="text-amber-500" />,
  danger:  <XCircle size={14} className="text-red-500" />,
  info:    <Info size={14} className="text-blue-500" />,
};

const riskBadge = {
  safe:    'badge-safe',
  warning: 'badge-warning',
  danger:  'badge-danger',
  info:    'badge-info',
};

export default function AlertsTable() {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">Recent Alerts &amp; Incidents</h2>
        <button className="text-xs text-blue-500 hover:text-blue-700 font-semibold transition-colors">
          View all →
        </button>
      </div>

      {/* Mobile cards / Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-slate-100">
              <th className="pb-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide w-24">Time</th>
              <th className="pb-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Station</th>
              <th className="pb-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Parameter</th>
              <th className="pb-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Reading</th>
              <th className="pb-2 pr-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
              <th className="pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Action Taken</th>
            </tr>
          </thead>
          <tbody>
            {recentAlerts.map((alert) => (
              <tr key={alert.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-3 pr-4 text-xs text-slate-400 whitespace-nowrap">{alert.time}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5">
                    {riskIcon[alert.risk]}
                    <span className="text-xs font-medium text-slate-700">{alert.source}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-xs text-slate-600">{alert.parameter}</td>
                <td className="py-3 pr-4 text-xs font-semibold text-slate-800">{alert.value}</td>
                <td className="py-3 pr-4">
                  <span className={riskBadge[alert.risk] as string}>
                    {alert.risk.charAt(0).toUpperCase() + alert.risk.slice(1)}
                  </span>
                </td>
                <td className="py-3 text-xs text-slate-500">{alert.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden space-y-2">
        {recentAlerts.map(alert => (
          <div key={alert.id} className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                {riskIcon[alert.risk]}
                <span className="text-xs font-semibold text-slate-700">{alert.source}</span>
              </div>
              <span className={riskBadge[alert.risk] as string}>
                {alert.risk.charAt(0).toUpperCase() + alert.risk.slice(1)}
              </span>
            </div>
            <p className="text-xs text-slate-600"><strong>{alert.parameter}</strong> · {alert.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{alert.time} · {alert.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
