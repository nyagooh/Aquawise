export default function SitemapPage() {
  return (<>


<div className="back-nav">
  <h1>🗺 AquaWatch — Site Architecture</h1>
  <p className="subtitle">Complete information architecture, page hierarchy, and navigation flows</p>
  <div className="nav-links">
    <a href="index.html">← Design Index</a>
    <a href="style-guide.html">Style Guide</a>
    <a href="dashboard.html">Dashboard</a>
    <a href="location-detail.html">Location Detail</a>
    <a href="alerts.html">Alerts</a>
    <a href="historical.html">Historical Data</a>
    <a href="predictive.html">Predictive Analytics</a>
    <a href="statistics.html">Statistics</a>
    <a href="account.html">Account</a>
    <a href="settings.html">Settings</a>
  </div>
</div>

{/*  ── Visual Hierarchy Diagram ──  */}
<div className="diagram-section">
  <h2 className="diagram-title">Page Hierarchy Diagram</h2>
  <div className="diagram">
    <div className="d-root">
      {/*  Root  */}
      <div className="d-node root">
        <div className="d-node-icon">💧</div>
        <div className="d-node-label">AquaWatch</div>
        <div className="d-node-sub">Water Quality Monitoring Platform</div>
      </div>
      <div className="d-connector"></div>

      {/*  Auth branch  */}
      <div className="d-row" style={{marginBottom: 0}}>
        <div className="d-child-group">
          <div className="d-node" style={{borderColor: 'var(--accent-purple)', minWidth: '120px'}}>
            <div className="d-node-icon">🔐</div>
            <div className="d-node-label">Auth</div>
            <div className="d-node-sub">/login · /register</div>
          </div>
        </div>
      </div>
      <div className="d-connector"></div>

      {/*  Level 1 pages  */}
      <div className="d-row">
        <div className="d-child-group">
          <div className="d-node" style={{borderTop: '3px solid var(--accent)'}}>
            <div className="d-node-icon">🏠</div>
            <div className="d-node-label">Dashboard</div>
            <div className="d-node-sub">/dashboard</div>
          </div>
          <div className="d-child-v"></div>
          <div className="d-child-sub">
            <div className="d-subnode">Map overview</div>
            <div className="d-subnode">KPI summary cards</div>
            <div className="d-subnode">Live alert feed</div>
            <div className="d-subnode">Recent readings</div>
          </div>
        </div>

        <div className="d-child-group">
          <div className="d-node" style={{borderTop: '3px solid var(--accent-blue)'}}>
            <div className="d-node-icon">📍</div>
            <div className="d-node-label">Locations</div>
            <div className="d-node-sub">/locations</div>
          </div>
          <div className="d-child-v"></div>
          <div className="d-child-sub">
            <div className="d-subnode">Location list</div>
            <div className="d-subnode">Detail: /locations/:id</div>
            <div className="d-subnode">  ↳ Live readings</div>
            <div className="d-subnode">  ↳ Historical charts</div>
            <div className="d-subnode">  ↳ Location map</div>
            <div className="d-subnode">  ↳ Alert history</div>
          </div>
        </div>

        <div className="d-child-group">
          <div className="d-node" style={{borderTop: '3px solid var(--danger)'}}>
            <div className="d-node-icon">🔔</div>
            <div className="d-node-label">Alerts</div>
            <div className="d-node-sub">/alerts</div>
          </div>
          <div className="d-child-v"></div>
          <div className="d-child-sub">
            <div className="d-subnode">Active alerts</div>
            <div className="d-subnode">Alert history</div>
            <div className="d-subnode">Filter by severity</div>
            <div className="d-subnode">Alert detail panel</div>
          </div>
        </div>

        <div className="d-child-group">
          <div className="d-node" style={{borderTop: '3px solid var(--warning)'}}>
            <div className="d-node-icon">📤</div>
            <div className="d-node-label">Historical Data</div>
            <div className="d-node-sub">/historical</div>
          </div>
          <div className="d-child-v"></div>
          <div className="d-child-sub">
            <div className="d-subnode">Upload CSV / Excel</div>
            <div className="d-subnode">Data validation</div>
            <div className="d-subnode">Upload history</div>
            <div className="d-subnode">Browse datasets</div>
          </div>
        </div>

        <div className="d-child-group">
          <div className="d-node" style={{borderTop: '3px solid var(--accent-purple)'}}>
            <div className="d-node-icon">🤖</div>
            <div className="d-node-label">Predictive Analytics</div>
            <div className="d-node-sub">/predictive</div>
          </div>
          <div className="d-child-v"></div>
          <div className="d-child-sub">
            <div className="d-subnode">Forecast charts</div>
            <div className="d-subnode">Risk heatmap</div>
            <div className="d-subnode">Feature importance</div>
            <div className="d-subnode">Model selector</div>
          </div>
        </div>

        <div className="d-child-group">
          <div className="d-node" style={{borderTop: '3px solid var(--safe)'}}>
            <div className="d-node-icon">📊</div>
            <div className="d-node-label">Statistics</div>
            <div className="d-node-sub">/statistics</div>
          </div>
          <div className="d-child-v"></div>
          <div className="d-child-sub">
            <div className="d-subnode">Aggregate metrics</div>
            <div className="d-subnode">Date range filter</div>
            <div className="d-subnode">Distribution charts</div>
            <div className="d-subnode">Export reports</div>
          </div>
        </div>
      </div>

      <div className="d-connector"></div>

      {/*  Account tier  */}
      <div className="d-row">
        <div className="d-child-group">
          <div className="d-node" style={{minWidth: '120px'}}>
            <div className="d-node-icon">👤</div>
            <div className="d-node-label">Account</div>
            <div className="d-node-sub">/account</div>
          </div>
          <div className="d-child-v"></div>
          <div className="d-child-sub">
            <div className="d-subnode">Profile info</div>
            <div className="d-subnode">Sensor assignments</div>
            <div className="d-subnode">Notification prefs</div>
            <div className="d-subnode">API keys</div>
          </div>
        </div>
        <div className="d-child-group">
          <div className="d-node" style={{minWidth: '120px'}}>
            <div className="d-node-icon">⚙️</div>
            <div className="d-node-label">Settings</div>
            <div className="d-node-sub">/settings</div>
          </div>
          <div className="d-child-v"></div>
          <div className="d-child-sub">
            <div className="d-subnode">Alert thresholds</div>
            <div className="d-subnode">Sensor management</div>
            <div className="d-subnode">Data export config</div>
            <div className="d-subnode">Display preferences</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{/*  ── Page Cards ──  */}
<h2 className="diagram-title">All Pages — Detailed Inventory</h2>
<div className="sitemap-grid">

  <div className="sm-section">
    <div className="sm-section-header">
      <div className="sm-section-num">1</div>
      <div>
        <div className="sm-section-title">Core Monitoring</div>
        <div className="sm-section-desc">Primary pages users access daily</div>
      </div>
    </div>
    <div className="sm-pages">
      <a href="dashboard.html" className="sm-page-card" style={{textDecoration: 'none'}}>
        <div className="sm-page-icon">🏠</div>
        <div className="sm-page-name">Home Dashboard</div>
        <div className="sm-page-url">/dashboard</div>
        <div className="sm-page-desc">Overview map, KPIs, live alert feed, recent sensor readings across all locations.</div>
        <div className="sm-sub-pages">
          <div className="sm-sub-item">Interactive sensor map</div>
          <div className="sm-sub-item">4 KPI summary cards</div>
          <div className="sm-sub-item">Active alerts feed</div>
          <div className="sm-sub-item">Readings table</div>
        </div>
      </a>
      <a href="location-detail.html" className="sm-page-card" style={{textDecoration: 'none'}}>
        <div className="sm-page-icon">📍</div>
        <div className="sm-page-name">Location Detail</div>
        <div className="sm-page-url">/locations/:id</div>
        <div className="sm-page-desc">Full parameter breakdown, time-series charts, mini map, and alert history for a single sensor.</div>
        <div className="sm-sub-pages">
          <div className="sm-sub-item">5 parameter cards</div>
          <div className="sm-sub-item">Line charts per parameter</div>
          <div className="sm-sub-item">Location map pin</div>
          <div className="sm-sub-item">Alert history table</div>
        </div>
      </a>
      <a href="alerts.html" className="sm-page-card" style={{textDecoration: 'none'}}>
        <div className="sm-page-icon">🔔</div>
        <div className="sm-page-name">Alerts</div>
        <div className="sm-page-url">/alerts</div>
        <div className="sm-page-desc">Centralized alert management with filters, severity triage, acknowledgment, and detail panel.</div>
        <div className="sm-sub-pages">
          <div className="sm-sub-item">Filter tabs (All/Active/Resolved)</div>
          <div className="sm-sub-item">Severity badge sorting</div>
          <div className="sm-sub-item">Detail side panel</div>
          <div className="sm-sub-item">Acknowledge action</div>
        </div>
      </a>
    </div>
  </div>

  <div className="sm-section">
    <div className="sm-section-header">
      <div className="sm-section-num">2</div>
      <div>
        <div className="sm-section-title">Data & Analysis</div>
        <div className="sm-section-desc">Data management, historical uploads, and ML-powered insights</div>
      </div>
    </div>
    <div className="sm-pages">
      <a href="historical.html" className="sm-page-card" style={{textDecoration: 'none'}}>
        <div className="sm-page-icon">📤</div>
        <div className="sm-page-name">Historical Data Upload</div>
        <div className="sm-page-url">/historical</div>
        <div className="sm-page-desc">Drag-and-drop CSV/Excel uploader with validation, preview, and dataset browsing.</div>
        <div className="sm-sub-pages">
          <div className="sm-sub-item">Drag & drop zone</div>
          <div className="sm-sub-item">Data validation preview</div>
          <div className="sm-sub-item">Upload history list</div>
          <div className="sm-sub-item">Dataset browser</div>
        </div>
      </a>
      <a href="predictive.html" className="sm-page-card" style={{textDecoration: 'none'}}>
        <div className="sm-page-icon">🤖</div>
        <div className="sm-page-name">Predictive Analytics</div>
        <div className="sm-page-url">/predictive</div>
        <div className="sm-page-desc">ML model forecasts, risk heatmap, confidence intervals, and feature importance visualization.</div>
        <div className="sm-sub-pages">
          <div className="sm-sub-item">Forecast horizon selector</div>
          <div className="sm-sub-item">Parameter forecasts</div>
          <div className="sm-sub-item">Risk heatmap grid</div>
          <div className="sm-sub-item">Feature importance bars</div>
        </div>
      </a>
      <a href="statistics.html" className="sm-page-card" style={{textDecoration: 'none'}}>
        <div className="sm-page-icon">📊</div>
        <div className="sm-page-name">Summary Statistics</div>
        <div className="sm-page-url">/statistics</div>
        <div className="sm-page-desc">Aggregate metrics with date range filtering, distribution histograms, cross-location comparisons, and CSV export.</div>
        <div className="sm-sub-pages">
          <div className="sm-sub-item">Date range picker</div>
          <div className="sm-sub-item">Aggregate stat cards</div>
          <div className="sm-sub-item">Distribution histograms</div>
          <div className="sm-sub-item">Export to CSV/PDF</div>
        </div>
      </a>
    </div>
  </div>

  <div className="sm-section">
    <div className="sm-section-header">
      <div className="sm-section-num">3</div>
      <div>
        <div className="sm-section-title">Account & Settings</div>
        <div className="sm-section-desc">User management, preferences, and system configuration</div>
      </div>
    </div>
    <div className="sm-pages">
      <a href="account.html" className="sm-page-card" style={{textDecoration: 'none'}}>
        <div className="sm-page-icon">👤</div>
        <div className="sm-page-name">User Account</div>
        <div className="sm-page-url">/account</div>
        <div className="sm-page-desc">Profile management, sensor assignments, notification preferences, and API key access.</div>
        <div className="sm-sub-pages">
          <div className="sm-sub-item">Profile editor</div>
          <div className="sm-sub-item">Assigned sensors</div>
          <div className="sm-sub-item">Notification config</div>
          <div className="sm-sub-item">API credentials</div>
        </div>
      </a>
      <a href="settings.html" className="sm-page-card" style={{textDecoration: 'none'}}>
        <div className="sm-page-icon">⚙️</div>
        <div className="sm-page-name">Settings</div>
        <div className="sm-page-url">/settings</div>
        <div className="sm-page-desc">Alert threshold configuration, sensor management, data export settings, and display preferences.</div>
        <div className="sm-sub-pages">
          <div className="sm-sub-item">Alert thresholds per parameter</div>
          <div className="sm-sub-item">Sensor add/remove</div>
          <div className="sm-sub-item">Export schedule</div>
          <div className="sm-sub-item">Theme & units</div>
        </div>
      </a>
    </div>
  </div>

</div>

{/*  Navigation flow note  */}
<div style={{marginTop: 'var(--s12)', padding: 'var(--s6)', background: 'var(--bg-card)', borderRadius: 'var(--r-xl)', border: '1px solid var(--border-subtle)'}}>
  <h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--s4)'}}>Key Navigation Flows</h3>
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 'var(--s4)'}}>
    <div style={{padding: 'var(--s4)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)'}}>
      <div style={{fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)', marginBottom: 'var(--s2)'}}>🔍 Monitor Flow</div>
      <div style={{fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.8}}>
        Dashboard → Map click → Location Detail → Alert history → Alerts page
      </div>
    </div>
    <div style={{padding: 'var(--s4)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)'}}>
      <div style={{fontSize: '0.8125rem', fontWeight: 600, color: 'var(--warning)', marginBottom: 'var(--s2)'}}>🚨 Triage Flow</div>
      <div style={{fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.8}}>
        Notification → Alerts page → Detail panel → Location Detail → Acknowledge
      </div>
    </div>
    <div style={{padding: 'var(--s4)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)'}}>
      <div style={{fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-purple)', marginBottom: 'var(--s2)'}}>📈 Analysis Flow</div>
      <div style={{fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.8}}>
        Historical Upload → Validate data → Statistics → Predictive Analytics → Export
      </div>
    </div>
    <div style={{padding: 'var(--s4)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)'}}>
      <div style={{fontSize: '0.8125rem', fontWeight: 600, color: 'var(--safe)', marginBottom: 'var(--s2)'}}>⚙️ Config Flow</div>
      <div style={{fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.8}}>
        Settings → Add sensor → Set thresholds → Account → Notifications → Save
      </div>
    </div>
  </div>
</div>


  </>);
}
