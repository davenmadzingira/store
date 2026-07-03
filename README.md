# Shelf — Digital products & affiliate marketplace

A full-stack e-commerce site built with Next.js 14, TypeScript, Tailwind CSS,
Supabase, Stripe, PayPal, and SendGrid. Sells your own digital downloads and
tracks clicks/commissions on affiliate products, all from one admin dashboard.

---

## What's included

- Modern homepage with a live "recent sales" ticker
- Product catalogue with full-text search and category/type filters
- Shopping cart (persisted in the browser) and checkout
- Stripe Checkout (cards) and PayPal Buttons, both fully wired to webhooks
- Secure, time-limited, download-count-limited digital file delivery
- Email receipts with working download links (via SendGrid)
- Coupon system (percent or fixed, expiry, usage limits, minimum order)
- User accounts (sign up, sign in, password reset, order history, downloads)
- Admin dashboard: products, orders, coupons, blog, affiliate conversions, sales reports
- Affiliate click + commission tracking for outbound "curated finds"
- Blog with Markdown content and SEO fields
- Contact page wired to email + a database table
- Dynamic sitemap.xml, robots.txt, per-page SEO metadata
- Mobile responsive throughout
- Row Level Security on every table — admins and regular users see only what they should

---

## 1. Prerequisites

You'll need accounts with four services, all of which have free tiers
sufficient to launch and test this store:

