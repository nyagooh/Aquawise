export default function StatisticsPage() {
  return (
    <>


    {/*  Date filter  */}
    <div className="card">
      <div className="card-body" style={{display: 'flex', alignItems: 'center', gap: 'var(--s4)', flexWrap: 'wrap'}}>
        <div style={{fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)'}}>Period:</div>
        <div style={{display: 'flex', gap: 'var(--s2)'}}>
          <button className="range-btn">7d</button>
          <button className="range-btn">30d</button>
          <button className="range-btn active">90d</button>
          <button className="range-btn">1yr</button>
          <button className="range-btn">All</button>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 'var(--s2)', marginLeft: 'auto'}}>
          <input type="date" className="form-control" style={{width: 'auto', padding: '6px 12px', fontSize: '0.8125rem'}} value="2024-01-20" />
          <span style={{color: 'var(--text-muted)'}}>→</span>
          <input type="date" className="form-control" style={{width: 'auto', padding: '6px 12px', fontSize: '0.8125rem'}} value="2024-04-20" />
        </div>
        <select className="form-control" style={{width: 'auto', padding: '6px 12px', fontSize: '0.8125rem'}}>
          <option>All Locations</option><option>Limpopo Province</option><option>Western Cape</option>
        </select>
      </div>
    </div>

    {/*  KPIs  */}
    <div className="kpi-grid">
      <div className="kpi-card kpi-accent"><div className="kpi-header"><div><div className="kpi-label">Total Readings</div><div className="kpi-value accent">12,847</div><div className="kpi-sub">last 90 days</div></div></div></div>
      <div className="kpi-card kpi-safe"><div className="kpi-header"><div><div className="kpi-label">Safety Rate</div><div className="kpi-value safe">87.4%</div><div className="kpi-sub">readings within limits</div></div></div></div>
      <div className="kpi-card kpi-warn"><div className="kpi-header"><div><div className="kpi-label">Alerts Generated</div><div className="kpi-value warn">47</div><div className="kpi-sub">this period</div></div></div></div>
      <div className="kpi-card kpi-danger"><div className="kpi-header"><div><div className="kpi-label">Critical Events</div><div className="kpi-value danger">8</div><div className="kpi-sub">exceeded thresholds</div></div></div></div>
    </div>

    {/*  Charts  */}
    <div className="stats-grid">
      <div className="card">
        <div className="card-header"><div className="card-title">pH Distribution</div><span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>All locations · 90 days</span></div>
        <div className="card-body"><canvas id="hist-ph" height="200"></canvas></div>
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Nitrates by Location</div><span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Mean values</span></div>
        <div className="card-body"><canvas id="bar-nitrates" height="200"></canvas></div>
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Safety Compliance Over Time</div></div>
        <div className="card-body"><canvas id="safety-line" height="160"></canvas></div>
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Parameter Correlation</div><span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Scatter: Turbidity vs Nitrates</span></div>
        <div className="card-body"><canvas id="scatter" height="160"></canvas></div>
      </div>
    </div>

    {/*  Summary table  */}
    <div className="card">
      <div className="card-header">
        <div className="card-title">Parameter Summary Table</div>
        <div className="card-actions">
          <button className="btn btn-sm btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="stat-table">
          <thead><tr><th>Parameter</th><th>Unit</th><th>Min</th><th>Max</th><th>Mean</th><th>Std Dev</th><th>Threshold</th><th>Exceedances</th><th>Compliance</th></tr></thead>
          <tbody>
            <tr><td>pH</td><td style={{color: 'var(--text-muted)'}}>—</td><td>6.2</td><td>9.1</td><td>7.5</td><td>0.42</td><td>6.5–8.5</td><td style={{color: 'var(--warning)'}}>89</td><td><span className="badge badge-safe">93.1%</span></td></tr>
            <tr><td>Turbidity</td><td style={{color: 'var(--text-muted)'}}>NTU</td><td>0.2</td><td>8.7</td><td>1.9</td><td>1.21</td><td>&lt; 5</td><td style={{color: 'var(--warning)'}}>142</td><td><span className="badge badge-safe">88.9%</span></td></tr>
            <tr><td>Dissolved Oxygen</td><td style={{color: 'var(--text-muted)'}}>mg/L</td><td>3.1</td><td>12.4</td><td>7.8</td><td>1.54</td><td>≥ 5.0</td><td style={{color: 'var(--warning)'}}>201</td><td><span className="badge badge-warning">84.4%</span></td></tr>
            <tr><td>Nitrates</td><td style={{color: 'var(--text-muted)'}}>mg/L</td><td>2.1</td><td>81.4</td><td>18.3</td><td>14.7</td><td>&lt; 45</td><td style={{color: 'var(--danger)'}}>387</td><td><span className="badge badge-danger">69.9%</span></td></tr>
            <tr><td>Temperature</td><td style={{color: 'var(--text-muted)'}}>°C</td><td>11.2</td><td>31.8</td><td>21.4</td><td>4.3</td><td>15–30</td><td style={{color: 'var(--warning)'}}>95</td><td><span className="badge badge-safe">92.6%</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  
    </>
  );
}
