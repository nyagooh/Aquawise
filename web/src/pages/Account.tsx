import { useState } from 'react';
import { User, Shield, Bell, Key, LogOut, Plus, X } from 'lucide-react';
import { Card, CardHeader, CardBody, Badge } from '../components/ui';
import { UTILITIES } from '../data/mockData';

const tabs = [
  { id: 'profile',      label: 'Profile',       icon: User },
  { id: 'sensors',      label: 'My Sensors',    icon: Plus },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api',          label: 'API Access',    icon: Key },
  { id: 'security',     label: 'Security',      icon: Shield },
];

export default function Account() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 'var(--s6)' }}>
      {/* Left Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            className={'account-nav-item' + (activeTab === t.id ? ' active' : '')}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--s3)',
              padding: 'var(--s3) var(--s4)',
              borderRadius: 'var(--r-md)',
              border: 'none',
              background: activeTab === t.id ? 'var(--accent-glow)' : 'transparent',
              color: activeTab === t.id ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
        <hr style={{ margin: 'var(--s2) 0', border: 'none', borderTop: '1px solid var(--border-subtle)' }} />
        <button
          className="account-nav-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--s3)',
            padding: 'var(--s3) var(--s4)',
            borderRadius: 'var(--r-md)',
            border: 'none',
            background: 'transparent',
            color: 'var(--danger)',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>
        {activeTab === 'profile' && (
          <Card>
            <CardHeader title="Profile Information" actions={<button className="btn btn-sm btn-secondary">Edit</button>} />
            <CardBody>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s5)', marginBottom: 'var(--s8)' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700, color: '#fff' }}>TL</div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Tlou Letshufi</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>tlou.letshufi@aquawise.co.ke</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Utility Operator · Member since Jan 2024</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)' }}>
                <Field label="First Name" value="Tlou" />
                <Field label="Last Name" value="Letshufi" />
                <Field label="Email Address" value="tlou.letshufi@aquawise.co.ke" />
                <Field label="Phone Number" value="+254 700 000 000" />
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === 'sensors' && (
          <Card>
            <CardHeader title="Assigned Utilities" actions={<button className="btn btn-sm btn-primary">+ Assign</button>} />
            <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
              {UTILITIES.slice(0, 4).map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)', padding: 'var(--s3) var(--s4)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-lg)', background: 'var(--bg-card)' }}>
                  <span className={`status-dot dot-${u.status === 'safe' ? 'safe' : u.status === 'warning' ? 'warning' : 'danger'}`} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.sensorId}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.name} · Last seen {u.lastUpdate}</div>
                  </div>
                  <Badge tone={u.status === 'safe' ? 'safe' : u.status === 'warning' ? 'warning' : 'danger'}>
                    {u.status === 'safe' ? 'Safe' : u.status === 'warning' ? 'Warning' : 'Critical'}
                  </Badge>
                  <button className="btn btn-sm btn-ghost"><X size={14} /></button>
                </div>
              ))}
            </CardBody>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card>
            <CardHeader title="Notification Preferences" />
            <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
              <Toggle label="Critical alerts (email)"   sub="Immediate email for critical threshold breaches" defaultOn />
              <Toggle label="Warning alerts (email)"    sub="Email for warning-level readings" defaultOn />
              <Toggle label="Push notifications"        sub="Browser push for all active alerts" defaultOn />
              <Toggle label="Daily digest"              sub="Daily summary email at 8:00 AM" />
              <Toggle label="Sensor offline alerts"     sub="Notify when sensor goes offline (> 30 min)" defaultOn />
            </CardBody>
          </Card>
        )}

        {activeTab === 'api' && (
          <Card>
            <CardHeader title="API Access" eyebrow="INTEGRATIONS" actions={<button className="btn btn-sm btn-primary">Generate New Key</button>} />
            <CardBody>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--s4)' }}>
                Use API keys to programmatically access sensor data and submit readings.
              </p>
              <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center', marginBottom: 'var(--s6)' }}>
                <input className="form-control mono" readOnly value="aw_live_sk_•••••••••••••••••••••••••••••f3a9" style={{ flex: 1 }} />
                <button className="btn btn-secondary">Reveal</button>
              </div>
              <div style={{ padding: 'var(--s4)', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)' }}>
                <div className="card-eyebrow" style={{ marginBottom: 'var(--s2)' }}>Example: Fetch readings</div>
                <pre className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent)', overflowX: 'auto' }}>
                  GET https://api.aquawise.io/v1/utilities/NRB-001/readings
                  Authorization: Bearer aw_live_sk_...
                </pre>
              </div>
            </CardBody>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card>
            <CardHeader title="Security Settings" />
            <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--s4)' }}>Change Password</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)', maxWidth: 400 }}>
                  <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-control" /></div>
                  <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-control" /></div>
                  <button className="btn btn-primary" style={{ width: 'fit-content' }}>Update Password</button>
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--s2)' }}>Two-Factor Authentication</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--s4)' }}>Add an extra layer of security to your account.</p>
                <button className="btn btn-secondary">Enable 2FA</button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}

function Field(props: { label: string; value: string }) {
  return (
    <div className="form-group">
      <label className="form-label">{props.label}</label>
      <input className="form-control" readOnly value={props.value} />
    </div>
  );
}

function Toggle(props: { label: string; sub?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(props.defaultOn ?? false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--s3) 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{props.label}</div>
        {props.sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{props.sub}</div>}
      </div>
      <button
        type="button"
        onClick={() => setOn(!on)}
        style={{
          width: 36, height: 20,
          borderRadius: 999,
          background: on ? 'var(--accent)' : 'var(--bg-input)',
          border: '1px solid ' + (on ? 'var(--accent-dim)' : 'var(--border-default)'),
          position: 'relative',
          transition: 'background 150ms ease',
          cursor: 'pointer',
        }}
      >
        <span style={{ position: 'absolute', top: 1, left: on ? 17 : 1, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.25)', transition: 'left 150ms ease' }} />
      </button>
    </div>
  );
}
