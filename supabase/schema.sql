-- Run this in Supabase SQL Editor.
-- Replace the two emails before running, then create the same two users in Authentication.

create extension if not exists "pgcrypto";

create table if not exists public.allowed_users (
  email text primary key,
  display_name text not null check (display_name in ('陈振明', '何烈')),
  created_at timestamptz not null default now()
);

insert into public.allowed_users (email, display_name)
values
  ('chen-zhenming@billiards.local', '陈振明'),
  ('he-lie@billiards.local', '何烈')
on conflict (email) do update set display_name = excluded.display_name;

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  weekday text not null,
  round_no integer not null check (round_no > 0),
  player_a_name text not null default '陈振明',
  player_b_name text not null default '何烈',
  player_a_score integer not null check (player_a_score >= 0),
  player_b_score integer not null check (player_b_score >= 0),
  winner text not null check (winner in ('陈振明', '何烈', '平局')),
  score_diff integer not null check (score_diff >= 0),
  table_fee numeric(10, 2) not null default 0 check (table_fee >= 0),
  payer text not null check (payer in ('陈振明', '何烈')),
  note text,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists matches_round_no_unique on public.matches (round_no);
create index if not exists matches_date_idx on public.matches (date desc);
create index if not exists matches_winner_idx on public.matches (winner);
create index if not exists matches_payer_idx on public.matches (payer);

create or replace function public.is_allowed_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.allowed_users
    where email = (auth.jwt() ->> 'email')
  );
$$;

create or replace function public.set_match_computed_fields()
returns trigger
language plpgsql
as $$
begin
  new.player_a_name := '陈振明';
  new.player_b_name := '何烈';

  new.weekday := case extract(dow from new.date)
    when 0 then '周日'
    when 1 then '周一'
    when 2 then '周二'
    when 3 then '周三'
    when 4 then '周四'
    when 5 then '周五'
    else '周六'
  end;

  if new.player_a_score = new.player_b_score then
    new.winner := '平局';
  elsif new.player_a_score > new.player_b_score then
    new.winner := '陈振明';
  else
    new.winner := '何烈';
  end if;

  new.score_diff := abs(new.player_a_score - new.player_b_score);
  new.updated_at := now();

  if tg_op = 'INSERT' and new.created_by is null then
    new.created_by := auth.uid();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_set_match_computed_fields on public.matches;
create trigger trg_set_match_computed_fields
before insert or update on public.matches
for each row execute function public.set_match_computed_fields();

alter table public.allowed_users enable row level security;
alter table public.matches enable row level security;

drop policy if exists "Allowed users can read allowed users" on public.allowed_users;
create policy "Allowed users can read allowed users"
on public.allowed_users for select
to authenticated
using (public.is_allowed_user());

drop policy if exists "Allowed users can read matches" on public.matches;
create policy "Allowed users can read matches"
on public.matches for select
to authenticated
using (public.is_allowed_user());

drop policy if exists "Allowed users can insert matches" on public.matches;
create policy "Allowed users can insert matches"
on public.matches for insert
to authenticated
with check (public.is_allowed_user());

drop policy if exists "Allowed users can update matches" on public.matches;
create policy "Allowed users can update matches"
on public.matches for update
to authenticated
using (public.is_allowed_user())
with check (public.is_allowed_user());

drop policy if exists "Allowed users can delete matches" on public.matches;
create policy "Allowed users can delete matches"
on public.matches for delete
to authenticated
using (public.is_allowed_user());
