import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

const Logo = () => (
  <Link to="/home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
    <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
      <path d="M14 2C14 2 4 11 4 18A10 10 0 0024 18C24 11 14 2 14 2Z" fill="#3B82F6" />
      <path d="M14 9C14 9 9 14 9 18A5 5 0 0019 18C19 14 14 9 14 9Z" fill="rgba(6,10,20,0.55)" />
    </svg>
    <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
      Aqua<span style={{ color: 'var(--accent-bright)' }}>Wise</span>
    </span>
  </Link>
);

export default function LandingLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    fontSize: '0.9rem',
    fontWeight: 500,
    color: isActive ? 'var(--accent-bright)' : 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'color var(--t-fast)',
    padding: '4px 0',
    borderBottom: isActive ? '2px solid var(--accent-bright)' : '2px solid transparent',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: scrolled
          ? 'color-mix(in srgb, var(--bg-surface) 88%, transparent)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(16px) saturate(160%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(160%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-default)' : '1px solid transparent',
        transition: 'all var(--t-base)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', gap: 32 }}>
          <Logo />

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, flex: 1 }} className="landing-desktop-nav">
            <NavLink to="/home" style={navLinkStyle}>Home</NavLink>
            <NavLink to="/about" style={navLinkStyle}>About</NavLink>
            <NavLink to="/contact" style={navLinkStyle}>Contact</NavLink>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="landing-desktop-nav">
            <Link to="/login" style={{
              fontSize: '0.875rem', fontWeight: 500,
              color: 'var(--text-secondary)', textDecoration: 'none',
              padding: '8px 16px', borderRadius: 'var(--r-md)',
              transition: 'all var(--t-fast)',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Log in
            </Link>
            <Link to="/register" style={{
              fontSize: '0.875rem', fontWeight: 600,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-dim))',
              color: 'var(--on-accent)', textDecoration: 'none',
              padding: '8px 20px', borderRadius: 'var(--r-md)',
              boxShadow: '0 4px 14px var(--accent-glow)',
              transition: 'all var(--t-fast)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px var(--accent-glow)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px var(--accent-glow)'; }}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="landing-mobile-menu-btn"
            onClick={() => setMenuOpen(v => !v)}
            style={{ marginLeft: 'auto', display: 'none', flexDirection: 'column', gap: 5, padding: 8, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{ display: 'block', width: 22, height: 2, background: 'var(--text-secondary)', borderRadius: 2, transition: 'all var(--t-fast)' }} />
            ))}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{
            background: 'var(--bg-surface)', borderTop: '1px solid var(--border-default)',
            padding: '16px 24px 20px', display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {[['Home', '/home'], ['About', '/about'], ['Contact', '/contact']].map(([label, path]) => (
              <NavLink key={path} to={path} style={({ isActive }) => ({
                padding: '10px 12px', borderRadius: 'var(--r-md)',
                fontWeight: 500, fontSize: '0.95rem',
                color: isActive ? 'var(--accent-bright)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                textDecoration: 'none',
              })}>
                {label}
              </NavLink>
            ))}
            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 8, paddingTop: 12, display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Log in</Link>
              <Link to="/register" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Page content ── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border-default)',
        background: 'var(--bg-surface)',
        padding: '48px 24px 32px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
            <div>
              <Logo />
              <p style={{ marginTop: 14, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 260 }}>
                AI-powered water quality monitoring protecting communities across Kenya and beyond.
              </p>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 14, color: 'var(--text-primary)' }}>Product</p>
              {[['Dashboard', '/dashboard'], ['Features', '/home#features'], ['Pricing', '/home#pricing']].map(([label, path]) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <Link to={path} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >{label}</Link>
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 14, color: 'var(--text-primary)' }}>Company</p>
              {[['About', '/about'], ['Contact', '/contact'], ['Blog', '#']].map(([label, path]) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <Link to={path} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >{label}</Link>
                </div>
              ))}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 14, color: 'var(--text-primary)' }}>Contact</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Kisumu, Kenya</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8 }}>hello@aquawise.io</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>+254 700 000 000</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              © 2025 AquaWise. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Privacy Policy', 'Terms of Service'].map(label => (
                <a key={label} href="#" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
