import React from 'react';

/**
 * Faithful, static recreations of the real AquaWise app UI for the trailer —
 * sidebar + topbar chrome, the operations dashboard (KPI band, composition
 * bars, zones table, live alerts, reservoir gauges), and the GIS map workspace
 * (shiny-blue network, leak markers, toolbar, layer key, simulation strip).
 * Rebuilt for Remotion (no Leaflet / router) but matching the product's look.
 */

export const BLUE = '#2563EB';
export const FLOW = '#1FA2FF';
export const NAVY = '#0B1020';
export const CORAL = '#F2585B';
export const AMBER = '#F5A623';
export const GREEN = '#22C55E';
const INK = '#0f172a';
const MUT = '#64748b';

const NAV: Array<{key: string; label: string; badge?: number; icon: React.ReactNode}> = [
  {key: 'dashboard', label: 'Dashboard', icon: <><rect x={3} y={3} width={7} height={9}/><rect x={14} y={3} width={7} height={5}/><rect x={14} y={12} width={7} height={9}/><rect x={3} y={16} width={7} height={5}/></>},
  {key: 'gis', label: 'GIS Map', icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx={12} cy={10} r={3}/></>},
  {key: 'alerts', label: 'Alerts', badge: 5, icon: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1={12} y1={9} x2={12} y2={13}/><line x1={12} y1={17} x2={12.01} y2={17}/></>},
  {key: 'leaks', label: 'Leaks', badge: 3, icon: <><path d="M12 2.5C12 2.5 5 10 5 15a7 7 0 0014 0c0-5-7-12.5-7-12.5z"/><path d="M9 15a3 3 0 003 3"/></>},
  {key: 'nrw', label: 'NRW', icon: <><line x1={18} y1={20} x2={18} y2={10}/><line x1={12} y1={20} x2={12} y2={4}/><line x1={6} y1={20} x2={6} y2={14}/></>},
  {key: 'sensors', label: 'Sensors', icon: <><circle cx={12} cy={12} r={3}/><circle cx={12} cy={12} r={9}/></>},
  {key: 'reports', label: 'Reports', icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></>},
];

const Brand: React.FC = () => (
  <div className="ui-brand">
    <svg width={24} height={24} viewBox="0 0 64 64" fill="none">
      <path d="M12 50 L32 14 L52 50" stroke={BLUE} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 50 L32 14 L43 50" stroke={BLUE} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.5}/>
      <path d="M29 50 L32 14 L35 50" stroke={BLUE} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.22}/>
    </svg>
    <span>Aqua<b>wise</b></span>
  </div>
);

export const AppFrame: React.FC<{active: string; title: string; sub: string; children: React.ReactNode; flush?: boolean}> = ({active, title, sub, children, flush}) => (
  <div className="ui-app">
    <aside className="ui-sidebar">
      <Brand/>
      <div className="ui-sb-section">Platform</div>
      {NAV.map((n) => (
        <div key={n.key} className={`ui-sb-link${n.key === active ? ' active' : ''}`}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>{n.icon}</svg>
          <span>{n.label}</span>
          {n.badge && <span className="ui-badge">{n.badge}</span>}
        </div>
      ))}
      <div className="ui-sb-foot">
        <div className="ui-avatar">DM</div>
        <div><div className="ui-user-name">Demo User</div><div className="ui-user-sub">Kisumu Water</div></div>
      </div>
    </aside>
    <main className="ui-main">
      <header className="ui-topbar">
        <div><div className="ui-topbar-title">{title}</div><div className="ui-topbar-sub">{sub}</div></div>
        <div className="ui-live"><span className="ui-live-dot"/>Live</div>
      </header>
      <div className={`ui-page${flush ? ' flush' : ''}`}>{children}</div>
    </main>
  </div>
);

const KPIS: Array<{label: string; value: string; unit: string; sub: string; tone: string}> = [
  {label: 'Pipe network', value: '716', unit: 'km', sub: '3,233 segments', tone: 'primary'},
  {label: 'Household connections', value: '8,940', unit: 'lines', sub: '212 km service', tone: 'primary'},
  {label: 'Reservoirs', value: '6', unit: 'tanks', sub: 'Avg fill 68%', tone: 'info'},
  {label: 'Pressure valves', value: '18', unit: 'PRVs', sub: '2 drifting', tone: 'warn'},
  {label: 'Meter valves', value: '22', unit: 'bulk', sub: 'Consumption metered', tone: 'primary'},
  {label: 'Active alerts', value: '5', unit: 'open', sub: '1 critical', tone: 'danger'},
  {label: 'Estimated NRW', value: '22.5', unit: '%', sub: 'Age-weighted estimate', tone: 'danger'},
  {label: 'Network health', value: '96', unit: '%', sub: '3,100 segments open', tone: 'safe'},
];

