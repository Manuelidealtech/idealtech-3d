import { createClient } from '@supabase/supabase-js';
import { getSupabaseSecretKey, getSupabaseUrl } from '@/lib/config';

export function createSupabaseAdminClient() {
  return createClient(
    getSupabaseUrl(),
    getSupabaseSecretKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
