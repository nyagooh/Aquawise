import { useState } from 'react';
import { MapPin, Radio } from 'lucide-react';
import { WaterSource, waterSources } from '../data/mockData';

const riskStyle = {
  safe:    { pin: '#22c55e', glow: '#bbf7d0', label: 'Safe',    text: 'text-green-600'  },
  warning: { pin: '#f59e0b', glow: '#fde68a', label: 'Caution', text: 'text-amber-600'  },
  danger:  { pin: '#ef4444', glow: '#fecaca', label: 'Danger',  text: 'text-red-600'    },
};

export default function WaterSourceMap() {
  const [hovered, setHovered] = useState<WaterSource | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-700">Monitoring Stations</h2>
          <p className="text-xs text-slate-400">Nairobi region · {waterSources.length} active stations</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
          <Radio size={12} className="live-dot" />
          Live
        </div>
      </div>

      {/* Map */}
      <div
        className="relative rounded-xl overflow-hidden border border-slate-100"
        style={{
          height: 220,
          background: 'linear-gradient(135deg, #e0f2fe 0%, #e6fff9 50%, #dbeafe 100%)',
        }}
      >
        {/* Subtle grid */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          {[20, 40, 60, 80].map(v => (
            <g key={v}>
              <line x1="0" y1={`${v}%`} x2="100%" y2={`${v}%`} stroke="#93c5fd" strokeWidth="0.5" strokeDasharray="4 6" />
              <line x1={`${v}%`} y1="0" x2={`${v}%`} y2="100%" stroke="#93c5fd" strokeWidth="0.5" strokeDasharray="4 6" />
            </g>
          ))}
        </svg>

        <span className="absolute top-2 left-3 text-[9px] font-bold text-blue-400 tracking-widest uppercase">Nairobi Region</span>

        {/* Pins */}
        {waterSources.map(source => {
          const s = riskStyle[source.risk];
          const isHovered = hovered?.id === source.id;

          return (
            <div
              key={source.id}
              className="absolute cursor-pointer"
              style={{
                left: `${source.x}%`,
                top: `${source.y}%`,
                transform: 'translate(-50%, -100%)',
              }}
              onMouseEnter={() => setHovered(source)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Pulse ring for non-safe */}
              {source.risk !== 'safe' && (
                <span
                  className="absolute rounded-full live-dot"
                  style={{
                    width: 26, height: 26,
                    background: s.glow,
                    opacity: 0.5,
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              )}
              <MapPin
                size={22}
                fill={s.pin}
                color="#fff"
                strokeWidth={1.5}
                className={`drop-shadow-sm transition-transform duration-150 ${isHovered ? 'scale-125' : ''}`}
              />

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute z-20 bottom-full mb-2 left-1/2 -translate-x-1/2 w-44 bg-white rounded-xl shadow-2xl border border-slate-100 p-3 pointer-events-none">
                  <p className="text-xs font-bold text-slate-800 leading-tight mb-0.5">{source.name}</p>
                  <p className="text-[10px] text-slate-500 mb-2">{source.location}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold ${s.text}`}>{s.label}</span>
                    <span className="text-[10px] text-slate-400">{source.lastUpdated}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Station list */}
      <div className="mt-3 space-y-1.5">
        {waterSources.map(source => {
          const s = riskStyle[source.risk];
          return (
            <div key={source.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.pin }} />
                <span className="text-xs font-medium text-slate-700">{source.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold ${s.text}`}>{s.label}</span>
                <span className="text-[10px] text-slate-400">{source.lastUpdated}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
