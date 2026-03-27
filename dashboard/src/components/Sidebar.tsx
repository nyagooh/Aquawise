import { LayoutDashboard, Droplets, MapPin, AlertTriangle, BarChart2, Settings, HelpCircle, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigation, Page } from '../context/NavigationContext';

const NAV: { icon: typeof LayoutDashboard; label: string; page: Page }[] = [
  { icon: LayoutDashboard, label: 'Dashboard',   page: 'dashboard' },
  { icon: Droplets,        label: 'Sensors',     page: 'sensors' },
  { icon: MapPin,          label: 'Stations',    page: 'stations' },
  { icon: BarChart2,       label: 'Predictions', page: 'predictions' },
  { icon: AlertTriangle,   label: 'Alerts',      page: 'alerts' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { activePage, setActivePage } = useNavigation();

  return (
    <aside
      className="hidden md:flex flex-col flex-shrink-0 h-full border-r border-line dark:border-line-dark bg-surface dark:bg-surface-dark transition-all duration-300"
      style={{ width: collapsed ? 68 : 240 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[64px] flex-shrink-0 border-b border-line dark:border-line-dark">
        <img src="/logo.png" alt="" className="h-8 w-8 object-contain flex-shrink-0" />
        {!collapsed && (
          <p className="text-md font-extrabold text-txt dark:text-txt-dark leading-tight tracking-tight">
            Uhai <span className="text-primary dark:text-primary-dark">WashWise</span>
          </p>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="ml-auto p-1 rounded-lg text-txt-muted hover:text-txt-secondary dark:text-txt-dark-muted dark:hover:text-txt-dark-secondary transition-colors">
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {!collapsed && (
        <p className="px-5 pt-6 pb-2 text-2xs font-semibold text-txt-muted dark:text-txt-dark-muted uppercase tracking-[0.12em]">Menu</p>
      )}

      <nav className="flex-1 px-3 space-y-1" style={{ paddingTop: collapsed ? 20 : 0 }}>
        {NAV.map(({ icon: Icon, label, page }) => {
          const active = activePage === page;
          return (
            <button
              key={page}
              onClick={() => {
                if (collapsed) setCollapsed(false);
                setActivePage(page);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                active
                  ? 'bg-primary text-white dark:bg-primary-dark dark:text-white shadow-md shadow-primary/15 dark:shadow-primary-dark/15'
                  : 'text-txt-secondary dark:text-txt-dark-secondary hover:bg-surface-subtle dark:hover:bg-surface-subtle-dark hover:text-txt dark:hover:text-txt-dark'
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4 pt-3 border-t border-line dark:border-line-dark space-y-1">
        {[{ icon: Settings, label: 'Settings' }, { icon: HelpCircle, label: 'Help' }].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-txt-muted dark:text-txt-dark-muted hover:bg-surface-subtle dark:hover:bg-surface-subtle-dark hover:text-txt-secondary dark:hover:text-txt-dark-secondary transition-colors"
          >
            <Icon size={17} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="w-full flex items-center justify-center py-2 text-txt-muted hover:text-primary dark:hover:text-primary-dark transition-colors">
            <ChevronLeft size={16} className="rotate-180" />
          </button>
        )}
      </div>
    </aside>
  );
}
