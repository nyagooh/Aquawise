import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { tokenStorage } from '../lib/api';

const schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^\w+$/, 'Letters, numbers, and underscores only'),
  email: z.string().email('Enter a valid email address'),
  organisation_name: z.string().min(2, 'Organisation name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type FormValues = z.infer<typeof schema>;

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const { data } = await api.post('/auth/register/', {
        username: values.username,
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
        organisation_name: values.organisation_name,
      });
      // Store tokens then use login flow to populate AuthContext
      tokenStorage.set(data.access, data.refresh);
      // Re-use login to fetch /me and populate context
      await login(values.username, values.password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      if (errData) {
        const firstMsg = Object.values(errData).flat()[0];
        setServerError(typeof firstMsg === 'string' ? firstMsg : 'Registration failed. Please check your details.');
      } else {
        setServerError('Unable to connect. Please try again.');
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 420 }}>
        <div className="login-brand">
          <svg width={32} height={32} viewBox="0 0 28 28" fill="none">
            <circle cx={14} cy={14} r={14} fill="hsl(var(--primary) / 0.14)" />
            <path d="M14 4C14 4 6 12 6 18a8 8 0 0016 0c0-6-8-14-8-14z" fill="hsl(var(--primary))" />
          </svg>
          <span>Aqua<span className="accent">Wise</span></span>
        </div>

        <h1 className="login-title">Create your account</h1>
        <p className="login-sub">Start monitoring your water network in minutes</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
            <div className="field">
              <label htmlFor="first_name">First name</label>
              <input id="first_name" type="text" autoComplete="given-name" autoFocus {...register('first_name')} aria-invalid={!!errors.first_name} />
              {errors.first_name && <span className="field-error">{errors.first_name.message}</span>}
            </div>
            <div className="field">
              <label htmlFor="last_name">Last name</label>
              <input id="last_name" type="text" autoComplete="family-name" {...register('last_name')} aria-invalid={!!errors.last_name} />
              {errors.last_name && <span className="field-error">{errors.last_name.message}</span>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="organisation_name">Organisation / utility name</label>
            <input id="organisation_name" type="text" autoComplete="organization" placeholder="e.g. Kisumu Water & Sewerage" {...register('organisation_name')} aria-invalid={!!errors.organisation_name} />
            {errors.organisation_name && <span className="field-error">{errors.organisation_name.message}</span>}
          </div>

          <div className="field">
            <label htmlFor="email">Work email</label>
            <input id="email" type="email" autoComplete="email" {...register('email')} aria-invalid={!!errors.email} />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </div>

          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" autoComplete="username" {...register('username')} aria-invalid={!!errors.username} />
            {errors.username && <span className="field-error">{errors.username.message}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="new-password" {...register('password')} aria-invalid={!!errors.password} />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>

          <div className="field">
            <label htmlFor="confirm_password">Confirm password</label>
            <input id="confirm_password" type="password" autoComplete="new-password" {...register('confirm_password')} aria-invalid={!!errors.confirm_password} />
            {errors.confirm_password && <span className="field-error">{errors.confirm_password.message}</span>}
          </div>

          {serverError && <p className="login-error">{serverError}</p>}

          <button type="submit" className="btn-primary login-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="login-divider" />
        <p className="login-signup-row">
          Already have an account?{' '}
          <Link to="/login" className="login-signup-link">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
