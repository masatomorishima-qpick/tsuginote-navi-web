-- =============================================================================
-- 005_digital_pin_secrets.sql
--
-- 目的：Phase1 PIN 機能（本人向け）のテーブル追加
--
-- 概要：
--   - digital_devices テーブル：ハードウェアデバイスの台帳
--   - digital_pin_secrets テーブル：デバイスに紐づく PIN の暗号文を保管
--   - digital_audit_logs の action CHECK を Phase1 分だけ拡張
--     （Phase2 以降の recovery_* / death_recovery_* テーブルは作らない）
--
-- 重要：
--   - PIN の平文は一切 DB に入らない設計。クライアント側で AES-GCM 暗号化して保存。
--   - algorithm_version は 'v1' 固定（P19 の指示通り、カラムだけ先行配置）
--   - devices と pin_secrets は 1:1（device_id UNIQUE）
--   - RLS は本人のみ SELECT/INSERT/UPDATE/DELETE 可能
--
-- 適用方法：
--   Supabase Dashboard → SQL Editor → このファイルを貼り付けて Run
--
-- 参考：DESIGN_Phase1_PIN.md §3 DB スキーマ
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. 監査ログの action CHECK 制約を Phase1 PIN 用に拡張
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
    -- Week4 既存
    'share_link_create',
    'share_link_revoke',
    'share_link_access',
    'share_link_pdf_export',
    -- Phase1 PIN で追加
    'device_create',        -- デバイス登録
    'device_update',        -- デバイス情報更新
    'device_delete',        -- デバイス削除
    'pin_register',         -- PIN 新規登録
    'pin_reveal',           -- PIN 表示（step-up 通過後）
    'pin_reveal_copy',      -- PIN をクリップボードにコピー
    'pin_update',           -- PIN 更新
    'pin_delete',           -- PIN 削除
    'stepup_start',         -- step-up 再認証開始（OTP 送信）
    'stepup_success',       -- step-up 再認証成功
    'stepup_fail'           -- step-up 再認証失敗
  ));

COMMENT ON COLUMN public.digital_audit_logs.action IS
  '操作種別。Phase1 までに以下を許容: login/logout/asset_*/pdf_export/data_export/'
  'reminder_settings_update/account_delete/share_link_*/'
  'device_*/pin_*/stepup_*';

-- -----------------------------------------------------------------------------
-- 2. digital_devices テーブル
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.digital_devices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name     TEXT NOT NULL CHECK (char_length(device_name) BETWEEN 1 AND 100),
  manufacturer    TEXT CHECK (char_length(manufacturer) <= 50),
  model           TEXT CHECK (char_length(model) <= 100),
  purchase_date   DATE,
  storage_place   TEXT CHECK (char_length(storage_place) <= 200),
  note            TEXT CHECK (char_length(note) <= 500),
  disposal_status TEXT NOT NULL DEFAULT 'in_use' CHECK (disposal_status IN (
                    'in_use',      -- 使用中
                    'disposed',    -- 廃棄済
                    'sold',        -- 売却
                    'transferred', -- 譲渡
                    'other'
                  )),
  -- 論理削除。NULL なら有効、日時が入っていれば削除済（PIN は CASCADE で物理削除）
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 本人の有効デバイス一覧取得用（deleted_at IS NULL が 99% のクエリ）
CREATE INDEX IF NOT EXISTS idx_digital_devices_user_active
  ON public.digital_devices(user_id)
  WHERE deleted_at IS NULL;

COMMENT ON TABLE public.digital_devices IS
  'ハードウェアデバイス台帳（iPhone/iPad/PC等）。PIN は digital_pin_secrets に別管理。'
  'disposal_status により機種変更／売却／廃棄の履歴を保持。';

