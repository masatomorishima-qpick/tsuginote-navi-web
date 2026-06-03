-- =============================================================================
-- 015_family_link_suspended のロールバック
--
-- 注意：'suspended' 状態の連携が残っている場合、先に 'active' へ戻してから実行する
--       （CHECK 制約を ('active','revoked') に戻すと 'suspended' 行が制約違反になるため）。
--
--   UPDATE public.digital_family_links SET status = 'active', suspended_at = NULL
--     WHERE status = 'suspended';
--
-- 実行方法：Supabase Dashboard → SQL Editor → 全文をペースト → Run
-- =============================================================================

-- ① suspended_at カラム削除
ALTER TABLE public.digital_family_links
  DROP COLUMN IF EXISTS suspended_at;

-- ② CHECK 制約を元（'active','revoked'）に戻す
ALTER TABLE public.digital_family_links
  DROP CONSTRAINT IF EXISTS digital_family_links_status_check;

ALTER TABLE public.digital_family_links
  ADD CONSTRAINT digital_family_links_status_check
  CHECK (status IN ('active', 'revoked'));
