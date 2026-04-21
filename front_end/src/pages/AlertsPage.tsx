export default function AlertsPage() {
  return (
    <>


    {/*  Stats strip  */}
    <div className="card">
      <div className="stat-strip">
        <div className="stat-cell">
          <div className="stat-cell-val" style={{color: 'var(--danger)'}}>1</div>
          <div className="stat-cell-lbl">Critical</div>
        </div>
        <div className="stat-cell">
          <div className="stat-cell-val" style={{color: 'var(--warning)'}}>2</div>
          <div className="stat-cell-lbl">Warning</div>
        </div>
        <div className="stat-cell">
          <div className="stat-cell-val" style={{color: 'var(--text-secondary)'}}>14</div>
          <div className="stat-cell-lbl">This Week</div>
        </div>
      </div>
    </div>

    {/*  Filter bar  */}
    <div className="filter-bar">
      <div className="tabs">
        <button className="tab-btn active" onClick={() => {}}>All</button>
        <button className="tab-btn" onClick={() => {}}>Active</button>
        <button className="tab-btn" onClick={() => {}}>Resolved</button>
      </div>
      <select className="form-control" style={{width: 'auto', padding: '6px 12px', fontSize: '0.8125rem'}}>
        <option>All Locations</option>
        <option>Crocodile River</option>
        <option>Limpopo River</option>
        <option>Olifants River</option>
      </select>
      <select className="form-control" style={{width: 'auto', padding: '6px 12px', fontSize: '0.8125rem'}}>
        <option>All Parameters</option>
        <option>pH</option>
        <option>Turbidity</option>
        <option>Dissolved Oxygen</option>
        <option>Nitrates</option>
      </select>
      <div className="search-box" style={{flex: 1, maxWidth: '280px'}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Search alerts…" />
      </div>
    </div>

    {/*  Main layout  */}
    <div className="alerts-layout">
      {/*  Alert List  */}
      <div className="card" style={{overflow: 'hidden'}}>
        <div className="card-header">
          <div className="card-title">Alert Feed</div>
          <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>3 unread</span>
        </div>

        <div id="alert-list">
          {/*  Critical  */}
          <div className="alert-list-item selected unread" onClick={() => {}}>
            <div className="alert-body-icon alert-icon-danger">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div className="alert-body-meta">
              <div className="alert-body-title">Nitrates exceed safe limit</div>
              <div className="alert-body-desc">Crocodile River — 78.3 mg/L detected (limit 45 mg/L)</div>
              <div className="alert-body-time">2 minutes ago · ALT-2024-0187</div>
            </div>
            <span className="badge badge-danger">Critical</span>
          </div>

          {/*  Warning 1  */}
          <div className="alert-list-item unread" onClick={() => {}}>
            <div className="alert-body-icon alert-icon-warning">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div className="alert-body-meta">
              <div className="alert-body-title">Low dissolved oxygen</div>
              <div className="alert-body-desc">Olifants River — 4.2 mg/L (min 5.0 mg/L)</div>
              <div className="alert-body-time">18 minutes ago · ALT-2024-0186</div>
            </div>
            <span className="badge badge-warning">Warning</span>
          </div>

          {/*  Warning 2  */}
          <div className="alert-list-item unread" onClick={() => {}}>
            <div className="alert-body-icon alert-icon-warning">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div className="alert-body-meta">
              <div className="alert-body-title">High turbidity detected</div>
              <div className="alert-body-desc">Limpopo River — 4.8 NTU (limit 5.0 NTU)</div>
              <div className="alert-body-time">1 hour ago · ALT-2024-0185</div>
            </div>
            <span className="badge badge-warning">Warning</span>
          </div>

          {/*  Resolved  */}
          <div className="alert-list-item" style={{opacity: 0.6}} onClick={() => {}}>
            <div className="alert-body-icon alert-icon-info">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div className="alert-body-meta">
              <div className="alert-body-title">Sensor Vaal-03 came online</div>
              <div className="alert-body-desc">Connection restored after maintenance</div>
              <div className="alert-body-time">1 hour ago · ALT-2024-0184</div>
            </div>
            <span className="badge badge-neutral">Resolved</span>
          </div>

          <div className="alert-list-item" style={{opacity: 0.6}} onClick={() => {}}>
            <div className="alert-body-icon" style={{background: 'rgba(239,83,80,0.12)', color: 'var(--danger)'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div className="alert-body-meta">
              <div className="alert-body-title">Nitrates exceed safe limit</div>
              <div className="alert-body-desc">Crocodile River — 62.1 mg/L</div>
              <div className="alert-body-time">3 days ago · ALT-2024-0181</div>
            </div>
            <span className="badge badge-neutral">Resolved</span>
          </div>

          <div className="alert-list-item" style={{opacity: 0.6}}>
            <div className="alert-body-icon" style={{background: 'rgba(255,167,38,0.12)', color: 'var(--warning)'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div className="alert-body-meta">
              <div className="alert-body-title">pH slightly above range</div>
              <div className="alert-body-desc">Crocodile River — 8.6 pH</div>
              <div className="alert-body-time">2 weeks ago · ALT-2024-0172</div>
            </div>
            <span className="badge badge-neutral">Resolved</span>
          </div>
        </div>
      </div>

      {/*  Detail Panel  */}
      <div className="detail-panel" id="detail-panel">
        <div className="detail-header">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s3)'}}>
            <span className="badge badge-danger" style={{fontSize: '0.75rem'}}>Critical Alert</span>
            <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>ALT-2024-0187</span>
          </div>
          <h2 style={{fontSize: '1rem', fontWeight: 700, marginBottom: '4px'}}>Nitrates exceed safe limit</h2>
          <p style={{fontSize: '0.8125rem', color: 'var(--text-secondary)'}}>Triggered 2 minutes ago — unacknowledged</p>
        </div>
        <div style={{padding: 'var(--s5) var(--s6)'}}>
          <div style={{marginBottom: 'var(--s5)'}}>
            <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--s3)'}}>Measurement</div>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 'var(--s4)'}}>
              <div>
                <div style={{fontSize: '0.6875rem', color: 'var(--text-muted)'}}>Detected</div>
                <div style={{fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--danger)'}}>78.3</div>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>mg/L</div>
              </div>
              <div style={{fontSize: '1.5rem', color: 'var(--text-muted)'}}>vs</div>
              <div>
                <div style={{fontSize: '0.6875rem', color: 'var(--text-muted)'}}>Safe limit</div>
                <div style={{fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: 'var(--text-secondary)'}}>45</div>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>mg/L</div>
              </div>
              <div style={{background: 'var(--danger-bg)', border: '1px solid rgba(239,83,80,0.3)', borderRadius: 'var(--r-lg)', padding: 'var(--s3) var(--s4)', marginLeft: 'auto'}}>
                <div style={{fontSize: '0.6875rem', color: 'var(--text-muted)'}}>Excess</div>
                <div style={{fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--danger)'}}>+74%</div>
              </div>
            </div>
            <div className="meter-bar" style={{marginTop: 'var(--s3)'}}><div className="meter-fill danger" style={{width: '95%'}}></div></div>
          </div>

          <div style={{marginBottom: 'var(--s5)'}}>
            <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--s3)'}}>Details</div>
            <div className="detail-param-row"><span style={{color: 'var(--text-muted)'}}>Location</span><a href="location-detail.html" style={{color: 'var(--accent)'}}>Crocodile River →</a></div>
            <div className="detail-param-row"><span style={{color: 'var(--text-muted)'}}>Parameter</span><span style={{color: 'var(--text-primary)'}}>Nitrates (NO₃⁻)</span></div>
            <div className="detail-param-row"><span style={{color: 'var(--text-muted)'}}>Sensor ID</span><span style={{fontFamily: 'var(--font-mono)', color: 'var(--accent)'}}>ESP32-CRR-004</span></div>
            <div className="detail-param-row"><span style={{color: 'var(--text-muted)'}}>Triggered</span><span style={{color: 'var(--text-primary)'}}>04:20 AM, 20 Apr 2026</span></div>
            <div className="detail-param-row"><span style={{color: 'var(--text-muted)'}}>Duration</span><span style={{color: 'var(--danger)'}}>Active 2 min</span></div>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--s3)'}}>
            <button className="btn btn-primary" style={{width: '100%', justifyContent: 'center'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              Acknowledge Alert
            </button>
            <a href="location-detail.html" className="btn btn-secondary" style={{justifyContent: 'center'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Go to Location
            </a>
            <button className="btn btn-ghost" style={{width: '100%', justifyContent: 'center', color: 'var(--text-muted)'}}>Dismiss</button>
          </div>
        </div>
      </div>
    </div>
  
    </>
  );
}
