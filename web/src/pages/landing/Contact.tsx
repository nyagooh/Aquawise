import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare, Building2, User } from 'lucide-react';

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 44, height: 44, flexShrink: 0, borderRadius: 'var(--r-lg)',
        background: 'var(--accent-glow)', border: '1px solid var(--border-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent-bright)',
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  );
}

const subjects = [
  'General Inquiry',
  'Sales & Pricing',
  'Technical Support',
  'Partnership',
  'Press & Media',
  'Other',
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', organization: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--r-md)',
    background: 'var(--bg-input)', border: '1px solid var(--border-default)',
    color: 'var(--text-primary)', fontSize: '0.9rem',
    outline: 'none', transition: 'border-color var(--t-fast)',
    fontFamily: 'var(--font)',
  };

  return (
    <>
      {/* ── Hero ── */}
      <section style={{ padding: '90px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 45% at 50% -5%, rgba(37,99,235,0.14), transparent 65%)',
        }} />
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <span style={{
            display: 'inline-block', fontSize: '0.75rem', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--accent-bright)', marginBottom: 18,
            background: 'var(--accent-glow)', padding: '4px 12px',
            borderRadius: 'var(--r-full)', border: '1px solid var(--border-glow)',
          }}>
            Get In Touch
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 18 }}>
            We'd love to hear<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--accent-bright), var(--accent-cyan))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              from you
            </span>
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Whether you have a question about pricing, features, or want to explore a partnership — our team is ready to answer.
          </p>
        </div>
      </section>

      {/* ── Main content ── */}
      <section style={{ padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.7fr', gap: 40, alignItems: 'start' }}>

          {/* ── Left: Contact info ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--r-xl)', padding: '32px 28px',
            }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 28 }}>Contact Information</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <InfoItem icon={<MapPin size={20} />} label="Location" value="Kisumu, Kenya" />
                <InfoItem icon={<Mail size={20} />} label="Email" value="hello@aquawise.io" />
                <InfoItem icon={<Phone size={20} />} label="Phone" value="+254 700 000 000" />
                <InfoItem icon={<MessageSquare size={20} />} label="Support" value="support@aquawise.io" />
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--r-xl)', padding: '28px',
            }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Office Hours</h3>
              {[
                { day: 'Monday – Friday', hours: '8:00 AM – 6:00 PM EAT' },
                { day: 'Saturday', hours: '9:00 AM – 1:00 PM EAT' },
                { day: 'Sunday', hours: 'Closed' },
              ].map(({ day, hours }) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{day}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{hours}</span>
                </div>
              ))}
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(139,92,246,0.08))',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--r-xl)', padding: '24px',
            }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 8, color: 'var(--accent-bright)' }}>
                Need urgent support?
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 14 }}>
                For critical water quality alerts or sensor issues, our on-call technical team is available 24/7.
              </p>
              <a href="mailto:urgent@aquawise.io" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-bright)',
                textDecoration: 'none',
              }}>
                urgent@aquawise.io →
              </a>
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-default)',
            borderRadius: 'var(--r-xl)', padding: '40px 36px',
          }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px', color: 'var(--safe)',
                }}>
                  <CheckCircle size={36} />
                </div>
                <h2 style={{ fontWeight: 800, fontSize: '1.375rem', marginBottom: 12 }}>Message sent!</h2>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 28px' }}>
                  Thanks for reaching out. We'll get back to you within 1–2 business days.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', organization: '', subject: '', message: '' }); }}
                  style={{
                    padding: '10px 22px', borderRadius: 'var(--r-md)',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                  }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: 6 }}>Send us a message</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 32 }}>
                  Fill out the form and we'll respond as quickly as possible.
                </p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>
                        Full Name *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                          required type="text" placeholder="Jane Doe"
                          value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          style={{ ...inputStyle, paddingLeft: 36 }}
                          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                          onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>
                        Email Address *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                          required type="email" placeholder="jane@company.com"
                          value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          style={{ ...inputStyle, paddingLeft: 36 }}
                          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                          onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>
                      Organization
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                      <input
                        type="text" placeholder="KIWASCO, WWF, City of Kisumu..."
                        value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                        style={{ ...inputStyle, paddingLeft: 36 }}
                        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>
                      Subject *
                    </label>
                    <select
                      required
                      value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
                    >
                      <option value="">Select a subject…</option>
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>
                      Message *
                    </label>
                    <textarea
                      required rows={5}
                      placeholder="Tell us about your water monitoring needs, the scale of your network, any specific challenges you're facing..."
                      value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                      onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: loading ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
                      color: loading ? 'var(--text-muted)' : 'var(--on-accent)',
                      border: 'none', borderRadius: 'var(--r-md)',
                      padding: '13px 28px', fontWeight: 700, fontSize: '0.9375rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: loading ? 'none' : '0 4px 16px var(--accent-glow)',
                      transition: 'all var(--t-fast)',
                    }}
                  >
                    {loading ? 'Sending…' : (<>Send Message <Send size={16} /></>)}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ teaser ── */}
      <section style={{ padding: '48px 24px 80px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.375rem', marginBottom: 28, textAlign: 'center' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { q: 'How quickly can I get started?', a: 'New accounts are provisioned instantly. Once you install your first sensor, data appears on the dashboard within 5 minutes.' },
              { q: 'What sensor hardware does AquaWise support?', a: 'AquaWise works with any sensor that can POST JSON over HTTP or MQTT. We provide reference designs for Arduino and ESP32 deployments.' },
              { q: 'Is there an on-premise deployment option?', a: 'Yes — contact our enterprise team for self-hosted deployment on your own infrastructure with full data sovereignty.' },
              { q: 'How does the AI forecasting work?', a: 'Our models are trained on historical water quality data combined with local weather patterns. Forecasts update every 6 hours and project 7 days ahead.' },
            ].map(({ q, a }) => (
              <details key={q} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                borderRadius: 'var(--r-lg)', overflow: 'hidden',
              }}>
                <summary style={{
                  padding: '16px 20px', fontWeight: 600, fontSize: '0.9375rem',
                  cursor: 'pointer', listStyle: 'none', userSelect: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  {q}
                  <span style={{ color: 'var(--accent-bright)', fontSize: '1.2rem', lineHeight: 1 }}>+</span>
                </summary>
                <div style={{ padding: '0 20px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, borderTop: '1px solid var(--border-subtle)' }}>
                  <p style={{ paddingTop: 14 }}>{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
