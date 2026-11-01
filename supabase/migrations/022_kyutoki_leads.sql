-- 給湯器 B（自社の取り次ぎ）：診断の結果画面で「2社から総額の見積もり」を希望した人の受付。
-- 2026-11-02 作成。/api/kyutoki/lead が書き込む。
-- 書き込み・読み取りはサーバー側（秘密鍵）だけ。ブラウザから直接は読めない・書けない（lp_event_logs と同じ）。
-- 段ごとの記録（要件がそろった・業者が受けた・日程確定・面談完了）は status と各日時の列で持つ。
create table if not exists public.kyutoki_leads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  email text not null,
  -- 同意（第三者提供）：押した日時と、そのとき画面に出ていた文言をそのまま残す
  consent_at timestamptz not null,
  consent_text text not null,
  -- 診断の回答（symptom / type / home / age / area）と判定
  answers jsonb not null default '{}'::jsonb,
  verdict text,
  -- 入口（default / jumyo / hiyou / mitsumori）と版
  entry text,
  version text,
  -- 広告の計測（utm_* / gclid）と、行動ログとのつなぎ
  attribution jsonb not null default '{}'::jsonb,
  anon_id text,
  visit_id text,
  -- 運用の段：new → asked（受付メール送信）→ ready（要件がそろう）→ offered（業者へ打診）
  --   → scheduled（日程確定）→ done（面談完了）／ closed（途中で終了。理由は note）
  status text not null default 'new',
  asked_at timestamptz,
  ready_at timestamptz,
  offered_at timestamptz,
  scheduled_at timestamptz,
  done_at timestamptz,
  vendors text[],
  note text
);

create index if not exists kyutoki_leads_created_idx on public.kyutoki_leads (created_at desc);
create index if not exists kyutoki_leads_status_idx on public.kyutoki_leads (status);

alter table public.kyutoki_leads enable row level security;
-- 方針なし＝匿名・ログイン利用者からは触れない。秘密鍵（サーバー）は制限を受けない。

notify pgrst, 'reload schema';
