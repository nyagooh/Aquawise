import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { Shell } from '../components/Shell';
import { SidePanel, SpRow } from '../components/SidePanel';
import { useTheme } from '../theme';
import {
  loadNetwork,
  triggerSimulation,
  pollSimulation,
  renameNetwork,
  clearNetworkCache,
  type NetworkData,
  type SimulationData,
  type SimulationStatus,
  type PipeClass,
  type PipeFeature,
  type AssetFeature,
  type AssetKind,
  type JunctionFeature,
  PIPE_STYLE,
  PIPE_CLASS_ORDER,
  ASSET_STYLE,
  ASSET_ORDER,
  STATUS_COLOR,
  zoneLabel
} from '../data/network';

const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_DARK  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR  = '&copy; <a href="https://www.openstreetmap.org/">OSM</a> · <a href="https://carto.com/">CARTO</a>';
const TILE_GOOGLE_SATELLITE = 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
const TILE_GOOGLE_ATTR = 'Imagery &copy; <a href="https://www.google.com/maps">Google</a>';

/** Basemap mode — street map, satellite imagery, or bare engineering canvas. */
type Basemap = 'satellite' | 'streets' | 'none';

/** Build the active tile layer for the current basemap + theme. Returns null for 'none'.
 *  In 3D mode the CSS perspective transform reveals tiles beyond Leaflet's viewport bounds,
 *  so we double the buffer to avoid blank edges at the top of the tilted view. */
function makeTileLayer(basemap: Basemap, dark: boolean, is3D = false): L.TileLayer | null {
  const buf = is3D ? 12 : 6;
  if (basemap === 'none') return null;
  if (basemap === 'satellite') {
    return L.tileLayer(TILE_GOOGLE_SATELLITE, {
      attribution: TILE_GOOGLE_ATTR,
      subdomains: '0123',
      maxZoom: 20,
      keepBuffer: buf,
      updateWhenIdle: false,
    });
  }
  return L.tileLayer(dark ? TILE_DARK : TILE_LIGHT, {
    attribution: TILE_ATTR,
    subdomains: 'abcd',
    maxZoom: 19,
    keepBuffer: buf,
    updateWhenIdle: false,
  });
}

/* ── Link / node colour-by options ── */
const LINK_SYMBOLOGY = [
  { key: 'class',    label: 'Asset class',    needsSim: false },
  { key: 'diameter', label: 'Diameter',       needsSim: false },
  { key: 'status',   label: 'Status',         needsSim: false },
  { key: 'flow',     label: 'Flow',           needsSim: true  },
  { key: 'velocity', label: 'Velocity',       needsSim: true  },
  { key: 'headloss', label: 'Unit headloss',  needsSim: true  }
] as const;
type LinkSymbology = (typeof LINK_SYMBOLOGY)[number]['key'];

const NODE_SYMBOLOGY = [
  { key: 'asset',    label: 'Asset kind', needsSim: false },
  { key: 'elevation',label: 'Elevation',  needsSim: false },
  { key: 'pressure', label: 'Pressure',   needsSim: true  },
  { key: 'head',     label: 'Head',       needsSim: true  },
  { key: 'demand',   label: 'Demand',     needsSim: true  }
] as const;
type NodeSymbology = (typeof NODE_SYMBOLOGY)[number]['key'];

/* Viridis ramp — perceptually-uniform sequential scale. */
const RAMP = ['#440154', '#3B528B', '#21918C', '#5EC962', '#FDE725'];
const RAMP_RANGES: Partial<Record<LinkSymbology, { lo: string; hi: string }>> = {
  diameter: { lo: '25 mm', hi: '≥400 mm' },
  flow:     { lo: '0 L/s', hi: '60 L/s'  },
  velocity: { lo: '0 m/s', hi: '2.5 m/s' },
  headloss: { lo: '0 m/km', hi: '12 m/km' }
};

function rampColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const idx = Math.min(RAMP.length - 2, Math.floor(clamped * (RAMP.length - 1)));
  return RAMP[idx + (clamped * (RAMP.length - 1) - idx > 0.5 ? 1 : 0)];
}

function simFlowEstimate(id: string, diameter_mm: number | null | undefined): number {
  const dia = diameter_mm || 80;
  const base = (dia / 25) ** 1.6 * 0.8;
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return base * (0.7 + (h % 100) / 100 * 0.9);
}

function baseLineStyle(feat: PipeFeature, linkBy: LinkSymbology, hasResults: boolean): L.PolylineOptions {
  const p = feat.properties;
  const style = PIPE_STYLE[p.ui_class];
  const dashArray = p.status === 'closed' ? '8 5' : style.dashArray;
  let color = style.color;
  if (linkBy === 'diameter') {
    color = rampColor(((p.diameter_mm || 0) - 25) / (400 - 25));
  } else if (linkBy === 'status') {
    color = p.status === 'closed' ? '#D4675E' : p.service === 'out-of-service' ? '#D9A156' : '#4FA877';
  } else if (hasResults && (linkBy === 'flow' || linkBy === 'velocity' || linkBy === 'headloss')) {
    const flow = simFlowEstimate(p.id, p.diameter_mm);
    const dia  = p.diameter_mm || 80;
    const vel  = flow / (Math.PI * (dia / 2000) ** 2) / 1000;
    const hl   = (vel ** 1.85) * (100 / dia);
    const metric = linkBy === 'flow' ? flow / 60 : linkBy === 'velocity' ? vel / 2.5 : hl / 12;
    color = rampColor(metric);
  }
  return { color, weight: style.weight, opacity: style.opacity, dashArray, lineCap: 'round', lineJoin: 'round' };
}

type Focus =
  | { kind: 'pipe'; feature: PipeFeature }
  | { kind: 'asset'; feature: AssetFeature }
  | { kind: 'junction'; feature: JunctionFeature }
  | null;

type LayerVis = Record<PipeClass | AssetKind | 'junction', boolean>;

