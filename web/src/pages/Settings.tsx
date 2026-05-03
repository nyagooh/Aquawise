import { useEffect, useState } from 'react';
import { Cog, Cpu, Bell as BellIcon, Database, Palette } from 'lucide-react';
import { Card, CardHeader, CardBody, Badge } from '../components/ui';
import { api } from '../lib/api';
import type { WaterSource } from '../lib/api';

const tabs = [
  { id: 'thresholds', label: 'WHO Thresholds', icon: Cog },
  { id: 'sensors',    label: 'Sensors',         icon: Cpu },
  { id: 'alerts',     label: 'Alert Rules',     icon: BellIcon },
  { id: 'data',       label: 'Data & Export',   icon: Database },
  { id: 'display',    label: 'Display',         icon: Palette },
];

interface ThresholdRow { param: string; label: string; unit: string; safeMin: number | null; safeMax: number | null; category: string }
interface AlertSettings { emailEnabled: boolean; smsEnabled: boolean; pushEnabled: boolean; criticalThresholdMultiplier: number; alertCooldownMinutes: number; autoResolveAfterHours: number }
interface ExportSettings { format: string; includeHeaders: boolean; scheduledExports: boolean; scheduledFrequency: string }
interface DisplaySettings { theme: string; defaultPeriod: string; decimalPlaces: number; dateFormat: string }

