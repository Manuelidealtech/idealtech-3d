import { notFound } from 'next/navigation';
import Link from 'next/link';
import Viewer3D from '@/components/Viewer3D';
import { Logo } from '@/components/Logo';
import { TrackView } from '@/components/TrackView';
import { demoProducts } from '@/lib/demo';
import { isSupabaseConfigured } from '@/lib/config';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Product } from '@/lib/types';

async function getProduct(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured) return demoProducts.find(p => p.slug === slug) || null;
  const db = createSupabaseAdminClient();
  if (!db) return null;
  const { data } = await db.from('products').select('*').eq('slug', slug).eq('published', true).maybeSingle();
  return data as Product | null;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  return (
    <main className="experiencePage">
      <TrackView productId={product.id} />
      <header className="experienceHeader"><Link href="/"><Logo /></Link><div><span>{product.category}</span><strong>{product.name}</strong></div></header>
      <section className="experienceBody">
        <div className="experienceCopy"><div className="eyebrow">3D PRODUCT VIEWER</div><h1>{product.name}</h1><p>{product.description}</p><div className="featureList"><span>360° interattivo</span><span>Zoom di precisione</span><span>Nessun software richiesto</span></div></div>
        <div className="viewerCard"><Viewer3D modelUrl={product.model_url} productName={product.name} /></div>
      </section>
      <div className="experienceFooter"><span>IDEALTECH · PRODUCT EXPERIENCE</span><Link href="/">← Torna al catalogo</Link></div>
    </main>
  );
}
