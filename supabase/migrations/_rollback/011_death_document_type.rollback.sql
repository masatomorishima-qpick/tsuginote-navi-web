-- =============================================================================
-- 011_death_document_type.rollback.sql
--
-- 011_death_document_type.sql で行った変更を元に戻す。
-- インデックス → CHECK 制約 → カラム の順で削除する。
--
-- 注意:
--   - このスクリプトを実行すると、document_type カラムに保存された
--     区別情報（死亡証明書 / 身分証）が完全に失われます。
--   - アプリケーション側のコードがすでに document_type を参照している場合は、
--     先にアプリケーションを旧バージョンへ戻してから実行してください。
-- =============================================================================

DROP INDEX IF EXISTS idx_death_documents_notice_type;

ALTER TABLE digital_death_documents
  DROP CONSTRAINT IF EXISTS digital_death_documents_document_type_check;

ALTER TABLE digital_death_documents
  DROP COLUMN IF EXISTS document_type;
