-- =============================================================================
-- 015_family_link_suspended
--
-- digital_family_links に 'suspended'（休止）ステータスを追加する。
--
-- 背景（課題 #30）：
--   per-recipient 課金では、連携相手の承認時にオーナーが未払い（カード未登録）でも
--   連携が active になり、トライアル満了後も active のまま残ってしまう。
--   そこで「トライアル満了・カード未登録（事実上 FREE）」のオーナーの連携を
--   trial-reminders cron で 'suspended' に切り替える。
--
--   - 休止中は status != 'active' のため、課金数量（active のみ集計）と
--     死亡開示（active のみ対象）から自動的に外れる。
--   - オーナーがカードを登録（Checkout 完了）した時点で 'active' に戻す。
--
-- 追加内容：
--   ① status の CHECK 制約を ('active','revoked') → ('active','revoked','suspended') に更新
--   ② suspended_at カラム（休止に切り替えた日時。復活時は NULL に戻す）
--
-- 実行方法：Supabase Dashboard → SQL Editor → 全文をペースト → Run
-- 冪等性：DROP ... IF EXISTS / ADD COLUMN IF NOT EXISTS で再実行に耐える
-- 適用先：本番（xwirvmwejqebjpieqlzn）・開発（plzkahfirszndmcndhyt）の両方
-- =============================================================================

-- ① status CHECK 制約を更新（'suspended' を許可）
ALTER TABLE public.digital_family_links
  DROP CONSTRAINT IF EXISTS digital_family_links_status_check;

ALTER TABLE public.digital_family_links
  ADD CONSTRAINT digital_family_links_status_check
  CHECK (status IN ('active', 'revoked', 'suspended'));

-- ② suspended_at カラム追加（冪等）
ALTER TABLE public.digital_family_links
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz;
