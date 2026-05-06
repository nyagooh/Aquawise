import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { alerts, zones } from '../data';

type Filter = 'all' | 'active' | 'resolved' | 'critical';

export default function Alerts() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');

  const active = alerts.filter(a => a.status === 'active');
  const stats = {
    crit: active.filter(a => a.severity === 'critical').length,
    warn: active.filter(a => a.severity === 'warning').length,
    info: active.filter(a => a.severity === 'info').length,
    resolved: alerts.filter(a => a.status === 'resolved').length
  };

  const list = alerts.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'active') return a.status === 'active';
    if (filter === 'resolved') return a.status === 'resolved';
    if (filter === 'critical') return a.severity === 'critical';
    return true;
  });

  const sevColor = (s: string) =>
    s === 'critical' ? 'hsl(var(--danger))' : s === 'warning' ? 'hsl(var(--warning))' : 'hsl(var(--primary))';

  return (
    <Shell active="alerts" title="Alerts" sub="Network alarms · click any row to focus on the GIS map">
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s4)' }}>
        <StatTile tone="crit"  label="Critical"          value={stats.crit}     sub="Immediate action required" />
        <StatTile tone="warn"  label="Warning"           value={stats.warn}     sub="Monitor closely" />
        <StatTile tone="info"  label="Info"              value={stats.info}     sub="Informational" />
        <StatTile tone="muted" label="Resolved (today)"  value={stats.resolved} sub="Closed by operator" />
      </section>

      <div className="card">
        <div style={{
          display: 'flex', gap: 'var(--s2)',
          padding: 'var(--s3) var(--s5)',
          borderBottom: '1px solid hsl(var(--border))',
          background: 'rgba(255,255,255,0.015)',
          alignItems: 'center'
        }}>
          {(['all', 'active', 'resolved', 'critical'] as const).map(f => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 14px', textTransform: 'capitalize' }}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost btn-sm">Export CSV</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Type</th>
              <th>Zone</th>
              <th>Sensor</th>
              <th>Time</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'hsl(var(--muted-foreground))', padding: 30 }}>
                No alerts match this filter.
              </td></tr>
            ) : list.map(a => {
              const z = zones.find(z => z.id === a.zone);
              return (
                <tr key={a.id} onClick={() => navigate(`/gis?focus=zone:${a.zone}`)}>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: sevColor(a.severity), fontWeight: 600, textTransform: 'capitalize' }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'currentColor',
                        boxShadow: '0 0 8px currentColor'
                      }} />
                      {a.severity}
                    </span>
                  </td>
                  <td>
                    <strong>{a.type}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>{a.id}</div>
                  </td>
                  <td>{z?.name || a.zone}</td>
                  <td className="mono">{a.sensor}</td>
                  <td>{a.time}</td>
                  <td>
                    <span className={`pill ${a.status === 'active' ? 'danger' : 'safe'}`}>
                      <span className="dot" />{a.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={e => { e.stopPropagation(); navigate(`/gis?focus=zone:${a.zone}`); }}
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

function StatTile({ tone, label, value, sub }: {
  tone: 'crit' | 'warn' | 'info' | 'muted';
  label: string;
  value: number;
  sub: string;
}) {
  const colors = {
    crit:  { border: 'hsl(var(--danger))',  text: 'hsl(var(--danger))' },
    warn:  { border: 'hsl(var(--warning))', text: 'hsl(var(--warning))' },
    info:  { border: 'hsl(var(--primary))',  text: 'hsl(var(--primary))' },
    muted: { border: 'hsl(var(--muted-foreground))', text: 'hsl(var(--foreground))' }
  }[tone];
  return (
    <div style={{
      padding: 'var(--s4) var(--s5)',
      borderRadius: 'var(--r-xl)',
      border: '1px solid hsl(var(--border))',
      background: 'hsl(var(--card))',
      display: 'flex', flexDirection: 'column', gap: 6,
      borderLeftWidth: 3,
      borderLeftStyle: 'solid',
      borderLeftColor: colors.border
    }}>
      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '-0.02em', color: colors.text }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))' }}>{sub}</div>
    </div>
  );
}
