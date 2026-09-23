import Link from 'next/link';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export default async function AdminDashboard() {
  const db = createSupabaseAdminClient();
  const [{ count: pc }, { count: sc }, { count: vc }] = await Promise.all([
    db.from('products').select('*', { count: 'exact', head: true }),
    db.from('share_links').select('*', { count: 'exact', head: true }).eq('active', true),
    db.from('view_events').select('*', { count: 'exact', head: true }),
  ]);
  const products = pc || 0, shares = sc || 0, views = vc || 0;

  return <>
    <div className="adminTop"><div><span className="eyebrow">CONTROL CENTER</span><h1>Dashboard</h1><p>Gestisci l'esperienza 3D Idealtech da un unico punto.</p></div><Link className="primaryBtn" href="/admin/products">Gestisci prodotti</Link></div>
    <div className="statsGrid"><div className="statCard"><span>Prodotti</span><strong>{products}</strong><small>modelli nel catalogo</small></div><div className="statCard"><span>Link attivi</span><strong>{shares}</strong><small>condivisioni cliente</small></div><div className="statCard"><span>Visualizzazioni</span><strong>{views}</strong><small>aperture registrate</small></div></div>
    <div className="adminPanel"><div className="panelHeading"><div><small>WORKFLOW</small><h2>Pronto per il lavoro commerciale</h2></div></div><div className="workflow"><div><b>01</b><strong>Carica</strong><p>Inserisci un GLB ottimizzato.</p></div><div><b>02</b><strong>Pubblica</strong><p>Attiva il link permanente.</p></div><div><b>03</b><strong>Condividi</strong><p>Crea link cliente con scadenza.</p></div><div><b>04</b><strong>Misura</strong><p>Controlla le visualizzazioni.</p></div></div></div>
  </>;
}
