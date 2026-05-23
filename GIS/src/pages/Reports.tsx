import { useEffect, useMemo, useState } from 'react';
import { Shell } from '../components/Shell';
import { useNetwork } from '../context/NetworkContext';
import { useNetworkStats } from '../hooks/useNetworkQueries';
import {
  loadNetwork,
  zoneLabel,
  isRealZone,
  deriveHealthScore,
  deriveNRW,
  type NetworkData
} from '../data/network';

type ReportType = 'daily' | 'weekly' | 'monthly';

const SUBS: Record<ReportType, string> = {
  daily:   'Daily report · last 24 hours',
  weekly:  'Weekly report · last 7 days',
  monthly: 'Monthly report · last 30 days'
};

// Normalised shape used by ReportPreview — populated from either source
interface ReportData {
  networkName: string;
  totalPipes: number;
  totalLengthKm: number;
  avgSegmentLengthM: number;
  statusOpen: number;
  statusClosed: number;
  statusUnknown: number;
  nrw: number;
  health: number;
  ageDistribution: Record<string, number>;
  materials: { label: string; count: number; km: number; pct: number }[];
  zones: { code: string; label: string; km: number; pipes: number }[];
  nodes: { reservoirs: number; prvs: number; meters: number; sensors: number };
}

const MATERIAL_LOSS: Record<string, number> = {
  AC: 0.22, CI: 0.18, GI: 0.15, Steel: 0.14, PVC: 0.09, PPR: 0.08, HDPE: 0.07
};

function deriveFromStats(
  stats: {
    total_pipes: number;
    total_length_km: number;
    status_breakdown: Record<string, number>;
    age_distribution: Record<string, number>;
    materials_breakdown: { material: string; length_km: number; count: number }[];
    zones_breakdown: { name: string; code: string; pipe_count: number; length_km: number }[];
  },
  networkName: string,
): ReportData {
  const totalKm = stats.total_length_km || 1;

  let matLoss = 0;
  for (const m of stats.materials_breakdown) {
    matLoss += (m.length_km / totalKm) * (MATERIAL_LOSS[m.material] ?? 0.12);
  }
  if (stats.materials_breakdown.length === 0) matLoss = 0.12;

  const totalPipesForAge = Object.values(stats.age_distribution).reduce((s, n) => s + n, 0) || 1;
  const oldPct = ((stats.age_distribution['pre-2000'] ?? 0) + (stats.age_distribution['2000-2009'] ?? 0)) / totalPipesForAge;
  const nrw = Math.max(5, Math.min(35, (matLoss + oldPct * 0.06) * 100));

  const knownMat = stats.materials_breakdown.reduce((s, m) => s + m.count, 0) || 1;
  const materials = stats.materials_breakdown
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((m) => ({
      label: m.material,
      count: m.count,
      km: m.length_km,
      pct: Math.round((m.count / knownMat) * 100),
    }));

  const zones = stats.zones_breakdown
    .filter((z) => z.length_km > 0)
    .sort((a, b) => b.length_km - a.length_km)
    .map((z) => ({ code: z.code, label: z.name || z.code, km: z.length_km, pipes: z.pipe_count }));

  const open = stats.status_breakdown.open ?? 0;
  const closed = stats.status_breakdown.closed ?? 0;
  const total = stats.total_pipes || 1;
  const healthScore = Math.max(0, Math.min(100, Math.round(
    100 - (closed / total) * 30 - nrw * 0.5
  )));

  return {
    networkName,
    totalPipes: stats.total_pipes,
    totalLengthKm: stats.total_length_km,
    avgSegmentLengthM: stats.total_pipes > 0 ? (stats.total_length_km * 1000) / stats.total_pipes : 0,
    statusOpen: open,
    statusClosed: closed,
    statusUnknown: Math.max(0, total - open - closed - (stats.status_breakdown.out_of_service ?? 0)),
    nrw,
    health: healthScore,
    ageDistribution: stats.age_distribution,
    materials,
    zones,
    nodes: { reservoirs: 0, prvs: 0, meters: 0, sensors: 0 },
  };
}

