export default function StyleGuidePage() {
  return (<>


<div className="back-nav">
  <h1>🎨 AquaWatch Design System</h1>
  <p className="page-subtitle">Comprehensive style guide — colors, typography, components, and patterns</p>
  <div className="nav-links">
    <a href="index.html">← Design Index</a>
    <a href="sitemap.html">Sitemap</a>
    <a href="dashboard.html">Dashboard Mockup →</a>
  </div>
</div>

{/*  ── Brand ──  */}
<div className="sg-section">
  <div className="sg-section-title">Brand</div>
  <p className="sg-section-desc">AquaWatch is a professional environmental monitoring platform. The visual identity communicates reliability, clarity, and scientific precision — using deep navy as the foundation and teal as an energizing water-themed accent.</p>
  <div style={{display: 'flex', alignItems: 'center', gap: 'var(--s6)', flexWrap: 'wrap', padding: 'var(--s8)', background: 'var(--bg-surface)', borderRadius: 'var(--r-2xl)', border: '1px solid var(--border-subtle)'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 'var(--s3)'}}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <path d="M20 4 C20 4 8 16 8 24 A12 12 0 0 0 32 24 C32 16 20 4 20 4Z" fill="#00D4C8"/>
        <path d="M20 12 C20 12 13 20 13 25 A7 7 0 0 0 27 25 C27 20 20 12 20 12Z" fill="rgba(7,23,40,0.4)"/>
      </svg>
      <div>
        <div style={{fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em'}}>Aqua<span style={{color: 'var(--accent)'}}>Watch</span></div>
        <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Water Quality Monitoring</div>
      </div>
    </div>
    <div style={{width: '1px', height: '48px', background: 'var(--border-subtle)'}}></div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--s2)'}}>
      <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em'}}>Tagline</div>
      <div style={{fontSize: '1rem', fontStyle: 'italic', color: 'var(--text-secondary)'}}>"Monitor. Predict. Protect."</div>
    </div>
  </div>
</div>

{/*  ── Colors ──  */}
<div className="sg-section">
  <div className="sg-section-title">Color System</div>
  <p className="sg-section-desc">Semantic color tokens. Always use tokens, never hardcode hex values in components.</p>

  <p style={{fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--s4)'}}>Background Scale</p>
  <div className="swatch-grid" style={{marginBottom: 'var(--s8)'}}>
    <div className="swatch">
      <div className="swatch-block" style={{background: '#071728'}}></div>
      <div className="swatch-info"><div className="swatch-name">Base</div><div className="swatch-hex">#071728</div><div className="swatch-token">--bg-base</div></div>
    </div>
    <div className="swatch">
      <div className="swatch-block" style={{background: '#0B1F35'}}></div>
      <div className="swatch-info"><div className="swatch-name">Surface</div><div className="swatch-hex">#0B1F35</div><div className="swatch-token">--bg-surface</div></div>
    </div>
    <div className="swatch">
      <div className="swatch-block" style={{background: '#112844'}}></div>
      <div className="swatch-info"><div className="swatch-name">Card</div><div className="swatch-hex">#112844</div><div className="swatch-token">--bg-card</div></div>
    </div>
    <div className="swatch">
      <div className="swatch-block" style={{background: '#1A3A5C'}}></div>
      <div className="swatch-info"><div className="swatch-name">Elevated</div><div className="swatch-hex">#1A3A5C</div><div className="swatch-token">--bg-elevated</div></div>
    </div>
  </div>

  <p style={{fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--s4)'}}>Accent & Brand</p>
  <div className="swatch-grid" style={{marginBottom: 'var(--s8)'}}>
    <div className="swatch">
      <div className="swatch-block" style={{background: '#00D4C8', boxShadow: '0 0 20px rgba(0,212,200,0.4)'}}></div>
      <div className="swatch-info"><div className="swatch-name">Teal Primary</div><div className="swatch-hex">#00D4C8</div><div className="swatch-token">--accent</div></div>
    </div>
    <div className="swatch">
      <div className="swatch-block" style={{background: '#00A89E'}}></div>
      <div className="swatch-info"><div className="swatch-name">Teal Dim</div><div className="swatch-hex">#00A89E</div><div className="swatch-token">--accent-dim</div></div>
    </div>
    <div className="swatch">
      <div className="swatch-block" style={{background: '#4FC3F7'}}></div>
      <div className="swatch-info"><div className="swatch-name">Sky Blue</div><div className="swatch-hex">#4FC3F7</div><div className="swatch-token">--accent-blue</div></div>
    </div>
    <div className="swatch">
      <div className="swatch-block" style={{background: '#9C89E2'}}></div>
      <div className="swatch-info"><div className="swatch-name">Violet</div><div className="swatch-hex">#9C89E2</div><div className="swatch-token">--accent-purple</div></div>
    </div>
  </div>

  <p style={{fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--s4)'}}>Semantic Status Colors</p>
  <div className="swatch-grid" style={{marginBottom: 'var(--s8)'}}>
    <div className="swatch">
      <div className="swatch-block" style={{background: '#4CAF50', boxShadow: '0 0 16px rgba(76,175,80,0.3)'}}></div>
      <div className="swatch-info"><div className="swatch-name">Safe</div><div className="swatch-hex">#4CAF50</div><div className="swatch-token">--safe</div></div>
    </div>
    <div className="swatch">
      <div className="swatch-block" style={{background: '#FFA726', boxShadow: '0 0 16px rgba(255,167,38,0.3)'}}></div>
      <div className="swatch-info"><div className="swatch-name">Warning</div><div className="swatch-hex">#FFA726</div><div className="swatch-token">--warning</div></div>
    </div>
    <div className="swatch">
      <div className="swatch-block" style={{background: '#EF5350', boxShadow: '0 0 16px rgba(239,83,80,0.3)'}}></div>
      <div className="swatch-info"><div className="swatch-name">Danger</div><div className="swatch-hex">#EF5350</div><div className="swatch-token">--danger</div></div>
    </div>
    <div className="swatch">
      <div className="swatch-block" style={{background: '#42A5F5'}}></div>
      <div className="swatch-info"><div className="swatch-name">Info</div><div className="swatch-hex">#42A5F5</div><div className="swatch-token">--info</div></div>
    </div>
  </div>

  <p style={{fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--s4)'}}>Text Scale</p>
  <div className="swatch-grid">
    <div className="swatch">
      <div className="swatch-block" style={{background: '#E8F4FD'}}></div>
      <div className="swatch-info"><div className="swatch-name">Primary</div><div className="swatch-hex">#E8F4FD</div><div className="swatch-token">--text-primary</div></div>
    </div>
    <div className="swatch">
      <div className="swatch-block" style={{background: '#7BB8D8'}}></div>
      <div className="swatch-info"><div className="swatch-name">Secondary</div><div className="swatch-hex">#7BB8D8</div><div className="swatch-token">--text-secondary</div></div>
    </div>
    <div className="swatch">
      <div className="swatch-block" style={{background: '#3D6E90'}}></div>
      <div className="swatch-info"><div className="swatch-name">Muted</div><div className="swatch-hex">#3D6E90</div><div className="swatch-token">--text-muted</div></div>
    </div>
  </div>
</div>

{/*  ── Typography ──  */}
<div className="sg-section">
  <div className="sg-section-title">Typography</div>
  <p className="sg-section-desc">Two typefaces: <strong>Inter</strong> for all UI text, <strong>JetBrains Mono</strong> for sensor values, code, and tokens.</p>

  <div className="type-row">
    <div style={{fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1}}>Display — 40px / 700</div>
    <div className="type-meta">font-size: 2.5rem · font-weight: 700 · letter-spacing: -0.03em · Use: page hero titles</div>
  </div>
  <div className="type-row">
    <div style={{fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em'}}>Heading 1 — 32px / 700</div>
    <div className="type-meta">font-size: 2rem · font-weight: 700 · letter-spacing: -0.02em · Use: page headings</div>
  </div>
  <div className="type-row">
    <div style={{fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em'}}>Heading 2 — 24px / 600</div>
    <div className="type-meta">font-size: 1.5rem · font-weight: 600 · Use: section headings</div>
  </div>
  <div className="type-row">
    <div style={{fontSize: '1.125rem', fontWeight: 600}}>Heading 3 — 18px / 600</div>
    <div className="type-meta">font-size: 1.125rem · font-weight: 600 · Use: card titles, subsections</div>
  </div>
  <div className="type-row">
    <div style={{fontSize: '1rem', fontWeight: 500}}>Body Large — 16px / 500</div>
    <div className="type-meta">font-size: 1rem · font-weight: 500 · Use: primary body text</div>
  </div>
  <div className="type-row">
    <div style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>Body — 14px / 400 · Secondary text providing supporting details and descriptions.</div>
    <div className="type-meta">font-size: 0.875rem · font-weight: 400 · color: --text-secondary</div>
  </div>
  <div className="type-row">
    <div style={{fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)'}}>LABEL — 12px / 600 UPPERCASE</div>
    <div className="type-meta">font-size: 0.75rem · font-weight: 600 · text-transform: uppercase · Use: table headers, section labels</div>
  </div>
  <div className="type-row" style={{border: 'none'}}>
    <div style={{fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--accent)'}}>7.42 mg/L</div>
    <div className="type-meta">font-family: JetBrains Mono · Use: sensor readings, numeric values, code snippets</div>
  </div>
</div>

{/*  ── Spacing ──  */}
<div className="sg-section">
  <div className="sg-section-title">Spacing Scale</div>
  <p className="sg-section-desc">8-point grid. All spacing values are multiples of 4px. Use tokens, not arbitrary values.</p>
  <div className="spacing-row">
    <div className="spacing-item"><div className="spacing-block" style={{height: '4px'}}></div><div className="spacing-label">s1<br />4px</div></div>
    <div className="spacing-item"><div className="spacing-block" style={{height: '8px'}}></div><div className="spacing-label">s2<br />8px</div></div>
    <div className="spacing-item"><div className="spacing-block" style={{height: '12px'}}></div><div className="spacing-label">s3<br />12px</div></div>
    <div className="spacing-item"><div className="spacing-block" style={{height: '16px'}}></div><div className="spacing-label">s4<br />16px</div></div>
    <div className="spacing-item"><div className="spacing-block" style={{height: '20px'}}></div><div className="spacing-label">s5<br />20px</div></div>
    <div className="spacing-item"><div className="spacing-block" style={{height: '24px'}}></div><div className="spacing-label">s6<br />24px</div></div>
    <div className="spacing-item"><div className="spacing-block" style={{height: '32px'}}></div><div className="spacing-label">s8<br />32px</div></div>
    <div className="spacing-item"><div className="spacing-block" style={{height: '40px'}}></div><div className="spacing-label">s10<br />40px</div></div>
    <div className="spacing-item"><div className="spacing-block" style={{height: '48px'}}></div><div className="spacing-label">s12<br />48px</div></div>
    <div className="spacing-item"><div className="spacing-block" style={{height: '64px'}}></div><div className="spacing-label">s16<br />64px</div></div>
  </div>
</div>

{/*  ── Border Radius ──  */}
<div className="sg-section">
  <div className="sg-section-title">Border Radius</div>
  <div className="radius-row">
    <div className="radius-item"><div className="radius-block" style={{borderRadius: 'var(--r-sm)'}}></div><div className="radius-label">r-sm<br />4px</div></div>
    <div className="radius-item"><div className="radius-block" style={{borderRadius: 'var(--r-md)'}}></div><div className="radius-label">r-md<br />8px</div></div>
    <div className="radius-item"><div className="radius-block" style={{borderRadius: 'var(--r-lg)'}}></div><div className="radius-label">r-lg<br />12px</div></div>
    <div className="radius-item"><div className="radius-block" style={{borderRadius: 'var(--r-xl)'}}></div><div className="radius-label">r-xl<br />16px</div></div>
    <div className="radius-item"><div className="radius-block" style={{borderRadius: 'var(--r-2xl)'}}></div><div className="radius-label">r-2xl<br />24px</div></div>
    <div className="radius-item"><div className="radius-block" style={{borderRadius: 'var(--r-full)', width: '64px'}}></div><div className="radius-label">r-full<br />9999px</div></div>
  </div>
</div>

{/*  ── Buttons ──  */}
<div className="sg-section">
  <div className="sg-section-title">Buttons</div>
  <div className="comp-row">
    <span className="comp-label">Primary</span>
    <button className="btn btn-primary btn-sm">Small</button>
    <button className="btn btn-primary">Default</button>
    <button className="btn btn-primary btn-lg">Large</button>
    <button className="btn btn-primary" style={{opacity: 0.4, cursor: 'not-allowed'}}>Disabled</button>
  </div>
  <div className="comp-row">
    <span className="comp-label">Secondary</span>
    <button className="btn btn-secondary btn-sm">Small</button>
    <button className="btn btn-secondary">Default</button>
    <button className="btn btn-secondary btn-lg">Large</button>
  </div>
  <div className="comp-row">
    <span className="comp-label">Ghost</span>
    <button className="btn btn-ghost">Ghost</button>
  </div>
  <div className="comp-row">
    <span className="comp-label">Danger</span>
    <button className="btn btn-danger">Delete</button>
  </div>
  <div className="comp-row">
    <span className="comp-label">Warning</span>
    <button className="btn btn-warning">Acknowledge</button>
  </div>
  <div className="comp-row">
    <span className="comp-label">With icon</span>
    <button className="btn btn-primary">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Add Sensor
    </button>
    <button className="btn btn-secondary">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Export
    </button>
  </div>
</div>

{/*  ── Badges ──  */}
<div className="sg-section">
  <div className="sg-section-title">Badges & Status</div>
  <div className="comp-row">
    <span className="comp-label">Severity</span>
    <span className="badge badge-safe"><span className="status-dot dot-safe"></span>Safe</span>
    <span className="badge badge-warning"><span className="status-dot dot-warning"></span>Warning</span>
    <span className="badge badge-danger"><span className="status-dot dot-danger"></span>Critical</span>
    <span className="badge badge-info">Info</span>
    <span className="badge badge-neutral">Offline</span>
  </div>
  <div className="comp-row">
    <span className="comp-label">Status dots</span>
    <span className="status-dot dot-safe"></span>
    <span className="status-dot dot-warning"></span>
    <span className="status-dot dot-danger"></span>
    <span className="status-dot dot-offline"></span>
  </div>
</div>

{/*  ── Forms ──  */}
<div className="sg-section">
  <div className="sg-section-title">Form Elements</div>
  <div className="form-demo">
    <div className="form-group">
      <label className="form-label required">Sensor Name</label>
      <input type="text" className="form-control" placeholder="e.g. Limpopo River Station A" value="" />
    </div>
    <div className="form-group">
      <label className="form-label">Location</label>
      <select className="form-control">
        <option>Limpopo River</option>
        <option>Vaal Dam</option>
        <option>Orange River</option>
      </select>
    </div>
    <div className="form-group">
      <label className="form-label">Notes</label>
      <textarea className="form-control" rows={3} placeholder="Optional notes about this sensor..."></textarea>
    </div>
    <div style={{display: 'flex', gap: 'var(--s3)'}}>
      <button className="btn btn-primary">Save Changes</button>
      <button className="btn btn-secondary">Cancel</button>
    </div>
  </div>
</div>

{/*  ── Cards ──  */}
<div className="sg-section">
  <div className="sg-section-title">Card Components</div>
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 'var(--s4)'}}>
    {/*  KPI Card examples  */}
    <div className="kpi-card kpi-safe">
      <div className="kpi-header">
        <div>
          <div className="kpi-label">Safe Locations</div>
          <div className="kpi-value safe">5</div>
          <div className="kpi-sub">of 8 active sensors</div>
        </div>
        <div className="kpi-icon" style={{background: 'var(--safe-bg)'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--safe)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
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
        <div className="kpi-icon" style={{background: 'var(--warning-bg)'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
      </div>
    </div>
    <div className="kpi-card kpi-danger">
      <div className="kpi-header">
        <div>
          <div className="kpi-label">Critical</div>
          <div className="kpi-value danger">1</div>
          <div className="kpi-sub">immediate action needed</div>
        </div>
        <div className="kpi-icon" style={{background: 'var(--danger-bg)'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
      </div>
    </div>
    <div className="kpi-card kpi-accent">
      <div className="kpi-header">
        <div>
          <div className="kpi-label">Total Locations</div>
          <div className="kpi-value accent">8</div>
          <div className="kpi-sub">across 4 provinces</div>
        </div>
        <div className="kpi-icon" style={{background: 'var(--accent-glow)'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
    </div>
  </div>
</div>

{/*  ── Alert Items ──  */}
<div className="sg-section">
  <div className="sg-section-title">Alert Components</div>
  <div className="card">
    <div className="alert-item">
      <div className="alert-icon-wrap alert-icon-danger">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <div className="alert-meta">
        <div className="alert-title">Critical: Nitrates exceed safe limit</div>
        <div className="alert-desc">Crocodile River — 78.3 mg/L detected (limit: 45 mg/L)</div>
        <div className="alert-time">2 minutes ago</div>
      </div>
      <div className="alert-right">
        <span className="badge badge-danger">Critical</span>
        <button className="btn btn-sm btn-secondary">View</button>
      </div>
    </div>
    <div className="alert-item">
      <div className="alert-icon-wrap alert-icon-warning">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <div className="alert-meta">
        <div className="alert-title">Warning: Low dissolved oxygen</div>
        <div className="alert-desc">Olifants River — 4.2 mg/L (threshold: 5.0 mg/L)</div>
        <div className="alert-time">18 minutes ago</div>
      </div>
      <div className="alert-right">
        <span className="badge badge-warning">Warning</span>
        <button className="btn btn-sm btn-secondary">View</button>
      </div>
    </div>
    <div className="alert-item">
      <div className="alert-icon-wrap alert-icon-info">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      </div>
      <div className="alert-meta">
        <div className="alert-title">Info: Sensor Vaal-03 came online</div>
        <div className="alert-desc">Connection restored after 4-hour maintenance window</div>
        <div className="alert-time">1 hour ago</div>
      </div>
      <div className="alert-right">
        <span className="badge badge-info">Info</span>
        <button className="btn btn-sm btn-ghost">Dismiss</button>
      </div>
    </div>
  </div>
</div>

{/*  ── Meter / Progress ──  */}
<div className="sg-section">
  <div className="sg-section-title">Parameter Meters</div>
  <div style={{maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--s5)'}}>
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s2)'}}>
        <span style={{fontSize: '0.8125rem', color: 'var(--text-secondary)'}}>pH</span>
        <span style={{fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--safe)'}}>7.4 <span style={{color: 'var(--text-muted)'}}>(safe)</span></span>
      </div>
      <div className="meter-bar"><div className="meter-fill safe" style={{width: '74%'}}></div></div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.6875rem', color: 'var(--text-muted)'}}><span>0</span><span>6.5–8.5 safe</span><span>14</span></div>
    </div>
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s2)'}}>
        <span style={{fontSize: '0.8125rem', color: 'var(--text-secondary)'}}>Turbidity</span>
        <span style={{fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--warning)'}}>4.1 NTU <span style={{color: 'var(--text-muted)'}}>(warning)</span></span>
      </div>
      <div className="meter-bar"><div className="meter-fill warning" style={{width: '82%'}}></div></div>
    </div>
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s2)'}}>
        <span style={{fontSize: '0.8125rem', color: 'var(--text-secondary)'}}>Nitrates</span>
        <span style={{fontSize: '0.8125rem', fontFamily: 'var(--font-mono)', color: 'var(--danger)'}}>78.3 mg/L <span style={{color: 'var(--text-muted)'}}>(critical)</span></span>
      </div>
      <div className="meter-bar"><div className="meter-fill danger" style={{width: '95%'}}></div></div>
    </div>
  </div>
</div>

{/*  ── Iconography ──  */}
<div className="sg-section">
  <div className="sg-section-title">Iconography</div>
  <p className="sg-section-desc">18×18px SVG icons, 2px strokeWidth, Feather Icons style. Color inherits from parent.</p>
  <div className="icon-grid">
    {/*  Dashboard  */}
    <div className="icon-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      <span className="icon-name">dashboard</span>
    </div>
    {/*  Location  */}
    <div className="icon-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <span className="icon-name">location</span>
    </div>
    {/*  Alert  */}
    <div className="icon-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
      <span className="icon-name">alert</span>
    </div>
    {/*  Upload  */}
    <div className="icon-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
      <span className="icon-name">upload</span>
    </div>
    {/*  Chart  */}
    <div className="icon-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      <span className="icon-name">statistics</span>
    </div>
    {/*  Analytics  */}
    <div className="icon-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
      <span className="icon-name">predictive</span>
    </div>
    {/*  Settings  */}
    <div className="icon-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
      <span className="icon-name">settings</span>
    </div>
    {/*  User  */}
    <div className="icon-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span className="icon-name">user</span>
    </div>
    {/*  Water drop  */}
    <div className="icon-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 C12 2 5 10 5 15 A7 7 0 0 0 19 15 C19 10 12 2 12 2Z"/></svg>
      <span className="icon-name">water</span>
    </div>
    {/*  Sensor  */}
    <div className="icon-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
      <span className="icon-name">sensor</span>
    </div>
    {/*  Download  */}
    <div className="icon-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      <span className="icon-name">download</span>
    </div>
    {/*  Filter  */}
    <div className="icon-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
      <span className="icon-name">filter</span>
    </div>
  </div>
</div>

{/*  ── Tabs ──  */}
<div className="sg-section">
  <div className="sg-section-title">Tab Navigation</div>
  <div style={{maxWidth: '400px'}}>
    <div className="tabs">
      <button className="tab-btn active">All</button>
      <button className="tab-btn">Active</button>
      <button className="tab-btn">Resolved</button>
      <button className="tab-btn">History</button>
    </div>
  </div>
</div>


  </>);
}
