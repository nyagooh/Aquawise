import { ReactNode } from 'react';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

type Props = {
  active: 'dashboard' | 'gis' | 'alerts' | 'nrw' | 'sensors' | 'reports';
  title: string;
  sub?: string;
  children: ReactNode;
  pagePadding?: boolean;
};

export function Shell({ active, title, sub, children, pagePadding = true }: Props) {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [drawerPanel, setDrawerPanel] = useState<'profile' | 'ai' | null>(null);
  return (
    <div className={`app${navCollapsed ? ' nav-collapsed' : ''}`}>
      <Sidebar
        active={active}
        collapsed={navCollapsed}
        onToggle={() => setNavCollapsed(v => !v)}
      />
      <main className="main">
        <Topbar
          title={title}
          sub={sub}
          onToggleNav={() => setNavCollapsed(v => !v)}
        />
        <div className="page" style={pagePadding ? undefined : { padding: 0, flex: 1 }}>
          {children}
        </div>
      </main>
      <aside className="right-edge-rail">
        <div className="right-edge-icons">
        <button
          className={`rail-icon-btn${drawerPanel === 'profile' ? ' active' : ''}`}
          title="Profile panel"
          onClick={() => setDrawerPanel(p => (p === 'profile' ? null : 'profile'))}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M20 21a8 8 0 00-16 0" />
            <circle cx={12} cy={7} r={4} />
          </svg>
        </button>
        <button
          className={`rail-icon-btn${drawerPanel === 'ai' ? ' active' : ''}`}
          title="AI panel"
          onClick={() => setDrawerPanel(p => (p === 'ai' ? null : 'ai'))}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x={4} y={4} width={16} height={16} rx={4} />
            <path d="M9 10h6M9 14h6" />
          </svg>
        </button>
        </div>
      </aside>
      <aside className={`profile-drawer${drawerPanel ? ' open' : ''}`}>
        <div className="profile-drawer-head">
          <div>
            <div className="card-title">{drawerPanel === 'ai' ? 'AI Copilot' : 'Profile'}</div>
            <div className="card-sub">{drawerPanel === 'ai' ? 'Assistant suggestions' : 'Session utilities'}</div>
          </div>
          <button className="sp-close" onClick={() => setDrawerPanel(null)}>✕</button>
        </div>
        <div className="profile-drawer-body">
          {drawerPanel !== 'ai' && (
            <>
              <div className="viewer-card">
                <div className="viewer-avatar">DM</div>
                <div>
                  <div className="viewer-name">Derrick Maina</div>
                  <div className="viewer-role">Operations Engineer · Nairobi West Utility</div>
                </div>
              </div>
              <div className="quick-meta">
                <div><span>Shift</span><strong>Morning (07:00–15:00)</strong></div>
                <div><span>Role</span><strong>Control Room</strong></div>
                <div><span>Status</span><strong style={{ color: 'hsl(var(--safe))' }}>Active</strong></div>
              </div>
            </>
          )}
          {drawerPanel === 'ai' && (
            <>
              <div className="ai-msg danger">Zone D pressure keeps dropping. Check P-104 to P-107 corridor first.</div>
              <div className="ai-msg">Zone B NRW trend has risen for 4 days. Run targeted night flow test.</div>
              <div className="ai-msg">PH-03 offline for 2h. Verify power and telemetry link.</div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>Open AI Chat</button>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
