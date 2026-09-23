import { connection } from 'next/server';
import ProductManager from '@/components/ProductManager';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { Product } from '@/lib/types';

export default async function ProductsPage() {
  await connection();
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from('products').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(`Impossibile caricare i prodotti: ${error.message}`);
  return <ProductManager initialProducts={(data || []) as Product[]}/>;
}
