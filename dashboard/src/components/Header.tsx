import { Bell, RefreshCw, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  alertCount: number;
}

export default function Header({ alertCount }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 flex items-center px-6 gap-3 flex-shrink-0 border-b border-slate-200/60 dark:border-gray-800/80 bg-white dark:bg-gray-900">
      <div className="flex-1 min-w-0">
        <h1 className="text-[15px] font-bold text-slate-800 dark:text-white truncate">Water Quality Overview</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {time.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          <span className="mx-1.5 text-slate-300 dark:text-gray-700">|</span>
          <span className="font-mono tabular-nums">{time.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </p>
      </div>

      {/* Live badge */}
      <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-full px-3 py-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 live-dot" />
        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Live</span>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      {/* Refresh */}
      <button
        onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1200); }}
        className="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
      </button>

      {/* Notifications */}
      <button className="relative p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-gray-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
        <Bell size={16} />
        {alertCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
            {alertCount}
          </span>
        )}
      </button>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
        UW
      </div>
    </header>
  );
}
