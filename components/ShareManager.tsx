'use client';
import { useState } from 'react';
import type { Product, ShareLink } from '@/lib/types';

export default function ShareManager({ products, links, appUrl, demo }: { products: Product[]; links: ShareLink[]; appUrl: string; demo: boolean }) {
  const [message,setMessage]=useState('');
  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (demo) { setMessage('Configura Supabase per creare link reali.'); return; }
    const fd=new FormData(e.currentTarget);
    const r=await fetch('/api/shares',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.fromEntries(fd.entries()))});
    const j=await r.json(); if(!r.ok){setMessage(j.error||'Errore');return;} location.reload();
  }
  async function revoke(id:string){if(demo)return;await fetch('/api/shares',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({id,active:false})});location.reload();}
  async function copy(token:string){await navigator.clipboard.writeText(`${appUrl}/s/${token}`);setMessage('Link copiato negli appunti.');}
  return <><div className="adminTop"><div><span className="eyebrow">CONDIVISIONI</span><h1>Link cliente</h1><p>Crea presentazioni dedicate, revocabili e con scadenza opzionale.</p></div></div>{message&&<div className="setupNotice compact"><strong>Info</strong><p>{message}</p></div>}<div className="splitAdmin"><div className="adminPanel"><div className="panelHeading"><div><small>NUOVO LINK</small><h2>Genera condivisione</h2></div></div><form className="shareForm" onSubmit={create}><label>Prodotto<select name="product_id" required>{products.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label><label>Etichetta<input name="label" placeholder="Cliente Rossi / Fiera Milano"/></label><label>Scadenza<input name="expires_at" type="datetime-local"/></label><button className="primaryBtn">Genera link</button></form></div><div className="adminPanel"><div className="panelHeading"><div><small>ATTIVI E STORICO</small><h2>Link generati</h2></div></div><div className="shareList">{links.length===0?<p className="emptyState">Nessun link creato.</p>:links.map(l=><div className="shareItem" key={l.id}><div><strong>{l.product?.name || 'Prodotto'}</strong><span>{l.label || 'Senza etichetta'}</span><small>{l.expires_at?`Scade ${new Date(l.expires_at).toLocaleString('it-IT')}`:'Senza scadenza'} · {l.active?'Attivo':'Revocato'}</small></div><div><button className="ghostBtn" onClick={()=>copy(l.token)}>Copia</button>{l.active&&<button className="ghostBtn danger" onClick={()=>revoke(l.id)}>Revoca</button>}</div></div>)}</div></div></div></>;
}
