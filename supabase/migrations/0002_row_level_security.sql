-- =====================================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_conversions enable row level security;
alter table public.blog_posts enable row level security;
alter table public.contact_messages enable row level security;

-- Helper: is the current user an admin?
create function public.is_admin()
returns boolean as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$ language sql security definer stable;

-- ---------------- PROFILES ----------------
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- ---------------- CATEGORIES ----------------
create policy "Anyone can view categories"
  on public.categories for select
  using (true);

create policy "Admins manage categories"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------- PRODUCTS ----------------
create policy "Anyone can view published products"
  on public.products for select
  using (status = 'published' or public.is_admin());

create policy "Admins manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------- COUPONS ----------------
-- Coupons are validated server-side via service role, not exposed to anon directly.
create policy "Admins manage coupons"
  on public.coupons for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------- ORDERS ----------------
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins manage orders"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

-- Orders are created/updated by the server (service role) during checkout,
-- not directly by clients, so no client-facing insert policy here.

-- ---------------- ORDER ITEMS ----------------
create policy "Users can view their own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Admins manage order items"
  on public.order_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------- AFFILIATE CLICKS ----------------
create policy "Admins view affiliate clicks"
  on public.affiliate_clicks for select
  using (public.is_admin());

-- inserts happen via service role in the /r/[slug] route handler

-- ---------------- AFFILIATE CONVERSIONS ----------------
create policy "Affiliates view their own conversions"
  on public.affiliate_conversions for select
  using (
    public.is_admin() or
    affiliate_code = (select affiliate_code from public.profiles where id = auth.uid())
  );

create policy "Admins manage affiliate conversions"
  on public.affiliate_conversions for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------- BLOG POSTS ----------------
create policy "Anyone can view published posts"
  on public.blog_posts for select
  using (status = 'published' or public.is_admin());

create policy "Admins manage blog posts"
  on public.blog_posts for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------- CONTACT MESSAGES ----------------
create policy "Anyone can submit a contact message"
  on public.contact_messages for insert
  with check (true);

create policy "Admins view contact messages"
  on public.contact_messages for select
  using (public.is_admin());

create policy "Admins update contact messages"
  on public.contact_messages for update
  using (public.is_admin());
