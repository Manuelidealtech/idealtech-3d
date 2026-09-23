import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function getAuthed() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ? supabase : null;
}

export async function POST(request: Request) {
  try {
    const supabase = await getAuthed();
    if (!supabase) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    const body = await request.json();
    if (!body.product_id) return NextResponse.json({ error: 'Seleziona un prodotto' }, { status: 400 });
    const token = crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().slice(0,8);
    const { data, error } = await supabase.from('share_links').insert({
      product_id: body.product_id,
      label: String(body.label || '').trim() || null,
      expires_at: body.expires_at ? new Date(body.expires_at).toISOString() : null,
      token,
      active: true,
    }).select('*').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Errore backend' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await getAuthed();
    if (!supabase) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    const body = await request.json();
    const { error } = await supabase.from('share_links').update({ active: Boolean(body.active) }).eq('id', body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Errore backend' }, { status: 500 });
  }
}
