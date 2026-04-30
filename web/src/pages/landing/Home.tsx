import { Link } from 'react-router-dom';
import {
  Activity, AlertTriangle, BarChart3, Globe, Layers,
  MapPin, Radio, Shield, TrendingUp, Zap, ChevronRight,
  CheckCircle, ArrowRight,
} from 'lucide-react';

/* ── Reusable section wrapper ── */
function Section({ children, style = {}, id }: { children: React.ReactNode; style?: React.CSSProperties; id?: string }) {
  return (
    <section id={id} style={{ padding: '80px 24px', ...style }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

/* ── Section heading block ── */
function SectionHead({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 56 }}>
      <span style={{
        display: 'inline-block', fontSize: '0.75rem', fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--accent-bright)', marginBottom: 14,
        background: 'var(--accent-glow)', padding: '4px 12px',
        borderRadius: 'var(--r-full)', border: '1px solid var(--border-glow)',
      }}>
        {eyebrow}
      </span>
      <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.18, marginBottom: 18 }}>
        {title}
      </h2>
      {body && (
        <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
          {body}
        </p>
      )}
    </div>
  );
}

/* ── Feature card ── */
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--r-xl)', padding: '28px 24px',
      transition: 'all var(--t-base)',
      boxShadow: 'var(--shadow-card)',
      position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.borderColor = 'var(--border-glow)';
        el.style.boxShadow = 'var(--shadow-glow)';
        el.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.borderColor = 'var(--border-default)';
        el.style.boxShadow = 'var(--shadow-card)';
        el.style.transform = 'none';
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--r-lg)',
        background: 'var(--accent-glow)', border: '1px solid var(--border-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18, color: 'var(--accent-bright)',
      }}>
        {icon}
      </div>
      <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10, color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--accent-bright)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 8 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

/* ── Step card ── */
function StepCard({ num, icon, title, desc }: { num: number; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 8px' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 'var(--r-xl)',
        background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', color: '#fff',
        boxShadow: '0 8px 24px var(--accent-glow)',
      }}>
        {icon}
      </div>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-bright)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
        Step {num}
      </div>
      <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: 10 }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
}

