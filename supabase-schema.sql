-- ──────────────────────────────────────────────────────────────
--  Massiv – databaseoppsett for Supabase
--  Kjør denne i Supabase: prosjektet ditt → SQL Editor → New query
--  → lim inn alt → Run.
-- ──────────────────────────────────────────────────────────────

-- INNLEGG (dagbok) ----------------------------------------------
create table if not exists posts (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  day_number  int,
  title       text,
  body        text,
  image_url   text
);

alter table posts enable row level security;

-- Alle kan LESE innlegg ...
create policy "posts er offentlig lesbare"
  on posts for select
  using (true);

-- ... men ingen kan skrive via nettsiden. Du legger inn innlegg selv
-- fra Supabase (Table editor), så det holder med lese-regelen over.


-- GJESTEBOK -----------------------------------------------------
create table if not exists guestbook (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null,
  message     text not null
);

alter table guestbook enable row level security;

-- Alle kan lese gjestebok-hilsener ...
create policy "gjestebok er offentlig lesbar"
  on guestbook for select
  using (true);

-- ... og alle kan legge til en hilsen (men ikke endre/slette andres).
create policy "alle kan skrive i gjesteboka"
  on guestbook for insert
  with check (
    char_length(name) between 1 and 40
    and char_length(message) between 1 and 500
  );
