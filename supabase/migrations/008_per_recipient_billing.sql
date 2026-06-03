-- =============================================================================
-- 008_per_recipient_billing  (v2 修正版：作成順序を依存関係順に並べ替え)
--
-- 共有 ID 単位の従量課金 + 死後検証開示モデル のためのスキーマ追加・改修。
--
-- 含むテーブル（依存関係順）：
--   ① digital_user_profiles         … 表示名・呼称
--   ② digital_family_links          … 成立した家族リンク（多くの RLS から参照される）
--   ③ digital_recipient_keys        … 連携者の公開鍵ペア（family_links を参照）
--   ④ digital_user_kek_envelopes    … KEK の暗号文（本人用 + 連携者用）
--   ⑤ digital_family_invitations    … 招待管理
--   ⑥ digital_death_notices         … 死亡通知（family_links を参照）
--   ⑦ digital_death_documents       … 死亡書類アップロード（death_notices を参照）
--
-- ALTER 対象：
--   ⑧ digital_pin_secrets           … encrypted_dek / dek_iv / algorithm_version 'v2'
--   ⑨ digital_subscriptions         … quantity（連携者数）
--
-- 実行方法：Supabase Dashboard → SQL Editor → 全文をペースト → Run
-- 冪等性：すべての CREATE は IF NOT EXISTS、ALTER は DO ブロックで保護。
--          DROP POLICY IF EXISTS も使い、再実行しても壊れない。
--
-- v1 からの変更：digital_family_links を ② に移動。これにより
-- recipient_keys / death_notices からの参照が解決可能になる。
-- =============================================================================

-- citext 拡張（メール小文字統一用）
CREATE EXTENSION IF NOT EXISTS citext;

-- =============================================================================
-- ① digital_user_profiles
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.digital_user_profiles (
  user_id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name   text,                                          -- 「山田太郎」など、正式な呼称
  preferred_name text,                                          -- 「太郎」「とうちゃん」など、家族から呼ばれたい呼称
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.digital_user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profile_select_own ON public.digital_user_profiles;
CREATE POLICY profile_select_own ON public.digital_user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS profile_insert_own ON public.digital_user_profiles;
CREATE POLICY profile_insert_own ON public.digital_user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS profile_update_own ON public.digital_user_profiles;
CREATE POLICY profile_update_own ON public.digital_user_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.digital_user_profiles IS
  'ユーザーの表示名と呼称。招待メールやダッシュボード表示で使用する。';

-- =============================================================================
-- ② digital_family_links （他のテーブルの RLS から参照されるため、先に作成）
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.digital_family_links (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name         text,                                                       -- オーナーが付けた呼称
  status                 text NOT NULL CHECK (status IN ('active','revoked')) DEFAULT 'active',
  share_during_lifetime  boolean NOT NULL DEFAULT false,                              -- Q16：連携者ごとに ON/OFF
  created_at             timestamptz NOT NULL DEFAULT now(),
  revoked_at             timestamptz,

  CONSTRAINT uq_link_owner_recipient UNIQUE (owner_user_id, recipient_user_id)
);

CREATE INDEX IF NOT EXISTS idx_link_owner_active
  ON public.digital_family_links (owner_user_id, status);

CREATE INDEX IF NOT EXISTS idx_link_recipient_active
  ON public.digital_family_links (recipient_user_id, status);

ALTER TABLE public.digital_family_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS link_select_either ON public.digital_family_links;
CREATE POLICY link_select_either ON public.digital_family_links
  FOR SELECT USING (
    auth.uid() = owner_user_id OR auth.uid() = recipient_user_id
  );

DROP POLICY IF EXISTS link_insert_owner ON public.digital_family_links;
CREATE POLICY link_insert_owner ON public.digital_family_links
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS link_update_either ON public.digital_family_links;
CREATE POLICY link_update_either ON public.digital_family_links
  FOR UPDATE USING (
    auth.uid() = owner_user_id OR auth.uid() = recipient_user_id
  );

COMMENT ON TABLE public.digital_family_links IS
  '成立した家族リンク。share_during_lifetime が ON の連携者のみ、生前に閲覧可能。';

-- =============================================================================
-- ③ digital_recipient_keys
--    連携者の公開鍵ペア（秘密鍵は連携者自身のパスフレーズで暗号化済み）
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.digital_recipient_keys (
  user_id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  public_key             text NOT NULL,                              -- Base64（spki 形式）
  encrypted_private_key  text NOT NULL,                              -- パスフレーズで暗号化済み
  iv                     text NOT NULL,                              -- AES-GCM 用 IV（Base64）
  salt                   text NOT NULL,                              -- PBKDF2 用 salt（Base64）
  algorithm_version      text NOT NULL DEFAULT 'v1' CHECK (algorithm_version IN ('v1')),
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.digital_recipient_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rkey_select_own ON public.digital_recipient_keys;
CREATE POLICY rkey_select_own ON public.digital_recipient_keys
  FOR SELECT USING (auth.uid() = user_id);

-- オーナーが、自分と連携している人の公開鍵を取得できる必要がある
-- （新しい PIN を KEK で暗号化する際に連携者の公開鍵で KEK を再暗号化するため）
DROP POLICY IF EXISTS rkey_select_for_owners ON public.digital_recipient_keys;
CREATE POLICY rkey_select_for_owners ON public.digital_recipient_keys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.digital_family_links fl
      WHERE fl.owner_user_id = auth.uid()
        AND fl.recipient_user_id = digital_recipient_keys.user_id
        AND fl.status = 'active'
    )
  );

