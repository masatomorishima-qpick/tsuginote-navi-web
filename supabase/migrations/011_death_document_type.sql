-- =============================================================================
-- 011_death_document_type.sql
--
-- digital_death_documents に document_type カラムを追加。
-- 死亡証明書（death_certificate）と申請者の身分証（identity_certificate）を
-- 区別して保存できるようにする。
--
-- 影響:
--   - 既存行はすべて 'death_certificate' として扱う（DEFAULT 値）。
--   - CHECK 制約で許可された値以外は受け付けない。
--   - インデックスは「この通知の○○書類は提出済みか」の判定を高速化。
--
-- 冪等性: ADD COLUMN / DROP CONSTRAINT / ADD CONSTRAINT / CREATE INDEX いずれも
--         IF (NOT) EXISTS / DROP IF EXISTS を組み合わせており、複数回実行可能。
--
-- ロールバック: 011_death_document_type.rollback.sql
-- =============================================================================

-- カラム追加（既存行は DEFAULT で 'death_certificate' になる）
ALTER TABLE digital_death_documents
  ADD COLUMN IF NOT EXISTS document_type text NOT NULL DEFAULT 'death_certificate';

-- CHECK 制約（許可値を限定）
ALTER TABLE digital_death_documents
  DROP CONSTRAINT IF EXISTS digital_death_documents_document_type_check;
ALTER TABLE digital_death_documents
  ADD CONSTRAINT digital_death_documents_document_type_check
  CHECK (document_type IN ('death_certificate', 'identity_certificate'));

-- インデックス（特定 notice の特定種別書類の検索を高速化）
CREATE INDEX IF NOT EXISTS idx_death_documents_notice_type
  ON digital_death_documents (death_notice_id, document_type);

-- ドキュメント
COMMENT ON COLUMN digital_death_documents.document_type IS
  '書類種別。death_certificate=死亡を証明する書類（死亡診断書・住民票・戸籍謄本など）、identity_certificate=申請者の身分証（運転免許証・マイナンバーカードなど）。';
