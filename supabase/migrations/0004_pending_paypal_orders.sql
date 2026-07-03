-- =====================================================================
-- PENDING PAYPAL ORDERS
-- Short-lived bridge table: PayPal's order-create flow doesn't return
-- custom metadata the way Stripe Checkout Sessions do, so we stash the
-- cart contents here keyed by the PayPal order ID, and read it back in
-- the capture route. Rows can be safely deleted after capture or after
-- expiry — they hold no payment data, only what was in the cart.
-- =====================================================================

create table public.pending_paypal_orders (
  id uuid primary key default uuid_generate_v4(),
  paypal_order_id text not null unique,
  lines jsonb not null,
  coupon_code text,
  email text not null,
  user_id uuid references public.profiles(id) on delete set null,
  affiliate_ref text,
  created_at timestamptz not null default now()
);

create index pending_paypal_orders_order_id_idx on public.pending_paypal_orders(paypal_order_id);

alter table public.pending_paypal_orders enable row level security;

-- Only the server (service role) ever reads or writes this table.
-- No client-facing policies are defined, so RLS denies all client access by default.