const CLASS_BARS = [
  {label: 'Transmission mains', km: '188.4', pct: 26, color: BLUE},
  {label: 'Distribution mains', km: '301.7', pct: 42, color: FLOW},
  {label: 'Service connections', km: '156.2', pct: 22, color: '#94A3B8'},
  {label: 'Backfeed (closed)', km: '41.0', pct: 6, color: AMBER},
  {label: 'Zone boundaries', km: '28.7', pct: 4, color: '#A78BFA'},
];

const ZONES = [
  {label: 'Milimani', code: 'MIL', pipes: '612', km: '128.4', pct: 18, risk: false},
  {label: 'Central Business District', code: 'CBD', pipes: '548', km: '104.1', pct: 15, risk: true},
  {label: 'Manyatta East', code: 'ME', pipes: '470', km: '92.6', pct: 13, risk: false},
  {label: 'Mamboleo · Tom Mboya', code: 'MYT', pipes: '388', km: '77.3', pct: 11, risk: false},
  {label: 'Kibos · Kajulu', code: 'KREKAJ', pipes: '301', km: '61.0', pct: 9, risk: true},
];

const ALERTS = [
  {sev: 'critical', title: 'Pressure alarm · PV-07', detail: 'Live 1.9 bar (set 3.0) — drift −1.10 bar', time: '3m ago'},
  {sev: 'warning', title: 'Reservoir level low · TANK-03', detail: 'Mamboleo at 28% (560 m³ stored)', time: '8m ago'},
  {sev: 'warning', title: 'Sensor anomaly · SN-12', detail: 'Flow 31 L/s · pressure 2.2 bar', time: '11m ago'},
  {sev: 'info', title: 'Backfeed lines closed', detail: '41 segments isolated for redundancy', time: '24h'},
];

const RES = [
  {name: 'Milimani High', id: 'TANK-01', cap: '2,400 m³', lvl: 82, tone: GREEN},
  {name: 'CBD Central', id: 'TANK-02', cap: '1,800 m³', lvl: 64, tone: AMBER},
  {name: 'Mamboleo', id: 'TANK-03', cap: '2,000 m³', lvl: 28, tone: CORAL},
  {name: 'Kibos Heights', id: 'TANK-04', cap: '1,200 m³', lvl: 71, tone: GREEN},
];

