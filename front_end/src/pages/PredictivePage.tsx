export default function PredictivePage() {
  return (
    <>


    {/*  Controls  */}
    <div className="card">
      <div className="card-body" style={{display: 'flex', alignItems: 'center', gap: 'var(--s4)', flexWrap: 'wrap'}}>
        <div style={{fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600}}>Model:</div>
        <div style={{display: 'flex', gap: 'var(--s2)', flexWrap: 'wrap'}}>
          <div className="model-chip active">🌲 Random Forest</div>
          <div className="model-chip">📈 Linear Regression</div>
          <div className="model-chip">🧠 Neural Network</div>
          <div className="model-chip">📊 Gradient Boost</div>
        </div>
        <div style={{width: '1px', height: '28px', background: 'var(--border-subtle)', margin: '0 var(--s2)'}}></div>
        <div style={{fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600}}>Horizon:</div>
        <div className="tabs"><button className="tab-btn">7 days</button><button className="tab-btn active">14 days</button><button className="tab-btn">30 days</button></div>
        <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--s3)'}}>
          <select className="form-control" style={{width: 'auto', padding: '6px 12px', fontSize: '0.8125rem'}}>
            <option>All Locations</option>
            <option>Crocodile River</option>
            <option>Limpopo River</option>
          </select>
        </div>
      </div>
    </div>

    {/*  Forecast Chart  */}
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
          14-Day Nitrates Forecast — Crocodile River
        </div>
        <div className="card-actions">
          <div className="chart-tabs" style={{display: 'flex', gap: '4px'}}>
            <button className="chart-tab active" style={{fontSize: '0.75rem'}}>Nitrates</button>
            <button className="chart-tab" style={{fontSize: '0.75rem'}}>pH</button>
            <button className="chart-tab" style={{fontSize: '0.75rem'}}>DO</button>
            <button className="chart-tab" style={{fontSize: '0.75rem'}}>Turbidity</button>
          </div>
        </div>
      </div>
      <div className="card-body">
        <canvas id="forecast-chart" height="180"></canvas>
        <div style={{display: 'flex', gap: 'var(--s6)', marginTop: 'var(--s4)', flexWrap: 'wrap'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 'var(--s2)', fontSize: '0.75rem', color: 'var(--text-secondary)'}}><span style={{width: '20px', height: '2px', background: 'var(--accent-blue)', display: 'inline-block'}}></span>Historical</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 'var(--s2)', fontSize: '0.75rem', color: 'var(--text-secondary)'}}><span style={{width: '20px', height: '2px', background: 'var(--accent-purple)', display: 'inline-block'}}></span>Forecast</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 'var(--s2)', fontSize: '0.75rem', color: 'var(--text-secondary)'}}><span style={{width: '20px', height: '6px', background: 'rgba(156,137,226,0.15)', display: 'inline-block', borderRadius: '2px'}}></span>Confidence (95%)</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 'var(--s2)', fontSize: '0.75rem', color: 'var(--text-secondary)'}}><span style={{width: '20px', height: '2px', background: 'var(--danger)', display: 'inline-block', borderTop: '2px dashed var(--danger)'}}></span>Safety limit (45)</div>
        </div>
      </div>
    </div>

    <div className="analytics-grid">
      {/*  Risk Heatmap  */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
            14-Day Risk Heatmap
          </div>
          <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>All Locations × All Parameters</span>
        </div>
        <div className="card-body">
          {/*  Y labels + grid  */}
          <div style={{display: 'flex', gap: 'var(--s3)'}}>
            <div style={{display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'space-around', paddingTop: '24px'}}>
              <div style={{fontSize: '0.625rem', color: 'var(--text-muted)', textAlign: 'right', width: '60px', whiteSpace: 'nowrap'}}>pH</div>
              <div style={{fontSize: '0.625rem', color: 'var(--text-muted)', textAlign: 'right', width: '60px', whiteSpace: 'nowrap'}}>Turbidity</div>
              <div style={{fontSize: '0.625rem', color: 'var(--text-muted)', textAlign: 'right', width: '60px', whiteSpace: 'nowrap'}}>DO</div>
              <div style={{fontSize: '0.625rem', color: 'var(--text-muted)', textAlign: 'right', width: '60px', whiteSpace: 'nowrap'}}>Nitrates</div>
            </div>
            <div style={{flex: 1}}>
              <div className="risk-labels">
                <div className="risk-label">CRR</div><div className="risk-label">LIM</div><div className="risk-label">OLI</div>
                <div className="risk-label">VAL</div><div className="risk-label">ORG</div><div className="risk-label">UMG</div>
                <div className="risk-label">BRG</div><div className="risk-label">BRD</div>
              </div>
              {/*  pH row  */}
              <div className="risk-grid" style={{marginBottom: '4px'}}>
                <div className="risk-cell risk-low">L</div><div className="risk-cell risk-low">L</div><div className="risk-cell risk-low">L</div>
                <div className="risk-cell risk-low">L</div><div className="risk-cell risk-low">L</div><div className="risk-cell risk-low">L</div>
                <div className="risk-cell risk-low">L</div><div className="risk-cell risk-low">L</div>
              </div>
              {/*  Turbidity row  */}
              <div className="risk-grid" style={{marginBottom: '4px'}}>
                <div className="risk-cell risk-low">L</div><div className="risk-cell risk-med">M</div><div className="risk-cell risk-low">L</div>
                <div className="risk-cell risk-low">L</div><div className="risk-cell risk-low">L</div><div className="risk-cell risk-low">L</div>
                <div className="risk-cell risk-low">L</div><div className="risk-cell risk-low">L</div>
              </div>
              {/*  DO row  */}
              <div className="risk-grid" style={{marginBottom: '4px'}}>
                <div className="risk-cell risk-low">L</div><div className="risk-cell risk-low">L</div><div className="risk-cell risk-med">M</div>
                <div className="risk-cell risk-low">L</div><div className="risk-cell risk-low">L</div><div className="risk-cell risk-low">L</div>
                <div className="risk-cell risk-low">L</div><div className="risk-cell risk-low">L</div>
              </div>
              {/*  Nitrates row  */}
              <div className="risk-grid">
                <div className="risk-cell risk-high">H</div><div className="risk-cell risk-med">M</div><div className="risk-cell risk-low">L</div>
                <div className="risk-cell risk-low">L</div><div className="risk-cell risk-low">L</div><div className="risk-cell risk-low">L</div>
                <div className="risk-cell risk-low">L</div><div className="risk-cell risk-low">L</div>
              </div>
            </div>
          </div>
          <div style={{display: 'flex', gap: 'var(--s4)', marginTop: 'var(--s4)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 'var(--s2)', fontSize: '0.6875rem', color: 'var(--text-muted)'}}><span className="status-dot dot-safe"></span>Low risk</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 'var(--s2)', fontSize: '0.6875rem', color: 'var(--text-muted)'}}><span className="status-dot dot-warning"></span>Medium risk</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 'var(--s2)', fontSize: '0.6875rem', color: 'var(--text-muted)'}}><span className="status-dot dot-danger"></span>High risk</div>
          </div>
        </div>
      </div>

      {/*  Feature Importance  */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Feature Importance
          </div>
          <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Random Forest · Nitrates</span>
        </div>
        <div className="card-body" style={{display: 'flex', flexDirection: 'column', gap: 'var(--s4)'}}>
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s2)', fontSize: '0.8125rem'}}>
              <span style={{color: 'var(--text-secondary)'}}>SWIR22</span>
              <span style={{fontFamily: 'var(--font-mono)', color: 'var(--accent)'}}>31.4%</span>
            </div>
            <div className="feature-bar-wrap"><div className="feature-bar"><div className="feature-fill" style={{width: '31.4%'}}></div></div></div>
          </div>
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s2)', fontSize: '0.8125rem'}}>
              <span style={{color: 'var(--text-secondary)'}}>NDMI</span>
              <span style={{fontFamily: 'var(--font-mono)', color: 'var(--accent)'}}>24.8%</span>
            </div>
            <div className="feature-bar-wrap"><div className="feature-bar"><div className="feature-fill" style={{width: '24.8%'}}></div></div></div>
          </div>
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s2)', fontSize: '0.8125rem'}}>
              <span style={{color: 'var(--text-secondary)'}}>PET</span>
              <span style={{fontFamily: 'var(--font-mono)', color: 'var(--accent)'}}>18.2%</span>
            </div>
            <div className="feature-bar-wrap"><div className="feature-bar"><div className="feature-fill" style={{width: '18.2%'}}></div></div></div>
          </div>
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s2)', fontSize: '0.8125rem'}}>
              <span style={{color: 'var(--text-secondary)'}}>MNDWI</span>
              <span style={{fontFamily: 'var(--font-mono)', color: 'var(--accent)'}}>14.1%</span>
            </div>
            <div className="feature-bar-wrap"><div className="feature-bar"><div className="feature-fill" style={{width: '14.1%'}}></div></div></div>
          </div>
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s2)', fontSize: '0.8125rem'}}>
              <span style={{color: 'var(--text-secondary)'}}>NIR</span>
              <span style={{fontFamily: 'var(--font-mono)', color: 'var(--accent)'}}>7.4%</span>
            </div>
            <div className="feature-bar-wrap"><div className="feature-bar"><div className="feature-fill" style={{width: '7.4%'}}></div></div></div>
          </div>
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s2)', fontSize: '0.8125rem'}}>
              <span style={{color: 'var(--text-secondary)'}}>Green Band</span>
              <span style={{fontFamily: 'var(--font-mono)', color: 'var(--accent)'}}>4.1%</span>
            </div>
            <div className="feature-bar-wrap"><div className="feature-bar"><div className="feature-fill" style={{width: '4.1%'}}></div></div></div>
          </div>
          <div style={{padding: 'var(--s3)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', marginTop: 'var(--s2)'}}>
            <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Model performance</div>
            <div style={{display: 'flex', gap: 'var(--s6)', marginTop: 'var(--s2)'}}>
              <div><div style={{fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--accent)'}}>0.58</div><div style={{fontSize: '0.6875rem', color: 'var(--text-muted)'}}>R² (test)</div></div>
              <div><div style={{fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)'}}>35.2</div><div style={{fontSize: '0.6875rem', color: 'var(--text-muted)'}}>RMSE</div></div>
              <div><div style={{fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--accent)'}}>0.91</div><div style={{fontSize: '0.6875rem', color: 'var(--text-muted)'}}>R² (train)</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/*  AI Insights  */}
    <div className="card">
      <div className="card-header">
        <div className="card-title">🤖 AI Insights</div>
        <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Generated from 14-day forecast</span>
      </div>
      <div className="card-body" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'var(--s4)'}}>
        <div className="insight-card">
          <div className="insight-icon" style={{background: 'var(--danger-bg)'}}>⚠️</div>
          <div>
            <div style={{fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px'}}>Nitrate spike predicted</div>
            <div style={{fontSize: '0.8125rem', color: 'var(--text-secondary)'}}>Crocodile River nitrates likely to remain above 45 mg/L for the next 4–7 days. Recommend immediate investigation.</div>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon" style={{background: 'var(--warning-bg)'}}>📉</div>
          <div>
            <div style={{fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px'}}>DO recovery expected</div>
            <div style={{fontSize: '0.8125rem', color: 'var(--text-secondary)'}}>Olifants River dissolved oxygen predicted to recover above 5.0 mg/L within 3 days based on temperature trend.</div>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon" style={{background: 'var(--safe-bg)'}}>✅</div>
          <div>
            <div style={{fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px'}}>Network stable</div>
            <div style={{fontSize: '0.8125rem', color: 'var(--text-secondary)'}}>5 of 8 locations forecast to remain within all safe thresholds for the full 14-day period.</div>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon" style={{background: 'var(--info-bg)'}}>🌡️</div>
          <div>
            <div style={{fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px'}}>Seasonal pattern detected</div>
            <div style={{fontSize: '0.8125rem', color: 'var(--text-secondary)'}}>Model detects PET (evapotranspiration) as the top seasonal predictor for nitrate levels across Limpopo basin.</div>
          </div>
        </div>
      </div>
    </div>

  
    </>
  );
}
