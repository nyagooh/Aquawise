import { useRef, useState, useEffect } from 'react';
import { useNetwork } from '../context/NetworkContext';

export function NetworkSelector() {
  const { networks, activeNetwork, setActiveNetwork, isLoading } = useNetwork();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (isLoading) {
    return <div className="network-selector network-selector--loading">Loading networks…</div>;
  }

  if (networks.length === 0) {
    return null;
  }

  return (
    <div className="network-selector" ref={ref}>
      <button
        className="network-selector-trigger"
        onClick={() => setOpen((o) => !o)}
        title="Switch active network"
      >
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx={12} cy={12} r={10} />
          <line x1={2} y1={12} x2={22} y2={12} />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="network-selector-name">
          {activeNetwork ? activeNetwork.name : 'Select network'}
        </span>
        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points={open ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
        </svg>
      </button>

      {open && (
        <div className="network-selector-menu">
          {networks.map((n) => (
            <button
              key={n.id}
              className={`network-selector-item${n.id === activeNetwork?.id ? ' active' : ''}`}
              onClick={() => { setActiveNetwork(n); setOpen(false); }}
            >
              <div className="nsi-name">{n.name}</div>
              <div className="nsi-meta">
                {n.total_pipes.toLocaleString()} pipes
                {n.total_length_km != null && ` · ${n.total_length_km.toFixed(0)} km`}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
