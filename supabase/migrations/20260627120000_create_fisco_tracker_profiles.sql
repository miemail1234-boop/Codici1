create table if not exists public.fisco_tracker_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.fisco_tracker_profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'fisco_tracker_profiles'
      and policyname = 'Users can read their own fisco tracker data'
  ) then
    create policy "Users can read their own fisco tracker data"
      on public.fisco_tracker_profiles
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'fisco_tracker_profiles'
      and policyname = 'Users can insert their own fisco tracker data'
  ) then
    create policy "Users can insert their own fisco tracker data"
      on public.fisco_tracker_profiles
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'fisco_tracker_profiles'
      and policyname = 'Users can update their own fisco tracker data'
  ) then
    create policy "Users can update their own fisco tracker data"
      on public.fisco_tracker_profiles
      for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'fisco_tracker_profiles'
      and policyname = 'Users can delete their own fisco tracker data'
  ) then
    create policy "Users can delete their own fisco tracker data"
      on public.fisco_tracker_profiles
      for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_fisco_tracker_profiles_updated_at on public.fisco_tracker_profiles;
create trigger set_fisco_tracker_profiles_updated_at
  before update on public.fisco_tracker_profiles
  for each row
  execute function public.set_updated_at();
