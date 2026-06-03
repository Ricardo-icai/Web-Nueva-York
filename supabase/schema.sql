-- NYC Family Planner - Supabase bootstrap schema
-- Run this in Supabase SQL Editor after creating the project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferred_language text not null default 'es',
  home_city text,
  trip_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('restaurant', 'rooftop', 'viewpoint', 'plan')),
  item_id text not null,
  item_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_favorites enable row level security;

create policy "Profiles are readable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are editable by their owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Preferences are readable by their owner"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Preferences are insertable by their owner"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Preferences are editable by their owner"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Favorites are readable by their owner"
  on public.user_favorites for select
  using (auth.uid() = user_id);

create policy "Favorites are insertable by their owner"
  on public.user_favorites for insert
  with check (auth.uid() = user_id);

create policy "Favorites are editable by their owner"
  on public.user_favorites for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Favorites are removable by their owner"
  on public.user_favorites for delete
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
