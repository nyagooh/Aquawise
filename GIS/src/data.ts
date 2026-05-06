export type ZoneStatus = 'safe' | 'warn' | 'danger';
export type SensorStatus = ZoneStatus | 'offline';
export type Severity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'active' | 'resolved';

export interface Zone {
  id: string;
  name: string;
  people: number;
  alerts: number;
  pressure: number;
  status: ZoneStatus;
  loss: number;
  color: string;
}

export interface Sensor {
  id: string;
  type: 'Pressure' | 'Level' | 'pH';
  zone: string;
  reading: string;
  status: SensorStatus;
  updated: string;
}

export interface Pipe {
  id: string;
  type: 'PVC' | 'HDPE' | 'DI';
  diameter: string;
  zone: string;
  pressure: string;
}

export interface Alert {
  id: string;
  type: string;
  zone: string;
  sensor: string;
  severity: Severity;
  time: string;
  status: AlertStatus;
}

export const zones: Zone[] = [
  { id: 'ZA', name: 'Zone A — Westlands',  people: 24500, alerts: 1, pressure: 3.4, status: 'safe',   loss: 8,  color: '#22C55E' },
  { id: 'ZB', name: 'Zone B — Kileleshwa', people: 18200, alerts: 2, pressure: 2.1, status: 'warn',   loss: 18, color: '#F59E0B' },
  { id: 'ZC', name: 'Zone C — Lavington',  people: 21300, alerts: 0, pressure: 3.2, status: 'safe',   loss: 9,  color: '#22C55E' },
  { id: 'ZD', name: 'Zone D — Karen',      people: 12800, alerts: 1, pressure: 1.4, status: 'danger', loss: 27, color: '#EF4444' },
  { id: 'ZE', name: 'Zone E — Industrial', people: 9400,  alerts: 0, pressure: 3.6, status: 'safe',   loss: 6,  color: '#22C55E' }
];

export const sensors: Sensor[] = [
  { id: 'PR-01', type: 'Pressure', zone: 'ZA', reading: '3.4 bar', status: 'safe',    updated: '12s ago' },
  { id: 'PR-02', type: 'Pressure', zone: 'ZB', reading: '2.1 bar', status: 'warn',    updated: '8s ago' },
  { id: 'PR-03', type: 'Pressure', zone: 'ZD', reading: '1.4 bar', status: 'danger',  updated: '4s ago' },
  { id: 'PR-04', type: 'Pressure', zone: 'ZC', reading: '3.2 bar', status: 'safe',    updated: '11s ago' },
  { id: 'LV-01', type: 'Level',    zone: 'ZA', reading: '87%',     status: 'safe',    updated: '20s ago' },
  { id: 'LV-02', type: 'Level',    zone: 'ZD', reading: '34%',     status: 'warn',    updated: '15s ago' },
  { id: 'LV-03', type: 'Level',    zone: 'ZE', reading: '92%',     status: 'safe',    updated: '9s ago' },
  { id: 'PH-01', type: 'pH',       zone: 'ZA', reading: '7.2',     status: 'safe',    updated: '1m ago' },
  { id: 'PH-02', type: 'pH',       zone: 'ZB', reading: '6.9',     status: 'safe',    updated: '1m ago' },
  { id: 'PH-03', type: 'pH',       zone: 'ZC', reading: '—',       status: 'offline', updated: '2h ago' }
];

export const pipes: Pipe[] = [
  { id: 'P-101', type: 'PVC',  diameter: '150mm', zone: 'ZA', pressure: '3.4 bar' },
  { id: 'P-102', type: 'HDPE', diameter: '200mm', zone: 'ZB', pressure: '2.1 bar' },
  { id: 'P-103', type: 'HDPE', diameter: '250mm', zone: 'ZC', pressure: '3.2 bar' },
  { id: 'P-104', type: 'PVC',  diameter: '100mm', zone: 'ZD', pressure: '1.4 bar' },
  { id: 'P-105', type: 'DI',   diameter: '300mm', zone: 'ZE', pressure: '3.6 bar' }
];

export const alerts: Alert[] = [
  { id: 'A-1023', type: 'Low pressure',      zone: 'ZD', sensor: 'PR-03', severity: 'critical', time: '3 min ago',  status: 'active' },
  { id: 'A-1022', type: 'Tank level low',    zone: 'ZD', sensor: 'LV-02', severity: 'warning',  time: '14 min ago', status: 'active' },
  { id: 'A-1021', type: 'Pressure anomaly',  zone: 'ZB', sensor: 'PR-02', severity: 'warning',  time: '38 min ago', status: 'active' },
  { id: 'A-1020', type: 'Sensor offline',    zone: 'ZC', sensor: 'PH-03', severity: 'info',     time: '2h ago',     status: 'active' },
  { id: 'A-1019', type: 'NRW spike',         zone: 'ZB', sensor: '—',     severity: 'warning',  time: '4h ago',     status: 'resolved' },
  { id: 'A-1018', type: 'Pressure recovery', zone: 'ZA', sensor: 'PR-01', severity: 'info',     time: '6h ago',     status: 'resolved' }
];

