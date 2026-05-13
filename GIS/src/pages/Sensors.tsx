/**
 * Sensors — telemetry inventory across the whole network.
 *
 * Lists every live node (flow + pressure sensors, pressure valves, meter
 * valves, reservoirs) from the loaded GeoJSON. Filter by type, click to view
 * on the map.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shell } from '../components/Shell';
import {
  loadNetwork,
  ASSET_STYLE,
  ASSET_ORDER,
  type NetworkData,
  type AssetFeature,
  type AssetKind
} from '../data/network';

type Filter = 'all' | AssetKind;

export default function Sensors() {
  const navigate = useNavigate();
  const [data, setData] = useState<NetworkData | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    let alive = true;
    loadNetwork().then((d) => { if (alive) setData(d); });
    return () => { alive = false; };
  }, []);

  const counts = useMemo(() => {
    if (!data) return null;
    const c: Record<AssetKind, number> = { tank: 0, pressure_valve: 0, meter_valve: 0, sensor: 0 };
    for (const a of data.assets) c[a.properties.asset]++;
    return {
      total: data.assets.length,
      online: data.assets.filter((a) => a.properties.status === 'ok').length,
      anomaly: data.assets.filter((a) => a.properties.status === 'warn').length,
      alert: data.assets.filter((a) => a.properties.status === 'alert').length,
      ...c
    };
  }, [data]);

  const list = useMemo(() => {
    if (!data) return [] as AssetFeature[];
    return filter === 'all' ? data.assets : data.assets.filter((a) => a.properties.asset === filter);
  }, [data, filter]);

  return (
    <Shell active="sensors" title="Sensors & Telemetry" sub={counts ? `${counts.total} live nodes · ${counts.online} online · ${counts.alert + counts.anomaly} in alarm` : 'Loading…'}>
      {counts && (
        <section className="ops-kpi-band" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <SensorStat tone="primary" label="Total telemetry" value={counts.total} sub={`${counts.sensor} sensors · ${counts.pressure_valve} PRVs · ${counts.meter_valve} meters · ${counts.tank} tanks`} />
          <SensorStat tone="safe"    label="Online"           value={counts.online}  sub={`${Math.round((counts.online / counts.total) * 100)}% uptime`} />
          <SensorStat tone="warn"    label="Anomaly"          value={counts.anomaly} sub="Within tolerance · monitor" />
          <SensorStat tone="danger"  label="Alarm"            value={counts.alert}   sub="Investigate immediately" />
        </section>
      )}

      <div className="ops-card" style={{ padding: 0 }}>
        <div className="alerts-filter-bar">
          {(['all', ...ASSET_ORDER] as Filter[]).map((f) => (
            <button
              key={f}
              className={`alerts-filter${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : ASSET_STYLE[f].shortLabel}
              <span className="alerts-filter-count">
                {f === 'all' ? counts?.total : counts?.[f]}
              </span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost btn-sm">Export CSV</button>
        </div>

        <table className="alerts-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Kind</th>
              <th>Name</th>
              <th>Live reading</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => {
              const p = a.properties;
              const kind = ASSET_STYLE[p.asset];
              const focusHref = `/gis?focus=asset:${p.id}`;
              return (
                <tr key={p.id} onClick={() => navigate(focusHref)}>
                  <td className="mono"><strong>{p.id}</strong></td>
                  <td>
                    <span className="sensors-kind">
                      <span className="sensors-kind-dot" style={{ background: kind.color }} />
                      {kind.shortLabel}
                    </span>
                  </td>
                  <td>{p.name}</td>
                  <td>{renderReading(a)}</td>
                  <td>
                    <span className={`pill ${p.status === 'ok' ? 'safe' : p.status === 'warn' ? 'warn' : 'danger'}`}>
                      <span className="dot" />
                      {p.status === 'ok' ? 'Online' : p.status === 'warn' ? 'Anomaly' : 'Alarm'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => { e.stopPropagation(); navigate(focusHref); }}
                    >View on map</button>
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

function renderReading(a: AssetFeature) {
  const p = a.properties;
  if (p.asset === 'sensor') return <span className="mono">{p.flow_lps} L/s · {p.pressure_bar} bar</span>;
  if (p.asset === 'tank')   return <span className="mono">{p.level_pct}% · {p.inflow_lps}/{p.outflow_lps} L/s</span>;
  if (p.asset === 'pressure_valve') return <span className="mono">{p.live_bar} bar (set {p.set_bar})</span>;
  return <span className="mono">⌀{p.size_mm} mm · {p.state} · {p.consumption_m3d} m³/d</span>;
}

function SensorStat({ tone, label, value, sub }: {
  tone: 'primary' | 'safe' | 'warn' | 'danger';
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className={`ops-kpi tone-${tone}`}>
      <div className="ops-kpi-label">{label}</div>
      <div className="ops-kpi-value">{value}</div>
      <div className="ops-kpi-sub">{sub}</div>
    </div>
  );
}
