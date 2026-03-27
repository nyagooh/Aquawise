import { Bell, RefreshCw, Sun, Moon, Search } from 'lucide-react';
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
    <header className="h-[72px] flex items-center px-8 gap-4 flex-shrink-0" style={{ background: theme === 'dark' ? '#080D12' : '#EDF3F8' }}>
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-txt dark:text-txt-dark">Welcome back, Admin!</h1>
        <p className="text-xs text-txt-muted dark:text-txt-dark-muted mt-0.5">
          {time.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          <span className="mx-2 opacity-30">·</span>
          <span className="font-mono tabular-nums">{time.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</span>
        </p>
      </div>

      {/* Search */}
      <div className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-surface dark:bg-surface-dark border border-line dark:border-line-dark text-txt-muted dark:text-txt-dark-muted w-56">
        <Search size={15} />
        <span className="text-sm">Search...</span>
      </div>

      <button
        onClick={toggle}
        className="p-2.5 rounded-2xl bg-surface dark:bg-surface-dark border border-line dark:border-line-dark text-txt-secondary dark:text-txt-dark-secondary hover:text-primary dark:hover:text-primary-dark transition-colors"
      >
        {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
      </button>

      <button
        onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1200); }}
        className="p-2.5 rounded-2xl bg-surface dark:bg-surface-dark border border-line dark:border-line-dark text-txt-secondary dark:text-txt-dark-secondary hover:text-primary dark:hover:text-primary-dark transition-colors"
      >
        <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
      </button>

      <button
        onClick={() => setActivePage('alerts')}
        className="relative p-2.5 rounded-2xl bg-surface dark:bg-surface-dark border border-line dark:border-line-dark text-txt-secondary dark:text-txt-dark-secondary hover:text-primary dark:hover:text-primary-dark transition-colors"
      >
        <Bell size={17} />
        {alertCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-err rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-bg dark:ring-bg-dark">{alertCount}</span>
        )}
      </button>

      <div className="flex items-center gap-3 pl-4 border-l border-line dark:border-line-dark ml-1">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #0F6E8C, #1CA9C9)' }}>
          A
        </div>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-txt dark:text-txt-dark leading-tight">Admin</p>
          <p className="text-xs text-txt-muted dark:text-txt-dark-muted">admin@washwise.io</p>
        </div>
      </div>
    </header>
  );
}
