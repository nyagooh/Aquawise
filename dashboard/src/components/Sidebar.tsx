import { LayoutDashboard, Droplets, MapPin, AlertTriangle, BarChart2, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { icon: LayoutDashboard, label: 'Overview',  active: true  },
  { icon: Droplets,        label: 'Sensors',   active: false },
  { icon: MapPin,          label: 'Stations',  active: false },
  { icon: AlertTriangle,   label: 'Alerts',    active: false },
  { icon: BarChart2,       label: 'Reports',   active: false },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="relative flex flex-col bg-[#0c1e35] text-white transition-all duration-300 flex-shrink-0"
      style={{ width: collapsed ? 64 : 220 }}
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 flex-shrink-0">
        <img src="/logo.png" alt="logo" className="h-8 w-8 object-contain flex-shrink-0" />
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white leading-tight whitespace-nowrap">Uhai WashWise</p>
            <p className="text-[10px] text-blue-300 whitespace-nowrap">Water Intelligence</p>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-hidden">
        {NAV.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              active
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Station status summary */}
      {!collapsed && (
        <div className="mx-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Station Status</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400" /><span className="text-xs text-slate-300">Safe</span></div>
              <span className="text-xs font-bold text-green-400">3</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-xs text-slate-300">Caution</span></div>
              <span className="text-xs font-bold text-amber-400">1</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" /><span className="text-xs text-slate-300">Danger</span></div>
              <span className="text-xs font-bold text-red-400">1</span>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="px-2 pb-4 border-t border-white/10 pt-3">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors">
          <Settings size={18} className="flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-[#0c1e35] border border-white/20 rounded-full p-1 text-slate-400 hover:text-white transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
