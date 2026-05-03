const BASE = 'http://localhost:8000/api';

function token() {
  try { return localStorage.getItem('aq_access'); } catch { return null; }
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const t = token();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (t) headers['Authorization'] = `Bearer ${t}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.detail || body.error || `HTTP ${res.status}`), { status: res.status, body });
  }
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)                => req<T>(path),
  post:   <T>(path: string, data: unknown) => req<T>(path, { method: 'POST',  body: JSON.stringify(data) }),
  put:    <T>(path: string, data: unknown) => req<T>(path, { method: 'PUT',   body: JSON.stringify(data) }),
  delete: <T>(path: string)               => req<T>(path, { method: 'DELETE' }),
};

// ── Types ──────────────────────────────────────────────────────────────────────

export type SourceStatus = 'safe' | 'warning' | 'danger';

export interface SourceReadings {
  ph: number | null;
  turbidity: number | null;
  temperature: number | null;
  dissolvedOxygen: number | null;
  conductivity: number | null;
  nitrates: number | null;
  freeChlorine: number | null;
  tds: number | null;
}

export interface WaterSource {
  id: string;
  name: string;
  county: string;
  regionId: string;
  status: SourceStatus;
  risk: string;
  lat: number | null;
  lng: number | null;
  sensorId: string;
  battery: number | null;
  installed: string | null;
  lastUpdate: string;
  readings: SourceReadings | null;
  /** param_ids this sensor measures; empty = show only non-null readings */
  measuredParameters: string[];
}

export interface ApiAlert {
  id: string;
  utilityId: string | null;
  title: string;
  parameter: string;
  value: string;
  threshold: number | null;
  severity: SourceStatus;
  description: string;
  triggered: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  time: string;
  source: string;
  regionId: string;
}

export interface TimeSeriesPoint {
  time: string;
  temperature: number;
  turbidity: number;
  ph: number;
  dissolvedOxygen: number;
  conductivity: number;
  nitrates: number;
}

export interface StationReading {
  timestamp: string;
  ph: number | null;
  turbidity: number | null;
  temperature: number | null;
  dissolvedOxygen: number | null;
  conductivity: number | null;
  nitrates: number | null;
  freeChlorine: number | null;
  tds: number | null;
}

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organization: string;
  avatar: string;
  twoFaEnabled: boolean;
}

export interface ApiKey {
  id: number;
  name: string;
  createdAt: string;
  lastUsed: string | null;
}

export interface NotificationPrefs {
  email: boolean;
  sms: boolean;
  push: boolean;
  critical: boolean;
  warning: boolean;
  dailyDigest: boolean;
}
