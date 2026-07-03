-- =====================================================================
-- STORAGE BUCKETS
-- product-files: private bucket, digital product files (never public)
-- product-images: public bucket, cover images / gallery
-- blog-images: public bucket, blog cover images
-- =====================================================================

insert into storage.buckets (id, name, public)
values
  ('product-files', 'product-files', false),
  ('product-images', 'product-images', true),
  ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- product-images: anyone can view, only admins can upload/manage
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- blog-images: same pattern
create policy "Public read blog images"
  on storage.objects for select
  using (bucket_id = 'blog-images');

create policy "Admins upload blog images"
  on storage.objects for insert
  with check (bucket_id = 'blog-images' and public.is_admin());

-- product-files: NO public access at all. Only the server (service role)
-- ever reads these, via the signed-download API route. Admins can upload.
create policy "Admins upload product files"
  on storage.objects for insert
  with check (bucket_id = 'product-files' and public.is_admin());

create policy "Admins manage product files"
  on storage.objects for all
  using (bucket_id = 'product-files' and public.is_admin());
