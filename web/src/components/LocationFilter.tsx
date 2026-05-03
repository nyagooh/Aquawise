import { Search } from 'lucide-react';
import type { WaterSource, SourceStatus } from '../lib/api';

export type FilterState = {
  search: string;
  status: 'all' | SourceStatus;
  county: 'all' | string;
};

export const initialFilter: FilterState = { search: '', status: 'all', county: 'all' };

export function applyFilter(f: FilterState, utilities: WaterSource[]): WaterSource[] {
  const q = f.search.trim().toLowerCase();
  return utilities.filter(u => {
    if (f.status !== 'all' && u.status !== f.status) return false;
    if (f.county !== 'all' && u.county !== f.county) return false;
    if (q && !`${u.name} ${u.county}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export default function LocationFilter(props: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  utilities: WaterSource[];
  counties: string[];
  total: number;
  shown: number;
}) {
  const { value, onChange, utilities, counties } = props;
  const set = <K extends keyof FilterState>(key: K, v: FilterState[K]) => onChange({ ...value, [key]: v });

  const safe    = utilities.filter(u => u.status === 'safe').length;
  const warning = utilities.filter(u => u.status === 'warning').length;
  const danger  = utilities.filter(u => u.status === 'danger').length;

  return (
    <>
      <div className="card-actions">
        <div className="search-box" style={{ width: 240 }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search utility or county…"
            value={value.search}
            onChange={e => set('search', e.target.value)}
          />
        </div>
      </div>
      <div className="loc-filter-bar" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', padding: 'var(--s3) var(--s5)', borderBottom: '1px solid var(--border-default)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Status</span>
        <Chip active={value.status === 'all'}     onClick={() => set('status', 'all')}>All <Count>{utilities.length}</Count></Chip>
        <Chip active={value.status === 'safe'}    onClick={() => set('status', 'safe')}><span className="status-dot dot-safe"    style={{ marginRight: 4 }} />Safe <Count>{safe}</Count></Chip>
        <Chip active={value.status === 'warning'} onClick={() => set('status', 'warning')}><span className="status-dot dot-warning" style={{ marginRight: 4 }} />Warning <Count>{warning}</Count></Chip>
        <Chip active={value.status === 'danger'}  onClick={() => set('status', 'danger')}><span className="status-dot dot-danger"  style={{ marginRight: 4 }} />Critical <Count>{danger}</Count></Chip>

        <span style={{ width: 1, height: 18, background: 'var(--border-default)', margin: '0 var(--s2)' }} />
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>County</span>
        <Chip active={value.county === 'all'} onClick={() => set('county', 'all')}>All</Chip>
        {counties.map(c => (
          <Chip key={c} active={value.county === c} onClick={() => set('county', c)}>{c}</Chip>
        ))}

        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing {props.shown} of {props.total}
        </span>
      </div>
    </>
  );
}

function Chip(props: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={'loc-chip' + (props.active ? ' active' : '')} onClick={props.onClick}>
      {props.children}
    </button>
  );
}
function Count(props: { children: React.ReactNode }) {
  return <span style={{ opacity: 0.6, marginLeft: 4 }}>{props.children}</span>;
}
