function firstDefined(...values: Array<string | undefined>) {
  return values.find((value) => Boolean(value?.trim()))?.trim();
}

export function getSupabaseUrl() {
  const value = firstDefined(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL);
  if (!value) {
    throw new Error('Configurazione Supabase mancante: imposta NEXT_PUBLIC_SUPABASE_URL.');
  }
  return value;
}

export function getSupabasePublicKey() {
  const value = firstDefined(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  if (!value) {
    throw new Error('Configurazione Supabase mancante: imposta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (oppure NEXT_PUBLIC_SUPABASE_ANON_KEY per progetti legacy).');
  }
  return value;
}

export function getSupabaseSecretKey() {
  const value = firstDefined(
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  if (!value) {
    throw new Error('Configurazione Supabase server mancante: imposta SUPABASE_SECRET_KEY (oppure SUPABASE_SERVICE_ROLE_KEY per progetti legacy).');
  }
  return value;
}

export function getAppUrl() {
  const explicit = firstDefined(process.env.NEXT_PUBLIC_APP_URL);
  if (explicit) return explicit.replace(/\/$/, '');

  const production = firstDefined(process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL);
  if (production) return `https://${production.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;

  return 'http://localhost:3000';
}
