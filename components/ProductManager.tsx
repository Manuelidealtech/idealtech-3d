'use client';

import { useState } from 'react';
import { uploadPresigned } from '@vercel/blob/client';
import type { Product } from '@/lib/types';
import { scaleGlbToRealSize } from '@/lib/glb-units';

type Dims = { x: number; y: number; z: number };
type PendingUpload = { product: Product; file: File; measured: Dims };

function fmt(n: number) {
  return n >= 10 ? n.toFixed(2) : n.toFixed(3);
}

async function measureGlb(file: File): Promise<Dims> {
  const [{ GLTFLoader }, THREE] = await Promise.all([
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three'),
  ]);

  const url = URL.createObjectURL(file);
  try {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(url);
    gltf.scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(gltf.scene, true);
    if (box.isEmpty()) throw new Error('Il GLB non contiene geometrie misurabili.');
    const size = box.getSize(new THREE.Vector3());
    if (![size.x, size.y, size.z].every(v => Number.isFinite(v) && v > 0)) {
      throw new Error('Non è stato possibile rilevare le dimensioni del GLB.');
    }
    return { x: size.x, y: size.y, z: size.z };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function calibrationFactor(measured: Dims, realMm: [number, number, number]) {
  // Sort both sets: the user can enter L/W/H in any order and GLB axes can differ.
  const model = [measured.x, measured.y, measured.z].sort((a, b) => a - b);
  const targetM = realMm.map(v => v / 1000).sort((a, b) => a - b);
  const ratios = targetM.map((target, i) => target / model[i]);
  const sortedRatios = [...ratios].sort((a, b) => a - b);
  const factor = sortedRatios[1];
  const maxDeviation = Math.max(...ratios.map(r => Math.abs(r - factor) / factor));
  return { factor, ratios, maxDeviation };
}

export default function ProductManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<PendingUpload | null>(null);
  const [realDims, setRealDims] = useState<[string, string, string]>(['', '', '']);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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

  async function prepareUpload(product: Product, file: File) {
    setBusy(true);
    setMessage('Analisi dimensioni GLB…');
    try {
      const measured = await measureGlb(file);
      setPending({ product, file, measured });
      setRealDims(['', '', '']);
      setMessage('');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Impossibile analizzare il GLB.');
    } finally {
      setBusy(false);
    }
  }

  async function uploadCalibrated(mode: 'calibrate' | 'already-correct') {
    if (!pending) return;
    setBusy(true);
    try {
      let uploadFile = pending.file;
      let factor = 1;
      let realMm: [number, number, number] | undefined;

      if (mode === 'calibrate') {
        const parsed = realDims.map(v => Number(String(v).replace(',', '.'))) as [number, number, number];
        if (parsed.some(v => !Number.isFinite(v) || v <= 0)) {
          throw new Error('Inserisci tutte e tre le dimensioni reali in millimetri.');
        }
        realMm = parsed;
        const result = calibrationFactor(pending.measured, parsed);
        if (!Number.isFinite(result.factor) || result.factor <= 0) throw new Error('Calibrazione non valida.');
        if (result.maxDeviation > 0.08) {
          throw new Error('Le dimensioni inserite non sono proporzionali al GLB (scostamento oltre 8%). Verifica le tre misure reali.');
        }
        factor = result.factor;
        setMessage(`Calibrazione scala × ${factor.toPrecision(6)}…`);
        uploadFile = await scaleGlbToRealSize(pending.file, factor, parsed);
      } else {
        setMessage('Preparazione GLB…');
      }

      const blob = await uploadPresigned(`models/${pending.product.slug}/${uploadFile.name}`, uploadFile, {
        access: 'public',
        handleUploadUrl: '/api/blob/upload',
        multipart: true,
        onUploadProgress: ({ percentage }) => setMessage(`Caricamento ${Math.round(percentage)}%`),
      });

      const r = await fetch(`/api/products/${pending.product.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model_url: blob.url, model_path: blob.pathname }),
      });
      const updated = await r.json();
      if (!r.ok) throw new Error(updated.error || 'Il file è stato caricato su Blob ma non è stato associato al prodotto.');
      if (!updated.model_url) throw new Error('Upload completato, ma Supabase non ha restituito model_url.');

      setProducts(current => current.map(item => item.id === pending.product.id ? updated : item));
      setPending(null);
      setMessage(mode === 'calibrate'
        ? `GLB calibrato sulle dimensioni reali e caricato. Fattore applicato: ×${factor.toPrecision(6)}. AR 1:1 pronta.`
        : 'GLB caricato senza correzione: dimensioni dichiarate già in metri.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Errore upload');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <div className="adminTop"><div><span className="eyebrow">CATALOGO</span><h1>Prodotti 3D</h1><p>Gestisci dati, pubblicazione e file GLB.</p></div><button className="primaryBtn" onClick={() => setEditing({} as Product)}>+ Nuovo prodotto</button></div>
    {message && <div className="setupNotice compact"><strong>Info</strong><p>{message}</p></div>}
    <div className="setupNotice compact unitSetup"><div><strong>Scala reale AR</strong><p>STL non contiene un’unità di misura standard. Per evitare macchinari da 50 metri, il portale misura il GLB e lo calibra sulle <b>dimensioni reali in mm</b> che inserisci al caricamento.</p></div></div>
    <div className="adminPanel tablePanel"><div className="productRows">
      {products.map(p => <div className="productRow" key={p.id}><div className="rowIcon">3D</div><div className="rowMain"><small>{p.category}</small><strong>{p.name}</strong><span>/p/{p.slug}</span></div><div className="rowStatus"><span className={p.published ? 'statusOn' : 'statusOff'}>{p.published ? 'Pubblicato' : 'Bozza'}</span><span>{p.model_url ? 'GLB caricato' : 'Nessun GLB'}</span></div><div className="rowActions"><label className="ghostBtn uploadBtn">Carica GLB<input type="file" accept=".glb,model/gltf-binary" disabled={busy} onChange={e => { const f=e.target.files?.[0]; if (f) prepareUpload(p,f); e.currentTarget.value=''; }} /></label><button className="ghostBtn" onClick={() => setEditing(p)}>Modifica</button><a className="ghostBtn" target="_blank" href={`/p/${p.slug}`}>Apri ↗</a></div></div>)}
    </div></div>

    {pending && <div className="modalBackdrop" onMouseDown={() => !busy && setPending(null)}><div className="modal calibrationModal" onMouseDown={e=>e.stopPropagation()}><div className="modalHead"><div><small>CALIBRAZIONE SCALA 1:1</small><h2>{pending.product.name}</h2></div><button disabled={busy} onClick={()=>setPending(null)}>×</button></div><div className="calibrationBody">
      <div className="detectedDimensions"><span>Dimensioni rilevate nel GLB</span><strong>{fmt(pending.measured.x)} × {fmt(pending.measured.y)} × {fmt(pending.measured.z)}</strong><small>Il GLB le interpreta come metri: non significa che siano le misure reali.</small></div>
      <div className="calibrationIntro">Inserisci le <b>tre dimensioni complessive reali del macchinario in millimetri</b>. L’ordine non importa: il portale calcola un unico fattore uniforme e lo incorpora nel GLB.</div>
      <div className="realDimsGrid">
        {(['A','B','C'] as const).map((label, i) => <label key={label}>Misura {label} (mm)<input inputMode="decimal" placeholder={i===0?'es. 3424':i===1?'es. 5479':'es. 5602'} value={realDims[i]} onChange={e => setRealDims(prev => { const next=[...prev] as [string,string,string]; next[i]=e.target.value; return next; })}/></label>)}
      </div>
      {realDims.every(v => Number(String(v).replace(',','.')) > 0) && (() => {
        const values = realDims.map(v => Number(String(v).replace(',','.'))) as [number,number,number];
        const result = calibrationFactor(pending.measured, values);
        const target = values.map(v=>v/1000).sort((a,b)=>a-b);
        return <div className={result.maxDeviation <= .08 ? 'calibrationPreview ok' : 'calibrationPreview warn'}><strong>{result.maxDeviation <= .08 ? 'Calibrazione valida' : 'Controlla le misure'}</strong><span>Scala calcolata ×{result.factor.toPrecision(6)} · Ingombro finale ≈ {target.map(v=>`${v.toFixed(3)} m`).join(' × ')}</span></div>;
      })()}
    </div><div className="modalActions calibrationActions"><button type="button" className="ghostBtn" disabled={busy} onClick={()=>uploadCalibrated('already-correct')}>GLB già corretto in metri</button><button type="button" className="primaryBtn" disabled={busy} onClick={()=>uploadCalibrated('calibrate')}>Calibra e carica</button></div></div></div>}

    {editing && <div className="modalBackdrop" onMouseDown={() => setEditing(null)}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modalHead"><div><small>PRODOTTO 3D</small><h2>{editing.id ? 'Modifica prodotto' : 'Nuovo prodotto'}</h2></div><button onClick={()=>setEditing(null)}>×</button></div><form onSubmit={save} className="editForm"><label>Nome<input name="name" required defaultValue={editing.name || ''}/></label><label>Slug URL<input name="slug" required defaultValue={editing.slug || ''} placeholder="idm-gp"/></label><label>Categoria<input name="category" required defaultValue={editing.category || 'Sistemi'}/></label><label className="wide">Descrizione<textarea name="description" rows={4} defaultValue={editing.description || ''}/></label><label className="checkLabel wide"><input name="published" type="checkbox" value="true" defaultChecked={editing.published ?? true}/> Pubblica nel catalogo</label><div className="modalActions"><button type="button" className="ghostBtn" onClick={()=>setEditing(null)}>Annulla</button><button className="primaryBtn" disabled={busy}>Salva prodotto</button></div></form></div></div>}
  </>;
}
