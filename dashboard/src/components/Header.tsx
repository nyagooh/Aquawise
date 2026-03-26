import { Bell, RefreshCw, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Props { alertCount: number; }

export default function Header({ alertCount }: Props) {
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  return (
    <header className="h-[64px] flex items-center px-6 gap-3 flex-shrink-0 bg-surface dark:bg-surface-dark border-b border-line dark:border-line-dark">
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-txt dark:text-txt-dark">Dashboard</h1>
        <p className="text-xs text-txt-muted dark:text-txt-dark-muted">
          {time.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          <span className="mx-1.5 opacity-40">|</span>
          <span className="font-mono tabular-nums">{time.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </p>
      </div>

      {/* Live */}
      <div className="hidden sm:flex items-center gap-1.5 bg-ok-soft dark:bg-ok-soft-dark rounded-full px-3 py-1.5">
        <span className="w-2 h-2 rounded-full bg-ok live-dot" />
        <span className="text-2xs font-bold text-ok">Live</span>
      </div>

      <button onClick={toggle} className="p-2.5 rounded-xl text-txt-muted dark:text-txt-dark-muted hover:bg-surface-subtle dark:hover:bg-surface-subtle-dark hover:text-txt-secondary dark:hover:text-txt-dark-secondary transition-colors">
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <button onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1200); }} className="p-2.5 rounded-xl text-txt-muted dark:text-txt-dark-muted hover:bg-surface-subtle dark:hover:bg-surface-subtle-dark transition-colors">
        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
      </button>

      <button className="relative p-2.5 rounded-xl text-txt-muted dark:text-txt-dark-muted hover:bg-surface-subtle dark:hover:bg-surface-subtle-dark transition-colors">
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
