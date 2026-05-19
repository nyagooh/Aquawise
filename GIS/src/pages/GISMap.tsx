/**
 * GISMap — real Kisumu water supply network.
 *
 * Renders 4,951 pipe segments from the converted shapefile across five
 * operational layers (mains, distribution, service, backfeed, zone boundary)
 * plus a synthesized telemetry overlay (tanks, pressure valves, meter
 * valves, flow+pressure sensors). Click any asset to see its full operational
 * profile in the side panel.
 */
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { Shell } from '../components/Shell';
import { SidePanel, SpRow } from '../components/SidePanel';
import { useTheme } from '../theme';
import {
  loadNetwork,
  type NetworkData,
  type PipeClass,
  type PipeFeature,
  type AssetFeature,
  type AssetKind,
  PIPE_STYLE,
  PIPE_CLASS_ORDER,
  ASSET_STYLE,
  ASSET_ORDER,
  STATUS_COLOR,
  zoneLabel
} from '../data/network';

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/">OSM</a> · <a href="https://carto.com/">CARTO</a> · Kisumu Water & Sanitation Co.';

type Focus =
  | { kind: 'pipe'; feature: PipeFeature }
  | { kind: 'asset'; feature: AssetFeature }
  | null;

type LayerVis = Record<PipeClass | AssetKind, boolean>;

const DEFAULT_LAYERS: LayerVis = {
  main: true,
  distribution: true,
  household: false,        // off by default — turn on at street zoom
  backfeed: true,
  boundary: false,         // reference-only · off by default to declutter
  tank: true,
  pressure_valve: true,
  meter_valve: true,
  sensor: true
};

const PIPE_KEYS: PipeClass[] = PIPE_CLASS_ORDER;
const ASSET_KEYS: AssetKind[] = ASSET_ORDER;

