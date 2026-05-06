import { Link } from 'react-router-dom';
import { useTheme } from '../theme';

export default function Landing() {
  const { mode, toggle } = useTheme();
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, letterSpacing: '-0.015em' }}>
          <Logo size={22} />
          AquaWatch
        </Link>
        <div className="landing-nav-links">
          <a href="#how">How it works</a>
          <a href="#outcomes">Outcomes</a>
          <a href="#features">Platform</a>
          <a href="#roi">ROI</a>
          <Link to="/gis">GIS demo</Link>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="theme-toggle" onClick={toggle} title={`Switch to ${mode === 'dark' ? 'light' : 'dark'}`}>
            {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
            {mode === 'dark' ? 'Light' : 'Dark'}
          </button>
          <Link to="/dashboard" className="btn btn-primary">View demo →</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-eyebrow"><span className="dot" />GIS-first · live demo</div>
        <h1 className="hero-title">Smart Water Grid for Modern Utilities</h1>
        <p className="hero-sub">
          Real-time pressure, tank, sensor, and NRW visibility in one GIS-first operations platform.
        </p>
        <div className="hero-ctas">
          <Link to="/dashboard" className="btn btn-primary">View demo →</Link>
          <Link to="/gis" className="btn btn-ghost">Open GIS map</Link>
        </div>
        <div className="hero-meta">
          <span><span className="dot" />No password required</span>
          <span><span className="dot" />Real aerial map</span>
          <span><span className="dot" />Data-heavy operator workflows</span>
        </div>
      </section>

      <div className="hero-preview">
        <Link to="/gis" className="hero-preview-frame" style={{ display: 'block' }}>
          <div className="hero-preview-bar">
            <span className="d" style={{ background: '#FF5F57' }} />
            <span className="d" style={{ background: '#FEBC2E' }} />
            <span className="d" style={{ background: '#28C840' }} />
            <span style={{
              flex: 1, marginLeft: 12,
              fontSize: 11,
              color: 'hsl(var(--muted-foreground))',
              fontFamily: 'var(--font-mono)'
            }}>
              app.aquawatch.io / gis
            </span>
          </div>
          <div className="hero-preview-img" />
        </Link>
      </div>

      <section className="landing-strip">
        <div className="strip-item"><span className="k">For</span><span className="v">Water utilities</span></div>
        <div className="strip-item"><span className="k">Tracks</span><span className="v">Pressure · Tank · pH · NRW</span></div>
        <div className="strip-item"><span className="k">Modules</span><span className="v">Dashboard · GIS · Alerts · Reports</span></div>
        <div className="strip-item"><span className="k">Flow</span><span className="v">See → Locate → Understand → Act</span></div>
      </section>

      <section className="metrics-band">
        <div className="metric">
          <strong>86,200</strong>
          <span>People Connected</span>
        </div>
        <div className="metric">
          <strong>142</strong>
          <span>Pipe Segments Tracked</span>
        </div>
        <div className="metric">
          <strong>10</strong>
          <span>Live Sensors</span>
        </div>
        <div className="metric">
          <strong>4</strong>
          <span>Active Alerts</span>
        </div>
      </section>

      <section className="landing-section visual-flow" id="outcomes">
        <div className="landing-eyebrow">Product glimpse</div>
        <h2>What operators see live</h2>
        <div className="visual-grid">
          <VisualCard title="Dashboard Pulse" sub="Network health at a glance" />
          <VisualCard title="GIS Incident Zoom" sub="Alert to map focus instantly" />
          <VisualCard title="Asset Intelligence" sub="Pipes, sensors, tanks, zones" />
        </div>
      </section>

      <section className="landing-band">
        <div className="band-inner">
          <div className="landing-eyebrow">Why teams switch</div>
          <h2 className="band-title">Faster response. Lower loss. Better visibility.</h2>
          <div className="outcomes-grid">
            <Outcome title="Instant triage" sub="Alert → exact zone → root cause context." />
            <Outcome title="NRW control" sub="Zone ranking and loss hotspots in one view." />
            <Outcome title="Field alignment" sub="Control room and crews share one source." />
            <Outcome title="Report-ready" sub="Daily, weekly, and monthly performance exports." />
          </div>
        </div>
      </section>

      <section className="landing-section" id="features">
        <div className="landing-eyebrow">Modules</div>
        <h2>Complete operational suite</h2>
        <div className="module-rail">
          <Module title="Dashboard" sub="Live KPIs + risk zones" />
          <Module title="GIS Map" sub="Aerial network intelligence" />
          <Module title="Alerts" sub="Severity, zone, and timeline" />
          <Module title="NRW" sub="Loss trend + zone ranking" />
          <Module title="Sensors" sub="Pressure, level, pH health" />
          <Module title="Reports" sub="Ops and governance exports" />
        </div>
      </section>

      <section className="landing-section" id="how">
        <div className="landing-eyebrow">Flow</div>
        <h2>Dashboard → GIS → Action</h2>
        <div className="steps">
          <div className="step"><div className="step-num">1</div><h3>See</h3><p>Live network health and alerts.</p></div>
          <div className="step"><div className="step-num">2</div><h3>Locate</h3><p>Jump to exact zone, pipe, or sensor.</p></div>
          <div className="step"><div className="step-num">3</div><h3>Act</h3><p>Investigate, dispatch, verify recovery.</p></div>
        </div>
      </section>

      <section className="landing-cta">
        <div className="landing-cta-inner">
          <div>
            <div className="landing-eyebrow" style={{ textAlign: 'left', marginBottom: 6 }}>Next step</div>
            <h2>See your full water network like an operations center</h2>
            <p>
              Explore the demo flow now: Dashboard → GIS Map → Alerts → NRW → Sensors → Reports.
            </p>
          </div>
          <div className="landing-cta-actions">
            <Link to="/dashboard" className="btn btn-primary">View demo →</Link>
            <Link to="/gis" className="btn btn-ghost">Go straight to GIS</Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        AquaWatch — Smart Water Grid for Modern Utilities ·{' '}
        <Link to="/dashboard" style={{ color: 'hsl(var(--primary))' }}>View demo</Link>
      </footer>
    </div>
  );
}

