export default function SettingsPage() {
  return (
    <>

    <div className="settings-grid">

      {/*  Left nav  */}
      <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--s1)'}}>
        <div className="settings-nav-item active" onClick={() => {}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
          Alert Thresholds
        </div>
        <div className="settings-nav-item" onClick={() => {}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
          Sensor Management
        </div>
        <div className="settings-nav-item" onClick={() => {}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
          Data & Export
        </div>
        <div className="settings-nav-item" onClick={() => {}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          Display
        </div>
      </div>

      {/*  Right panels  */}
      <div id="stab-thresholds">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Alert Thresholds</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 'var(--s3)'}}>
              <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Applied globally to all sensors</span>
              <button className="btn btn-sm btn-secondary">Reset Defaults</button>
            </div>
          </div>
          <div className="card-body">
            <p style={{fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--s5)'}}>Set warning and critical thresholds for each water quality parameter. Critical alerts trigger immediate notifications.</p>
            <div className="threshold-header">
              <div>Parameter</div>
              <div style={{textAlign: 'right'}}>Warning Min</div>
              <div style={{textAlign: 'right'}}>Warning Max</div>
              <div style={{textAlign: 'right'}}>Critical</div>
            </div>
            <div className="threshold-row">
              <div><div style={{fontWeight: 600, fontSize: '0.875rem'}}>pH</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Dimensionless</div></div>
              <input className="form-control thresh-input" value="6.5" />
              <input className="form-control thresh-input" value="8.5" />
              <input className="form-control thresh-input" style={{borderColor: 'rgba(239,83,80,0.4)'}} value="9.0" />
            </div>
            <div className="threshold-row">
              <div><div style={{fontWeight: 600, fontSize: '0.875rem'}}>Turbidity</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>NTU</div></div>
              <input className="form-control thresh-input" value="3.0" />
              <input className="form-control thresh-input" value="5.0" />
              <input className="form-control thresh-input" style={{borderColor: 'rgba(239,83,80,0.4)'}} value="8.0" />
            </div>
            <div className="threshold-row">
              <div><div style={{fontWeight: 600, fontSize: '0.875rem'}}>Dissolved Oxygen</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>mg/L (min)</div></div>
              <input className="form-control thresh-input" value="6.0" />
              <input className="form-control thresh-input" placeholder="—" disabled style={{opacity: 0.4}} />
              <input className="form-control thresh-input" style={{borderColor: 'rgba(239,83,80,0.4)'}} value="4.0" />
            </div>
            <div className="threshold-row">
              <div><div style={{fontWeight: 600, fontSize: '0.875rem'}}>Nitrates</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>mg/L (max)</div></div>
              <input className="form-control thresh-input" value="30.0" />
              <input className="form-control thresh-input" value="45.0" />
              <input className="form-control thresh-input" style={{borderColor: 'rgba(239,83,80,0.4)'}} value="70.0" />
            </div>
            <div className="threshold-row">
              <div><div style={{fontWeight: 600, fontSize: '0.875rem'}}>Temperature</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>°C</div></div>
              <input className="form-control thresh-input" value="15.0" />
              <input className="form-control thresh-input" value="30.0" />
              <input className="form-control thresh-input" style={{borderColor: 'rgba(239,83,80,0.4)'}} value="35.0" />
            </div>
            <div style={{marginTop: 'var(--s6)', display: 'flex', gap: 'var(--s3)'}}>
              <button className="btn btn-primary">Save Thresholds</button>
              <button className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <div id="stab-sensors" style={{display: 'none'}}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Sensor Management</div>
            <button className="btn btn-sm btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Sensor
            </button>
          </div>
          <div className="card-body" style={{display: 'flex', flexDirection: 'column', gap: 'var(--s3)'}}>
            <div className="sensor-manage-row">
              <span className="status-dot dot-danger"></span>
              <div style={{flex: 1}}>
                <div style={{fontWeight: 600, fontSize: '0.875rem'}}>ESP32-CRR-004 · Crocodile River</div>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Limpopo Province · -24.18°, 31.5° · Battery 23%</div>
              </div>
              <select className="form-control" style={{width: 'auto', padding: '4px 10px', fontSize: '0.8125rem'}}><option>15 min</option><option>5 min</option><option>1 hour</option></select>
              <button className="btn btn-sm btn-ghost">Edit</button>
              <button className="btn btn-sm btn-danger">Remove</button>
            </div>
            <div className="sensor-manage-row">
              <span className="status-dot dot-warning"></span>
              <div style={{flex: 1}}>
                <div style={{fontWeight: 600, fontSize: '0.875rem'}}>ESP32-LIM-001 · Limpopo River</div>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Limpopo Province · -22.2°, 29.8° · Battery 81%</div>
              </div>
              <select className="form-control" style={{width: 'auto', padding: '4px 10px', fontSize: '0.8125rem'}}><option>15 min</option><option>5 min</option><option>1 hour</option></select>
              <button className="btn btn-sm btn-ghost">Edit</button>
              <button className="btn btn-sm btn-danger">Remove</button>
            </div>
            <div className="sensor-manage-row">
              <span className="status-dot dot-safe"></span>
              <div style={{flex: 1}}>
                <div style={{fontWeight: 600, fontSize: '0.875rem'}}>ESP32-VAL-002 · Vaal Dam</div>
                <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Gauteng · -26.9°, 28.1° · Battery 94%</div>
              </div>
              <select className="form-control" style={{width: 'auto', padding: '4px 10px', fontSize: '0.8125rem'}}><option>15 min</option><option>5 min</option><option>1 hour</option></select>
              <button className="btn btn-sm btn-ghost">Edit</button>
              <button className="btn btn-sm btn-danger">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <div id="stab-data" style={{display: 'none'}}>
        <div className="card">
          <div className="card-header"><div className="card-title">Data & Export Settings</div></div>
          <div className="card-body" style={{display: 'flex', flexDirection: 'column', gap: 'var(--s6)'}}>
            <div>
              <h3 style={{fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--s4)'}}>Automatic Exports</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--s4)'}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}><div><div style={{fontWeight: 500, fontSize: '0.875rem'}}>Daily CSV export</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Export all readings to email at midnight</div></div><div className="toggle" onClick={() => {}}></div></div>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}><div><div style={{fontWeight: 500, fontSize: '0.875rem'}}>Weekly PDF report</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Summary report every Monday 8 AM</div></div><div className="toggle on" onClick={() => {}}></div></div>
              </div>
            </div>
            <hr className="divider" />
            <div>
              <h3 style={{fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--s4)'}}>Data Retention</h3>
              <div className="form-group" style={{maxWidth: '300px'}}>
                <label className="form-label">Keep readings for</label>
                <select className="form-control"><option>6 months</option><option>1 year</option><option>2 years</option><option>Forever</option></select>
              </div>
            </div>
            <div><button className="btn btn-primary">Save</button></div>
          </div>
        </div>
      </div>

      <div id="stab-display" style={{display: 'none'}}>
        <div className="card">
          <div className="card-header"><div className="card-title">Display Preferences</div></div>
          <div className="card-body" style={{display: 'flex', flexDirection: 'column', gap: 'var(--s5)'}}>
            <div className="form-group"><label className="form-label">Theme</label><select className="form-control" style={{maxWidth: '200px'}}><option>Dark (default)</option><option>Light</option><option>System</option></select></div>
            <div className="form-group"><label className="form-label">Unit System</label><select className="form-control" style={{maxWidth: '200px'}}><option>Metric (mg/L, NTU, °C)</option><option>Imperial (mg/L, NTU, °F)</option></select></div>
            <div className="form-group"><label className="form-label">Default Map View</label><select className="form-control" style={{maxWidth: '200px'}}><option>Dark (CartoDB)</option><option>Satellite</option><option>Terrain</option></select></div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '400px'}}><div><div style={{fontWeight: 500, fontSize: '0.875rem'}}>Show sensor pulse animations</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Animated status dots on map</div></div><div className="toggle on" onClick={() => {}}></div></div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '400px'}}><div><div style={{fontWeight: 500, fontSize: '0.875rem'}}>Auto-refresh dashboard</div><div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Update readings every 60 seconds</div></div><div className="toggle on" onClick={() => {}}></div></div>
            <div><button className="btn btn-primary">Save Preferences</button></div>
          </div>
        </div>
      </div>

    </div>
  
    </>
  );
}
