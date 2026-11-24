-- ARHA enquiry table — run once in the Supabase SQL editor.
-- Project: create a dedicated Supabase project (or a new schema) for this site.

create extension if not exists "pgcrypto";

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null default '',
  project_type text not null,
  location text not null default '',
  budget text not null default '',
  message text not null,
  source text not null default 'website',
  client_ip text not null default '',
  user_agent text not null default ''
);

create index if not exists inquiries_email_created_at_idx
  on public.inquiries (email, created_at desc);

create index if not exists inquiries_client_ip_created_at_idx
  on public.inquiries (client_ip, created_at desc);

-- Server uses the service role key only. Keep anon access closed.
alter table public.inquiries enable row level security;

-- No policies for anon / authenticated → browser cannot read or write this table.
-- Table privileges are still required for the service_role API key:
grant usage on schema public to service_role;
grant select, insert, update, delete on table public.inquiries to service_role;