function deriveFromStatic(d: NetworkData): ReportData {
  const m = d.meta;
  const nrw = deriveNRW(m);
  const health = deriveHealthScore(m);
  const totalMat = m.materials.reduce((s, [, n]) => s + n, 0) || 1;
  const materials = m.materials.slice(0, 6).map(([mat, count]) => ({
    label: mat, count,
    km: m.length_km_by_material[mat] ?? 0,
    pct: Math.round((count / totalMat) * 100),
  }));
  const zones = Object.entries(m.length_km_by_zone)
    .filter(([z]) => isRealZone(z))
    .sort((a, b) => b[1] - a[1])
    .map(([code, km]) => ({ code, label: zoneLabel(code), km, pipes: 0 }));

  return {
    networkName: 'Kisumu Water Supply Network',
    totalPipes: m.feature_count,
    totalLengthKm: m.total_length_km,
    avgSegmentLengthM: m.feature_count > 0 ? m.total_length_m / m.feature_count : 0,
    statusOpen: m.status_counts.open ?? 0,
    statusClosed: m.status_counts.closed ?? 0,
    statusUnknown: m.status_counts.unknown ?? 0,
    nrw,
    health,
    ageDistribution: m.age_distribution,
    materials,
    zones,
    nodes: {
      reservoirs: m.asset_counts.tank ?? 0,
      prvs: m.asset_counts.pressure_valve ?? 0,
      meters: m.asset_counts.meter_valve ?? 0,
      sensors: m.asset_counts.sensor ?? 0,
    },
  };
}

export default function Reports() {
  const { activeNetwork } = useNetwork();
  const { data: apiStats } = useNetworkStats(activeNetwork?.id ?? null);
  const [staticData, setStaticData] = useState<NetworkData | null>(null);
  const [type, setType] = useState<ReportType>('weekly');

  useEffect(() => {
    if (activeNetwork) return;
    let alive = true;
    loadNetwork().then((d) => { if (alive) setStaticData(d); });
    return () => { alive = false; };
  }, [activeNetwork]);

  const report = useMemo<ReportData | null>(() => {
    if (activeNetwork && apiStats)
      return deriveFromStats(apiStats as Parameters<typeof deriveFromStats>[0], activeNetwork.name);
    if (!activeNetwork && staticData)
      return deriveFromStatic(staticData);
    return null;
  }, [activeNetwork, apiStats, staticData]);

  const networkName = report?.networkName ?? activeNetwork?.name ?? 'Kisumu Water Supply Network';

  return (
    <Shell active="reports" title="Reports & Analytics"
      sub={report
        ? `Last refresh · ${new Date().toLocaleString()} · ${report.totalPipes.toLocaleString()} segments analysed`
        : 'Loading…'}
    >
      <div className="ops-network-bar">{networkName}</div>

      <section>
        <div className="reports-eyebrow">Choose report type</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s4)', marginBottom: 'var(--s4)' }}>
          <ReportTypeCard
            selected={type === 'daily'}
            onClick={() => setType('daily')}
            icon={<><circle cx={12} cy={12} r={10} /><polyline points="12 6 12 12 16 14" /></>}
            title="Daily report"
            sub="24h rollup · alerts, sensor uptime, pressure summary"
          />
          <ReportTypeCard
            selected={type === 'weekly'}
            onClick={() => setType('weekly')}
            icon={<><rect x={3} y={4} width={18} height={18} rx={2} /><line x1={16} y1={2} x2={16} y2={6} /><line x1={8} y1={2} x2={8} y2={6} /></>}
            title="Weekly report"
            sub="7-day rollup · NRW trend, zone performance, asset summary"
          />
          <ReportTypeCard
            selected={type === 'monthly'}
            onClick={() => setType('monthly')}
            icon={<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></>}
            title="Monthly report"
            sub="Full month · regulatory-style summary, charts, PDF-ready"
          />
        </div>
      </section>

      {!report ? (
        <div className="ops-skeleton">
          <div className="ops-skel-row" />
        </div>
      ) : (
        <ReportPreview type={type} report={report} />
      )}
    </Shell>
  );
}

