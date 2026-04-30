import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Card, CardBody } from '../components/ui';
import { useAuth } from '../lib/auth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || data.error || 'Invalid email or password.');
        return;
      }
      login(data.access);
      navigate('/dashboard', { replace: true });
    } catch {
      // Backend unreachable — allow demo login so the UI is still usable
      if (email && password.length >= 6) {
        login('demo-token');
        navigate('/dashboard', { replace: true });
      } else {
        setError('Could not reach the server. Enter any email and a password of 6+ chars to continue in demo mode.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', padding: 'var(--s4)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
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
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Welcome back</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 8 }}>Enter your credentials to access your dashboard</p>
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

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email" className="form-control" placeholder="name@company.com"
                    style={{ paddingLeft: 40 }} required
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                  <a href="#" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 500 }}>Forgot password?</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password" className="form-control" placeholder="••••••••"
                    style={{ paddingLeft: 40 }} required
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ justifyContent: 'center', padding: '12px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Signing in…' : <> Sign In <ArrowRight size={16} style={{ marginLeft: 8 }} /> </>}
              </button>
            </form>
          </CardBody>
        </Card>

        <p style={{ textAlign: 'center', marginTop: 'var(--s6)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create an account</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <Link to="/home" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