DROP POLICY IF EXISTS rkey_insert_own ON public.digital_recipient_keys;
CREATE POLICY rkey_insert_own ON public.digital_recipient_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS rkey_update_own ON public.digital_recipient_keys;
CREATE POLICY rkey_update_own ON public.digital_recipient_keys
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.digital_recipient_keys IS
  '連携者の公開鍵ペア（エンベロープ暗号化用）。秘密鍵は連携者のパスフレーズで暗号化済み。';

-- =============================================================================
-- ④ digital_user_kek_envelopes
--    KEK の暗号文（本人用パスフレーズ暗号化版 + 連携者用公開鍵暗号化版）
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.digital_user_kek_envelopes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind               text NOT NULL CHECK (kind IN ('owner','recipient')),
  recipient_user_id  uuid REFERENCES auth.users(id) ON DELETE CASCADE,  -- kind='recipient' 時のみ必須
  encrypted_kek      text NOT NULL,                                     -- Base64
  iv                 text,                                              -- owner kind のみ有り（AES-GCM 用）
  salt               text,                                              -- owner kind のみ有り（PBKDF2 用）
  algorithm_version  text NOT NULL DEFAULT 'v1' CHECK (algorithm_version IN ('v1')),
  created_at         timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_recipient_consistency CHECK (
    (kind = 'owner' AND recipient_user_id IS NULL) OR
    (kind = 'recipient' AND recipient_user_id IS NOT NULL)
  )
);

-- (owner_user_id, kind, recipient_user_id) でユニーク
CREATE UNIQUE INDEX IF NOT EXISTS uq_kek_owner
  ON public.digital_user_kek_envelopes (owner_user_id)
  WHERE kind = 'owner';

CREATE UNIQUE INDEX IF NOT EXISTS uq_kek_recipient
  ON public.digital_user_kek_envelopes (owner_user_id, recipient_user_id)
  WHERE kind = 'recipient';

CREATE INDEX IF NOT EXISTS idx_kek_recipient_lookup
  ON public.digital_user_kek_envelopes (recipient_user_id, owner_user_id)
  WHERE kind = 'recipient';

ALTER TABLE public.digital_user_kek_envelopes ENABLE ROW LEVEL SECURITY;

-- 本人は自分の全 KEK 暗号文を参照可能
DROP POLICY IF EXISTS kek_select_owner ON public.digital_user_kek_envelopes;
CREATE POLICY kek_select_owner ON public.digital_user_kek_envelopes
  FOR SELECT USING (auth.uid() = owner_user_id);

-- 連携者用 KEK の取得は、開示確定後にアプリ側で個別に開放する設計のため
-- 直接の SELECT は service_role 経由のみ（ポリシー追加なし）

DROP POLICY IF EXISTS kek_insert_owner ON public.digital_user_kek_envelopes;
CREATE POLICY kek_insert_owner ON public.digital_user_kek_envelopes
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS kek_delete_owner ON public.digital_user_kek_envelopes;
CREATE POLICY kek_delete_owner ON public.digital_user_kek_envelopes
  FOR DELETE USING (auth.uid() = owner_user_id);

