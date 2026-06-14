-- NYC Family Planner Supabase schema.
-- Run this in Supabase SQL Editor for project:
-- https://itectpofhngpeausakzg.supabase.co

create extension if not exists pgcrypto;

create table if not exists public.user_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.travel_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  trip_id text,
  name text not null,
  nationality text not null,
  start_date date not null,
  end_date date not null,
  travelers integer not null check (travelers > 0),
  pace text not null check (pace in ('relajado', 'normal', 'intenso')),
  accommodation jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  favorite_type text not null,
  item_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, favorite_type)
);

create table if not exists public.user_routes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  route_key text not null,
  title text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, route_key)
);

create table if not exists public.favorite_nightlife (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  name text,
  category text,
  google_place_id text,
  google_maps_url text,
  official_website text,
  ticket_url text,
  reservation_url text,
  image_url text,
  metadata jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_accounts (user_id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (user_id) do update
  set email = excluded.email,
      display_name = coalesce(excluded.display_name, public.user_accounts.display_name),
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

drop trigger if exists set_user_accounts_updated_at on public.user_accounts;
create trigger set_user_accounts_updated_at
before update on public.user_accounts
for each row execute function public.set_updated_at();

drop trigger if exists set_travel_profiles_updated_at on public.travel_profiles;
create trigger set_travel_profiles_updated_at
before update on public.travel_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_user_favorites_updated_at on public.user_favorites;
create trigger set_user_favorites_updated_at
before update on public.user_favorites
for each row execute function public.set_updated_at();

drop trigger if exists set_user_routes_updated_at on public.user_routes;
create trigger set_user_routes_updated_at
before update on public.user_routes
for each row execute function public.set_updated_at();

drop trigger if exists set_favorite_nightlife_updated_at on public.favorite_nightlife;
create trigger set_favorite_nightlife_updated_at
before update on public.favorite_nightlife
for each row execute function public.set_updated_at();

insert into public.user_accounts (user_id, email)
select id, coalesce(email, '')
from auth.users
on conflict (user_id) do nothing;

alter table public.user_accounts enable row level security;
alter table public.travel_profiles enable row level security;
alter table public.user_favorites enable row level security;
alter table public.user_routes enable row level security;
alter table public.favorite_nightlife enable row level security;

drop policy if exists "Users read own account" on public.user_accounts;
create policy "Users read own account"
on public.user_accounts
for select
using (auth.uid() = user_id);

drop policy if exists "Users update own account" on public.user_accounts;
create policy "Users update own account"
on public.user_accounts
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own travel profile" on public.travel_profiles;
create policy "Users manage own travel profile"
on public.travel_profiles
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists travel_profiles_user_id_idx on public.travel_profiles(user_id);
create index if not exists user_favorites_user_id_type_idx on public.user_favorites(user_id, favorite_type);
create index if not exists user_routes_user_id_key_idx on public.user_routes(user_id, route_key);
create index if not exists favorite_nightlife_user_id_item_id_idx on public.favorite_nightlife(user_id, item_id);

drop policy if exists "Users manage own favorites" on public.user_favorites;
create policy "Users manage own favorites"
on public.user_favorites
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own routes" on public.user_routes;
create policy "Users manage own routes"
on public.user_routes
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own nightlife favorites" on public.favorite_nightlife;
create policy "Users manage own nightlife favorites"
on public.favorite_nightlife
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Auth setup:
-- In Supabase Dashboard > Authentication > Providers > Email:
-- enable Email provider and disable "Confirm email".
-- Users register with email + password only.
-- Supabase stores passwords hashed in auth.users.
