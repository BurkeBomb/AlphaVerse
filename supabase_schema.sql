-- supabase_schema.sql — Alphaverse public leaderboards with teams
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  name text not null check (char_length(name) between 1 and 32),
  team text,
  category text not null,
  score int not null check (score >= 0),
  total int not null check (total > 0),
  seconds int not null check (seconds >= 0),
  meta jsonb
);
alter table public.scores enable row level security;
create policy "Public read scores" on public.scores for select using (true);
create policy "Public insert scores" on public.scores for insert with check (true);
revoke update, delete on public.scores from anon, authenticated;
create index if not exists idx_scores_category on public.scores (category);
create index if not exists idx_scores_score on public.scores (score desc, seconds asc, created_at asc);
create index if not exists idx_scores_team on public.scores (team);
