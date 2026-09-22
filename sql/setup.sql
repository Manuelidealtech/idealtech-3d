create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null default 'Sistemi',
  description text,
  model_url text,
  model_path text,
  poster_url text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  product_id uuid not null references public.products(id) on delete cascade,
  label text,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.view_events (
  id bigint generated always as identity primary key,
  product_id uuid references public.products(id) on delete cascade,
  share_id uuid references public.share_links(id) on delete set null,
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.share_links enable row level security;
alter table public.view_events enable row level security;

drop policy if exists "authenticated manage products" on public.products;
create policy "authenticated manage products" on public.products for all to authenticated using (true) with check (true);

drop policy if exists "authenticated manage shares" on public.share_links;
create policy "authenticated manage shares" on public.share_links for all to authenticated using (true) with check (true);

drop policy if exists "authenticated read analytics" on public.view_events;
create policy "authenticated read analytics" on public.view_events for select to authenticated using (true);

insert into public.products (name, slug, category, description, published)
values
('IdealMelt','idealmelt','Melting systems','Sistema Idealtech per la gestione professionale dei materiali hot-melt.',true),
('IDM-GP','idm-gp','Melting systems','Configurazione predisposta per una presentazione 3D completa e per la vista interna senza carter laterale.',true),
('Drum 200-20','drum-200-20','Drum melters','Unità per fusti presentabile in 3D direttamente dal browser.',true)
on conflict (slug) do nothing;
