/**
 * Demo Hub — premium intermediate landing between marketing and live map.
 *
 * Routes:
 *   /demo         → two-option chooser (View Your Network / Upload GIS Data)
 *   /demo/upload  → upload workflow for utilities that want to bring their own data
 */
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../theme';
import { loadNetwork, type NetworkMeta } from '../data/network';
import { api } from '../lib/api';
import { useUploadStatus } from '../hooks/useNetworkQueries';
import { useAuth } from '../context/AuthContext';

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

type UploadPhase = 'idle' | 'uploading' | 'processing' | 'epanet' | 'done' | 'failed';

function UploadView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [hover, setHover] = useState(false);
  const [staged, setStaged] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: uploadStatus } = useUploadStatus(uploadId);

  const stagedZip = staged.find((f) => /\.zip$/i.test(f.name));
  const stagedEpanet = staged.find((f) => /\.(inp|net)$/i.test(f.name));

  // React to polling results
  useEffect(() => {
    if (!uploadStatus) return;
    const s = uploadStatus.status;
    if (s === 'complete' || s === 'complete_warnings') {
      const netId = (uploadStatus as { network_id?: string | null }).network_id ?? null;
      setNetworkId(netId);
      if (stagedEpanet && netId) {
        // Upload EPANET file now that we have a network
        setPhase('epanet');
        const form = new FormData();
        form.append('file', stagedEpanet);
        api.post(`/networks/${netId}/epanet/`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
          .then(() => setPhase('done'))
          .catch(() => setPhase('done')); // EPANET failure is non-fatal
      } else {
        setPhase('done');
      }
    } else if (s === 'failed') {
      setPhase('failed');
      setErrorMsg(
        uploadStatus.validation_report?.error
        || 'Ingestion failed. Check that the zip contains a valid shapefile.'
      );
      setUploadId(null);
    } else {
      setPhase('processing');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadStatus]);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    setStaged((s) => {
      let next = [...s];
      for (const f of Array.from(files)) {
        if (/\.(inp|net)$/i.test(f.name)) {
          next = next.filter((x) => !/\.(inp|net)$/i.test(x.name));
          next.push(f);
        } else if (!next.find((x) => x.name === f.name && x.size === f.size)) {
          next.push(f);
        }
      }
      return next;
    });
  };

  const submit = async () => {
    if (!stagedZip) {
      setErrorMsg('Please add a .zip file containing your shapefile components (.shp, .dbf, .shx, .prj).');
      return;
    }
    setErrorMsg(null);
    setPhase('uploading');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', stagedZip);

    try {
      const { data } = await api.post<{ upload_id: string; status: string }>(
        '/networks/upload/',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          },
        }
      );
      setUploadId(data.upload_id);
      setPhase('processing');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setErrorMsg(msg || 'Upload failed. Please try again.');
      setPhase('failed');
    }
  };

  const goToMap = async () => {
    await queryClient.refetchQueries({ queryKey: ['networks'] });
    navigate('/gis');
  };

  const reset = () => {
    setPhase('idle');
    setStaged([]);
    setUploadId(null);
    setErrorMsg(null);
    setUploadProgress(0);
  };

  // ── Processing / done / failed overlays ──
  if (phase === 'uploading' || phase === 'processing' || phase === 'epanet' || phase === 'done' || phase === 'failed') {
    const report = uploadStatus?.validation_report;
    const isActive = phase !== 'done' && phase !== 'failed';
    return (
      <DemoFrame>
        <header className="demo-hub-head">
          <div className="demo-hub-eyebrow">
            {isActive && (
              <span style={{ color: 'hsl(var(--muted-foreground))' }}>Processing your network…</span>
            )}
          </div>
          <h1>{phase === 'done' ? 'Network ready.' : phase === 'failed' ? 'Ingestion failed.' : 'Uploading & ingesting…'}</h1>
          <p>
            {phase === 'done'
              ? `${(report?.pipes ?? 0).toLocaleString()} pipes ingested${report?.nodes ? ` · ${report.nodes.toLocaleString()} nodes` : ''}.`
              : phase === 'failed'
                ? errorMsg
                : phase === 'uploading'
                  ? `Sending file… ${uploadProgress}%`
                  : phase === 'epanet'
                    ? 'Attaching EPANET hydraulic model…'
                    : 'Classifying geometry · reprojecting CRS · building spatial index…'}
          </p>
        </header>

        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 var(--s6)' }}>
          {(phase === 'uploading' || phase === 'processing' || phase === 'epanet') && (
            <div className="upload-progress-track">
              <div className="upload-progress-step" data-active={phase === 'uploading' ? 'true' : 'false'}>
                <span className={phase === 'uploading' ? 'upload-step-spinner' : 'upload-step-done'} />
                Uploading
              </div>
              <div className="upload-progress-step" data-active={phase === 'processing' ? 'true' : 'false'}>
                <span className={phase === 'processing' ? 'upload-step-spinner' : phase === 'epanet' ? 'upload-step-done' : 'upload-step-pending'} />
                Ingesting shapefile
              </div>
              {stagedEpanet && (
                <div className="upload-progress-step" data-active={phase === 'epanet' ? 'true' : 'false'}>
                  <span className={phase === 'epanet' ? 'upload-step-spinner' : 'upload-step-pending'} />
                  Attaching EPANET
                </div>
              )}
              <div className="upload-progress-step" data-active="false">
                <span className="upload-step-pending" />
                Ready
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="upload-success-card">
              <div className="upload-success-icon">✓</div>
              <div className="upload-success-stats">
                {report?.pipes != null && <span><strong>{report.pipes.toLocaleString()}</strong> pipes</span>}
                {report?.nodes != null && <span><strong>{report.nodes.toLocaleString()}</strong> nodes</span>}
              </div>
              {report?.warnings && report.warnings.length > 0 && (
                <details className="upload-warnings">
                  <summary>{report.warnings.length} warning{report.warnings.length === 1 ? '' : 's'}</summary>
                  <ul>{report.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
                </details>
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn btn-primary btn-lg" onClick={goToMap}>Open in map →</button>
                <button className="btn btn-ghost btn-lg" onClick={reset}>Upload another</button>
              </div>
            </div>
          )}

          {phase === 'failed' && (
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn btn-primary btn-lg" onClick={reset}>Try again</button>
            </div>
          )}
        </div>
      </DemoFrame>
    );
  }

  // ── Unauthenticated wall ──
  if (!user) {
    return (
      <DemoFrame>
        <header className="demo-hub-head">
          <h1>Sign in to upload.</h1>
          <p>Your network is stored in your account — sign in first, then upload.</p>
        </header>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: 'var(--s8) 0' }}>
          <Link to="/login" className="btn btn-primary btn-lg">Sign in →</Link>
          <Link to="/signup" className="btn btn-ghost btn-lg">Create account</Link>
        </div>
      </DemoFrame>
    );
  }

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
        <p>Drop a <strong>.zip</strong> shapefile — we&apos;ll reproject, classify, and render it. Optionally add an <strong>.inp</strong> or <strong>.net</strong> EPANET model to import node types and elevations.</p>
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
              accept=".zip,.inp,.net"
              multiple
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
              <div className="demo-upload-headline">Drop your GIS files here</div>
              <div className="demo-upload-sub">or <span className="link">browse from your computer</span></div>
              <div className="demo-upload-formats">
                <span>.zip shapefile &nbsp;·&nbsp; .inp / .net EPANET (optional)</span>
              </div>
            </div>
          </label>

          {errorMsg && (
            <div className="login-error" style={{ marginTop: 12 }}>{errorMsg}</div>
          )}

          {staged.length > 0 && (
            <div className="demo-upload-staged">
              <div className="demo-upload-staged-head">
                <span>Staged · {staged.length} file{staged.length === 1 ? '' : 's'}</span>
                <button type="button" className="link" onClick={() => setStaged([])}>Clear all</button>
              </div>
              <ul>
                {staged.map((f) => {
                  const isEpanet = /\.(inp|net)$/i.test(f.name);
                  return (
                    <li key={f.name}>
                      <FileTypeBadge name={f.name} />
                      <span className="demo-upload-file-name">{f.name}</span>
                      {isEpanet && <span style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginLeft: 6 }}>EPANET model</span>}
                      <span className="demo-upload-file-size">{formatBytes(f.size)}</span>
                      <button
                        className="demo-upload-file-remove"
                        onClick={() => setStaged((s) => s.filter((x) => x !== f))}
                        aria-label={`Remove ${f.name}`}
                      >×</button>
                    </li>
                  );
                })}
              </ul>
              {!stagedZip && (
                <div className="login-error" style={{ marginTop: 0, marginBottom: 12 }}>
                  A .zip shapefile is required. Add one to continue.
                </div>
              )}
              <div className="demo-upload-staged-foot">
                <button className="btn btn-primary btn-lg" onClick={submit} disabled={!stagedZip}>
                  Ingest &amp; render on live map →
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
              <li><span className="bullet" />Any CRS reprojected to WGS84 automatically</li>
            </ul>
          </div>
          <div className="demo-upload-side-card subtle">
            <h3>How it works</h3>
            <p>
              Your shapefile is sent to our PostGIS ingestion pipeline, classified by
              geometry type, reprojected to EPSG:4326, and stored under your account.
              Close the tab and come back — your network will be there.
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
