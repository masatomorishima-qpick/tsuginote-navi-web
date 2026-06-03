-- =============================================================================
-- 012_pin_secrets_salt_nullable.sql
--
-- v2 形式の PIN シークレット（KEK + DEK エンベロープ方式）では、PIN レコード側に
-- salt を保存しない。salt は KEK エンベロープ側（digital_user_kek_envelopes）で
-- 管理するため、PIN レコードでは不要。
--
-- 経緯：005 で digital_pin_secrets.salt を NOT NULL で作成。
--       008（v2 対応）で encrypted_dek / dek_iv を追加し algorithm_version の
--       CHECK を v1/v2 両方許可にしたが、salt を nullable にし忘れていた。
--       結果：v2 PIN の INSERT が「null value in column "salt"」エラーで失敗。
--
-- 影響:
--   - 既存の v1 レコード：引き続き salt を保持（変更なし）
--   - 新規 v2 レコード：salt = NULL で保存可能になる
--
-- ロールバック: 012_pin_secrets_salt_nullable.rollback.sql
-- =============================================================================

ALTER TABLE public.digital_pin_secrets
  ALTER COLUMN salt DROP NOT NULL;

COMMENT ON COLUMN public.digital_pin_secrets.salt IS
  'v1 のみ：PBKDF2 用 salt（Base64）。v2 では KEK エンベロープ側で管理するため NULL。';
