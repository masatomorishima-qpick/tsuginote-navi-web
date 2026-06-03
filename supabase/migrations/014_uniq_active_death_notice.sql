-- 014_uniq_active_death_notice.sql
-- 課題 #26：同一 owner に pending / awaiting_objection_period の死亡通知が
-- 複数できてしまう race condition を、DB 側の部分 UNIQUE インデックスで封じる。
-- アプリ層の duplicate_pending チェックだけでは抜け穴があるため本番前に適用する。
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_death_notice_per_owner
ON public.digital_death_notices (owner_user_id)
WHERE status IN ('pending', 'awaiting_objection_period');
