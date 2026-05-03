import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import { TrendingUp, MapPin, Battery } from 'lucide-react';
import { Card, CardHeader, CardBody, Badge, MeterBar } from '../components/ui';
import UtilityMap from '../components/UtilityMap';
import { api } from '../lib/api';
import type { WaterSource, ApiAlert, StationReading } from '../lib/api';

// ── Full WHO parameter catalogue ──────────────────────────────────────────────

type ParamKey = string;

interface ParamDef {
  label: string;
  unit: string;
  whoLabel: string;
  safeMin?: number;
  safeMax?: number;
  category: 'micro' | 'physical' | 'chemical' | 'operational';
  /** Key in SourceReadings / StationReading (camelCase) */
  readingKey?: keyof StationReading;
}

const WHO_PARAMS: Record<ParamKey, ParamDef> = {
  // ── Microbiological ──────────────────────────────────────────────────────────
  ecoli:               { label: 'E. coli / Thermotolerant Coliforms', unit: 'CFU/100 mL', whoLabel: 'WHO 0 / 100 mL',          safeMax: 0,      category: 'micro' },
  total_coliforms:     { label: 'Total Coliforms',                    unit: 'CFU/100 mL', whoLabel: 'WHO 0 / 100 mL',          safeMax: 0,      category: 'micro' },
  faecal_streptococci: { label: 'Faecal Streptococci',                unit: 'CFU/100 mL', whoLabel: 'WHO 0 / 100 mL',          safeMax: 0,      category: 'micro' },
  hpc:                 { label: 'Heterotrophic Plate Count',          unit: 'CFU/mL',     whoLabel: 'WHO ≤ 500 CFU/mL',        safeMax: 500,    category: 'micro' },
  // ── Physical / Aesthetic ─────────────────────────────────────────────────────
  turbidity:           { label: 'Turbidity',              unit: 'NTU',     whoLabel: 'WHO ≤ 1 NTU (treated)',   safeMax: 1,     category: 'physical', readingKey: 'turbidity' },
  colour:              { label: 'Colour',                 unit: 'TCU',     whoLabel: 'WHO ≤ 15 TCU',            safeMax: 15,    category: 'physical' },
  temperature:         { label: 'Temperature',            unit: '°C',      whoLabel: 'WHO < 25°C',              safeMax: 25,    category: 'physical', readingKey: 'temperature' },
  tds:                 { label: 'Total Dissolved Solids', unit: 'mg/L',    whoLabel: 'WHO ≤ 1,000 mg/L',        safeMax: 1000,  category: 'physical', readingKey: 'tds' },
  // ── Chemical ─────────────────────────────────────────────────────────────────
  ph:                  { label: 'pH',                     unit: '',        whoLabel: 'WHO 6.5 – 8.5',  safeMin: 6.5, safeMax: 8.5,   category: 'chemical', readingKey: 'ph' },
  conductivity:        { label: 'Conductivity',           unit: 'µS/cm',   whoLabel: 'WHO ≤ 2,500',             safeMax: 2500,  category: 'chemical', readingKey: 'conductivity' },
  hardness:            { label: 'Hardness (as CaCO₃)',    unit: 'mg/L',    whoLabel: 'WHO ≤ 500 mg/L',          safeMax: 500,   category: 'chemical' },
  alkalinity:          { label: 'Alkalinity',             unit: 'mg/L',    whoLabel: 'Monitoring only',                         category: 'chemical' },
  aluminium:           { label: 'Aluminium (Al)',         unit: 'mg/L',    whoLabel: 'WHO ≤ 0.2 mg/L',          safeMax: 0.2,   category: 'chemical' },
  ammonia:             { label: 'Ammonia (NH₃)',          unit: 'mg/L',    whoLabel: 'WHO ≤ 1.5 mg/L',          safeMax: 1.5,   category: 'chemical' },
  arsenic:             { label: 'Arsenic (As)',           unit: 'mg/L',    whoLabel: 'WHO ≤ 0.01 mg/L',         safeMax: 0.01,  category: 'chemical' },
  barium:              { label: 'Barium (Ba)',            unit: 'mg/L',    whoLabel: 'WHO ≤ 1.3 mg/L',          safeMax: 1.3,   category: 'chemical' },
  boron:               { label: 'Boron (B)',              unit: 'mg/L',    whoLabel: 'WHO ≤ 2.4 mg/L',          safeMax: 2.4,   category: 'chemical' },
  cadmium:             { label: 'Cadmium (Cd)',           unit: 'mg/L',    whoLabel: 'WHO ≤ 0.003 mg/L',        safeMax: 0.003, category: 'chemical' },
  chloride:            { label: 'Chloride (Cl⁻)',         unit: 'mg/L',    whoLabel: 'WHO ≤ 250 mg/L',          safeMax: 250,   category: 'chemical' },
  chromium:            { label: 'Chromium (Cr)',          unit: 'mg/L',    whoLabel: 'WHO ≤ 0.05 mg/L',         safeMax: 0.05,  category: 'chemical' },
  copper:              { label: 'Copper (Cu)',            unit: 'mg/L',    whoLabel: 'WHO ≤ 2.0 mg/L',          safeMax: 2.0,   category: 'chemical' },
  cyanide:             { label: 'Cyanide (CN⁻)',          unit: 'mg/L',    whoLabel: 'WHO ≤ 0.07 mg/L',         safeMax: 0.07,  category: 'chemical' },
  fluoride:            { label: 'Fluoride (F⁻)',          unit: 'mg/L',    whoLabel: 'WHO ≤ 1.5 mg/L',          safeMax: 1.5,   category: 'chemical' },
  iron:                { label: 'Iron (Fe)',              unit: 'mg/L',    whoLabel: 'WHO ≤ 0.3 mg/L',          safeMax: 0.3,   category: 'chemical' },
  lead:                { label: 'Lead (Pb)',              unit: 'mg/L',    whoLabel: 'WHO ≤ 0.01 mg/L',         safeMax: 0.01,  category: 'chemical' },
  magnesium:           { label: 'Magnesium (Mg)',         unit: 'mg/L',    whoLabel: 'WHO ≤ 50 mg/L',           safeMax: 50,    category: 'chemical' },
  manganese:           { label: 'Manganese (Mn)',         unit: 'mg/L',    whoLabel: 'WHO ≤ 0.08 mg/L',         safeMax: 0.08,  category: 'chemical' },
  mercury:             { label: 'Mercury (Hg)',           unit: 'mg/L',    whoLabel: 'WHO ≤ 0.006 mg/L',        safeMax: 0.006, category: 'chemical' },
  nickel:              { label: 'Nickel (Ni)',            unit: 'mg/L',    whoLabel: 'WHO ≤ 0.07 mg/L',         safeMax: 0.07,  category: 'chemical' },
  nitrates:            { label: 'Nitrate (NO₃⁻)',         unit: 'mg/L',    whoLabel: 'WHO ≤ 50 mg/L',           safeMax: 50,    category: 'chemical', readingKey: 'nitrates' },
  nitrite:             { label: 'Nitrite (NO₂⁻)',         unit: 'mg/L',    whoLabel: 'WHO ≤ 3 mg/L (short)',    safeMax: 3.0,   category: 'chemical' },
  phosphate:           { label: 'Phosphate (PO₄³⁻)',      unit: 'mg/L',    whoLabel: 'Monitoring only',                         category: 'chemical' },
  selenium:            { label: 'Selenium (Se)',          unit: 'mg/L',    whoLabel: 'WHO ≤ 0.04 mg/L',         safeMax: 0.04,  category: 'chemical' },
  sodium:              { label: 'Sodium (Na)',            unit: 'mg/L',    whoLabel: 'WHO ≤ 200 mg/L',          safeMax: 200,   category: 'chemical' },
  sulphate:            { label: 'Sulphate (SO₄²⁻)',       unit: 'mg/L',    whoLabel: 'WHO ≤ 500 mg/L',          safeMax: 500,   category: 'chemical' },
  uranium:             { label: 'Uranium (U)',            unit: 'mg/L',    whoLabel: 'WHO ≤ 0.03 mg/L',         safeMax: 0.03,  category: 'chemical' },
  zinc:                { label: 'Zinc (Zn)',              unit: 'mg/L',    whoLabel: 'WHO ≤ 3.0 mg/L',          safeMax: 3.0,   category: 'chemical' },
  // ── Operational ──────────────────────────────────────────────────────────────
  dissolved_oxygen:    { label: 'Dissolved Oxygen',           unit: 'mg/L',  whoLabel: '> 5 mg/L recommended', safeMin: 5,    category: 'operational', readingKey: 'dissolvedOxygen' },
  free_chlorine:       { label: 'Free Chlorine (Residual)',   unit: 'mg/L',  whoLabel: 'Residual 0.2 – 1.0',  safeMin: 0.2, safeMax: 1.0, category: 'operational', readingKey: 'freeChlorine' },
};

