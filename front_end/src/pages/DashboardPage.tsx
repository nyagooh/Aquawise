import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Chart from 'chart.js/auto';

export default function DashboardPage() {
  const mapRef = useRef<any>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    // Only initialize if not already initialized
    if (!mapRef.current) {
      const map = L.map('main-map', { zoomControl: true, scrollWheelZoom: false }).setView([-29, 25], 5);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap, © CARTO', maxZoom: 19
      }).addTo(map);

      const sensors = [
        { name: 'Crocodile River', lat: -24.18, lng: 31.5, status: 'danger', ph: 7.1, turb: 2.1, do_: 6.8, nit: 78.3 },
        { name: 'Limpopo River', lat: -22.2, lng: 29.8, status: 'warning', ph: 7.4, turb: 4.8, do_: 7.2, nit: 12.1 },
        { name: 'Olifants River', lat: -24.5, lng: 30.9, status: 'warning', ph: 7.8, turb: 1.9, do_: 4.2, nit: 8.4 },
        { name: 'Vaal Dam', lat: -26.9, lng: 28.1, status: 'safe', ph: 7.6, turb: 0.8, do_: 9.1, nit: 6.3 },
        { name: 'Orange River', lat: -28.7, lng: 17.7, status: 'safe', ph: 8.1, turb: 1.2, do_: 8.7, nit: 9.0 },
        { name: 'Umgeni River', lat: -29.7, lng: 30.9, status: 'safe', ph: 7.3, turb: 1.7, do_: 8.3, nit: 11.2 },
        { name: 'Berg River', lat: -33.4, lng: 18.9, status: 'safe', ph: 7.9, turb: 0.6, do_: 10.4, nit: 4.8 },
        { name: 'Breede River', lat: -33.9, lng: 20.4, status: 'safe', ph: 7.5, turb: 1.1, do_: 9.8, nit: 7.1 },
      ];
      const colorMap: any = { safe: '#4CAF50', warning: '#FFA726', danger: '#EF5350' };

      sensors.forEach(s => {
        const col = colorMap[s.status];
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:16px;height:16px;border-radius:50%;background:${col};border:2px solid white;box-shadow:0 0 10px ${col};"></div>`,
          iconSize: [16, 16], iconAnchor: [8, 8]
        });
        L.marker([s.lat, s.lng], { icon }).addTo(map)
          .bindPopup(`
            <div style="min-width:180px">
              <div style="font-weight:700;font-size:0.9rem;margin-bottom:8px;color:#E8F4FD">${s.name}</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.8rem">
                <div><span style="color:#3D6E90">pH</span> <span style="font-family:monospace;color:#E8F4FD">${s.ph}</span></div>
                <div><span style="color:#3D6E90">Turbidity</span> <span style="font-family:monospace;color:#E8F4FD">${s.turb}</span></div>
                <div><span style="color:#3D6E90">DO</span> <span style="font-family:monospace;color:#E8F4FD">${s.do_}</span></div>
                <div><span style="color:#3D6E90">Nitrates</span> <span style="font-family:monospace;color:${s.nit > 45 ? '#EF5350' : '#E8F4FD'}">${s.nit}</span></div>
              </div>
              <a href="/locations" style="display:block;margin-top:10px;padding:6px 12px;background:#00D4C8;color:#071728;border-radius:6px;text-align:center;font-weight:600;font-size:0.8rem;text-decoration:none">View Detail →</a>
            </div>
          `);
      });
      mapRef.current = map;
    }

    if (!chartRef.current) {
      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      const phData = [7.4, 7.3, 7.2, 7.4, 7.5, 7.6, 7.8, 7.9, 7.7, 7.6, 7.5, 7.4, 7.3, 7.2, 7.4, 7.5, 7.6, 7.7, 7.6, 7.5, 7.4, 7.3, 7.4, 7.4];

      const ctx = document.getElementById('trend-chart') as HTMLCanvasElement;
      if (ctx) {
        const c = new Chart(ctx, {
          type: 'line',
          data: {
            labels: hours,
            datasets: [{
              data: phData,
              borderColor: '#00D4C8',
              backgroundColor: 'rgba(0,212,200,0.08)',
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
              fill: true,
              tension: 0.4,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1A3A5C',
                borderColor: '#264E73',
                borderWidth: 1,
                titleColor: '#7BB8D8',
                bodyColor: '#E8F4FD',
              }
            },
            scales: {
              x: { grid: { color: 'rgba(38,78,115,0.3)' }, ticks: { color: '#3D6E90', maxTicksLimit: 8, font: { size: 10 } } },
              y: { grid: { color: 'rgba(38,78,115,0.3)' }, ticks: { color: '#3D6E90', font: { size: 10 } }, min: 6.8, max: 8.2 }
            }
          }
        });
        chartRef.current = c;
      }
    }

    return () => {
      // cleanup on unmount
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
  }, []);

  return (
    <>
      <style>{`
        #main-map { height: 380px; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: var(--s6); }
        @media(max-width:860px){ .two-col { grid-template-columns:1fr; } }
      `}</style>


      {/*  KPIs  */}
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

      {/*  Map  */}
      <div className="card" style={{ overflow: 'hidden' }}>
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
          <div id="main-map" className="map-container" style={{ borderRadius: 0, border: 'none' }}></div>
          <div className="map-legend">
            <div className="map-legend-item"><span className="status-dot dot-safe"></span>Safe</div>
            <div className="map-legend-item"><span className="status-dot dot-warning"></span>Warning</div>
            <div className="map-legend-item"><span className="status-dot dot-danger"></span>Critical</div>
          </div>
        </div>
      </div>

      {/*  Bottom two columns  */}
      <div className="two-col">
        {/*  Recent Alerts  */}
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

        {/*  24hr Trend mini chart  */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg>
              Network Trend (24h)
            </div>
            <div className="card-actions">
              <select className="form-control" style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem' }}>
                <option>pH avg</option>
                <option>Turbidity avg</option>
                <option>DO avg</option>
              </select>
            </div>
          </div>
          <div className="card-body">
            <canvas id="trend-chart" height="160"></canvas>
          </div>
        </div>
      </div>

      {/*  Sensor Readings Table  */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
            Latest Sensor Readings
          </div>
          <div className="card-actions">
            <div className="search-box" style={{ width: '200px' }}>
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
            <tbody id="readings-table">
              <tr>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}><div className="sensor-pulse danger"></div><div><div className="loc-name">Crocodile River</div><div className="loc-region">Limpopo Province</div></div></div></td>
                <td><span className="badge badge-danger">Critical</span></td>
                <td className="mono" style={{ color: 'var(--safe)' }}>7.1</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>2.1</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>6.8</td>
                <td className="mono" style={{ color: 'var(--danger)' }}>78.3</td>
                <td className="mono">22.4</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>2 min ago</td>
                <td><a href="location-detail.html" className="btn btn-sm btn-secondary">View</a></td>
              </tr>
              <tr>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}><div className="sensor-pulse warn"></div><div><div className="loc-name">Limpopo River</div><div className="loc-region">Limpopo Province</div></div></div></td>
                <td><span className="badge badge-warning">Warning</span></td>
                <td className="mono" style={{ color: 'var(--safe)' }}>7.4</td>
                <td className="mono" style={{ color: 'var(--warning)' }}>4.8</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>7.2</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>12.1</td>
                <td className="mono">24.1</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>5 min ago</td>
                <td><a href="location-detail.html" className="btn btn-sm btn-secondary">View</a></td>
              </tr>
              <tr>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}><div className="sensor-pulse warn"></div><div><div className="loc-name">Olifants River</div><div className="loc-region">Mpumalanga</div></div></div></td>
                <td><span className="badge badge-warning">Warning</span></td>
                <td className="mono" style={{ color: 'var(--safe)' }}>7.8</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>1.9</td>
                <td className="mono" style={{ color: 'var(--warning)' }}>4.2</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>8.4</td>
                <td className="mono">26.7</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>18 min ago</td>
                <td><a href="location-detail.html" className="btn btn-sm btn-secondary">View</a></td>
              </tr>
              <tr>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}><div className="sensor-pulse safe"></div><div><div className="loc-name">Vaal Dam</div><div className="loc-region">Gauteng / Free State</div></div></div></td>
                <td><span className="badge badge-safe">Safe</span></td>
                <td className="mono" style={{ color: 'var(--safe)' }}>7.6</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>0.8</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>9.1</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>6.3</td>
                <td className="mono">18.2</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>12 min ago</td>
                <td><a href="location-detail.html" className="btn btn-sm btn-secondary">View</a></td>
              </tr>
              <tr>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}><div className="sensor-pulse safe"></div><div><div className="loc-name">Orange River</div><div className="loc-region">Northern Cape</div></div></div></td>
                <td><span className="badge badge-safe">Safe</span></td>
                <td className="mono" style={{ color: 'var(--safe)' }}>8.1</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>1.2</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>8.7</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>9.0</td>
                <td className="mono">19.8</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>8 min ago</td>
                <td><a href="location-detail.html" className="btn btn-sm btn-secondary">View</a></td>
              </tr>
              <tr>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}><div className="sensor-pulse safe"></div><div><div className="loc-name">Umgeni River</div><div className="loc-region">KwaZulu-Natal</div></div></div></td>
                <td><span className="badge badge-safe">Safe</span></td>
                <td className="mono" style={{ color: 'var(--safe)' }}>7.3</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>1.7</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>8.3</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>11.2</td>
                <td className="mono">21.5</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>3 min ago</td>
                <td><a href="location-detail.html" className="btn btn-sm btn-secondary">View</a></td>
              </tr>
              <tr>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}><div className="sensor-pulse safe"></div><div><div className="loc-name">Berg River</div><div className="loc-region">Western Cape</div></div></div></td>
                <td><span className="badge badge-safe">Safe</span></td>
                <td className="mono" style={{ color: 'var(--safe)' }}>7.9</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>0.6</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>10.4</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>4.8</td>
                <td className="mono">15.3</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>7 min ago</td>
                <td><a href="location-detail.html" className="btn btn-sm btn-secondary">View</a></td>
              </tr>
              <tr>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}><div className="sensor-pulse safe"></div><div><div className="loc-name">Breede River</div><div className="loc-region">Western Cape</div></div></div></td>
                <td><span className="badge badge-safe">Safe</span></td>
                <td className="mono" style={{ color: 'var(--safe)' }}>7.5</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>1.1</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>9.8</td>
                <td className="mono" style={{ color: 'var(--safe)' }}>7.1</td>
                <td className="mono">16.9</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>15 min ago</td>
                <td><a href="location-detail.html" className="btn btn-sm btn-secondary">View</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>



      {/*  Mobile bottom nav  */}
    </>
  );
}
