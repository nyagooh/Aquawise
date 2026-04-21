import { NavLink } from 'react-router-dom';

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M14 2C14 2 4 11 4 18A10 10 0 0024 18C24 11 14 2 14 2Z" fill="#00D4C8" />
                    <path d="M14 9C14 9 9 14 9 18A5 5 0 0019 18C19 14 14 9 14 9Z" fill="rgba(7,23,40,0.5)" />
                </svg>
                <span className="sidebar-logo-text">Aqua<span>Watch</span></span>
            </div>
            <nav className="sidebar-nav">
                <div className="nav-section-label">Monitor</div>
                <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} end>
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                    Dashboard
                </NavLink>
                <NavLink to="/locations" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    Locations
                </NavLink>
                <NavLink to="/alerts" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
                    Alerts
                    <span className="badge">3</span>
                </NavLink>
                <div className="nav-section-label">Analyse</div>
                <NavLink to="/historical" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    Historical Data
                </NavLink>
                <NavLink to="/predictive" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                    Predictive Analytics
                </NavLink>
                <NavLink to="/statistics" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
                    Statistics
                </NavLink>
                <div className="nav-section-label">Account</div>
                <NavLink to="/account" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    My Account
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                    Settings
                </NavLink>
            </nav>
            <div className="sidebar-footer">
                <div className="user-chip">
                    <div className="user-avatar">TL</div>
                    <div className="user-info">
                        <div className="user-name">Tom Lee</div>
                        <div className="user-role">Field Researcher</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
