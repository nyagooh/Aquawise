import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shell } from '../components/Shell';
import {
  loadNetwork,
  zoneLabel,
  isRealZone,
  deriveHealthScore,
  deriveNRW,
  type NetworkData,
  type NetworkMeta,
  type PipeClass,
  type AssetKind
} from '../data/network';
import { useNetwork } from '../context/NetworkContext';
import { useNetworkStats } from '../hooks/useNetworkQueries';
import type { WaterNetwork, EnhancedNetworkStats } from '../types/api';

type DerivedAlert = {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  time: string;
  /** Deep link to /gis with the relevant focus param. */
  link: string;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeNetwork, isLoading: networksLoading, hasNetworks } = useNetwork();
  const { data: apiStats, isLoading: statsLoading } = useNetworkStats(activeNetwork?.id ?? null);

  const [staticData, setStaticData] = useState<NetworkData | null>(null);
  useEffect(() => {
    // Only load demo data when the user explicitly has networks but none is active yet,
    // never for a fresh account with no networks.
    if (activeNetwork || !hasNetworks) return;
    let alive = true;
    loadNetwork().then((d) => { if (alive) setStaticData(d); });
    return () => { alive = false; };
  }, [activeNetwork, hasNetworks]);

  const derived = useMemo(() => {
    if (activeNetwork && apiStats) return computeApiDerived(activeNetwork, apiStats);
    if (!activeNetwork && staticData) return computeDerived(staticData);
    return null;
  }, [activeNetwork, apiStats, staticData]);

  const noNetworks = !networksLoading && !hasNetworks;
  const isLoading = networksLoading || (activeNetwork ? statsLoading : !staticData && hasNetworks);
  const subTitle = activeNetwork && apiStats
    ? `${activeNetwork.name} · ${activeNetwork.total_pipes.toLocaleString()} segments · ${(apiStats.total_length_km ?? 0).toFixed(0)} km`
    : staticData
      ? `Kisumu Water Network · ${staticData.meta.feature_count.toLocaleString()} segments · ${staticData.meta.total_length_km.toFixed(0)} km`
      : 'Operations Dashboard';

  return (
    <Shell active="dashboard" title="Operations Dashboard" sub={subTitle}>
      {noNetworks ? (
        <DashboardEmpty navigate={navigate} />
      ) : isLoading || !derived ? (
        <DashboardSkeleton />
      ) : activeNetwork ? (
        <DashboardApiBody network={activeNetwork} stats={apiStats!} derived={derived} navigate={navigate} />
      ) : (
        <DashboardBody data={staticData!} derived={derived} navigate={navigate} />
      )}
    </Shell>
  );
}

