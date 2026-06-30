import { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../data/auth';
import { useTheme } from '../theme';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggle } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from || '/networks';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <button
        className="theme-toggle login-theme-toggle"
        onClick={toggle}
        title={`Switch to ${mode === 'dark' ? 'light' : 'dark'}`}
      >
        {mode === 'dark' ? '☀' : '☾'} {mode === 'dark' ? 'Light' : 'Dark'}
      </button>

      <div className="login-card">
        <div className="login-brand">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="18" fill="#1E40AF" />
            <path d="M9 20c2-4 4-7 9-7s7 3 9 7" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M9 25c2-4 4-7 9-7s7 3 9 7" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="login-brand-name">Aqua<strong>wise</strong></span>
        </div>

        <h1 className="login-title">Sign in</h1>
        <p className="login-subtitle">Water Intelligence Platform</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <label className="login-label">
            Username
            <input
              className="login-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </label>

          <label className="login-label">
            Password
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="login-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
