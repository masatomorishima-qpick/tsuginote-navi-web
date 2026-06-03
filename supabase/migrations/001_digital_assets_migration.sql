-- =============================================================================
-- つぎの手ナビ：デジタル資産整理機能 Phase1 マイグレーション
-- Supabase (PostgreSQL) 用 / 既存プロジェクト共用版
-- Version: 1.1.0 / 2026-04-17
--
-- 既存テーブル (offices, survey_responses 等) との衝突回避のため、
-- 本機能の全テーブルに "digital_" プレフィックスを付与しています。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. digital_assets: デジタル資産メインテーブル
--    ※ パスワード・ID・口座番号は一切保存しない
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.digital_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name    TEXT NOT NULL CHECK (char_length(service_name) BETWEEN 1 AND 100),
  category        TEXT NOT NULL CHECK (category IN (
                    'subscription',    -- サブスク
                    'finance',         -- 金融
                    'sns',             -- SNS・コミュニケーション
                    'photo_storage',   -- 写真・データ保管
                    'shopping',        -- ショッピング
                    'work',            -- 仕事・業務系
                    'other'            -- その他
                  )),
  death_action    TEXT NOT NULL CHECK (death_action IN (
                    'cancel',          -- 解約してほしい
                    'inherit',         -- 家族に引き継いでほしい
                    'memorialize',     -- 追悼アカウントにしてほしい
                    'self_only',       -- 本人しか処理できない
                    'undecided'        -- まだ決めていない
                  )),
  assignee_name   TEXT CHECK (char_length(assignee_name) <= 50),
  memo            TEXT CHECK (char_length(memo) <= 500),
  official_url    TEXT CHECK (char_length(official_url) <= 2000),
  monthly_cost    INTEGER CHECK (monthly_cost >= 0 AND monthly_cost <= 10000000),
  is_confirmed    BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digital_assets_user_id
  ON public.digital_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_assets_user_category
  ON public.digital_assets(user_id, category);
CREATE INDEX IF NOT EXISTS idx_digital_assets_user_confirmed
  ON public.digital_assets(user_id, is_confirmed);

COMMENT ON TABLE public.digital_assets IS 'ユーザーのデジタル資産。パスワード・ID・口座番号は保存しない。';

-- -----------------------------------------------------------------------------
-- 2. digital_reminder_settings: 本人向けリマインド設定
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.digital_reminder_settings (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_interval  INTEGER NOT NULL DEFAULT 90
                     CHECK (reminder_interval IN (30, 60, 90, 180)),
  last_login_at      TIMESTAMPTZ,
  last_reminded_at   TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.digital_reminder_settings IS '本人向けログイン催促リマインド設定。';

-- -----------------------------------------------------------------------------
-- 3. digital_audit_logs: 監査ログ (90日間保持後に自動削除)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.digital_audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL CHECK (action IN (
                'login',
                'logout',
                'asset_create',
                'asset_update',
                'asset_delete',
                'pdf_export',
                'data_export',
                'reminder_settings_update',
                'account_delete'
              )),
  resource_id UUID,
  ip_address  INET,
  user_agent  TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digital_audit_logs_user_id
  ON public.digital_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_audit_logs_created_at
  ON public.digital_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_digital_audit_logs_action
  ON public.digital_audit_logs(action);

COMMENT ON TABLE public.digital_audit_logs IS '操作監査ログ。書き込みはservice_role経由のみ。';

-- -----------------------------------------------------------------------------
-- 4. digital_service_masters: クイック選択用サービスマスタ
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.digital_service_masters (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name   TEXT NOT NULL UNIQUE,
  category       TEXT NOT NULL CHECK (category IN (
                   'subscription', 'finance', 'sns',
                   'photo_storage', 'shopping', 'work', 'other'
                 )),
  official_url   TEXT,
  icon_key       TEXT,                          -- Lucide/独自アイコン識別子
  display_order  INTEGER NOT NULL DEFAULT 999,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digital_service_masters_category
  ON public.digital_service_masters(category, display_order);

COMMENT ON TABLE public.digital_service_masters IS 'クイック選択UI用のサービスマスタ。';

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================
ALTER TABLE public.digital_assets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_audit_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_service_masters   ENABLE ROW LEVEL SECURITY;

-- --- digital_assets ---
CREATE POLICY "digital_assets_select_own"
  ON public.digital_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "digital_assets_insert_own"
  ON public.digital_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "digital_assets_update_own"
  ON public.digital_assets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "digital_assets_delete_own"
  ON public.digital_assets FOR DELETE
  USING (auth.uid() = user_id);

-- --- digital_reminder_settings ---
CREATE POLICY "digital_reminder_settings_select_own"
  ON public.digital_reminder_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "digital_reminder_settings_insert_own"
  ON public.digital_reminder_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "digital_reminder_settings_update_own"
  ON public.digital_reminder_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "digital_reminder_settings_delete_own"
  ON public.digital_reminder_settings FOR DELETE
  USING (auth.uid() = user_id);

-- --- digital_audit_logs (読み取りのみユーザー可、書き込みはservice_role) ---
CREATE POLICY "digital_audit_logs_select_own"
  ON public.digital_audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- --- digital_service_masters (全ユーザー読み取り可) ---
CREATE POLICY "digital_service_masters_select_all"
  ON public.digital_service_masters FOR SELECT
  USING (is_active = TRUE);

-- =============================================================================
-- Triggers: updated_at 自動更新
-- =============================================================================
CREATE OR REPLACE FUNCTION public.digital_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_digital_assets_updated_at ON public.digital_assets;
CREATE TRIGGER trg_digital_assets_updated_at
  BEFORE UPDATE ON public.digital_assets
  FOR EACH ROW EXECUTE FUNCTION public.digital_set_updated_at();

DROP TRIGGER IF EXISTS trg_digital_reminder_settings_updated_at ON public.digital_reminder_settings;
CREATE TRIGGER trg_digital_reminder_settings_updated_at
  BEFORE UPDATE ON public.digital_reminder_settings
  FOR EACH ROW EXECUTE FUNCTION public.digital_set_updated_at();

-- =============================================================================
-- 初回ユーザー作成時に digital_reminder_settings を自動作成
--  既存プロジェクトに同名トリガーが存在する場合は名前を変更
-- =============================================================================
CREATE OR REPLACE FUNCTION public.digital_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.digital_reminder_settings (user_id, last_login_at)
  VALUES (NEW.id, NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_digital_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_digital_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.digital_handle_new_user();

-- =============================================================================
-- 監査ログの自動削除 (90日経過分)
--  Supabase Scheduled Functions から日次実行する想定
-- =============================================================================
CREATE OR REPLACE FUNCTION public.digital_purge_old_audit_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.digital_audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- =============================================================================
-- 権限設定
-- =============================================================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT                          ON public.digital_service_masters   TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.digital_assets             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE  ON public.digital_reminder_settings  TO authenticated;
GRANT SELECT                          ON public.digital_audit_logs         TO authenticated;

-- =============================================================================
-- 動作確認クエリ (実行後の検証用 - オプション)
-- =============================================================================
-- SELECT tablename FROM pg_tables WHERE tablename LIKE 'digital_%';
-- → 4件返ってくればOK: digital_assets / digital_reminder_settings /
--                      digital_audit_logs / digital_service_masters

-- =============================================================================
-- 完了
-- 次のステップ：
--   ・002_seed_digital_service_masters.sql を実行してマスタデータ投入
--   ・Supabase Auth で Google / Email Magic Link を有効化
-- =============================================================================
