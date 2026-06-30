const TOKEN_KEY = 'aw_access_token';
const REFRESH_KEY = 'aw_refresh_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(access: string, refresh?: string) {
  localStorage.setItem(TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_KEY);
}

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch('/api/v1/auth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || data.error || 'Invalid credentials');
  }
  const data = await res.json();
  setStoredToken(data.access, data.refresh);
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  organisation_name: string;
}

export async function register(payload: RegisterPayload): Promise<void> {
  const res = await fetch('/api/v1/auth/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    // DRF validation errors come back as { field: [messages] } or { detail: '...' }
    const first = Object.values(data)[0];
    const msg = Array.isArray(first) ? first[0] : (data.detail || data.error || 'Registration failed');
    throw new Error(String(msg));
  }
  const data = await res.json();
  setStoredToken(data.access, data.refresh);
}

export async function refreshToken(): Promise<boolean> {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return false;
  const res = await fetch('/api/v1/auth/token/refresh/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.access);
  return true;
}
