import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { TrendingUp, Brain, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardBody, Badge } from '../components/ui';
import { api } from '../lib/api';
import type { WaterSource } from '../lib/api';

type ForecastPoint = { date: string; value: number; lower: number; upper: number; risk: string };
type ForecastResp  = { utilityName: string; parameter: string; unit: string; safeMax: number; safeMin: number; baseline: number; forecast: ForecastPoint[]; modelUsed: string; days: number };
type FeatureItem   = { feature: string; importance: number };
type FeatureResp   = { features: FeatureItem[]; fromTrainedModel: boolean; trainingNote: string };
type Insight       = { id: string; severity: string; title: string; description: string; recommendedAction: string };

type ParamKey = 'nitrates' | 'ph' | 'turbidity' | 'conductivity' | 'temperature' | 'dissolvedOxygen';
const PARAMS: { key: ParamKey; label: string }[] = [
  { key: 'nitrates',       label: 'Nitrates' },
  { key: 'ph',             label: 'pH' },
  { key: 'turbidity',      label: 'Turbidity' },
  { key: 'conductivity',   label: 'Conductivity' },
  { key: 'temperature',    label: 'Temperature' },
  { key: 'dissolvedOxygen', label: 'Dissolved O₂' },
];

const WHO_MAX: Partial<Record<ParamKey, number>> = { nitrates: 50, ph: 8.5, turbidity: 1, conductivity: 2500, temperature: 25 };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Predictive() {
  const [sources,   setSources]   = useState<WaterSource[]>([]);
  const [utility,   setUtility]   = useState('');
  const [days,      setDays]      = useState(14);
  const [param,     setParam]     = useState<ParamKey>('nitrates');
  const [forecast,  setForecast]  = useState<ForecastResp | null>(null);
  const [features,  setFeatures]  = useState<FeatureResp | null>(null);
  const [insights,  setInsights]  = useState<Insight[]>([]);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    api.get<WaterSource[]>('/water-sources/').then(data => {
      setSources(data);
      if (data.length) setUtility(data[0].id);
    }).catch(() => {});
    api.get<{ insights: Insight[] }>('/insights/').then(d => setInsights(d.insights)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!utility) return;
    setLoading(true);
    Promise.all([
      api.get<ForecastResp>(`/forecasts/nitrate/?utility=${utility}&days=${days}&param=${param}`),
      api.get<FeatureResp>(`/ml/feature-importance/?param=${param}`),
    ]).then(([fc, fi]) => { setForecast(fc); setFeatures(fi); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [utility, days, param]);

  const chartData = forecast?.forecast.map(pt => ({
    day: fmtDate(pt.date),
    fore: pt.value,
    upper: pt.upper,
    lower: pt.lower,
  })) ?? [];

  const whoMax = WHO_MAX[param];

  return (
    <>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)', padding: 'var(--s4) var(--s5)', borderBottom: '1px solid var(--border-default)', flexWrap: 'wrap' }}>
          <Badge tone="info"><Brain size={11} style={{ marginRight: 4 }} />ML Forecast</Badge>
          <div className="tabs">
            {[7, 14, 30].map(d => (
              <button key={d} className={'tab-btn' + (days === d ? ' active' : '')} onClick={() => setDays(d)}>{d} days</button>
            ))}
          </div>
          <div className="tabs">
            {PARAMS.map(p => (
              <button key={p.key} className={'tab-btn' + (param === p.key ? ' active' : '')} onClick={() => setParam(p.key)}>{p.label}</button>
            ))}
          </div>
          <select className="form-control" style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8125rem', marginLeft: 'auto' }} value={utility} onChange={e => setUtility(e.target.value)}>
            {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={<TrendingUp size={16} />}
          title={`${days}-Day ${PARAMS.find(p => p.key === param)?.label ?? param} Forecast`}
          eyebrow={forecast ? `${forecast.utilityName} · ${forecast.modelUsed}` : 'Loading…'}
        />
        <CardBody>
          {loading && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--s6)' }}>Loading forecast…</p>}
          {!loading && chartData.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--s6)' }}>No forecast data available.</p>}
          {!loading && chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 24, bottom: 0, left: -10 }}>
                <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} interval={Math.max(0, Math.floor(chartData.length / 7) - 1)} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {whoMax != null && (
                  <ReferenceLine y={whoMax} stroke="var(--danger)" strokeDasharray="4 3" label={{ value: `WHO limit (${whoMax})`, fill: 'var(--danger)', fontSize: 10, position: 'right' }} />
                )}
                <Area type="monotone" dataKey="upper" stroke="transparent" fill="rgba(139,92,246,0.15)" name="Upper 95%" />
                <Area type="monotone" dataKey="lower" stroke="transparent" fill="var(--bg-card)" name="Lower 95%" />
                <Line type="monotone" dataKey="fore" stroke="var(--accent-purple)" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 3 }} name="Forecast" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
          {forecast && (
            <div style={{ display: 'flex', gap: 'var(--s6)', marginTop: 'var(--s4)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <span>Baseline: <strong className="mono">{forecast.baseline} {forecast.unit}</strong></span>
              <span>Model: <strong>{forecast.modelUsed}</strong></span>
              <span>Horizon: <strong>{forecast.days} days</strong></span>
            </div>
          )}
        </CardBody>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--s6)' }}>
        {/* Feature Importance */}
        <Card>
          <CardHeader title="Feature Importance" eyebrow={`RANDOM FOREST · ${param.toUpperCase()}`} />
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
            {!features && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>}
            {features?.features.map(f => (
              <div key={f.feature}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{f.feature}</span>
                  <span className="mono" style={{ color: 'var(--accent)' }}>{(f.importance * 100).toFixed(1)}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--border-subtle)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent-blue))', width: `${f.importance * 100}%` }} />
                </div>
              </div>
            ))}
            {features && (
              <div style={{ padding: 'var(--s3)', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', marginTop: 'var(--s2)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {features.trainingNote}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader title="ML Insights" eyebrow={`NEXT ${days} DAYS`} />
          <CardBody style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)', maxHeight: 340, overflowY: 'auto' }}>
            {insights.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading insights…</p>}
            {insights.map(ins => (
              <InsightCard key={ins.id} tone={ins.severity as 'safe' | 'warning' | 'danger' | 'info'} title={ins.title} body={ins.description} action={ins.recommendedAction} />
            ))}
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function InsightCard(props: { tone: 'safe' | 'warning' | 'danger' | 'info'; title: string; body: string; action: string }) {
  const bg = `var(--${props.tone === 'info' ? 'info' : props.tone}-bg)`;
  const fg = `var(--${props.tone === 'info' ? 'info' : props.tone})`;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--s3)', padding: 'var(--s3)', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 'var(--r-lg)', background: bg, color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Sparkles size={16} />
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: 2 }}>{props.title}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{props.body}</div>
        <div style={{ fontSize: '0.7rem', color: fg, marginTop: 4, fontWeight: 500 }}>→ {props.action}</div>
      </div>
    </div>
  );
}
