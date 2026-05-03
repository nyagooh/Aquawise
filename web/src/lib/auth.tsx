import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile } from './api';

interface AuthCtx {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: UserProfile | null;
  setUser: (u: UserProfile) => void;
  login: (access: string, refresh: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    try { return localStorage.getItem('aq_access'); } catch { return null; }
  });
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!accessToken || accessToken === 'demo-token') return;
    fetch('http://localhost:8000/api/users/me/', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setUser(data); })
      .catch(() => {});
  }, [accessToken]);

  const login = (access: string, refresh: string) => {
    localStorage.setItem('aq_access', access);
    localStorage.setItem('aq_refresh', refresh);
    setAccessToken(access);
  };

  const logout = async () => {
    const refresh = localStorage.getItem('aq_refresh');
    const access = localStorage.getItem('aq_access');
    if (refresh && access && access !== 'demo-token') {
      try {
        await fetch('http://localhost:8000/api/auth/logout/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access}` },
          body: JSON.stringify({ refresh }),
        });
      } catch { /* clear tokens regardless */ }
    }
    localStorage.removeItem('aq_access');
    localStorage.removeItem('aq_refresh');
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!accessToken, accessToken, user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
