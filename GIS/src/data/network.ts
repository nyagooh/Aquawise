/**
 * Network data loader — fetches the real Kisumu shapefile (converted to
 * GeoJSON by scripts/shapefile_to_geojson.py) and exposes typed accessors.
 *
 * Files served as static assets from /public/data/:
 *   - kisumu-pipes.geojson    (4,951 polylines, classified with ui_class)
 *   - kisumu-assets.geojson   (synthesized point telemetry overlay)
 *   - kisumu-meta.json        (rich aggregates: km by class/zone/material,
 *                              status counts, age/diameter distribution, bbox)
 */

export type PipeClass = 'main' | 'distribution' | 'household' | 'backfeed' | 'boundary';
export type PipeStatus = 'open' | 'closed' | 'unknown';
export type ServiceState = 'in-service' | 'out-of-service' | 'pending' | 'unknown';

export interface PipeProps {
  id: string;
  class: 'transmission' | 'distribution' | 'service' | 'boundary';
  ui_class: PipeClass;
  network_raw: string | null;
  material: string | null;
  diameter_mm: number | null;
  length_m: number | null;
  status: PipeStatus;
  service: ServiceState;
  zone: string | null;
  installed: number | null;
  node_from: string | null;
  node_to: string | null;
  remarks: string | null;
  layer: string | null;
}

export interface PipeFeature {
  type: 'Feature';
  id: string;
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  properties: PipeProps;
}

export type AssetKind = 'tank' | 'pressure_valve' | 'meter_valve' | 'sensor';
export type AssetStatus = 'ok' | 'warn' | 'alert';

export interface TankProps {
  asset: 'tank';
  id: string;
  name: string;
  capacity_m3: number;
  level_pct: number;
  inflow_lps: number;
  outflow_lps: number;
  status: AssetStatus;
  junction_degree: number;
}

export interface PressureValveProps {
  asset: 'pressure_valve';
  id: string;
  name: string;
  set_bar: number;
  live_bar: number;
  min_bar: number;
  max_bar: number;
  status: AssetStatus;
}

export interface MeterValveProps {
  asset: 'meter_valve';
  id: string;
  name: string;
  size_mm: number;
  state: 'open' | 'throttled';
  consumption_m3d: number;
  status: AssetStatus;
}

export interface SensorProps {
  asset: 'sensor';
  id: string;
  name: string;
  type: string;
  flow_lps: number;
  pressure_bar: number;
  last_seen: string;
  status: AssetStatus;
  pipe_id: string;
}

export type AssetProps = TankProps | PressureValveProps | MeterValveProps | SensorProps;

export interface AssetFeature {
  type: 'Feature';
  id: string;
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: AssetProps;
}

export interface NetworkMeta {
  source: string;
  feature_count: number;
  asset_count: number;
  asset_counts: Partial<Record<AssetKind, number>>;
  by_class: Partial<Record<PipeClass, number>>;
  length_km_by_class: Partial<Record<PipeClass, number>>;
  length_km_by_zone: Record<string, number>;
  length_km_by_material: Record<string, number>;
  top_zones: Array<[string, number]>;
  zones_normalized: Array<[string, number]>;
  materials: Array<[string, number]>;
  common_diameters_mm: Array<[number, number]>;
  diameter_distribution: Record<string, number>;
  age_distribution: Record<string, number>;
  status_counts: Record<PipeStatus, number>;
  service_counts: Record<ServiceState, number>;
  total_length_m: number;
  total_length_km: number;
  bbox: [number, number, number, number];
  center: [number, number];
}

export interface NetworkData {
  pipes: PipeFeature[];
  assets: AssetFeature[];
  meta: NetworkMeta;
}

let cache: Promise<NetworkData> | null = null;

export function loadNetwork(): Promise<NetworkData> {
  if (cache) return cache;
  cache = (async () => {
    const base = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
    const url = (path: string) => `${base.replace(/\/$/, '')}/data/${path}`;
    const [pipesRes, assetsRes, metaRes] = await Promise.all([
      fetch(url('kisumu-pipes.geojson')),
      fetch(url('kisumu-assets.geojson')),
      fetch(url('kisumu-meta.json'))
    ]);
    if (!pipesRes.ok || !assetsRes.ok || !metaRes.ok) {
      throw new Error('Failed to load Kisumu network dataset.');
    }
    const pipesFc = await pipesRes.json();
    const assetsFc = await assetsRes.json();
    const meta: NetworkMeta = await metaRes.json();
    return {
      pipes: pipesFc.features as PipeFeature[],
      assets: assetsFc.features as AssetFeature[],
      meta
    };
  })();
  return cache;
}

/* ============================================================
   Qatium-inspired enterprise palette — strong hierarchy, soft
   support tones, high contrast for trunk vs distribution vs
   household.
   ============================================================ */

