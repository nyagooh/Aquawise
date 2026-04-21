export default function Header() {
    return (
        <>
            {/* Mobile top bar */}
            <div className="mobile-topbar">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                    <path d="M14 2C14 2 4 11 4 18A10 10 0 0024 18C24 11 14 2 14 2Z" fill="#00D4C8" />
                </svg>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Aqua<span style={{ color: 'var(--accent)' }}>Watch</span></span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--s3)' }}>
                    <button className="icon-btn">
                        <div className="dot"></div>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 01-3.46 0" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Top bar */}
            <div className="topbar">
                <div className="topbar-title">
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Good morning,</span> Tom 👋
                </div>
                <div className="last-updated">
                    <div className="live-dot"></div> Live · Updated just now
                </div>
                <div className="topbar-actions">
                    <button className="icon-btn" title="Notifications">
                        <div className="dot"></div>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 01-3.46 0" />
                        </svg>
                    </button>
                    <button className="icon-btn" title="Refresh">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="23 4 23 10 17 10" />
                            <polyline points="1 20 1 14 7 14" />
                            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                        </svg>
                    </button>
                    <div className="user-avatar" style={{ cursor: 'pointer' }}>TL</div>
                </div>
            </div>
        </>
    );
}
