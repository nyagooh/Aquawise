import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';

const sensors = [
    { name: 'Crocodile River', lat: -24.18, lng: 31.5, status: 'danger', ph: 7.1, turb: 2.1, do_: 6.8, nit: 78.3, region: 'Limpopo Province', time: '2 min ago' },
    { name: 'Limpopo River', lat: -22.2, lng: 29.8, status: 'warning', ph: 7.4, turb: 4.8, do_: 7.2, nit: 12.1, region: 'Limpopo Province', time: '5 min ago' },
    { name: 'Olifants River', lat: -24.5, lng: 30.9, status: 'warning', ph: 7.8, turb: 1.9, do_: 4.2, nit: 8.4, region: 'Mpumalanga', time: '18 min ago' },
    { name: 'Vaal Dam', lat: -26.9, lng: 28.1, status: 'safe', ph: 7.6, turb: 0.8, do_: 9.1, nit: 6.3, region: 'Gauteng / Free State', time: '12 min ago' },
    { name: 'Orange River', lat: -28.7, lng: 17.7, status: 'safe', ph: 8.1, turb: 1.2, do_: 8.7, nit: 9.0, region: 'Northern Cape', time: '8 min ago' },
    { name: 'Umgeni River', lat: -29.7, lng: 30.9, status: 'safe', ph: 7.3, turb: 1.7, do_: 8.3, nit: 11.2, region: 'KwaZulu-Natal', time: '3 min ago' },
    { name: 'Berg River', lat: -33.4, lng: 18.9, status: 'safe', ph: 7.9, turb: 0.6, do_: 10.4, nit: 4.8, region: 'Western Cape', time: '7 min ago' },
    { name: 'Breede River', lat: -33.9, lng: 20.4, status: 'safe', ph: 7.5, turb: 1.1, do_: 9.8, nit: 7.1, region: 'Western Cape', time: '15 min ago' },
];

const phDataRaw = [7.4, 7.3, 7.2, 7.4, 7.5, 7.6, 7.8, 7.9, 7.7, 7.6, 7.5, 7.4, 7.3, 7.2, 7.4, 7.5, 7.6, 7.7, 7.6, 7.5, 7.4, 7.3, 7.4, 7.4];
const chartData = phDataRaw.map((val, i) => ({ time: `${i}:00`, ph: val }));

const colorMap: Record<string, string> = { safe: '#4CAF50', warning: '#FFA726', danger: '#EF5350' };

function createIcon(status: string) {
    const col = colorMap[status];
    return L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;border-radius:50%;background:${col};border:2px solid white;box-shadow:0 0 10px ${col};"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
}

