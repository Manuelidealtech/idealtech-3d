'use client';

import { useState } from 'react';
import { upload } from '@vercel/blob/client';
import type { Product } from '@/lib/types';

export default function ProductManager({ initialProducts, demo }: { initialProducts: Product[]; demo: boolean }) {
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (demo) { setMessage('Configura Supabase per salvare modifiche reali.'); return; }
    setBusy(true); setMessage('');
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    const endpoint = editing?.id ? `/api/products/${editing.id}` : '/api/products';
    const method = editing?.id ? 'PATCH' : 'POST';
    const r = await fetch(endpoint, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await r.json();
    if (!r.ok) { setMessage(json.error || 'Errore salvataggio'); setBusy(false); return; }
    location.reload();
  }

  async function uploadModel(product: Product, file: File) {
    if (demo) { setMessage('Configura Vercel Blob e Supabase per caricare modelli.'); return; }
    setBusy(true); setMessage('Caricamento in corso…');
    try {
      const blob = await upload(`models/${product.slug}/${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/blob/upload',
        multipart: true,
        onUploadProgress: ({ percentage }) => setMessage(`Caricamento ${Math.round(percentage)}%`),
      });
      const r = await fetch(`/api/products/${product.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ model_url: blob.url, model_path: blob.pathname }) });
      if (!r.ok) throw new Error('Aggiornamento prodotto non riuscito');
      location.reload();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Errore upload');
      setBusy(false);
    }
  }

  return <>
    <div className="adminTop"><div><span className="eyebrow">CATALOGO</span><h1>Prodotti 3D</h1><p>Gestisci dati, pubblicazione e file GLB.</p></div><button className="primaryBtn" onClick={() => setEditing({} as Product)}>+ Nuovo prodotto</button></div>
    {message && <div className="setupNotice compact"><strong>Info</strong><p>{message}</p></div>}
    <div className="adminPanel tablePanel"><div className="productRows">
      {products.map(p => <div className="productRow" key={p.id}><div className="rowIcon">3D</div><div className="rowMain"><small>{p.category}</small><strong>{p.name}</strong><span>/p/{p.slug}</span></div><div className="rowStatus"><span className={p.published ? 'statusOn' : 'statusOff'}>{p.published ? 'Pubblicato' : 'Bozza'}</span><span>{p.model_url ? 'GLB caricato' : 'Nessun GLB'}</span></div><div className="rowActions"><label className="ghostBtn uploadBtn">Carica GLB<input type="file" accept=".glb,model/gltf-binary" disabled={busy} onChange={e => { const f=e.target.files?.[0]; if (f) uploadModel(p,f); }} /></label><button className="ghostBtn" onClick={() => setEditing(p)}>Modifica</button><a className="ghostBtn" target="_blank" href={`/p/${p.slug}`}>Apri ↗</a></div></div>)}
    </div></div>
    {editing && <div className="modalBackdrop" onMouseDown={() => setEditing(null)}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modalHead"><div><small>PRODOTTO 3D</small><h2>{editing.id ? 'Modifica prodotto' : 'Nuovo prodotto'}</h2></div><button onClick={()=>setEditing(null)}>×</button></div><form onSubmit={save} className="editForm"><label>Nome<input name="name" required defaultValue={editing.name || ''}/></label><label>Slug URL<input name="slug" required defaultValue={editing.slug || ''} placeholder="idm-gp"/></label><label>Categoria<input name="category" required defaultValue={editing.category || 'Sistemi'}/></label><label className="wide">Descrizione<textarea name="description" rows={4} defaultValue={editing.description || ''}/></label><label className="checkLabel wide"><input name="published" type="checkbox" value="true" defaultChecked={editing.published ?? true}/> Pubblica nel catalogo</label><div className="modalActions"><button type="button" className="ghostBtn" onClick={()=>setEditing(null)}>Annulla</button><button className="primaryBtn" disabled={busy}>Salva prodotto</button></div></form></div></div>}
  </>;
}
