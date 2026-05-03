import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Bell, BarChart3, TrendingUp, Settings, User, Droplets, Database, LogOut,
} from 'lucide-react';
import { useAuth } from '../lib/auth';

const sections = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard',  label: 'Dashboard',         icon: LayoutDashboard },
      { to: '/predictive', label: 'Predictive',        icon: TrendingUp },
      { to: '/statistics', label: 'Statistics',        icon: BarChart3 },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/locations/nairobi', label: 'Locations',       icon: MapPin },
      { to: '/alerts',            label: 'Alerts',          icon: Bell, badge: 3 },
      { to: '/historical',        label: 'Historical Data', icon: Database },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
      { to: '/account',  label: 'Account',  icon: User },
    ],
  },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/home', { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Droplets size={22} color="var(--accent)" />
        <div className="sidebar-logo-text">Aqua<span>Wise</span></div>
      </div>
      <nav className="sidebar-nav">
        {sections.map(section => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
              >
                <item.icon className="nav-icon" size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="badge">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <NavLink to="/account" className="user-chip">
          <div className="user-avatar">
            {user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : '?'}
          </div>
          <div className="user-info">
            <div className="user-name">{user ? `${user.firstName} ${user.lastName}` : 'Account'}</div>
            <div className="user-role">{user?.organization || 'Aquawise'}</div>
          </div>
        </NavLink>
        <button
          onClick={handleLogout}
          title="Log out"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', marginTop: 4,
            padding: '8px 12px', borderRadius: 'var(--r-md)',
            color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500,
            background: 'none', border: 'none', cursor: 'pointer',
            transition: 'all var(--t-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
