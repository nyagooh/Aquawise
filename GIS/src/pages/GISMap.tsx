import { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { Shell } from '../components/Shell';
import { SidePanel, SpRow } from '../components/SidePanel';
import { useTheme } from '../theme';
import {
  zones, sensors, pipes, alerts,
  zonePolys, zoneCenters, pipeLatLng, tanksLatLng, sensorLatLng,
  MAP_CENTER, MAP_ZOOM,
  statusColor, statusLabel,
  type Zone, type Sensor, type Pipe
} from '../data';

type FocusKind = 'zone' | 'sensor' | 'pipe' | 'overview' | null;
type Focus = { kind: FocusKind; id: string | null };
type Layers = { zones: boolean; pipes: boolean; tanks: boolean; sensors: boolean };

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/">OSM</a> · <a href="https://carto.com/">CARTO</a>';
const TECH_BLUE = '#165DCC';

export default function GISMap() {
  const [params] = useSearchParams();
  const { mode } = useTheme();
  const [focus, setFocus] = useState<Focus>({ kind: null, id: null });
  const [layers, setLayers] = useState<Layers>({ zones: true, pipes: true, tanks: true, sensors: true });
  const [overviewPoint, setOverviewPoint] = useState<[number, number] | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const beepCtxRef = useRef<AudioContext | null>(null);
  const layerGroups = useRef<{ zones: L.LayerGroup; pipes: L.LayerGroup; tanks: L.LayerGroup; sensors: L.LayerGroup } | null>(null);
  const hasCritical = alerts.some(a => a.status === 'active' && a.severity === 'critical');

  /* ── init map once ── */
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    const map = L.map(mapRef.current, {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      zoomControl: true,
      attributionControl: true
    });
    leafletRef.current = map;

    tileRef.current = L.tileLayer(mode === 'dark' ? TILE_DARK : TILE_LIGHT, {
      attribution: TILE_ATTR,
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    const groups = {
      zones: L.layerGroup().addTo(map),
      pipes: L.layerGroup().addTo(map),
      tanks: L.layerGroup().addTo(map),
      sensors: L.layerGroup().addTo(map)
    };
    layerGroups.current = groups;

    // ── Zones (polygons) ──
    Object.entries(zonePolys).forEach(([zid, poly]) => {
      const z = zones.find(z => z.id === zid)!;
      const layer = L.polygon(poly, {
        color: z.color,
        weight: 2,
        opacity: 0.9,
        fillColor: z.color,
        fillOpacity: 0.12,
        dashArray: '6 4'
      }).addTo(groups.zones);
      layer.bindPopup(`<b>${z.name}</b><br/>${z.people.toLocaleString()} people · ${z.pressure} bar · loss ${z.loss}%`);
      layer.on('click', () => setFocus({ kind: 'zone', id: zid }));
      // label at center
      const labelIcon = L.divIcon({
        className: 'zone-label-overlay',
        html: `<div style="
          background: hsla(var(--card) / 0.92);
          border: 1px solid hsl(var(--border));
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 500;
          color: hsl(var(--foreground));
          white-space: nowrap;
          font-family: var(--font);
          pointer-events: none;
        ">${z.name.split('—')[1]?.trim() || z.name}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });
      L.marker(zoneCenters[zid], { icon: labelIcon, interactive: false }).addTo(groups.zones);
    });

    // Click on blank map => overview at touched position
    map.on('click', (e: L.LeafletMouseEvent) => {
      setOverviewPoint([e.latlng.lat, e.latlng.lng]);
      setFocus({ kind: 'overview', id: null });
    });

    // ── Pipes (polylines) ──
    pipeLatLng.forEach(p => {
      const pipeData = pipes.find(pp => pp.id === p.id);
      const materialColor =
        pipeData?.type === 'PVC' ? '#22D3EE' :
        pipeData?.type === 'HDPE' ? TECH_BLUE :
        '#A78BFA';
      const layer = L.polyline(p.path, {
        color: materialColor,
        weight: p.main ? 4 : 3,
        opacity: 0.9,
        dashArray: p.main ? undefined : '4 4'
      }).addTo(groups.pipes);
      if (pipeData) {
        layer.bindPopup(`<b>${pipeData.id}</b><br/>${pipeData.type} · ⌀${pipeData.diameter} · ${pipeData.pressure}`);
        layer.on('click', () => setFocus({ kind: 'pipe', id: pipeData.id }));
      }
    });

    // ── Tanks (square divIcon) ──
    tanksLatLng.forEach(t => {
      const icon = L.divIcon({
        className: 'tank-icon',
        html: `<div style="
          width: 24px; height: 24px;
          background: hsl(var(--info) / 0.18);
          border: 2px solid hsl(var(--info));
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px;
          font-family: var(--font-mono);
          font-weight: 600;
          color: hsl(var(--info));
        ">${t.level}%</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      const m = L.marker(t.pos, { icon }).addTo(groups.tanks);
      m.bindPopup(`<b>Tank ${t.id}</b><br/>Level ${t.level}% · ${t.zone}`);
    });

    // ── Sensors (circular divIcon) ──
    sensors.forEach(s => {
      const pos = sensorLatLng[s.id];
      if (!pos) return;
      const color = statusColor(s.status);
      const icon = L.divIcon({
        className: 'sensor-icon',
        html: `<div style="
          position: relative;
          width: 14px; height: 14px;
        ">
          <div style="
            position: absolute; inset: 0;
            background: ${color};
            border: 2px solid hsl(var(--background));
            border-radius: 50%;
            box-shadow: 0 0 0 1px ${color};
          "></div>
        </div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });
      const m = L.marker(pos, { icon }).addTo(groups.sensors);
      m.bindPopup(`<b>${s.id}</b><br/>${s.type} · ${s.reading} · ${s.updated}`);
      m.on('click', () => setFocus({ kind: 'sensor', id: s.id }));
    });

    return () => {
      map.remove();
      leafletRef.current = null;
      tileRef.current = null;
      layerGroups.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // init only once

  // Danger alert sound + red flash whenever critical alert exists.
  useEffect(() => {
    if (!hasCritical) return;
    const beep = () => {
      try {
        const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return;
        if (!beepCtxRef.current) beepCtxRef.current = new Ctx();
        const ctx = beepCtxRef.current;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.value = 880;
        g.gain.value = 0.0001;
        o.connect(g);
        g.connect(ctx.destination);
        const now = ctx.currentTime;
        g.gain.exponentialRampToValueAtTime(0.06, now + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
        o.start(now);
        o.stop(now + 0.3);
      } catch {
        // ignore audio failures silently
      }
    };
    beep();
    const id = window.setInterval(beep, 18000);
    return () => window.clearInterval(id);
  }, [hasCritical]);

  /* ── theme: swap tile layer ── */
  useEffect(() => {
    const map = leafletRef.current;
    const oldTile = tileRef.current;
    if (!map) return;
    if (oldTile) map.removeLayer(oldTile);
    tileRef.current = L.tileLayer(mode === 'dark' ? TILE_DARK : TILE_LIGHT, {
      attribution: TILE_ATTR,
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
  }, [mode]);

  /* ── layer toggles ── */
  useEffect(() => {
    const map = leafletRef.current;
    const groups = layerGroups.current;
    if (!map || !groups) return;
    (['zones', 'pipes', 'tanks', 'sensors'] as const).forEach(k => {
      const has = map.hasLayer(groups[k]);
      if (layers[k] && !has) map.addLayer(groups[k]);
      if (!layers[k] && has) map.removeLayer(groups[k]);
    });
  }, [layers]);

  /* ── honor ?focus=... ── */
  useEffect(() => {
    const focusParam = params.get('focus');
    if (!focusParam) return;
    const [kind, id] = focusParam.split(':');
    if (kind === 'zone' || kind === 'sensor' || kind === 'pipe') {
      setFocus({ kind, id });
      const map = leafletRef.current;
      if (!map) return;
      if (kind === 'zone' && zoneCenters[id]) map.flyTo(zoneCenters[id], 14, { duration: 0.6 });
      if (kind === 'sensor' && sensorLatLng[id]) map.flyTo(sensorLatLng[id], 15, { duration: 0.6 });
      if (kind === 'pipe') {
        const p = pipeLatLng.find(p => p.id === id);
        if (p) {
          const mid: [number, number] = [
            (p.path[0][0] + p.path[1][0]) / 2,
            (p.path[0][1] + p.path[1][1]) / 2
          ];
          map.flyTo(mid, 14, { duration: 0.6 });
        }
      }
    }
  }, [params]);

  const focusedZone = useMemo<Zone | null>(() =>
    focus.kind === 'zone' ? zones.find(z => z.id === focus.id) || null : null,
    [focus]);
  const focusedSensor = useMemo<Sensor | null>(() =>
    focus.kind === 'sensor' ? sensors.find(s => s.id === focus.id) || null : null,
    [focus]);
  const focusedPipe = useMemo<Pipe | null>(() =>
    focus.kind === 'pipe' ? pipes.find(p => p.id === focus.id) || null : null,
    [focus]);
  const nearestZone = useMemo<Zone | null>(() => {
    if (!overviewPoint) return null;
    const [lat, lng] = overviewPoint;
    let best: Zone | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    zones.forEach(z => {
      const c = zoneCenters[z.id];
      const d = Math.hypot(c[0] - lat, c[1] - lng);
      if (d < bestDist) {
        bestDist = d;
        best = z;
      }
    });
    return best;
  }, [overviewPoint]);

  return (
    <Shell active="gis" title="GIS Map" sub="Aerial view · zones, pipes, tanks &amp; sensors" pagePadding={false}>
      <div className={`gis-canvas${hasCritical ? ' danger-active' : ''}`}>
        <div ref={mapRef} className="gis-leaflet" />
        {hasCritical && (
          <div className="danger-pill">Danger Alert Active · Zone D low pressure</div>
        )}

        <div className="chip-row">
          {(['zones', 'pipes', 'tanks', 'sensors'] as const).map(layer => (
            <div
              key={layer}
              className={`chip${layers[layer] ? ' active' : ''}`}
              onClick={() => setLayers(l => ({ ...l, [layer]: !l[layer] }))}
            >
              <span
                className="dot"
                style={{
                  background:
                    layer === 'tanks' ? 'hsl(var(--info))' :
                    layer === 'sensors' ? 'hsl(var(--safe))' :
                    layer === 'pipes' ? '#94A3B8' :
                    'hsl(var(--primary))'
                }}
              />
              {layer.charAt(0).toUpperCase() + layer.slice(1)}
            </div>
          ))}
        </div>

        <div className="legend">
          <div className="legend-title">Status</div>
          <div className="legend-row"><span className="swatch" style={{ background: '#22C55E' }} />Healthy</div>
          <div className="legend-row"><span className="swatch" style={{ background: '#F59E0B' }} />At risk</div>
          <div className="legend-row"><span className="swatch" style={{ background: '#EF4444' }} />Critical</div>
          <div className="legend-row"><span className="swatch" style={{ background: '#64748B' }} />Offline</div>
          <div style={{ height: 6 }} />
          <div className="legend-row"><span className="swatch line" style={{ background: TECH_BLUE }} />Main pipe</div>
          <div className="legend-row"><span className="swatch line" style={{ background: '#94A3B8' }} />Branch pipe</div>
        </div>
      </div>

      <SidePanel
        open={focus.kind === 'overview'}
        onClose={() => setFocus({ kind: null, id: null })}
        kind="Map overview"
        title={overviewPoint ? `${overviewPoint[0].toFixed(4)}, ${overviewPoint[1].toFixed(4)}` : 'Overview'}
        pill={nearestZone ? { tone: nearestZone.status, label: `Nearest: ${nearestZone.id}` } : undefined}
      >
        {overviewPoint && nearestZone && (
          <>
            <SpRow label="Nearest zone" value={nearestZone.name} />
            <SpRow label="People served" value={nearestZone.people.toLocaleString()} mono />
            <SpRow label="Pressure status" value={`${nearestZone.pressure} bar`} mono />
            <SpRow label="Active alerts" value={nearestZone.alerts} />
            <SpRow label="Estimated loss" value={`${nearestZone.loss}%`} mono />
            <div style={{ height: 16 }} />
            <button className="btn btn-primary btn-sm" onClick={() => setFocus({ kind: 'zone', id: nearestZone.id })}>
              Open zone details
            </button>
          </>
        )}
      </SidePanel>

      <SidePanel
        open={!!focusedZone}
        onClose={() => setFocus({ kind: null, id: null })}
        kind="Zone"
        title={focusedZone?.name || ''}
        pill={focusedZone ? {
          tone: focusedZone.status,
          label: focusedZone.status === 'safe' ? 'Healthy' : focusedZone.status === 'warn' ? 'At risk' : 'Critical'
        } : undefined}
      >
        {focusedZone && (() => {
          const zoneSensors = sensors.filter(s => s.zone === focusedZone.id);
          const zoneAlerts = alerts.filter(a => a.zone === focusedZone.id && a.status === 'active');
          return (
            <>
              <SpRow label="People served" value={focusedZone.people.toLocaleString()} mono />
              <SpRow label="Active alerts" value={focusedZone.alerts} />
              <SpRow label="Avg pressure" value={`${focusedZone.pressure} bar`} mono />
              <SpRow label="Estimated loss" value={`${focusedZone.loss}%`} mono />
              <div style={{ height: 18 }} />
              <SectionLabel>Sensors in zone ({zoneSensors.length})</SectionLabel>
              {zoneSensors.map(s => (
                <SpRow
                  key={s.id}
                  label={`${s.id} · ${s.type}`}
                  value={s.reading}
                  mono
                  color={statusColor(s.status)}
                  onClick={() => setFocus({ kind: 'sensor', id: s.id })}
                />
              ))}
              <div style={{ height: 18 }} />
              <SectionLabel>Active alerts ({zoneAlerts.length})</SectionLabel>
              {zoneAlerts.length === 0 ? (
                <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8125rem', textAlign: 'center', padding: 8 }}>
                  No active alerts
                </div>
              ) : zoneAlerts.map(a => (
                <SpRow
                  key={a.id}
                  label={a.type}
                  value={a.severity}
                  color={a.severity === 'critical' ? 'hsl(var(--danger))' : 'hsl(var(--warning))'}
                />
              ))}
            </>
          );
        })()}
      </SidePanel>

      <SidePanel
        open={!!focusedSensor}
        onClose={() => setFocus({ kind: null, id: null })}
        kind="Sensor"
        title={focusedSensor?.id || ''}
        pill={focusedSensor ? {
          tone: focusedSensor.status === 'offline' ? 'muted' : focusedSensor.status,
          label: statusLabel(focusedSensor.status)
        } : undefined}
      >
        {focusedSensor && (
          <>
            <SpRow label="Type" value={focusedSensor.type} />
            <SpRow label="Latest reading" value={focusedSensor.reading} mono color={statusColor(focusedSensor.status)} />
            <SpRow
              label="Zone"
              value={zones.find(z => z.id === focusedSensor.zone)?.name || focusedSensor.zone}
              onClick={() => setFocus({ kind: 'zone', id: focusedSensor.zone })}
            />
            <SpRow label="Last updated" value={focusedSensor.updated} mono />
          </>
        )}
      </SidePanel>

      <SidePanel
        open={!!focusedPipe}
        onClose={() => setFocus({ kind: null, id: null })}
        kind="Pipe segment"
        title={focusedPipe?.id || ''}
      >
        {focusedPipe && (
          <>
            <SpRow label="Material" value={focusedPipe.type} />
            <SpRow label="Diameter" value={focusedPipe.diameter} mono />
            <SpRow label="Pressure" value={focusedPipe.pressure} mono />
            <SpRow
              label="Zone"
              value={zones.find(z => z.id === focusedPipe.zone)?.name || focusedPipe.zone}
              onClick={() => setFocus({ kind: 'zone', id: focusedPipe.zone })}
            />
          </>
        )}
      </SidePanel>
    </Shell>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.6875rem',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      color: 'hsl(var(--muted-foreground))',
      fontWeight: 500,
      marginBottom: 8
    }}>
      {children}
    </div>
  );
}
