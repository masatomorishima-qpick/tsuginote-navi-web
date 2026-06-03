-- =============================================================================
-- 013_drop_share_links.sql
--
-- 目的：旧 share-link 機能（期限付き共有URL）の完全廃止
--
-- 概要：
--   - 大切な方への引き継ぎは、新モデル（連携アカウント + 死亡通知フロー）に
--     一本化された。旧 share-link 機能（004_digital_share_links.sql で導入）は
--     アプリ側から完全に削除済みのため、DB 側のテーブル・制約を整理する。
--
-- 実行内容：
--   1. digital_audit_logs から share_link_* レコードを削除（旧機能の証跡）
--   2. digital_audit_logs の CHECK 制約から share_link_* 4 種を除去
--   3. digital_share_links テーブルを DROP（ポリシー・トリガー・インデックス
--      も CASCADE で削除される）
--
-- 適用方法：
--   Supabase Dashboard → SQL Editor → このファイルを貼り付けて Run
--
-- ロールバック：
--   013_drop_share_links.rollback.sql を実行（004 を実質再適用）
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. share_link_* の監査ログレコードを削除（CHECK 制約変更前に行う必要あり）
-- -----------------------------------------------------------------------------
DELETE FROM public.digital_audit_logs
 WHERE action IN (
   'share_link_create',
   'share_link_revoke',
   'share_link_access',
   'share_link_pdf_export'
 );

-- -----------------------------------------------------------------------------
-- 2. digital_audit_logs の CHECK 制約から share_link_* を除去
--    （Phase1 PIN・Phase1.5 family 系を許容する最新形に揃える）
-- -----------------------------------------------------------------------------
ALTER TABLE public.digital_audit_logs
  DROP CONSTRAINT IF EXISTS digital_audit_logs_action_check;

ALTER TABLE public.digital_audit_logs
  ADD CONSTRAINT digital_audit_logs_action_check
  CHECK (action IN (
    -- Week0〜3 既存
    'login',
    'logout',
    'asset_create',
    'asset_update',
    'asset_delete',
    'pdf_export',
    'data_export',
    'reminder_settings_update',
    'account_delete',
    -- Phase1 デバイス・PIN・再認証
    'device_create',
    'device_update',
    'device_delete',
    'pin_register',
    'pin_reveal',
    'pin_reveal_copy',
    'pin_update',
    'pin_delete',
    'stepup_start',
    'stepup_success',
    'stepup_fail',
    -- Phase1.5 連携アカウント招待
    'family_invite_create',
    'family_invite_resend'
  ));

COMMENT ON COLUMN public.digital_audit_logs.action IS
  '操作種別。2026-05 改訂：旧 share-link 機能（share_link_*）を廃止。'
  '許容値は CHECK 制約参照。';

-- -----------------------------------------------------------------------------
-- 3. digital_share_links テーブルを DROP
--    （関連するポリシー・トリガー・インデックスは CASCADE で削除）
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.digital_share_links CASCADE;

-- =============================================================================
-- 動作確認クエリ（任意）
-- =============================================================================
-- テーブルが消えたことを確認：
--   SELECT to_regclass('public.digital_share_links');
--   → NULL ならOK
--
-- CHECK 制約から share_link_* が消えたことを確認：
--   SELECT pg_get_constraintdef(oid)
--   FROM pg_constraint
--   WHERE conname = 'digital_audit_logs_action_check';
--   → share_link_* が含まれていなければOK
--
-- 既存ログの整合性確認：
--   SELECT action, COUNT(*) FROM public.digital_audit_logs GROUP BY action;
--   → share_link_* が出てこなければOK

-- =============================================================================
-- 完了
-- =============================================================================
