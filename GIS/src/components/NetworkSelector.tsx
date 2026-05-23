import { useRef, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNetwork } from '../context/NetworkContext';
import { api } from '../lib/api';

export function NetworkSelector() {
  const { networks, activeNetwork, setActiveNetwork, isLoading } = useNetwork();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
        setConfirmId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await api.delete(`/networks/${id}/`);
      if (activeNetwork?.id === id) setActiveNetwork(null);
      await queryClient.invalidateQueries({ queryKey: ['networks'] });
    } finally {
      setDeleting(null);
      setConfirmId(null);
    }
  };

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
        onClick={() => { setOpen((o) => !o); setConfirmId(null); }}
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
            <div
              key={n.id}
              className={`network-selector-item${n.id === activeNetwork?.id ? ' active' : ''}`}
            >
              <button
                className="nsi-main"
                onClick={() => { setActiveNetwork(n); setOpen(false); setConfirmId(null); }}
              >
                <div className="nsi-name">{n.name}</div>
                <div className="nsi-meta">
                  {n.total_pipes.toLocaleString()} pipes
                  {n.total_length_km != null && ` · ${n.total_length_km.toFixed(0)} km`}
                </div>
              </button>

              {confirmId === n.id ? (
                <div className="nsi-confirm">
                  <span>Delete?</span>
                  <button
                    className="nsi-confirm-yes"
                    onClick={() => handleDelete(n.id)}
                    disabled={deleting === n.id}
                  >
                    {deleting === n.id ? '…' : 'Yes'}
                  </button>
                  <button className="nsi-confirm-no" onClick={() => setConfirmId(null)}>
                    No
                  </button>
                </div>
              ) : (
                <button
                  className="nsi-delete"
                  title="Delete network"
                  onClick={(e) => { e.stopPropagation(); setConfirmId(n.id); }}
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          <div className="nsi-footer">
            <a href="/demo/upload" className="nsi-upload-link">
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <line x1={12} y1={5} x2={12} y2={19} /><line x1={5} y1={12} x2={19} y2={12} />
              </svg>
              Upload new network
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
