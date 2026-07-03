-- =====================================================================
-- SEED DATA
-- Run this AFTER the migrations, once, to set up starter categories.
-- =====================================================================

insert into public.categories (name, slug) values
  ('Templates', 'templates'),
  ('Presets', 'presets'),
  ('Courses', 'courses'),
  ('Tools & Software', 'tools-software'),
  ('Gear', 'gear')
on conflict (slug) do nothing;

-- =====================================================================
-- HOW TO MAKE YOURSELF AN ADMIN
-- =====================================================================
-- 1. Sign up for a normal account on your live site first (so a row
--    exists in public.profiles for your user).
-- 2. Then run this, swapping in your email:
--
--    update public.profiles set is_admin = true where email = 'you@example.com';
--
-- 3. Sign out and back in, then visit /admin — you'll have access.