const DEFAULT_LAYERS: LayerVis = {
  main: true,
  distribution: true,
  household: false,        // off by default — turn on at street zoom
  backfeed: true,
  boundary: false,         // reference-only · off by default to declutter
  tank: true,
  pressure_valve: true,
  meter_valve: true,
  sensor: true,
  junction: true
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
  const [isSchematic, setIsSchematic] = useState<boolean>(false);
  const [basemap, setBasemap] = useState<Basemap>('satellite');
const [linkBy, setLinkBy] = useState<LinkSymbology>('class');
  const [nodeBy, setNodeBy] = useState<NodeSymbology>('asset');
  const [simData, setSimData] = useState<SimulationData | null>(null);
  const [simStatus, setSimStatus] = useState<SimulationStatus>('none');
  const [simHour, setSimHour] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(13);
  const [simTriggerKey, setSimTriggerKey] = useState(0);
  const [hasEpanet, setHasEpanet] = useState<boolean>(false);
  const [showSimToast, setShowSimToast] = useState(false);
  const [renameSuccess, setRenameSuccess] = useState(false);
  const [editingSubName, setEditingSubName] = useState(false);
  const [addDataStatus, setAddDataStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [addDataError, setAddDataError] = useState<string | null>(null);
  const addDataInputRef = useRef<HTMLInputElement>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [workmode, setWorkmode] = useState<string>('Network overview');
  const [showWorkmodes, setShowWorkmodes] = useState<boolean>(false);
  const [editableName, setEditableName] = useState<string>('');
  const [is3D, setIs3D] = useState<boolean>(false);
  const [activePlugin, setActivePlugin] = useState<'search' | 'pressures' | 'flow' | 'demand' | null>(null);
  const [isSimEnabled, setIsSimEnabled] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const hasResults = simData !== null && isSimEnabled;

  const pipeLayersRef = useRef<Map<string, L.Polyline>>(new Map());
  const assetLayersRef = useRef<Map<string, L.Marker>>(new Map());
  const junctionLayersRef = useRef<Map<string, L.CircleMarker>>(new Map());
  // Fast O(1) feature lookups — avoids .find() in hot animation loops
  const pipeMapRef = useRef<Map<string, PipeFeature>>(new Map());
  const assetMapRef = useRef<Map<string, AssetFeature>>(new Map());

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const rendererRef = useRef<L.Renderer | null>(null);
  const layerGroupsRef = useRef<Partial<Record<PipeClass | AssetKind | 'junction', L.LayerGroup>>>({});
  const focusOutlineRef = useRef<L.Layer | null>(null);

  /* ── 1. fetch network ── */
  useEffect(() => {
    let alive = true;
    loadNetwork()
      .then((data) => {
        if (alive) {
          setNetwork(data);
          setEditableName(data.meta.name || 'Untitled Network');
          const schematic = data.meta.is_schematic === true;
          setIsSchematic(schematic);
          // Schematic INP has no real coordinates → bare canvas.
          // Geo-referenced INP (or the shapefile network) → satellite by default.
          setBasemap(schematic ? 'none' : 'satellite');
          // Build O(1) lookup maps for hot animation loops
          pipeMapRef.current = new Map(data.pipes.map(p => [p.properties.id, p]));
          assetMapRef.current = new Map(data.assets.map(a => [a.properties.id, a]));
        }
      })
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
      preferCanvas: false, // Turn off Canvas rendering to allow SVG-based path CSS animations
      zoomControl: false,
      attributionControl: true,
      maxBounds: L.latLngBounds([latMin - 0.1, lonMin - 0.1], [latMax + 0.1, lonMax + 0.1]),
      minZoom: 10,
      maxZoom: 19
    });
    leafletRef.current = map;
    // Zoom control is rendered in React outside the map div so it stays flat in 3D view

    // Seed the basemap tile immediately — effect 3 fires before the map exists on first load
    const initTile = makeTileLayer(basemap, mode === 'dark', is3D);
    if (initTile) { initTile.addTo(map); tileRef.current = initTile; }

    // Fix map off-centering by forcing Leaflet to recalculate container bounds and center on the network
    const timer = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(L.latLngBounds([latMin, lonMin], [latMax, lonMax]), {
        padding: [20, 20]
      });
    }, 200);
    // Use SVG renderer for pipes to support CSS stroke-dashoffset animations and classes
    rendererRef.current = L.svg({ padding: 0.1 });

    /* layer groups — order matters for SVG z-stacking: groups added first render below later ones.
       junctions → pipes → assets ensures pipes sit on top of junction dots. */
    const groups: Partial<Record<PipeClass | AssetKind | 'junction', L.LayerGroup>> = {};
    (['junction', ...PIPE_KEYS, ...ASSET_KEYS] as Array<PipeClass | AssetKind | 'junction'>).forEach((k) => {
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
      let coords: any;
      if (feat.geometry.type === 'MultiLineString') {
        coords = (feat.geometry.coordinates as any).map(
          (line: [number, number][]) => line.map(([lon, lat]) => [lat, lon])
        );
      } else {
        coords = (feat.geometry.coordinates as [number, number][]).map(
          ([lon, lat]: [number, number]) => [lat, lon]
        );
      }
      const line = L.polyline(coords, {
        color: style.color,
        weight: style.weight,
        opacity: style.opacity,
        dashArray: style.dashArray,
        lineCap: 'round',
        lineJoin: 'round',
        renderer
      });
      const flowLine = L.polyline(coords, {
        color: style.color,
        weight: style.weight,
        opacity: 0,
        dashArray: '0 9999',
        lineCap: 'round',
        lineJoin: 'round',
        renderer,
        interactive: false
      });
      line.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setFocus({ kind: 'pipe', feature: feat });
      });
      line.on('mouseover', () => {
        const cached = (line as any)._cachedStyle;
        if (cached) {
          line.setStyle({
            weight: cached.weight * 1.5,
            opacity: 1
          });
        } else {
          line.setStyle({
            color: style.hoverColor,
            weight: style.hoverWeight,
            opacity: 1
          });
        }
      });
      line.on('mouseout', () => {
        const cached = (line as any)._cachedStyle;
        if (cached) {
          line.setStyle({
            color: cached.color,
            weight: cached.weight,
            opacity: cached.opacity
          });
        } else {
          const z = leafletRef.current?.getZoom() || 13;
          const scale = z >= 17 ? 1.35 : z >= 15 ? 1.15 : z >= 13 ? 1 : 0.78;
          line.setStyle({
            color: style.color,
            weight: style.weight * scale,
            opacity: style.opacity
          });
        }
      });
      line.addTo(group);
      flowLine.addTo(group);
      (line as any)._flowLine = flowLine;
      pipeLayersRef.current.set(feat.properties.id, line);
    });

    /* Track map zoom changes to update responsive styling */
    map.on('zoomend', () => {
      setZoom(map.getZoom());
    });

    /* assets — points */
    network.assets.forEach((feat) => {
      const props = feat.properties;
      const [lon, lat] = feat.geometry.coordinates;
      const marker = L.marker([lat, lon], {
        icon: assetIcon(feat)
      });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setFocus({ kind: 'asset', feature: feat });
      });
      marker.bindTooltip(assetTooltip(feat), { direction: 'top', offset: [0, -10], opacity: 1 });
      const grp = groups[props.asset];
      if (grp) {
        marker.addTo(grp);
        assetLayersRef.current.set(props.id, marker);
      }
    });

    /* junctions — points */
    if (network.junctions) {
      network.junctions.forEach((feat) => {
        const props = feat.properties;
        const [lon, lat] = feat.geometry.coordinates;
        const marker = L.circleMarker([lat, lon], {
          radius: 3.5,
          color: '#475569',
          weight: 1.5,
          fillColor: '#94a3b8',
          fillOpacity: 0.95,
          renderer,
          className: 'aw-junction-marker'
        });
        marker.bindTooltip(`Junction ${props.external_id}`, { direction: 'top', offset: [0, -4] });
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setFocus({ kind: 'junction', feature: feat });
        });
        const grp = groups.junction;
        if (grp) {
          marker.addTo(grp);
          junctionLayersRef.current.set(props.id, marker);
        }
      });
    }

    /* dismiss focus on empty click */
    map.on('click', () => setFocus(null));

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      clearTimeout(timer);
      map.remove();
      leafletRef.current = null;
      layerGroupsRef.current = {};
      tileRef.current = null;
      pipeLayersRef.current.clear();
      assetLayersRef.current.clear();
      junctionLayersRef.current.clear();
    };
    // mode is read at init; subsequent changes handled by the tile-swap effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  /* ── 3. swap tiles on theme or basemap change without recreating map ── */
  useEffect(() => {
    const map = leafletRef.current;
    if (!map) return;
    if (tileRef.current) { map.removeLayer(tileRef.current); tileRef.current = null; }
    const tile = makeTileLayer(basemap, mode === 'dark', is3D);
    if (tile) { tile.addTo(map); tileRef.current = tile; }
  }, [mode, basemap, is3D]);

  /* ── 4. layer toggles ── */
  useEffect(() => {
    const map = leafletRef.current;
    const groups = layerGroupsRef.current;
    if (!map) return;
    ([...PIPE_KEYS, ...ASSET_KEYS, 'junction'] as Array<PipeClass | AssetKind | 'junction'>).forEach((k) => {
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
      let coords: any;
      if (focus.feature.geometry.type === 'MultiLineString') {
        coords = (focus.feature.geometry.coordinates as any).map(
          (line: [number, number][]) => line.map(([lon, lat]) => [lat, lon])
        );
      } else {
        coords = (focus.feature.geometry.coordinates as [number, number][]).map(
          ([lon, lat]: [number, number]) => [lat, lon]
        );
      }
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
    } else if (kind === 'junction') {
      const match = network.junctions?.find((j) => j.properties.id === id);
      if (match) {
        setLayers((p) => ({ ...p, junction: true }));
        setFocus({ kind: 'junction', feature: match });
      }
    }
    // consume the param so a refresh doesn't keep re-focusing
    const next = new URLSearchParams(searchParams);
    next.delete('focus');
    setSearchParams(next, { replace: true });
  }, [network, searchParams, setSearchParams]);

  /* ── 7. simulation polling — check existing status on load; re-polls when simTriggerKey changes ── */
  useEffect(() => {
    if (!network?.meta.id) return;
    const networkId = network.meta.id;
    let alive = true;

    async function poll() {
      if (!alive) return;
      try {
        const result = await pollSimulation(networkId);
        if (!alive) return;
        setHasEpanet(result.has_epanet === true);
        setSimStatus(result.status);
        if (result.status === 'complete' && result.data) {
          setSimData(prev => {
            if (!prev) {
              // New data: show toast
              setTimeout(() => {
                setShowSimToast(true);
                setTimeout(() => setShowSimToast(false), 4000);
              }, 0);
              return result.data!;
            }
            return prev; // already loaded — don't flash toast again
          });
          setSimHour(0);
        } else if (result.status === 'queued' || result.status === 'running') {
          pollTimerRef.current = setTimeout(poll, 3000);
        }
      } catch (err) {
        console.warn('Simulation poll error:', err);
      }
    }

    poll();
    return () => {
      alive = false;
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [network?.meta.id, simTriggerKey]);

  /* ── 8. animate simulation playback ── */
  useEffect(() => {
    if (!isPlaying || !simData) return;
    const interval = setInterval(() => {
      setSimHour((h) => (h + 1) % simData.timesteps.length);
    }, 1000 / playSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, simData, playSpeed]);

  /* ── 9. dynamic styling of leaflet layers based on active simulation hour ── */
  useEffect(() => {
    if (!simData || !isSimEnabled) return;
    const isDark = mode === 'dark';
    const scale = zoom >= 17 ? 1.35 : zoom >= 15 ? 1.15 : zoom >= 13 ? 1 : 0.78;
    
    // Update pipe line colors and thickness based on velocity and flow
    pipeLayersRef.current.forEach((layer, id) => {
      const sim = simData.links[id];
      if (!sim) return;
      const vel = sim.velocity[simHour] || 0.0;
      const flow = sim.flow[simHour] || 0.0;
      
      const feature = pipeMapRef.current.get(id);
      const baseStyle = feature ? PIPE_STYLE[feature.properties.ui_class] : { weight: 3, opacity: 0.8 };
      
      const isFlowing = Math.abs(flow) > 0.0001; // WNTR returns m³/s; 0.0001 = 0.1 L/s minimum
      
      const flowLine = (layer as any)._flowLine;
      const pathEl = (layer as any)._path;
      const flowPathEl = flowLine ? (flowLine as any)._path : null;

      let pathLength = 100;
      if (pathEl) {
        try {
          pathLength = pathEl.getTotalLength() || 100;
        } catch (e) {
          pathLength = 100;
        }
      } else if (flowPathEl) {
        try {
          pathLength = flowPathEl.getTotalLength() || 100;
        } catch (e) {
          pathLength = 100;
        }
      }

      const targetColor = getVelocityColor(vel, isDark);
      // Base pipe keeps its natural zoom-scaled weight — flow scaling only goes on the overlay
      const targetWeight = baseStyle.weight * scale;

      // The pipe should be dull, and the dash overlay should be bright.
      const targetOpacity = 0.25;

      const targetFlowColor = targetColor;
      // Flow overlay is always thinner than the base pipe so zoomed-out networks don't clutter
      const targetFlowWeight = getFlowWeight(flow, baseStyle.weight * scale);
      const targetFlowOpacity = isFlowing ? 1.0 : 0.0;
      const targetFlowDashArray = isFlowing ? `8 ${pathLength.toFixed(1)}` : '0 9999';
      
      const targetDirection = isFlowing ? (vel > 0 ? 'forward' : 'reverse') : 'idle';

      const cached = (layer as any)._cachedStyle;
      const changed = !cached ||
        cached.color !== targetColor ||
        cached.weight !== targetWeight ||
        cached.opacity !== targetOpacity ||
        cached.flowColor !== targetFlowColor ||
        cached.flowWeight !== targetFlowWeight ||
        cached.flowOpacity !== targetFlowOpacity ||
        cached.flowDashArray !== targetFlowDashArray ||
        cached.direction !== targetDirection;

      if (changed) {
        layer.setStyle({
          color: targetColor,
          weight: targetWeight,
          opacity: targetOpacity,
          dashArray: undefined
        });
        
        if (flowLine) {
          flowLine.setStyle({
            color: targetFlowColor,
            weight: targetFlowWeight,
            opacity: targetFlowOpacity,
            dashArray: targetFlowDashArray
          });
        }
        
        (layer as any)._cachedStyle = {
          color: targetColor,
          weight: targetWeight,
          opacity: targetOpacity,
          flowColor: targetFlowColor,
          flowWeight: targetFlowWeight,
          flowOpacity: targetFlowOpacity,
          flowDashArray: targetFlowDashArray,
          direction: targetDirection
        };
        
        if (flowPathEl) {
          flowPathEl.style.setProperty('--flow-offset-fwd', `-${(pathLength + 8).toFixed(1)}px`);
          flowPathEl.style.setProperty('--flow-offset-rev', `${(pathLength + 8).toFixed(1)}px`);
          
          if (targetDirection === 'forward') {
            flowPathEl.classList.add('flow-forward');
            flowPathEl.classList.remove('flow-reverse');
          } else if (targetDirection === 'reverse') {
            flowPathEl.classList.add('flow-reverse');
            flowPathEl.classList.remove('flow-forward');
          } else {
            flowPathEl.classList.remove('flow-forward', 'flow-reverse');
            flowPathEl.style.animationDuration = '';
          }
        }
        if (pathEl) {
          pathEl.classList.remove('flow-forward', 'flow-reverse');
          pathEl.style.animationDuration = '';
        }
      } else {
        // Double-check path element classes are consistent
        if (flowPathEl) {
          if (targetDirection === 'forward' && !flowPathEl.classList.contains('flow-forward')) {
            flowPathEl.classList.add('flow-forward');
            flowPathEl.classList.remove('flow-reverse');
          } else if (targetDirection === 'reverse' && !flowPathEl.classList.contains('flow-reverse')) {
            flowPathEl.classList.add('flow-reverse');
            flowPathEl.classList.remove('flow-forward');
          } else if (targetDirection === 'idle' && (flowPathEl.classList.contains('flow-forward') || flowPathEl.classList.contains('flow-reverse'))) {
            flowPathEl.classList.remove('flow-forward', 'flow-reverse');
            flowPathEl.style.animationDuration = '';
          }
        }
        if (pathEl) {
          pathEl.classList.remove('flow-forward', 'flow-reverse');
          pathEl.style.animationDuration = '';
        }
      }

      // Inline velocity-based duration scaling updates continuously for smooth transitions
      if (flowPathEl && isFlowing) {
        const speedFactor = Math.abs(vel) * 40; // 40 pixels per second per (m/s)
        const duration = Math.min(8.0, Math.max(0.3, pathLength / speedFactor));
        flowPathEl.style.animationDuration = `${duration.toFixed(2)}s`;
      } else if (flowPathEl) {
        flowPathEl.style.animationDuration = '';
      }
    });

    // Update junction circle markers with pressure and demand at active timestep
    junctionLayersRef.current.forEach((marker, id) => {
      const simNode = simData.nodes[id];
      if (simNode) {
        const press = simNode.pressure[simHour] || 0.0;
        const demand = simNode.demand[simHour] || 0.0;
        
        const demandLs = demand * 1000; // WNTR m³/s → L/s for display
        marker.getTooltip()?.setContent(`Junction ${id} · ${press.toFixed(1)}m · ${demandLs.toFixed(1)}L/s`);

        // Node pressure color mapping
        const nodeColor = press < 10.0 ? '#ef4444' : press < 15.0 ? '#f59e0b' : '#22c55e';
        const outlineColor = press < 10.0 ? '#b91c1c' : press < 15.0 ? '#d97706' : '#15803d';

        // Zoom-scaled base radius — same scale factor used by pipes
        const baseRadius = 3.5 * scale;
        // Demand growth capped tighter at low zoom so nodes don't blob together
        const maxGrowth = zoom >= 15 ? 6 : zoom >= 13 ? 3 : 1;
        const radius = baseRadius + Math.min(maxGrowth, Math.abs(demandLs) * 0.4 * scale);

        marker.setStyle({
          fillColor: nodeColor,
          color: outlineColor,
          radius: radius
        });

      }
    });

    // Update asset marker tooltips dynamically with pressure and demand at active timestep
    assetLayersRef.current.forEach((marker, id) => {
      const simNode = simData.nodes[id];
      if (simNode) {
        const press = simNode.pressure[simHour];
        const demand = simNode.demand[simHour];
        marker.getTooltip()?.setContent(`${id} · ${press.toFixed(1)}m · ${(demand * 1000).toFixed(1)}L/s`);

        // Dynamically adjust tank markers and status indicators
        const el = marker.getElement();
        if (el) {
          const feature = assetMapRef.current.get(id);
          if (feature) {
            const kind = feature.properties.asset;
            if (kind === 'tank') {
              // Use static level_pct from props (pressure head cannot be reliably converted without tank geometry)
              const levelPct = (feature.properties as any).level_pct ?? 50;
              const fill = el.querySelector('.aw-tank-fill') as HTMLElement;
              const label = el.querySelector('.aw-tank-label') as HTMLElement;
              if (fill) {
                fill.style.height = `${levelPct.toFixed(1)}%`;
                const lvlColor = levelPct > 70 ? '#22C55E' : levelPct > 35 ? '#F59E0B' : '#EF4444';
                fill.style.backgroundColor = lvlColor;
              }
              if (label) {
                label.innerText = `${levelPct.toFixed(0)}%`;
              }
            } else {
              const dot = el.querySelector('.aw-status-dot') as HTMLElement;
              if (dot) {
                const statusColor = press < 10.0 ? '#ef4444' : press < 15.0 ? '#f59e0b' : '#22c55e';
                dot.style.backgroundColor = statusColor;
              }
            }
          }
        }
      }
    });
  }, [simHour, simData, mode, network, isSimEnabled]);

  /* ── 10. restore standard pipe styles and apply zoom scaling if simulation is closed/unavailable ── */
  useEffect(() => {
    if (simData && isSimEnabled) return;
    const scale = zoom >= 17 ? 1.35 : zoom >= 15 ? 1.15 : zoom >= 13 ? 1 : 0.78;
    pipeLayersRef.current.forEach((layer, id) => {
      const feature = pipeMapRef.current.get(id);
      if (!feature) return;
      const style = PIPE_STYLE[feature.properties.ui_class];
      
      // Clear simulation cache
      delete (layer as any)._cachedStyle;

      // Apply linkBy-aware static style when sim is not driving colors
      const bStyle = baseLineStyle(feature, linkBy, false);
      layer.setStyle({ ...bStyle, weight: (bStyle.weight || style.weight) * scale });

      const pathEl = (layer as any)._path;
      if (pathEl) {
        pathEl.classList.remove('flow-forward', 'flow-reverse');
        pathEl.style.animationDuration = '';
      }

      // Hide flow line
      const flowLine = (layer as any)._flowLine;
      if (flowLine) {
        flowLine.setStyle({
          opacity: 0,
          dashArray: '0 9999'
        });
        const flowPathEl = (flowLine as any)._path;
        if (flowPathEl) {
          flowPathEl.classList.remove('flow-forward', 'flow-reverse');
          flowPathEl.style.animationDuration = '';
        }
      }
    });

    // Restore standard junction styling
    junctionLayersRef.current.forEach((marker, id) => {
      marker.getTooltip()?.setContent(`Junction ${id}`);
      marker.setStyle({
        fillColor: '#94a3b8',
        color: '#475569',
        radius: 3.5
      });
    });

    assetLayersRef.current.forEach((marker, id) => {
      const feature = assetMapRef.current.get(id);
      if (!feature) return;
      const el = marker.getElement();
      if (el) {
        const props = feature.properties;
        const kind = props.asset;
        if (kind === 'tank') {
          const fill = el.querySelector('.aw-tank-fill') as HTMLElement;
          const label = el.querySelector('.aw-tank-label') as HTMLElement;
          const level = (props as any).level_pct || 50;
          if (fill) {
            fill.style.height = `${level}%`;
            const lvlColor = level > 70 ? '#22C55E' : level > 35 ? '#F59E0B' : '#EF4444';
            fill.style.backgroundColor = lvlColor;
          }
          if (label) {
            label.innerText = `${level}%`;
          }
        } else {
          const dot = el.querySelector('.aw-status-dot') as HTMLElement;
          if (dot) {
            const statusColor = STATUS_COLOR[props.status];
            dot.style.backgroundColor = statusColor;
          }
        }
      }
    });
  }, [simData, network, zoom, isSimEnabled, linkBy]);

  /* ── 11. workmode changes sync with visible layers ── */
  useEffect(() => {
    if (workmode === 'Network overview') {
      setLayers(DEFAULT_LAYERS);
    } else if (workmode === 'Asset management') {
      setLayers({
        main: true, distribution: true, household: false, backfeed: false, boundary: false,
        tank: true, pressure_valve: true, meter_valve: true, sensor: false, junction: false
      });
    } else if (workmode === 'All tools') {
      setLayers({
        main: true, distribution: true, household: true, backfeed: true, boundary: true,
        tank: true, pressure_valve: true, meter_valve: true, sensor: true, junction: true
      });
    } else if (workmode === 'Operation planning') {
      setLayers({
        main: true, distribution: true, household: false, backfeed: true, boundary: false,
        tank: true, pressure_valve: true, meter_valve: false, sensor: false, junction: false
      });
    } else if (workmode === 'Service analysis') {
      setLayers({
        main: true, distribution: true, household: false, backfeed: false, boundary: false,
        tank: false, pressure_valve: false, meter_valve: false, sensor: true, junction: false
      });
    } else if (workmode === 'Non-revenue water') {
      setLayers({
        main: true, distribution: true, household: false, backfeed: true, boundary: false,
        tank: true, pressure_valve: false, meter_valve: true, sensor: true, junction: false
      });
    }
  }, [workmode]);

  /* ── 12. custom display control triggers ── */
  const handleResetOrientation = useCallback(() => {
    const map = leafletRef.current;
    if (map && network) {
      const [lonMin, latMin, lonMax, latMax] = network.meta.bbox;
      map.fitBounds(L.latLngBounds([latMin, lonMin], [latMax, lonMax]));
    }
  }, [network]);

  const handleResetView = useCallback(() => {
    const map = leafletRef.current;
    if (map && network) {
      const [lonMin, latMin, lonMax, latMax] = network.meta.bbox;
      map.fitBounds(L.latLngBounds([latMin, lonMin], [latMax, lonMax]), { padding: [20, 20] });
    }
  }, [network]);

  const handleToggle3D = useCallback(() => {
    setIs3D(prev => !prev);
  }, []);

  const handleAddData = useCallback(async (file: File) => {
    if (!network?.meta.id) return;
    setAddDataStatus('uploading');
    setAddDataError(null);
    try {
      const { getAuthHeaders } = await import('../data/network');
      const authHeaders = await getAuthHeaders() as Record<string, string>;
      // Strip Content-Type so the browser sets multipart/form-data with the correct boundary
      const uploadHeaders: Record<string, string> = {};
      for (const [k, v] of Object.entries(authHeaders)) {
        if (k.toLowerCase() !== 'content-type') uploadHeaders[k] = v;
      }
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`/api/v1/networks/${network.meta.id}/add-data/`, {
        method: 'POST',
        headers: uploadHeaders,
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }
      setAddDataStatus('processing');
      // Reload network after a short delay to pick up the ingested data
      setTimeout(async () => {
        try {
          clearNetworkCache(network.meta.id);
          const fresh = await loadNetwork(network.meta.id);
          setNetwork(fresh);
          setAddDataStatus('done');
          setTimeout(() => setAddDataStatus('idle'), 3000);
        } catch {
          setAddDataStatus('done');
          setTimeout(() => setAddDataStatus('idle'), 3000);
        }
      }, 4000);
    } catch (e: any) {
      setAddDataError(e.message || 'Upload failed');
      setAddDataStatus('error');
    }
  }, [network?.meta.id]);

  const handleRename = useCallback(async () => {
    if (!network || !network.meta.id || !editableName.trim()) return;
    if (editableName.trim() === network.meta.name) return; // no change
    try {
      await renameNetwork(network.meta.id, editableName.trim());
      setNetwork(prev => prev ? { ...prev, meta: { ...prev.meta, name: editableName.trim() } } : null);
      clearNetworkCache();
      setRenameSuccess(true);
      setTimeout(() => setRenameSuccess(false), 2500);
    } catch (err: any) {
      console.error(err);
    }
  }, [network, editableName]);

  const handleRunSimulation = useCallback(async () => {
    if (!network?.meta.id || simStatus === 'queued' || simStatus === 'running') return;
    try {
      setSimStatus('queued');
      await triggerSimulation(network.meta.id);
      setSimTriggerKey(k => k + 1);
    } catch (err: any) {
      console.warn('Simulation trigger failed:', err.message);
      setSimStatus('failed');
    }
  }, [network?.meta.id, simStatus]);

  const searchResults = useMemo(() => {
    if (!network || !searchQuery.trim()) return { items: [], total: 0 };
    const q = searchQuery.toLowerCase().trim();
    const matches: Array<{ id: string; type: string; label: string; kind: 'pipe' | 'asset'; data: any }> = [];

    // Search pipes
    network.pipes.forEach(p => {
      const props = p.properties;
      if (
        props.id.toLowerCase().includes(q) ||
        (props.material && props.material.toLowerCase().includes(q)) ||
        (props.zone && props.zone.toLowerCase().includes(q))
      ) {
        matches.push({
          id: props.id,
          type: 'Pipe',
          label: `${props.ui_class} · ${props.diameter_mm ? props.diameter_mm + 'mm' : 'no diameter'}${props.zone ? ' · ' + props.zone : ''}`,
          kind: 'pipe',
          data: p
        });
      }
    });

    // Search assets
    network.assets.forEach(a => {
      if (a.properties.id.toLowerCase().includes(q) || a.properties.name.toLowerCase().includes(q)) {
        matches.push({
          id: a.properties.id,
          type: a.properties.asset.replace('_', ' '),
          label: a.properties.name,
          kind: 'asset',
          data: a
        });
      }
    });

    const total = matches.length;
    return { items: matches.slice(0, 30), total };
  }, [network, searchQuery]);


  const toggleLayer = useCallback(
    (k: PipeClass | AssetKind | 'junction') => setLayers((p) => ({ ...p, [k]: !p[k] })),
    []
  );
  const setAllPipes = useCallback((on: boolean) => {
    setLayers((p) => ({ ...p, main: on, distribution: on, household: on, backfeed: on, boundary: on }));
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
    const junctionCount = network.junctions?.length || 0;
    return { pipeCounts, assetCounts, junctionCount };
  }, [network]);

  /* ── workmode dropdown: close on outside click ── */
  useEffect(() => {
    if (!showWorkmodes) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.aw-workmode-selector-container')) setShowWorkmodes(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showWorkmodes]);

  const handleSearchResultClick = (kind: 'pipe' | 'asset', item: any) => {
    setLayers((prev) => ({
      ...prev,
      [kind === 'pipe' ? item.properties.ui_class : item.properties.asset]: true
    }));
    setFocus({ kind, feature: item });
    setActivePlugin(null);
    setSearchQuery('');
  };

  return (
    <Shell
      active="gis"
      title="GIS Map"
      sub={network?.meta.name
        ? (editingSubName
          ? <input
              autoFocus
              className="tb-sub tb-sub--edit"
              value={editableName}
              onChange={e => setEditableName(e.target.value)}
              onBlur={() => { handleRename(); setEditingSubName(false); }}
              onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); if (e.key === 'Escape') setEditingSubName(false); }}
              style={{ background: 'transparent', border: 'none', outline: 'none', padding: 0, font: 'inherit', color: 'inherit', width: `${Math.max(12, (editableName.length + 20))}ch` }}
            />
          : <span
              className="tb-sub"
              style={{ cursor: 'text' }}
              title="Click to rename"
              onClick={() => setEditingSubName(true)}
            >
              {editableName || network.meta.name} · live operational view
              {renameSuccess && <span style={{ marginLeft: 8, color: '#22c55e', fontSize: '0.7rem' }}>✓</span>}
            </span>
        )
        : <span className="tb-sub">Loading network…</span>
      }
      pagePadding={false}
      hideRightRail
    >
      <div className="gis-workspace">
      <WorkspaceToolbar
        basemap={basemap}
        onBasemap={setBasemap}
        onFit={handleResetView}
        hasEpanet={hasEpanet}
        simStatus={simStatus}
        onSimulate={handleRunSimulation}
      />
      <div className={`gis-canvas gis-canvas--real${basemap === 'none' ? ' gis-canvas--nomap' : ' gis-canvas--sat'}`}>
        
        {/* Leaflet Map with potential pseudo-3D styling */}
        <div ref={mapRef} className={`gis-leaflet${basemap === 'none' ? ' gis-leaflet--blank' : ''}${is3D ? ' perspective-3d' : ''}`} style={{ width: '100%', height: '100%' }} />

        {/* Top-Center Integrated Status Bar */}
        {network && (
          <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}>
            <div className="glass-effect" style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 14px', background: 'rgba(22,22,30,0.9)', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div className="aw-workmode-selector-container">
                <button className="aw-workmode-selector" onClick={() => setShowWorkmodes(!showWorkmodes)} type="button" style={{ color: '#ffffff', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 600, padding: 0 }}>
                  <svg fill="none" height="12" viewBox="0 0 14 14" width="12" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px', color: '#8ACDE5' }}>
                    <path clipRule="evenodd" d="m7.75 2.5h3.25c.2761 0 .5.22386.5.5v3.25h-3.75zm-1.5-1.5h1.5 3.25c1.1046 0 2 .89543 2 2v3.25 1.5 3.25c0 1.1046-.8954 2-2 2h-3.25-1.5-3.25c-1.10457 0-2-.8954-2-2v-3.25003-4.74997c0-1.10457.89543-2 2-2zm-3.75 5.24998v-3.24998c0-.27614.22386-.5.5-.5h3.25v3.75zm0 1.5v3.25002c0 .2761.22386.5.5.5h3.25v-3.75zm5.25 3.75002h3.25c.2761 0 .5-.2239.5-.5v-3.25h-3.75z" fill="currentColor" fillRule="evenodd" />
                  </svg>
                  <span>{workmode}</span>
                </button>
                {showWorkmodes && (
                  <div className="aw-workmode-dropdown" style={{ top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '6px' }}>
                    {['Network overview', 'All tools', 'Asset management', 'Operation planning', 'Service analysis', 'Non-revenue water'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`aw-workmode-option${workmode === m ? ' active' : ''}`}
                        onClick={() => { setWorkmode(m); setShowWorkmodes(false); }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {coords && (
                <>
                  <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.15)' }} />
                  <div style={{ color: '#B4B4CA', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    Lat {coords.lat.toFixed(5)} · Lng {coords.lng.toFixed(5)}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {!network && !loadError && (
          <div className="map-loading">
            <div className="map-loading-spinner" />
            <div className="map-loading-text">Loading network data…</div>
            <div className="map-loading-sub">Reading network graph · initializing projections</div>
          </div>
        )}
        {loadError && (
          <div className="map-loading map-loading--error">
            <div className="map-loading-text">Couldn't load network data</div>
            <div className="map-loading-sub">{loadError}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { clearNetworkCache(); window.location.reload(); }}
                type="button"
              >
                Retry
              </button>
              <a className="btn btn-ghost btn-sm" href="/networks">
                Go to Networks
              </a>
            </div>
          </div>
        )}

        {network && visibleStats && (
          <>
            {/* Left Overlay Column: Layer Control + Add Layer */}
            <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px', width: '280px', pointerEvents: 'auto' }}>
              <LayerControl
                layers={layers}
                counts={visibleStats}
                onToggle={toggleLayer}
                onAllPipes={setAllPipes}
                onAllAssets={setAllAssets}
                meta={network.meta}
                simData={simData}
linkBy={linkBy}
                nodeBy={nodeBy}
                onLinkBy={setLinkBy}
                onNodeBy={setNodeBy}
                hasResults={hasResults}
              />

              {/* Upload additional data to this network */}
              <div style={{ marginTop: '8px' }}>
                <input
                  ref={addDataInputRef}
                  type="file"
                  accept=".zip,.geojson,.json,.kml,.kmz"
                  style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleAddData(f); e.target.value = ''; }}
                />
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', background: 'rgba(22,22,30,0.85)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: addDataStatus === 'error' ? '#fca5a5' : addDataStatus === 'done' ? '#22c55e' : '#B4B4CA', pointerEvents: addDataStatus === 'uploading' || addDataStatus === 'processing' ? 'none' : 'auto', opacity: addDataStatus === 'uploading' || addDataStatus === 'processing' ? 0.6 : 1 }}
                  onClick={() => addDataInputRef.current?.click()}
                  type="button"
                  title="Upload a shapefile (.zip), GeoJSON, or KML to add pipes, tanks, or other assets to this network"
                >
                  {addDataStatus === 'idle' && <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add data to network</>}
                  {addDataStatus === 'uploading' && 'Uploading…'}
                  {addDataStatus === 'processing' && 'Processing…'}
                  {addDataStatus === 'done' && '✓ Data added'}
                  {addDataStatus === 'error' && `✕ ${addDataError || 'Upload failed'}`}
                </button>
              </div>
            </div>

            {/* Right Overlay Column: Accuracy & Stats Badge */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px', width: '240px', pointerEvents: 'auto', alignItems: 'stretch' }}>
              {hasEpanet && (
                <div className="glass-effect" style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '10px 14px', background: 'rgba(22,22,30,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#B4B4CA', fontWeight: 600 }}>Simulation</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {simData ? (
                      <strong style={{ fontSize: '0.75rem', color: '#22c55e' }}>Ready</strong>
                    ) : simStatus === 'none' ? (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.6875rem', padding: '2px 10px', height: '22px' }}
                        onClick={handleRunSimulation}
                        type="button"
                      >
                        Run
                      </button>
                    ) : simStatus === 'failed' ? (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '0.6875rem', padding: '2px 10px', height: '22px', color: '#FCA5A5' }}
                        onClick={handleRunSimulation}
                        type="button"
                      >
                        Retry
                      </button>
                    ) : (
                      <strong style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {simStatus === 'queued' ? 'Queued…' : 'Running…'}
                      </strong>
                    )}
                  </div>
                </div>
              )}

            </div>
          </>
        )}

        {/* Plugin Floating Toolbar (bottom-left) */}
        <div className="aw-plugins-toolbar" style={{ bottom: '16px', left: '16px' }}>
          <button
            className={`aw-plugin-btn${activePlugin === 'search' ? ' active' : ''}`}
            onClick={() => setActivePlugin(activePlugin === 'search' ? null : 'search')}
            title="Search network assets"
            type="button"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16" height="16">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button
            className={`aw-plugin-btn${activePlugin === 'pressures' ? ' active' : ''}`}
            onClick={() => setActivePlugin(activePlugin === 'pressures' ? null : 'pressures')}
            title="Analyze node pressures"
            type="button"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16" height="16">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 7a5 5 0 015 5" />
            </svg>
          </button>
          <button
            className={`aw-plugin-btn${activePlugin === 'flow' ? ' active' : ''}`}
            onClick={() => setActivePlugin(activePlugin === 'flow' ? null : 'flow')}
            title="Visualize flow velocities"
            type="button"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16" height="16">
              <path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" />
            </svg>
          </button>
          <button
            className={`aw-plugin-btn${activePlugin === 'demand' ? ' active' : ''}`}
            onClick={() => setActivePlugin(activePlugin === 'demand' ? null : 'demand')}
            title="Inspect flow rates and demand spikes"
            type="button"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="16" height="16">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </button>
        </div>

        {/* Zoom buttons — bottom-right, outside perspective-3d div so they stay flat in 3D view */}
        <div className="aw-zoom-controls">
          <button className="aw-control-btn" title="Zoom in" onClick={() => leafletRef.current?.zoomIn()} type="button">
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14" height="14">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <button className="aw-control-btn" title="Zoom out" onClick={() => leafletRef.current?.zoomOut()} type="button">
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" width="14" height="14">
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        {/* Display Controls — top-right, outside the perspective-3d div so buttons stay flat in 3D view */}
        <div className="aw-display-controls">
          <button className="aw-control-btn" title="Restore orientation to north" onClick={handleResetOrientation} type="button">
            <svg fill="currentColor" height="14" viewBox="0 0 14 14" width="14" xmlns="http://www.w3.org/2000/svg">
              <g fill="currentColor"><path d="m7.00008 0 2.99992 6h-6z" /><path d="m6.99992 14-2.99992-6h6z" opacity="0.7" /></g>
            </svg>
          </button>
          <button className="aw-control-btn" title="Restore initial view" onClick={handleResetView} type="button">
            <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" width="14" height="14">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
            </svg>
          </button>
          <button className={`aw-control-btn${is3D ? ' active' : ''}`} title="Toggle map 3D view" onClick={handleToggle3D} type="button">
            <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" width="14" height="14">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l-7 4a2 2 0 002 0l7-4a2 2 0 001-1.73z" />
            </svg>
          </button>
          <button
            className={`aw-control-btn${basemap === 'satellite' ? ' active' : ''}`}
            title="Cycle basemap (satellite → streets → none)"
            onClick={() => setBasemap((b) => b === 'satellite' ? 'streets' : b === 'streets' ? 'none' : 'satellite')}
            type="button"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" width="14" height="14">
              <circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" />
            </svg>
          </button>
        </div>

        {/* Floating plugin search overlay panel */}
        {activePlugin === 'search' && (
          <div className="aw-search-overlay-panel" style={{ top: '16px', left: '308px', maxHeight: 'calc(100% - 130px)' }}>
            <div className="aw-search-overlay-head">
              <span className="aw-search-overlay-title">Search Network</span>
              <button className="aw-search-overlay-close" onClick={() => setActivePlugin(null)} type="button">✕</button>
            </div>
            <div className="aw-search-overlay-input-container">
              <svg className="aw-search-overlay-icon" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="aw-search-overlay-input"
                placeholder="Search pipes, sensors, zones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="aw-search-results-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '300px', overflowY: 'auto' }}>
              {searchResults.items.length === 0 && searchQuery.trim() && (
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', padding: '8px 0', textAlign: 'center' }}>
                  No assets match your search.
                </div>
              )}
              {searchResults.items.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => handleSearchResultClick(res.kind, res.data)}
                  className="sp-row"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    gap: '2px',
                    marginBottom: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <strong style={{ fontSize: '0.8125rem', color: '#ffffff' }}>{res.id}</strong>
                    <span style={{ fontSize: '0.6875rem', color: '#8ACDE5', textTransform: 'uppercase', fontWeight: 600 }}>{res.type}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#B4B4CA' }}>{res.label}</span>
                </button>
              ))}
              {searchResults.total > 30 && (
                <div style={{ fontSize: '0.6875rem', color: '#8ACDE5', textAlign: 'center', padding: '4px 0' }}>
                  + {searchResults.total - 30} more — refine your search
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Plugin Overlays: Pressures or flow rates reports */}
        {activePlugin === 'pressures' && (
          <div className="aw-search-overlay-panel" style={{ width: '260px', top: '16px', left: '308px' }}>
            <div className="aw-search-overlay-head">
              <span className="aw-search-overlay-title">Pressure Analysis</span>
              <button className="aw-search-overlay-close" onClick={() => setActivePlugin(null)} type="button">✕</button>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#D2D2DF', lineHeight: '1.4' }}>
              {simData ? (() => {
                const nodeIds = Object.keys(simData.nodes);
                const pressures = nodeIds.map(id => simData.nodes[id].pressure[simHour]);
                const critical = pressures.filter(p => p < 10).length;
                const warning = pressures.filter(p => p >= 10 && p < 15).length;
                const nominal = pressures.filter(p => p >= 15).length;
                const avg = pressures.reduce((a, b) => a + b, 0) / (pressures.length || 1);
                const min = Math.min(...pressures);
                const max = Math.max(...pressures);
                return (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#B4B4CA' }}>Avg pressure</span>
                        <strong style={{ color: '#fff' }}>{avg.toFixed(1)} m</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#B4B4CA' }}>Min / Max</span>
                        <strong style={{ color: '#fff' }}>{min.toFixed(1)} / {max.toFixed(1)} m</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
                          <span>Nominal (&gt;15 m)</span>
                        </div>
                        <strong style={{ color: '#22c55e' }}>{nominal}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span>
                          <span>Warning (10–15 m)</span>
                        </div>
                        <strong style={{ color: '#f59e0b' }}>{warning}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span>
                          <span>Critical (&lt;10 m)</span>
                        </div>
                        <strong style={{ color: '#ef4444' }}>{critical}</strong>
                      </div>
                    </div>
                  </>
                );
              })() : (
                <p style={{ color: '#8ACDE5' }}>Run the hydraulic simulation to see live pressure statistics at hour {String(simHour).padStart(2,'0')}:00.</p>
              )}
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ color: '#B4B4CA' }}>Junction color key:</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ background: '#22c55e', borderRadius: '50%', width: 8, height: 8, display: 'inline-block' }}></span> &gt;15m</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ background: '#f59e0b', borderRadius: '50%', width: 8, height: 8, display: 'inline-block' }}></span> 10-15m</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ background: '#ef4444', borderRadius: '50%', width: 8, height: 8, display: 'inline-block' }}></span> &lt;10m</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activePlugin === 'flow' && (
          <div className="aw-search-overlay-panel" style={{ width: '260px', top: '16px', left: '308px' }}>
            <div className="aw-search-overlay-head">
              <span className="aw-search-overlay-title">Flow Visualization</span>
              <button className="aw-search-overlay-close" onClick={() => setActivePlugin(null)} type="button">✕</button>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#D2D2DF', lineHeight: '1.4' }}>
              <p>Pipe segments style changes dynamically according to simulation water flow directions.</p>
              <p style={{ marginTop: '6px', color: '#8ACDE5' }}>Chevrons move to show direction on active simulation hours.</p>
              <div style={{ 
                marginTop: '16px', 
                paddingTop: '12px', 
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between'
              }}>
                <span style={{ fontWeight: 500, color: '#FFFFFF' }}>Simulation Overlay</span>
                <label className="aw-switch">
                  <input 
                    type="checkbox" 
                    checked={isSimEnabled} 
                    onChange={(e) => setIsSimEnabled(e.target.checked)} 
                  />
                  <span className="aw-switch-slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activePlugin === 'demand' && (
          <div className="aw-search-overlay-panel" style={{ width: '260px', top: '16px', left: '308px' }}>
            <div className="aw-search-overlay-head">
              <span className="aw-search-overlay-title">Spikes & Anomalies</span>
              <button className="aw-search-overlay-close" onClick={() => setActivePlugin(null)} type="button">✕</button>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#D2D2DF', lineHeight: '1.4' }}>
              {simData ? (() => {
                const nodeIds = Object.keys(simData.nodes);
                // Find nodes with demand spike vs average
                const spikes: Array<{ id: string; demand: number; avg: number }> = [];
                nodeIds.forEach(id => {
                  const demands = simData.nodes[id].demand;
                  const avg = demands.reduce((a, b) => a + b, 0) / (demands.length || 1);
                  const current = demands[simHour] || 0;
                  if (avg > 0 && current > avg * 2.5) spikes.push({ id, demand: current, avg });
                });
                spikes.sort((a, b) => b.demand - a.demand);
                const top = spikes.slice(0, 5);
                return top.length === 0 ? (
                  <p style={{ color: '#00C887' }}>✓ No demand spikes at this hour. All nodes within 2.5× average.</p>
                ) : (
                  <>
                    <p style={{ color: '#f59e0b', marginBottom: '8px' }}>⚠ {top.length} node{top.length > 1 ? 's' : ''} showing demand spike:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {top.map(s => (
                        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(245,158,11,0.08)', borderRadius: '4px', padding: '4px 6px' }}>
                          <span style={{ color: '#B4B4CA', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>{s.id}</span>
                          <span style={{ color: '#f59e0b', fontWeight: 600 }}>{(s.demand * 1000).toFixed(2)} L/s</span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })() : (
                <p style={{ color: '#8ACDE5' }}>Run the simulation to detect demand spikes and anomalies.</p>
              )}
            </div>
          </div>
        )}

        {(simStatus === 'queued' || simStatus === 'running') && !simData && (
          <div className="gis-sim-loading-badge">
            <span className="gis-sim-spinner" />
            {simStatus === 'queued' ? 'Simulation queued…' : 'Running hydraulic simulation…'}
          </div>
        )}
        {simStatus === 'failed' && !simData && (
          <div className="gis-sim-loading-badge gis-sim-failed" style={{ gap: '10px' }}>
            <span>Simulation failed</span>
            <button
              type="button"
              style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '4px', color: '#FCA5A5', fontSize: '0.6875rem', padding: '2px 8px', cursor: 'pointer' }}
              onClick={handleRunSimulation}
            >
              Retry
            </button>
            <a href="/networks/upload" style={{ color: '#FCA5A5', fontSize: '0.6875rem', textDecoration: 'underline' }}>
              Upload EPANET file
            </a>
          </div>
        )}
        {showSimToast && (
          <div className="gis-sim-toast">
            ✓ Simulation data loaded
          </div>
        )}

        {simData && (
          <div className="gis-simulation-timeline">
            <div className="gis-sim-play-controls">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn btn-primary btn-sm btn-icon"
                title={isPlaying ? 'Pause' : 'Play Simulation'}
                type="button"
                style={{ width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
              >
                {isPlaying ? (
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor">
                    <rect x={4} y={4} width={5} height={16} /><rect x={15} y={4} width={5} height={16} />
                  </svg>
                ) : (
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setPlaySpeed((s) => (s === 0.5 ? 1 : s === 1 ? 5 : s === 5 ? 10 : 0.5))}
                className="btn btn-ghost btn-sm"
                type="button"
                style={{ fontSize: '10px', fontWeight: 'bold', padding: '0 4px', height: '24px' }}
                title="Change playback speed"
              >
                {playSpeed}x
              </button>
            </div>
            <div className="gis-sim-time-readout">
              <strong>{formatSimTime(simData.timesteps[simHour])}</strong>
            </div>
            <div className="gis-sim-slider-container">
              <input
                type="range"
                min={0}
                max={simData.timesteps.length - 1}
                value={simHour}
                onChange={(e) => setSimHour(parseInt(e.target.value))}
                className="gis-sim-slider"
                aria-label="Simulation time scrubber"
              />
            </div>
          </div>
        )}
      </div>
      <SimulationStrip
        simStatus={simStatus}
        simData={simData}
        hasEpanet={hasEpanet}
        onRun={handleRunSimulation}
        linkBy={linkBy}
        nodeBy={nodeBy}
        hasResults={hasResults}
      />
      </div>{/* /gis-workspace */}

      {focus?.kind === 'pipe' && (
        <PipePanel feature={focus.feature} onClose={() => setFocus(null)} simData={simData} simHour={simHour} />
      )}
      {focus?.kind === 'asset' && (
        <AssetPanel feature={focus.feature} onClose={() => setFocus(null)} simData={simData} simHour={simHour} />
      )}
      {focus?.kind === 'junction' && (
        <JunctionPanel feature={focus.feature} onClose={() => setFocus(null)} simData={simData} simHour={simHour} />
      )}
    </Shell>
  );
}

/* ─────────────────────────────────────────
   Workspace toolbar (top bar)
   ───────────────────────────────────────── */

const BASEMAP_TABS: Array<{ key: Basemap; label: string; title: string }> = [
  { key: 'satellite', label: 'Satellite',  title: 'Aerial imagery' },
  { key: 'streets',   label: 'Streets',    title: 'Street map' },
  { key: 'none',      label: 'No basemap', title: 'Engineering canvas — model only' }
];

function WorkspaceToolbar({
  basemap, onBasemap, onFit, hasEpanet, simStatus, onSimulate
}: {
  basemap: Basemap;
  onBasemap: (b: Basemap) => void;
  onFit: () => void;
  hasEpanet: boolean;
  simStatus: SimulationStatus;
  onSimulate: () => void;
}) {
  const running = simStatus === 'queued' || simStatus === 'running';
  return (
    <div className="gis-toolbar">
      <div className="gis-basemap-tabs" role="tablist" aria-label="Basemap">
        {BASEMAP_TABS.map((t) => (
          <button
            key={t.key}
            className={`gis-basemap-tab${basemap === t.key ? ' active' : ''}`}
            onClick={() => onBasemap(t.key)}
            title={t.title}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>
      <button type="button" className="gis-tool" onClick={onFit} title="Fit view to network" aria-label="Fit view">
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9V4h5 M20 9V4h-5 M4 15v5h5 M20 15v5h-5" />
        </svg>
      </button>
      <div className="gis-toolbar-spacer" />
      {hasEpanet && (
        <button
          type="button"
          className={`gis-simulate-btn${running ? ' sim-running' : ''}`}
          onClick={onSimulate}
          disabled={running}
          title="Run EPANET hydraulic simulation"
        >
          <span className="gis-sim-dot" />
          {running ? 'Running…' : 'Run simulation'}
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Simulation strip (bottom bar)
   ───────────────────────────────────────── */

const SIM_STATUS_LABEL: Partial<Record<SimulationStatus, string>> = {
  none:     'Ready to run',
  queued:   'Queued…',
  running:  'Running…',
  complete: 'Simulation ready',
  failed:   'Simulation failed'
};

function SimulationStrip({
  simStatus, simData, hasEpanet, onRun, linkBy, nodeBy, hasResults
}: {
  simStatus: SimulationStatus;
  simData: SimulationData | null;
  hasEpanet: boolean;
  onRun: () => void;
  linkBy: LinkSymbology;
  nodeBy: NodeSymbology;
  hasResults: boolean;
}) {
  if (!hasEpanet) return null;
  const running = simStatus === 'queued' || simStatus === 'running';
  const label = SIM_STATUS_LABEL[simStatus] ?? simStatus;
  const linkLabel = LINK_SYMBOLOGY.find((o) => o.key === linkBy)?.label ?? '—';
  const nodeLabel = NODE_SYMBOLOGY.find((o) => o.key === nodeBy)?.label ?? '—';
  const stripCls = simData ? 'sim-success' : simStatus === 'failed' ? 'sim-failed' : running ? 'sim-running' : 'sim-idle';
  return (
    <div className={`gis-sim-strip ${stripCls}`}>
      <div className="gis-sim-state">
        <span className="gis-sim-dot" />
        <strong>{label}</strong>
      </div>
      <div className="gis-sim-fields">
        <div><span>Formula</span><strong>Hazen-Williams</strong></div>
        <div><span>Links by</span><strong>{linkLabel}</strong></div>
        <div><span>Nodes by</span><strong>{nodeLabel}</strong></div>
        <div><span>Results</span><strong>{hasResults ? 'Available' : 'None'}</strong></div>
      </div>
      <button type="button" className="gis-sim-run" onClick={onRun} disabled={running}>
        {running ? 'Running…' : simData ? 'Re-run' : 'Run simulation'}
      </button>
    </div>
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
        <div><span>Status</span><strong>${p.status === 'closed' ? 'Closed' : 'Open'}</strong></div>
      </div>
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
        <div><span>On pipe</span><strong>${escapeHtml(p.pipe_id || '—')}</strong></div>
      </div>
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

function RampLegend({ linkBy, hasResults }: { linkBy: LinkSymbology; hasResults: boolean }) {
  const range = RAMP_RANGES[linkBy];
  if (!range) return null;
  if (linkBy !== 'diameter' && !hasResults) return null;
  return (
    <div className="gis-ramp-legend">
      <div className="gis-ramp-bar" style={{ background: `linear-gradient(90deg, ${RAMP.join(',')})` }} />
      <div className="gis-ramp-labels"><span>{range.lo}</span><span>{range.hi}</span></div>
    </div>
  );
}

function LayerControl({
  layers,
  counts,
  onToggle,
  onAllPipes,
  onAllAssets,
  meta,
  simData,
  linkBy,
  nodeBy,
  onLinkBy,
  onNodeBy,
  hasResults
}: {
  layers: LayerVis;
  counts: { pipeCounts: Record<PipeClass, number>; assetCounts: Record<AssetKind, number>; junctionCount: number };
  onToggle: (k: PipeClass | AssetKind | 'junction') => void;
  onAllPipes: (on: boolean) => void;
  onAllAssets: (on: boolean) => void;
  meta: NetworkData['meta'];
  simData: SimulationData | null;
  linkBy: LinkSymbology;
  nodeBy: NodeSymbology;
  onLinkBy: (k: LinkSymbology) => void;
  onNodeBy: (k: NodeSymbology) => void;
  hasResults: boolean;
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
            <LayerToggle
              label="Network Junctions"
              count={counts.junctionCount}
              on={layers.junction}
              swatch={<JunctionSwatch />}
              onClick={() => onToggle('junction')}
            />
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
          <div className="gis-lc-section">
            <div className="gis-lc-section-head"><span>Link symbology</span></div>
            <select
              className="gis-symbology-select"
              value={linkBy}
              onChange={(e) => onLinkBy(e.target.value as LinkSymbology)}
            >
              {LINK_SYMBOLOGY.map((o) => (
                <option key={o.key} value={o.key} disabled={o.needsSim && !hasResults}>
                  {o.label}{o.needsSim && !hasResults ? ' · run simulation' : ''}
                </option>
              ))}
            </select>
            <RampLegend linkBy={linkBy} hasResults={hasResults} />
          </div>
          <div className="gis-lc-section">
            <div className="gis-lc-section-head"><span>Node symbology</span></div>
            <select
              className="gis-symbology-select"
              value={nodeBy}
              onChange={(e) => onNodeBy(e.target.value as NodeSymbology)}
            >
              {NODE_SYMBOLOGY.map((o) => (
                <option key={o.key} value={o.key} disabled={o.needsSim && !hasResults}>
                  {o.label}{o.needsSim && !hasResults ? ' · run simulation' : ''}
                </option>
              ))}
            </select>
          </div>
          {simData && simData.controls.length > 0 && (
            <div className="gis-lc-section" style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '10px' }}>
              <div className="gis-lc-section-head">
                <span>Operational Rules</span>
              </div>
              <div style={{ maxHeight: '90px', overflowY: 'auto', fontSize: '10px', color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-mono)', paddingRight: '4px' }}>
                {simData.controls.map((rule, idx) => (
                  <div key={idx} style={{ marginBottom: '6px', lineHeight: '1.3', paddingBottom: '4px', borderBottom: '1px solid hsla(var(--border) / 0.4)' }}>
                    • {rule}
                  </div>
                ))}
              </div>
            </div>
          )}
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
  label: string; count?: number; on: boolean; swatch: React.ReactNode; onClick: () => void;
}) {
  return (
    <button className={`gis-layer-toggle${on ? ' on' : ''}`} onClick={onClick} type="button">
      <span className="gis-lt-check">{on ? '✓' : ''}</span>
      <span className="gis-lt-swatch">{swatch}</span>
      <span className="gis-lt-label">{label}</span>
      {count !== undefined && <span className="gis-lt-count">{count.toLocaleString()}</span>}
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

function JunctionSwatch() {
  return (
    <span
      className="gis-asset-swatch sensor"
      style={{ background: '#94a3b8', border: '1.5px solid #475569', boxShadow: 'none', width: '8px', height: '8px', borderRadius: '50%' }}
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
        <strong>{meta.name || 'Unknown'}</strong>
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
        <strong>{meta.top_zones.length}</strong>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Side panels
   ───────────────────────────────────────── */

function PipePanel({ feature, onClose, simData, simHour }: {
  feature: PipeFeature;
  onClose: () => void;
  simData: SimulationData | null;
  simHour: number;
}) {
  const p = feature.properties;
  const style = PIPE_STYLE[p.ui_class];
  const zoneName = p.zone ? zoneLabel(p.zone) : '—';

  const sim = simData ? simData.links[p.id] : null;
  const currentFlow = sim ? `${(sim.flow[simHour] * 1000).toFixed(1)} L/s` : (p.diameter_mm ? `${Math.round((p.diameter_mm / 25) ** 1.6 * 0.8)} L/s` : '—');
  const currentVel = sim ? `${sim.velocity[simHour].toFixed(2)} m/s` : '—';
  const currentStatus = sim ? sim.status[simHour] : p.status;
  const flowDir = p.node_from && p.node_to ? `${p.node_from} → ${p.node_to}` : (sim && sim.flow[simHour] < 0 ? 'Reverse flow' : 'Normal flow');

  return (
    <SidePanel
      open
      onClose={onClose}
      kind={style.label}
      title={p.id}
      pill={{
        tone: currentStatus === 'closed' ? 'warn' : p.service === 'out-of-service' ? 'danger' : 'safe',
        label: currentStatus === 'closed' ? 'Closed' : p.service === 'in-service' ? 'In service' : p.service === 'out-of-service' ? 'Out of service' : 'Open'
      }}
    >
      <SectionLabel>Geometry</SectionLabel>
      <SpRow label="Pipe type" value={style.label} />
      <SpRow label="Material" value={p.material || '—'} />
      <SpRow label="Diameter" value={p.diameter_mm ? `${p.diameter_mm} mm` : '—'} mono />
      <SpRow label="Length" value={p.length_m ? `${p.length_m.toFixed(0)} m` : '—'} mono />
      <SpRow label="Pressure class" value={
        p.material === 'AC' || p.material === 'Steel' ? 'PN16' :
        p.diameter_mm && p.diameter_mm >= 300 ? 'PN16' :
        p.diameter_mm && p.diameter_mm >= 150 ? 'PN12.5' :
        p.diameter_mm && p.diameter_mm >= 63 ? 'PN10' : 'PN6'
      } />

      <div style={{ height: 14 }} />
      <SectionLabel>Operations</SectionLabel>
      <SpRow label="Status" value={currentStatus} color={currentStatus === 'closed' ? '#f59e0b' : '#22c55e'} />
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
        label="Velocity"
        value={currentVel}
        mono
        color={sim && Math.abs(sim.velocity[simHour]) > 1.8 ? '#ef4444' : '#22c55e'}
      />
      <SpRow label="Flow rate" value={currentFlow} mono />
      {sim && <SpRow label="Velocity status" value={Math.abs(sim.velocity[simHour]) > 1.8 ? 'High — check for scour' : Math.abs(sim.velocity[simHour]) > 0.05 ? 'Nominal' : 'No flow'} color={sim && Math.abs(sim.velocity[simHour]) > 1.8 ? '#ef4444' : '#22c55e'} />}

      {sim && (
        <>
          <div style={{ height: 14 }} />
          <SectionLabel>Simulation Profiles</SectionLabel>
          <SimulationChart
            title="Flow Rate Profile"
            values={sim.flow.map(v => v * 1000)}
            timesteps={simData!.timesteps}
            currentHour={simHour}
            unit="L/s"
          />
          <SimulationChart
            title="Velocity Profile"
            values={sim.velocity}
            timesteps={simData!.timesteps}
            currentHour={simHour}
            unit="m/s"
          />
        </>
      )}
    </SidePanel>
  );
}

function AssetPanel({ feature, onClose, simData, simHour }: {
  feature: AssetFeature;
  onClose: () => void;
  simData: SimulationData | null;
  simHour: number;
}) {
  const p = feature.properties;
  const sim = simData ? simData.nodes[p.id] : null;
  const currentPress = sim ? sim.pressure[simHour] : null;
  const currentDemand = sim ? sim.demand[simHour] : null;

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
        <SpRow label="Fill level" value={`${p.level_pct}%`} mono color={lvlColor} />
        <div className="aw-level-bar">
          <div className="aw-level-fill" style={{ width: `${p.level_pct}%`, background: lvlColor }} />
        </div>
        {currentPress !== null && <SpRow label="Pressure head" value={`${currentPress.toFixed(1)} m`} mono />}
        <SpRow label="Volume stored" value={`${Math.round(p.capacity_m3 * p.level_pct / 100).toLocaleString()} m³`} mono />
        <SpRow label="Capacity" value={`${p.capacity_m3.toLocaleString()} m³`} mono />
        <div style={{ height: 14 }} />
        <SectionLabel>Flow</SectionLabel>
        <SpRow label="Inflow" value={`${p.inflow_lps} L/s`} mono color="#0B5FFF" />
        <SpRow label="Outflow" value={`${p.outflow_lps} L/s`} mono color="#F59E0B" />
        <SpRow label="Net" value={`${p.inflow_lps - p.outflow_lps >= 0 ? '+' : ''}${p.inflow_lps - p.outflow_lps} L/s`} mono />
        <div style={{ height: 14 }} />
        <SectionLabel>Identifier</SectionLabel>
        <SpRow label="Tank ID" value={p.id} mono />
        <SpRow label="Connecting pipes" value={p.junction_degree} mono />

        {sim && (
          <>
            <div style={{ height: 14 }} />
            <SectionLabel>Simulation Profiles</SectionLabel>
            <SimulationChart
              title="Pressure Head Profile"
              values={sim.pressure}
              timesteps={simData!.timesteps}
              currentHour={simHour}
              unit="m"
            />
            <SimulationChart
              title="Flow / Demand Profile"
              values={sim.demand}
              timesteps={simData!.timesteps}
              currentHour={simHour}
              unit="L/s"
            />
          </>
        )}
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
        <SpRow label="Live reading" value={currentPress !== null ? `${(currentPress * 0.1).toFixed(2)} bar` : `${p.live_bar} bar`} mono color={p.status === 'alert' ? '#ef4444' : p.status === 'warn' ? '#f59e0b' : '#22c55e'} />
        <SpRow label="Drift" value={`${drift >= 0 ? '+' : ''}${drift.toFixed(2)} bar`} mono />
        <div style={{ height: 14 }} />
        <SectionLabel>Thresholds</SectionLabel>
        <SpRow label="Min allowed" value={`${p.min_bar} bar`} mono />
        <SpRow label="Max allowed" value={`${p.max_bar} bar`} mono />
        <SpRow label="Health" value={p.status === 'alert' ? 'Investigate' : 'Nominal'} />
        <div style={{ height: 14 }} />
        <SectionLabel>Identifier</SectionLabel>
        <SpRow label="Valve ID" value={p.id} mono />

        {sim && (
          <>
            <div style={{ height: 14 }} />
            <SectionLabel>Simulation Profiles</SectionLabel>
            <SimulationChart
              title="Pressure Profile"
              values={sim.pressure}
              timesteps={simData!.timesteps}
              currentHour={simHour}
              unit="m"
            />
            <SimulationChart
              title="Flow Rate Profile"
              values={sim.demand}
              timesteps={simData!.timesteps}
              currentHour={simHour}
              unit="L/s"
            />
          </>
        )}
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
        <SpRow label="Flow rate" value={currentDemand !== null ? `${(currentDemand * 1000).toFixed(1)} L/s` : `${p.consumption_m3d.toLocaleString()} m³`} mono color="#0B5FFF" />
        <SpRow label="7-day avg" value={`${Math.round(p.consumption_m3d * 0.92).toLocaleString()} m³`} mono />
        <div style={{ height: 14 }} />
        <SectionLabel>Identifier</SectionLabel>
        <SpRow label="Meter ID" value={p.id} mono />

        {sim && (
          <>
            <div style={{ height: 14 }} />
            <SectionLabel>Simulation Profiles</SectionLabel>
            <SimulationChart
              title="Pressure Profile"
              values={sim.pressure}
              timesteps={simData!.timesteps}
              currentHour={simHour}
              unit="m"
            />
            <SimulationChart
              title="Flow Profile"
              values={sim.demand.map(v => v * 1000)}
              timesteps={simData!.timesteps}
              currentHour={simHour}
              unit="L/s"
            />
          </>
        )}
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
      <SpRow label="Flow rate" value={currentDemand !== null ? `${(currentDemand * 1000).toFixed(1)} L/s` : `${p.flow_lps} L/s`} mono color="#0B5FFF" />
      <SpRow label="Pressure" value={currentPress !== null ? `${(currentPress * 0.1).toFixed(2)} bar` : `${p.pressure_bar} bar`} mono color="#22c55e" />
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

      {sim && (
        <>
          <div style={{ height: 14 }} />
          <SectionLabel>Simulation Profiles</SectionLabel>
          <SimulationChart
            title="Pressure Profile"
            values={sim.pressure}
            timesteps={simData!.timesteps}
            currentHour={simHour}
            unit="m"
          />
          <SimulationChart
            title="Flow Profile"
            values={sim.demand.map(v => v * 1000)}
            timesteps={simData!.timesteps}
            currentHour={simHour}
            unit="L/s"
          />
        </>
      )}
    </SidePanel>
  );
}

function JunctionPanel({ feature, onClose, simData, simHour }: {
  feature: JunctionFeature;
  onClose: () => void;
  simData: SimulationData | null;
  simHour: number;
}) {
  const p = feature.properties;
  const sim = simData ? simData.nodes[p.id] : null;
  const currentPress = sim ? sim.pressure[simHour] : null;
  const currentDemand = sim ? sim.demand[simHour] : null;
  const pressColor = currentPress === null ? undefined : currentPress < 10 ? '#ef4444' : currentPress < 15 ? '#f59e0b' : '#22c55e';

  return (
    <SidePanel
      open
      onClose={onClose}
      kind="Network junction"
      title={`Junction ${p.external_id}`}
      pill={{ tone: 'info', label: p.node_type === 'junction' ? 'Junction' : p.node_type }}
    >
      <SectionLabel>Geometry</SectionLabel>
      <SpRow label="Junction ID" value={p.external_id} mono />
      <SpRow label="Node type" value={p.node_type} />
      <SpRow label="Elevation" value={p.elevation_m !== undefined ? `${p.elevation_m.toFixed(1)} m` : '—'} mono />
      <SpRow label="Base demand" value={p.demand_lps !== undefined ? `${p.demand_lps.toFixed(3)} L/s` : '—'} mono />

      {sim && (
        <>
          <div style={{ height: 14 }} />
          <SectionLabel>Live telemetry (hour {simHour})</SectionLabel>
          <SpRow label="Pressure head" value={currentPress !== null ? `${currentPress.toFixed(2)} m` : '—'} mono color={pressColor} />
          <SpRow label="Demand" value={currentDemand !== null ? `${(currentDemand * 1000).toFixed(3)} L/s` : '—'} mono />
          <div style={{ height: 14 }} />
          <SectionLabel>Simulation Profiles</SectionLabel>
          <SimulationChart
            title="Pressure Head"
            values={sim.pressure}
            timesteps={simData!.timesteps}
            currentHour={simHour}
            unit="m"
          />
          <SimulationChart
            title="Demand"
            values={sim.demand.map(v => v * 1000)}
            timesteps={simData!.timesteps}
            currentHour={simHour}
            unit="L/s"
          />
        </>
      )}
      {!sim && (
        <>
          <div style={{ height: 14 }} />
          <SectionLabel>Simulation</SectionLabel>
          <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', padding: '8px 0' }}>
            No simulation data available for this junction. Run the hydraulic simulation to see live pressure and demand.
          </div>
        </>
      )}
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

function getVelocityColor(vel: number, isDark: boolean): string {
  const v = Math.abs(vel);
  if (v < 0.05) return isDark ? '#475569' : '#94a3b8'; // Slate (Zero flow/idle)
  if (v < 0.8) return '#10b981';                      // Green (Nominal speed)
  if (v < 1.8) return '#f59e0b';                      // Orange (Warning)
  return '#ef4444';                                   // Red (Excessive scour velocity)
}

function getFlowWeight(flow: number, baseWeight: number): number {
  // Returns the overlay dash weight — always thinner than the base pipe.
  // flow in m³/s: 0.0005=0.5 L/s, 0.005=5 L/s, 0.05=50 L/s
  const f = Math.abs(flow);
  if (f < 0.0005) return Math.max(1, baseWeight * 0.45); // trickle — very thin dash
  if (f < 0.005)  return Math.max(1, baseWeight * 0.55); // low flow
  if (f < 0.05)   return Math.max(1, baseWeight * 0.70); // moderate
  return Math.max(1, baseWeight * 0.85);                 // high flow — still below base
}

function formatSimTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const hPad = h.toString().padStart(2, '0');
  const mPad = m.toString().padStart(2, '0');
  return `${hPad}:${mPad}`;
}

function SimulationChart({
  title,
  values,
  timesteps,
  currentHour,
  unit
}: {
  title: string;
  values: number[];
  timesteps: number[];
  currentHour: number;
  unit: string;
}) {
  const max = Math.max(...values, 1.0);
  const min = Math.min(...values, 0.0);
  const range = max - min || 1.0;
  
  const w = 320;
  const h = 100;
  const paddingLeft = 35;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 20;
  
  const graphWidth = w - paddingLeft - paddingRight;
  const graphHeight = h - paddingTop - paddingBottom;
  
  const n = values.length;
  const points = values.map((v, i) => {
    const x = paddingLeft + (n > 1 ? i / (n - 1) : 0) * graphWidth;
    const y = paddingTop + graphHeight - ((v - min) / range) * graphHeight;
    return [x, y] as [number, number];
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const areaPath = `${path} L${(paddingLeft + graphWidth).toFixed(1)},${(paddingTop + graphHeight).toFixed(1)} L${paddingLeft.toFixed(1)},${(paddingTop + graphHeight).toFixed(1)} Z`;

  const cursorX = paddingLeft + (n > 1 ? currentHour / (n - 1) : 0) * graphWidth;
  
  return (
    <div className="sim-chart-container" style={{ marginTop: 12 }}>
      <div className="sim-chart-head" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: 4 }}>
        <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }}>{title}</span>
        <strong style={{ color: 'hsl(var(--primary))' }}>{(values[currentHour] || 0.0).toFixed(2)} {unit}</strong>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', background: 'hsl(var(--card-muted))', borderRadius: 'var(--r-md)', border: '1px solid hsl(var(--border))' }}>
        <line x1={paddingLeft} y1={paddingTop} x2={w - paddingRight} y2={paddingTop} stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={paddingLeft} y1={paddingTop + graphHeight / 2} x2={w - paddingRight} y2={paddingTop + graphHeight / 2} stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={paddingLeft} y1={paddingTop + graphHeight} x2={w - paddingRight} y2={paddingTop + graphHeight} stroke="hsl(var(--border))" strokeWidth={1} />
        
        <text x={paddingLeft - 6} y={paddingTop + 4} fill="hsl(var(--muted-foreground))" fontSize={9} textAnchor="end">{max.toFixed(1)}</text>
        <text x={paddingLeft - 6} y={paddingTop + graphHeight / 2 + 4} fill="hsl(var(--muted-foreground))" fontSize={9} textAnchor="end">{((max + min) / 2).toFixed(1)}</text>
        <text x={paddingLeft - 6} y={paddingTop + graphHeight + 4} fill="hsl(var(--muted-foreground))" fontSize={9} textAnchor="end">{min.toFixed(1)}</text>
        
        <text x={paddingLeft} y={h - 4} fill="hsl(var(--muted-foreground))" fontSize={9} textAnchor="start">{formatSimTime(timesteps[0] || 0)}</text>
        <text x={paddingLeft + graphWidth / 2} y={h - 4} fill="hsl(var(--muted-foreground))" fontSize={9} textAnchor="middle">{formatSimTime(timesteps[Math.floor((n - 1) / 2)] || 0)}</text>
        <text x={paddingLeft + graphWidth} y={h - 4} fill="hsl(var(--muted-foreground))" fontSize={9} textAnchor="end">{formatSimTime(timesteps[n - 1] || 0)}</text>
        
        <path d={areaPath} fill="rgba(11,95,255,0.08)" />
        <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.8} />
        
        <line x1={cursorX} y1={paddingTop} x2={cursorX} y2={paddingTop + graphHeight} stroke="hsl(var(--accent))" strokeWidth={1.5} />
        {points[currentHour] && (
          <circle cx={cursorX} cy={points[currentHour][1]} r={3.5} fill="hsl(var(--accent))" stroke="white" strokeWidth={1} />
        )}
      </svg>
    </div>
  );
}