-- -----------------------------------------------------------------------------
-- 3. digital_pin_secrets テーブル（PIN 暗号文専用）
-- -----------------------------------------------------------------------------
--
-- 格納するのは常に「クライアント側 AES-GCM 暗号化済みの ciphertext」のみ。
-- encrypted_pin / iv / salt はすべて base64 文字列として TEXT 保存する。
-- 生 PIN は絶対に入らない。
--
-- device_id UNIQUE により「1 デバイスにつき PIN は最大 1 件」。
-- 複数 PIN を持たせたい場合（SIM + Apple ID 等）はデバイスを分けて登録する。
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.digital_pin_secrets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id         UUID NOT NULL UNIQUE
                    REFERENCES public.digital_devices(id) ON DELETE CASCADE,
  -- RLS を効率的に効かせるため user_id を非正規化保持（digital_devices.user_id と一致必須）
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- AES-GCM 暗号文 + 認証タグの base64 連結（16-bit tag 込み）
  encrypted_pin     TEXT NOT NULL CHECK (char_length(encrypted_pin) BETWEEN 1 AND 10000),
  -- AES-GCM IV（12 bytes）を base64 化したもの
  iv                TEXT NOT NULL CHECK (char_length(iv) BETWEEN 1 AND 64),
  -- PBKDF2 salt（16 bytes）を base64 化したもの
  salt              TEXT NOT NULL CHECK (char_length(salt) BETWEEN 1 AND 64),
  -- 暗号方式のバージョン。'v1' = PBKDF2-SHA256 600k + AES-GCM-256
  algorithm_version TEXT NOT NULL DEFAULT 'v1'
                    CHECK (algorithm_version IN ('v1')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digital_pin_secrets_user_id
  ON public.digital_pin_secrets(user_id);

COMMENT ON TABLE public.digital_pin_secrets IS
  'クライアント側 AES-GCM で暗号化された PIN。平文は DB/サーバーに一切入らない。'
  'device_id に対して 1:1。algorithm_version は将来差し替え可能にするため先行配置。';
COMMENT ON COLUMN public.digital_pin_secrets.encrypted_pin IS
  'base64(AES-GCM ciphertext || auth_tag)。サーバー側で復号しない。';
COMMENT ON COLUMN public.digital_pin_secrets.algorithm_version IS
  '暗号方式識別子。現行は v1 = PBKDF2-SHA256 600,000 iters + AES-GCM-256。';

-- =============================================================================
-- Row Level Security
-- =============================================================================
ALTER TABLE public.digital_devices      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_pin_secrets  ENABLE ROW LEVEL SECURITY;

-- --- digital_devices ---
DROP POLICY IF EXISTS "digital_devices_select_own" ON public.digital_devices;
CREATE POLICY "digital_devices_select_own"
  ON public.digital_devices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "digital_devices_insert_own" ON public.digital_devices;
CREATE POLICY "digital_devices_insert_own"
  ON public.digital_devices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "digital_devices_update_own" ON public.digital_devices;
CREATE POLICY "digital_devices_update_own"
  ON public.digital_devices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "digital_devices_delete_own" ON public.digital_devices;
CREATE POLICY "digital_devices_delete_own"
  ON public.digital_devices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- --- digital_pin_secrets ---
DROP POLICY IF EXISTS "digital_pin_secrets_select_own" ON public.digital_pin_secrets;
CREATE POLICY "digital_pin_secrets_select_own"
  ON public.digital_pin_secrets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "digital_pin_secrets_insert_own" ON public.digital_pin_secrets;
CREATE POLICY "digital_pin_secrets_insert_own"
  ON public.digital_pin_secrets FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    -- device_id が本人所有かつ未削除であることをアプリ側でも検証する
    AND EXISTS (
      SELECT 1 FROM public.digital_devices d
      WHERE d.id = device_id
        AND d.user_id = auth.uid()
        AND d.deleted_at IS NULL
    )
  );

DROP POLICY IF EXISTS "digital_pin_secrets_update_own" ON public.digital_pin_secrets;
CREATE POLICY "digital_pin_secrets_update_own"
  ON public.digital_pin_secrets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "digital_pin_secrets_delete_own" ON public.digital_pin_secrets;
CREATE POLICY "digital_pin_secrets_delete_own"
  ON public.digital_pin_secrets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================================================
-- GRANT
-- =============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.digital_devices TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.digital_pin_secrets TO authenticated;

-- =============================================================================
-- Triggers: updated_at 自動更新（既存の digital_set_updated_at 関数を再利用）
-- =============================================================================
DROP TRIGGER IF EXISTS trg_digital_devices_updated_at
  ON public.digital_devices;
CREATE TRIGGER trg_digital_devices_updated_at
  BEFORE UPDATE ON public.digital_devices
  FOR EACH ROW EXECUTE FUNCTION public.digital_set_updated_at();

DROP TRIGGER IF EXISTS trg_digital_pin_secrets_updated_at
  ON public.digital_pin_secrets;
CREATE TRIGGER trg_digital_pin_secrets_updated_at
  BEFORE UPDATE ON public.digital_pin_secrets
  FOR EACH ROW EXECUTE FUNCTION public.digital_set_updated_at();

-- =============================================================================
-- 動作確認クエリ（任意・適用後に実行して確認）
-- =============================================================================
-- 1. ポリシーが 8 件（devices 4 + pin_secrets 4）返るか
--   select tablename, policyname, cmd from pg_policies
--   where tablename IN ('digital_devices', 'digital_pin_secrets')
--   order by tablename, cmd;
--
-- 2. action CHECK が Phase1 分を含んでいるか
--   select pg_get_constraintdef(oid)
--   from pg_constraint
--   where conname = 'digital_audit_logs_action_check';
--   → pin_register / pin_reveal / pin_update / pin_delete / stepup_* が並んでいればOK
--
-- 3. RLS が有効化されているか
--   select relname, relrowsecurity from pg_class
--   where relname IN ('digital_devices', 'digital_pin_secrets');
--   → 両方 relrowsecurity = t であること
--
-- 4. 他人のデータが見えないか（テスト）
--   別アカウントで insert したあと、本人のセッションで select して 0 件になるか

-- =============================================================================
-- 完了
-- =============================================================================
