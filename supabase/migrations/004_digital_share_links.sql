-- =============================================================================
-- 004_digital_share_links.sql
--
-- 目的：期限付きの「家族向け共有リンク」機能を追加する（Week4）
--
-- 概要：
--   - digital_share_links テーブル：期限付きトークンを管理
--   - 本人は最大5本まで有効リンクを保持できる（アプリ側で制御）
--   - 家族はトークン経由でログイン不要で閲覧可能
--   - 公開アクセスは「token + 期限有効 + 未失効」の条件を満たす場合のみ
--   - 本人による発行 / 失効 / 家族からの閲覧 / PDFダウンロードを監査ログに記録
--
-- 適用方法：
--   Supabase Dashboard → SQL Editor → このファイルを貼り付けて Run
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. 監査ログの action CHECK 制約を拡張（Week4 で増える4種類）
-- -----------------------------------------------------------------------------
ALTER TABLE public.digital_audit_logs
  DROP CONSTRAINT IF EXISTS digital_audit_logs_action_check;

ALTER TABLE public.digital_audit_logs
  ADD CONSTRAINT digital_audit_logs_action_check
  CHECK (action IN (
    -- Week0/1/2/3 既存
    'login',
    'logout',
    'asset_create',
    'asset_update',
    'asset_delete',
    'pdf_export',
    'data_export',
    'reminder_settings_update',
    'account_delete',
    -- Week4 で追加
    'share_link_create',       -- 本人が共有リンクを発行
    'share_link_revoke',       -- 本人が共有リンクを失効
    'share_link_access',       -- 家族が共有ページを閲覧
    'share_link_pdf_export'    -- 家族が共有経由でPDFをダウンロード
  ));

COMMENT ON COLUMN public.digital_audit_logs.action IS
  '操作種別。Week4 までに以下を許容: login/logout/asset_*/pdf_export/data_export/'
  'reminder_settings_update/account_delete/share_link_create/share_link_revoke/'
  'share_link_access/share_link_pdf_export';

-- -----------------------------------------------------------------------------
-- 2. digital_share_links テーブル
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.digital_share_links (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 推測されにくい URL-safe トークン（アプリ側で 32 bytes random を base64url）
  token             TEXT NOT NULL UNIQUE,
  -- 任意ラベル（「長男用」「弁護士用」など）
  label             TEXT,
  -- 期限（必須・将来日時）
  expires_at        TIMESTAMPTZ NOT NULL,
  -- 失効日時（NULL なら有効）
  revoked_at        TIMESTAMPTZ,
  -- 直近アクセス時刻（家族が開いたときに更新）
  last_accessed_at  TIMESTAMPTZ,
  -- アクセス回数
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
  '期限付き共有リンク。本人のみ発行・失効可能、家族はトークン経由でログイン不要で閲覧可能。';

-- -----------------------------------------------------------------------------
-- 3. updated_at 自動更新トリガー（既存の digital_set_updated_at 関数を再利用）
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_digital_share_links_updated_at
  ON public.digital_share_links;

CREATE TRIGGER trg_digital_share_links_updated_at
  BEFORE UPDATE ON public.digital_share_links
  FOR EACH ROW EXECUTE FUNCTION public.digital_set_updated_at();

-- -----------------------------------------------------------------------------
-- 4. RLS - 本人のみ管理可能
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

-- 注意：anon ロールには SELECT を直接付与しない。
-- 公開アクセス（家族側）は service_role 経由で
-- 「token + 未失効 + 期限内」の条件を満たす場合のみデータ取得する設計。

-- -----------------------------------------------------------------------------
-- 5. GRANT
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.digital_share_links TO authenticated;

-- =============================================================================
-- 動作確認クエリ（任意）
-- =============================================================================
-- 適用後、以下が4行（select/insert/update/delete）返ればRLSは正常：
--   select policyname, cmd from pg_policies
--   where tablename = 'digital_share_links';
--
-- 監査ログの action CHECK が更新されたか確認：
--   select pg_get_constraintdef(oid)
--   from pg_constraint
--   where conname = 'digital_audit_logs_action_check';
--   → share_link_create / share_link_revoke / share_link_access /
--     share_link_pdf_export が含まれていればOK。

-- =============================================================================
-- 完了
-- =============================================================================