function Logo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx={14} cy={14} r={14} fill="hsl(var(--primary) / 0.14)" />
      <path d="M14 4C14 4 6 12 6 18a8 8 0 0016 0c0-6-8-14-8-14z" fill="hsl(var(--primary))" />
    </svg>
  );
}

function Feature({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="feat">
      <div className="feat-icon">
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>{icon}</svg>
      </div>
      <h3>{title}</h3>
      <p>{sub}</p>
    </div>
  );
}

function Outcome({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="outcome">
      <h3>{title}</h3>
      <p>{sub}</p>
    </div>
  );
}

function VisualCard({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="visual-card">
      <div className="visual-canvas">
        <span className="pin p1" />
        <span className="pin p2" />
        <span className="pin p3" />
        <span className="line l1" />
        <span className="line l2" />
      </div>
      <h3>{title}</h3>
      <p>{sub}</p>
    </div>
  );
}

function Module({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="module-chip">
      <h3>{title}</h3>
      <p>{sub}</p>
    </div>
  );
}

function SunIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx={12} cy={12} r={4} />
      <line x1={12} y1={2} x2={12} y2={4} />
      <line x1={12} y1={20} x2={12} y2={22} />
      <line x1={4.93} y1={4.93} x2={6.34} y2={6.34} />
      <line x1={17.66} y1={17.66} x2={19.07} y2={19.07} />
      <line x1={2} y1={12} x2={4} y2={12} />
      <line x1={20} y1={12} x2={22} y2={12} />
      <line x1={4.93} y1={19.07} x2={6.34} y2={17.66} />
      <line x1={17.66} y1={6.34} x2={19.07} y2={4.93} />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
