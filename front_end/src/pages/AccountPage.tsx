export default function AccountPage() {
  return (
    <>

      <div className="account-grid">

        {/*  Left nav  */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
          <div className="account-nav-item active" >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            Profile
          </div>
          <div className="account-nav-item" >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></svg>
            My Sensors
          </div>
          <div className="account-nav-item" >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
            Notifications
          </div>
          <div className="account-nav-item" >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
            API Access
          </div>
          <div className="account-nav-item" >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
            Security
          </div>
          <hr className="divider" />
          <div className="account-nav-item" style={{ color: 'var(--danger)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Sign Out
          </div>
        </div>

        {/*  Right content  */}
        <div id="tab-profile">
          <div className="card" style={{ marginBottom: 'var(--s4)' }}>
            <div className="card-header"><div className="card-title">Profile Information</div><button className="btn btn-sm btn-secondary">Edit</button></div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--s6)', flexWrap: 'wrap', marginBottom: 'var(--s6)' }}>
                <div className="avatar-big">TL</div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>Tom Lee</h2>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--s4)' }}>Field Researcher · Joined Jan 2024</div>
                  <button className="btn btn-sm btn-secondary">Change Photo</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s4)' }}>
                <div className="form-group"><label className="form-label">First Name</label><input className="form-control" value="Tom" /></div>
                <div className="form-group"><label className="form-label">Last Name</label><input className="form-control" value="Lee" /></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-control" value="tom.lee@aquawatch.org" /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value="+27 82 000 0000" /></div>
                <div className="form-group"><label className="form-label">Organisation</label><input className="form-control" value="AquaWatch Research" /></div>
                <div className="form-group"><label className="form-label">Role</label><select className="form-control"><option>Field Researcher</option><option>Admin</option><option>Viewer</option></select></div>
              </div>
              <div style={{ marginTop: 'var(--s6)', display: 'flex', gap: 'var(--s3)' }}>
                <button className="btn btn-primary">Save Changes</button>
                <button className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>

        <div id="tab-sensors" style={{ display: 'none' }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Assigned Sensors</div><button className="btn btn-sm btn-primary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>Add Sensor</button></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
              <div className="sensor-chip"><span className="status-dot dot-danger"></span><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>ESP32-CRR-004</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Crocodile River · Last seen 2 min ago</div></div><span className="badge badge-danger">Critical</span><button className="btn btn-sm btn-ghost">Unassign</button></div>
              <div className="sensor-chip"><span className="status-dot dot-warning"></span><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>ESP32-LIM-001</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Limpopo River · Last seen 5 min ago</div></div><span className="badge badge-warning">Warning</span><button className="btn btn-sm btn-ghost">Unassign</button></div>
              <div className="sensor-chip"><span className="status-dot dot-safe"></span><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>ESP32-VAL-002</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vaal Dam · Last seen 12 min ago</div></div><span className="badge badge-safe">Safe</span><button className="btn btn-sm btn-ghost">Unassign</button></div>
            </div>
          </div>
        </div>

        <div id="tab-notifications" style={{ display: 'none' }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Notification Preferences</div></div>
            <div className="card-body">
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--s6)' }}>Choose how and when you receive alerts from AquaWatch.</p>
              <div className="toggle-row"><div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Critical alerts (email)</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Immediate email for critical threshold breaches</div></div><div className="toggle on" ></div></div>
              <div className="toggle-row"><div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Warning alerts (email)</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email for warning-level readings</div></div><div className="toggle on" ></div></div>
              <div className="toggle-row"><div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Push notifications</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Browser push for all active alerts</div></div><div className="toggle on" ></div></div>
              <div className="toggle-row"><div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Daily digest</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily summary email at 8:00 AM</div></div><div className="toggle" ></div></div>
              <div className="toggle-row"><div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Sensor offline alerts</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Notify when sensor goes offline (&gt; 30 min)</div></div><div className="toggle on" ></div></div>
              <div className="toggle-row"><div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Weekly report</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weekly PDF report via email</div></div><div className="toggle" ></div></div>
              <div style={{ marginTop: 'var(--s6)' }}><button className="btn btn-primary">Save Preferences</button></div>
            </div>
          </div>
        </div>

        <div id="tab-api" style={{ display: 'none' }}>
          <div className="card">
            <div className="card-header"><div className="card-title">API Access</div><button className="btn btn-sm btn-primary">Generate New Key</button></div>
            <div className="card-body">
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--s6)' }}>Use API keys to programmatically access sensor data and submit readings from your ESP32 devices.</p>
              <div style={{ marginBottom: 'var(--s6)' }}>
                <div className="form-label" style={{ marginBottom: 'var(--s2)' }}>Production Key</div>
                <div style={{ display: 'flex', gap: 'var(--s3)', alignItems: 'center' }}>
                  <div className="api-key">aq_live_sk_••••••••••••••••••••••••••••••••f3a9</div>
                  <button className="btn btn-sm btn-secondary">Reveal</button>
                  <button className="btn btn-sm btn-ghost">Copy</button>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--s2)' }}>Created Jan 12, 2024 · Last used 2 min ago</div>
              </div>
              <div style={{ padding: 'var(--s4)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 'var(--s3)' }}>Example: Submit a reading</div>
                <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-blue)', lineHeight: 1.6, overflowX: 'auto' }}>{`POST https://api.aquawatch.io/v1/readings
Authorization: Bearer aq_live_sk_...
Content-Type: application/json

{
  "sensor_id": "ESP32-CRR-004",
  "ph": 7.42,
  "turbidity": 2.1,
  "dissolved_o2": 6.8,
  "nitrates": 78.3,
  "temperature": 22.4
}`}</pre>
              </div>
            </div>
          </div>
        </div>

        <div id="tab-security" style={{ display: 'none' }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Security</div></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--s4)' }}>Change Password</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)', maxWidth: '400px' }}>
                  <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-control" placeholder="••••••••" /></div>
                  <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-control" placeholder="••••••••" /></div>
                  <div className="form-group"><label className="form-label">Confirm New Password</label><input type="password" className="form-control" placeholder="••••••••" /></div>
                  <button className="btn btn-primary" style={{ width: 'fit-content' }}>Update Password</button>
                </div>
              </div>
              <hr className="divider" />
              <div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--s2)' }}>Two-Factor Authentication</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--s4)' }}>Add an extra layer of security to your account.</p>
                <button className="btn btn-secondary">Enable 2FA</button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </>
  );
}
