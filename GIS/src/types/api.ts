// ─── Shared utilities ────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── GeoJSON ─────────────────────────────────────────────────────────────────

export type GeoJSONGeometry =
  | { type: 'Point';           coordinates: [number, number] }
  | { type: 'MultiPoint';      coordinates: [number, number][] }
  | { type: 'LineString';      coordinates: [number, number][] }
  | { type: 'MultiLineString'; coordinates: [number, number][][] }
  | { type: 'Polygon';         coordinates: [number, number][][] }
  | { type: 'MultiPolygon';    coordinates: [number, number][][][]};

export interface GeoJSONFeature<P = Record<string, unknown>> {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties: P;
}

export interface GeoJSONFeatureCollection<P = Record<string, unknown>> {
  type: 'FeatureCollection';
  features: GeoJSONFeature<P>[];
}

// ─── Core ─────────────────────────────────────────────────────────────────────

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  country: string;
  city: string;
  timezone: string;
  created_at: string;
}

export type UserRole = 'admin' | 'engineer' | 'ops_staff';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  organisation: Pick<Organisation, 'id' | 'name' | 'slug'> | null;
}

export interface Project {
  id: string;
  organisation: string;           // UUID
  name: string;
  description: string;
  created_by: string | null;      // UUID
  created_at: string;
  updated_at: string;
}

// ─── Networks ─────────────────────────────────────────────────────────────────

export type UploadStatus =
  | 'pending'
  | 'processing'
  | 'complete'
  | 'complete_warnings'
  | 'failed';

export type FileType = 'shapefile' | 'epanet';

export interface ValidationReport {
  pipes?: number;
  nodes?: number;
  warnings?: string[];
  error?: string;
}

export interface NetworkUpload {
  id: string;
  organisation: string;           // UUID
  project: string | null;         // UUID
  file_name: string;
  file_type: FileType;
  status: UploadStatus;
  validation_report: ValidationReport;
  uploaded_at: string;
  completed_at: string | null;
}

export interface WaterNetwork {
  id: string;
  name: string;
  source_crs: string;
  total_pipes: number;
  total_nodes: number;
  total_length_km: number | null;
  bbox: GeoJSONGeometry | null;
  created_at: string;
}

export interface NetworkStats {
  total_pipes: number;
  total_nodes: number;
  total_length_km: number | null;
}

export interface MaterialBreakdown {
  material: PipeMaterial;
  count: number;
  length_km: number;
}

export interface ZoneBreakdown {
  id: string;
  name: string;
  code: string;
  pipe_count: number;
  length_km: number;
}

export type NetworkNodeType = 'junction' | 'reservoir' | 'tank' | 'meter';

export interface EnhancedNetworkStats {
  total_pipes: number;
  total_nodes: number;
  total_length_km: number | null;
  materials_breakdown: MaterialBreakdown[];
  status_breakdown: Partial<Record<PipeStatus, number>>;
  age_distribution: Record<string, number>;
  zones_breakdown: ZoneBreakdown[];
  nodes_breakdown: Partial<Record<NetworkNodeType, number>>;
}

export type PipeMaterial = 'PVC' | 'GI' | 'HDPE' | 'Steel' | 'PPR' | 'CI' | 'AC' | 'Unknown';
export type PipeStatus = 'open' | 'closed' | 'out_of_service' | 'pending';

export interface PipeProperties {
  id: string;
  external_id: string;
  material: PipeMaterial;
  diameter_mm: number | null;
  length_m: number | null;
  status: PipeStatus;
  installation_year: number | null;
  zone_id: string | null;
}

export type PipeFeature = GeoJSONFeature<PipeProperties>;
export type PipeFeatureCollection = GeoJSONFeatureCollection<PipeProperties>;

export type NodeType = 'junction' | 'reservoir' | 'tank' | 'meter';

export interface NodeProperties {
  id: string;
  external_id: string;
  node_type: NodeType;
  elevation_m: number | null;
  demand_lps: number | null;
  zone_id: string | null;
}

export type NodeFeature = GeoJSONFeature<NodeProperties>;
export type NodeFeatureCollection = GeoJSONFeatureCollection<NodeProperties>;

export interface ZoneProperties {
  id: string;
  name: string;
  code: string;
  population_estimate: number | null;
}

export type ZoneFeature = GeoJSONFeature<ZoneProperties>;
export type ZoneFeatureCollection = GeoJSONFeatureCollection<ZoneProperties>;

export type AssetType =
  | 'pump'
  | 'valve'
  | 'meter'
  | 'treatment_plant'
  | 'borehole'
  | 'intake'
  | 'storage_tank';

