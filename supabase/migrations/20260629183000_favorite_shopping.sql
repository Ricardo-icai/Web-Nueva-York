create table if not exists public.favorite_shopping (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  name text,
  category text,
  google_place_id text,
  google_maps_url text,
  official_website text,
  image_url text,
  average_price_usd numeric,
  metadata jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_id)
);

drop trigger if exists set_favorite_shopping_updated_at on public.favorite_shopping;
create trigger set_favorite_shopping_updated_at
before update on public.favorite_shopping
for each row execute function public.set_updated_at();

alter table public.favorite_shopping enable row level security;

create index if not exists favorite_shopping_user_id_item_id_idx
on public.favorite_shopping(user_id, item_id);

drop policy if exists "Users manage own shopping favorites" on public.favorite_shopping;
create policy "Users manage own shopping favorites"
on public.favorite_shopping
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