function ReportPreview({ type, report }: { type: ReportType; report: ReportData }) {
  const topZones = report.zones.slice(0, 5);

  return (
    <>
      <div className="ops-card">
        <div className="ops-card-head">
          <div>
            <div className="ops-card-title">Report configuration</div>
            <div className="ops-card-sub">{SUBS[type]}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm">Export CSV</button>
            <button className="btn btn-primary btn-sm">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1={12} y1={15} x2={12} y2={3} />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
        <div className="reports-config">
          <div><span>From</span><input type="date" defaultValue="2026-05-06" /></div>
          <div><span>To</span><input type="date" defaultValue="2026-05-13" /></div>
          <div>
            <span>Zones</span>
            <select>
              <option>All zones</option>
              {topZones.map((z) => <option key={z.code}>{z.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <section className="ops-row ops-row-2">
        <div className="ops-card">
          <div className="ops-card-head"><div>
            <div className="ops-card-title">Network performance</div>
            <div className="ops-card-sub">Operational KPIs · {type}</div>
          </div></div>

          <ReportSection title="Network health">
            <ReportRow label="Health score" value={`${report.health}%`} color={report.health >= 95 ? 'hsl(var(--safe))' : 'hsl(var(--warning))'} />
            <ReportRow label="Total length" value={`${report.totalLengthKm.toFixed(1)} km`} />
            <ReportRow label="Active segments" value={report.statusOpen.toLocaleString()} color="hsl(var(--safe))" />
            <ReportRow label="Closed (backfeed)" value={report.statusClosed.toLocaleString()} color="hsl(var(--warning))" />
            <ReportRow label="Status unknown" value={report.statusUnknown.toLocaleString()} />
          </ReportSection>

          <ReportSection title="Non-revenue water">
            <ReportRow label="Estimated NRW ratio" value={`${report.nrw.toFixed(1)}%`}
              color={report.nrw >= 18 ? 'hsl(var(--danger))' : report.nrw >= 12 ? 'hsl(var(--warning))' : 'hsl(var(--safe))'} />
            <ReportRow label="Daily input estimate" value={`${(report.totalLengthKm * 25).toFixed(0)} m³`} />
            <ReportRow label="Estimated daily loss" value={`${(report.totalLengthKm * 25 * report.nrw / 100).toFixed(0)} m³`} color="hsl(var(--warning))" />
            <ReportRow label="Driver" value="Age + material weighted" />
          </ReportSection>

          <ReportSection title="Service coverage">
            <ReportRow label="Service zones" value={topZones.length.toString()} />
            {topZones[0] && <ReportRow label="Largest zone" value={`${topZones[0].label} · ${topZones[0].km.toFixed(1)} km`} />}
          </ReportSection>

          <ReportSection title="Telemetry assets">
            <ReportRow label="Reservoirs / tanks" value={report.nodes.reservoirs.toString()} />
            <ReportRow label="Pressure valves" value={report.nodes.prvs.toString()} />
            <ReportRow label="Meter valves" value={report.nodes.meters.toString()} />
            <ReportRow label="Flow/pressure sensors" value={report.nodes.sensors.toString()} />
          </ReportSection>
        </div>

        <div className="ops-card">
          <div className="ops-card-head"><div>
            <div className="ops-card-title">Asset register</div>
            <div className="ops-card-sub">Inventory snapshot</div>
          </div></div>

          <ReportSection title="Pipe inventory">
            <ReportRow label="Total segments" value={report.totalPipes.toLocaleString()} />
            <ReportRow label="Total length" value={`${report.totalLengthKm.toFixed(1)} km`} />
            <ReportRow label="Avg segment length" value={`${report.avgSegmentLengthM.toFixed(1)} m`} />
          </ReportSection>

          <ReportSection title="Materials">
            {report.materials.length > 0
              ? report.materials.map((m) => (
                  <MaterialRow key={m.label} label={m.label} count={m.count} km={m.km} pct={m.pct} />
                ))
              : <div className="reports-empty-note">No material data — shapefile had no material attribute</div>
            }
          </ReportSection>

          <ReportSection title="Age profile">
            {Object.keys(report.ageDistribution).length > 0
              ? Object.entries(report.ageDistribution).map(([bucket, count]) => (
                  <ReportRow key={bucket} label={bucket} value={count.toLocaleString()} />
                ))
              : <div className="reports-empty-note">No age data — shapefile had no installation year attribute</div>
            }
          </ReportSection>

          <ReportSection title="Zones">
            {topZones.length > 0
              ? topZones.map((z) => (
                  <ReportRow key={z.code} label={z.label} value={`${z.km.toFixed(1)} km${z.pipes > 0 ? ` · ${z.pipes.toLocaleString()} pipes` : ''}`} />
                ))
              : <div className="reports-empty-note">No zone data — shapefile had no zone attribute</div>
            }
          </ReportSection>
        </div>
      </section>
    </>
  );
}

function ReportTypeCard({ selected, onClick, icon, title, sub }: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      className={`reports-type-card${selected ? ' selected' : ''}`}
      onClick={onClick}
    >
      <div className="reports-type-icon">
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>{icon}</svg>
      </div>
      <div className="reports-type-body">
        <h3>{title}</h3>
        <p>{sub}</p>
      </div>
    </button>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="reports-section">
      <h4>{title}</h4>
      {children}
    </div>
  );
}

function ReportRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="reports-row">
      <span>{label}</span>
      <strong style={color ? { color } : undefined}>{value}</strong>
    </div>
  );
}

function MaterialRow({ label, count, km, pct }: { label: string; count: number; km: number; pct: number }) {
  return (
    <div className="reports-row">
      <span style={{ flex: 1, marginRight: 12 }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <div className="reports-mat-bar"><div style={{ width: `${pct}%` }} /></div>
      </span>
      <strong>{count.toLocaleString()} · {km.toFixed(1)} km · {pct}%</strong>
    </div>
  );
}
