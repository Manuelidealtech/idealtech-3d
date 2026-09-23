import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { assertSupabasePublicConfig } from '@/lib/config';

export async function createSupabaseServerClient() {
  assertSupabasePublicConfig();
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Some Server Components cannot write cookies. Route Handlers perform auth writes.
          }
        },
      },
    }
  );
}
