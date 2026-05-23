import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { useNetwork } from '../context/NetworkContext';
import { useNodes } from '../hooks/useNetworkQueries';
import {
  loadNetwork,
  ASSET_STYLE,
  ASSET_ORDER,
  type NetworkData,
  type AssetFeature,
  type AssetKind
} from '../data/network';

type Filter = 'all' | AssetKind;

function adaptNodes(features: { properties: { id: string; external_id: string; node_type: string }; geometry: unknown }[]): AssetFeature[] {
  const result: AssetFeature[] = [];
  for (const feat of features) {
    const p = feat.properties;
    const geom = feat.geometry as { type: string; coordinates: [number, number] };
    if (!geom || geom.type !== 'Point') continue;
    const id = p.external_id || p.id;
    if (p.node_type === 'reservoir' || p.node_type === 'tank') {
      result.push({ type: 'Feature', id, geometry: { type: 'Point', coordinates: geom.coordinates },
        properties: { asset: 'tank', id, name: id, capacity_m3: 0, level_pct: 0, inflow_lps: 0, outflow_lps: 0, status: 'ok', junction_degree: 0 } });
    } else if (p.node_type === 'meter') {
      result.push({ type: 'Feature', id, geometry: { type: 'Point', coordinates: geom.coordinates },
        properties: { asset: 'meter_valve', id, name: id, size_mm: 0, state: 'open', consumption_m3d: 0, status: 'ok' } });
    }
  }
  return result;
}

export default function Sensors() {
  const navigate = useNavigate();
  const { activeNetwork } = useNetwork();
  const { data: apiNodesFC, isLoading: nodesLoading } = useNodes(activeNetwork?.id ?? null);
  const [staticData, setStaticData] = useState<NetworkData | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (activeNetwork) return;
    let alive = true;
    loadNetwork().then((d) => { if (alive) setStaticData(d); });
    return () => { alive = false; };
  }, [activeNetwork]);

  const assets: AssetFeature[] = useMemo(() => {
    if (activeNetwork && apiNodesFC) return adaptNodes(apiNodesFC.features as Parameters<typeof adaptNodes>[0]);
    if (!activeNetwork && staticData) return staticData.assets;
    return [];
  }, [activeNetwork, apiNodesFC, staticData]);

  const counts = useMemo(() => {
    const c: Record<AssetKind, number> = { tank: 0, pressure_valve: 0, meter_valve: 0, sensor: 0 };
    for (const a of assets) c[a.properties.asset]++;
    return {
      total: assets.length,
      online: assets.filter((a) => a.properties.status === 'ok').length,
      anomaly: assets.filter((a) => a.properties.status === 'warn').length,
      alert: assets.filter((a) => a.properties.status === 'alert').length,
      ...c,
    };
  }, [assets]);

  const list = useMemo(() =>
    filter === 'all' ? assets : assets.filter((a) => a.properties.asset === filter),
    [assets, filter]
  );

  const isReady = activeNetwork ? !nodesLoading : staticData !== null;
  const networkName = activeNetwork?.name ?? 'Kisumu Water Supply Network';

  return (
    <Shell active="sensors" title="Sensors & Telemetry"
      sub={isReady ? `${counts.total} live nodes · ${counts.online} online · ${counts.alert + counts.anomaly} in alarm` : 'Loading…'}
    >
      <div className="ops-network-bar">{networkName}</div>

      {isReady && (
        <section className="ops-kpi-band" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <SensorStat tone="primary" label="Total telemetry" value={counts.total}
            sub={`${counts.sensor} sensors · ${counts.pressure_valve} PRVs · ${counts.meter_valve} meters · ${counts.tank} tanks`} />
          <SensorStat tone="safe" label="Online" value={counts.online}
            sub={counts.total > 0 ? `${Math.round((counts.online / counts.total) * 100)}% uptime` : 'No telemetry'} />
          <SensorStat tone="warn" label="Anomaly" value={counts.anomaly} sub="Within tolerance · monitor" />
          <SensorStat tone="danger" label="Alarm" value={counts.alert} sub="Investigate immediately" />
        </section>
      )}

      <div className="ops-card" style={{ padding: 0 }}>
        <div className="alerts-filter-bar">
          {(['all', ...ASSET_ORDER] as Filter[]).map((f) => (
            <button key={f} className={`alerts-filter${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : ASSET_STYLE[f].shortLabel}
              <span className="alerts-filter-count">{f === 'all' ? counts.total : counts[f as AssetKind]}</span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button className="btn btn-ghost btn-sm">Export CSV</button>
        </div>

        <table className="alerts-table">
          <thead>
            <tr><th>ID</th><th>Kind</th><th>Name</th><th>Live reading</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {list.length === 0 && isReady && (
              <tr>
                <td colSpan={6} className="alerts-empty">
                  {activeNetwork
                    ? 'No telemetry nodes — upload a shapefile that includes a point layer for sensors, valves, and meters.'
                    : 'No assets match this filter.'}
                </td>
              </tr>
            )}
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
                    <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(focusHref); }}>
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

function renderReading(a: AssetFeature) {
  const p = a.properties;
  if (p.asset === 'sensor') return <span className="mono">{p.flow_lps} L/s · {p.pressure_bar} bar</span>;
  if (p.asset === 'tank') return <span className="mono">{p.level_pct}% · {p.inflow_lps}/{p.outflow_lps} L/s</span>;
  if (p.asset === 'pressure_valve') return <span className="mono">{p.live_bar} bar (set {p.set_bar})</span>;
  return <span className="mono">⌀{p.size_mm} mm · {p.state} · {p.consumption_m3d} m³/d</span>;
}

function SensorStat({ tone, label, value, sub }: { tone: 'primary' | 'safe' | 'warn' | 'danger'; label: string; value: number; sub: string }) {
  return (
    <div className={`ops-kpi tone-${tone}`}>
      <div className="ops-kpi-label">{label}</div>
      <div className="ops-kpi-value">{value}</div>
      <div className="ops-kpi-sub">{sub}</div>
    </div>
  );
}
