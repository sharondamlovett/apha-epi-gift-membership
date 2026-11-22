-- Run this in the Supabase SQL Editor.
-- Private contact details stay in member_submissions and are never exposed by the public view.

create extension if not exists pgcrypto;

create table if not exists public.member_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 1 and 120),
  email text not null check (char_length(email) <= 254),
  mailing_address text not null check (char_length(mailing_address) <= 300),
  phone text not null check (char_length(phone) <= 40),
  bio text not null check (char_length(bio) between 1 and 1200),
  publication_consent boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

alter table public.member_submissions enable row level security;

-- Anonymous visitors can submit, but cannot read, update, or delete submissions.
drop policy if exists "Anyone can submit a pending profile" on public.member_submissions;
create policy "Anyone can submit a pending profile"
on public.member_submissions
for insert
to anon
with check (status = 'pending' and publication_consent = true);

revoke all on table public.member_submissions from anon, authenticated;
grant insert (full_name, email, mailing_address, phone, bio, publication_consent)
on public.member_submissions to anon;

-- This view intentionally exposes only the three fields the directory publishes.
-- The default (owner-rights) view behavior allows it to read the protected base table;
-- visitors receive SELECT permission on the view only, not on the private table.
create or replace view public.public_member_directory as
select full_name, email, bio
from public.member_submissions
where status = 'approved' and publication_consent = true;

revoke all on public.public_member_directory from anon, authenticated;
grant select on public.public_member_directory to anon, authenticated;

-- Admin review:
-- In Supabase Table Editor, open member_submissions and change status to 'approved'
-- only after checking the submission and publication consent. Set approved_at = now().
-- To reject a submission, set status = 'rejected'.
