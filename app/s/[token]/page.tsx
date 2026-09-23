import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import Viewer3D from '@/components/Viewer3D';
import { Logo } from '@/components/Logo';
import { TrackView } from '@/components/TrackView';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Product, ShareLink } from '@/lib/types';

export default async function SharedPage({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;
  const db = createSupabaseAdminClient();
  const { data } = await db.from('share_links').select('*, product:products(*)').eq('token', token).eq('active', true).maybeSingle();
  const share = data as (ShareLink & { product: Product | null }) | null;
  if (!share?.product) notFound();
  if (share.expires_at && new Date(share.expires_at) < new Date()) notFound();
  return (
    <main className="experiencePage sharedExperience">
      <TrackView productId={share.product.id} shareId={share.id} />
      <header className="experienceHeader"><Logo /><div><span>PRIVATE PRESENTATION</span><strong>{share.product.name}</strong></div></header>
      <section className="experienceBody">
        <div className="experienceCopy"><div className="eyebrow">IDEALTECH 3D EXPERIENCE</div><h1>{share.product.name}</h1><p>{share.product.description}</p><div className="featureList"><span>360° interattivo</span><span>Realtà aumentata in scala 1:1</span><span>Apri da smartphone e posiziona il modello nello spazio reale</span></div>{share.expires_at && <div className="expiryBadge">Link valido fino al {new Date(share.expires_at).toLocaleDateString('it-IT')}</div>}</div>
        <div className="viewerCard"><Viewer3D modelUrl={share.product.model_url} productName={share.product.name} /></div>
      </section>
    </main>
  );
}
