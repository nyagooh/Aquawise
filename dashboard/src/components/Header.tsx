import { Bell, RefreshCw, Sun, Moon, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '../context/NavigationContext';

interface Props { alertCount: number; }

export default function Header({ alertCount }: Props) {
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const { theme, toggle } = useTheme();
  const { setActivePage } = useNavigation();

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  return (
    <header className="h-[64px] flex items-center px-6 gap-3 flex-shrink-0 bg-surface dark:bg-surface-dark border-b border-line dark:border-line-dark">
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-txt dark:text-txt-dark">Welcome back, Admin</h1>
        <div className="flex items-center gap-2 text-xs text-txt-muted dark:text-txt-dark-muted">
          <Calendar size={11} className="text-primary dark:text-primary-dark" />
          <span>{time.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span className="opacity-40">|</span>
          <span className="font-mono tabular-nums">{time.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      </div>

      {/* Live */}
      <div className="hidden sm:flex items-center gap-1.5 bg-ok-soft dark:bg-ok-soft-dark rounded-full px-3 py-1.5">
        <span className="w-2 h-2 rounded-full bg-ok live-dot" />
        <span className="text-2xs font-bold text-ok">Live</span>
      </div>

      <button
        onClick={toggle}
        className="p-2.5 rounded-xl text-txt-muted dark:text-txt-dark-muted hover:bg-surface-subtle dark:hover:bg-surface-subtle-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <button
        onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1200); }}
        className="p-2.5 rounded-xl text-txt-muted dark:text-txt-dark-muted hover:bg-surface-subtle dark:hover:bg-surface-subtle-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
        title="Refresh data"
      >
        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
      </button>

      <button
        onClick={() => setActivePage('alerts')}
        className="relative p-2.5 rounded-xl text-txt-muted dark:text-txt-dark-muted hover:bg-surface-subtle dark:hover:bg-surface-subtle-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
        title="View alerts"
      >
        <Bell size={18} />
        {alertCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-err rounded-full text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-surface dark:ring-surface-dark">{alertCount}</span>
        )}
      </button>

      <div className="flex items-center gap-2.5 pl-3 border-l border-line dark:border-line-dark ml-1">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #0F6E8C, #1CA9C9, #6FE7DD)' }}>
          UW
        </div>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-txt dark:text-txt-dark leading-tight">Admin</p>
          <p className="text-2xs text-txt-muted dark:text-txt-dark-muted">Operator</p>
        </div>
      </div>
    </header>
  );
}
