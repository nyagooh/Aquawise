import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building, ArrowRight } from 'lucide-react';
import { Card, CardBody } from '../components/ui';
import { useAuth } from '../lib/auth';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', organization: '', email: '', password: '' });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError('Please accept the terms to continue.'); return; }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          organization: form.organization,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.email?.[0] || data.password?.[0] || data.detail || 'Registration failed.';
        setError(msg);
        return;
      }
      login(data.access, data.refresh);
      navigate('/dashboard', { replace: true });
    } catch {
      // Demo fallback when backend is unreachable
      if (form.email && form.password.length >= 8) {
        login('demo-token', '');
        navigate('/dashboard', { replace: true });
      } else {
        setError('Could not reach the server. Use a valid email and 8+ char password to continue in demo mode.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', padding: 'var(--s4)' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--s8)' }}>
          <Link to="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s3)', marginBottom: 'var(--s4)', textDecoration: 'none' }}>
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <path d="M14 2C14 2 4 11 4 18A10 10 0 0024 18C24 11 14 2 14 2Z" fill="#3B82F6" />
              <path d="M14 9C14 9 9 14 9 18A5 5 0 0019 18C19 14 14 9 14 9Z" fill="rgba(7,23,40,0.5)" />
            </svg>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Aqua<span style={{ color: 'var(--accent)' }}>Wise</span>
            </span>
          </Link>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create an account</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 8 }}>Join the network of water quality researchers</p>
        </div>

        <Card>
          <CardBody style={{ padding: 'var(--s8)' }}>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }} onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 'var(--r-md)',
                  background: 'var(--danger-bg)', border: '1px solid var(--danger)',
                  color: 'var(--danger)', fontSize: '0.8125rem', lineHeight: 1.5,
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" className="form-control" placeholder="Jane" style={{ paddingLeft: 40 }} required value={form.firstName} onChange={set('firstName')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-control" placeholder="Doe" required value={form.lastName} onChange={set('lastName')} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Organization</label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="text" className="form-control" placeholder="University or NGO" style={{ paddingLeft: 40 }} value={form.organization} onChange={set('organization')} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="email" className="form-control" placeholder="jane.doe@example.org" style={{ paddingLeft: 40 }} required value={form.email} onChange={set('email')} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="password" className="form-control" placeholder="Minimum 8 characters" style={{ paddingLeft: 40 }} required minLength={8} value={form.password} onChange={set('password')} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <input type="checkbox" id="terms" style={{ marginTop: 4 }} checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                <label htmlFor="terms" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  I agree to the <a href="#" style={{ color: 'var(--accent)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--accent)' }}>Privacy Policy</a>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ justifyContent: 'center', padding: '12px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Creating account…' : <> Create Account <ArrowRight size={16} style={{ marginLeft: 8 }} /> </>}
              </button>
            </form>
          </CardBody>
        </Card>

        <p style={{ textAlign: 'center', marginTop: 'var(--s6)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <Link to="/home" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
