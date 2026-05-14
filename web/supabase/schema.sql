-- ─────────────────────────────────────────────────────────────────────────────
-- Cascades Expériences — schema Supabase initial
--
-- À lancer dans : Supabase Dashboard → SQL Editor → New query → Run
-- Ou via CLI : supabase db push (si tu configures la CLI plus tard)
--
-- Couvre :
--   - Enum `stage_type` (wheeling, conduite, prive, rando-electrique)
--   - Table `sessions` (dates planifiées des stages)
--   - Table `profiles` (1:1 avec auth.users, ajoute le rôle admin)
--   - Trigger qui crée auto le profile à chaque signup
--   - Trigger qui met à jour updated_at sur chaque UPDATE de sessions
--   - RLS policies : lecture publique sessions, écriture réservée aux admins
--   - Seed : insère les 7 sessions actuelles (peut être commenté si tu repars de zéro)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Enum des types de stage ───────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'stage_type') then
    create type public.stage_type as enum (
      'wheeling',
      'conduite',
      'prive',
      'rando-electrique'
    );
  end if;
end $$;

-- ── 2. Table sessions ────────────────────────────────────────────────────────
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  stage public.stage_type not null,
  date date not null,
  location text not null,
  spots_left integer not null check (spots_left >= 0),
  capacity integer not null check (capacity >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sessions_spots_not_above_capacity check (spots_left <= capacity)
);

-- Index pour le filtre "à venir" + tri par date (utilisé sur /stages et la home)
create index if not exists sessions_date_idx on public.sessions (date);
create index if not exists sessions_stage_idx on public.sessions (stage);

-- ── 3. Trigger pour maintenir updated_at à jour ──────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sessions_set_updated_at on public.sessions;
create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

-- ── 4. Table profiles (1:1 avec auth.users) ──────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  full_name text,
  created_at timestamptz not null default now()
);

-- Trigger qui crée le profile dès qu'un utilisateur s'inscrit
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 5. Activer Row Level Security ────────────────────────────────────────────
alter table public.sessions enable row level security;
alter table public.profiles enable row level security;

-- ── 6. Helper : is_admin(uid) ────────────────────────────────────────────────
-- Permet d'éviter de faire un sous-select à chaque policy
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;

-- ── 7. Policies sessions ─────────────────────────────────────────────────────
-- Lecture : tout le monde (visiteurs anonymes inclus), pour /stages et la home
drop policy if exists "sessions are publicly readable" on public.sessions;
create policy "sessions are publicly readable"
  on public.sessions for select
  to anon, authenticated
  using (true);

-- Écriture : uniquement admins
drop policy if exists "only admins can insert sessions" on public.sessions;
create policy "only admins can insert sessions"
  on public.sessions for insert
  to authenticated
  with check (public.is_admin(auth.uid()));

drop policy if exists "only admins can update sessions" on public.sessions;
create policy "only admins can update sessions"
  on public.sessions for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "only admins can delete sessions" on public.sessions;
create policy "only admins can delete sessions"
  on public.sessions for delete
  to authenticated
  using (public.is_admin(auth.uid()));

-- ── 8. Policies profiles ─────────────────────────────────────────────────────
-- Chacun voit son propre profil ; les admins voient tout
drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));

-- Chacun peut mettre à jour son propre profil, sauf le champ `role`
drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- Admins peuvent tout faire sur profiles (changer les rôles, etc.)
drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles"
  on public.profiles for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ── 9. Seed des 7 sessions actuelles ─────────────────────────────────────────
-- Reprend exactement les valeurs de web/content/sessions/*.json (avant strip Decap)
-- Idempotent : on ne ré-insère pas si les dates existent déjà.
insert into public.sessions (stage, date, location, spots_left, capacity)
values
  ('wheeling',         '2026-06-08', 'Pôle Mécanique de Clastres (02)', 5, 9),  -- valeur modifiée via Decap
  ('conduite',         '2026-06-15', 'Pôle Mécanique de Clastres (02)', 5, 10),
  ('rando-electrique', '2026-06-22', 'Pôle Mécanique de Clastres (02)', 4, 6),
  ('wheeling',         '2026-07-06', 'Pôle Mécanique de Clastres (02)', 8, 8),
  ('conduite',         '2026-07-13', 'Pôle Mécanique de Clastres (02)', 6, 10),
  ('wheeling',         '2026-09-14', 'Pôle Mécanique de Clastres (02)', 7, 8),
  ('rando-electrique', '2026-09-28', 'Pôle Mécanique de Clastres (02)', 6, 6)
on conflict do nothing;

-- ── 10. Promote le premier user en admin (à exécuter manuellement) ───────────
-- Une fois que tu as créé ton compte via /login (signup) :
--   1. Trouve ton uid dans : Dashboard → Authentication → Users
--   2. Décommente et lance :
-- update public.profiles set role = 'admin' where email = 'ton@email.fr';

-- ─────────────────────────────────────────────────────────────────────────────
-- FIN
-- ─────────────────────────────────────────────────────────────────────────────
