import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { sensors, zones, statusLabel } from '../data';

type TypeFilter = 'all' | 'Pressure' | 'Level' | 'pH';

export default function Sensors() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<TypeFilter>('all');

  const list = sensors.filter(s => filter === 'all' || s.type === filter);
  const counts = {
    total: sensors.length,
    active: sensors.filter(s => s.status !== 'offline').length,
    anomaly: sensors.filter(s => s.status === 'warn' || s.status === 'danger').length,
    offline: sensors.filter(s => s.status === 'offline').length,
    Pressure: sensors.filter(s => s.type === 'Pressure').length,
    Level: sensors.filter(s => s.type === 'Level').length,
    pH: sensors.filter(s => s.type === 'pH').length
  };

  const statusPill = (s: string): string => {
    const map: Record<string, string> = { safe: 'safe', warn: 'warn', danger: 'danger', offline: 'muted' };
    return map[s] || 'muted';
  };

  return (
    <Shell active="sensors" title="Sensors" sub="All deployed sensors · click any row to focus on the GIS map">
      <section className="kpi-grid">
        <div className="kpi kpi-accent">
          <div className="kpi-label">Total sensors</div>
          <div className="kpi-value">{counts.total}</div>
          <div className="kpi-trend flat">Across 5 zones</div>
        </div>
        <div className="kpi kpi-safe">
          <div className="kpi-label">Active</div>
          <div className="kpi-value">{counts.active}</div>
          <div className="kpi-trend up">{Math.round((counts.active / counts.total) * 100)}% uptime</div>
        </div>
        <div className="kpi kpi-warn">
          <div className="kpi-label">Anomalies</div>
          <div className="kpi-value">{counts.anomaly}</div>
          <div className="kpi-trend flat">Pressure deviation</div>
        </div>
        <div className="kpi kpi-danger">
          <div className="kpi-label">Offline</div>
          <div className="kpi-value">{counts.offline}</div>
          <div className="kpi-trend down">PH-03 · 2h</div>
        </div>
      </section>

      <div className="card">
        <div style={{
          display: 'flex', gap: 'var(--s2)',
          padding: 'var(--s3) var(--s5)',
          borderBottom: '1px solid hsl(var(--border))',
          background: 'rgba(255,255,255,0.015)',
          alignItems: 'center'
        }}>
          {(['all', 'Pressure', 'Level', 'pH'] as const).map(t => (
            <button
              key={t}
              className={`btn btn-sm ${filter === t ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(t)}
              style={{ padding: '6px 14px' }}
            >
              {t === 'all' ? 'All' : t}
              {t !== 'all' && (
                <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                  {counts[t]}
                </span>
              )}
              {t === 'all' && (
                <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', color: 'hsl(var(--muted-foreground))', fontSize: '0.75rem' }}>
                  {counts.total}
                </span>
              )}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost btn-sm">Add sensor</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Zone</th>
              <th>Latest reading</th>
              <th>Last updated</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'hsl(var(--muted-foreground))', padding: 30 }}>
                  No sensors of this type.
                </td>
              </tr>
            ) : list.map(s => {
              const z = zones.find(z => z.id === s.zone);
              return (
                <tr key={s.id} onClick={() => navigate(`/gis?focus=sensor:${s.id}`)}>
                  <td className="mono"><strong style={{ color: 'hsl(var(--primary))' }}>{s.id}</strong></td>
                  <td>{s.type}</td>
                  <td>{z?.name || s.zone}</td>
                  <td className="mono"><strong style={{ color: 'hsl(var(--foreground))' }}>{s.reading}</strong></td>
                  <td className="mono">{s.updated}</td>
                  <td><span className={`pill ${statusPill(s.status)}`}><span className="dot" />{statusLabel(s.status)}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={e => { e.stopPropagation(); navigate(`/gis?focus=sensor:${s.id}`); }}
                    >
                      View on map
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
