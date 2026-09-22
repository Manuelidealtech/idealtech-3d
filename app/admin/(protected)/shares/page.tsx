import ShareManager from '@/components/ShareManager';
import { appUrl, isSupabaseConfigured } from '@/lib/config';
import { demoProducts } from '@/lib/demo';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Product, ShareLink } from '@/lib/types';

export default async function SharesPage(){let products:Product[]=demoProducts;let links:ShareLink[]=[];if(isSupabaseConfigured){const db=createSupabaseAdminClient();if(db){const [p,l]=await Promise.all([db.from('products').select('*').order('name'),db.from('share_links').select('*, product:products(*)').order('created_at',{ascending:false})]);products=(p.data||[]) as Product[];links=(l.data||[]) as ShareLink[];}}return <ShareManager products={products} links={links} appUrl={appUrl} demo={!isSupabaseConfigured}/>;}
