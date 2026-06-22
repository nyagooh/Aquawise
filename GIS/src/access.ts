/**
 * Demo access gate. The live demo is gated behind a short lead-capture form —
 * once a visitor submits it (email + company + why), we remember it for the
 * rest of the browser session so they aren't asked again.
 */
const KEY = 'aw:demo-access';

export function hasDemoAccess(): boolean {
  return sessionStorage.getItem(KEY) === 'granted';
}

export function grantDemoAccess(): void {
  sessionStorage.setItem(KEY, 'granted');
}
