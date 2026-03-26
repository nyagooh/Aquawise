import { Bell, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  alertCount: number;
}

export default function Header({ alertCount }: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo + Brand */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Uhai WashWise" className="h-10 w-auto" />
          <div className="hidden sm:block">
            <p className="text-xs text-slate-500 leading-none">Water Quality Intelligence</p>
          </div>
        </div>

        {/* Centre — page title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center hidden md:block">
          <h1 className="text-base font-semibold text-slate-800">Water Quality Dashboard</h1>
          <p className="text-xs text-slate-400">
            {time.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            {' · '}
            {time.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-green-500 live-dot" />
            <span className="text-xs font-medium text-green-700">Live</span>
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors">
            <Bell size={18} />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
