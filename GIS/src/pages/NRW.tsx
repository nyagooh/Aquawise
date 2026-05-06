import { useNavigate } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { zones } from '../data';

export default function NRW() {
  const navigate = useNavigate();
  const ranked = [...zones].sort((a, b) => b.loss - a.loss);
  const max = Math.max(...ranked.map(z => z.loss));
  const color = (loss: number) => loss >= 20 ? 'hsl(var(--danger))' : loss >= 15 ? 'hsl(var(--warning))' : 'hsl(var(--safe))';

  return (
    <Shell active="nrw" title="Non-Revenue Water" sub="Loss tracking · click a zone to drill into the map">
      <section className="kpi-grid">
        <div className="kpi kpi-danger">
          <div className="kpi-label">Estimated loss today</div>
          <div className="kpi-value">142<span className="kpi-unit">m³</span></div>
          <div className="kpi-trend down">▲ 12% vs 7-day avg</div>
        </div>
        <div className="kpi kpi-warn">
          <div className="kpi-label">NRW ratio</div>
          <div className="kpi-value">12<span className="kpi-unit">%</span></div>
          <div className="kpi-trend down">▲ 2.4 pp</div>
        </div>
        <div className="kpi kpi-accent">
          <div className="kpi-label">Worst zone</div>
          <div className="kpi-value" style={{ fontSize: '1.25rem' }}>Zone D</div>
          <div className="kpi-trend flat" style={{ color: 'hsl(var(--danger))' }}>27% loss</div>
        </div>
        <div className="kpi kpi-safe">
          <div className="kpi-label">Trend (30d)</div>
          <div className="kpi-value">−3.1<span className="kpi-unit">pp</span></div>
          <div className="kpi-trend up">Improving</div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--s5)' }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">NRW trend</div>
              <div className="card-sub">Last 30 days · daily loss as % of input volume</div>
            </div>
          </div>
          <div style={{ height: 280, padding: 'var(--s4)' }}>
            <svg viewBox="0 0 700 240" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <line x1={0} y1={60} x2={700} y2={60} stroke="rgba(255,255,255,0.04)" />
              <line x1={0} y1={120} x2={700} y2={120} stroke="rgba(255,255,255,0.04)" />
              <line x1={0} y1={180} x2={700} y2={180} stroke="rgba(255,255,255,0.04)" />
              <text x={6} y={58} fill="#64748B" fontSize={10} fontFamily="JetBrains Mono">20%</text>
              <text x={6} y={118} fill="#64748B" fontSize={10} fontFamily="JetBrains Mono">15%</text>
              <text x={6} y={178} fill="#64748B" fontSize={10} fontFamily="JetBrains Mono">10%</text>
              <line x1={0} y1={120} x2={700} y2={120} stroke="rgba(245,158,11,0.5)" strokeWidth={1} strokeDasharray="4 4" />
              <text x={640} y={116} fill="#F59E0B" fontSize={10} fontFamily="JetBrains Mono">target 15%</text>
              <path
                d="M 30 130 L 70 110 L 110 125 L 150 100 L 190 95 L 230 115 L 270 90 L 310 80 L 350 105 L 390 85 L 430 70 L 470 95 L 510 110 L 550 95 L 590 75 L 630 90 L 670 110 L 670 240 L 30 240 Z"
                fill="rgba(37,99,235,0.18)"
              />
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth={2.5}
                points="30,130 70,110 110,125 150,100 190,95 230,115 270,90 310,80 350,105 390,85 430,70 470,95 510,110 550,95 590,75 630,90 670,110"
              />
              <circle cx={670} cy={110} r={5} fill="#3B82F6" stroke="#fff" strokeWidth={2} />
            </svg>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Insights</div>
              <div className="card-sub">Auto-generated from telemetry</div>
            </div>
          </div>
          <div style={{ padding: 'var(--s5)', display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
            <Insight tone="crit">
              <strong>Zone D loss spike:</strong> 27% loss vs 9% baseline. Pressure dropped to 1.4 bar at PR-03 — likely main-line leak between P-104 and P-107.
            </Insight>
            <Insight tone="warn">
              <strong>Zone B trending up:</strong> NRW rose from 14% to 18% over 4 days. Consider pressure-management run.
            </Insight>
            <Insight tone="info">
              <strong>Zone C improving:</strong> Loss down to 9% after pressure rebalance on Apr 28.
            </Insight>
            <Insight tone="info">
              <strong>Network input:</strong> 1,184 m³ today · 1,042 m³ billed · 142 m³ loss.
            </Insight>
          </div>
        </div>
      </section>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Zones ranked by loss</div>
            <div className="card-sub">Click a zone to highlight it on the GIS map</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/gis')}>Open GIS →</button>
        </div>
        <div>
          {ranked.map(z => (
            <div
              key={z.id}
              onClick={() => navigate(`/gis?focus=zone:${z.id}`)}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 60px',
                gap: 'var(--s3)',
                alignItems: 'center',
                padding: '12px var(--s5)',
                borderBottom: '1px solid hsl(var(--border))',
                cursor: 'pointer'
              }}
            >
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{z.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>
                  {z.people.toLocaleString()} people · {z.pressure} bar
                </div>
              </div>
              <div style={{
                height: 8,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 'var(--r-full)',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(z.loss / max) * 100}%`,
                  background: color(z.loss),
                  borderRadius: 'var(--r-full)'
                }} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700, textAlign: 'right', color: color(z.loss) }}>
                {z.loss}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function Insight({ tone, children }: { tone: 'crit' | 'warn' | 'info'; children: React.ReactNode }) {
  const styles = {
    crit: { borderLeft: '3px solid hsl(var(--danger))',  background: 'rgba(239,68,68,0.08)' },
    warn: { borderLeft: '3px solid hsl(var(--warning))', background: 'rgba(245,158,11,0.06)' },
    info: { borderLeft: '3px solid hsl(var(--primary))',  background: 'rgba(37,99,235,0.06)' }
  }[tone];
  return (
    <div style={{
      padding: 'var(--s3) var(--s4)',
      borderRadius: 'var(--r-md)',
      fontSize: '0.875rem',
      lineHeight: 1.5,
      ...styles
    }}>
      {children}
    </div>
  );
}
