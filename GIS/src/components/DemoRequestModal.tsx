/**
 * DemoRequestModal — lead-capture form gating the live demo and powering the
 * "Book a Walkthrough" CTA. Collects work email + company + why, posts it to
 * the backend (which emails the team), then either unlocks the demo or shows a
 * confirmation for booking requests.
 */
import { useEffect, useState } from 'react';
import { submitDemoRequest } from '../api';

export type DemoRequestMode = 'demo' | 'book';

interface Props {
  open: boolean;
  mode: DemoRequestMode;
  onClose: () => void;
  /** Called after a successful submit (e.g. to navigate into the demo). */
  onSuccess?: () => void;
}

const COPY: Record<DemoRequestMode, { title: string; sub: string; cta: string; busy: string }> = {
  demo: {
    title: 'See the live demo',
    sub: 'Tell us who you are and we’ll open the live Kisumu network demo. No password needed.',
    cta: 'Open the live demo →',
    busy: 'Submitting…',
  },
  book: {
    title: 'Book a walkthrough',
    sub: 'Leave your details and a short note — we’ll email you to schedule a 30-minute walkthrough.',
    cta: 'Request walkthrough →',
    busy: 'Sending…',
  },
};

export function DemoRequestModal({ open, mode, onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Reset transient state whenever the modal is (re)opened.
  useEffect(() => {
    if (open) { setError(null); setDone(false); setBusy(false); }
  }, [open, mode]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const copy = COPY[mode];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await submitDemoRequest({ name: name.trim(), email: email.trim(), company: company.trim(), reason: reason.trim(), kind: mode });
      if (mode === 'demo') {
        onSuccess?.();
      } else {
        setDone(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="demo-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={copy.title}>
      <div className="demo-modal" onClick={(e) => e.stopPropagation()}>
        <button className="demo-modal-close" onClick={onClose} aria-label="Close">×</button>

        {done ? (
          <div className="demo-modal-done">
            <div className="demo-modal-check" aria-hidden>✓</div>
            <h2>Thanks, {name || 'we’ve got it'}.</h2>
            <p>Your request was sent to our team — we’ll be in touch at <strong>{email}</strong> shortly.</p>
            <button className="btn btn-primary btn-lg" onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <header className="demo-modal-head">
              <h2>{copy.title}</h2>
              <p>{copy.sub}</p>
            </header>
            <form className="demo-modal-form" onSubmit={submit}>
              <label>
                <span>Full name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" autoFocus />
              </label>
              <label>
                <span>Work email <em>*</em></span>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@utility.com" />
              </label>
              <label>
                <span>Company / utility <em>*</em></span>
                <input required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Kisumu Water & Sanitation Co." />
              </label>
              <label>
                <span>What would you like to see? <em>*</em></span>
                <textarea required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="We manage ~800 km of network and want to evaluate leak detection and NRW tracking." />
              </label>

              {error && <div className="demo-modal-error" role="alert">{error}</div>}

              <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
                {busy ? copy.busy : copy.cta}
              </button>
              <p className="demo-modal-fine">We’ll only use this to contact you about Aquawise. No spam.</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
