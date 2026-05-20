import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { api, tokenStorage } from '../lib/api';
import type { AuthUser } from '../types/api';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isLoading: true });

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get<AuthUser>('/auth/me/');
      setState({ user: data, isLoading: false });
    } catch {
      tokenStorage.clear();
      setState({ user: null, isLoading: false });
    }
  }, []);

  // On mount: if a token is stored, rehydrate the user
  useEffect(() => {
    if (tokenStorage.getAccess()) {
      fetchMe();
    } else {
      setState({ user: null, isLoading: false });
    }
  }, [fetchMe]);

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await api.post<{ access: string; refresh: string }>(
      '/auth/token/',
      { username, password },
    );
    tokenStorage.set(data.access, data.refresh);
    await fetchMe();
  }, [fetchMe]);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setState({ user: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
