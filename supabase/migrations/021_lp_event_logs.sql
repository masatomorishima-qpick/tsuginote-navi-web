-- LP の行動ログ（/api/track が書き込む先）。
-- 2026-10-29 時点で本番にこの表がなく、/api/track が毎回 500 を返していたため作成する。
-- 書き込みはサーバー側（秘密鍵）だけ。ブラウザから直接は読めない・書けない。
create table if not exists public.lp_event_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  visit_id text,
  anon_id text,
  lp_id text not null,
  page_path text,
  event_name text not null,
  component_id text,
  choice_id text,
  choice_label text,
  section_id text,
  view_order integer,
  question_id text,
  answer_id text,
  cta_id text,
  partner_category text,
  source_section text,
  selected_intent_id text,
  selected_barrier_id text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists lp_event_logs_lp_created_idx on public.lp_event_logs (lp_id, created_at desc);
create index if not exists lp_event_logs_event_idx on public.lp_event_logs (event_name);

alter table public.lp_event_logs enable row level security;
-- 方針なし＝匿名・ログイン利用者からは触れない。秘密鍵（サーバー）は制限を受けない。

-- 表の一覧の情報を読み直させる（「schema cache に表がない」エラーの解消）
notify pgrst, 'reload schema';
