export const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function assertSupabasePublicConfig() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Configurazione Supabase mancante: verifica NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
}

export function assertSupabaseAdminConfig() {
  assertSupabasePublicConfig();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Configurazione Supabase mancante: verifica SUPABASE_SERVICE_ROLE_KEY.');
  }
}