// Keys that have a StationReading column — usable in the trend chart
const CHARTABLE_KEYS = new Set([
  'ph', 'turbidity', 'temperature', 'dissolved_oxygen',
  'conductivity', 'nitrates', 'free_chlorine', 'tds',
]);

function readingKeyFor(paramId: string): string {
  // Maps param_id (backend snake_case) → camelCase StationReading field
  const overrides: Record<string, string> = {
    dissolved_oxygen: 'dissolvedOxygen',
    free_chlorine:    'freeChlorine',
  };
  return overrides[paramId] ?? paramId;
}

function statusOf(val: number | null | undefined, def: ParamDef): 'safe' | 'warning' | 'danger' {
  if (val == null) return 'safe';
  if (def.safeMax != null && val > def.safeMax) return 'danger';
  if (def.safeMin != null && val < def.safeMin) return 'warning';
  return 'safe';
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LocationDetail() {
  const { id } = useParams<{ id: string }>();
  const [source,  setSource]  = useState<WaterSource | null>(null);
  const [alerts,  setAlerts]  = useState<ApiAlert[]>([]);
  const [history, setHistory] = useState<StationReading[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    api.get<WaterSource>(`/water-sources/${id}/`).then(src => {
      setSource(src);
      // Default to first chartable measured param
      const first = src.measuredParameters.find(p => CHARTABLE_KEYS.has(p)) ?? src.measuredParameters[0] ?? 'ph';
      setActiveTab(first);
    }).catch(() => {});
    api.get<ApiAlert[]>(`/alerts/?water_source=${id}`).then(setAlerts).catch(() => setAlerts([]));
    api.get<{ id: string; name: string; readings: StationReading[] }>(`/water-sources/${id}/readings/`)
      .then(d => setHistory(d.readings))
      .catch(() => {});
  }, [id]);

  // Only show parameters this sensor measures
  const displayParams = useMemo(() => {
    if (!source) return [];
    const measured = source.measuredParameters.length > 0
      ? source.measuredParameters
      : Object.keys(WHO_PARAMS).filter(k => WHO_PARAMS[k].readingKey != null);
    return measured.filter(k => WHO_PARAMS[k]);
  }, [source]);

  const chartParams = useMemo(() =>
    displayParams.filter(p => CHARTABLE_KEYS.has(p)),
  [displayParams]);

  const chartData = useMemo(() => {
    if (!activeTab) return [];
    const rKey = readingKeyFor(activeTab);
    return history
      .map(r => ({
        time: new Date(r.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        value: (r as unknown as Record<string, number | null>)[rKey],
      }))
      .filter(d => d.value != null);
  }, [history, activeTab]);

  const activeDef = activeTab ? WHO_PARAMS[activeTab] : null;

  if (!source) {
    return <div style={{ padding: 'var(--s8)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>;
  }

  return (
    <>
      {/* Header */}
      <Card>
        <CardBody style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--s4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.01em' }}>{source.name}</h1>
              <Badge tone={source.status === 'safe' ? 'safe' : source.status === 'warning' ? 'warning' : 'danger'}>
                {source.status === 'safe' ? 'Safe' : source.status === 'warning' ? 'Warning' : 'Critical'}
              </Badge>
            </div>
            <div style={{ display: 'flex', gap: 'var(--s5)', marginTop: 6, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />{source.county}, Kenya</span>
              {source.sensorId && <span>{source.sensorId}</span>}
              {source.battery != null && <span><Battery size={12} style={{ display: 'inline', marginRight: 4 }} />{source.battery}%</span>}
              <span>Updated {source.lastUpdate}</span>
            </div>
          </div>
          <button className="btn btn-secondary">Export Data</button>
        </CardBody>
      </Card>

      {/* Parameter cards — only what this sensor measures */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--s4)' }}>
        {displayParams.map(paramId => {
          const def = WHO_PARAMS[paramId];
          const rKey = def.readingKey as string | undefined;
          const value = rKey
            ? (source.readings as unknown as Record<string, number | null> | null)?.[rKey] ?? null
            : null;
          const tone = statusOf(value, def);
          const pct = value != null && def.safeMax
            ? Math.min(100, (value / def.safeMax) * 100) : 0;

          return (
            <Card key={paramId} style={{ padding: 'var(--s5) var(--s6)' }}>
              <div className="kpi-label" style={{ fontSize: '0.7rem' }}>{def.label}</div>
              <div
                className={`kpi-value ${tone === 'danger' ? 'danger' : tone === 'warning' ? 'warn' : 'safe'}`}
                style={{ marginTop: 6, fontSize: '1.375rem' }}
              >
                {value != null ? value : '—'}
                {value != null && def.unit && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: 4 }}>{def.unit}</span>
                )}
              </div>
              {def.safeMax != null && (
                <div style={{ margin: '8px 0' }}>
                  <MeterBar value={pct} tone={tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'safe'} />
                </div>
              )}
              <div style={{ fontSize: '0.6875rem', color: tone === 'danger' ? 'var(--danger)' : 'var(--text-muted)', marginTop: 4 }}>
                {tone === 'danger' ? `⚠ Exceeds ${def.whoLabel}` : def.whoLabel}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Trend chart */}
      {chartParams.length > 0 && (
        <Card>
          <CardHeader
            icon={<TrendingUp size={16} />}
            title="Parameter Trends"
            eyebrow="RECENT READINGS"
            actions={
              <div className="tabs">
                {chartParams.map(key => (
                  <button
                    key={key}
                    className={'tab-btn' + (activeTab === key ? ' active' : '')}
                    onClick={() => setActiveTab(key)}
                  >
                    {WHO_PARAMS[key]?.label ?? key}
                  </button>
                ))}
              </div>
            }
          />
          <CardBody>
            {chartData.length === 0
              ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--s6)' }}>No readings yet for this parameter.</p>
              : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: -8 }}>
                    <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} interval={Math.max(0, Math.floor(chartData.length / 6) - 1)} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 }} />
                    {activeDef?.safeMax != null && (
                      <ReferenceLine y={activeDef.safeMax} stroke="var(--danger)" strokeDasharray="4 3"
                        label={{ value: activeDef.whoLabel, fill: 'var(--danger)', fontSize: 10, position: 'right' }} />
                    )}
                    {activeDef?.safeMin != null && (
                      <ReferenceLine y={activeDef.safeMin} stroke="var(--warning)" strokeDasharray="4 3" />
                    )}
                    <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--accent)' }} />
                  </LineChart>
                </ResponsiveContainer>
              )
            }
          </CardBody>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--s6)' }}>
        {/* Alert history */}
        <Card>
          <CardHeader title="Alert History" eyebrow="THIS LOCATION" />
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Parameter</th><th>Value</th><th>Threshold</th><th>Severity</th><th>Triggered</th><th>Status</th></tr>
              </thead>
              <tbody>
                {alerts.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 'var(--s6)', color: 'var(--text-muted)' }}>No alerts for this location.</td></tr>
                )}
                {alerts.map(a => (
                  <tr key={a.id}>
                    <td>{WHO_PARAMS[a.parameter]?.label ?? a.parameter}</td>
                    <td className="mono" style={{ color: a.severity === 'danger' ? 'var(--danger)' : 'var(--warning)' }}>{a.value}</td>
                    <td className="mono">{a.threshold ?? '—'}</td>
                    <td><Badge tone={a.severity}>{a.severity === 'danger' ? 'Critical' : 'Warning'}</Badge></td>
                    <td style={{ color: 'var(--text-muted)' }}>{fmtDate(a.triggered)}</td>
                    <td style={{ color: a.status === 'resolved' ? 'var(--safe)' : 'var(--text-muted)' }}>{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Info + mini map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>
          <Card>
            <CardHeader title="Location Info" />
            <CardBody style={{ padding: 'var(--s4) var(--s5)' }}>
              <Info label="Utility"    value={source.name} />
              <Info label="County"     value={source.county} />
              {source.sensorId && <Info label="Sensor ID"  value={source.sensorId} mono />}
              {source.installed && <Info label="Installed"  value={source.installed} />}
              {source.battery != null && (
                <Info label="Battery" value={`${source.battery}%`} accent={source.battery < 30 ? 'warning' : undefined} />
              )}
              <Info label="Parameters tested" value={`${displayParams.length} parameters`} />
            </CardBody>
          </Card>
          {source.lat != null && source.lng != null && (
            <Card style={{ padding: 0 }}>
              <UtilityMap height={220} utilities={[source]} />
            </Card>
          )}
        </div>
      </div>

      <div style={{ paddingTop: 'var(--s4)' }}>
        <Link to="/dashboard" className="btn btn-ghost">← Back to Dashboard</Link>
      </div>
    </>
  );
}

function Info(props: { label: string; value: React.ReactNode; mono?: boolean; accent?: 'warning' | 'danger' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--s2) 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.8125rem' }}>
      <span style={{ color: 'var(--text-muted)' }}>{props.label}</span>
      <span className={props.mono ? 'mono' : ''} style={{ color: props.accent ? `var(--${props.accent})` : 'var(--text-primary)', fontWeight: 500 }}>{props.value}</span>
    </div>
  );
}
