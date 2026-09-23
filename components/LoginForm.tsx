'use client';
import { useState } from 'react';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget);
      const r = await fetch('/api/auth/login', { method: 'POST', body: form });
      if (r.ok) {
        location.href = '/admin';
        return;
      }
      const json = await r.json().catch(() => ({}));
      setError(json.error || 'Accesso non riuscito');
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="loginForm">
    <label>Email<input name="email" type="email" required autoComplete="username" placeholder="admin@idealtech.it" /></label>
    <label>Password<input name="password" type="password" required autoComplete="current-password" placeholder="••••••••••" /></label>
    {error && <div className="formError">{error}</div>}
    <button className="primaryBtn" type="submit" disabled={busy}>{busy ? 'Accesso…' : 'Accedi'}</button>
  </form>;
}