COMMENT ON TABLE public.digital_user_kek_envelopes IS
  'KEK の暗号文。owner 用（パスフレーズ暗号化）と recipient 用（公開鍵暗号化）の両方を保持。';

-- =============================================================================
-- ⑤ digital_family_invitations
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.digital_family_invitations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email     citext NOT NULL,                              -- 招待先（小文字統一）
  recipient_name      text NOT NULL,                                -- 「妻」「長男」など
  token               text NOT NULL UNIQUE,                         -- 招待 URL トークン（48 文字以上）
  expires_at          timestamptz NOT NULL,                         -- 7 日後失効
  accepted_at         timestamptz,
  recipient_user_id   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  revoked_at          timestamptz,
  last_sent_at        timestamptz NOT NULL DEFAULT now(),           -- 招待メール最終送信日時（再送時に更新）
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invite_owner
  ON public.digital_family_invitations (owner_user_id, accepted_at, revoked_at);

CREATE INDEX IF NOT EXISTS idx_invite_token_active
  ON public.digital_family_invitations (token)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;

-- (owner, email) でユニーク。ただし accepted/revoked になった行は重複可能（再招待を許可するため）
CREATE UNIQUE INDEX IF NOT EXISTS uq_invite_owner_email_active
  ON public.digital_family_invitations (owner_user_id, recipient_email)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;