export default function DashboardPage() {
    return (
        <>
            <style>{`
        #main-map { height: 380px; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s6); }
        @media(max-width:860px){ .two-col { grid-template-columns:1fr; } }
      `}</style>

            {/* KPIs */}
            <div className="kpi-grid">
                <div className="kpi-card kpi-accent">
                    <div className="kpi-header">
                        <div>
                            <div className="kpi-label">Total Locations</div>
                            <div className="kpi-value accent">8</div>
                            <div className="kpi-sub">4 provinces</div>
                        </div>
                        <div className="kpi-icon" style={{ background: 'var(--accent-glow)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        </div>
                    </div>
                </div>
                <div className="kpi-card kpi-safe">
                    <div className="kpi-header">
                        <div>
                            <div className="kpi-label">Safe</div>
                            <div className="kpi-value safe">5</div>
                            <div className="kpi-sub">within all thresholds</div>
                        </div>
                        <div className="kpi-icon" style={{ background: 'var(--safe-bg)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--safe)" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                    </div>
                </div>
                <div className="kpi-card kpi-warn">
                    <div className="kpi-header">
                        <div>
                            <div className="kpi-label">Warnings</div>
                            <div className="kpi-value warn">2</div>
                            <div className="kpi-sub">elevated readings</div>
                        </div>
                        <div className="kpi-icon" style={{ background: 'var(--warning-bg)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        </div>
                    </div>
                </div>
                <div className="kpi-card kpi-danger">
                    <div className="kpi-header">
                        <div>
                            <div className="kpi-label">Critical</div>
                            <div className="kpi-value danger">1</div>
                            <div className="kpi-sub">immediate attention</div>
                        </div>
                        <div className="kpi-icon" style={{ background: 'var(--danger-bg)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="card" style={{ overflow: 'hidden', marginTop: '1.5rem' }}>
                <div className="card-header">
                    <div className="card-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg>
                        Live Sensor Map
                    </div>
                    <div className="card-actions">
                        <button className="btn btn-sm btn-secondary">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                            Filter
                        </button>
                        <button className="btn btn-sm btn-ghost">Satellite</button>
                        <button className="btn btn-sm btn-ghost">Terrain</button>
                    </div>
                </div>
                <div style={{ position: 'relative' }}>
                    <div id="main-map" className="map-container" style={{ borderRadius: 0, border: 'none' }}>
                        <MapContainer center={[-29, 25]} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                            <TileLayer
                                attribution='&copy; OpenStreetMap, &copy; CARTO'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                maxZoom={19}
                            />
                            {sensors.map((s, i) => (
                                <Marker key={i} position={[s.lat, s.lng]} icon={createIcon(s.status)}>
                                    <Popup>
                                        <div style={{ minWidth: 180, background: '#071728', padding: '10px', borderRadius: '4px' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 8, color: '#E8F4FD' }}>{s.name}</div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.8rem' }}>
                                                <div><span style={{ color: '#3D6E90' }}>pH</span> <span style={{ fontFamily: 'monospace', color: '#E8F4FD' }}>{s.ph}</span></div>
                                                <div><span style={{ color: '#3D6E90' }}>Turbidity</span> <span style={{ fontFamily: 'monospace', color: '#E8F4FD' }}>{s.turb}</span></div>
                                                <div><span style={{ color: '#3D6E90' }}>DO</span> <span style={{ fontFamily: 'monospace', color: '#E8F4FD' }}>{s.do_}</span></div>
                                                <div><span style={{ color: '#3D6E90' }}>Nitrates</span> <span style={{ fontFamily: 'monospace', color: s.nit > 45 ? '#EF5350' : '#E8F4FD' }}>{s.nit}</span></div>
                                            </div>
                                            <Link to="/locations" style={{ display: 'block', marginTop: 10, padding: '6px 12px', background: '#00D4C8', color: '#071728', borderRadius: 6, textAlign: 'center', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>View Detail →</Link>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                    <div className="map-legend" style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 1000, background: 'var(--bg-overlay)', padding: 'var(--s3) var(--s4)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-default)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
                        <div className="map-legend-item" style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px' }}><span className="status-dot dot-safe"></span>Safe</div>
                        <div className="map-legend-item" style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px' }}><span className="status-dot dot-warning"></span>Warning</div>
                        <div className="map-legend-item" style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px' }}><span className="status-dot dot-danger"></span>Critical</div>
                    </div>
                </div>
            </div>

            {/* Bottom two columns */}
            <div className="two-col" style={{ marginTop: '1.5rem' }}>
                {/* Recent Alerts */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
                            Active Alerts
                        </div>
                        <Link to="/alerts" className="btn btn-sm btn-ghost">View all →</Link>
                    </div>
                    <div className="alert-item">
                        <div className="alert-icon-wrap alert-icon-danger">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        </div>
                        <div className="alert-meta">
                            <div className="alert-title">Nitrates exceed limit</div>
                            <div className="alert-desc">Crocodile River — 78.3 mg/L</div>
                            <div className="alert-time">2 min ago</div>
                        </div>
                        <span className="badge badge-danger">Critical</span>
                    </div>
                    <div className="alert-item">
                        <div className="alert-icon-wrap alert-icon-warning">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        </div>
                        <div className="alert-meta">
                            <div className="alert-title">Low dissolved oxygen</div>
                            <div className="alert-desc">Olifants River — 4.2 mg/L</div>
                            <div className="alert-time">18 min ago</div>
                        </div>
                        <span className="badge badge-warning">Warning</span>
                    </div>
                    <div className="alert-item">
                        <div className="alert-icon-wrap alert-icon-warning">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        </div>
                        <div className="alert-meta">
                            <div className="alert-title">High turbidity</div>
                            <div className="alert-desc">Limpopo River — 4.8 NTU</div>
                            <div className="alert-time">1 hr ago</div>
                        </div>
                        <span className="badge badge-warning">Warning</span>
                    </div>
                </div>

                {/* 24hr Trend mini chart */}
                <div className="card">
                    <div className="card-header">
                        <div className="card-title">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg>
                            Network Trend (24h)
                        </div>
                        <div className="card-actions">
                            <select className="form-control" style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }} defaultValue="pH avg">
                                <option>pH avg</option>
                                <option>Turbidity avg</option>
                                <option>DO avg</option>
                            </select>
                        </div>
                    </div>
                    <div className="card-body" style={{ height: 180, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(38,78,115,0.3)" />
                                <XAxis dataKey="time" stroke="#3D6E90" fontSize={10} tick={{ fill: '#3D6E90' }} />
                                <YAxis domain={[6.8, 8.2]} stroke="#3D6E90" fontSize={10} tick={{ fill: '#3D6E90' }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1A3A5C', borderColor: '#264E73', color: '#E8F4FD' }} />
                                <Line type="monotone" dataKey="ph" stroke="#00D4C8" strokeWidth={2} dot={false} activeDot={{ r: 4 }} fill="rgba(0,212,200,0.08)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Sensor Readings Table */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-header">
                    <div className="card-title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
                        Latest Sensor Readings
                    </div>
                    <div className="card-actions">
                        <div className="search-box" style={{ width: 200 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input type="text" placeholder="Search location…" />
                        </div>
                        <button className="btn btn-sm btn-secondary">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Export
                        </button>
                    </div>
                </div>
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Location</th>
                                <th>Status</th>
                                <th>pH</th>
                                <th>Turbidity (NTU)</th>
                                <th>DO (mg/L)</th>
                                <th>Nitrates (mg/L)</th>
                                <th>Temp (°C)</th>
                                <th>Last Update</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sensors.map((s, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                                            <div className={`sensor-pulse ${s.status === 'safe' ? 'safe' : s.status === 'warning' ? 'warn' : 'danger'}`}></div>
                                            <div>
                                                <div className="loc-name">{s.name}</div>
                                                <div className="loc-region">{s.region}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${s.status}`}>{s.status === 'safe' ? 'Safe' : s.status === 'warning' ? 'Warning' : 'Critical'}</span>
                                    </td>
                                    <td className="mono" style={{ color: 'var(--safe)' }}>{s.ph}</td>
                                    <td className="mono" style={{ color: s.turb > 2 ? 'var(--warning)' : 'var(--safe)' }}>{s.turb}</td>
                                    <td className="mono" style={{ color: s.do_ < 6 ? 'var(--warning)' : 'var(--safe)' }}>{s.do_}</td>
                                    <td className="mono" style={{ color: s.nit > 15 ? 'var(--danger)' : 'var(--safe)' }}>{s.nit}</td>
                                    <td className="mono">22.4</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{s.time}</td>
                                    <td><Link to="/locations" className="btn btn-sm btn-secondary">View</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
