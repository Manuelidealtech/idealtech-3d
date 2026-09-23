import { connection } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export default async function AnalyticsPage(){
  await connection();
  const db=createSupabaseAdminClient();
  const {count}=await db.from('view_events').select('*',{count:'exact',head:true});
  const total=count||0;
  const since=new Date(Date.now()-7*86400000).toISOString();
  const {count:c7}=await db.from('view_events').select('*',{count:'exact',head:true}).gte('created_at',since);
  const last7=c7||0;
  const {data,error}=await db.from('view_events').select('product_id, product:products(name)');
  if(error) throw new Error(`Impossibile caricare le statistiche: ${error.message}`);
  const map=new Map<string,number>();
  (data||[]).forEach((r:any)=>{const n=r.product?.name||'Prodotto';map.set(n,(map.get(n)||0)+1)});
  const top=[...map.entries()].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count).slice(0,8);
  return <><div className="adminTop"><div><span className="eyebrow">INSIGHTS</span><h1>Statistiche</h1><p>Misura l'interesse sui prodotti e sulle condivisioni.</p></div></div><div className="statsGrid"><div className="statCard"><span>Visualizzazioni totali</span><strong>{total}</strong><small>dall'attivazione</small></div><div className="statCard"><span>Ultimi 7 giorni</span><strong>{last7}</strong><small>aperture recenti</small></div><div className="statCard"><span>Prodotti monitorati</span><strong>{top.length}</strong><small>con almeno una visita</small></div></div><div className="adminPanel"><div className="panelHeading"><div><small>PERFORMANCE</small><h2>Prodotti più visualizzati</h2></div></div>{top.length===0?<p className="emptyState">Le statistiche compariranno dopo le prime visualizzazioni reali.</p>:<div className="ranking">{top.map((x,i)=><div key={x.name}><b>{String(i+1).padStart(2,'0')}</b><span>{x.name}</span><strong>{x.count}</strong></div>)}</div>}</div></>;
}
