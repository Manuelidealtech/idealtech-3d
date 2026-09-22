import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from './supabase/server';
import { isSupabaseConfigured } from './config';

export async function requireAdmin() {
  if (!isSupabaseConfigured) return { id: 'demo-admin', email: 'demo@idealtech.local' };
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect('/admin/login');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');
  return user;
}
