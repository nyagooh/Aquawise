import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { Shell } from '../components/Shell';
import { useTheme } from '../theme';
import {
  zones, alerts, sensors, pipeLatLng,
  zonePolys, zoneCenters, sensorLatLng, MAP_CENTER, MAP_ZOOM,
  statusColor
} from '../data';

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TECH_BLUE = '#165DCC';

export default function Dashboard() {
  const navigate = useNavigate();
  const { mode } = useTheme();
  const activeAlerts = alerts.filter(a => a.status === 'active').slice(0, 4);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    const map = L.map(mapRef.current, {
      center: MAP_CENTER,
      zoom: MAP_ZOOM - 1,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: false,
      keyboard: false
    });
    leafletRef.current = map;
    tileRef.current = L.tileLayer(mode === 'dark' ? TILE_DARK : TILE_LIGHT, {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // zones
    Object.entries(zonePolys).forEach(([zid, poly]) => {
      const z = zones.find(z => z.id === zid)!;
      L.polygon(poly, {
        color: z.color, weight: 1.5, opacity: 0.9,
        fillColor: z.color, fillOpacity: 0.12, dashArray: '4 3'
      }).addTo(map);
    });

    // pipes (network flow lines)
    pipeLatLng.forEach(pipe => {
      L.polyline(pipe.path, {
        color: pipe.main ? TECH_BLUE : '#94A3B8',
        weight: pipe.main ? 3 : 2,
        opacity: 0.9,
        dashArray: pipe.main ? undefined : '4 4'
      }).addTo(map);
    });

    // sensors
    sensors.forEach(s => {
      const pos = sensorLatLng[s.id];
      if (!pos) return;
      const color = statusColor(s.status);
      L.marker(pos, {
        icon: L.divIcon({
          className: '',
          html: `<div style="width:10px;height:10px;border-radius:50%;background:${color};border:2px solid hsl(var(--background));box-shadow:0 0 0 1px ${color}"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5]
        })
      }).addTo(map);
    });

    return () => {
      map.remove();
      leafletRef.current = null;
      tileRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // theme swap
  useEffect(() => {
    const map = leafletRef.current;
    const old = tileRef.current;
    if (!map) return;
    if (old) map.removeLayer(old);
    tileRef.current = L.tileLayer(mode === 'dark' ? TILE_DARK : TILE_LIGHT, {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
  }, [mode]);

  const zoomIn = () => leafletRef.current?.zoomIn();
  const zoomOut = () => leafletRef.current?.zoomOut();

  const sevColor = (s: string) =>
    s === 'critical' ? 'hsl(var(--danger))' :
    s === 'warning' ? 'hsl(var(--warning))' :
    'hsl(var(--info))';
  const sevBg = (s: string) =>
    s === 'critical' ? 'hsl(var(--danger-bg))' :
    s === 'warning' ? 'hsl(var(--warning-bg))' :
    'hsl(var(--info-bg))';

  return (
    <Shell active="dashboard" title="Dashboard" sub="Network overview">
      {/* KPI grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s4)' }}>
        <Kpi tone="kpi-accent" label="Connected People" value="86,200" unit="served"      trend={{ kind: 'up',   text: '+1.2% this week' }}    onClick={() => navigate('/gis')} />
        <Kpi tone="kpi-danger" label="Active Alerts"    value={String(alerts.filter(a => a.status === 'active').length)} unit="open" trend={{ kind: 'down', text: '+2 in last hour' }} onClick={() => navigate('/alerts')} />
        <Kpi tone="kpi-warn"   label="Zones at Risk"    value="2"      unit="of 5"         trend={{ kind: 'flat', text: 'Zone B, Zone D' }}      onClick={() => navigate('/gis?filter=at-risk')} />
        <Kpi tone="kpi-safe"   label="Pressure Health"  value="88"     unit="%"            trend={{ kind: 'up',   text: '+3% vs yesterday' }} />
        <Kpi tone="kpi-safe"   label="Tank Level Health" value="78"    unit="%"            trend={{ kind: 'flat', text: 'Steady' }} />
        <Kpi tone="kpi-safe"   label="Sensor Health"    value="9"      unit="of 10 online" trend={{ kind: 'flat', text: 'PH-03 offline' }}     onClick={() => navigate('/sensors')} />
        <Kpi tone="kpi-accent" label="Total Pipes"      value="142"    unit="segments"     trend={{ kind: 'flat', text: 'PVC · HDPE · DI' }}   onClick={() => navigate('/sensors?type=pipe')} />
        <Kpi tone="kpi-accent" label="Total Sensors"    value="10"     unit="deployed"     trend={{ kind: 'up',   text: '9 active' }}          onClick={() => navigate('/sensors')} />
      </section>

      {/* Map preview + alerts feed */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--s4)' }}>
          <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Network overview</div>
              <div className="card-sub">5 zones · 10 sensors · 142 pipe segments</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/gis')}>Open GIS →</button>
          </div>
          <div
            onClick={() => navigate('/gis')}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <div ref={mapRef} style={{ height: 320, width: '100%' }} />
            <div className="map-zoom-controls">
              <button className="map-zoom-btn" onClick={(e) => { e.stopPropagation(); zoomIn(); }} aria-label="Zoom in">+</button>
              <button className="map-zoom-btn" onClick={(e) => { e.stopPropagation(); zoomOut(); }} aria-label="Zoom out">−</button>
            </div>
            <div style={{
              position: 'absolute', bottom: 12, right: 12,
              padding: '4px 10px',
              borderRadius: 'var(--r-md)',
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              fontSize: 11,
              fontWeight: 500,
              color: 'hsl(var(--muted-foreground))'
            }}>
              Click to open full map →
            </div>
          </div>
          </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Recent alerts</div>
              <div className="card-sub">Live feed</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alerts')}>All →</button>
          </div>
          <div>
            {activeAlerts.map(a => {
              const z = zones.find(z => z.id === a.zone);
              return (
                <div
                  key={a.id}
                  onClick={() => navigate(`/gis?focus=zone:${a.zone}`)}
                  style={{
                    display: 'flex', gap: 'var(--s3)',
                    padding: 'var(--s3) var(--s4)',
                    borderBottom: '1px solid hsl(var(--border))',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: 28, height: 28,
                    borderRadius: 'var(--r-md)',
                    background: sevBg(a.severity),
                    color: sevColor(a.severity),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1={12} y1={9} x2={12} y2={13} />
                      <line x1={12} y1={17} x2={12.01} y2={17} />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{a.type}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
                      {z?.name || a.zone} · {a.sensor}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap' }}>
                    {a.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Zones table + asset summary */}
      <section style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--s4)' }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Zones</div>
              <div className="card-sub">Click a zone to focus on the map</div>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>People</th>
                <th>Pressure</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(z => (
                <tr key={z.id} onClick={() => navigate(`/gis?focus=zone:${z.id}`)}>
                  <td><strong>{z.name}</strong></td>
                  <td className="mono">{z.people.toLocaleString()}</td>
                  <td className="mono">{z.pressure} bar</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`pill ${z.status}`}><span className="dot" />
                      {z.status === 'safe' ? 'Healthy' : z.status === 'warn' ? 'At risk' : 'Critical'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Asset summary</div>
                <div className="card-sub">Pipes &amp; sensors</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reports')}>Reports →</button>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--s3)' }}>
                <AssetTile label="Pipes" value="142" sub="PVC 64 · HDPE 52 · DI 26" onClick={() => navigate('/sensors?type=pipe')} />
                <AssetTile label="Sensors" value="10" sub="Pressure 4 · Level 3 · pH 3" onClick={() => navigate('/sensors')} />
                <AssetTile label="Zones" value="5" sub="86,200 people served" onClick={() => navigate('/gis')} />
                <AssetTile label="NRW today" value="12%" sub="+2.4% vs avg" subColor="hsl(var(--warning))" onClick={() => navigate('/nrw')} />
              </div>
            </div>
        </div>
      </section>
    </Shell>
  );
}

function Kpi({ tone, label, value, unit, trend, onClick }: {
  tone: 'kpi-accent' | 'kpi-safe' | 'kpi-warn' | 'kpi-danger';
  label: string;
  value: string;
  unit?: string;
  trend?: { kind: 'up' | 'down' | 'flat'; text: string };
  onClick?: () => void;
}) {
  return (
    <div className={`kpi ${tone}`} onClick={onClick} style={onClick ? undefined : { cursor: 'default' }}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}{unit && <span className="kpi-unit">{unit}</span>}</div>
      {trend && <div className={`kpi-trend ${trend.kind}`}>{trend.text}</div>}
    </div>
  );
}

function AssetTile({ label, value, sub, subColor, onClick }: {
  label: string; value: string; sub: string; subColor?: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: 'var(--r-md)',
        padding: 'var(--s3) var(--s4)',
        cursor: 'pointer',
        transition: 'border-color 150ms'
      }}
    >
      <div style={{ fontSize: '0.6875rem', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: 2, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.6875rem', color: subColor || 'hsl(var(--muted-foreground))', marginTop: 2 }}>{sub}</div>
    </div>
  );
}
