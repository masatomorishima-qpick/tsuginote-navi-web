-- =============================================================================
-- 013_drop_share_links.rollback.sql
--
-- 目的：013_drop_share_links.sql のロールバック
--
-- 概要：
--   1. digital_share_links テーブルを再作成
--   2. RLS ポリシー・トリガー・インデックスを再構築
--   3. digital_audit_logs の CHECK 制約に share_link_* 4 種を戻す
--
-- 注意：
--   - 旧 share-link データ（テーブル内容）は永久に失われているため復元できない。
--     ロールバックは「スキーマだけ復元する」目的での実行を想定。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. digital_share_links テーブルを再作成
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.digital_share_links (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token             TEXT NOT NULL UNIQUE,
  label             TEXT,
  expires_at        TIMESTAMPTZ NOT NULL,
  revoked_at        TIMESTAMPTZ,
  last_accessed_at  TIMESTAMPTZ,
  access_count      INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digital_share_links_user_id
  ON public.digital_share_links(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_share_links_token
  ON public.digital_share_links(token);
CREATE INDEX IF NOT EXISTS idx_digital_share_links_expires_at
  ON public.digital_share_links(expires_at);

COMMENT ON TABLE public.digital_share_links IS
  '期限付き共有リンク。本人のみ発行・失効可能、大切な方はトークン経由でログイン不要で閲覧可能。';

-- -----------------------------------------------------------------------------
-- 2. updated_at 自動更新トリガー（既存の digital_set_updated_at 関数を再利用）
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_digital_share_links_updated_at
  ON public.digital_share_links;

CREATE TRIGGER trg_digital_share_links_updated_at
  BEFORE UPDATE ON public.digital_share_links
  FOR EACH ROW EXECUTE FUNCTION public.digital_set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. RLS - 本人のみ管理可能
-- -----------------------------------------------------------------------------
ALTER TABLE public.digital_share_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "digital_share_links_select_own" ON public.digital_share_links;
CREATE POLICY "digital_share_links_select_own"
  ON public.digital_share_links FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "digital_share_links_insert_own" ON public.digital_share_links;
CREATE POLICY "digital_share_links_insert_own"
  ON public.digital_share_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "digital_share_links_update_own" ON public.digital_share_links;
CREATE POLICY "digital_share_links_update_own"
  ON public.digital_share_links FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "digital_share_links_delete_own" ON public.digital_share_links;
CREATE POLICY "digital_share_links_delete_own"
  ON public.digital_share_links FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.digital_share_links TO authenticated;

-- -----------------------------------------------------------------------------
-- 4. digital_audit_logs の CHECK 制約に share_link_* を戻す
-- -----------------------------------------------------------------------------
ALTER TABLE public.digital_audit_logs
  DROP CONSTRAINT IF EXISTS digital_audit_logs_action_check;

ALTER TABLE public.digital_audit_logs
  ADD CONSTRAINT digital_audit_logs_action_check
  CHECK (action IN (
    'login',
    'logout',
    'asset_create',
    'asset_update',
    'asset_delete',
    'pdf_export',
    'data_export',
    'reminder_settings_update',
    'account_delete',
    -- Phase1 PIN
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
    'family_invite_resend',
    -- 旧 share-link（ロールバックで復活）
    'share_link_create',
    'share_link_revoke',
    'share_link_access',
    'share_link_pdf_export'
  ));

-- =============================================================================
-- 完了
-- =============================================================================
