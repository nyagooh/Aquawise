import { ReactNode } from 'react';
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
  return (
    <div className="app">
      <Sidebar active={active} />
      <main className="main">
        <Topbar title={title} sub={sub} />
        <div className="page" style={pagePadding ? undefined : { padding: 0, flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
