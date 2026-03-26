export type RiskLevel = 'safe' | 'warning' | 'danger';

export interface SensorReading {
  id: string;
  name: string;
  value: number;
  unit: string;
  safeMin: number;
  safeMax: number;
  isReal: boolean; // true = real sensor, false = simulated
  icon: string;
  description: string;
}

export interface TimePoint {
  time: string;
  temperature: number;
  turbidity: number;
  ph: number;
  dissolvedOxygen: number;
  conductivity: number;
  nitrates: number;
}

export interface WaterSource {
  id: string;
  name: string;
  location: string;
  risk: RiskLevel;
  lastUpdated: string;
  x: number; // percent position on map
  y: number;
}

export interface Alert {
  id: string;
  time: string;
  source: string;
  parameter: string;
  value: string;
  risk: RiskLevel;
  action: string;
}

// Simulate 24 hours of readings
function generateTimeSeries(): TimePoint[] {
  const points: TimePoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = t.getHours();
    // Temperature follows diurnal cycle
    const tempBase = 24 + 4 * Math.sin((hour - 6) * Math.PI / 12);
    // Turbidity spikes in morning (activity hours)
    const turbBase = 3.2 + (hour >= 6 && hour <= 10 ? 2.5 : 0) + Math.random() * 0.8;
    points.push({
      time: t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      temperature: parseFloat((tempBase + (Math.random() - 0.5) * 0.6).toFixed(1)),
      turbidity: parseFloat((turbBase + (Math.random() - 0.5) * 0.5).toFixed(2)),
      ph: parseFloat((7.2 + (Math.random() - 0.5) * 0.4).toFixed(2)),
      dissolvedOxygen: parseFloat((7.8 + (Math.random() - 0.5) * 0.6).toFixed(2)),
      conductivity: parseFloat((410 + (Math.random() - 0.5) * 30).toFixed(0)),
      nitrates: parseFloat((4.2 + (Math.random() - 0.5) * 1.2).toFixed(2)),
    });
  }
  return points;
}

export const timeSeriesData: TimePoint[] = generateTimeSeries();

// Current readings (latest point + real sensor boost)
const latest = timeSeriesData[timeSeriesData.length - 1];

export const currentReadings: SensorReading[] = [
  {
    id: 'temperature',
    name: 'Temperature',
    value: latest.temperature,
    unit: '°C',
    safeMin: 15,
    safeMax: 30,
    isReal: true,
    icon: '🌡️',
    description: 'Water temperature. High temps reduce oxygen & encourage bacteria growth.',
  },
  {
    id: 'turbidity',
    name: 'Turbidity',
    value: latest.turbidity,
    unit: 'NTU',
    safeMin: 0,
    safeMax: 5,
    isReal: true,
    icon: '💧',
    description: 'Water cloudiness. Higher values mean more particles — potential contamination.',
  },
  {
    id: 'ph',
    name: 'pH Level',
    value: latest.ph,
    unit: 'pH',
    safeMin: 6.5,
    safeMax: 8.5,
    isReal: false,
    icon: '⚗️',
    description: 'Acidity/alkalinity balance. Unsafe pH harms both humans and aquatic life.',
  },
  {
    id: 'dissolved_oxygen',
    name: 'Dissolved Oxygen',
    value: latest.dissolvedOxygen,
    unit: 'mg/L',
    safeMin: 6,
    safeMax: 14,
    isReal: false,
    icon: '🫧',
    description: 'Oxygen dissolved in water. Low levels signal pollution or algae bloom.',
  },
  {
    id: 'conductivity',
    name: 'Conductivity',
    value: latest.conductivity,
    unit: 'µS/cm',
    safeMin: 200,
    safeMax: 800,
    isReal: false,
    icon: '⚡',
    description: 'Measures dissolved salts/minerals. Spikes may indicate industrial runoff.',
  },
  {
    id: 'nitrates',
    name: 'Nitrates',
    value: latest.nitrates,
    unit: 'mg/L',
    safeMin: 0,
    safeMax: 10,
    isReal: false,
    icon: '🌿',
    description: 'Nutrient level. High nitrates from fertiliser runoff cause algae blooms.',
  },
];

export const waterSources: WaterSource[] = [
  { id: 'ws1', name: 'Nairobi River', location: 'Station A — Westlands', risk: 'safe',    lastUpdated: '2 min ago', x: 30, y: 35 },
  { id: 'ws2', name: 'Athi River',    location: 'Station B — Machakos',  risk: 'warning', lastUpdated: '4 min ago', x: 65, y: 55 },
  { id: 'ws3', name: 'Ruiru Dam',     location: 'Station C — Ruiru',     risk: 'safe',    lastUpdated: '1 min ago', x: 50, y: 22 },
  { id: 'ws4', name: 'Mbagathi River',location: 'Station D — Lang\'ata', risk: 'danger',  lastUpdated: '6 min ago', x: 40, y: 65 },
  { id: 'ws5', name: 'Ndakaini Dam',  location: 'Station E — Gatanga',   risk: 'safe',    lastUpdated: '3 min ago', x: 72, y: 28 },
];

export const recentAlerts: Alert[] = [
  {
    id: 'a1',
    time: '08:42 AM',
    source: 'Mbagathi River',
    parameter: 'Turbidity',
    value: '8.7 NTU',
    risk: 'danger',
    action: 'Boil water advisory issued',
  },
  {
    id: 'a2',
    time: '07:15 AM',
    source: 'Athi River',
    parameter: 'Nitrates',
    value: '11.2 mg/L',
    risk: 'warning',
    action: 'Monitoring increased',
  },
  {
    id: 'a3',
    time: '06:30 AM',
    source: 'Athi River',
    parameter: 'pH Level',
    value: '8.8 pH',
    risk: 'warning',
    action: 'Treatment chemicals adjusted',
  },
  {
    id: 'a4',
    time: 'Yesterday',
    source: 'Nairobi River',
    parameter: 'Temperature',
    value: '31.2 °C',
    risk: 'warning',
    action: 'Resolved — temperature normalised',
  },
  {
    id: 'a5',
    time: 'Yesterday',
    source: 'Mbagathi River',
    parameter: 'E. coli (Sim)',
    value: 'Detected',
    risk: 'danger',
    action: 'Source isolated, samples sent to lab',
  },
];