ALTER TABLE public.digital_family_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inv_select_owner ON public.digital_family_invitations;
CREATE POLICY inv_select_owner ON public.digital_family_invitations
  FOR SELECT USING (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS inv_insert_owner ON public.digital_family_invitations;
CREATE POLICY inv_insert_owner ON public.digital_family_invitations
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS inv_update_owner ON public.digital_family_invitations;
CREATE POLICY inv_update_owner ON public.digital_family_invitations
  FOR UPDATE USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

COMMENT ON TABLE public.digital_family_invitations IS
  '家族連携の招待。未承認は同時に 5 件まで（アプリ側で制御）。同じ招待先には再送可能。';

-- =============================================================================
-- ⑥ digital_death_notices
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.digital_death_notices (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notifier_user_id      uuid NOT NULL REFERENCES auth.users(id),       -- 通報者
  reported_death_date   date NOT NULL,
  notifier_relation     text,                                          -- 通報者の続柄
  notifier_note         text,                                          -- 経緯の自由記述
  status                text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','awaiting_objection_period','rejected','disclosed')),
  ops_verifier          text,                                          -- 運営確認者
  ops_verified_at       timestamptz,
  ops_rejected_reason   text,                                          -- 運営却下理由
  objection_token       text UNIQUE,                                   -- 異議申立用トークン
  objection_deadline    timestamptz,                                   -- ops_verified_at + 14 days
  objection_at          timestamptz,                                   -- 本人異議申立日時
  disclosed_at          timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_death_notices_owner
  ON public.digital_death_notices (owner_user_id, status);

CREATE INDEX IF NOT EXISTS idx_death_notices_pending_deadline
  ON public.digital_death_notices (status, objection_deadline);

CREATE INDEX IF NOT EXISTS idx_death_notices_notifier
  ON public.digital_death_notices (notifier_user_id, created_at DESC);  -- 通報履歴監視用

ALTER TABLE public.digital_death_notices ENABLE ROW LEVEL SECURITY;

-- 本人・通報者・全連携者が SELECT 可能（透明性確保）
DROP POLICY IF EXISTS notice_select_relevant ON public.digital_death_notices;
CREATE POLICY notice_select_relevant ON public.digital_death_notices
  FOR SELECT USING (
    auth.uid() = owner_user_id OR
    auth.uid() = notifier_user_id OR
    EXISTS (
      SELECT 1 FROM public.digital_family_links fl
      WHERE fl.owner_user_id = digital_death_notices.owner_user_id
        AND fl.recipient_user_id = auth.uid()
        AND fl.status = 'active'
    )
  );

-- INSERT は active な連携者だけ
DROP POLICY IF EXISTS notice_insert_recipient ON public.digital_death_notices;
CREATE POLICY notice_insert_recipient ON public.digital_death_notices
  FOR INSERT WITH CHECK (
    auth.uid() = notifier_user_id AND
    EXISTS (
      SELECT 1 FROM public.digital_family_links fl
      WHERE fl.owner_user_id = digital_death_notices.owner_user_id
        AND fl.recipient_user_id = auth.uid()
        AND fl.status = 'active'
    )
  );

-- UPDATE は service_role 経由のみ（運営承認・異議申立等）

COMMENT ON TABLE public.digital_death_notices IS
  '死亡通知。14 日異議申立期間 + 運営目視確認の二段審査を経て disclosed になる。';

-- =============================================================================
-- ⑦ digital_death_documents
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.digital_death_documents (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  death_notice_id     uuid NOT NULL REFERENCES public.digital_death_notices(id) ON DELETE CASCADE,
  storage_path        text NOT NULL,                                   -- 'death-documents/{notice_id}/...' 形式
  file_name           text NOT NULL,
  file_size           int NOT NULL,
  mime_type           text NOT NULL,
  uploaded_by         uuid NOT NULL REFERENCES auth.users(id),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_death_documents_notice
  ON public.digital_death_documents (death_notice_id);

ALTER TABLE public.digital_death_documents ENABLE ROW LEVEL SECURITY;

-- 書類本体は運営のみ閲覧可能（誤送信時の心配を減らす：アップローダーすら自分で見られない）
-- SELECT ポリシーを作らない＝ authenticated は 0 行に見える。service_role はバイパスする
DROP POLICY IF EXISTS doc_insert_uploader ON public.digital_death_documents;
CREATE POLICY doc_insert_uploader ON public.digital_death_documents
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

COMMENT ON TABLE public.digital_death_documents IS
  '死亡診断書等の書類アップロード。誰の死亡通知に対する書類か death_notice_id で紐付け。';

-- =============================================================================
-- ⑧ digital_pin_secrets の改修
--    encrypted_dek / dek_iv を追加。algorithm_version 'v2' を許可（KEK 経由）
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'digital_pin_secrets'
      AND column_name = 'encrypted_dek'
  ) THEN
    ALTER TABLE public.digital_pin_secrets
      ADD COLUMN encrypted_dek text,
      ADD COLUMN dek_iv text;
  END IF;
END $$;

-- algorithm_version の CHECK 制約を v1/v2 両方許可するよう更新
DO $$
DECLARE
  current_constraint text;
BEGIN
  SELECT pg_get_constraintdef(c.oid)
    INTO current_constraint
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'digital_pin_secrets'
      AND c.conname = 'digital_pin_secrets_algorithm_version_check';

  IF current_constraint IS NOT NULL AND current_constraint NOT LIKE '%v2%' THEN
    ALTER TABLE public.digital_pin_secrets
      DROP CONSTRAINT digital_pin_secrets_algorithm_version_check;
    ALTER TABLE public.digital_pin_secrets
      ADD CONSTRAINT digital_pin_secrets_algorithm_version_check
        CHECK (algorithm_version IN ('v1','v2'));
  END IF;
END $$;

COMMENT ON COLUMN public.digital_pin_secrets.encrypted_dek IS
  'v2 暗号化方式での DEK 暗号文（KEK で暗号化）。v1 では NULL。';
COMMENT ON COLUMN public.digital_pin_secrets.dek_iv IS
  'v2 暗号化方式での DEK 用 IV。v1 では NULL。';

-- =============================================================================
-- ⑨ digital_subscriptions の改修
--    quantity（連携者数）を追加。billing_cycle は monthly のみ運用予定
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'digital_subscriptions'
      AND column_name = 'quantity'
  ) THEN
    ALTER TABLE public.digital_subscriptions
      ADD COLUMN quantity int NOT NULL DEFAULT 0;
  END IF;
END $$;

COMMENT ON COLUMN public.digital_subscriptions.quantity IS
  '連携者数。Stripe subscription の quantity と同期する。0 ならサブスク無し（FREE）。';

-- =============================================================================
-- 確認用クエリ（コメントアウト中。実行後に手動で実行してください）
-- =============================================================================

-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN (
--     'digital_user_profiles',
--     'digital_family_links',
--     'digital_recipient_keys',
--     'digital_user_kek_envelopes',
--     'digital_family_invitations',
--     'digital_death_notices',
--     'digital_death_documents'
--   )
-- ORDER BY table_name;
--
-- 期待結果：7 行（すべて表示される）