export default function GISMap() {
  const { mode } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [network, setNetwork] = useState<NetworkData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [layers, setLayers] = useState<LayerVis>(DEFAULT_LAYERS);
  const [focus, setFocus] = useState<Focus>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const rendererRef = useRef<L.Canvas | null>(null);
  const layerGroupsRef = useRef<Partial<Record<PipeClass | AssetKind, L.LayerGroup>>>({});
  const focusOutlineRef = useRef<L.Layer | null>(null);

  /* ── 1. fetch network ── */
  useEffect(() => {
    let alive = true;
    loadNetwork()
      .then((data) => { if (alive) setNetwork(data); })
      .catch((err) => {
        console.error(err);
        if (alive) setLoadError(err.message || 'Unable to load network data.');
      });
    return () => { alive = false; };
  }, []);

  /* ── 2. initialise map once we have data ── */
  useEffect(() => {
    if (!mapRef.current || !network || leafletRef.current) return;

    const [lonMin, latMin, lonMax, latMax] = network.meta.bbox;
    const map = L.map(mapRef.current, {
      center: [network.meta.center[1], network.meta.center[0]],
      zoom: 13,
      preferCanvas: true,
      zoomControl: true,
      attributionControl: true,
      maxBounds: L.latLngBounds([latMin - 0.1, lonMin - 0.1], [latMax + 0.1, lonMax + 0.1]),
      minZoom: 10,
      maxZoom: 19
    });
    leafletRef.current = map;
    // Larger click tolerance — household lines are hairline, so a 6 px buffer
    // makes them clickable without forcing the operator to pixel-hunt.
    rendererRef.current = L.canvas({ padding: 0.4, tolerance: 6 });

    tileRef.current = L.tileLayer(mode === 'dark' ? TILE_DARK : TILE_LIGHT, {
      attribution: TILE_ATTR,
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    /* layer groups */
    const groups: Partial<Record<PipeClass | AssetKind, L.LayerGroup>> = {};
    [...PIPE_KEYS, ...ASSET_KEYS].forEach((k) => {
      const g = L.layerGroup();
      groups[k] = g;
      if (DEFAULT_LAYERS[k]) g.addTo(map);
    });
    layerGroupsRef.current = groups;

    /* pipes — paint household first (under), then distribution, backfeed,
       boundary, mains last so trunk lines render on top of branches. */
    const renderer = rendererRef.current;
    const sorted = [...network.pipes].sort((a, b) => {
      const order: Record<PipeClass, number> = {
        household: 0, boundary: 1, distribution: 2, backfeed: 3, main: 4
      };
      return order[a.properties.ui_class] - order[b.properties.ui_class];
    });
    sorted.forEach((feat) => {
      const cls = feat.properties.ui_class;
      const group = groups[cls];
      if (!group) return;
      const style = PIPE_STYLE[cls];
      const coords: [number, number][] = feat.geometry.coordinates.map(
        ([lon, lat]) => [lat, lon]
      );
      const line = L.polyline(coords, {
        color: style.color,
        weight: style.weight,
        opacity: style.opacity,
        dashArray: style.dashArray,
        lineCap: 'round',
        lineJoin: 'round',
        renderer
      });
      line.bindPopup(() => pipePopupHtml(feat), {
        className: 'aw-popup aw-popup-pipe',
        closeButton: false,
        offset: [0, -2],
        maxWidth: 280
      });
      line.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setFocus({ kind: 'pipe', feature: feat });
      });
      line.on('mouseover', () => line.setStyle({
        color: style.hoverColor,
        weight: style.hoverWeight,
        opacity: 1
      }));
      line.on('mouseout', () => line.setStyle({
        color: style.color,
        weight: style.weight,
        opacity: style.opacity
      }));
      line.addTo(group);
    });

    /* Zoom-aware weight scaling — pipes thicker at city scale, hairline
       when zoomed all the way out. */
    map.on('zoomend', () => {
      const z = map.getZoom();
      const scale = z >= 17 ? 1.35 : z >= 15 ? 1.15 : z >= 13 ? 1 : 0.78;
      Object.entries(groups).forEach(([key, grp]) => {
        if (!grp || !PIPE_KEYS.includes(key as PipeClass)) return;
        const style = PIPE_STYLE[key as PipeClass];
        grp.eachLayer((layer) => {
          (layer as L.Polyline).setStyle({ weight: style.weight * scale });
        });
      });
    });

    /* assets — points */
    network.assets.forEach((feat) => {
      const props = feat.properties;
      const [lon, lat] = feat.geometry.coordinates;
      const marker = L.marker([lat, lon], {
        icon: assetIcon(feat)
      });
      marker.bindPopup(() => assetPopupHtml(feat), {
        className: `aw-popup aw-popup-${props.asset}`,
        closeButton: false,
        offset: [0, -14],
        maxWidth: 280
      });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setFocus({ kind: 'asset', feature: feat });
      });
      marker.bindTooltip(assetTooltip(feat), { direction: 'top', offset: [0, -10], opacity: 1 });
      const grp = groups[props.asset];
      if (grp) marker.addTo(grp);
    });

    /* dismiss focus on empty click */
    map.on('click', () => setFocus(null));

    return () => {
      map.remove();
      leafletRef.current = null;
      layerGroupsRef.current = {};
      tileRef.current = null;
    };
    // mode is read at init; subsequent changes handled by the tile-swap effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  /* ── 3. swap tiles on theme change without recreating map ── */
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;
    if (tileRef.current) map.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(mode === 'dark' ? TILE_DARK : TILE_LIGHT, {
      attribution: TILE_ATTR,
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);
  }, [mode]);

  /* ── 4. layer toggles ── */
  useEffect(() => {
    const map = leafletRef.current;
    const groups = layerGroupsRef.current;
    if (!map) return;
    ([...PIPE_KEYS, ...ASSET_KEYS] as Array<PipeClass | AssetKind>).forEach((k) => {
      const g = groups[k];
      if (!g) return;
      const on = layers[k];
      const has = map.hasLayer(g);
      if (on && !has) g.addTo(map);
      if (!on && has) map.removeLayer(g);
    });
  }, [layers]);

  /* ── 5. focus outline (selected pipe highlight) ── */
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;
    if (focusOutlineRef.current) {
      map.removeLayer(focusOutlineRef.current);
      focusOutlineRef.current = null;
    }
    if (focus?.kind === 'pipe') {
      const coords: [number, number][] = focus.feature.geometry.coordinates.map(
        ([lon, lat]) => [lat, lon]
      );
      const ring = L.polyline(coords, {
        color: '#facc15',
        weight: 6,
        opacity: 0.55,
        lineCap: 'round',
        lineJoin: 'round'
      });
      ring.addTo(map);
      focusOutlineRef.current = ring;
      map.flyToBounds(ring.getBounds(), { duration: 0.5, padding: [40, 40], maxZoom: 17 });
    } else if (focus?.kind === 'asset') {
      const [lon, lat] = focus.feature.geometry.coordinates;
      map.flyTo([lat, lon], Math.max(map.getZoom(), 16), { duration: 0.5 });
    }
  }, [focus]);

  /* ── 6. honour ?focus=<kind>:<id> from deep links ── */
  useEffect(() => {
    if (!network) return;
    const f = searchParams.get('focus');
    if (!f) return;
    const [kind, id] = f.split(':');
    if (!id) return;
    if (kind === 'asset') {
      const match = network.assets.find((a) => a.properties.id === id);
      if (match) {
        setLayers((p) => ({ ...p, [match.properties.asset]: true }));
        setFocus({ kind: 'asset', feature: match });
      }
    } else if (kind === 'pipe') {
      const match = network.pipes.find((p) => p.properties.id === id);
      if (match) {
        setLayers((p) => ({ ...p, [match.properties.ui_class]: true }));
        setFocus({ kind: 'pipe', feature: match });
      }
    }
    // consume the param so a refresh doesn't keep re-focusing
    const next = new URLSearchParams(searchParams);
    next.delete('focus');
    setSearchParams(next, { replace: true });
  }, [network, searchParams, setSearchParams]);

  const toggleLayer = useCallback(
    (k: PipeClass | AssetKind) => setLayers((p) => ({ ...p, [k]: !p[k] })),
    []
  );
  const setAllPipes = useCallback((on: boolean) => {
    setLayers((p) => ({ ...p, main: on, distribution: on, service: on, backfeed: on, boundary: on }));
  }, []);
  const setAllAssets = useCallback((on: boolean) => {
    setLayers((p) => ({ ...p, tank: on, pressure_valve: on, meter_valve: on, sensor: on }));
  }, []);

  const visibleStats = useMemo(() => {
    if (!network) return null;
    const pipeCounts: Record<PipeClass, number> = {
      main: 0, distribution: 0, household: 0, backfeed: 0, boundary: 0
    };
    for (const f of network.pipes) pipeCounts[f.properties.ui_class]++;
    const assetCounts: Record<AssetKind, number> = {
      tank: 0, pressure_valve: 0, meter_valve: 0, sensor: 0
    };
    for (const a of network.assets) assetCounts[a.properties.asset]++;
    return { pipeCounts, assetCounts };
  }, [network]);

  return (
    <Shell active="gis" title="GIS Map" sub="Kisumu Water Supply Network · live operational view" pagePadding={false} hideRightRail>
      <div className="gis-canvas gis-canvas--real">
        <div ref={mapRef} className="gis-leaflet" />

        {!network && !loadError && (
          <div className="map-loading">
            <div className="map-loading-spinner" />
            <div className="map-loading-text">Loading Kisumu water network …</div>
            <div className="map-loading-sub">4,951 polylines · reprojecting UTM 36S → WGS84</div>
          </div>
        )}
        {loadError && (
          <div className="map-loading map-loading--error">
            <div className="map-loading-text">Couldn't load network data</div>
            <div className="map-loading-sub">{loadError}</div>
          </div>
        )}

        {network && visibleStats && (
          <>
            <LayerControl
              layers={layers}
              counts={visibleStats}
              onToggle={toggleLayer}
              onAllPipes={setAllPipes}
              onAllAssets={setAllAssets}
              meta={network.meta}
            />
            <StatBadge meta={network.meta} />
          </>
        )}
      </div>

      {focus?.kind === 'pipe' && (
        <PipePanel feature={focus.feature} onClose={() => setFocus(null)} />
      )}
      {focus?.kind === 'asset' && (
        <AssetPanel feature={focus.feature} onClose={() => setFocus(null)} />
      )}
    </Shell>
  );
}