function DashboardEmpty({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx={12} cy={10} r={3} />
        </svg>
      </div>
      <h2 className="empty-state-title">No network yet</h2>
      <p className="empty-state-sub">
        Upload your water network shapefile to start monitoring pipes, sensors, and alerts.
        It takes less than a minute.
      </p>
      <div className="empty-state-actions">
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/demo/upload')}>
          Upload your network →
        </button>
        <button className="btn btn-ghost btn-lg" onClick={() => navigate('/demo')}>
          Explore with demo data
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   API-derived state — from EnhancedNetworkStats
   ════════════════════════════════════════════════════════════ */

function computeApiDerived(network: WaterNetwork, stats: EnhancedNetworkStats): DerivedState {
  const totalKm = stats.total_length_km ?? 0;
  const ageTotal = Object.values(stats.age_distribution).reduce((s, n) => s + n, 0) || 1;
  const ageBuckets = ['pre-2000', '2000-2009', '2010-2019', '2020+', 'unknown'].map((b) => ({
    bucket: b,
    count: stats.age_distribution[b] || 0,
    pct: ((stats.age_distribution[b] || 0) / ageTotal) * 100,
  }));
  const materialKm = stats.materials_breakdown.map((m) => ({
    name: m.material,
    km: m.length_km,
    pct: totalKm > 0 ? (m.length_km / totalKm) * 100 : 0,
  }));
  const topZones = stats.zones_breakdown.slice(0, 8).map((z) => ({
    code: z.code,
    label: z.name,
    km: z.length_km,
    pct: totalKm > 0 ? (z.length_km / totalKm) * 100 : 0,
    pipes: z.pipe_count,
  }));
  const openCount = stats.status_breakdown.open ?? 0;
  const closedCount = stats.status_breakdown.closed ?? 0;
  const totalCount = network.total_pipes || 1;
  const healthScore = Math.round((openCount / totalCount) * 100);
  return {
    alerts: [],
    pressureAnomalies: 0,
    sensorAlerts: 0,
    reservoirsWatchlist: 0,
    healthScore,
    nrwPct: 0,
    households: stats.status_breakdown.open ?? 0,
    meterCount: 0,
    prvCount: 0,
    tankCount: 0,
    sensorCount: 0,
    totalKm,
    topZones,
    classKm: [
      { cls: 'main' as PipeClass, km: 0, pct: 0 },
      { cls: 'distribution' as PipeClass, km: 0, pct: 0 },
    ],
    materialKm,
    ageBuckets,
    reservoirAvgLevel: 0,
    openCount,
    closedCount,
  };
}

function DashboardApiBody({ network, stats, derived, navigate }: {
  network: WaterNetwork;
  stats: EnhancedNetworkStats;
  derived: DerivedState;
  navigate: (path: string) => void;
}) {
  return (
    <>
      <section className="ops-kpi-band">
        <OpsKpi label="Pipe network" value={`${derived.totalKm.toFixed(0)}`} unit="km"
          sub={`${network.total_pipes.toLocaleString()} segments`} tone="primary" onClick={() => navigate('/gis')} />
        <OpsKpi label="Open pipes" value={`${(derived.openCount ?? 0).toLocaleString()}`} unit="segs"
          sub={`${derived.closedCount ?? 0} closed / isolated`} tone="safe" onClick={() => navigate('/gis')} />
        <OpsKpi label="Total nodes" value={`${stats.total_nodes.toLocaleString()}`} unit="nodes"
          sub="Junctions, tanks, meters" tone="primary" />
        <OpsKpi label="Network health" value={`${derived.healthScore}`} unit="%"
          sub="Open segments ratio" tone={derived.healthScore >= 80 ? 'safe' : 'warn'} />
        <OpsKpi label="Materials" value={`${stats.materials_breakdown.length}`} unit="types"
          sub={stats.materials_breakdown[0]?.material ?? '—'} tone="info" />
        <OpsKpi label="Service zones" value={`${stats.zones_breakdown.length}`} unit="zones"
          sub="Coverage areas" tone="primary" onClick={() => navigate('/gis')} />
      </section>

      <section className="ops-row ops-row-3">
        <div className="ops-card">
          <div className="ops-card-head">
            <div>
              <div className="ops-card-title">Materials in use</div>
              <div className="ops-card-sub">{derived.materialKm.length} pipe materials · by length</div>
            </div>
          </div>
          <div className="ops-class-bars">
            {derived.materialKm.map((mat) => <MaterialBar key={mat.name} {...mat} />)}
          </div>
        </div>
        <div className="ops-card">
          <div className="ops-card-head">
            <div>
              <div className="ops-card-title">Age distribution</div>
              <div className="ops-card-sub">Install date · segment count</div>
            </div>
          </div>
          <div className="ops-age-grid">
            {derived.ageBuckets.map((b) => (
              <div key={b.bucket} className="ops-age-cell">
                <div className="ops-age-bar">
                  <div className="ops-age-fill" style={{ height: `${Math.max(2, b.pct)}%`, background: ageColor(b.bucket) }} />
                </div>
                <div className="ops-age-label">
                  <span>{b.bucket}</span>
                  <strong>{b.count.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ops-card">
          <div className="ops-card-head">
            <div>
              <div className="ops-card-title">Pipe status</div>
              <div className="ops-card-sub">Operational breakdown</div>
            </div>
          </div>
          <div className="ops-class-bars">
            {Object.entries(stats.status_breakdown).map(([status, count]) => {
              const pct = network.total_pipes > 0 ? (count / network.total_pipes) * 100 : 0;
              const color: Record<string, string> = { open: '#22c55e', closed: '#f59e0b', out_of_service: '#ef4444', pending: '#94a3b8' };
              return (
                <div key={status} className="ops-class-row">
                  <span className="ops-class-swatch" style={{ background: color[status] ?? '#94a3b8' }} />
                  <div className="ops-class-body">
                    <div className="ops-class-name">{status.replace('_', ' ')}</div>
                    <div className="ops-class-bar">
                      <div className="ops-class-fill" style={{ width: `${pct}%`, background: color[status] ?? '#94a3b8' }} />
                    </div>
                  </div>
                  <div className="ops-class-stat">
                    <strong>{count.toLocaleString()}</strong>
                    <span>{pct.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ops-row ops-row-2">
        <div className="ops-card">
          <div className="ops-card-head">
            <div>
              <div className="ops-card-title">Service zones</div>
              <div className="ops-card-sub">Ranked by pipe-length coverage</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/gis')}>Open map →</button>
          </div>
          <table className="ops-zone-table">
            <thead>
              <tr>
                <th>Zone</th>
                <th style={{ textAlign: 'right' }}>Pipes</th>
                <th style={{ textAlign: 'right' }}>Length</th>
                <th>Share of network</th>
              </tr>
            </thead>
            <tbody>
              {derived.topZones.map((z) => (
                <tr key={z.code}>
                  <td><strong>{z.label}</strong><div className="ops-zone-code">{z.code}</div></td>
                  <td className="mono" style={{ textAlign: 'right' }}>{z.pipes.toLocaleString()}</td>
                  <td className="mono" style={{ textAlign: 'right' }}>{z.km.toFixed(1)} km</td>
                  <td>
                    <div className="ops-zone-share">
                      <div className="ops-zone-share-fill" style={{ width: `${z.pct}%` }} />
                      <span>{z.pct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ops-card">
          <div className="ops-card-head">
            <div>
              <div className="ops-card-title">Live alerts</div>
              <div className="ops-card-sub">Sensor-driven · real-time</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alerts')}>All →</button>
          </div>
          <div className="ops-alert-list">
            <div className="ops-alert-empty">
              <span className="dot-safe" />Real-time alerts coming in Phase 5.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   Derived state — alerts, health, utilization, NRW
   ════════════════════════════════════════════════════════════ */

interface DerivedState {
  alerts: DerivedAlert[];
  pressureAnomalies: number;
  sensorAlerts: number;
  reservoirsWatchlist: number;
  healthScore: number;
  nrwPct: number;
  households: number;
  meterCount: number;
  prvCount: number;
  tankCount: number;
  sensorCount: number;
  totalKm: number;
  topZones: Array<{ code: string; label: string; km: number; pct: number; pipes: number }>;
  classKm: Array<{ cls: PipeClass; km: number; pct: number }>;
  materialKm: Array<{ name: string; km: number; pct: number }>;
  ageBuckets: Array<{ bucket: string; count: number; pct: number }>;
  reservoirAvgLevel: number;
  openCount?: number;
  closedCount?: number;
}

function computeDerived(d: NetworkData): DerivedState {
  const alerts: DerivedAlert[] = [];

  for (const a of d.assets) {
    const p = a.properties;
    if (p.asset === 'pressure_valve' && p.status !== 'ok') {
      const drift = (p.live_bar - p.set_bar).toFixed(2);
      alerts.push({
        id: `ALERT-${p.id}`,
        severity: p.status === 'alert' ? 'critical' : 'warning',
        title: `Pressure ${p.status === 'alert' ? 'alarm' : 'drift'} · ${p.id}`,
        detail: `Live ${p.live_bar} bar (set ${p.set_bar}) — drift ${drift} bar`,
        time: `${(p.id.charCodeAt(p.id.length - 1) % 9) + 1}m ago`,
        link: `/gis?focus=asset:${p.id}`
      });
    }
    if (p.asset === 'tank' && (p.level_pct < 35 || p.level_pct > 92)) {
      alerts.push({
        id: `ALERT-${p.id}`,
        severity: p.level_pct < 25 ? 'critical' : 'warning',
        title: `Reservoir level ${p.level_pct < 35 ? 'low' : 'high'} · ${p.id}`,
        detail: `${p.name} at ${p.level_pct}% (${(p.capacity_m3 * p.level_pct / 100).toFixed(0)} m³ stored)`,
        time: `${(p.id.charCodeAt(p.id.length - 1) % 14) + 4}m ago`,
        link: `/gis?focus=asset:${p.id}`
      });
    }
    if (p.asset === 'sensor' && p.status !== 'ok') {
      alerts.push({
        id: `ALERT-${p.id}`,
        severity: 'warning',
        title: `Sensor anomaly · ${p.id}`,
        detail: `${p.name} · flow ${p.flow_lps} L/s · pressure ${p.pressure_bar} bar`,
        time: `${(p.id.charCodeAt(p.id.length - 1) % 8) + 1}m ago`,
        link: `/gis?focus=asset:${p.id}`
      });
    }
  }
  // network-level alerts from status_counts
  const closed = d.meta.status_counts.closed || 0;
  if (closed > 30) {
    const firstClosed = d.pipes.find((p) => p.properties.status === 'closed');
    alerts.push({
      id: 'ALERT-NET-CLOSED',
      severity: 'info',
      title: 'Backfeed lines closed',
      detail: `${closed} segments currently isolated for maintenance or redundancy`,
      time: '24h',
      link: firstClosed ? `/gis?focus=pipe:${firstClosed.properties.id}` : '/gis'
    });
  }
  const ooS = d.meta.service_counts['out-of-service'] || 0;
  if (ooS > 0) {
    const firstOoS = d.pipes.find((p) => p.properties.service === 'out-of-service');
    alerts.push({
      id: 'ALERT-NET-OOS',
      severity: 'warning',
      title: 'Out-of-service segments',
      detail: `${ooS} segments flagged out of service — investigate field crew status`,
      time: '2h',
      link: firstOoS ? `/gis?focus=pipe:${firstOoS.properties.id}` : '/gis'
    });
  }
  alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 } as const;
    return order[a.severity] - order[b.severity];
  });

  const tanks = d.assets.filter((a) => a.properties.asset === 'tank');
  const reservoirAvgLevel = tanks.reduce((s, t) => s + (t.properties as { level_pct: number }).level_pct, 0) / Math.max(1, tanks.length);

  const totalKm = d.meta.total_length_km;

  const classOrder: PipeClass[] = ['main', 'distribution', 'household', 'backfeed', 'boundary'];
  const classKm = classOrder.map((cls) => {
    const km = d.meta.length_km_by_class[cls] || 0;
    return { cls, km, pct: totalKm > 0 ? (km / totalKm) * 100 : 0 };
  });

  const zoneKm = Object.entries(d.meta.length_km_by_zone)
    .filter(([z]) => isRealZone(z))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const zonePipes: Record<string, number> = {};
  for (const f of d.pipes) {
    const z = f.properties.zone;
    if (z) zonePipes[z] = (zonePipes[z] || 0) + 1;
  }
  const topZones = zoneKm.map(([code, km]) => ({
    code,
    label: zoneLabel(code),
    km,
    pct: totalKm > 0 ? (km / totalKm) * 100 : 0,
    pipes: zonePipes[code] || 0
  }));

  const matKm = Object.entries(d.meta.length_km_by_material)
    .sort((a, b) => b[1] - a[1]);
  const materialKm = matKm.map(([name, km]) => ({
    name,
    km,
    pct: totalKm > 0 ? (km / totalKm) * 100 : 0
  }));

  const ageTotal = Object.values(d.meta.age_distribution).reduce((s, n) => s + n, 0) || 1;
  const ageBuckets = ['pre-2000', '2000-2009', '2010-2019', '2020+', 'unknown'].map((b) => ({
    bucket: b,
    count: d.meta.age_distribution[b] || 0,
    pct: ((d.meta.age_distribution[b] || 0) / ageTotal) * 100
  }));

  return {
    alerts,
    pressureAnomalies: alerts.filter((a) => a.title.startsWith('Pressure')).length,
    sensorAlerts: alerts.filter((a) => a.title.startsWith('Sensor')).length,
    reservoirsWatchlist: alerts.filter((a) => a.title.startsWith('Reservoir')).length,
    healthScore: deriveHealthScore(d.meta),
    nrwPct: deriveNRW(d.meta),
    households: d.meta.by_class.household || 0,
    meterCount: d.meta.asset_counts.meter_valve || 0,
    prvCount: d.meta.asset_counts.pressure_valve || 0,
    tankCount: d.meta.asset_counts.tank || 0,
    sensorCount: d.meta.asset_counts.sensor || 0,
    totalKm,
    topZones,
    classKm,
    materialKm,
    ageBuckets,
    reservoirAvgLevel
  };
}

/* ════════════════════════════════════════════════════════════
   View
   ════════════════════════════════════════════════════════════ */

function DashboardBody({ data, derived, navigate }: {
  data: NetworkData;
  derived: DerivedState;
  navigate: (path: string) => void;
}) {
  const m: NetworkMeta = data.meta;

  return (
    <>
      {/* ── KPI band ── */}
      <section className="ops-kpi-band">
        <OpsKpi
          label="Pipe network"
          value={`${derived.totalKm.toFixed(0)}`}
          unit="km"
          sub={`${m.feature_count.toLocaleString()} segments`}
          tone="primary"
          onClick={() => navigate('/gis')}
        />
        <OpsKpi
          label="Household connections"
          value={`${derived.households.toLocaleString()}`}
          unit="lines"
          sub={`${(m.length_km_by_class.household || 0).toFixed(1)} km service`}
          tone="primary"
          onClick={() => navigate('/gis')}
        />
        <OpsKpi
          label="Reservoirs"
          value={`${derived.tankCount}`}
          unit="tanks"
          sub={`Avg fill ${derived.reservoirAvgLevel.toFixed(0)}%`}
          tone="info"
          onClick={() => navigate('/gis')}
        />
        <OpsKpi
          label="Pressure valves"
          value={`${derived.prvCount}`}
          unit="PRVs"
          sub={`${derived.pressureAnomalies} drifting`}
          tone={derived.pressureAnomalies ? 'warn' : 'safe'}
          onClick={() => navigate('/gis')}
        />
        <OpsKpi
          label="Meter valves"
          value={`${derived.meterCount}`}
          unit="bulk"
          sub="Consumption metered"
          tone="primary"
          onClick={() => navigate('/sensors')}
        />
        <OpsKpi
          label="Active alerts"
          value={`${derived.alerts.length}`}
          unit="open"
          sub={`${derived.alerts.filter((a) => a.severity === 'critical').length} critical`}
          tone={derived.alerts.filter((a) => a.severity === 'critical').length ? 'danger' : 'warn'}
          onClick={() => navigate('/alerts')}
        />
        <OpsKpi
          label="Estimated NRW"
          value={`${derived.nrwPct.toFixed(1)}`}
          unit="%"
          sub="Age-weighted estimate"
          tone={derived.nrwPct >= 18 ? 'danger' : derived.nrwPct >= 12 ? 'warn' : 'safe'}
          onClick={() => navigate('/nrw')}
        />
        <OpsKpi
          label="Network health"
          value={`${derived.healthScore}`}
          unit="%"
          sub={`${(m.status_counts.open || 0).toLocaleString()} segments open`}
          tone="safe"
        />
      </section>

      {/* ── Network composition row ── */}
      <section className="ops-row ops-row-3">
        <div className="ops-card">
          <div className="ops-card-head">
            <div>
              <div className="ops-card-title">Network composition</div>
              <div className="ops-card-sub">By pipe class · % of total length</div>
            </div>
          </div>
          <div className="ops-class-bars">
            {derived.classKm.map(({ cls, km, pct }) => (
              <ClassBar key={cls} cls={cls} km={km} pct={pct} />
            ))}
          </div>
        </div>

        <div className="ops-card">
          <div className="ops-card-head">
            <div>
              <div className="ops-card-title">Materials in use</div>
              <div className="ops-card-sub">{derived.materialKm.length} pipe materials</div>
            </div>
          </div>
          <div className="ops-class-bars">
            {derived.materialKm.map((mat) => (
              <MaterialBar key={mat.name} {...mat} />
            ))}
          </div>
        </div>

        <div className="ops-card">
          <div className="ops-card-head">
            <div>
              <div className="ops-card-title">Age distribution</div>
              <div className="ops-card-sub">Install date · oldest infrastructure on the left</div>
            </div>
          </div>
          <div className="ops-age-grid">
            {derived.ageBuckets.map((b) => (
              <div key={b.bucket} className="ops-age-cell">
                <div className="ops-age-bar">
                  <div className="ops-age-fill" style={{
                    height: `${Math.max(2, b.pct)}%`,
                    background: ageColor(b.bucket)
                  }} />
                </div>
                <div className="ops-age-label">
                  <span>{b.bucket}</span>
                  <strong>{b.count.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Zones + alerts ── */}
      <section className="ops-row ops-row-2">
        <div className="ops-card">
          <div className="ops-card-head">
            <div>
              <div className="ops-card-title">Service zones</div>
              <div className="ops-card-sub">Ranked by pipe-length coverage</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/gis')}>Open map →</button>
          </div>
          <table className="ops-zone-table">
            <thead>
              <tr>
                <th>Zone</th>
                <th style={{ textAlign: 'right' }}>Pipes</th>
                <th style={{ textAlign: 'right' }}>Length</th>
                <th>Share of network</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {derived.topZones.map((z) => {
                const risk = derived.alerts.some((a) => a.detail.includes(z.code));
                return (
                  <tr key={z.code} onClick={() => navigate('/gis')}>
                    <td>
                      <strong>{z.label}</strong>
                      <div className="ops-zone-code">{z.code}</div>
                    </td>
                    <td className="mono" style={{ textAlign: 'right' }}>{z.pipes.toLocaleString()}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>{z.km.toFixed(1)} km</td>
                    <td>
                      <div className="ops-zone-share">
                        <div className="ops-zone-share-fill" style={{ width: `${z.pct}%` }} />
                        <span>{z.pct.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`pill ${risk ? 'warn' : 'safe'}`}>
                        <span className="dot" />
                        {risk ? 'Watch' : 'Healthy'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="ops-card">
          <div className="ops-card-head">
            <div>
              <div className="ops-card-title">Live alerts</div>
              <div className="ops-card-sub">{derived.alerts.length} open · auto-generated from telemetry</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alerts')}>All →</button>
          </div>
          <div className="ops-alert-list">
            {derived.alerts.length === 0 && (
              <div className="ops-alert-empty">
                <span className="dot-safe" />Network nominal — no active alerts.
              </div>
            )}
            {derived.alerts.slice(0, 7).map((a) => (
              <div
                key={a.id}
                className={`ops-alert sev-${a.severity}`}
                onClick={() => navigate(a.link)}
              >
                <span className="ops-alert-dot" />
                <div className="ops-alert-body">
                  <div className="ops-alert-title">{a.title}</div>
                  <div className="ops-alert-detail">{a.detail}</div>
                </div>
                <div className="ops-alert-time">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reservoirs ── */}
      <section className="ops-card">
        <div className="ops-card-head">
          <div>
            <div className="ops-card-title">Reservoir watch</div>
            <div className="ops-card-sub">Live fill levels · inflow / outflow · hours to empty</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/gis')}>Inspect on map →</button>
        </div>
        <div className="ops-reservoir-grid">
          {data.assets.filter((a) => a.properties.asset === 'tank').map((a) => {
            const t = a.properties as { id: string; name: string; capacity_m3: number; level_pct: number; inflow_lps: number; outflow_lps: number };
            const stored = t.capacity_m3 * t.level_pct / 100;
            const net = t.inflow_lps - t.outflow_lps;
            const hours = net >= 0
              ? '—'
              : `${Math.max(1, Math.round(stored / Math.max(0.5, -net * 3.6)))}h`;
            const tone = t.level_pct > 70 ? 'safe' : t.level_pct > 35 ? 'warn' : 'danger';
            return (
              <div key={t.id} className="ops-reservoir">
                <div className="ops-reservoir-head">
                  <div>
                    <div className="ops-reservoir-name">{t.name}</div>
                    <div className="ops-reservoir-id">{t.id} · {t.capacity_m3.toLocaleString()} m³</div>
                  </div>
                  <span className={`pill ${tone}`}><span className="dot" />{tone === 'safe' ? 'OK' : tone === 'warn' ? 'Watch' : 'Low'}</span>
                </div>
                <div className="ops-reservoir-gauge">
                  <div className="ops-reservoir-gauge-fill" style={{ height: `${t.level_pct}%`, background: gaugeColor(t.level_pct) }} />
                  <span className="ops-reservoir-gauge-value">{t.level_pct}%</span>
                </div>
                <div className="ops-reservoir-meta">
                  <span>In <strong>{t.inflow_lps} L/s</strong></span>
                  <span>Out <strong>{t.outflow_lps} L/s</strong></span>
                  <span>To empty <strong>{hours}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   Sub-components
   ════════════════════════════════════════════════════════════ */

function OpsKpi({ label, value, unit, sub, tone, onClick }: {
  label: string;
  value: string;
  unit?: string;
  sub: string;
  tone: 'primary' | 'safe' | 'warn' | 'danger' | 'info';
  onClick?: () => void;
}) {
  return (
    <button className={`ops-kpi tone-${tone}`} onClick={onClick} disabled={!onClick}>
      <div className="ops-kpi-label">{label}</div>
      <div className="ops-kpi-value">
        {value}
        {unit && <span className="ops-kpi-unit">{unit}</span>}
      </div>
      <div className="ops-kpi-sub">{sub}</div>
    </button>
  );
}

function ClassBar({ cls, km, pct }: { cls: PipeClass; km: number; pct: number }) {
  const palette: Record<PipeClass, { color: string; label: string }> = {
    main:         { color: '#1D4ED8', label: 'Transmission mains' },
    distribution: { color: '#0EA5E9', label: 'Distribution mains' },
    household:    { color: '#94A3B8', label: 'Household connections' },
    backfeed:     { color: '#F59E0B', label: 'Backfeed (closed)' },
    boundary:     { color: '#A78BFA', label: 'Zone boundaries' }
  };
  const p = palette[cls];
  return (
    <div className="ops-class-row">
      <span className="ops-class-swatch" style={{ background: p.color }} />
      <div className="ops-class-body">
        <div className="ops-class-name">{p.label}</div>
        <div className="ops-class-bar"><div className="ops-class-fill" style={{ width: `${pct}%`, background: p.color }} /></div>
      </div>
      <div className="ops-class-stat">
        <strong>{km.toFixed(1)} km</strong>
        <span>{pct.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function MaterialBar({ name, km, pct }: { name: string; km: number; pct: number }) {
  const tint = materialTint(name);
  return (
    <div className="ops-class-row">
      <span className="ops-class-swatch" style={{ background: tint }} />
      <div className="ops-class-body">
        <div className="ops-class-name">{name}</div>
        <div className="ops-class-bar"><div className="ops-class-fill" style={{ width: `${pct}%`, background: tint }} /></div>
      </div>
      <div className="ops-class-stat">
        <strong>{km.toFixed(1)} km</strong>
        <span>{pct.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function materialTint(name: string): string {
  const t: Record<string, string> = {
    PVC: '#0EA5E9', uPVC: '#22D3EE', HDPE: '#1D4ED8', PE: '#1D4ED8',
    GI: '#94A3B8', Steel: '#64748B', PPR: '#A78BFA', AC: '#F97316'
  };
  return t[name] || '#94A3B8';
}

function ageColor(bucket: string): string {
  switch (bucket) {
    case 'pre-2000':   return '#dc2626';
    case '2000-2009':  return '#f97316';
    case '2010-2019':  return '#22c55e';
    case '2020+':      return '#0EA5E9';
    default:           return '#94a3b8';
  }
}

function gaugeColor(pct: number): string {
  if (pct > 70) return '#22c55e';
  if (pct > 35) return '#f59e0b';
  return '#ef4444';
}

function DashboardSkeleton() {
  return (
    <div className="ops-skeleton">
      <div className="ops-skel-band" />
      <div className="ops-skel-row" />
      <div className="ops-skel-row" />
    </div>
  );
}

/* Make AssetKind importable to satisfy TS isolatedModules linkage */
export type { AssetKind };
