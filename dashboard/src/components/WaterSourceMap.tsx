import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { WaterSource, waterSources } from '../data/mockData';

const riskStyle = {
  safe:    { pin: '#22c55e', ring: '#bbf7d0', bg: 'bg-green-50',  text: 'text-green-700',  label: 'Safe'    },
  warning: { pin: '#f59e0b', ring: '#fde68a', bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Caution' },
  danger:  { pin: '#ef4444', ring: '#fecaca', bg: 'bg-red-50',    text: 'text-red-700',    label: 'Danger'  },
};

export default function WaterSourceMap() {
  const [hovered, setHovered] = useState<WaterSource | null>(null);

  const counts = {
    safe:    waterSources.filter(s => s.risk === 'safe').length,
    warning: waterSources.filter(s => s.risk === 'warning').length,
    danger:  waterSources.filter(s => s.risk === 'danger').length,
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">Monitoring Stations</h2>
        <div className="flex gap-2 text-xs font-semibold">
          <span className="badge-safe">{counts.safe} Safe</span>
          {counts.warning > 0 && <span className="badge-warning">{counts.warning} Caution</span>}
          {counts.danger  > 0 && <span className="badge-danger">{counts.danger} Danger</span>}
        </div>
      </div>

      {/* Map area — stylised SVG Kenya outline */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-100" style={{ height: 260 }}>
        {/* Grid lines (decorative) */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          {[20,40,60,80].map(y => <line key={y} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4 4" />)}
          {[20,40,60,80].map(x => <line key={x} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4 4" />)}
        </svg>

        {/* Location label */}
        <div className="absolute top-2 left-3 text-[10px] text-blue-400 font-semibold tracking-wide">NAIROBI REGION</div>

        {/* Station pins */}
        {waterSources.map(source => {
          const s = riskStyle[source.risk];
          const isHovered = hovered?.id === source.id;
          return (
            <div
              key={source.id}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-full"
              style={{ left: `${source.x}%`, top: `${source.y}%` }}
              onMouseEnter={() => setHovered(source)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Pulse ring */}
              {source.risk !== 'safe' && (
                <span
                  className="absolute inline-flex rounded-full opacity-40 live-dot"
                  style={{
                    width: 24, height: 24,
                    background: s.ring,
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              )}
              <MapPin
                size={24}
                fill={s.pin}
                color={s.pin}
                className={`drop-shadow transition-transform duration-200 ${isHovered ? 'scale-125' : ''}`}
              />

              {/* Tooltip popup */}
              {isHovered && (
                <div className={`absolute z-10 bottom-full mb-2 left-1/2 -translate-x-1/2 w-44 rounded-xl shadow-xl border border-slate-100 p-3 bg-white`}>
                  <p className="font-semibold text-xs text-slate-800 mb-0.5">{source.name}</p>
                  <p className="text-[10px] text-slate-500 mb-1.5">{source.location}</p>
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

      {/* Legend */}
      <div className="flex gap-4 mt-3 flex-wrap">
        {(['safe','warning','danger'] as const).map(r => (
          <div key={r} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: riskStyle[r].pin }} />
            <span className="text-xs text-slate-500 capitalize">{riskStyle[r].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
