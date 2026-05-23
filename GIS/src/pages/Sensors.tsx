import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { useNetwork } from '../context/NetworkContext';
import { useNodes, useNetworkStats } from '../hooks/useNetworkQueries';
import {
  loadNetwork,
  ASSET_STYLE,
  ASSET_ORDER,
  type NetworkData,
  type AssetFeature,
  type AssetKind
} from '../data/network';

type NodeKind = AssetKind | 'junction';
type Filter = 'all' | NodeKind;

const JUNCTION_STYLE = { shortLabel: 'Network junction', color: '#94A3B8' };

function nodeKindLabel(f: NodeKind): string {
  if (f === 'junction') return JUNCTION_STYLE.shortLabel;
  return ASSET_STYLE[f].shortLabel;
}

function adaptNodes(features: { properties: { id: string; external_id: string; node_type: string }; geometry: unknown }[]): (AssetFeature | JunctionNode)[] {
  const result: (AssetFeature | JunctionNode)[] = [];
  for (const feat of features) {
    const p = feat.properties;
    const geom = feat.geometry as { type: string; coordinates: [number, number] };
    if (!geom || geom.type !== 'Point') continue;
    const id = p.external_id || p.id;
    if (p.node_type === 'reservoir' || p.node_type === 'tank') {
      result.push({ type: 'Feature', id, geometry: { type: 'Point', coordinates: geom.coordinates },
        properties: { asset: 'tank' as const, id, name: id, capacity_m3: 0, level_pct: 0, inflow_lps: 0, outflow_lps: 0, status: 'ok', junction_degree: 0 } });
    } else if (p.node_type === 'meter') {
      result.push({ type: 'Feature', id, geometry: { type: 'Point', coordinates: geom.coordinates },
        properties: { asset: 'meter_valve' as const, id, name: id, size_mm: 0, state: 'open', consumption_m3d: 0, status: 'ok' } });
    } else if (p.node_type === 'junction') {
      result.push({ _kind: 'junction', id, coords: geom.coordinates });
    }
  }
  return result;
}

interface JunctionNode { _kind: 'junction'; id: string; coords: [number, number] }

function isJunction(n: AssetFeature | JunctionNode): n is JunctionNode {
  return '_kind' in n && n._kind === 'junction';
}

export default function Sensors() {
  const navigate = useNavigate();
  const { activeNetwork } = useNetwork();
  const { data: apiNodesFC, isLoading: nodesLoading } = useNodes(activeNetwork?.id ?? null);
  const { data: apiStats } = useNetworkStats(activeNetwork?.id ?? null);
  const [staticData, setStaticData] = useState<NetworkData | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (activeNetwork) return;
    let alive = true;
    loadNetwork().then((d) => { if (alive) setStaticData(d); });
    return () => { alive = false; };
  }, [activeNetwork]);

  const allNodes = useMemo(() => {
    if (activeNetwork && apiNodesFC) return adaptNodes(apiNodesFC.features as Parameters<typeof adaptNodes>[0]);
    if (!activeNetwork && staticData) return staticData.assets as (AssetFeature | JunctionNode)[];
    return [];
  }, [activeNetwork, apiNodesFC, staticData]);

  const counts = useMemo(() => {
    if (activeNetwork && apiStats?.nodes_breakdown) {
      const nb = apiStats.nodes_breakdown;
      return {
        total: apiStats.total_nodes,
        online: apiStats.total_nodes,
        anomaly: 0,
        alert: 0,
        tank: nb.reservoir ?? nb.tank ?? 0,
        pressure_valve: 0,
        meter_valve: nb.meter ?? 0,
        sensor: 0,
        junction: nb.junction ?? 0,
      };
    }
    const c: Record<NodeKind, number> = { tank: 0, pressure_valve: 0, meter_valve: 0, sensor: 0, junction: 0 };
    for (const n of allNodes) {
      if (isJunction(n)) { c.junction++; continue; }
      c[n.properties.asset]++;
    }
    return {
      total: allNodes.length,
      online: allNodes.filter((n) => !isJunction(n) && (n as AssetFeature).properties.status === 'ok').length,
      anomaly: allNodes.filter((n) => !isJunction(n) && (n as AssetFeature).properties.status === 'warn').length,
      alert:   allNodes.filter((n) => !isJunction(n) && (n as AssetFeature).properties.status === 'alert').length,
      ...c,
    };
  }, [activeNetwork, apiStats, allNodes]);

  const list = useMemo(() => {
    if (filter === 'all') return allNodes;
    if (filter === 'junction') return allNodes.filter((n) => isJunction(n));
    return allNodes.filter((n) => !isJunction(n) && (n as AssetFeature).properties.asset === filter);
  }, [allNodes, filter]);

  const isReady = activeNetwork ? !nodesLoading : staticData !== null;
  const networkName = activeNetwork?.name ?? 'Kisumu Water Supply Network';

  const filterTabs: Filter[] = ['all', ...ASSET_ORDER, 'junction'];
  const hasJunctions = counts.junction > 0;

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
          {filterTabs.filter((f) => f !== 'junction' || hasJunctions).map((f) => (
            <button key={f} className={`alerts-filter${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : nodeKindLabel(f as NodeKind)}
              <span className="alerts-filter-count">
                {f === 'all' ? counts.total : counts[f as NodeKind]}
              </span>
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
            {list.slice(0, 500).map((node) => {
              if (isJunction(node)) {
                const focusHref = `/gis?focus=asset:${node.id}`;
                return (
                  <tr key={node.id} onClick={() => navigate(focusHref)}>
                    <td className="mono"><strong>{node.id || '—'}</strong></td>
                    <td>
                      <span className="sensors-kind">
                        <span className="sensors-kind-dot" style={{ background: JUNCTION_STYLE.color }} />
                        {JUNCTION_STYLE.shortLabel}
                      </span>
                    </td>
                    <td>—</td>
                    <td><span className="mono muted">topology node</span></td>
                    <td><span className="pill safe"><span className="dot" />Online</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(focusHref); }}>View on map</button>
                    </td>
                  </tr>
                );
              }
              const a = node as AssetFeature;
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
            {list.length > 500 && (
              <tr>
                <td colSpan={6} className="alerts-empty" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Showing first 500 of {list.length.toLocaleString()} nodes
                </td>
              </tr>
            )}
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
