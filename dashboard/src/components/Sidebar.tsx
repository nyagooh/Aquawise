import { LayoutDashboard, Droplets, MapPin, AlertTriangle, BarChart2, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { waterSources } from '../data/mockData';

const NAV = [
  { icon: LayoutDashboard, label: 'Overview',  active: true  },
  { icon: Droplets,        label: 'Sensors',   active: false },
  { icon: MapPin,          label: 'Stations',  active: false },
  { icon: AlertTriangle,   label: 'Alerts',    active: false },
  { icon: BarChart2,       label: 'Reports',   active: false },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const counts = {
    safe: waterSources.filter(s => s.risk === 'safe').length,
    warning: waterSources.filter(s => s.risk === 'warning').length,
    danger: waterSources.filter(s => s.risk === 'danger').length,
  };

  return (
    <aside
      className="hidden md:flex relative flex-col flex-shrink-0 bg-[#0c1929] transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 68 : 240 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.06] flex-shrink-0">
        <img src="/logo.png" alt="" className="h-9 w-9 object-contain flex-shrink-0 rounded-lg" />
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <p className="text-[13px] font-bold text-white leading-tight tracking-tight">Uhai WashWise</p>
            <p className="text-[10px] text-blue-400/80 font-medium">Water Intelligence</p>
          </div>
        )}
      </div>

      {/* Menu label */}
      {!collapsed && (
        <p className="px-5 pt-5 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Menu</p>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-hidden" style={{ paddingTop: collapsed ? 16 : 0 }}>
        {NAV.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
              active
                ? 'bg-blue-500/15 text-blue-400'
                : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
            }`}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
            {active && !collapsed && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
            )}
          </button>
        ))}
      </nav>

      {/* Station health mini-card */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-3">Station Health</p>
          {[
            { label: 'Safe', count: counts.safe, color: '#34d399' },
            { label: 'Caution', count: counts.warning, color: '#fbbf24' },
            { label: 'Danger', count: counts.danger, color: '#f87171' },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
              <span className="text-xs font-bold" style={{ color: s.color }}>{s.count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Settings */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 transition-all duration-150">
          <Settings size={18} className="flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[#0c1929] border border-white/10 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