export interface AssetProperties {
  id: string;
  name: string;
  asset_type: AssetType;
  status: string;
}

export type AssetFeature = GeoJSONFeature<AssetProperties>;
export type AssetFeatureCollection = GeoJSONFeatureCollection<AssetProperties>;

// ─── Sensors ──────────────────────────────────────────────────────────────────

export type SensorType =
  | 'pressure'
  | 'flow'
  | 'turbidity'
  | 'ph'
  | 'chlorine'
  | 'tds'
  | 'temperature';

export type ReadingQuality = 'good' | 'suspect' | 'bad';

export interface Sensor {
  id: string;
  organisation: string;           // UUID
  network: string;                // UUID
  sensor_type: SensorType;
  name: string;
  external_id: string;
  geometry: GeoJSONGeometry | null;
  associated_pipe: string | null;  // UUID
  associated_node: string | null;  // UUID
  unit: string;
  is_active: boolean;
  installed_at: string | null;
}

export interface SensorReading {
  sensor: string;                 // UUID
  timestamp: string;
  value: number;
  unit: string;
  quality_flag: ReadingQuality;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export type AnomalyType =
  | 'pressure_drop'
  | 'pressure_spike'
  | 'flow_imbalance'
  | 'quality_deviation'
  | 'sensor_fault';

export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AnomalyEvent {
  id: string;
  network: string;                // UUID
  sensor: string | null;          // UUID
  anomaly_type: AnomalyType;
  severity: AnomalySeverity;
  confidence: number;
  detected_at: string;
  description: string;
  affected_zone: string | null;   // UUID
  is_acknowledged: boolean;
  acknowledged_by: string | null; // UUID
}

export interface LeakRiskScore {
  pipe: string;                   // UUID
  risk_score: number;
  risk_decile: number;
  material_age_score: number | null;
  pressure_variance_score: number | null;
  historical_break_score: number | null;
  computed_at: string;
}

export interface LeakRiskProperties extends PipeProperties {
  risk_score: number;
  risk_decile: number;
}

export type LeakRiskFeatureCollection = GeoJSONFeatureCollection<LeakRiskProperties>;

// ─── Alerts ───────────────────────────────────────────────────────────────────

export type AlertOperator = 'lt' | 'gt' | 'lte' | 'gte' | 'eq';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertEventStatus = 'open' | 'acknowledged' | 'resolved';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'websocket';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface AlertRule {
  id: string;
  organisation: string;           // UUID
  network: string;                // UUID
  name: string;
  sensor_type: string;
  zone: string | null;            // UUID
  sensor: string | null;          // UUID
  metric: string;
  operator: AlertOperator;
  threshold: number;
  duration_seconds: number;
  severity: AlertSeverity;
  is_active: boolean;
  created_at: string;
}

export interface AlertEvent {
  id: string;
  rule: string;                   // UUID
  anomaly_event: string | null;   // UUID
  status: AlertEventStatus;
  severity: AlertSeverity;
  triggered_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  acknowledged_by: string | null; // UUID
  message: string;
}

export interface Notification {
  id: string;
  alert_event: string;            // UUID
  recipient: string;              // UUID
  channel: NotificationChannel;
  status: NotificationStatus;
  sent_at: string | null;
  error_message: string;
}

// ─── Hydraulics ───────────────────────────────────────────────────────────────

export type SimulationStatus = 'queued' | 'running' | 'complete' | 'failed';

export interface SimulationRun {
  id: string;
  network: string;                // UUID
  created_by: string | null;      // UUID
  name: string;
  status: SimulationStatus;
  duration_seconds: number | null;
  error_message: string;
  wntr_version: string;
  parameters: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
}

export interface HydraulicScenario {
  id: string;
  network: string;                // UUID
  name: string;
  base_run: string | null;        // UUID
  modifications: Record<string, unknown>;
  created_at: string;
}

export interface PressureResult {
  run: string;                    // UUID
  node_external_id: string;
  timestamp: string;
  pressure_m: number;
}

export interface FlowResult {
  run: string;                    // UUID
  pipe_external_id: string;
  timestamp: string;
  flow_lps: number;
  velocity_mps: number | null;
}

// ─── WebSocket messages ───────────────────────────────────────────────────────

export interface WSSensorReading {
  type: 'reading';
  sensor_id: string;
  value: number;
  unit: string;
  timestamp: string;
  quality_flag: ReadingQuality;
}

export interface WSAlertEvent {
  type: 'alert';
  event: AlertEvent;
}

export type WSMessage = WSSensorReading | WSAlertEvent;
