import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

type Props = {
  active: 'dashboard' | 'gis' | 'alerts' | 'nrw' | 'sensors' | 'reports';
  title: string;
  sub?: string;
  children: ReactNode;
  pagePadding?: boolean;
  /** @deprecated retained for source compatibility — the right rail has been removed. */
  hideRightRail?: boolean;
};

export function Shell({ active, title, sub, children, pagePadding = true }: Props) {
  const [navCollapsed, setNavCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('aw-nav-collapsed') === '1';
  });

  useEffect(() => {
    localStorage.setItem('aw-nav-collapsed', navCollapsed ? '1' : '0');
  }, [navCollapsed]);

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
    </div>
  );
}
