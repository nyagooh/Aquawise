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
          <a href="#features">Platform</a>
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
          Real-time monitoring of pressure, tank levels, and sensors across your network.
          Detect issues early and reduce water loss with a GIS-based platform built for utility teams.
        </p>
        <div className="hero-ctas">
          <Link to="/dashboard" className="btn btn-primary">Open demo dashboard →</Link>
          <Link to="/gis" className="btn btn-ghost">Open GIS map</Link>
        </div>
        <div className="hero-meta">
          <span><span className="dot" />No password required</span>
          <span><span className="dot" />Real aerial map</span>
          <span><span className="dot" />Sandbox data</span>
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

      <section className="landing-section" id="how">
        <div className="landing-eyebrow">Demo flow</div>
        <h2>How it works</h2>
        <p className="lede">Three quick steps. No passwords, no setup — sandbox utility data, live aerial map.</p>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <h3>Open the dashboard</h3>
            <p>Network-wide KPIs, recent alerts, and a small map preview at a glance.</p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <h3>Drill into the GIS map</h3>
            <p>Real aerial map with zones, pipes, tanks and sensors. Click any feature for live readings.</p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <h3>Investigate &amp; resolve</h3>
            <p>Search a zone, sensor or pipe. Jump from alerts straight to the right point on the map.</p>
          </div>
        </div>
      </section>

      <section className="landing-section" id="features">
        <div className="landing-eyebrow">Platform</div>
        <h2>Built for utility operations</h2>
        <p className="lede">Pressure, flow, tank levels, water quality — all on a real GIS map, joined to historical context.</p>
        <div className="feat-grid">
          <Feature
            icon={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx={12} cy={10} r={3} /></>}
            title="GIS-based network view"
            sub="Aerial map of your distribution network — zones, DMAs, tanks, valves, sensors — colour-coded by status."
          />
          <Feature
            icon={<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />}
            title="Real-time telemetry"
            sub="Pressure, flow, level and quality readings stream in continuously."
          />
          <Feature
            icon={<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1={12} y1={9} x2={12} y2={13} /><line x1={12} y1={17} x2={12.01} y2={17} /></>}
            title="Early-warning alerts"
            sub="Threshold breaches surface within seconds — with one-click drill-down to the sensor and history."
          />
          <Feature
            icon={<><line x1={18} y1={20} x2={18} y2={10} /><line x1={12} y1={20} x2={12} y2={4} /><line x1={6} y1={20} x2={6} y2={14} /></>}
            title="Loss & NRW analytics"
            sub="Track non-revenue water across DMAs and zones. Spot leaks before they compound."
          />
          <Feature
            icon={<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></>}
            title="Historical context"
            sub="Replay any sensor over the last 90 days. Compare against thresholds and seasonal trends."
          />
          <Feature
            icon={<><circle cx={12} cy={12} r={10} /><polyline points="12 6 12 12 16 14" /></>}
            title="Built for the field"
            sub="Mobile-friendly layouts and touch controls. Field crews and control-room operators see the same picture."
          />
        </div>
      </section>

      <footer className="landing-footer">
        AquaWatch — Smart Water Grid for Modern Utilities ·{' '}
        <Link to="/dashboard" style={{ color: 'hsl(var(--primary))' }}>Open demo</Link>
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
