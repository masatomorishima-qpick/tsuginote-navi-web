-- =============================================================================
-- 009_trial_reminder_columns
--
-- digital_subscriptions に「トライアル終了通知メール送信履歴」のカラムを追加。
-- 重複送信を防ぐためのフラグ。
--
-- 用途：
--   - trial_warning_sent_at  … 「あと N 日でトライアル終了」リマインドメール送信日時
--   - trial_ended_sent_at    … 「トライアル満了」通知メール送信日時
--
-- 実行方法：Supabase Dashboard → SQL Editor → 全文をペースト → Run
-- 冪等性：IF NOT EXISTS 相当の DO ブロックで保護
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'digital_subscriptions'
      AND column_name = 'trial_warning_sent_at'
  ) THEN
    ALTER TABLE public.digital_subscriptions
      ADD COLUMN trial_warning_sent_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'digital_subscriptions'
      AND column_name = 'trial_ended_sent_at'
  ) THEN
    ALTER TABLE public.digital_subscriptions
      ADD COLUMN trial_ended_sent_at timestamptz;
  END IF;
END $$;

COMMENT ON COLUMN public.digital_subscriptions.trial_warning_sent_at IS
  'トライアル終了 N 日前のリマインドメール送信日時。NULL なら未送信。';
COMMENT ON COLUMN public.digital_subscriptions.trial_ended_sent_at IS
  'トライアル満了通知メール送信日時。NULL なら未送信。';
