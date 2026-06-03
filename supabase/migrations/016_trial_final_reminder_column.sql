-- =============================================================================
-- 016_trial_final_reminder_column
--
-- digital_subscriptions に「トライアル終了前日リマインド」の送信履歴カラムを追加。
--
-- 背景：
--   従来は「終了 N 日前（1 回）」＋「満了当日」の 2 通のみだった。
--   直前に気づけるよう「終了前日（約 24h 前・1 回）」のリマインドを追加する。
--   重複送信を防ぐため、専用の送信済みフラグ列を設ける。
--
-- 用途：
--   - trial_warning_final_sent_at … 「終了まであと 1 日」前日リマインド送信日時
--
-- 既存（009）との関係：
--   - trial_warning_sent_at      … 早期リマインド（7 日前窓・1 回）
--   - trial_warning_final_sent_at … 前日リマインド（24h 前・1 回）← 本マイグレで追加
--   - trial_ended_sent_at        … 満了当日通知
--
-- 実行方法：Supabase Dashboard → SQL Editor → 全文をペースト → Run
-- 冪等性：IF NOT EXISTS 相当の DO ブロックで保護
-- 適用先：本番（xwirvmwejqebjpieqlzn）・開発（plzkahfirszndmcndhyt）の両方
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'digital_subscriptions'
      AND column_name = 'trial_warning_final_sent_at'
  ) THEN
    ALTER TABLE public.digital_subscriptions
      ADD COLUMN trial_warning_final_sent_at timestamptz;
  END IF;
END $$;

COMMENT ON COLUMN public.digital_subscriptions.trial_warning_final_sent_at IS
  'トライアル終了前日（約24h前）リマインドメール送信日時。NULL なら未送信。';
