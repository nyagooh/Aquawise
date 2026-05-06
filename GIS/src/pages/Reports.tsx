import { useState } from 'react';
import { Shell } from '../components/Shell';

type ReportType = 'daily' | 'weekly' | 'monthly';

const SUBS: Record<ReportType, string> = {
  daily:   'Daily report · last 24 hours',
  weekly:  'Weekly report · last 7 days',
  monthly: 'Monthly report · last 30 days'
};

export default function Reports() {
  const [type, setType] = useState<ReportType>('daily');

  return (
    <Shell active="reports" title="Reports" sub="Generate, preview and download network reports">
      <section>
        <div style={{
          marginBottom: 'var(--s3)',
          fontSize: '0.6875rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: 'hsl(var(--muted-foreground))'
        }}>Choose report type</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s4)' }}>
          <ReportTypeCard
            selected={type === 'daily'}
            onClick={() => setType('daily')}
            icon={<><circle cx={12} cy={12} r={10} /><polyline points="12 6 12 12 16 14" /></>}
            title="Daily report"
            sub="Past 24 hours · alerts, sensor uptime, pressure summary"
          />
          <ReportTypeCard
            selected={type === 'weekly'}
            onClick={() => setType('weekly')}
            icon={<><rect x={3} y={4} width={18} height={18} rx={2} /><line x1={16} y1={2} x2={16} y2={6} /><line x1={8} y1={2} x2={8} y2={6} /></>}
            title="Weekly report"
            sub="7-day rollup · NRW trend, zone performance, asset summary"
          />
          <ReportTypeCard
            selected={type === 'monthly'}
            onClick={() => setType('monthly')}
            icon={<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></>}
            title="Monthly report"
            sub="Full month with charts, regulatory-style summary, PDF-ready"
          />
        </div>
      </section>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Report configuration</div>
            <div className="card-sub">{SUBS[type]}</div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--s2)' }}>
            <button className="btn btn-ghost btn-sm">Export CSV</button>
            <button className="btn btn-primary btn-sm">
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1={12} y1={15} x2={12} y2={3} />
              </svg>
              Download PDF
            </button>
          </div>
        </div>
        <div style={{
          display: 'flex', gap: 'var(--s3)',
          padding: 'var(--s3) var(--s5)',
          borderBottom: '1px solid hsl(var(--border))',
          alignItems: 'center', flexWrap: 'wrap'
        }}>
          <ConfigLabel>From</ConfigLabel>
          <ConfigInput type="date" defaultValue="2026-05-05" />
          <ConfigLabel>To</ConfigLabel>
          <ConfigInput type="date" defaultValue="2026-05-06" />
          <ConfigLabel>Zones</ConfigLabel>
          <select className="config-select" style={configInputStyle}>
            <option>All zones</option>
            <option>Zone A — Westlands</option>
            <option>Zone B — Kileleshwa</option>
            <option>Zone C — Lavington</option>
            <option>Zone D — Karen</option>
            <option>Zone E — Industrial</option>
          </select>
        </div>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--s5)' }}>
        <div className="card">
          <div className="card-head"><div className="card-title">Network performance</div></div>

          <PreviewSection title="Alerts">
            <StatRow label="Total alerts" value="6" />
            <StatRow label="Critical" value="1" color="hsl(var(--danger))" />
            <StatRow label="Warnings" value="3" color="hsl(var(--warning))" />
            <StatRow label="Resolved" value="2" color="hsl(var(--safe))" />
            <StatRow label="Mean time to acknowledge" value="4m 22s" />
          </PreviewSection>

          <PreviewSection title="Zones affected">
            <StatRow label="Zone D — Karen" value="2 active" color="hsl(var(--danger))" />
            <StatRow label="Zone B — Kileleshwa" value="1 active" color="hsl(var(--warning))" />
            <StatRow label="Zone C — Lavington" value="1 info" color="hsl(var(--primary))" />
            <StatRow label="Zones healthy" value="3 / 5" color="hsl(var(--safe))" />
          </PreviewSection>

          <PreviewSection title="Estimated water loss">
            <StatRow label="Input volume" value="1,184 m³" />
            <StatRow label="Billed volume" value="1,042 m³" />
            <StatRow label="NRW (loss)" value="142 m³ · 12%" color="hsl(var(--warning))" />
            <StatRow label="Worst zone" value="Zone D · 27%" color="hsl(var(--danger))" />
          </PreviewSection>

          <PreviewSection title="Sensor uptime">
            <StatRow label="Online" value="9 / 10 · 90%" color="hsl(var(--safe))" />
            <StatRow label="Average reporting interval" value="14 s" />
            <StatRow label="Offline events" value="1 (PH-03)" />
            <StatRow label="Data points captured" value="61,824" />
          </PreviewSection>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Asset summary</div>
            <div className="card-sub">Inventory snapshot</div>
          </div>

          <PreviewSection title="Pipes">
            <StatRow label="Total segments" value="142" />
            <StatRow label="Total length" value="38.6 km" />
            <StatRow label="Avg diameter" value="180 mm" />
          </PreviewSection>

          <PreviewSection title="Pipe types">
            <PipeTypeBar label="PVC" value={64} pct={45} />
            <PipeTypeBar label="HDPE" value={52} pct={37} />
            <PipeTypeBar label="DI" value={26} pct={18} />
          </PreviewSection>

          <PreviewSection title="Sensors">
            <StatRow label="Pressure" value="4" />
            <StatRow label="Level" value="3" />
            <StatRow label="pH" value="3" />
            <StatRow label="Total deployed" value="10" />
          </PreviewSection>

          <PreviewSection title="Coverage">
            <StatRow label="Zones covered" value="5 / 5" />
            <StatRow label="Tanks monitored" value="3" />
            <StatRow label="People served" value="86,200" />
          </PreviewSection>
        </div>
      </section>
    </Shell>
  );
}

