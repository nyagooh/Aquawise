import { Bell, RefreshCw, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Props { alertCount: number; }

export default function Header({ alertCount }: Props) {
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="h-[68px] flex items-center px-6 gap-3 flex-shrink-0 bg-white dark:bg-surface-dark border-b border-[#E8ECF1] dark:border-[#21262d]">
      {/* Left: welcome */}
      <div className="flex-1 min-w-0">
        <h1 className="text-[16px] font-bold text-gray-900 dark:text-white">
          Welcome back <span className="text-brand">Admin</span>
        </h1>
        <p className="text-[12px] text-gray-400 dark:text-gray-500">
          {time.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          <span className="mx-1.5 opacity-30">|</span>
          <span className="font-mono tabular-nums">{time.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </p>
      </div>

      {/* Live badge */}
      <div className="hidden sm:flex items-center gap-1.5 bg-accent-light dark:bg-accent/10 border border-accent/20 rounded-full px-3 py-1.5">
        <span className="w-2 h-2 rounded-full bg-accent live-dot" />
        <span className="text-[11px] font-bold text-accent-dark dark:text-accent">Live</span>
      </div>

      {/* Theme */}
      <button onClick={toggle} className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      {/* Refresh */}
      <button onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1200); }} className="p-2.5 rounded-xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
        <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
      </button>

      {/* Bell */}
      <button className="relative p-2.5 rounded-xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
        <Bell size={18} />
        {alertCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-surface-dark">
            {alertCount}
          </span>
        )}
      </button>

      {/* Avatar */}
      <div className="flex items-center gap-2.5 pl-2 border-l border-[#E8ECF1] dark:border-[#21262d] ml-1">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center text-white text-xs font-bold shadow-sm">
          UW
        </div>
        <div className="hidden lg:block">
          <p className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 leading-tight">Admin</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500">Operator</p>
        </div>
      </div>
    </header>
  );
}
