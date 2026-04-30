import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Download, Search, Database } from 'lucide-react';
import { Card, CardHeader, CardBody, Badge } from '../components/ui';

export default function Historical() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setShowPreview(true);
      }
    }, 200);
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--s6)' }}>
        <div>
          <Card>
            <div
              style={{
                padding: 'var(--s10)',
                border: '2px dashed var(--border-default)',
                borderRadius: 'var(--r-xl)',
                textAlign: 'center',
                cursor: 'pointer',
              }}
              onClick={handleUpload}
            >
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-glow)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--s4)' }}>
                <Upload size={24} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--s2)' }}>Drop your data file here</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--s4)' }}>or click to browse · Supports CSV, XLSX</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--s2)' }}>
                <Badge tone="neutral">CSV</Badge>
                <Badge tone="neutral">XLSX</Badge>
                <Badge tone="neutral">XLS</Badge>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--s4)' }}>Max file size: 50 MB</p>
            </div>

            {isUploading && (
              <div style={{ marginTop: 'var(--s6)', padding: 'var(--s4)', background: 'var(--bg-card)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                    <FileText size={20} color="var(--accent)" />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>water_quality_jan2024.csv</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2.4 MB · Uploading…</div>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-ghost" style={{ color: 'var(--danger)' }} onClick={() => setIsUploading(false)}>Cancel</button>
                </div>
                <div style={{ height: 6, background: 'var(--border-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--accent)', width: `${progress}%`, transition: 'width 0.2s linear' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--s2)' }}>
                  <span>{progress}%</span>
                  <span>Validating columns…</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card>
          <CardHeader
            icon={<FileText size={16} />}
            title="Expected Format"
            actions={<button className="btn btn-sm btn-primary">Download Template</button>}
          />
          <CardBody>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--s4)' }}>Your CSV/Excel file must contain these columns:</p>
            <div className="table-wrap">
              <table style={{ fontSize: '0.8125rem' }}>
                <thead><tr><th>Column</th><th>Type</th><th>Example</th></tr></thead>
                <tbody>
                  <tr><td>timestamp</td><td><Badge tone="info">datetime</Badge></td><td className="mono">2024-01-15</td></tr>
                  <tr><td>location_id</td><td><Badge tone="neutral">text</Badge></td><td className="mono">CRR-004</td></tr>
                  <tr><td>ph</td><td><Badge tone="info">float</Badge></td><td className="mono">7.42</td></tr>
                  <tr><td>turbidity</td><td><Badge tone="info">float</Badge></td><td className="mono">2.1</td></tr>
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {showPreview && (
        <Card style={{ marginTop: 'var(--s6)' }}>
          <CardHeader
            title="Data Preview — water_quality_jan2024.csv"
            actions={
              <div style={{ display: 'flex', gap: 'var(--s2)' }}>
                <Badge tone="safe">✓ 847 valid rows</Badge>
                <button className="btn btn-sm btn-secondary" onClick={() => setShowPreview(false)}>Back</button>
                <button className="btn btn-sm btn-primary">Confirm Upload</button>
              </div>
            }
          />
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>timestamp</th><th>location_id</th><th>ph</th><th>turbidity</th><th>nitrates</th></tr>
              </thead>
              <tbody>
                <tr><td>1</td><td className="mono">2024-01-01 06:00</td><td>CRR-004</td><td className="mono">7.2</td><td className="mono">2.1</td><td className="mono" style={{ color: 'var(--warning)' }}>46.1</td></tr>
                <tr><td>2</td><td className="mono">2024-01-01 06:15</td><td>CRR-004</td><td className="mono">7.3</td><td className="mono">2.0</td><td className="mono">44.2</td></tr>
                <tr><td>3</td><td className="mono">2024-01-01 06:30</td><td>VAL-002</td><td className="mono">7.6</td><td className="mono">0.9</td><td className="mono">6.1</td></tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card style={{ marginTop: 'var(--s6)' }}>
        <CardHeader
          icon={<Database size={16} />}
          title="Uploaded Datasets"
          actions={
            <div className="search-box">
              <Search size={14} color="var(--text-muted)" />
              <input type="text" placeholder="Search datasets…" />
            </div>
          }
        />
        <div className="table-wrap">
          <table className="stat-table">
            <thead>
              <tr><th>Dataset</th><th>Rows</th><th>Date Range</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📊</div>
                    <div style={{ fontWeight: 600 }}>water_quality_jan2024.csv</div>
                  </div>
                </td>
                <td>847</td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Jan 1–31, 2024</td>
                <td><Badge tone="safe">Processed</Badge></td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--s2)' }}>
                    <button className="btn btn-sm btn-ghost">View</button>
                    <button className="btn btn-sm btn-secondary"><Download size={14} /></button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s3)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📈</div>
                    <div style={{ fontWeight: 600 }}>sensor_readings_q4_2023.xlsx</div>
                  </div>
                </td>
                <td>3,241</td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Oct–Dec 2023</td>
                <td><Badge tone="safe">Processed</Badge></td>
                <td>
                  <div style={{ display: 'flex', gap: 'var(--s2)' }}>
                    <button className="btn btn-sm btn-ghost">View</button>
                    <button className="btn btn-sm btn-secondary"><Download size={14} /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
