import ShareManager from '@/components/ShareManager';
import { appUrl } from '@/lib/config';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Product, ShareLink } from '@/lib/types';

export default async function SharesPage(){
  const db=createSupabaseAdminClient();
  const [p,l]=await Promise.all([
    db.from('products').select('*').order('name'),
    db.from('share_links').select('*, product:products(*)').order('created_at',{ascending:false})
  ]);
  if (p.error) throw new Error(`Impossibile caricare i prodotti: ${p.error.message}`);
  if (l.error) throw new Error(`Impossibile caricare i link: ${l.error.message}`);
  return <ShareManager products={(p.data||[]) as Product[]} links={(l.data||[]) as ShareLink[]} appUrl={appUrl}/>;
}
