import { LayoutDashboard, Droplets, MapPin, AlertTriangle, BarChart2, Settings, HelpCircle, LogOut, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

const NAV_MAIN = [
  { icon: LayoutDashboard, label: 'Dashboard',  active: true  },
  { icon: Droplets,        label: 'Sensors',    active: false },
  { icon: MapPin,          label: 'Stations',   active: false },
  { icon: BarChart2,       label: 'Predictions', active: false },
  { icon: AlertTriangle,   label: 'Alerts',     active: false },
];

const NAV_BOTTOM = [
  { icon: Settings,   label: 'Settings' },
  { icon: HelpCircle, label: 'Help' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const w = collapsed ? 68 : 250;

  return (
    <aside
      className="hidden md:flex flex-col flex-shrink-0 h-full border-r transition-all duration-300 ease-in-out bg-white dark:bg-surface-dark border-[#E8ECF1] dark:border-[#21262d]"
      style={{ width: w }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 h-[68px] flex-shrink-0">
        <img src="/logo.png" alt="" className="h-9 w-9 object-contain flex-shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[14px] font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
              Uhai <span className="text-brand">WashWise</span>
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">Water Quality Intelligence</p>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto p-1 rounded-lg text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* ── Menu label ── */}
      {!collapsed && (
        <p className="px-5 pt-5 pb-2 text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-[0.15em]">
          Main Menu
        </p>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 space-y-1 overflow-hidden" style={{ paddingTop: collapsed ? 20 : 0 }}>
        {NAV_MAIN.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            onClick={() => collapsed && setCollapsed(false)}
            className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
              active
                ? 'bg-brand text-white shadow-md shadow-brand/20'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
            {active && !collapsed && (
              <span className="ml-auto text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">Live</span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Bottom nav ── */}
      <div className="px-3 pb-3 space-y-1 border-t border-[#E8ECF1] dark:border-[#21262d] pt-3">
        {NAV_BOTTOM.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Icon size={17} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center py-2 rounded-xl text-gray-300 hover:text-brand transition-colors"
          >
            <ChevronLeft size={16} className="rotate-180" />
          </button>
        )}
      </div>
    </aside>
  );
}