/* ── Real Nairobi coordinates for the aerial map ── */
/* Lat/Lng polygons covering Westlands, Kileleshwa, Lavington, Karen, Industrial */
export type LatLng = [number, number];

export const zonePolys: Record<string, LatLng[]> = {
  ZA: [ /* Westlands */
    [-1.2540, 36.7920], [-1.2540, 36.8120], [-1.2700, 36.8160],
    [-1.2780, 36.8060], [-1.2740, 36.7900]
  ],
  ZB: [ /* Kileleshwa */
    [-1.2780, 36.7820], [-1.2780, 36.7950], [-1.2900, 36.7980],
    [-1.2960, 36.7860], [-1.2890, 36.7780]
  ],
  ZC: [ /* Lavington */
    [-1.2780, 36.7600], [-1.2780, 36.7800], [-1.2920, 36.7820],
    [-1.2980, 36.7700], [-1.2900, 36.7560]
  ],
  ZD: [ /* Karen (south-west, larger) */
    [-1.3050, 36.6800], [-1.3050, 36.7220], [-1.3380, 36.7280],
    [-1.3460, 36.7100], [-1.3360, 36.6800]
  ],
  ZE: [ /* Industrial Area (east) */
    [-1.2960, 36.8400], [-1.2940, 36.8620], [-1.3120, 36.8680],
    [-1.3200, 36.8560], [-1.3100, 36.8380]
  ]
};

export const zoneCenters: Record<string, LatLng> = {
  ZA: [-1.2670, 36.8050],
  ZB: [-1.2860, 36.7880],
  ZC: [-1.2870, 36.7700],
  ZD: [-1.3210, 36.7050],
  ZE: [-1.3050, 36.8520]
};

/* Pipes drawn between sensors / tanks along realistic routes */
export const pipeLatLng: Array<{ id: string; path: LatLng[]; main: boolean }> = [
  { id: 'P-101', main: true,  path: [[-1.2670, 36.8050], [-1.2860, 36.7880]] },
  { id: 'P-102', main: true,  path: [[-1.2860, 36.7880], [-1.2870, 36.7700]] },
  { id: 'P-103', main: true,  path: [[-1.2870, 36.7700], [-1.3210, 36.7050]] },
  { id: 'P-104', main: false, path: [[-1.2860, 36.7880], [-1.3210, 36.7050]] },
  { id: 'P-105', main: true,  path: [[-1.2870, 36.7700], [-1.3050, 36.8520]] },
  { id: 'P-106', main: false, path: [[-1.2670, 36.8050], [-1.2580, 36.8000]] },
  { id: 'P-107', main: false, path: [[-1.3210, 36.7050], [-1.3340, 36.7080]] },
  { id: 'P-108', main: false, path: [[-1.3050, 36.8520], [-1.3000, 36.8600]] }
];

export const tanksLatLng: Array<{ id: string; pos: LatLng; zone: string; level: number }> = [
  { id: 'T-01', pos: [-1.2580, 36.8000], zone: 'ZA', level: 87 },
  { id: 'T-02', pos: [-1.2820, 36.7720], zone: 'ZC', level: 62 },
  { id: 'T-03', pos: [-1.3000, 36.8600], zone: 'ZE', level: 92 }
];

export const sensorLatLng: Record<string, LatLng> = {
  'PR-01': [-1.2670, 36.8050],
  'PR-02': [-1.2860, 36.7880],
  'PR-03': [-1.3210, 36.7050],
  'PR-04': [-1.2870, 36.7700],
  'LV-01': [-1.2580, 36.8000],
  'LV-02': [-1.3340, 36.7080],
  'LV-03': [-1.3000, 36.8600],
  'PH-01': [-1.2700, 36.8000],
  'PH-02': [-1.2900, 36.7900],
  'PH-03': [-1.2880, 36.7720]
};

/* Map default view */
export const MAP_CENTER: LatLng = [-1.2920, 36.7820];
export const MAP_ZOOM = 12;

export const statusColor = (s: SensorStatus): string =>
  ({ safe: '#22C55E', warn: '#F59E0B', danger: '#EF4444', offline: '#64748B' }[s] || '#64748B');

export const statusLabel = (s: SensorStatus): string =>
  ({ safe: 'Online', warn: 'Anomaly', danger: 'Critical', offline: 'Offline' }[s] || s);