/* ─────────────────────────────────────────
   Map icons — divIcons for each asset kind
   ───────────────────────────────────────── */

function assetIcon(feat: AssetFeature): L.DivIcon {
  const props = feat.properties;
  const kind = props.asset;
  const status = props.status;
  const palette = ASSET_STYLE[kind];
  const statusColor = STATUS_COLOR[status];
  if (kind === 'tank') {
    const level = (props as { level_pct: number }).level_pct;
    const lvlColor = level > 70 ? '#22C55E' : level > 35 ? '#F59E0B' : '#EF4444';
    return L.divIcon({
      className: 'aw-marker',
      html: `<div class="aw-asset-marker aw-tank" style="--ac:${palette.color};--sc:${statusColor};--lc:${lvlColor}">
        <div class="aw-tank-shell">
          <div class="aw-tank-fill" style="height:${level}%"></div>
          <span class="aw-tank-label">${level}%</span>
        </div>
      </div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });
  }
  if (kind === 'pressure_valve') {
    return L.divIcon({
      className: 'aw-marker',
      html: `<div class="aw-asset-marker aw-prv" style="--ac:${palette.color};--sc:${statusColor}">
        <svg viewBox="0 0 24 24" width="22" height="22"><polygon points="12,3 21,20 3,20" fill="var(--ac)" stroke="white" stroke-width="2"/></svg>
        <span class="aw-status-dot" style="background:${statusColor}"></span>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }
  if (kind === 'meter_valve') {
    return L.divIcon({
      className: 'aw-marker',
      html: `<div class="aw-asset-marker aw-mv" style="--ac:${palette.color};--sc:${statusColor}">
        <svg viewBox="0 0 24 24" width="22" height="22"><rect x="4" y="4" width="16" height="16" rx="3" transform="rotate(45 12 12)" fill="var(--ac)" stroke="white" stroke-width="2"/></svg>
        <span class="aw-status-dot" style="background:${statusColor}"></span>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }
  return L.divIcon({
    className: 'aw-marker',
    html: `<div class="aw-asset-marker aw-sensor" style="--ac:${palette.color};--sc:${statusColor}">
      <span class="aw-sensor-pulse"></span>
      <span class="aw-sensor-dot"></span>
    </div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function assetTooltip(feat: AssetFeature): string {
  const p = feat.properties;
  if (p.asset === 'tank') return `${p.name} · level sensor ${p.level_pct}%`;
  if (p.asset === 'pressure_valve') return `${p.name} · ${p.live_bar} bar`;
  if (p.asset === 'meter_valve') return `${p.name} · ⌀${p.size_mm} mm`;
  return `${p.name} · ${p.flow_lps} L/s`;
}

/* ─────────────────────────────────────────
   Click popups — Qatium-style key facts at
   the click location. Side panel opens for
   the full operational record.
   ───────────────────────────────────────── */

function pipePopupHtml(feat: PipeFeature): string {
  const p = feat.properties;
  const style = PIPE_STYLE[p.ui_class];
  const length = p.length_m ? `${p.length_m < 1 ? p.length_m.toFixed(1) : p.length_m.toFixed(0)} m` : '—';
  const dia = p.diameter_mm ? `⌀${p.diameter_mm} mm` : '⌀—';
  const status = p.status === 'closed'
    ? `<span class="aw-pop-pill aw-pop-pill--warn">Closed</span>`
    : p.service === 'in-service'
      ? `<span class="aw-pop-pill aw-pop-pill--ok">In service</span>`
      : p.service === 'out-of-service'
        ? `<span class="aw-pop-pill aw-pop-pill--bad">Out of service</span>`
        : `<span class="aw-pop-pill aw-pop-pill--muted">Open</span>`;
  return `
    <div class="aw-pop">
      <div class="aw-pop-head">
        <span class="aw-pop-swatch" style="background:${style.color}"></span>
        <div class="aw-pop-head-text">
          <div class="aw-pop-title">${escapeHtml(style.label)}</div>
          <div class="aw-pop-sub">${escapeHtml(p.id)}</div>
        </div>
        ${status}
      </div>
      <div class="aw-pop-grid">
        <div><span>Material</span><strong>${escapeHtml(p.material || '—')}</strong></div>
        <div><span>Diameter</span><strong>${dia}</strong></div>
        <div><span>Length</span><strong>${length}</strong></div>
        <div><span>Zone</span><strong>${escapeHtml(p.zone ? zoneLabel(p.zone) : '—')}</strong></div>
        <div><span>Installed</span><strong>${p.installed || '—'}</strong></div>
        <div><span>Pressure</span><strong>${p.ui_class === 'main' ? '3.4 bar' : p.ui_class === 'backfeed' ? '— (closed)' : '2.6 bar'}</strong></div>
      </div>
      <div class="aw-pop-foot">Click again for full operational record →</div>
    </div>`;
}

function assetPopupHtml(feat: AssetFeature): string {
  const p = feat.properties;
  const statusPill =
    p.status === 'ok'
      ? `<span class="aw-pop-pill aw-pop-pill--ok">${p.asset === 'sensor' ? 'Online' : 'OK'}</span>`
      : p.status === 'warn'
        ? `<span class="aw-pop-pill aw-pop-pill--warn">Watch</span>`
        : `<span class="aw-pop-pill aw-pop-pill--bad">Alarm</span>`;
  if (p.asset === 'tank') {
    const lvlColor = p.level_pct > 70 ? '#22C55E' : p.level_pct > 35 ? '#F59E0B' : '#EF4444';
    return `
      <div class="aw-pop">
        <div class="aw-pop-head">
          <span class="aw-pop-swatch sq" style="background:${ASSET_STYLE.tank.color}"></span>
          <div class="aw-pop-head-text">
            <div class="aw-pop-title">${escapeHtml(p.name)}</div>
            <div class="aw-pop-sub">${escapeHtml(p.id)} · reservoir · level sensor</div>
          </div>
          ${statusPill}
        </div>
        <div class="aw-pop-level">
          <div class="aw-pop-level-label">Level sensor</div>
          <div class="aw-pop-level-value" style="color:${lvlColor}">${p.level_pct}%</div>
          <div class="aw-pop-level-bar"><div style="width:${p.level_pct}%;background:${lvlColor}"></div></div>
        </div>
        <div class="aw-pop-grid">
          <div><span>Capacity</span><strong>${p.capacity_m3.toLocaleString()} m³</strong></div>
          <div><span>Stored</span><strong>${Math.round(p.capacity_m3 * p.level_pct / 100).toLocaleString()} m³</strong></div>
          <div><span>Inflow</span><strong>${p.inflow_lps} L/s</strong></div>
          <div><span>Outflow</span><strong>${p.outflow_lps} L/s</strong></div>
        </div>
        <div class="aw-pop-foot">Click again for full reservoir record →</div>
      </div>`;
  }
  if (p.asset === 'pressure_valve') {
    const drift = (p.live_bar - p.set_bar).toFixed(2);
    return `
      <div class="aw-pop">
        <div class="aw-pop-head">
          <span class="aw-pop-swatch tri" style="background:${ASSET_STYLE.pressure_valve.color}"></span>
          <div class="aw-pop-head-text">
            <div class="aw-pop-title">${escapeHtml(p.name)}</div>
            <div class="aw-pop-sub">${escapeHtml(p.id)} · pressure reducing valve</div>
          </div>
          ${statusPill}
        </div>
        <div class="aw-pop-grid">
          <div><span>Live reading</span><strong>${p.live_bar} bar</strong></div>
          <div><span>Set point</span><strong>${p.set_bar} bar</strong></div>
          <div><span>Drift</span><strong>${drift} bar</strong></div>
          <div><span>Range</span><strong>${p.min_bar}–${p.max_bar} bar</strong></div>
        </div>
        <div class="aw-pop-foot">Click again for full valve record →</div>
      </div>`;
  }
  if (p.asset === 'meter_valve') {
    return `
      <div class="aw-pop">
        <div class="aw-pop-head">
          <span class="aw-pop-swatch dia" style="background:${ASSET_STYLE.meter_valve.color}"></span>
          <div class="aw-pop-head-text">
            <div class="aw-pop-title">${escapeHtml(p.name)}</div>
            <div class="aw-pop-sub">${escapeHtml(p.id)} · bulk meter valve</div>
          </div>
          ${statusPill}
        </div>
        <div class="aw-pop-grid">
          <div><span>Size</span><strong>⌀${p.size_mm} mm</strong></div>
          <div><span>State</span><strong>${escapeHtml(p.state)}</strong></div>
          <div><span>Today</span><strong>${p.consumption_m3d.toLocaleString()} m³</strong></div>
          <div><span>Trend</span><strong>${p.consumption_m3d > 700 ? '▲ rising' : '▬ steady'}</strong></div>
        </div>
        <div class="aw-pop-foot">Click again for full meter record →</div>
      </div>`;
  }
  // sensor
  return `
    <div class="aw-pop">
      <div class="aw-pop-head">
        <span class="aw-pop-swatch dot" style="background:${ASSET_STYLE.sensor.color}"></span>
        <div class="aw-pop-head-text">
          <div class="aw-pop-title">${escapeHtml(p.name)}</div>
          <div class="aw-pop-sub">${escapeHtml(p.id)} · ${escapeHtml(p.type)}</div>
        </div>
        ${statusPill}
      </div>
      <div class="aw-pop-grid">
        <div><span>Flow</span><strong>${p.flow_lps} L/s</strong></div>
        <div><span>Pressure</span><strong>${p.pressure_bar} bar</strong></div>
        <div><span>Last reading</span><strong>${escapeHtml(p.last_seen)}</strong></div>
        <div><span>On pipe</span><strong>${escapeHtml(p.pipe_id)}</strong></div>
      </div>
      <div class="aw-pop-foot">Click again for full sensor record →</div>
    </div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' :
    c === '<' ? '&lt;' :
    c === '>' ? '&gt;' :
    c === '"' ? '&quot;' : '&#39;');
}

/* ─────────────────────────────────────────
   Floating layer control (top-left)
   ───────────────────────────────────────── */

function LayerControl({
  layers,
  counts,
  onToggle,
  onAllPipes,
  onAllAssets,
  meta
}: {
  layers: LayerVis;
  counts: { pipeCounts: Record<PipeClass, number>; assetCounts: Record<AssetKind, number> };
  onToggle: (k: PipeClass | AssetKind) => void;
  onAllPipes: (on: boolean) => void;
  onAllAssets: (on: boolean) => void;
  meta: NetworkData['meta'];
}) {
  const [expanded, setExpanded] = useState(true);
  const visiblePipeCount = PIPE_KEYS.reduce((sum, k) => sum + (layers[k] ? counts.pipeCounts[k] : 0), 0);
  const visibleAssetCount = ASSET_KEYS.reduce((sum, k) => sum + (layers[k] ? counts.assetCounts[k] : 0), 0);

  return (
    <div className={`gis-layer-control${expanded ? '' : ' collapsed'}`}>
      <div className="gis-layer-control-head" onClick={() => setExpanded((x) => !x)}>
        <div>
          <div className="gis-lc-title">Layers</div>
          <div className="gis-lc-meta">{visiblePipeCount.toLocaleString()} pipes · {visibleAssetCount} assets</div>
        </div>
        <button className="gis-lc-collapse" aria-label="Collapse layers">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points={expanded ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
          </svg>
        </button>
      </div>
      {expanded && (
        <div className="gis-layer-control-body">
          <div className="gis-lc-section">
            <div className="gis-lc-section-head">
              <span>Network</span>
              <div className="gis-lc-bulk">
                <button onClick={(e) => { e.stopPropagation(); onAllPipes(true); }}>All</button>
                <button onClick={(e) => { e.stopPropagation(); onAllPipes(false); }}>None</button>
              </div>
            </div>
            {PIPE_KEYS.map((k) => (
              <LayerToggle
                key={k}
                label={PIPE_STYLE[k].label}
                count={counts.pipeCounts[k]}
                on={layers[k]}
                swatch={<PipeSwatch cls={k} />}
                onClick={() => onToggle(k)}
              />
            ))}
          </div>
          <div className="gis-lc-section">
            <div className="gis-lc-section-head">
              <span>Telemetry</span>
              <div className="gis-lc-bulk">
                <button onClick={(e) => { e.stopPropagation(); onAllAssets(true); }}>All</button>
                <button onClick={(e) => { e.stopPropagation(); onAllAssets(false); }}>None</button>
              </div>
            </div>
            {ASSET_KEYS.map((k) => (
              <LayerToggle
                key={k}
                label={ASSET_STYLE[k].label}
                count={counts.assetCounts[k]}
                on={layers[k]}
                swatch={<AssetSwatch kind={k} />}
                onClick={() => onToggle(k)}
              />
            ))}
          </div>
          <div className="gis-lc-section gis-lc-status">
            <div className="gis-lc-section-head"><span>Status</span></div>
            <div className="gis-lc-status-row">
              <span><span className="gis-status-dot" style={{ background: STATUS_COLOR.ok }} />Healthy</span>
              <span><span className="gis-status-dot" style={{ background: STATUS_COLOR.warn }} />Anomaly</span>
              <span><span className="gis-status-dot" style={{ background: STATUS_COLOR.alert }} />Critical</span>
            </div>
          </div>
          <div className="gis-lc-foot">
            <div><span>Total length</span><strong>{(meta.total_length_m / 1000).toFixed(1)} km</strong></div>
            <div><span>Zones</span><strong>{meta.top_zones.length}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}

function LayerToggle({ label, count, on, swatch, onClick }: {
  label: string; count: number; on: boolean; swatch: React.ReactNode; onClick: () => void;
}) {
  return (
    <button className={`gis-layer-toggle${on ? ' on' : ''}`} onClick={onClick} type="button">
      <span className="gis-lt-check">{on ? '✓' : ''}</span>
      <span className="gis-lt-swatch">{swatch}</span>
      <span className="gis-lt-label">{label}</span>
      <span className="gis-lt-count">{count.toLocaleString()}</span>
    </button>
  );
}

function PipeSwatch({ cls }: { cls: PipeClass }) {
  const s = PIPE_STYLE[cls];
  return (
    <span
      className="gis-pipe-swatch"
      style={{
        background: s.color,
        backgroundImage: s.dashArray ? `repeating-linear-gradient(90deg, ${s.color} 0 6px, transparent 6px 10px)` : undefined,
        height: Math.min(5, Math.max(2, s.weight))
      }}
    />
  );
}

function AssetSwatch({ kind }: { kind: AssetKind }) {
  const palette = ASSET_STYLE[kind];
  if (kind === 'tank') {
    // Mini level-gauge mirrors the actual tank marker on the map.
    return (
      <span
        className="gis-asset-swatch tank"
        style={{ borderColor: palette.color, color: palette.color }}
        aria-label="Reservoir level sensor"
      >
        <span className="gis-asset-swatch-tank-fill" />
      </span>
    );
  }
  if (kind === 'pressure_valve') {
    return (
      <svg width={14} height={14} viewBox="0 0 14 14">
        <polygon points="7,2 13,12 1,12" fill={palette.color} />
      </svg>
    );
  }
  if (kind === 'meter_valve') {
    return (
      <svg width={14} height={14} viewBox="0 0 14 14">
        <rect x={3} y={3} width={8} height={8} rx={1.5} transform="rotate(45 7 7)" fill={palette.color} />
      </svg>
    );
  }
  return (
    <span
      className="gis-asset-swatch sensor"
      style={{ background: palette.color, boxShadow: `0 0 0 3px ${palette.color}33` }}
    />
  );
}

/* Legend was merged into LayerControl — see status block + per-row swatches. */

/* ─────────────────────────────────────────
   Network stats badge (top-right)
   ───────────────────────────────────────── */

function StatBadge({ meta }: { meta: NetworkData['meta'] }) {
  return (
    <div className="gis-stat-badge">
      <div className="gis-stat-row">
        <span>Live network</span>
        <strong>Kisumu</strong>
      </div>
      <div className="gis-stat-row">
        <span>Pipe segments</span>
        <strong>{meta.feature_count.toLocaleString()}</strong>
      </div>
      <div className="gis-stat-row">
        <span>Total length</span>
        <strong>{(meta.total_length_m / 1000).toFixed(1)} km</strong>
      </div>
      <div className="gis-stat-row">
        <span>Service zones</span>
        <strong>{meta.top_zones.filter(([z]) => z.length <= 6).length}</strong>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Side panels
   ───────────────────────────────────────── */

function PipePanel({ feature, onClose }: { feature: PipeFeature; onClose: () => void }) {
  const p = feature.properties;
  const style = PIPE_STYLE[p.ui_class];
  const flowDir =
    p.node_from && p.node_to ? `${p.node_from} → ${p.node_to}` : '—';
  const zoneName = p.zone ? zoneLabel(p.zone) : '—';

  return (
    <SidePanel
      open
      onClose={onClose}
      kind={style.label}
      title={p.id}
      pill={{
        tone: p.ui_class === 'backfeed' ? 'warn' : p.status === 'closed' ? 'muted' : 'safe',
        label: p.status === 'closed' ? 'Closed' : p.service === 'in-service' ? 'In service' : p.service === 'out-of-service' ? 'Out of service' : 'Open'
      }}
    >
      <SectionLabel>Geometry</SectionLabel>
      <SpRow label="Pipe type" value={style.label} />
      <SpRow label="Material" value={p.material || '—'} />
      <SpRow label="Diameter" value={p.diameter_mm ? `${p.diameter_mm} mm` : '—'} mono />
      <SpRow label="Length" value={p.length_m ? `${p.length_m.toFixed(0)} m` : '—'} mono />
      <SpRow label="Pressure class" value={p.diameter_mm && p.diameter_mm >= 200 ? 'PN16' : p.diameter_mm && p.diameter_mm >= 100 ? 'PN12.5' : 'PN10'} />

      <div style={{ height: 14 }} />
      <SectionLabel>Operations</SectionLabel>
      <SpRow label="Status" value={p.status} color={p.status === 'closed' ? '#f59e0b' : '#22c55e'} />
      <SpRow label="Service" value={p.service.replace('-', ' ')} />
      <SpRow label="Flow direction" value={flowDir} mono />
      <SpRow label="Zone" value={zoneName} />
      <SpRow label="Installed" value={p.installed || '—'} mono />
      <SpRow label="DC ID" value={p.id} mono />
      {p.remarks && p.remarks.toUpperCase() !== 'OK' && p.remarks.toUpperCase() !== 'N/A' && (
        <SpRow label="Field note" value={p.remarks} />
      )}

      <div style={{ height: 14 }} />
      <SectionLabel>Live telemetry</SectionLabel>
      <SpRow
        label="Pressure"
        value={p.ui_class === 'main' ? '3.4 bar' : p.ui_class === 'backfeed' ? '— (closed)' : '2.6 bar'}
        mono
        color={p.ui_class === 'backfeed' ? '#94a3b8' : '#22c55e'}
      />
      <SpRow label="Flow estimate" value={p.diameter_mm ? `${Math.round((p.diameter_mm / 25) ** 1.6 * 0.8)} L/s` : '—'} mono />
      <SpRow label="Anomaly score" value="0.04" mono />
    </SidePanel>
  );
}

function AssetPanel({ feature, onClose }: { feature: AssetFeature; onClose: () => void }) {
  const p = feature.properties;
  if (p.asset === 'tank') {
    const lvlColor = p.level_pct > 70 ? '#22c55e' : p.level_pct > 35 ? '#f59e0b' : '#ef4444';
    return (
      <SidePanel
        open
        onClose={onClose}
        kind="Reservoir · level sensor"
        title={p.name}
        pill={{ tone: p.status === 'ok' ? 'safe' : 'warn', label: p.status === 'ok' ? 'Operating' : 'Watch' }}
      >
        <SectionLabel>Live level sensor</SectionLabel>
        <SpRow label="Level reading" value={`${p.level_pct}%`} mono color={lvlColor} />
        <div className="aw-level-bar">
          <div className="aw-level-fill" style={{ width: `${p.level_pct}%`, background: lvlColor }} />
        </div>
        <SpRow label="Volume stored" value={`${Math.round(p.capacity_m3 * p.level_pct / 100).toLocaleString()} m³`} mono />
        <SpRow label="Capacity" value={`${p.capacity_m3.toLocaleString()} m³`} mono />
        <SpRow label="Hours to empty" value={`${Math.max(1, Math.round((p.level_pct * p.capacity_m3 / 100) / Math.max(0.5, p.outflow_lps * 3.6)))}h`} mono />
        <div style={{ height: 14 }} />
        <SectionLabel>Flow</SectionLabel>
        <SpRow label="Inflow" value={`${p.inflow_lps} L/s`} mono color="#0B5FFF" />
        <SpRow label="Outflow" value={`${p.outflow_lps} L/s`} mono color="#F59E0B" />
        <SpRow label="Net" value={`${p.inflow_lps - p.outflow_lps >= 0 ? '+' : ''}${p.inflow_lps - p.outflow_lps} L/s`} mono />
        <div style={{ height: 14 }} />
        <SectionLabel>Identifier</SectionLabel>
        <SpRow label="Tank ID" value={p.id} mono />
        <SpRow label="Connecting pipes" value={p.junction_degree} mono />
      </SidePanel>
    );
  }
  if (p.asset === 'pressure_valve') {
    const drift = p.live_bar - p.set_bar;
    return (
      <SidePanel
        open
        onClose={onClose}
        kind="Pressure reducing valve"
        title={p.name}
        pill={{
          tone: p.status === 'ok' ? 'safe' : p.status === 'warn' ? 'warn' : 'danger',
          label: p.status === 'ok' ? 'Within range' : p.status === 'warn' ? 'Drifting' : 'Alarm'
        }}
      >
        <SectionLabel>Pressure</SectionLabel>
        <SpRow label="Set point" value={`${p.set_bar} bar`} mono />
        <SpRow label="Live reading" value={`${p.live_bar} bar`} mono color={p.status === 'alert' ? '#ef4444' : p.status === 'warn' ? '#f59e0b' : '#22c55e'} />
        <SpRow label="Drift" value={`${drift >= 0 ? '+' : ''}${drift.toFixed(2)} bar`} mono />
        <div style={{ height: 14 }} />
        <SectionLabel>Thresholds</SectionLabel>
        <SpRow label="Min allowed" value={`${p.min_bar} bar`} mono />
        <SpRow label="Max allowed" value={`${p.max_bar} bar`} mono />
        <SpRow label="Health" value={p.status === 'alert' ? 'Investigate' : 'Nominal'} />
        <div style={{ height: 14 }} />
        <SectionLabel>Identifier</SectionLabel>
        <SpRow label="Valve ID" value={p.id} mono />
      </SidePanel>
    );
  }
  if (p.asset === 'meter_valve') {
    return (
      <SidePanel
        open
        onClose={onClose}
        kind="Meter valve"
        title={p.name}
        pill={{ tone: p.status === 'ok' ? 'safe' : 'warn', label: p.state === 'open' ? 'Open' : 'Throttled' }}
      >
        <SectionLabel>Configuration</SectionLabel>
        <SpRow label="Nominal size" value={`⌀${p.size_mm} mm`} mono />
        <SpRow label="State" value={p.state} />
        <div style={{ height: 14 }} />
        <SectionLabel>Consumption</SectionLabel>
        <SpRow label="Today" value={`${p.consumption_m3d.toLocaleString()} m³`} mono color="#0B5FFF" />
        <SpRow label="7-day avg" value={`${Math.round(p.consumption_m3d * 0.92).toLocaleString()} m³`} mono />
        <SpRow label="Trend" value={p.consumption_m3d > 700 ? '▲ rising' : '▬ steady'} />
        <div style={{ height: 14 }} />
        <SectionLabel>Identifier</SectionLabel>
        <SpRow label="Meter ID" value={p.id} mono />
      </SidePanel>
    );
  }
  return (
    <SidePanel
      open
      onClose={onClose}
      kind="Flow + pressure sensor"
      title={p.name}
      pill={{ tone: p.status === 'ok' ? 'safe' : 'danger', label: p.status === 'ok' ? 'Online' : 'Alert' }}
    >
      <SectionLabel>Live reading</SectionLabel>
      <SpRow label="Flow rate" value={`${p.flow_lps} L/s`} mono color="#0B5FFF" />
      <SpRow label="Pressure" value={`${p.pressure_bar} bar`} mono color="#22c55e" />
      <SpRow label="Sensor type" value={p.type} />
      <SpRow label="Last reading" value={p.last_seen} mono />
      <div style={{ height: 14 }} />
      <SectionLabel>Consumption trend</SectionLabel>
      <Sparkline base={p.flow_lps} />
      <SpRow label="24h volume" value={`${Math.round(p.flow_lps * 86.4).toLocaleString()} m³`} mono />
      <div style={{ height: 14 }} />
      <SectionLabel>Linkage</SectionLabel>
      <SpRow label="On pipe" value={p.pipe_id} mono />
      <SpRow label="Sensor ID" value={p.id} mono />
    </SidePanel>
  );
}

function Sparkline({ base }: { base: number }) {
  const points = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 24; i++) {
      arr.push(base + Math.sin((i / 24) * Math.PI * 2) * (base * 0.18) + Math.cos(i * 1.7) * (base * 0.08));
    }
    return arr;
  }, [base]);
  const max = Math.max(...points);
  const min = Math.min(...points);
  const w = 320;
  const h = 60;
  const path = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg className="aw-sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={`${path} L${w},${h} L0,${h} Z`} fill="rgba(11,95,255,0.12)" />
      <path d={path} fill="none" stroke="#0B5FFF" strokeWidth={2} />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="sp-section-label">{children}</div>;
}
