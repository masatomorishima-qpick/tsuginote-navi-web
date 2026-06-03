-- =============================================================================
-- 006_digital_subscriptions.sql
--
-- Phase 1.5：プラン管理テーブル新設
--
-- 役割：
--   - ユーザーごとの FREE / STANDARD プラン状態を管理
--   - 30 日間のカードなしトライアル管理（trial_started_at / trial_expires_at）
--   - Stripe Subscriptions との連携情報（stripe_customer_id / stripe_subscription_id）
--   - 課金期間と解約予定を保持（Webhook で同期）
--
-- 設計方針：
--   - **新規ユーザーは自動的に「30 日 STANDARD トライアル」で開始**
--   - トライアル終了で trigger ベースではなく、アプリ側で trial_expires_at を見て判断
--     （理由：日次 cron の不安定さを避け、リクエスト都度判定で確実性を担保）
--   - Stripe 連携は段階 5 で実装。それまで stripe_* 列は NULL
--
-- 実行方法：Supabase Dashboard → SQL Editor → このファイルを貼り付け → Run
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. テーブル
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.digital_subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- プラン種別と状態
  plan                     TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'standard')),
  status                   TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN (
                             'trialing',   -- 30 日カードなしトライアル中（plan='standard'）
                             'active',     -- 有効な有料サブスク（plan='standard'）
                             'past_due',   -- Stripe 支払い失敗
                             'canceled',   -- 解約済み（期間終了まで利用可能）
                             'free'        -- FREE プランへ降格済み（plan='free'）
                           )),

  -- 30 日トライアル管理（カードなしモード）
  trial_started_at         TIMESTAMPTZ,
  trial_expires_at         TIMESTAMPTZ,

  -- Stripe 連携（段階 5 で書き込み開始）
  stripe_customer_id       TEXT UNIQUE,
  stripe_subscription_id   TEXT UNIQUE,

  -- 課金サイクル（'monthly' または 'yearly'、トライアル中は NULL）
  billing_cycle            TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),

  -- 課金期間（Stripe Webhook で同期）
  current_period_start     TIMESTAMPTZ,
  current_period_end       TIMESTAMPTZ,
  cancel_at_period_end     BOOLEAN NOT NULL DEFAULT FALSE,

  -- 監査
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.digital_subscriptions IS
  'ユーザーごとのプラン状態（FREE/STANDARD）+ Stripe Subscription 情報。1 ユーザー 1 行。';

-- -----------------------------------------------------------------------------
-- 2. インデックス
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_digital_subscriptions_user_id
  ON public.digital_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_digital_subscriptions_stripe_customer_id
  ON public.digital_subscriptions(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_digital_subscriptions_stripe_subscription_id
  ON public.digital_subscriptions(stripe_subscription_id);

-- トライアル満了予定の検索用（運営側でリマインドメール送信のため将来使用）
CREATE INDEX IF NOT EXISTS idx_digital_subscriptions_trial_expires_at
  ON public.digital_subscriptions(trial_expires_at)
  WHERE status = 'trialing';

-- -----------------------------------------------------------------------------
-- 3. updated_at の自動更新トリガー
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_digital_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS digital_subscriptions_updated_at_trigger
  ON public.digital_subscriptions;

CREATE TRIGGER digital_subscriptions_updated_at_trigger
  BEFORE UPDATE ON public.digital_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_digital_subscriptions_updated_at();

-- -----------------------------------------------------------------------------
-- 4. 新規ユーザー作成時に自動的に 30 日トライアル開始
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- 既に行があれば何もしない（重複防止）
  INSERT INTO public.digital_subscriptions (
    user_id,
    plan,
    status,
    trial_started_at,
    trial_expires_at
  )
  VALUES (
    NEW.id,
    'standard',
    'trialing',
    NOW(),
    NOW() + INTERVAL '30 days'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created_subscription
  ON auth.users;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_subscription();

-- -----------------------------------------------------------------------------
-- 5. RLS
-- -----------------------------------------------------------------------------

ALTER TABLE public.digital_subscriptions ENABLE ROW LEVEL SECURITY;

-- SELECT：本人のみ閲覧可能
DROP POLICY IF EXISTS digital_subscriptions_select_own
  ON public.digital_subscriptions;

CREATE POLICY digital_subscriptions_select_own
  ON public.digital_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE：通常のクライアントは禁止
-- 書き込みは service_role（API ルートや Stripe Webhook）経由のみ。
-- これは「ALTER TABLE ... FORCE ROW LEVEL SECURITY」を使わず、
-- service_role が RLS を bypass する Supabase の標準動作に依存する。

-- -----------------------------------------------------------------------------
-- 6. 既存ユーザーへの初期データ投入（バックフィル）
-- -----------------------------------------------------------------------------
-- このマイグレーションを適用した時点で既に登録済みのユーザーに対しても
-- digital_subscriptions の行を作成する。
-- すでに開発・テストで作ったアカウントについては「30日トライアル開始」とみなす。

INSERT INTO public.digital_subscriptions (
  user_id,
  plan,
  status,
  trial_started_at,
  trial_expires_at
)
SELECT
  u.id,
  'standard',
  'trialing',
  NOW(),
  NOW() + INTERVAL '30 days'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1
  FROM public.digital_subscriptions ds
  WHERE ds.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================================================
-- 動作確認クエリ（任意・適用後の検証用）
-- =============================================================================

-- 自分のサブスク状態が見えるか：
--   SELECT * FROM public.digital_subscriptions WHERE user_id = auth.uid();

-- ポリシー一覧：
--   SELECT policyname, cmd FROM pg_policies
--   WHERE tablename = 'digital_subscriptions';

-- トリガー一覧：
--   SELECT tgname FROM pg_trigger
--   WHERE tgrelid = 'public.digital_subscriptions'::regclass;
