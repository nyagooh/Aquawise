import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../data/auth';
import { useTheme } from '../theme';

export default function Register() {
  const navigate = useNavigate();
  const { mode, toggle } = useTheme();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    organisation_name: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        organisation_name: form.organisation_name,
      });
      navigate('/networks', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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

      <div className="login-card" style={{ maxWidth: 420 }}>
        <div className="login-brand">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="18" fill="#1E40AF" />
            <path d="M9 20c2-4 4-7 9-7s7 3 9 7" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M9 25c2-4 4-7 9-7s7 3 9 7" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="login-brand-name">Aqua<strong>wise</strong></span>
        </div>

        <h1 className="login-title">Create account</h1>
        <p className="login-subtitle">Set up your water utility workspace</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="login-row">
            <label className="login-label">
              First name
              <input className="login-input" type="text" value={form.first_name} onChange={set('first_name')} autoComplete="given-name" />
            </label>
            <label className="login-label">
              Last name
              <input className="login-input" type="text" value={form.last_name} onChange={set('last_name')} autoComplete="family-name" />
            </label>
          </div>

          <label className="login-label">
            Username <span className="login-required">*</span>
            <input className="login-input" type="text" value={form.username} onChange={set('username')} autoComplete="username" required minLength={3} />
          </label>

          <label className="login-label">
            Email <span className="login-required">*</span>
            <input className="login-input" type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
          </label>

          <label className="login-label">
            Organisation / Utility name <span className="login-required">*</span>
            <input className="login-input" type="text" value={form.organisation_name} onChange={set('organisation_name')} placeholder="e.g. Nairobi City Water" required />
          </label>

          <div className="login-row">
            <label className="login-label">
              Password <span className="login-required">*</span>
              <input className="login-input" type="password" value={form.password} onChange={set('password')} autoComplete="new-password" required minLength={8} />
            </label>
            <label className="login-label">
              Confirm password <span className="login-required">*</span>
              <input className="login-input" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" required />
            </label>
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="login-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
