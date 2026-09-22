import ProductManager from '@/components/ProductManager';
import { demoProducts } from '@/lib/demo';
import { isSupabaseConfigured } from '@/lib/config';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Product } from '@/lib/types';

export default async function ProductsPage() {
  let products: Product[] = demoProducts;
  if (isSupabaseConfigured) {
    const db = createSupabaseAdminClient();
    if (db) {
      const { data } = await db.from('products').select('*').order('created_at', { ascending: false });
      products = (data || []) as Product[];
    }
  }
  return <ProductManager initialProducts={products} demo={!isSupabaseConfigured}/>;
}
