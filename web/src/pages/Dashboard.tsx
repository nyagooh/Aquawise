import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, ShieldCheck, AlertTriangle, AlertOctagon, Bell,
  TrendingUp, Layers, Database, Download, Gauge,
} from 'lucide-react';
import { Card, CardHeader, CardBody, KpiCard, Badge, StatusDot } from '../components/ui';
import UtilityMap from '../components/UtilityMap';
import LocationFilter, { applyFilter, initialFilter } from '../components/LocationFilter';
import { api } from '../lib/api';
import type { WaterSource, ApiAlert, TimeSeriesPoint } from '../lib/api';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

export default function Dashboard() {
  const [sources, setSources]   = useState<WaterSource[]>([]);
  const [alerts,  setAlerts]    = useState<ApiAlert[]>([]);
  const [trend,   setTrend]     = useState<TimeSeriesPoint[]>([]);
  const [filter,  setFilter]    = useState(initialFilter);

  useEffect(() => {
    api.get<WaterSource[]>('/water-sources/').then(setSources).catch(() => {});
    api.get<ApiAlert[]>('/alerts/').then(setAlerts).catch(() => {});
    api.get<TimeSeriesPoint[]>('/timeseries/').then(setTrend).catch(() => {});
  }, []);

  const filtered  = useMemo(() => applyFilter(filter, sources), [filter, sources]);
  const counties  = useMemo(() => Array.from(new Set(sources.map(u => u.county))).sort(), [sources]);

  const safe    = sources.filter(u => u.status === 'safe').length;
  const warn    = sources.filter(u => u.status === 'warning').length;
  const danger  = sources.filter(u => u.status === 'danger').length;
  const regionCount = new Set(sources.map(u => u.regionId)).size;

  const activeAlerts = alerts.filter(a => a.status === 'active');

  return (
    <>
      {/* KPIs */}
      <div className="kpi-grid">
        <KpiCard tone="accent" label="Utilities Online"  value={sources.length} sub={`across ${regionCount} regions`}   icon={<MapPin size={20} color="var(--accent)" />} />
        <KpiCard tone="safe"   label="Safe"              value={safe}           sub="within all WHO thresholds"          icon={<ShieldCheck size={20} color="var(--safe)" />} />
        <KpiCard tone="warn"   label="Warnings"          value={warn}           sub="elevated readings"                  icon={<AlertTriangle size={20} color="var(--warning)" />} />
        <KpiCard tone="danger" label="Critical"          value={danger}         sub="immediate attention"                icon={<AlertOctagon size={20} color="var(--danger)" />} />
      </div>

      {/* Map */}
      <Card>
        <CardHeader
          icon={<Layers size={16} />}
          title="Live Sensor Map"
          eyebrow="NETWORK"
          actions={<><button className="btn btn-sm btn-ghost">Satellite</button><button className="btn btn-sm btn-ghost">Terrain</button></>}
        />
        <UtilityMap height={380} utilities={filtered} />
      </Card>

      {/* Alerts + Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s6)' }}>
        <Card>
          <CardHeader
            icon={<Bell size={16} />}
            title="Active Alerts"
            actions={<Link to="/alerts" className="btn btn-sm btn-ghost">View all →</Link>}
          />
          {activeAlerts.length === 0 && (
            <div style={{ padding: 'var(--s6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No active alerts.</div>
          )}
          {activeAlerts.slice(0, 4).map(a => (
            <div key={a.id} className="alert-item">
              <div className={`alert-icon-wrap alert-icon-${a.severity === 'danger' ? 'danger' : 'warning'}`}>
                {a.severity === 'danger' ? <AlertOctagon size={16} /> : <AlertTriangle size={16} />}
              </div>
              <div className="alert-meta">
                <div className="alert-title">{a.title}</div>
                <div className="alert-desc">{a.source} — {a.description}</div>
                <div className="alert-time">{a.time}</div>
              </div>
              <Badge tone={a.severity}>{a.severity === 'danger' ? 'Critical' : 'Warning'}</Badge>
            </div>
          ))}
        </Card>

        <Card>
          <CardHeader
            icon={<TrendingUp size={16} />}
            title="Network pH Trend"
            eyebrow="24-HOUR HISTORY"
          />
          <CardBody>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trend} margin={{ top: 10, right: 8, bottom: 0, left: -10 }}>
                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} interval={Math.max(0, Math.floor(trend.length / 6) - 1)} />
                <YAxis domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 }} />
                <Line type="monotone" dataKey="ph" stroke="var(--accent)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Sensor Readings Table */}
      <Card>
        <CardHeader
          icon={<Database size={16} />}
          title="Latest Sensor Readings"
          eyebrow="ALL UTILITIES"
          actions={<button className="btn btn-sm btn-secondary"><Download size={14} /> Export</button>}
        />
        <LocationFilter
          value={filter}
          onChange={setFilter}
          utilities={sources}
          counties={counties}
          total={sources.length}
          shown={filtered.length}
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Utility</th>
                <th>Status</th>
                <th>pH</th>
                <th>Turbidity (NTU)</th>
                <th>Nitrates (mg/L)</th>
                <th>Conductivity (µS/cm)</th>
                <th>Temp (°C)</th>
                <th>DO (mg/L)</th>
                <th>Last Update</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 'var(--s8)', color: 'var(--text-muted)' }}>
                  {sources.length === 0 ? 'Loading…' : 'No utilities match this filter.'}
                </td></tr>
              )}
              {filtered.map(u => {
                const r = u.readings;
                const color = (v: number | null | undefined, max?: number, min?: number) => {
                  if (v == null) return '';
                  if (max != null && v > max) return 'var(--danger)';
                  if (min != null && v < min) return 'var(--warning)';
                  return 'var(--safe)';
                };
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                        <StatusDot status={u.status} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.county}</div>
                        </div>
                      </div>
                    </td>
                    <td><Badge tone={u.status === 'safe' ? 'safe' : u.status === 'warning' ? 'warning' : 'danger'}>{u.status === 'safe' ? 'Safe' : u.status === 'warning' ? 'Warning' : 'Critical'}</Badge></td>
                    <td className="mono" style={{ color: color(r?.ph, 8.5, 6.5) }}>{r?.ph ?? '—'}</td>
                    <td className="mono" style={{ color: color(r?.turbidity, 1) }}>{r?.turbidity ?? '—'}</td>
                    <td className="mono" style={{ color: color(r?.nitrates, 50) }}>{r?.nitrates ?? '—'}</td>
                    <td className="mono" style={{ color: color(r?.conductivity, 2500) }}>{r?.conductivity ?? '—'}</td>
                    <td className="mono" style={{ color: color(r?.temperature, 25) }}>{r?.temperature ?? '—'}</td>
                    <td className="mono">{r?.dissolvedOxygen ?? '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{u.lastUpdate}</td>
                    <td><Link to={`/locations/${u.id}`} className="btn btn-sm btn-secondary">View</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