- [Supabase](https://supabase.com) — database, auth, file storage
- [Stripe](https://stripe.com) — card payments
- [PayPal Developer](https://developer.paypal.com) — PayPal payments
- [SendGrid](https://sendgrid.com) — transactional email (receipts)
- [Vercel](https://vercel.com) — hosting (or any Node host that supports Next.js)

Node.js 18.17+ and npm are required to run this locally.

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Set up Supabase

### 3.1 Create a project
1. Go to [supabase.com](https://supabase.com) → New Project.
2. Pick a name, a strong database password (save it somewhere), and a region close to your customers.
3. Wait ~2 minutes for provisioning.

### 3.2 Run the database migrations
1. In your Supabase project, open **SQL Editor** in the left sidebar.
2. Open each file in `supabase/migrations/` **in order** (0001, 0002, 0003, 0004, 0005), paste the contents into a new query, and click **Run**.
   - `0001_initial_schema.sql` — all tables
   - `0002_row_level_security.sql` — access control policies
   - `0003_storage_buckets.sql` — file storage buckets + their policies
   - `0004_pending_paypal_orders.sql` — PayPal checkout bridge table
   - `0005_seed_data.sql` — starter categories

### 3.3 Get your API keys
Go to **Project Settings → API** and copy three values into your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=          # "Project URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # "anon public" key
SUPABASE_SERVICE_ROLE_KEY=         # "service_role" key — keep this secret, never expose to the browser
```

### 3.4 Create your admin account
1. Run the app (`npm run dev`) and sign up for a normal account at `/register` using your own email.
2. Check your email and confirm the account.
3. Back in Supabase SQL Editor, run:
   ```sql
   update public.profiles set is_admin = true where email = 'you@example.com';
   ```
4. Sign out and back in. Visit `/admin` — you now have full admin access.

---

## 4. Set up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com) and finish onboarding (you can stay in **test mode** while developing).
2. Go to **Developers → API keys**. Copy:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
3. Set up the webhook that confirms payment and triggers order fulfillment:
   - Go to **Developers → Webhooks → Add endpoint**.
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe` (for local testing, see step 4 below).
   - Select event: `checkout.session.completed`.
   - Copy the **Signing secret** into:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```
4. **For local testing**, install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and run:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   This prints a temporary webhook secret — use that locally instead of the dashboard one.
5. When you're ready to take real payments, switch to **live mode** keys in the Stripe dashboard and update your production environment variables.

---

## 5. Set up PayPal

1. Go to [developer.paypal.com](https://developer.paypal.com) → **Apps & Credentials**.
2. Make sure you're on the **Sandbox** tab while testing. Click your default app (or create one).
3. Copy the credentials:
   ```
   PAYPAL_CLIENT_ID=...
   PAYPAL_CLIENT_SECRET=...
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=...          # same value as PAYPAL_CLIENT_ID
   PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
   ```
4. Set up a webhook (used as a safety net for refunds/disputes):
   - Still in the Developer Dashboard, go to your app → **Webhooks → Add Webhook**.
   - URL: `https://yourdomain.com/api/webhooks/paypal`.
   - Subscribe to: `PAYMENT.CAPTURE.REFUNDED` and `PAYMENT.CAPTURE.DENIED`.
   - Copy the **Webhook ID** into:
     ```
     PAYPAL_WEBHOOK_ID=...
     ```
5. To go live: create a live app in the same dashboard (toggle to **Live**), and swap in the live client ID/secret plus `PAYPAL_API_BASE=https://api-m.paypal.com`.

---

## 6. Set up SendGrid

1. Create an account at [sendgrid.com](https://sendgrid.com).
2. Verify a **Single Sender** (Settings → Sender Authentication) using the email address you want receipts to come from — or better, verify your whole domain for higher deliverability.
3. Go to **Settings → API Keys → Create API Key**, give it "Full Access" or at minimum "Mail Send" permission.
4. Add to your env file:
   ```
   SENDGRID_API_KEY=SG....
   SENDGRID_FROM_EMAIL=orders@yourdomain.com   # must match a verified sender
   SENDGRID_FROM_NAME="Your Store Name"
   ```

---

## 7. Finish your environment file

Copy `.env.example` to `.env.local` and fill in everything from the steps above, plus:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000     # update to your real domain in production
ADMIN_SETUP_SECRET=any-long-random-string       # reserved for future use
DOWNLOAD_SIGNING_SECRET=                        # generate with: openssl rand -hex 32
```

---

## 8. Run it locally

```bash
npm run dev
```

Visit `http://localhost:3000`. Sign up, make yourself an admin (step 3.4),
then go to `/admin/products/new` to add your first digital product or
affiliate link.

---

## 9. Deploy to Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. In **Settings → Environment Variables**, add every variable from your `.env.local`.
4. Update `NEXT_PUBLIC_SITE_URL` to your real Vercel/custom domain.
5. Update the Stripe and PayPal webhook URLs (in their dashboards) to point at your live domain instead of localhost.
6. Deploy.

---

## How the pieces fit together

- **Pricing is always recomputed server-side** at checkout time and again at
  webhook fulfillment time, from the database — never trusted from the
  client or from payment-provider metadata. This is the standard defense
  against someone tampering with cart contents in the browser.
- **Digital file delivery** works by generating a random opaque token per
  order item at fulfillment time. The emailed link hits
  `/api/downloads/[token]`, which checks the order is paid and the
  per-item download limit (default 5) hasn't been hit, then redirects to a
  120-second signed Supabase Storage URL. The bucket itself is never public.
- **Affiliate tracking**: visiting `/r/[slug]` logs a click and redirects to
  the external retailer URL. If a visitor arrived earlier via
  `yoursite.com/?ref=AFFILIATECODE`, that code is remembered in a cookie for
  30 days and credited on the click. Actual commission amounts are logged
  manually by an admin in `/admin/affiliates` once a retailer reports back a
  conversion — very few retailers post results to your site automatically,
  so this manual reconciliation step is realistic for a small operation.
- **Two payment flows, one fulfillment path**: both the Stripe webhook and
  the PayPal capture route call the same `fulfillOrder()` function, so order
  creation, download-token generation, coupon redemption counting, and the
  receipt email always happen identically regardless of payment method.

## Project structure

```
src/
  app/            Routes (App Router) — marketing, shop, account, admin, API
  components/      UI split by area: ui/, shop/, admin/, marketing/
  lib/             Supabase clients, Stripe/PayPal/SendGrid wrappers, cart store, pricing logic
  types/           Database types matching the Supabase schema
supabase/
  migrations/      SQL files to run in order in the Supabase SQL editor
```

## Customizing

- Colors, type, and the "shelf" visual language live in `tailwind.config.js`
  and `src/app/globals.css`. Change the `signal` (accent) color to rebrand quickly.
- Swap the homepage copy and section labels directly in `src/app/page.tsx`.
- Download limit per purchase defaults to 5 — change `download_limit` in
  `src/lib/fulfill-order.ts`.
"# digital-store" 
