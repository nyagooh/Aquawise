import { Link } from 'react-router-dom';
import { ArrowRight, Target, Eye, Heart, Cpu, Globe, Radio, BarChart3, Layers } from 'lucide-react';

function Section({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section style={{ padding: '80px 24px', ...style }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

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

const values = [
  {
    icon: <Eye size={22} />, title: 'Transparency',
    desc: 'We make water quality data visible and understandable for everyone — utilities, governments, and communities alike.',
  },
  {
    icon: <Heart size={22} />, title: 'Community First',
    desc: 'Every feature is built with one question: does this help keep someone\'s water safer? The community we serve is always the answer.',
  },
  {
    icon: <Target size={22} />, title: 'Precision',
    desc: 'Accurate, calibrated sensor data and rigorous statistical modelling — because imprecise water quality data can cost lives.',
  },
  {
    icon: <Cpu size={22} />, title: 'Innovation',
    desc: 'We pair edge-computing IoT hardware with AI analytics and GIS intelligence to stay ahead of water quality challenges.',
  },
];

const techStack = [
  { icon: <Radio size={20} />, title: 'IoT Sensor Network', desc: 'Low-power sensors deployed at water sources, transmitting readings every minute over cellular and LoRaWAN.' },
  { icon: <Cpu size={20} />, title: 'AI & Machine Learning', desc: 'Time-series forecasting models trained on local hydrological and weather data to predict contamination 7 days ahead.' },
  { icon: <Globe size={20} />, title: 'GIS Integration', desc: 'Interactive spatial maps built on Leaflet and OpenStreetMap, overlaying sensor locations, contamination events, and risk zones.' },
  { icon: <BarChart3 size={20} />, title: 'Analytics Engine', desc: 'WHO-threshold compliance scoring, statistical distributions, and weekly aggregation — all computed server-side and ready for export.' },
  { icon: <Layers size={20} />, title: 'Open REST API', desc: 'Every data point accessible via a documented API. Integrate AquaWise with your existing SCADA, GIS, or ERP systems.' },
];

const team = [
  { initials: 'NK', name: 'Nyagooh Karucha', role: 'Co-Founder & CTO', bg: 'linear-gradient(135deg, #2563EB, #8B5CF6)' },
  { initials: 'TA', name: 'Tomlee Abila', role: 'Co-Founder & CEO', bg: 'linear-gradient(135deg, #059669, #2563EB)' },
  { initials: 'AM', name: 'Ann Maina', role: 'Head of Data Science', bg: 'linear-gradient(135deg, #D97706, #EF4444)' },
];

export default function About() {
  return (
    <>
      {/* ── Hero ── */}
      <section style={{ padding: '90px 24px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.15), transparent 65%)',
        }} />
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <span style={{
            display: 'inline-block', fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--accent-bright)', marginBottom: 20,
            background: 'var(--accent-glow)', padding: '4px 12px',
            borderRadius: 'var(--r-full)', border: '1px solid var(--border-glow)',
          }}>
            Our Story
          </span>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900,
            letterSpacing: '-0.04em', lineHeight: 1.12, marginBottom: 24,
          }}>
            Clean water is a<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--accent-bright), var(--accent-cyan))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              human right
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            AquaWise was born in Kisumu, Kenya — one of the cities where water quality directly determines whether a family's day begins with safety or uncertainty. We built the platform we wished existed: one that combines the best of sensor technology, AI, and accessible design to give every water utility the intelligence it needs.
          </p>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <Section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--r-xl)', padding: '36px 32px',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--r-lg)',
              background: 'var(--accent-glow)', border: '1px solid var(--border-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-bright)', marginBottom: 20,
            }}>
              <Target size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 14 }}>Our Mission</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.9375rem' }}>
              To make world-class water quality monitoring accessible to every utility, NGO, and enterprise — regardless of size, budget, or technical capacity. We do this by combining affordable IoT hardware with powerful cloud analytics and an interface that anyone can use.
            </p>
          </div>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--r-xl)', padding: '36px 32px',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--r-lg)',
              background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-cyan)', marginBottom: 20,
            }}>
              <Eye size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 14 }}>Our Vision</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.9375rem' }}>
              A world where no community suffers from a preventable water quality crisis. We envision a globally connected smart water grid where AI-powered monitoring systems act as invisible guardians — detecting threats before they reach a single household.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Values ── */}
      <Section>
        <SectionHead
          eyebrow="What We Stand For"
          title="Principles that guide every decision"
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {values.map(v => (
            <div key={v.title} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--r-xl)', padding: '28px 24px',
              transition: 'all var(--t-base)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-glow)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--r-lg)',
                background: 'var(--accent-glow)', border: '1px solid var(--border-glow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-bright)', marginBottom: 16,
              }}>
                {v.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10 }}>{v.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Technology ── */}
      <Section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <SectionHead
          eyebrow="Technology"
          title="A full-stack water intelligence platform"
          body="From edge sensor to cloud dashboard, AquaWise is an end-to-end system — each layer engineered to be reliable, scalable, and open."
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {techStack.map((t, i) => (
            <div key={t.title} style={{
              display: 'flex', alignItems: 'flex-start', gap: 20,
              background: 'var(--bg-card)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--r-lg)', padding: '22px 24px',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--r-lg)', flexShrink: 0,
                background: 'var(--accent-glow)', border: '1px solid var(--border-glow)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-bright)',
              }}>
                {t.icon}
              </div>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>{t.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Team ── */}
      <Section>
        <SectionHead
          eyebrow="The Team"
          title="Built by engineers who care about water"
        />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          {team.map(member => (
            <div key={member.name} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--r-xl)', padding: '32px 28px',
              textAlign: 'center', minWidth: 200, maxWidth: 240,
              transition: 'all var(--t-base)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-glow)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = 'none'; }}
            >
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: member.bg, margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.375rem', fontWeight: 800, color: '#fff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}>
                {member.initials}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>{member.name}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--accent-bright)', fontWeight: 500 }}>{member.role}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── CTA ── */}
      <section style={{ padding: '72px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 18 }}>
            Ready to join the mission?
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.7 }}>
            Whether you're a water utility, environmental NGO, or enterprise, AquaWise has a plan for you.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
              color: 'var(--on-accent)', textDecoration: 'none', fontWeight: 700,
              fontSize: '0.9rem', padding: '11px 24px', borderRadius: 'var(--r-md)',
              boxShadow: '0 4px 16px var(--accent-glow)',
            }}>
              Get Started <ArrowRight size={16} />
            </Link>
            <Link to="/contact" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--bg-card)', color: 'var(--text-primary)',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
              padding: '11px 24px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border-strong)',
            }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
