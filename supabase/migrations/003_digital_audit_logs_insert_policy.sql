-- =============================================================================
-- 003_digital_audit_logs_insert_policy.sql
--
-- 目的：digital_audit_logs に「本人が自分のログを書ける」 INSERT 権限を追加する
--
-- 背景：
--   001_digital_assets_migration.sql では digital_audit_logs を
--   「書き込みは service_role 経由のみ」設計にしていたが、Week3 で
--   実装した recordAuditLog() は通常の authenticated セッションで
--   INSERT を試みるため、すべてのログ挿入が RLS と GRANT で
--   弾かれていた（ターミナルに recordAuditLog failed {} と出るのみ）。
--
--   この移行で以下を追加する：
--     1. INSERT 権限を authenticated ロールに GRANT
--     2. 「本人のログのみ書ける」 INSERT ポリシーを RLS に追加
--
-- セキュリティ：
--   WITH CHECK (auth.uid() = user_id) により、他人のログを偽造する
--   ことはできない。SELECT は引き続き本人のみ。UPDATE/DELETE は
--   引き続き完全に不可（改ざん・削除の防止）。
--
-- 適用方法：
--   Supabase Dashboard → SQL Editor → このファイルの内容を貼り付けて Run
-- =============================================================================

-- 1. INSERT を authenticated ロールに付与
GRANT INSERT ON public.digital_audit_logs TO authenticated;

-- 2. 「本人のログのみ書ける」 INSERT ポリシー
--    すでに存在する場合は再作成（DROP IF EXISTS で冪等化）
DROP POLICY IF EXISTS "digital_audit_logs_insert_own"
  ON public.digital_audit_logs;

CREATE POLICY "digital_audit_logs_insert_own"
  ON public.digital_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. コメント更新（設計コメントを実態に合わせる）
COMMENT ON TABLE public.digital_audit_logs IS
  '操作監査ログ。本人のみ INSERT/SELECT 可能（UPDATE/DELETE 不可）。'
  '90日経過分は digital_purge_old_audit_logs() で日次自動削除される想定。';

-- =============================================================================
-- 動作確認クエリ（任意）
-- =============================================================================
-- 適用後、以下が pdf_export ログを返せばOK：
--   select action, metadata, created_at
--   from public.digital_audit_logs
--   where user_id = auth.uid() and action = 'pdf_export'
--   order by created_at desc
--   limit 5;
--
-- ポリシー一覧の確認：
--   select policyname, cmd from pg_policies
--   where tablename = 'digital_audit_logs';
--   → digital_audit_logs_select_own (SELECT)
--   → digital_audit_logs_insert_own (INSERT)  ← 今回追加
