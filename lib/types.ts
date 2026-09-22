export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  model_url: string | null;
  model_path: string | null;
  poster_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type ShareLink = {
  id: string;
  token: string;
  product_id: string;
  label: string | null;
  expires_at: string | null;
  active: boolean;
  created_at: string;
  product?: Product | null;
};