export const PIPE_STYLE: Record<PipeClass, {
  color: string;
  hoverColor: string;
  weight: number;
  hoverWeight: number;
  dashArray?: string;
  opacity: number;
  label: string;
  shortLabel: string;
  description: string;
}> = {
  main: {
    color: '#1E40AF',          // deep cobalt — trunk authority
    hoverColor: '#3B82F6',
    weight: 5,
    hoverWeight: 7,
    opacity: 0.98,
    label: 'Transmission main',
    shortLabel: 'Mains',
    description: 'Primary supply trunk · highest priority'
  },
  distribution: {
    color: '#14B8A6',          // teal — clearly distinct from mains' cobalt
    hoverColor: '#5EEAD4',
    weight: 2.2,
    hoverWeight: 4,
    opacity: 0.88,
    label: 'Distribution main',
    shortLabel: 'Distribution',
    description: 'Neighbourhood feeder · zone backbone'
  },
  household: {
    color: '#64748B',          // mid slate — visible on both light and dark basemaps
    hoverColor: '#0EA5E9',
    weight: 1.6,
    hoverWeight: 3,
    opacity: 0.85,
    label: 'Household connection',
    shortLabel: 'Households',
    description: 'Service line to customer property'
  },
  backfeed: {
    color: '#F97316',          // saturated orange — flags isolation
    hoverColor: '#FB923C',
    weight: 2.8,
    hoverWeight: 4.5,
    dashArray: '8 5',
    opacity: 0.95,
    label: 'Backfeed / closed',
    shortLabel: 'Backfeed',
    description: 'Reversible supply path · currently closed'
  },
  boundary: {
    color: '#A855F7',          // saturated purple — clearly visible on both basemaps
    hoverColor: '#D8B4FE',
    weight: 3,
    hoverWeight: 4.5,
    dashArray: '6 4',
    opacity: 0.95,
    label: 'Zone boundary',
    shortLabel: 'DMA boundary',
    description: 'District metered area or service zone outline'
  }
};

export const PIPE_CLASS_ORDER: PipeClass[] = ['main', 'distribution', 'backfeed', 'household', 'boundary'];

export const ASSET_STYLE: Record<AssetKind, {
  color: string;
  ring: string;
  label: string;
  shortLabel: string;
  description: string;
}> = {
  tank: {
    color: '#1D4ED8',
    ring: '#BFDBFE',
    label: 'Reservoir · level sensor',
    shortLabel: 'Level sensors',
    description: 'Reservoir level-sensor telemetry'
  },
  pressure_valve: {
    color: '#10B981',
    ring: '#A7F3D0',
    label: 'Pressure valve',
    shortLabel: 'PRVs',
    description: 'Pressure-reducing valve · live drift'
  },
  meter_valve: {
    color: '#F97316',
    ring: '#FED7AA',
    label: 'Meter / bulk valve',
    shortLabel: 'Meters',
    description: 'Consumption-metered valve assembly'
  },
  sensor: {
    color: '#EF4444',
    ring: '#FECACA',
    label: 'Flow + pressure sensor',
    shortLabel: 'Sensors',
    description: 'Live flow & pressure telemetry node'
  }
};

export const ASSET_ORDER: AssetKind[] = ['tank', 'pressure_valve', 'meter_valve', 'sensor'];

export const STATUS_COLOR: Record<AssetStatus, string> = {
  ok: '#22C55E',
  warn: '#F59E0B',
  alert: '#EF4444'
};

export const MATERIAL_TINT: Record<string, string> = {
  PVC: '#0EA5E9',
  uPVC: '#22D3EE',
  HDPE: '#1D4ED8',
  PE: '#1D4ED8',
  GI: '#94A3B8',
  Steel: '#64748B',
  PPR: '#A78BFA',
  AC: '#F97316'
};

/** Zone display names (curated). Falls back to raw key for unknowns. */
export const ZONE_LABELS: Record<string, string> = {
  MIL: 'Milimani',
  MYT: 'Mamboleo · Tom Mboya',
  KREKAJ: 'Kibos · Kajulu',
  CBD: 'Central Business District',
  ME: 'Manyatta East',
  OBA: 'Obaria',
  KRE: 'Kibos',
  'RIAT C': 'Riat Centre',
  MTY: 'Mamboleo (legacy)',
  HDPE: 'Unclassified',
  CDD: 'Unclassified'
};

export function zoneLabel(code: string): string {
  return ZONE_LABELS[code] || code;
}

export function isRealZone(code: string): boolean {
  // Filter out polluted zone codes (material names accidentally entered as zone, etc.)
  if (!code) return false;
  if (code === 'HDPE' || code === 'CDD' || code === 'MTY') return false;
  return code.length <= 8;
}

/** Network health derived from real status counts. */
export function deriveHealthScore(meta: NetworkMeta): number {
  const open = meta.status_counts.open || 0;
  const total = (meta.status_counts.open || 0) + (meta.status_counts.closed || 0) + (meta.status_counts.unknown || 0);
  if (total === 0) return 100;
  return Math.round((open / total) * 100);
}

/** Estimate NRW (non-revenue water) from network composition and age. */
export function deriveNRW(meta: NetworkMeta): number {
  const pre2000 = meta.age_distribution['pre-2000'] || 0;
  const e2000 = meta.age_distribution['2000-2009'] || 0;
  const e2010 = meta.age_distribution['2010-2019'] || 0;
  const post = meta.age_distribution['2020+'] || 0;
  const unknown = meta.age_distribution.unknown || 0;
  const total = pre2000 + e2000 + e2010 + post + unknown || 1;
  // weighted age-based estimate (older pipe → more loss)
  const score =
    (pre2000 * 0.32 + e2000 * 0.22 + e2010 * 0.13 + post * 0.08 + unknown * 0.18) / total;
  return Math.round(score * 1000) / 10; // %
}

export function lengthByClass(meta: NetworkMeta, cls: PipeClass): number {
  return meta.length_km_by_class[cls] || 0;
}