export default function Settings() {
  const [tab, setTab] = useState('thresholds');

  return (
    <>
      <div className="tabs" style={{ alignSelf: 'flex-start' }}>
        {tabs.map(t => (
          <button key={t.id} className={'tab-btn' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
            <t.icon size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'thresholds' && <ThresholdsTab />}
      {tab === 'sensors'    && <SensorsTab />}
      {tab === 'alerts'     && <AlertRulesTab />}
      {tab === 'data'       && <ExportTab />}
      {tab === 'display'    && <DisplayTab />}
    </>
  );
}

// ── Thresholds ────────────────────────────────────────────────────────────────

function ThresholdsTab() {
  const [rows,    setRows]    = useState<ThresholdRow[]>([]);
  const [edited,  setEdited]  = useState<Record<string, { safeMin: string; safeMax: string }>>({});
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    api.get<{ thresholds: ThresholdRow[] }>('/settings/thresholds/').then(d => setRows(d.thresholds)).catch(() => {});
  }, []);

  const val = (param: string, key: 'safeMin' | 'safeMax', def: number | null) =>
    edited[param]?.[key] ?? (def != null ? def.toString() : '');

  const change = (param: string, key: 'safeMin' | 'safeMax', v: string) =>
    setEdited(prev => ({ ...prev, [param]: { ...(prev[param] ?? {}), [key]: v } }));

  const save = async () => {
    setSaving(true); setSaved(false);
    const thresholds = rows.map(r => ({
      param: r.param,
      safeMin: parseFloat(val(r.param, 'safeMin', r.safeMin)) || undefined,
      safeMax: parseFloat(val(r.param, 'safeMax', r.safeMax)) || undefined,
    }));
    try {
      await api.put('/settings/thresholds/', { thresholds });
      setEdited({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  const reset = () => setEdited({});

  return (
    <Card>
      <CardHeader
        title="WHO Parameter Thresholds"
        eyebrow="Drinking Water Guidelines"
        actions={
          <>
            {saved && <span style={{ fontSize: '0.75rem', color: 'var(--safe)' }}>Saved ✓</span>}
            <button className="btn btn-secondary" onClick={reset}>Reset Changes</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        }
      />
      <CardBody>
        {rows.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>}
        {rows.length > 0 && (() => {
          const CATEGORY_LABELS: Record<string, string> = {
            micro: 'A. Microbiological',
            physical: 'B. Physical / Aesthetic',
            chemical: 'C. Chemical',
            operational: 'D. Operational',
          };
          const grouped = Object.entries(CATEGORY_LABELS).map(([cat, heading]) => ({
            heading,
            rows: rows.filter(r => r.category === cat),
          })).filter(g => g.rows.length > 0);

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s6)' }}>
              {grouped.map(group => (
                <div key={group.heading}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 'var(--s3)' }}>{group.heading}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr', gap: 'var(--s2) var(--s4)', alignItems: 'center' }}>
                    <div className="card-eyebrow">Parameter</div>
                    <div className="card-eyebrow" style={{ textAlign: 'right' }}>Safe Min</div>
                    <div className="card-eyebrow" style={{ textAlign: 'right' }}>Safe Max</div>
                    {group.rows.map(r => (
                      <>
                        <div key={r.param}>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{r.label}</div>
                          {r.unit && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.unit}</div>}
                        </div>
                        <input
                          className="form-control"
                          placeholder={r.category === 'micro' ? 'n/a' : '—'}
                          value={val(r.param, 'safeMin', r.safeMin)}
                          onChange={e => change(r.param, 'safeMin', e.target.value)}
                          style={{ textAlign: 'right', fontSize: '0.8125rem' }}
                        />
                        <input
                          className="form-control"
                          placeholder="monitoring only"
                          value={val(r.param, 'safeMax', r.safeMax)}
                          onChange={e => change(r.param, 'safeMax', e.target.value)}
                          style={{ textAlign: 'right', fontSize: '0.8125rem' }}
                        />
                      </>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </CardBody>
    </Card>
  );
}

// ── Sensors ───────────────────────────────────────────────────────────────────

function SensorsTab() {
  const [sources, setSources] = useState<WaterSource[]>([]);

  useEffect(() => {
    api.get<WaterSource[]>('/water-sources/').then(setSources).catch(() => {});
  }, []);

  return (
    <Card>
      <CardHeader title="Sensor Management" actions={<button className="btn btn-primary">+ Add Sensor</button>} />
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
        {sources.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>}
        {sources.map(u => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)', padding: 'var(--s3) var(--s4)', border: '1px solid var(--border-default)', borderRadius: 'var(--r-lg)', background: 'var(--bg-card)' }}>
            <span className={`status-dot dot-${u.status}`} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.sensorId || u.id} · {u.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {u.county}
                {u.lat != null && ` · ${u.lat.toFixed(3)}°, ${u.lng!.toFixed(3)}°`}
                {u.battery != null && ` · Battery ${u.battery}%`}
              </div>
            </div>
            <select className="form-control" style={{ width: 'auto', padding: '4px 10px', fontSize: '0.8125rem' }}>
              <option>15 min</option><option>5 min</option><option>1 hour</option>
            </select>
            {u.battery != null && <Badge tone={u.battery < 30 ? 'warning' : 'safe'}>{u.battery}% battery</Badge>}
            <button className="btn btn-sm btn-ghost">Edit</button>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

// ── Alert Rules ───────────────────────────────────────────────────────────────

function AlertRulesTab() {
  const [settings, setSettings] = useState<AlertSettings | null>(null);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    api.get<AlertSettings>('/settings/alerts/').then(setSettings).catch(() => {});
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    api.put<AlertSettings>('/settings/alerts/', settings).then(setSettings).catch(() => {}).finally(() => setSaving(false));
  };

  const boolToggle = (key: keyof AlertSettings) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <Card>
      <CardHeader title="Alert Rules" actions={<button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>} />
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
        {!settings && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>}
        {settings && (
          <>
            <BoolRow label="Email alerts" sub="Send email for threshold breaches" on={settings.emailEnabled} toggle={() => boolToggle('emailEnabled')} />
            <BoolRow label="SMS alerts" sub="Text message for critical events" on={settings.smsEnabled} toggle={() => boolToggle('smsEnabled')} />
            <BoolRow label="Push notifications" sub="Browser push for active alerts" on={settings.pushEnabled} toggle={() => boolToggle('pushEnabled')} />
            <NumberRow label="Alert cooldown (minutes)" value={settings.alertCooldownMinutes} onChange={v => setSettings({ ...settings, alertCooldownMinutes: v })} />
            <NumberRow label="Auto-resolve after (hours)" value={settings.autoResolveAfterHours} onChange={v => setSettings({ ...settings, autoResolveAfterHours: v })} />
          </>
        )}
      </CardBody>
    </Card>
  );
}

// ── Data & Export ─────────────────────────────────────────────────────────────

function ExportTab() {
  const [settings, setSettings] = useState<ExportSettings | null>(null);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    api.get<ExportSettings>('/settings/export/').then(setSettings).catch(() => {});
  }, []);

  const save = () => {
    if (!settings) return;
    setSaving(true);
    api.put<ExportSettings>('/settings/export/', settings).then(setSettings).catch(() => {}).finally(() => setSaving(false));
  };

  return (
    <Card>
      <CardHeader title="Data & Export" actions={<button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>} />
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
        {!settings && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>}
        {settings && (
          <>
            <div className="form-group">
              <label className="form-label">Export Format</label>
              <select className="form-control" style={{ maxWidth: 200 }} value={settings.format} onChange={e => setSettings({ ...settings, format: e.target.value })}>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <BoolRow label="Include headers" sub="Add column headers to CSV exports" on={settings.includeHeaders} toggle={() => setSettings({ ...settings, includeHeaders: !settings.includeHeaders })} />
            <BoolRow label="Scheduled exports" sub="Automatically export on a schedule" on={settings.scheduledExports} toggle={() => setSettings({ ...settings, scheduledExports: !settings.scheduledExports })} />
            {settings.scheduledExports && (
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <select className="form-control" style={{ maxWidth: 200 }} value={settings.scheduledFrequency} onChange={e => setSettings({ ...settings, scheduledFrequency: e.target.value })}>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}

// ── Display ───────────────────────────────────────────────────────────────────

function DisplayTab() {
  const [settings, setSettings] = useState<DisplaySettings | null>(null);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    api.get<DisplaySettings>('/settings/display/').then(setSettings).catch(() => {});
  }, []);

  const save = () => {
    if (!settings) return;
    setSaving(true);
    api.put<DisplaySettings>('/settings/display/', settings).then(setSettings).catch(() => {}).finally(() => setSaving(false));
  };

  return (
    <Card>
      <CardHeader title="Display Preferences" actions={<button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>} />
      <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
        {!settings && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>}
        {settings && (
          <>
            <div className="form-group">
              <label className="form-label">Default Period</label>
              <select className="form-control" style={{ maxWidth: 200 }} value={settings.defaultPeriod} onChange={e => setSettings({ ...settings, defaultPeriod: e.target.value })}>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
                <option value="90d">90 days</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Decimal Places</label>
              <select className="form-control" style={{ maxWidth: 200 }} value={settings.decimalPlaces} onChange={e => setSettings({ ...settings, decimalPlaces: parseInt(e.target.value) })}>
                {[1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date Format</label>
              <select className="form-control" style={{ maxWidth: 200 }} value={settings.dateFormat} onChange={e => setSettings({ ...settings, dateFormat: e.target.value })}>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function BoolRow({ label, sub, on, toggle }: { label: string; sub?: string; on: boolean; toggle: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--s3) 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>}
      </div>
      <button type="button" onClick={toggle} style={{ width: 36, height: 20, borderRadius: 999, background: on ? 'var(--accent)' : 'var(--bg-input)', border: '1px solid ' + (on ? 'var(--accent-dim)' : 'var(--border-default)'), position: 'relative', cursor: 'pointer' }}>
        <span style={{ position: 'absolute', top: 1, left: on ? 17 : 1, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.25)', transition: 'left 150ms ease' }} />
      </button>
    </div>
  );
}

function NumberRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="form-group" style={{ maxWidth: 320 }}>
      <label className="form-label">{label}</label>
      <input type="number" className="form-control" value={value} onChange={e => onChange(parseInt(e.target.value) || 0)} />
    </div>
  );
}
