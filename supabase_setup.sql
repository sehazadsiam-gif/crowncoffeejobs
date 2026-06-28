-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Create applicants table
create table if not exists public.applicants (
  id            uuid default gen_random_uuid() primary key,
  name          text not null,
  contact       text not null,
  current_workplace text not null,
  department    text not null check (department in ('kitchen', 'front')),
  position      text not null,
  cv_url        text,
  lang          text default 'bn',
  created_at    timestamptz default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.applicants enable row level security;

-- 3. Allow anon users to INSERT (submit form) but NOT read
create policy "Allow public insert"
  on public.applicants for insert
  to anon
  with check (true);

-- 4. Storage bucket: run in Dashboard → Storage → New Bucket
-- Bucket name: cvs
-- Public: YES (so CV links work)
-- Max file size: 104857600 (100 MB)
-- Allowed MIME types: application/pdf, image/jpeg, image/png

-- 5. Storage policy (run after creating the bucket)
create policy "Allow public CV uploads"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'cvs');

-- 6. Optional: view all applicants (for admin)
-- create policy "Allow admin select"
--   on public.applicants for select
--   using (auth.role() = 'authenticated');
