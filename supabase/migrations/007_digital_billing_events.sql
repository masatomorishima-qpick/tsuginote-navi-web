-- =============================================================================
-- 007_digital_billing_events
--
-- Stripe Webhook の冪等性確保用テーブル。
-- 同じイベントを 2 度受け取っても二重処理しないよう、
-- stripe_event_id を UNIQUE で保存する。
--
-- アプリの一般ユーザーは閲覧不可（service_role のみアクセス可能）。
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.digital_billing_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  type            text NOT NULL,                                  -- 例: 'checkout.session.completed'
  payload         jsonb NOT NULL,                                 -- Stripe からの生 payload
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  processed_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_digital_billing_events_user_id
  ON public.digital_billing_events (user_id, processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_digital_billing_events_type
  ON public.digital_billing_events (type, processed_at DESC);

-- RLS：一般ユーザーには見せない。service_role のみが書き込み・読み取りする運用。
ALTER TABLE public.digital_billing_events ENABLE ROW LEVEL SECURITY;

-- どの SELECT/INSERT/UPDATE/DELETE ポリシーも作成しない =
-- authenticated ユーザーには 0 行に見える（RLS 既定動作）。
-- service_role はそもそも RLS をバイパスする。

COMMENT ON TABLE public.digital_billing_events IS
  'Stripe Webhook イベントの冪等保存。stripe_event_id UNIQUE で再処理を防止する。';