export const DashboardView: React.FC = () => (
  <>
    <div className="ui-kpi-band">
      {KPIS.map((k) => (
        <div key={k.label} className={`ui-kpi tone-${k.tone}`}>
          <div className="ui-kpi-label">{k.label}</div>
          <div className="ui-kpi-value">{k.value}<span>{k.unit}</span></div>
          <div className="ui-kpi-sub">{k.sub}</div>
        </div>
      ))}
    </div>
    <div className="ui-row ui-row-2">
      <div className="ui-card">
        <div className="ui-card-title">Network composition</div>
        <div className="ui-card-sub">By pipe class · % of total length</div>
        <div className="ui-bars">
          {CLASS_BARS.map((b) => (
            <div key={b.label} className="ui-bar-row">
              <span className="ui-bar-sw" style={{background: b.color}}/>
              <div className="ui-bar-body">
                <div className="ui-bar-name">{b.label}</div>
                <div className="ui-bar-track"><div className="ui-bar-fill" style={{width: `${b.pct}%`, background: b.color}}/></div>
              </div>
              <div className="ui-bar-stat"><strong>{b.km} km</strong><span>{b.pct}%</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className="ui-card">
        <div className="ui-card-title">Live alerts</div>
        <div className="ui-card-sub">5 open · auto-generated from telemetry</div>
        <div className="ui-alerts">
          {ALERTS.map((a) => (
            <div key={a.title} className={`ui-alert sev-${a.sev}`}>
              <span className="ui-alert-dot"/>
              <div className="ui-alert-body"><div className="ui-alert-title">{a.title}</div><div className="ui-alert-detail">{a.detail}</div></div>
              <div className="ui-alert-time">{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="ui-row ui-row-2">
      <div className="ui-card">
        <div className="ui-card-title">Service zones</div>
        <div className="ui-card-sub">Ranked by pipe-length coverage</div>
        <table className="ui-zones">
          <thead><tr><th>Zone</th><th>Pipes</th><th>Length</th><th>Share</th><th>Status</th></tr></thead>
          <tbody>
            {ZONES.map((z) => (
              <tr key={z.code}>
                <td><strong>{z.label}</strong><div className="ui-zone-code">{z.code}</div></td>
                <td className="num">{z.pipes}</td>
                <td className="num">{z.km} km</td>
                <td><div className="ui-zone-share"><div className="ui-zone-share-fill" style={{width: `${z.pct * 3}%`}}/><span>{z.pct}%</span></div></td>
                <td><span className={`ui-pill ${z.risk ? 'warn' : 'safe'}`}><span className="dot"/>{z.risk ? 'Watch' : 'Healthy'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ui-card">
        <div className="ui-card-title">Reservoir watch</div>
        <div className="ui-card-sub">Live fill levels · inflow / outflow</div>
        <div className="ui-res-grid">
          {RES.map((r) => (
            <div key={r.id} className="ui-res">
              <div className="ui-res-head"><div><div className="ui-res-name">{r.name}</div><div className="ui-res-id">{r.id} · {r.cap}</div></div></div>
              <div className="ui-res-gauge"><div className="ui-res-fill" style={{height: `${r.lvl}%`, background: r.tone}}/><span>{r.lvl}%</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

/* ── GIS map workspace ── */

const NODES: Array<[number, number]> = [
  [160, 240], [370, 160], [585, 280], [800, 150], [1040, 245], [1290, 150], [1500, 270],
  [280, 500], [520, 470], [740, 570], [980, 445], [1240, 545], [1470, 490],
  [410, 760], [690, 740], [920, 820], [1190, 740], [1450, 810],
];
const LINKS: Array<[number, number]> = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[0,7],[7,8],[8,2],[8,9],[9,10],[10,4],[10,11],[11,12],[12,6],[7,13],[13,14],[14,9],[14,15],[15,16],[16,11],[16,17]];

export const MapNetwork: React.FC<{dash?: number; leak?: boolean; stable?: boolean}> = ({dash = 0, leak, stable = true}) => (
  <svg className="ui-map-net" viewBox="0 0 1680 920" preserveAspectRatio="xMidYMid slice">
    <defs><filter id="ng"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    {LINKS.map(([a,b], i) => (
      <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]}
        stroke={leak && i === 13 ? CORAL : FLOW} strokeWidth={i % 6 === 0 ? 8 : 4.5} opacity={stable ? 0.9 : 0.6} strokeLinecap="round"/>
    ))}
    {LINKS.map(([a,b], i) => (
      <line key={`f${i}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]}
        stroke="#bfe6ff" strokeWidth="3" strokeDasharray="2 26" strokeDashoffset={-dash - i * 11} strokeLinecap="round" filter="url(#ng)" opacity={0.9}/>
    ))}
    {NODES.map(([x,y], i) => <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 11 : 7} fill={FLOW} stroke="#eaf6ff" strokeWidth="3"/>) }
  </svg>
);

export const MapWorkspace: React.FC<{dash?: number; leak?: boolean; sim?: string; leakPulse?: number}> = ({dash = 0, leak, sim = 'Ready to run', leakPulse = 0}) => (
  <div className="ui-map">
    <div className="ui-map-toolbar">
      <div className="ui-bm-tabs"><span className="active">Satellite</span><span>No basemap</span></div>
      <div className="ui-map-spacer"/>
      <div className="ui-sim-btn"><span className="d"/>Run simulation</div>
    </div>
    <div className="ui-map-canvas">
      <MapNetwork dash={dash} leak={leak}/>
      {leak && (
        <div className="ui-leak" style={{left: '40%', top: '78%'}}>
          <span className="ui-leak-ring" style={{transform: `scale(${1 + leakPulse})`, opacity: 1 - leakPulse * 0.7}}/>
          <svg viewBox="0 0 24 24" width="30" height="30"><path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13z" fill={CORAL} stroke="#fff" strokeWidth="1.6"/></svg>
        </div>
      )}
      <div className="ui-key">
        <div className="ui-key-head">Legend</div>
        {[['Transmission main', 'line'], ['Distribution main', 'line'], ['Reservoir / tank', 'tank'], ['Valve (PRV)', 'valve'], ['Sensor', 'sensor'], ['Leak', 'leak']].map(([label, t]) => (
          <div key={label} className="ui-key-row"><KeyIcon t={t as string}/><span>{label}</span></div>
        ))}
      </div>
      <div className="ui-map-zoom"><span>+</span><span>−</span></div>
    </div>
    <div className="ui-sim-strip">
      <div className="ui-sim-state"><span className={`d ${sim.includes('success') ? 'ok' : sim.includes('Running') ? 'run' : ''}`}/><strong>{sim}</strong></div>
      <div className="ui-sim-fields">
        <div><span>Headloss formula</span><strong>Hazen-Williams</strong></div>
        <div><span>Demand multiplier</span><strong>1.0×</strong></div>
        <div><span>Links by</span><strong>Flow</strong></div>
        <div><span>Results</span><strong>{sim.includes('success') ? 'Available' : 'None'}</strong></div>
      </div>
      <div className="ui-sim-run">{sim.includes('Running') ? 'Running…' : 'Run simulation'}</div>
    </div>
  </div>
);

const KeyIcon: React.FC<{t: string}> = ({t}) => {
  if (t === 'line') return <span className="ui-key-sw" style={{width: 22, height: 4, borderRadius: 2, background: FLOW}}/>;
  if (t === 'tank') return <svg width={18} height={18} viewBox="0 0 18 18"><rect x={5} y={3} width={8} height={12} rx={1.5} fill={FLOW} stroke="#fff" strokeWidth={1}/></svg>;
  if (t === 'valve') return <svg width={18} height={18} viewBox="0 0 18 18"><polygon points="3,4 3,14 9,9" fill={FLOW}/><polygon points="15,4 15,14 9,9" fill={FLOW}/></svg>;
  if (t === 'sensor') return <svg width={18} height={18} viewBox="0 0 18 18"><circle cx={9} cy={9} r={3} fill={FLOW}/><circle cx={9} cy={9} r={6} fill="none" stroke={FLOW} strokeWidth={1.4} opacity={0.5}/></svg>;
  return <svg width={16} height={16} viewBox="0 0 24 24"><path d="M12 2C12 2 5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13z" fill={CORAL}/></svg>;
};

/* ── Asset inspector card (matches the side panel) ── */
export const AssetCard: React.FC = () => (
  <div className="ui-asset-card">
    <div className="ui-asset-head"><div><small>PRESSURE VALVE</small><h2>PV-204</h2></div><span className="ui-pill safe"><span className="dot"/>In range</span></div>
    <div className="ui-asset-grid">
      {[['Condition', 'Good'], ['Pressure', '3.4 bar'], ['Flow', '42.8 L/s'], ['Diameter', '200 mm'], ['Material', 'HDPE'], ['Last service', '14 days']].map(([k,v]) => (
        <div key={k}><small>{k}</small><strong>{v}</strong></div>
      ))}
    </div>
  </div>
);

/* ── Leak intelligence cards ── */
export const LeakBoard: React.FC = () => (
  <div className="ui-leak-board">
    {[
      {sev: 'critical', id: 'LK-014', addr: 'Oginga Odinga St · CBD', meta: 'Burst main · 9.4 L/s loss', tone: CORAL},
      {sev: 'major', id: 'LK-021', addr: 'Milimani Rd · MIL', meta: 'Joint failure · dispatched', tone: AMBER},
      {sev: 'minor', id: 'LK-033', addr: 'Mamboleo · MYT', meta: 'Service leak · reported', tone: FLOW},
    ].map((l) => (
      <div key={l.id} className="ui-leak-card">
        <div className="ui-leak-card-top"><span className="ui-leak-pin" style={{background: l.tone}}/><div><div className="ui-leak-id">{l.id}</div><div className="ui-leak-addr">{l.addr}</div></div><span className="ui-pill" style={{color: l.tone, borderColor: l.tone}}>{l.sev}</span></div>
        <div className="ui-leak-meta">{l.meta}</div>
      </div>
    ))}
  </div>
);
