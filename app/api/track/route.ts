import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const db = createSupabaseAdminClient();
    const { productId, shareId } = await request.json();
    if (!productId) return NextResponse.json({ ok: false }, { status: 400 });
    await db.from('view_events').insert({
      product_id: productId,
      share_id: shareId || null,
      user_agent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer'),
    });
    return NextResponse.json({ ok: true });
  } catch {
    // Analytics must never block the viewer.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
