import { useState, useEffect } from 'react';
import { User, Shield, Bell, Key, LogOut, Copy, Plus, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { ApiKey, NotificationPrefs } from '../lib/api';

const tabs = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'api',           label: 'API Access',     icon: Key },
  { id: 'security',      label: 'Security',       icon: Shield },
];

export default function Account() {
  const { user, setUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 'var(--s6)' }}>
      {/* Left nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s1)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--s3)',
              padding: 'var(--s3) var(--s4)', borderRadius: 'var(--r-md)',
              border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
              fontSize: '0.875rem', fontWeight: 500,
              background: activeTab === t.id ? 'var(--accent-glow)' : 'transparent',
              color:      activeTab === t.id ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            <t.icon size={16} />{t.label}
          </button>
        ))}
        <hr style={{ margin: 'var(--s2) 0', border: 'none', borderTop: '1px solid var(--border-subtle)' }} />
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--s3)',
            padding: 'var(--s3) var(--s4)', borderRadius: 'var(--r-md)',
            border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
            fontSize: '0.875rem', fontWeight: 500,
            background: 'transparent', color: 'var(--danger)',
          }}
        >
          <LogOut size={16} />Sign Out
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>
        {activeTab === 'profile'       && <ProfileTab user={user} setUser={setUser} />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'api'           && <ApiTab />}
        {activeTab === 'security'      && <SecurityTab />}
      </div>
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────

function ProfileTab({ user, setUser }: { user: ReturnType<typeof useAuth>['user']; setUser: (u: NonNullable<typeof user>) => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', organization: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) setForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone, organization: user.organization });
  }, [user]);

  const initials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : '?';

  const save = async () => {
    setSaving(true); setError('');
    try {
      const updated = await api.put<NonNullable<typeof user>>('/users/me/', form);
      setUser(updated);
      setEditing(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Profile Information"
        actions={
          editing
            ? <><button className="btn btn-sm btn-ghost" onClick={() => setEditing(false)}>Cancel</button><button className="btn btn-sm btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button></>
            : <button className="btn btn-sm btn-secondary" onClick={() => setEditing(true)}>Edit</button>
        }
      />
      <CardBody>
        {error && <div style={{ marginBottom: 'var(--s4)', padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.8125rem' }}>{error}</div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s5)', marginBottom: 'var(--s6)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{initials}</div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{user ? `${user.firstName} ${user.lastName}` : '—'}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
            {user?.organization && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{user.organization}</div>}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)' }}>
          {editing ? (
            <>
              <Field label="First Name"><input className="form-control" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></Field>
              <Field label="Last Name"><input className="form-control" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></Field>
              <Field label="Email Address"><input className="form-control" readOnly value={user?.email ?? ''} /></Field>
              <Field label="Phone"><input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></Field>
              <Field label="Organization" style={{ gridColumn: '1 / -1' }}><input className="form-control" value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} /></Field>
            </>
          ) : (
            <>
              <StaticField label="First Name" value={user?.firstName} />
              <StaticField label="Last Name" value={user?.lastName} />
              <StaticField label="Email Address" value={user?.email} />
              <StaticField label="Phone" value={user?.phone || '—'} />
              <StaticField label="Organization" value={user?.organization || '—'} />
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<NotificationPrefs>('/users/me/notifications/').then(setPrefs).catch(() => {});
  }, []);

  const toggle = (key: keyof NotificationPrefs) => {
    if (!prefs) return;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    api.put<NotificationPrefs>('/users/me/notifications/', updated)
      .then(setPrefs)
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  const rows: { key: keyof NotificationPrefs; label: string; sub: string }[] = [
    { key: 'critical',    label: 'Critical alerts',      sub: 'Immediate notification for critical threshold breaches' },
    { key: 'warning',     label: 'Warning alerts',       sub: 'Notification for warning-level readings' },
    { key: 'push',        label: 'Push notifications',   sub: 'Browser push for all active alerts' },
    { key: 'email',       label: 'Email notifications',  sub: 'Email summaries and alerts' },
    { key: 'sms',         label: 'SMS notifications',    sub: 'Text message alerts for critical events' },
    { key: 'dailyDigest', label: 'Daily digest',         sub: 'Daily summary at 8:00 AM' },
  ];

  return (
    <Card>
      <CardHeader title="Notification Preferences" actions={saving ? <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saving…</span> : undefined} />
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {!prefs && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>}
        {prefs && rows.map(r => (
          <div key={r.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--s3) 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{r.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.sub}</div>
            </div>
            <button
              type="button"
              onClick={() => toggle(r.key)}
              style={{ width: 36, height: 20, borderRadius: 999, background: prefs[r.key] ? 'var(--accent)' : 'var(--bg-input)', border: '1px solid ' + (prefs[r.key] ? 'var(--accent-dim)' : 'var(--border-default)'), position: 'relative', cursor: 'pointer' }}
            >
              <span style={{ position: 'absolute', top: 1, left: prefs[r.key] ? 17 : 1, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.25)', transition: 'left 150ms ease' }} />
            </button>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

// ── API Keys ──────────────────────────────────────────────────────────────────

function ApiTab() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get<ApiKey[]>('/users/me/api-keys/').then(setKeys).catch(() => {});
  }, []);

  const create = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const k = await api.post<ApiKey & { key: string }>('/users/me/api-keys/', { name: newName.trim() });
      setKeys(prev => [...prev, k]);
      setRawKey(k.key);
      setNewName('');
    } catch { /* ignore */ } finally {
      setCreating(false);
    }
  };

  const copy = () => {
    if (!rawKey) return;
    navigator.clipboard.writeText(rawKey).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <Card>
      <CardHeader title="API Access" eyebrow="INTEGRATIONS" />
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s5)' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Use API keys to programmatically access sensor data.</p>

        {rawKey && (
          <div style={{ padding: 'var(--s4)', background: 'var(--bg-card)', border: '1px solid var(--accent-dim)', borderRadius: 'var(--r-lg)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>New key — copy it now, it won't be shown again</div>
            <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center' }}>
              <input className="form-control mono" readOnly value={rawKey} style={{ flex: 1, fontSize: '0.8rem' }} />
              <button className="btn btn-sm btn-secondary" onClick={copy}><Copy size={14} /> {copied ? 'Copied!' : 'Copy'}</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--s3)' }}>
          <input className="form-control" placeholder="Key name (e.g. ESP32 sensor)" value={newName} onChange={e => setNewName(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={create} disabled={creating || !newName.trim()}>
            {creating ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <><Plus size={14} /> Generate</>}
          </button>
        </div>

        {keys.length > 0 && (
          <table>
            <thead><tr><th>Name</th><th>Created</th><th>Last used</th></tr></thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.id}>
                  <td style={{ fontWeight: 500 }}>{k.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
  );
}

// ── Security ──────────────────────────────────────────────────────────────────

function SecurityTab() {
  const { user } = useAuth();
  const [pw, setPw] = useState({ current: '', next: '' });
  const [pwStatus, setPwStatus] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle');
  const [pwError, setPwError] = useState('');
  const [twoFaStatus, setTwoFaStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [provUri, setProvUri] = useState('');

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus('saving'); setPwError('');
    try {
      await api.post('/users/me/change-password/', { currentPassword: pw.current, newPassword: pw.next });
      setPwStatus('ok');
      setPw({ current: '', next: '' });
    } catch (err: unknown) {
      setPwStatus('error');
      setPwError(err instanceof Error ? err.message : 'Failed to change password.');
    }
  };

  const enable2fa = async () => {
    setTwoFaStatus('loading');
    try {
      const data = await api.post<{ provisioningUri: string }>('/users/me/2fa/enable/', {});
      setProvUri(data.provisioningUri);
      setTwoFaStatus('done');
    } catch { setTwoFaStatus('idle'); }
  };

  return (
    <Card>
      <CardHeader title="Security Settings" />
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--s4)' }}>Change Password</h3>
          <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)', maxWidth: 400 }}>
            {pwStatus === 'error' && <div style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.8125rem' }}>{pwError}</div>}
            {pwStatus === 'ok'    && <div style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'var(--safe-bg)', color: 'var(--safe)', fontSize: '0.8125rem' }}>Password updated successfully.</div>}
            <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-control" required value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-control" required minLength={8} value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))} /></div>
            <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }} disabled={pwStatus === 'saving'}>{pwStatus === 'saving' ? 'Updating…' : 'Update Password'}</button>
          </form>
        </div>
        <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--s2)' }}>Two-Factor Authentication</h3>
          {user?.twoFaEnabled
            ? <p style={{ fontSize: '0.8125rem', color: 'var(--safe)' }}>2FA is enabled on your account.</p>
            : (
              <>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--s4)' }}>Add an extra layer of security to your account.</p>
                {twoFaStatus !== 'done' && <button className="btn btn-secondary" onClick={enable2fa} disabled={twoFaStatus === 'loading'}>{twoFaStatus === 'loading' ? 'Enabling…' : 'Enable 2FA'}</button>}
                {twoFaStatus === 'done' && (
                  <div style={{ marginTop: 'var(--s4)', padding: 'var(--s4)', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-default)' }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--s3)' }}>Scan this URI with your authenticator app (Google Authenticator, Authy, etc.):</p>
                    <input className="form-control mono" readOnly value={provUri} style={{ fontSize: '0.7rem' }} />
                  </div>
                )}
              </>
            )
          }
        </div>
      </CardBody>
    </Card>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="form-group" style={style}>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function StaticField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-control" readOnly value={value ?? ''} />
    </div>
  );
}
