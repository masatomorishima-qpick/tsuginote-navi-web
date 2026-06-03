-- =============================================================================
-- 016_trial_final_reminder_column のロールバック
--
-- 実行方法：Supabase Dashboard → SQL Editor → 全文をペースト → Run
-- =============================================================================

ALTER TABLE public.digital_subscriptions
  DROP COLUMN IF EXISTS trial_warning_final_sent_at;
