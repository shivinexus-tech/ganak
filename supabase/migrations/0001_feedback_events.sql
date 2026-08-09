-- Ganak datastore P0: anonymous feedback + events. RLS default-deny.
-- Writes come only from the Cloudflare Function (service role). No PII. No birth data.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null default 'general' check (kind in ('aarti_correction','general')),
  slug text,
  lang text,
  flagged_text text,
  suggestion text not null,
  route text,
  app_version text,
  status text not null default 'new' check (status in ('new','reviewed','applied','dismissed'))
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (name in
    ('page_view','muhurat_search','muhurat_share','muhurat_export','feedback_sent','aarti_view','aarti_lang_switch')),
  props jsonb not null default '{}'::jsonb,
  day date not null default (now() at time zone 'utc')::date
);

-- RLS: enable + default-deny. No policies for anon/authenticated => they can do nothing.
-- The service role key used by the Function BYPASSES RLS, so Function inserts still work.
alter table public.feedback enable row level security;
alter table public.events   enable row level security;
revoke all on public.feedback from anon, authenticated, public;
revoke all on public.events   from anon, authenticated, public;
