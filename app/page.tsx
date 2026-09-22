import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { demoProducts } from '@/lib/demo';
import { isSupabaseConfigured } from '@/lib/config';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Product } from '@/lib/types';

async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return demoProducts;
  const db = createSupabaseAdminClient();
  if (!db) return [];
  const { data } = await db.from('products').select('*').eq('published', true).order('name');
  return (data || []) as Product[];
}

export default async function Home() {
  const products = await getProducts();
  return (
    <main className="publicPage">
      <header className="publicHeader"><Logo /><Link className="headerLink" href="/admin">Area riservata</Link></header>
      <section className="hero">
        <div className="eyebrow">INTERACTIVE PRODUCT EXPERIENCE</div>
        <h1>La tecnologia Idealtech,<br/><span>da ogni prospettiva.</span></h1>
        <p>Esplora i sistemi Idealtech in 3D direttamente dal browser. Ruota, ingrandisci e osserva ogni dettaglio senza installare software.</p>
      </section>
      <section className="catalogSection">
        <div className="sectionHeading"><div><span>CATALOGO 3D</span><h2>Prodotti disponibili</h2></div><p>{products.length} modelli</p></div>
        <div className="productGrid">
          {products.map((product, index) => (
            <Link href={`/p/${product.slug}`} className="productCard" key={product.id}>
              <div className="productVisual"><div className="wireMachine"><i></i><i></i><i></i></div><span>{String(index + 1).padStart(2, '0')}</span></div>
              <div className="productMeta"><small>{product.category}</small><h3>{product.name}</h3><p>{product.description}</p><b>Apri esperienza 3D →</b></div>
            </Link>
          ))}
        </div>
      </section>
      {!isSupabaseConfigured && <div className="demoBanner">Modalità demo: configura Supabase per attivare il portale reale.</div>}
      <footer>© {new Date().getFullYear()} Idealtech · 3D Experience</footer>
    </main>
  );
}
