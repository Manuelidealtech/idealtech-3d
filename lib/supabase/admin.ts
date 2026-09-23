import { createClient } from '@supabase/supabase-js';
import { assertSupabaseAdminConfig } from '@/lib/config';

export function createSupabaseAdminClient() {
  assertSupabaseAdminConfig();
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