const configInputStyle: React.CSSProperties = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 'var(--r-md)',
  color: 'hsl(var(--foreground))',
  padding: '8px 12px',
  fontFamily: 'inherit',
  fontSize: '0.8125rem'
};

function ConfigLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: '0.75rem',
      color: 'hsl(var(--muted-foreground))',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em'
    }}>{children}</span>
  );
}
function ConfigInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={configInputStyle} />;
}

function ReportTypeCard({ selected, onClick, icon, title, sub }: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 'var(--s5)',
        borderRadius: 'var(--r-xl)',
        background: selected
          ? 'linear-gradient(180deg, rgba(37,99,235,0.10), hsl(var(--card)))'
          : 'hsl(var(--card))',
        border: selected ? '1px solid rgba(37,99,235,0.6)' : '1px solid hsl(var(--border))',
        cursor: 'pointer',
        boxShadow: selected ? 'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(37,99,235,0.4)' : undefined,
        transition: 'all 150ms ease'
      }}
    >
      <div style={{
        width: 40, height: 40,
        borderRadius: 'var(--r-md)',
        background: 'rgba(37,99,235,0.12)',
        border: '1px solid rgba(37,99,235,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'hsl(var(--primary))',
        marginBottom: 'var(--s3)'
      }}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>{icon}</svg>
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: 'var(--s5)',
      borderBottom: '1px solid hsl(var(--border))'
    }}>
      <h4 style={{
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'hsl(var(--muted-foreground))',
        margin: '0 0 var(--s3)'
      }}>{title}</h4>
      {children}
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid hsl(var(--border))',
      fontSize: '0.875rem'
    }}>
      <span style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color }}>{value}</span>
    </div>
  );
}

function PipeTypeBar({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '50px 1fr 50px',
      gap: 'var(--s3)',
      alignItems: 'center',
      fontSize: '0.8125rem',
      marginBottom: 8
    }}>
      <span style={{ fontWeight: 600 }}>{label}</span>
      <div style={{
        height: 6,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 'var(--r-full)',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)))',
          borderRadius: 'var(--r-full)'
        }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', textAlign: 'right', color: 'hsl(var(--muted-foreground))' }}>{value}</span>
    </div>
  );
}
