'use client';
import { useState } from 'react';

export default function LoginForm({ demo }: { demo: boolean }) {
  const [error, setError] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError('');
    if (demo) { location.href = '/admin'; return; }
    const form = new FormData(e.currentTarget);
    const r = await fetch('/api/auth/login', { method: 'POST', body: form });
    if (r.ok) location.href = '/admin'; else setError((await r.json()).error || 'Accesso non riuscito');
  }
  return <form onSubmit={submit} className="loginForm"><label>Email<input name="email" type="email" required disabled={demo} placeholder="admin@idealtech.it" /></label><label>Password<input name="password" type="password" required disabled={demo} placeholder="••••••••••" /></label>{error && <div className="formError">{error}</div>}<button className="primaryBtn" type="submit">{demo ? 'Apri dashboard demo' : 'Accedi'}</button></form>;
}