export default function Home() {
  const features = [
    {
      icon: <Activity size={22} />, title: 'Real-Time Monitoring',
      desc: 'Six water quality parameters — temperature, turbidity, pH, dissolved oxygen, conductivity, and nitrates — captured every minute across your entire network.',
    },
    {
      icon: <TrendingUp size={22} />, title: 'AI-Powered Predictions',
      desc: 'Machine learning models forecast contamination risk up to 7 days ahead, giving you time to act before problems escalate to a crisis.',
    },
    {
      icon: <Globe size={22} />, title: 'GIS Mapping',
      desc: 'Visualise every sensor, water source, and contamination event on an interactive map. Spot spatial patterns in seconds, not hours.',
    },
    {
      icon: <AlertTriangle size={22} />, title: 'Smart Alerts',
      desc: 'Instant push, email, and SMS notifications the moment any parameter crosses its WHO-recommended threshold — with full context on severity and recommended action.',
    },
    {
      icon: <BarChart3 size={22} />, title: 'Analytics & Reporting',
      desc: 'Deep-dive compliance timelines, statistical distributions, and weekly trend reports. Export to CSV or share dashboards with stakeholders.',
    },
    {
      icon: <Layers size={22} />, title: 'Historical Data',
      desc: 'Upload legacy CSV datasets to back-fill your time-series. Blend historical records with live sensor streams for full-spectrum analysis.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Active Sensors', sub: 'across Kisumu' },
    { value: '99.9%', label: 'Uptime', sub: 'guaranteed SLA' },
    { value: '<90s', label: 'Alert Latency', sub: 'threshold breach to notify' },
    { value: '7-Day', label: 'Forecast Horizon', sub: 'AI contamination risk' },
  ];

  const benefits = [
    'WHO-calibrated safe thresholds out of the box',
    'Deploy new sensors in under 10 minutes',
    'No vendor lock-in — open REST API',
    'Role-based access for large utility teams',
    'Dark / light dashboard themes',
    'Multi-region multi-source support',
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section style={{
        padding: '100px 24px 90px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative blobs */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(37,99,235,0.18), transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', top: '20%', right: '-10%', width: 500, height: 500,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 820, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          {/* eyebrow badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--accent-glow)', border: '1px solid var(--border-glow)',
            borderRadius: 'var(--r-full)', padding: '6px 16px', marginBottom: 28,
          }}>
            <Radio size={13} color="var(--accent-bright)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-bright)' }}>
              Live across Kisumu, Kenya
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1,
            marginBottom: 24,
          }}>
            Real-Time Intelligence<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--accent-bright), var(--accent-cyan))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              for Safer Water
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'var(--text-secondary)', lineHeight: 1.75,
            marginBottom: 40, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto',
          }}>
            AquaWise monitors water quality across your sensor network — detecting threats before they become crises — so every community gets clean, safe water every day.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
              color: 'var(--on-accent)', textDecoration: 'none',
              fontWeight: 700, fontSize: '0.9375rem',
              padding: '13px 28px', borderRadius: 'var(--r-md)',
              boxShadow: '0 6px 20px var(--accent-glow)',
              transition: 'all var(--t-fast)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px var(--accent-glow)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px var(--accent-glow)'; }}
            >
              Get Started Free <ArrowRight size={17} />
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-card)', color: 'var(--text-primary)', textDecoration: 'none',
              fontWeight: 600, fontSize: '0.9375rem',
              padding: '13px 28px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border-strong)',
              transition: 'all var(--t-fast)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-glow)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'none'; }}
            >
              View Dashboard <ChevronRight size={17} />
            </Link>
          </div>

          {/* Trust note */}
          <p style={{ marginTop: 28, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Trusted by KIWASCO · No credit card required
          </p>
        </div>

        {/* Dashboard preview card */}
        <div style={{ maxWidth: 900, margin: '56px auto 0', position: 'relative' }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--r-2xl)', padding: '20px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['#EF4444','#F59E0B','#22C55E'].map(c => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {[
                { label: 'pH Level', val: '7.2', unit: 'pH', safe: true },
                { label: 'Turbidity', val: '3.1', unit: 'NTU', safe: true },
                { label: 'Temperature', val: '24.8', unit: '°C', safe: true },
                { label: 'Dissolved O₂', val: '7.9', unit: 'mg/L', safe: true },
                { label: 'Conductivity', val: '412', unit: 'µS/cm', safe: true },
                { label: 'Nitrates', val: '4.2', unit: 'mg/L', safe: true },
              ].map(({ label, val, unit, safe }) => (
                <div key={label} style={{
                  background: 'var(--bg-elevated)', borderRadius: 'var(--r-lg)',
                  padding: '14px 16px', border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>{val}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{unit}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: safe ? 'var(--safe)' : 'var(--danger)' }} />
                    <span style={{ fontSize: '0.6875rem', color: safe ? 'var(--safe)' : 'var(--danger)', fontWeight: 600 }}>
                      {safe ? 'Safe' : 'Alert'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{ padding: '48px 24px', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40 }}>
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── Features ── */}
      <Section id="features" style={{ paddingTop: 96 }}>
        <SectionHead
          eyebrow="Platform Capabilities"
          title="Everything you need to protect water quality"
          body="A complete monitoring platform that combines IoT hardware, AI analytics, and a powerful dashboard — all in one."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {features.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </Section>

      {/* ── How It Works ── */}
      <Section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <SectionHead
          eyebrow="How It Works"
          title="From sensor to action in three steps"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 48 }}>
          <StepCard
            num={1} icon={<Radio size={24} />}
            title="Deploy Sensors"
            desc="Install IoT sensors at water sources. They auto-register and begin streaming data in under 10 minutes — no manual configuration needed."
          />
          <StepCard
            num={2} icon={<Activity size={24} />}
            title="Monitor Live"
            desc="Six water quality parameters stream to your dashboard in real time. The GIS map shows every sensor's status at a glance."
          />
          <StepCard
            num={3} icon={<Zap size={24} />}
            title="Act on Insights"
            desc="Receive immediate alerts with context, AI-generated risk forecasts, and recommended actions — before any community is harmed."
          />
        </div>
      </Section>

      {/* ── Benefits list ── */}
      <Section>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <span style={{
              display: 'inline-block', fontSize: '0.75rem', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--accent-bright)', marginBottom: 14,
              background: 'var(--accent-glow)', padding: '4px 12px',
              borderRadius: 'var(--r-full)', border: '1px solid var(--border-glow)',
            }}>
              Why AquaWise
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 20 }}>
              Built for water utilities,<br />NGOs, and enterprises
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 32 }}>
              AquaWise was designed from the ground up for real-world water management — from small NGO deployments monitoring a single borehole to city-wide utility networks with hundreds of sensors.
            </p>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
              color: 'var(--on-accent)', textDecoration: 'none', fontWeight: 700,
              fontSize: '0.9rem', padding: '11px 24px', borderRadius: 'var(--r-md)',
              boxShadow: '0 4px 16px var(--accent-glow)',
            }}>
              Start free trial <ArrowRight size={16} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {benefits.map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircle size={18} color="var(--safe)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Use cases ── */}
      <Section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <SectionHead
          eyebrow="Use Cases"
          title="Protecting every type of water source"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {[
            { icon: <MapPin size={20} />, title: 'Lake & River Monitoring', desc: 'Continuous quality surveillance at intake points for surface water utilities — Dunga Beach, Ahero Canal, and beyond.' },
            { icon: <Shield size={20} />, title: 'Wetland Protection', desc: 'Early warning for E. coli and nitrate intrusions at sensitive ecological zones like Nyalenda Wetland.' },
            { icon: <Globe size={20} />, title: 'Municipal Water Points', desc: 'Track pH and conductivity fluctuations at urban distribution points, catching pipe corrosion before it affects residents.' },
            { icon: <Activity size={20} />, title: 'Agricultural Canals', desc: 'Monitor irrigation channels during planting seasons when fertiliser runoff elevates turbidity and nitrate levels.' },
          ].map(card => (
            <div key={card.title} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--r-xl)', padding: '24px 22px',
            }}>
              <div style={{ color: 'var(--accent-bright)', marginBottom: 14 }}>{card.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>{card.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0D1E4A 0%, #1A1040 100%)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--r-2xl)', padding: 'clamp(40px, 6vw, 72px)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(37,99,235,0.22), transparent 65%)',
            }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 18, color: '#F1F5F9' }}>
                Ready to protect your<br />community's water?
              </h2>
              <p style={{ fontSize: '1.0625rem', color: 'rgba(241,245,249,0.7)', marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
                Join utilities, NGOs, and enterprises already using AquaWise to keep water safe — and communities healthy.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(135deg, var(--accent-bright), var(--accent))',
                  color: '#fff', textDecoration: 'none', fontWeight: 700,
                  fontSize: '0.9375rem', padding: '13px 28px', borderRadius: 'var(--r-md)',
                  boxShadow: '0 8px 28px rgba(37,99,235,0.4)',
                }}>
                  Get Started Free <ArrowRight size={17} />
                </Link>
                <Link to="/contact" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.08)', color: '#F1F5F9',
                  textDecoration: 'none', fontWeight: 600, fontSize: '0.9375rem',
                  padding: '13px 28px', borderRadius: 'var(--r-md)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}>
                  Talk to Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
