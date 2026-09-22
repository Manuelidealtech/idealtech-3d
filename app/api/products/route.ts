import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function auth() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { supabase: null, user: null };
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function POST(request: Request) {
  const { supabase, user } = await auth();
  if (!supabase || !user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  const body = await request.json();
  const payload = {
    name: String(body.name || '').trim(),
    slug: String(body.slug || '').trim().toLowerCase(),
    category: String(body.category || 'Sistemi').trim(),
    description: String(body.description || '').trim() || null,
    published: body.published === 'true' || body.published === true,
  };
  if (!payload.name || !payload.slug) return NextResponse.json({ error: 'Nome e slug sono obbligatori' }, { status: 400 });
  const { data, error } = await supabase.from('products').insert(payload).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
