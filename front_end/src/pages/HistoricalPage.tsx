export default function HistoricalPage() {
  return (
    <>


    {/*  Upload Section  */}
    <div className="two-col">
      <div>
        <div className="upload-zone" id="drop-zone" 
          onDragOver={() => {}}
          onDragLeave={() => {}}
          onDrop={() => {}}>
          <input type="file" id="file-input" accept=".csv,.xlsx,.xls" onChange={() => {}} />
          <div className="upload-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <h3 style={{fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--s2)'}}>Drop your data file here</h3>
          <p style={{fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--s4)'}}>or click to browse · Supports CSV, XLSX</p>
          <div style={{display: 'flex', justifyContent: 'center', gap: 'var(--s3)'}}>
            <span className="badge badge-neutral">CSV</span>
            <span className="badge badge-neutral">XLSX</span>
            <span className="badge badge-neutral">XLS</span>
          </div>
          <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--s4)'}}>Max file size: 50 MB</p>
        </div>

        {/*  Upload Progress (shown during upload)  */}
        <div id="upload-progress" style={{marginTop: 'var(--s4)', display: 'none'}}>
          <div className="progress-wrap">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 'var(--s3)'}}>
                <div style={{fontSize: '1.25rem'}}>📄</div>
                <div>
                  <div style={{fontSize: '0.875rem', fontWeight: 600}} id="upload-filename">water_quality_jan2024.csv</div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}} id="upload-size">2.4 MB · Uploading…</div>
                </div>
              </div>
              <button className="btn btn-sm btn-ghost" style={{color: 'var(--danger)'}}>Cancel</button>
            </div>
            <div className="progress-bar"><div className="progress-fill" id="progress-fill" style={{width: '0%'}}></div></div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)'}}>
              <span id="progress-text">0%</span>
              <span>Validating columns…</span>
            </div>
          </div>
        </div>
      </div>

      {/*  Upload Format Guide  */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Expected Format
          </div>
          <button className="btn btn-sm btn-primary">Download Template</button>
        </div>
        <div className="card-body">
          <p style={{fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--s4)'}}>Your CSV/Excel file must contain these columns:</p>
          <table className="preview-table">
            <thead><tr><th>Column</th><th>Type</th><th>Example</th><th>Required</th></tr></thead>
            <tbody>
              <tr><td>timestamp</td><td><span className="badge badge-info">datetime</span></td><td className="mono">2024-01-15 08:30</td><td><span className="badge badge-danger">Yes</span></td></tr>
              <tr><td>location_id</td><td><span className="badge badge-neutral">text</span></td><td className="mono">CRR-004</td><td><span className="badge badge-danger">Yes</span></td></tr>
              <tr><td>ph</td><td><span className="badge badge-info">float</span></td><td className="mono">7.42</td><td><span className="badge badge-danger">Yes</span></td></tr>
              <tr><td>turbidity</td><td><span className="badge badge-info">float</span></td><td className="mono">2.1</td><td><span className="badge badge-warning">Optional</span></td></tr>
              <tr><td>dissolved_o2</td><td><span className="badge badge-info">float</span></td><td className="mono">8.3</td><td><span className="badge badge-warning">Optional</span></td></tr>
              <tr><td>nitrates</td><td><span className="badge badge-info">float</span></td><td className="mono">12.4</td><td><span className="badge badge-warning">Optional</span></td></tr>
              <tr><td>temperature</td><td><span className="badge badge-info">float</span></td><td className="mono">22.1</td><td><span className="badge badge-warning">Optional</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/*  Data Preview (shown after upload)  */}
    <div className="card" id="data-preview" style={{display: 'none'}}>
      <div className="card-header">
        <div className="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Data Preview — water_quality_jan2024.csv
        </div>
        <div className="card-actions">
          <span className="badge badge-safe">✓ 847 valid rows</span>
          <span className="badge badge-warning">3 warnings</span>
          <button className="btn btn-sm btn-secondary">Back</button>
          <button className="btn btn-sm btn-primary">Confirm Upload</button>
        </div>
      </div>
      <div style={{padding: 'var(--s4) var(--s6)', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)'}}>
        <div style={{display: 'flex', gap: 'var(--s6)', flexWrap: 'wrap'}}>
          <div style={{fontSize: '0.8125rem'}}><span style={{color: 'var(--text-muted)'}}>Rows: </span><span style={{fontWeight: 600, color: 'var(--text-primary)'}}>847</span></div>
          <div style={{fontSize: '0.8125rem'}}><span style={{color: 'var(--text-muted)'}}>Columns: </span><span style={{fontWeight: 600, color: 'var(--text-primary)'}}>7</span></div>
          <div style={{fontSize: '0.8125rem'}}><span style={{color: 'var(--text-muted)'}}>Date range: </span><span style={{fontWeight: 600, color: 'var(--text-primary)'}}>Jan 1 – Jan 31, 2024</span></div>
          <div style={{fontSize: '0.8125rem'}}><span style={{color: 'var(--text-muted)'}}>Missing values: </span><span style={{fontWeight: 600, color: 'var(--warning)'}}>12 (1.4%)</span></div>
        </div>
      </div>
      <div className="table-wrap">
        <table className="preview-table">
          <thead><tr><th>#</th><th>timestamp</th><th>location_id</th><th>ph</th><th>turbidity</th><th>dissolved_o2</th><th>nitrates</th><th>temperature</th></tr></thead>
          <tbody>
            <tr><td style={{color: 'var(--text-muted)'}}>1</td><td className="mono">2024-01-01 06:00</td><td>CRR-004</td><td className="mono">7.2</td><td className="mono">2.1</td><td className="mono">6.8</td><td className="mono" style={{color: 'var(--warning)'}}>46.1</td><td className="mono">21.3</td></tr>
            <tr><td style={{color: 'var(--text-muted)'}}>2</td><td className="mono">2024-01-01 06:15</td><td>CRR-004</td><td className="mono">7.3</td><td className="mono">2.0</td><td className="mono">7.0</td><td className="mono">44.2</td><td className="mono">21.4</td></tr>
            <tr><td style={{color: 'var(--text-muted)'}}>3</td><td className="mono">2024-01-01 06:30</td><td>VAL-002</td><td className="mono">7.6</td><td className="mono">0.9</td><td className="mono" style={{color: 'var(--danger)'}}>—</td><td className="mono">6.1</td><td className="mono">18.2</td></tr>
            <tr><td style={{color: 'var(--text-muted)'}}>4</td><td className="mono">2024-01-01 06:45</td><td>VAL-002</td><td className="mono">7.7</td><td className="mono">0.8</td><td className="mono">9.3</td><td className="mono">5.9</td><td className="mono">18.1</td></tr>
            <tr><td style={{color: 'var(--text-muted)'}}>5</td><td className="mono">2024-01-01 07:00</td><td>ORG-006</td><td className="mono">8.0</td><td className="mono">1.1</td><td className="mono">8.5</td><td className="mono">9.0</td><td className="mono">19.7</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    {/*  Uploaded Datasets  */}
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Uploaded Datasets
        </div>
        <div className="card-actions">
          <div className="search-box"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Search datasets…" /></div>
        </div>
      </div>
      <div>
        <div className="dataset-row">
          <div className="file-icon" style={{background: 'rgba(0,212,200,0.1)'}}>📊</div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)'}}>water_quality_jan2024.csv</div>
            <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>847 rows · 7 columns · Jan 1–31, 2024</div>
          </div>
          <span className="badge badge-safe">Processed</span>
          <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>2.4 MB</span>
          <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Today</span>
          <div style={{display: 'flex', gap: 'var(--s2)'}}>
            <button className="btn btn-sm btn-ghost">View</button>
            <button className="btn btn-sm btn-secondary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          </div>
        </div>
        <div className="dataset-row">
          <div className="file-icon" style={{background: 'rgba(79,195,247,0.1)'}}>📈</div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)'}}>sensor_readings_q4_2023.xlsx</div>
            <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>3,241 rows · 8 columns · Oct–Dec 2023</div>
          </div>
          <span className="badge badge-safe">Processed</span>
          <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>8.7 MB</span>
          <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>3 days ago</span>
          <div style={{display: 'flex', gap: 'var(--s2)'}}><button className="btn btn-sm btn-ghost">View</button><button className="btn btn-sm btn-secondary"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button></div>
        </div>
        <div className="dataset-row">
          <div className="file-icon" style={{background: 'rgba(255,167,38,0.1)'}}>⚠️</div>
          <div style={{flex: 1, minWidth: 0}}>
            <div style={{fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)'}}>field_samples_crocodile.csv</div>
            <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>128 rows · 5 columns · Mar 2023</div>
          </div>
          <span className="badge badge-warning">12 Warnings</span>
          <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>0.3 MB</span>
          <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>1 week ago</span>
          <div style={{display: 'flex', gap: 'var(--s2)'}}><button className="btn btn-sm btn-ghost">Review</button><button className="btn btn-sm btn-secondary"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button></div>
        </div>
      </div>
    </div>

  
    </>
  );
}
