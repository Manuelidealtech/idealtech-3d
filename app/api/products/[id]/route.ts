import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    const body = await request.json();
    const allowed: Record<string, unknown> = {};
    for (const key of ['name','slug','category','description','model_url','model_path','poster_url']) if (body[key] !== undefined) allowed[key] = body[key] || null;
    if (body.published !== undefined) allowed.published = body.published === 'true' || body.published === true;
    if (typeof allowed.slug === 'string') {
      allowed.slug = allowed.slug.toLowerCase().trim();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(allowed.slug as string)) return NextResponse.json({ error: 'Slug non valido' }, { status: 400 });
    }
    allowed.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('products').update(allowed).eq('id', id).select('*').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Errore backend' }, { status: 500 });
  }
}
