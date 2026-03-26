import { Bell, RefreshCw, Search } from 'lucide-react';
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

  return (
    <header className="bg-white border-b border-slate-100 h-16 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-base font-bold text-slate-800">Water Quality Overview</h1>
        <p className="text-xs text-slate-400">
          {time.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          {' · '}
          <span className="font-mono">{time.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </p>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-52">
        <Search size={14} className="text-slate-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search stations..."
          className="bg-transparent text-xs text-slate-600 placeholder-slate-400 outline-none w-full"
        />
      </div>

      {/* Live badge */}
      <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
        <span className="w-2 h-2 rounded-full bg-green-500 live-dot" />
        <span className="text-xs font-semibold text-green-700">Live</span>
      </div>

      {/* Refresh */}
      <button
        onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1200); }}
        className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
      >
        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
      </button>

      {/* Notifications */}
      <button className="relative p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors">
        <Bell size={16} />
        {alertCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center">
            {alertCount}
          </span>
        )}
      </button>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        UW
      </div>
    </header>
  );
}
