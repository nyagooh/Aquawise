import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await login(values.username, values.password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setServerError(
        status === 401
          ? 'Invalid username or password.'
          : 'Unable to connect. Please try again.',
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <svg width={32} height={32} viewBox="0 0 28 28" fill="none">
            <circle cx={14} cy={14} r={14} fill="hsl(var(--primary) / 0.14)" />
            <path d="M14 4C14 4 6 12 6 18a8 8 0 0016 0c0-6-8-14-8-14z" fill="hsl(var(--primary))" />
          </svg>
          <span>Aqua<span className="accent">Watch</span></span>
        </div>

        <h1 className="login-title">Sign in</h1>
        <p className="login-sub">Water resources management platform</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              autoFocus
              {...register('username')}
              aria-invalid={!!errors.username}
            />
            {errors.username && <span className="field-error">{errors.username.message}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>

          {serverError && <p className="login-error">{serverError}</p>}

          <button type="submit" className="btn-primary login-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="login-divider" />
        <p className="login-signup-row">
          Don't have an account?{' '}
          <Link to="/signup" className="login-signup-link">Sign up →</Link>
        </p>
      </div>
    </div>
  );
}
