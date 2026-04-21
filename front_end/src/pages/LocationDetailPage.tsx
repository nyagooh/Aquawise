export default function LocationDetailPage() {
  return (
    <>


    {/*  Location Header  */}
    <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--s4)'}}>
      <div style={{display: 'flex', alignItems: 'flex-start', gap: 'var(--s4)'}}>
        <div style={{width: '52px', height: '52px', borderRadius: 'var(--r-xl)', background: 'var(--danger-bg)', border: '1px solid rgba(239,83,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div>
          <h1 style={{fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '4px'}}>Crocodile River</h1>
          <div style={{display: 'flex', alignItems: 'center', gap: 'var(--s3)', flexWrap: 'wrap'}}>
            <span style={{fontSize: '0.8125rem', color: 'var(--text-muted)'}}>📍 Limpopo Province, South Africa</span>
            <span className="badge badge-danger"><span className="status-dot dot-danger"></span>Critical</span>
            <span style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)'}}>-24.1800°, 31.5000°</span>
          </div>
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--s1)'}}>
        <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Sensor ID</div>
        <div style={{fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--accent)'}}>ESP32-CRR-004</div>
        <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Updated 2 min ago</div>
      </div>
    </div>

    {/*  Parameter Cards  */}
    <div className="param-grid">
      <div className="param-card safe">
        <div className="param-name">pH</div>
        <div className="param-value safe">7.1 <span className="param-unit">pH</span></div>
        <div className="meter-bar" style={{margin: '8px 0'}}><div className="meter-fill safe" style={{width: '71%'}}></div></div>
        <div className="param-range">Safe: 6.5 – 8.5</div>
      </div>
      <div className="param-card safe">
        <div className="param-name">Turbidity</div>
        <div className="param-value safe">2.1 <span className="param-unit">NTU</span></div>
        <div className="meter-bar" style={{margin: '8px 0'}}><div className="meter-fill safe" style={{width: '42%'}}></div></div>
        <div className="param-range">Limit: &lt; 5 NTU</div>
      </div>
      <div className="param-card safe">
        <div className="param-name">Dissolved Oxygen</div>
        <div className="param-value safe">6.8 <span className="param-unit">mg/L</span></div>
        <div className="meter-bar" style={{margin: '8px 0'}}><div className="meter-fill safe" style={{width: '68%'}}></div></div>
        <div className="param-range">Min: 5.0 mg/L</div>
      </div>
      <div className="param-card danger">
        <div className="param-name">Nitrates</div>
        <div className="param-value danger">78.3 <span className="param-unit">mg/L</span></div>
        <div className="meter-bar" style={{margin: '8px 0'}}><div className="meter-fill danger" style={{width: '95%'}}></div></div>
        <div className="param-range" style={{color: 'var(--danger)'}}>⚠ Exceeds 45 mg/L limit</div>
      </div>
      <div className="param-card safe">
        <div className="param-name">Temperature</div>
        <div className="param-value safe">22.4 <span className="param-unit">°C</span></div>
        <div className="meter-bar" style={{margin: '8px 0'}}><div className="meter-fill safe" style={{width: '56%'}}></div></div>
        <div className="param-range">Normal: 15–30°C</div>
      </div>
    </div>

    {/*  Charts + Sidebar  */}
    <div className="layout-3col">
      {/*  Charts  */}
      <div className="card" style={{gridColumn: '1/3'}}>
        <div className="card-header">
          <div className="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
            Parameter Trends
          </div>
          <div className="card-actions">
            <div className="chart-tabs">
              <button className="chart-tab active" onClick={() => {}}>Nitrates</button>
              <button className="chart-tab" onClick={() => {}}>pH</button>
              <button className="chart-tab" onClick={() => {}}>DO</button>
              <button className="chart-tab" onClick={() => {}}>Turbidity</button>
            </div>
            <select className="form-control" style={{width: 'auto', padding: '4px 10px', fontSize: '0.75rem'}}>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          <canvas id="param-chart" height="200"></canvas>
        </div>
      </div>

      {/*  Info + Mini Map (right column)  */}
      <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--s4)'}}>
        {/*  Location info  */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Location Info</div>
          </div>
          <div className="card-body" style={{padding: 'var(--s4) var(--s5)'}}>
            <div className="info-row">
              <span className="info-label">River System</span>
              <span className="info-val">Crocodile (Limpopo)</span>
            </div>
            <div className="info-row">
              <span className="info-label">Province</span>
              <span className="info-val">Limpopo</span>
            </div>
            <div className="info-row">
              <span className="info-label">Installed</span>
              <span className="info-val">12 Jan 2024</span>
            </div>
            <div className="info-row">
              <span className="info-label">Sensor Model</span>
              <span className="info-val">ESP32-WROOM-32</span>
            </div>
            <div className="info-row">
              <span className="info-label">Update Rate</span>
              <span className="info-val">Every 15 min</span>
            </div>
            <div className="info-row">
              <span className="info-label">Battery</span>
              <span className="info-val" style={{color: 'var(--warning)'}}>⚠ 23%</span>
            </div>
          </div>
        </div>
        {/*  Mini Map  */}
        <div className="card" style={{overflow: 'hidden'}}>
          <div className="card-header">
            <div className="card-title">Map</div>
            <button className="btn btn-sm btn-ghost">Fullscreen</button>
          </div>
          <div id="mini-map"></div>
        </div>
      </div>
    </div>

    {/*  Alert History  */}
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          Alert History (This Location)
        </div>
        <div className="card-actions">
          <div className="tabs">
            <button className="tab-btn active">All</button>
            <button className="tab-btn">Active</button>
            <button className="tab-btn">Resolved</button>
          </div>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Parameter</th><th>Value</th><th>Threshold</th><th>Severity</th><th>Triggered</th><th>Resolved</th><th>Action</th></tr></thead>
          <tbody>
            <tr>
              <td>Nitrates</td>
              <td className="mono" style={{color: 'var(--danger)'}}>78.3 mg/L</td>
              <td className="mono">45 mg/L</td>
              <td><span className="badge badge-danger">Critical</span></td>
              <td style={{color: 'var(--text-muted)'}}>2 min ago</td>
              <td style={{color: 'var(--text-muted)'}}>—</td>
              <td><button className="btn btn-sm btn-warning">Acknowledge</button></td>
            </tr>
            <tr>
              <td>Nitrates</td>
              <td className="mono" style={{color: 'var(--danger)'}}>62.1 mg/L</td>
              <td className="mono">45 mg/L</td>
              <td><span className="badge badge-danger">Critical</span></td>
              <td style={{color: 'var(--text-muted)'}}>3 days ago</td>
              <td style={{color: 'var(--safe)'}}>3 days ago</td>
              <td><button className="btn btn-sm btn-ghost">Details</button></td>
            </tr>
            <tr>
              <td>Turbidity</td>
              <td className="mono" style={{color: 'var(--warning)'}}>5.4 NTU</td>
              <td className="mono">5 NTU</td>
              <td><span className="badge badge-warning">Warning</span></td>
              <td style={{color: 'var(--text-muted)'}}>1 week ago</td>
              <td style={{color: 'var(--safe)'}}>1 week ago</td>
              <td><button className="btn btn-sm btn-ghost">Details</button></td>
            </tr>
            <tr>
              <td>pH</td>
              <td className="mono" style={{color: 'var(--warning)'}}>8.6 pH</td>
              <td className="mono">8.5 pH</td>
              <td><span className="badge badge-warning">Warning</span></td>
              <td style={{color: 'var(--text-muted)'}}>2 weeks ago</td>
              <td style={{color: 'var(--safe)'}}>2 weeks ago</td>
              <td><button className="btn btn-sm btn-ghost">Details</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  
    </>
  );
}
