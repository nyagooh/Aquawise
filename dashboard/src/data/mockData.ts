export type RiskLevel = 'safe' | 'warning' | 'danger';

export interface SensorReading {
  id: string;
  name: string;
  value: number;
  unit: string;
  safeMin: number;
  safeMax: number;
  isReal: boolean;
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
  regionId: string;
  risk: RiskLevel;
  lastUpdated: string;
}

export interface Alert {
  id: string;
  time: string;
  source: string;
  regionId: string;
  parameter: string;
  value: string;
  risk: RiskLevel;
  action: string;
}

export interface RegionPrediction {
  id: string;
  region: string;
  waterBody: string;
  riskScore: number;
  riskLevel: RiskLevel;
  prediction: string;
  nextRisk: 'rising' | 'falling' | 'stable';
  contaminationProbability: number;
  topConcern: string;
  forecastDays: { day: string; score: number }[];
}

// ─── Time series (24h) ───
function generateTimeSeries(): TimePoint[] {
  const points: TimePoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = t.getHours();
    const tempBase = 24 + 4 * Math.sin((hour - 6) * Math.PI / 12);
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

// ─── Current sensor readings ───
const latest = timeSeriesData[timeSeriesData.length - 1];
export const currentReadings: SensorReading[] = [
  { id: 'temperature',      name: 'Temperature',      value: latest.temperature,     unit: '°C',    safeMin: 15,  safeMax: 30,  isReal: true,  description: 'High temps reduce oxygen and encourage bacteria growth.' },
  { id: 'turbidity',        name: 'Turbidity',        value: latest.turbidity,       unit: 'NTU',   safeMin: 0,   safeMax: 5,   isReal: true,  description: 'Measures water cloudiness. Higher = more particles.' },
  { id: 'ph',               name: 'pH Level',         value: latest.ph,              unit: 'pH',    safeMin: 6.5, safeMax: 8.5, isReal: false, description: 'Acidity balance. Unsafe pH harms humans and aquatic life.' },
  { id: 'dissolved_oxygen', name: 'Dissolved Oxygen',  value: latest.dissolvedOxygen, unit: 'mg/L',  safeMin: 6,   safeMax: 14,  isReal: false, description: 'Low dissolved oxygen signals pollution or algae bloom.' },
  { id: 'conductivity',     name: 'Conductivity',     value: latest.conductivity,    unit: 'µS/cm', safeMin: 200, safeMax: 800, isReal: false, description: 'Dissolved salts/minerals. Spikes may indicate runoff.' },
  { id: 'nitrates',         name: 'Nitrates',         value: latest.nitrates,        unit: 'mg/L',  safeMin: 0,   safeMax: 10,  isReal: false, description: 'Nutrients from fertiliser. High levels cause algae blooms.' },
];

// ─── Monitoring stations (Kisumu area) ───
export const waterSources: WaterSource[] = [
  { id: 'ws1', name: 'Dunga Beach Station',     regionId: 'r1', risk: 'safe',    lastUpdated: '2 min ago' },
  { id: 'ws2', name: 'Ahero Irrigation Canal',  regionId: 'r2', risk: 'warning', lastUpdated: '4 min ago' },
  { id: 'ws3', name: 'Nyalenda Wetland',        regionId: 'r3', risk: 'danger',  lastUpdated: '1 min ago' },
  { id: 'ws4', name: 'Kibos River Point',       regionId: 'r4', risk: 'safe',    lastUpdated: '6 min ago' },
  { id: 'ws5', name: 'Kondele Water Point',     regionId: 'r5', risk: 'safe',    lastUpdated: '3 min ago' },
];

// ─── Alerts ───
export const recentAlerts: Alert[] = [
  { id: 'a1', time: '08:42 AM',  source: 'Nyalenda Wetland',       regionId: 'r3', parameter: 'Turbidity',     value: '8.7 NTU',  risk: 'danger',  action: 'Boil water advisory issued for Nyalenda' },
  { id: 'a2', time: '07:15 AM',  source: 'Ahero Irrigation Canal', regionId: 'r2', parameter: 'Nitrates',      value: '11.2 mg/L', risk: 'warning', action: 'Increased monitoring at Ahero canal' },
  { id: 'a3', time: '06:30 AM',  source: 'Kibos River Point',      regionId: 'r4', parameter: 'pH Level',      value: '8.8 pH',   risk: 'warning', action: 'Treatment chemicals adjusted at Kibos' },
  { id: 'a4', time: 'Yesterday', source: 'Dunga Beach Station',     regionId: 'r1', parameter: 'Temperature',   value: '31.2 °C',  risk: 'warning', action: 'Resolved — temperature normalised at Dunga' },
  { id: 'a5', time: 'Yesterday', source: 'Nyalenda Wetland',       regionId: 'r3', parameter: 'E. coli (Sim)', value: 'Detected',  risk: 'danger',  action: 'Source isolated, samples sent to KIWASCO lab' },
];

// ─── Regional predictions (Kisumu sub-regions near water bodies) ───
export const regionPredictions: RegionPrediction[] = [
  {
    id: 'r1', region: 'Dunga', waterBody: 'Lake Victoria — Dunga Beach',
    riskScore: 18, riskLevel: 'safe',
    prediction: 'Lake water quality at Dunga Beach expected to remain stable. No significant contamination risk over the next 7 days.',
    nextRisk: 'stable', contaminationProbability: 8, topConcern: 'None',
    forecastDays: [
      { day: 'Mon', score: 15 }, { day: 'Tue', score: 18 }, { day: 'Wed', score: 14 },
      { day: 'Thu', score: 20 }, { day: 'Fri', score: 16 }, { day: 'Sat', score: 19 }, { day: 'Sun', score: 17 },
    ],
  },
  {
    id: 'r2', region: 'Ahero', waterBody: 'Nyando River & Irrigation Canals',
    riskScore: 42, riskLevel: 'warning',
    prediction: 'Rising turbidity expected from agricultural runoff through Ahero irrigation channels during the current planting season.',
    nextRisk: 'rising', contaminationProbability: 35, topConcern: 'Turbidity',
    forecastDays: [
      { day: 'Mon', score: 38 }, { day: 'Tue', score: 42 }, { day: 'Wed', score: 48 },
      { day: 'Thu', score: 52 }, { day: 'Fri', score: 45 }, { day: 'Sat', score: 40 }, { day: 'Sun', score: 38 },
    ],
  },
  {
    id: 'r3', region: 'Nyalenda', waterBody: 'Nyalenda Wetland & Streams',
    riskScore: 61, riskLevel: 'danger',
    prediction: 'High contamination risk from informal settlement waste entering wetland streams. E. coli levels above safe thresholds.',
    nextRisk: 'rising', contaminationProbability: 72, topConcern: 'E. coli & Nitrates',
    forecastDays: [
      { day: 'Mon', score: 55 }, { day: 'Tue', score: 61 }, { day: 'Wed', score: 68 },
      { day: 'Thu', score: 70 }, { day: 'Fri', score: 65 }, { day: 'Sat', score: 58 }, { day: 'Sun', score: 54 },
    ],
  },
  {
    id: 'r4', region: 'Kibos', waterBody: 'Kibos River',
    riskScore: 22, riskLevel: 'safe',
    prediction: 'Kibos River conditions are favourable. Industrial discharge from sugar factories within acceptable limits.',
    nextRisk: 'falling', contaminationProbability: 5, topConcern: 'None',
    forecastDays: [
      { day: 'Mon', score: 25 }, { day: 'Tue', score: 22 }, { day: 'Wed', score: 20 },
      { day: 'Thu', score: 18 }, { day: 'Fri', score: 15 }, { day: 'Sat', score: 16 }, { day: 'Sun', score: 14 },
    ],
  },
  {
    id: 'r5', region: 'Kondele', waterBody: 'Kondele Municipal Water Points',
    riskScore: 31, riskLevel: 'warning',
    prediction: 'Moderate pH fluctuations detected at Kondele water points. Pipe corrosion under investigation by KIWASCO.',
    nextRisk: 'stable', contaminationProbability: 22, topConcern: 'pH Level',
    forecastDays: [
      { day: 'Mon', score: 28 }, { day: 'Tue', score: 31 }, { day: 'Wed', score: 33 },
      { day: 'Thu', score: 30 }, { day: 'Fri', score: 29 }, { day: 'Sat', score: 32 }, { day: 'Sun', score: 30 },
    ],
  },
];
