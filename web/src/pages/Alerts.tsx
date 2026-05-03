import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertOctagon, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import { Card, CardHeader, Badge } from '../components/ui';
import { api } from '../lib/api';
import type { ApiAlert, WaterSource } from '../lib/api';

type TabKey = 'all' | 'active' | 'resolved';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Alerts() {
  const [alerts,  setAlerts]  = useState<ApiAlert[]>([]);
  const [sources, setSources] = useState<WaterSource[]>([]);
  const [tab,     setTab]     = useState<TabKey>('all');
  const [source,  setSource]  = useState('all');
  const [param,   setParam]   = useState('all');
  const [q,       setQ]       = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actioning,  setActioning]  = useState(false);

  useEffect(() => {
    api.get<ApiAlert[]>('/alerts/').then(data => {
      setAlerts(data);
      if (data.length) setSelectedId(data[0].id);
    }).catch(() => {});
    api.get<WaterSource[]>('/water-sources/').then(setSources).catch(() => {});
  }, []);

  const filtered = useMemo(() => alerts.filter(a => {
    if (tab === 'active'   && a.status !== 'active')   return false;
    if (tab === 'resolved' && a.status !== 'resolved') return false;
    if (source !== 'all' && a.utilityId !== source)    return false;
    if (param  !== 'all' && a.parameter !== param)     return false;
    if (q && !`${a.title} ${a.description}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [alerts, tab, source, param, q]);

  const current = filtered.find(a => a.id === selectedId) ?? filtered[0] ?? null;

  const sourceById = (id: string | null) => sources.find(s => s.id === id);

  const acknowledge = async () => {
    if (!current) return;
    setActioning(true);
    try {
      await api.post(`/alerts/${current.id}/acknowledge/`, {});
      setAlerts(prev => prev.map(a => a.id === current.id ? { ...a, status: 'acknowledged' as const } : a));
    } catch { /* ignore */ } finally {
      setActioning(false);
    }
  };

  const resolve = async () => {
    if (!current) return;
    setActioning(true);
    try {
      await api.post(`/alerts/${current.id}/resolve/`, {});
      setAlerts(prev => prev.map(a => a.id === current.id ? { ...a, status: 'resolved' as const, resolvedAt: new Date().toISOString() } : a));
    } catch { /* ignore */ } finally {
      setActioning(false);
    }
  };

  return (
    <>
      {/* Filter bar */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)', padding: 'var(--s4) var(--s5)', borderBottom: '1px solid var(--border-default)', flexWrap: 'wrap' }}>
          <div className="tabs">
            {(['all', 'active', 'resolved'] as TabKey[]).map(t => (
              <button key={t} onClick={() => setTab(t)} className={'tab-btn' + (tab === t ? ' active' : '')}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <select className="form-control" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8125rem' }} value={source} onChange={e => setSource(e.target.value)}>
            <option value="all">All Utilities</option>
            {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8125rem' }} value={param} onChange={e => setParam(e.target.value)}>
            <option value="all">All Parameters</option>
            <option value="ph">pH</option>
            <option value="turbidity">Turbidity</option>
            <option value="nitrates">Nitrates</option>
            <option value="conductivity">Conductivity</option>
            <option value="temperature">Temperature</option>
            <option value="dissolvedOxygen">Dissolved Oxygen</option>
          </select>
          <div className="search-box" style={{ flex: 1, maxWidth: 280 }}>
            <Search size={14} color="var(--text-muted)" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search alerts…" />
          </div>
        </div>
      </Card>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--s6)', alignItems: 'start' }}>
        {/* Alert list */}
        <Card>
          <CardHeader icon={<Bell size={16} />} title="Alert Feed" eyebrow={`${filtered.length} matching`} />
          {filtered.length === 0 && (
            <div style={{ padding: 'var(--s8)', textAlign: 'center', color: 'var(--text-muted)' }}>
              {alerts.length === 0 ? 'Loading…' : 'No alerts match your filters.'}
            </div>
          )}
          {filtered.map(a => {
            const src = sourceById(a.utilityId);
            const Icon = a.severity === 'danger' ? AlertOctagon : a.severity === 'warning' ? AlertTriangle : CheckCircle2;
            return (
              <div
                key={a.id}
                className="alert-item"
                style={{
                  cursor: 'pointer',
                  background: a.id === current?.id ? 'var(--bg-hover)' : undefined,
                  opacity: a.status === 'resolved' ? 0.65 : 1,
                  borderLeft: a.id === current?.id ? '3px solid var(--accent)' : '3px solid transparent',
                }}
                onClick={() => setSelectedId(a.id)}
              >
                <div className={`alert-icon-wrap alert-icon-${a.severity === 'danger' ? 'danger' : a.severity === 'warning' ? 'warning' : 'info'}`}>
                  <Icon size={16} />
                </div>
                <div className="alert-meta">
                  <div className="alert-title">{a.title}</div>
                  <div className="alert-desc">{src?.name ?? a.source} — {a.description}</div>
                  <div className="alert-time">{a.time} · {a.id}</div>
                </div>
                <Badge tone={a.status === 'resolved' ? 'neutral' : a.severity}>
                  {a.status === 'resolved' ? 'Resolved' : a.status === 'acknowledged' ? 'Ack\'d' : a.severity === 'danger' ? 'Critical' : 'Warning'}
                </Badge>
              </div>
            );
          })}
        </Card>

        {/* Detail panel */}
        {current && (
          <Card>
            <div style={{ padding: 'var(--s5) var(--s6)', borderBottom: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s2)' }}>
                <Badge tone={current.severity}>{current.severity === 'danger' ? 'Critical Alert' : 'Warning'}</Badge>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{current.id}</span>
              </div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{current.title}</h2>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Triggered {fmtDate(current.triggered)}
                {current.status === 'resolved' && current.resolvedAt && ` · Resolved ${fmtDate(current.resolvedAt)}`}
                {current.status === 'active' && ' · unacknowledged'}
                {current.status === 'acknowledged' && ' · acknowledged'}
              </p>
            </div>
            <div style={{ padding: 'var(--s5) var(--s6)' }}>
              <div className="card-eyebrow" style={{ marginBottom: 'var(--s3)' }}>Measurement</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--s4)', marginBottom: 'var(--s5)' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Detected</div>
                  <div className="mono" style={{ fontSize: '2rem', fontWeight: 700, color: current.severity === 'danger' ? 'var(--danger)' : 'var(--warning)' }}>{current.value}</div>
                </div>
                {current.threshold != null && (
                  <>
                    <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>vs</div>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>WHO limit</div>
                      <div className="mono" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{current.threshold}</div>
                    </div>
                  </>
                )}
              </div>

              <div className="card-eyebrow" style={{ marginBottom: 'var(--s3)' }}>Details</div>
              {sourceById(current.utilityId) && (
                <DetailRow label="Utility" value={<Link to={`/locations/${current.utilityId}`} style={{ color: 'var(--accent)' }}>{sourceById(current.utilityId)!.name} →</Link>} />
              )}
              <DetailRow label="Source"    value={current.source} />
              <DetailRow label="Parameter" value={current.parameter} />
              <DetailRow label="Triggered" value={fmtDate(current.triggered)} />

              {current.status === 'active' && (
                <div style={{ display: 'flex', gap: 'var(--s2)', marginTop: 'var(--s5)' }}>
                  <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={acknowledge} disabled={actioning}>
                    Acknowledge
                  </button>
                  {current.utilityId && (
                    <Link to={`/locations/${current.utilityId}`} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                      Go to Location
                    </Link>
                  )}
                </div>
              )}
              {current.status === 'acknowledged' && (
                <div style={{ display: 'flex', gap: 'var(--s2)', marginTop: 'var(--s5)' }}>
                  <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={resolve} disabled={actioning}>
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}

function DetailRow(props: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.8125rem' }}>
      <span style={{ color: 'var(--text-muted)' }}>{props.label}</span>
      <span style={{ color: 'var(--text-primary)' }}>{props.value}</span>
    </div>
  );
}
