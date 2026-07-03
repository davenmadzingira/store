-- =====================================================================
-- DIGITAL STORE — INITIAL SCHEMA
-- Run this in Supabase SQL Editor, or via `supabase db push`
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- PROFILES  (extends auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  is_admin boolean not null default false,
  affiliate_code text unique,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, affiliate_code)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    substr(replace(new.id::text, '-', ''), 1, 8)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- PRODUCTS
-- type: 'digital'   -> sold directly, file delivered after payment
-- type: 'affiliate' -> redirects out, click + conversion tracked
-- ---------------------------------------------------------------------
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  short_description text not null default '',
  price_cents integer not null default 0,        -- digital products only
  compare_at_cents integer,                        -- for showing a strikethrough price
  currency text not null default 'usd',
  type text not null check (type in ('digital', 'affiliate')),
  category_id uuid references public.categories(id) on delete set null,
  cover_image_url text,
  gallery_urls text[] not null default '{}',
  file_path text,                                   -- storage path, digital products only
  file_size_bytes bigint,
  affiliate_url text,                                -- affiliate products only
  affiliate_commission_pct numeric(5,2),             -- e.g. 10.00 = 10%
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_status_idx on public.products(status);
create index products_type_idx on public.products(type);
create index products_category_idx on public.products(category_id);

-- full text search
alter table public.products add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(short_description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) stored;

create index products_search_idx on public.products using gin(search_vector);

-- ---------------------------------------------------------------------
-- COUPONS
-- ---------------------------------------------------------------------
create table public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10,2) not null,
  max_redemptions integer,
  times_redeemed integer not null default 0,
  min_order_cents integer not null default 0,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------------
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  subtotal_cents integer not null,
  discount_cents integer not null default 0,
  total_cents integer not null,
  currency text not null default 'usd',
  coupon_id uuid references public.coupons(id) on delete set null,
  payment_provider text check (payment_provider in ('stripe', 'paypal')),
  payment_intent_id text,                  -- stripe payment_intent / paypal order id
  affiliate_ref text,                       -- which affiliate code drove this order, if any
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index orders_user_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create index orders_payment_intent_idx on public.orders(payment_intent_id);

-- ---------------------------------------------------------------------
-- ORDER ITEMS
-- ---------------------------------------------------------------------
create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  title_snapshot text not null,             -- product title at time of purchase
  price_cents_snapshot integer not null,
  quantity integer not null default 1,
  download_token text unique,               -- generated on paid order, used for secure download
  download_count integer not null default 0,
  download_limit integer not null default 5,
  created_at timestamptz not null default now()
);

create index order_items_order_idx on public.order_items(order_id);
create index order_items_download_token_idx on public.order_items(download_token);

-- ---------------------------------------------------------------------
-- AFFILIATE CLICKS  (every redirect through /r/[slug])
-- ---------------------------------------------------------------------
create table public.affiliate_clicks (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  referred_by_code text,                     -- if a site affiliate sent this visitor
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index affiliate_clicks_product_idx on public.affiliate_clicks(product_id);
create index affiliate_clicks_code_idx on public.affiliate_clicks(referred_by_code);

-- ---------------------------------------------------------------------
-- AFFILIATE CONVERSIONS  (manually logged or via postback; commission owed)
-- ---------------------------------------------------------------------
create table public.affiliate_conversions (
  id uuid primary key default uuid_generate_v4(),
  click_id uuid references public.affiliate_clicks(id) on delete set null,
  product_id uuid not null references public.products(id) on delete cascade,
  affiliate_code text not null,
  order_value_cents integer not null default 0,
  commission_cents integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'rejected')),
  created_at timestamptz not null default now()
);

create index affiliate_conversions_code_idx on public.affiliate_conversions(affiliate_code);

-- ---------------------------------------------------------------------
-- BLOG POSTS
-- ---------------------------------------------------------------------
create table public.blog_posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content_md text not null default '',
  cover_image_url text,
  author_id uuid references public.profiles(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_status_idx on public.blog_posts(status);

-- ---------------------------------------------------------------------
-- CONTACT MESSAGES
-- ---------------------------------------------------------------------
create table public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------
create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_set_updated_at before update on public.products
  for each row execute procedure public.set_updated_at();

create trigger blog_posts_set_updated_at before update on public.blog_posts
  for each row execute procedure public.set_updated_at();
