-- =============================================================================
-- 012_pin_secrets_salt_nullable.rollback.sql
--
-- 012 で行った salt の nullable 化を元に戻す。
--
-- ⚠️ 警告：このスクリプトを実行する前に、v2 レコード（salt = NULL）を
--    すべて削除する必要があります。null 値を持つ行がある状態で
--    SET NOT NULL を実行すると失敗します。
--
-- 確認用 SQL:
--   SELECT count(*) FROM public.digital_pin_secrets WHERE salt IS NULL;
--
-- 上記が 0 でない場合、先に v2 レコードを削除するか、別の意味のある salt を
-- 埋めてから実行してください。
-- =============================================================================

ALTER TABLE public.digital_pin_secrets
  ALTER COLUMN salt SET NOT NULL;
