import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthCtx {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem('aq_token'); } catch { return null; }
  });

  const login = (tok: string) => {
    localStorage.setItem('aq_token', tok);
    setToken(tok);
  };

  const logout = () => {
    localStorage.removeItem('aq_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
