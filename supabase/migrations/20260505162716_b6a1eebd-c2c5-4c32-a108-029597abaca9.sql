
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Itineraries
create table public.itineraries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  destination text not null,
  start_date date,
  end_date date,
  notes text,
  tags text[] not null default '{}',
  cover_emoji text default '✈️',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.itineraries enable row level security;

create policy "Owners can view itineraries" on public.itineraries
  for select using (auth.uid() = user_id);
create policy "Owners can insert itineraries" on public.itineraries
  for insert with check (auth.uid() = user_id);
create policy "Owners can update itineraries" on public.itineraries
  for update using (auth.uid() = user_id);
create policy "Owners can delete itineraries" on public.itineraries
  for delete using (auth.uid() = user_id);

-- Activities
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  itinerary_id uuid not null references public.itineraries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  location text,
  day_number int not null default 1,
  position int not null default 0,
  start_time time,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.activities enable row level security;

create policy "Owners can view activities" on public.activities
  for select using (auth.uid() = user_id);
create policy "Owners can insert activities" on public.activities
  for insert with check (auth.uid() = user_id);
create policy "Owners can update activities" on public.activities
  for update using (auth.uid() = user_id);
create policy "Owners can delete activities" on public.activities
  for delete using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger itineraries_touch before update on public.itineraries
  for each row execute function public.touch_updated_at();
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
