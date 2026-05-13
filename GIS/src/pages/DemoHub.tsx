/**
 * Demo Hub — premium intermediate landing between marketing and live map.
 *
 * Routes:
 *   /demo         → two-option chooser (View Your Network / Upload GIS Data)
 *   /demo/upload  → upload workflow for utilities that want to bring their own data
 */
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../theme';
import { loadNetwork, type NetworkMeta } from '../data/network';

export default function DemoHub() {
  const location = useLocation();
  const isUpload = location.pathname.endsWith('/upload');
  return isUpload ? <UploadView /> : <ChooserView />;
}

/* ════════════════════════════════════════════════════════════
   Shared layout shell
   ════════════════════════════════════════════════════════════ */

function DemoFrame({ children }: { children: React.ReactNode }) {
  const { mode, toggle } = useTheme();
  return (
    <div className="demo-hub">
      <nav className="demo-hub-nav">
        <Link to="/" className="demo-hub-brand">
          <BrandMark />
          <span>Aqua<b>Watch</b></span>
        </Link>
        <div className="demo-hub-nav-meta">
          <span className="demo-hub-pill"><span className="live-dot" />Live · Kisumu Water Network</span>
          <button className="theme-toggle" onClick={toggle} title={`Switch to ${mode === 'dark' ? 'light' : 'dark'}`}>
            {mode === 'dark' ? '☀' : '☾'} {mode === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </nav>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   Chooser
   ════════════════════════════════════════════════════════════ */

function ChooserView() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState<NetworkMeta | null>(null);

  useEffect(() => {
    let alive = true;
    loadNetwork()
      .then((d) => { if (alive) setMeta(d.meta); })
      .catch(() => { /* swallow — preview-only stats */ });
    return () => { alive = false; };
  }, []);

  return (
    <DemoFrame>
      <header className="demo-hub-head">
        <div className="demo-hub-eyebrow">Choose how to start</div>
        <h1>Start the live demo.</h1>
        <p>View the Kisumu network or upload your own GIS.</p>
      </header>

      <section className="demo-hub-options">
        <button
          className="demo-hub-card primary"
          onClick={() => navigate('/gis')}
        >
          <div className="demo-hub-card-inner">
            <div className="demo-hub-card-head">
              <div className="demo-hub-card-icon">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx={12} cy={10} r={3} />
                </svg>
              </div>
              <div className="demo-hub-card-tag">Sandbox · live</div>
            </div>
            <h2>View Your Network</h2>
            <p>Open the live Kisumu map — every pipe, valve and sensor.</p>
            <ul className="demo-hub-card-stats">
              <li>
                <strong>{meta ? meta.feature_count.toLocaleString() : '—'}</strong>
                <span>Pipe segments</span>
              </li>
              <li>
                <strong>{meta ? `${meta.total_length_km.toFixed(0)} km` : '—'}</strong>
                <span>Total length</span>
              </li>
              <li>
                <strong>{meta ? Object.keys(meta.length_km_by_zone).filter(z => z !== 'HDPE' && z !== 'CDD' && z !== 'MTY').length : '—'}</strong>
                <span>Service zones</span>
              </li>
              <li>
                <strong>{meta ? meta.asset_count : '—'}</strong>
                <span>Telemetry nodes</span>
              </li>
            </ul>
            <div className="demo-hub-card-cta">
              Enter the live map
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1={5} y1={12} x2={19} y2={12}/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </div>
        </button>

        <button
          className="demo-hub-card"
          onClick={() => navigate('/demo/upload')}
        >
          <div className="demo-hub-card-inner">
            <div className="demo-hub-card-head">
              <div className="demo-hub-card-icon alt">
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1={12} y1={3} x2={12} y2={15} />
                </svg>
              </div>
              <div className="demo-hub-card-tag">Your data</div>
            </div>
            <h2>Upload GIS Data</h2>
            <p>Bring your shapefile, GeoJSON or EPANET export — render it on the map.</p>
            <ul className="demo-hub-card-stats">
              <li>
                <strong>SHP</strong>
                <span>Esri shapefile bundle</span>
              </li>
              <li>
                <strong>GeoJSON</strong>
                <span>EPSG:4326 polylines + points</span>
              </li>
              <li>
                <strong>EPANET</strong>
                <span>.inp hydraulic models</span>
              </li>
              <li>
                <strong>KML / KMZ</strong>
                <span>Drawing exports</span>
              </li>
            </ul>
            <div className="demo-hub-card-cta">
              Start the upload
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1={5} y1={12} x2={19} y2={12}/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </div>
        </button>
      </section>

      <footer className="demo-hub-foot">
        <div className="demo-hub-foot-cell">
          <span>Source dataset</span>
          <strong>Kisumu Water &amp; Sanitation Co. · 2024 export</strong>
        </div>
        <div className="demo-hub-foot-cell">
          <span>Projection</span>
          <strong>WGS 84 · UTM 36S → EPSG:4326</strong>
        </div>
        <div className="demo-hub-foot-cell">
          <span>Demo policy</span>
          <strong>Read-only · no sign-up required</strong>
        </div>
      </footer>
    </DemoFrame>
  );
}

/* ════════════════════════════════════════════════════════════
   Upload workflow
   ════════════════════════════════════════════════════════════ */

function UploadView() {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const [staged, setStaged] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    setStaged((s) => {
      const next = [...s];
      Array.from(files).forEach((f) => {
        if (!next.find((x) => x.name === f.name && x.size === f.size)) next.push(f);
      });
      return next;
    });
  };

  const submit = () => {
    setBusy(true);
    // Simulate ingestion; in production this would parse + POST.
    setTimeout(() => {
      setBusy(false);
      navigate('/gis');
    }, 1200);
  };

  return (
    <DemoFrame>
      <header className="demo-hub-head">
        <div className="demo-hub-eyebrow">
          <Link to="/demo" className="demo-back-link">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to options
          </Link>
        </div>
        <h1>Upload your GIS data.</h1>
        <p>Drop a shapefile bundle, GeoJSON, KML or EPANET export — we&apos;ll render it on the map.</p>
      </header>

      <section className="demo-upload-grid">
        <div className="demo-upload-main">
          <label
            className={`demo-upload-zone${hover ? ' hover' : ''}${staged.length ? ' has-files' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setHover(true); }}
            onDragLeave={() => setHover(false)}
            onDrop={(e) => { e.preventDefault(); setHover(false); onFiles(e.dataTransfer.files); }}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".shp,.shx,.dbf,.prj,.cpg,.qmd,.geojson,.json,.kml,.kmz,.inp,.zip"
              onChange={(e) => onFiles(e.target.files)}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
            />
            <div className="demo-upload-zone-inner">
              <div className="demo-upload-icon">
                <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1={12} y1={3} x2={12} y2={15} />
                </svg>
              </div>
              <div className="demo-upload-headline">Drop your network files here</div>
              <div className="demo-upload-sub">or <span className="link">browse from your computer</span></div>
              <div className="demo-upload-formats">
                <span>.shp + .dbf + .shx + .prj</span>
                <span>.geojson</span>
                <span>.kml / .kmz</span>
                <span>EPANET .inp</span>
                <span>.zip bundle</span>
              </div>
            </div>
          </label>

          {staged.length > 0 && (
            <div className="demo-upload-staged">
              <div className="demo-upload-staged-head">
                <span>Staged · {staged.length} file{staged.length === 1 ? '' : 's'}</span>
                <button type="button" className="link" onClick={() => setStaged([])}>Clear all</button>
              </div>
              <ul>
                {staged.map((f) => (
                  <li key={f.name}>
                    <FileTypeBadge name={f.name} />
                    <span className="demo-upload-file-name">{f.name}</span>
                    <span className="demo-upload-file-size">{formatBytes(f.size)}</span>
                    <button
                      className="demo-upload-file-remove"
                      onClick={() => setStaged((s) => s.filter((x) => x !== f))}
                      aria-label={`Remove ${f.name}`}
                    >×</button>
                  </li>
                ))}
              </ul>
              <div className="demo-upload-staged-foot">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={submit}
                  disabled={busy}
                >
                  {busy ? 'Ingesting…' : 'Ingest & render on live map →'}
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => navigate('/gis')}>
                  Skip — use Kisumu sandbox
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="demo-upload-side">
          <div className="demo-upload-side-card">
            <h3>What we detect automatically</h3>
            <ul>
              <li><span className="bullet" />Transmission and distribution mains</li>
              <li><span className="bullet" />Household / service line connections</li>
              <li><span className="bullet" />Backfeed segments (closed status)</li>
              <li><span className="bullet" />DMA / pressure-zone boundaries</li>
              <li><span className="bullet" />Pipe attributes: material, diameter, age, length</li>
              <li><span className="bullet" />Service status: open · closed · in-service</li>
              <li><span className="bullet" />Topological junctions for valves &amp; tanks</li>
            </ul>
          </div>
          <div className="demo-upload-side-card subtle">
            <h3>Your data is yours</h3>
            <p>
              All parsing runs in your browser for this demo. Nothing is uploaded to a
              server — close the tab and the data is gone. Production deployments use
              an isolated tenant ingestion pipeline (PostGIS + Mapbox vector tiles).
            </p>
          </div>
        </aside>
      </section>
    </DemoFrame>
  );
}

function FileTypeBadge({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  const tone =
    ext === 'shp' || ext === 'dbf' || ext === 'shx' || ext === 'prj' ? 'shp' :
    ext === 'geojson' || ext === 'json' ? 'geo' :
    ext === 'kml' || ext === 'kmz' ? 'kml' :
    ext === 'inp' ? 'inp' :
    ext === 'zip' ? 'zip' : 'gen';
  return <span className={`demo-upload-badge tone-${tone}`}>{ext.toUpperCase() || 'FILE'}</span>;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function BrandMark() {
  return (
    <svg width={22} height={22} viewBox="0 0 28 28" fill="none">
      <circle cx={14} cy={14} r={14} fill="hsl(var(--primary) / 0.14)" />
      <path d="M14 4C14 4 6 12 6 18a8 8 0 0016 0c0-6-8-14-8-14z" fill="hsl(var(--primary))" />
    </svg>
  );
}
