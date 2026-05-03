import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useTheme } from '../lib/theme';
import type { WaterSource, SourceStatus } from '../lib/api';

const colorOf: Record<SourceStatus, string> = {
  safe:    '#22C55E',
  warning: '#F59E0B',
  danger:  '#EF4444',
};

export default function UtilityMap(props: { height?: number; utilities?: WaterSource[] }) {
  const { theme } = useTheme();
  const list = (props.utilities ?? []).filter(u => u.lat != null && u.lng != null);
  const tileUrl = theme === 'light'
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  return (
    <div className="map-container" style={{ height: props.height ?? 360 }}>
      <MapContainer center={[0.5, 37.5]} zoom={6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer url={tileUrl} attribution="© OpenStreetMap, © CARTO" />
        {list.map(u => (
          <CircleMarker
            key={u.id}
            center={[u.lat!, u.lng!]}
            radius={9}
            pathOptions={{ color: colorOf[u.status], fillColor: colorOf[u.status], fillOpacity: 0.85, weight: 2 }}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>{u.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: 8 }}>{u.county} County</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.8rem' }}>
                  <div>pH <strong>{u.readings?.ph ?? '—'}</strong></div>
                  <div>Turbidity <strong>{u.readings?.turbidity != null ? `${u.readings.turbidity} NTU` : '—'}</strong></div>
                  <div>Nitrates <strong>{u.readings?.nitrates != null ? `${u.readings.nitrates} mg/L` : '—'}</strong></div>
                  <div>Temp <strong>{u.readings?.temperature != null ? `${u.readings.temperature}°C` : '—'}</strong></div>
                </div>
                <Link to={`/locations/${u.id}`} style={{ display: 'block', marginTop: 10, padding: '6px 10px', background: '#3B82F6', color: '#fff', borderRadius: 6, textAlign: 'center', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>
                  View Detail →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
