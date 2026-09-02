-- 020_retirement_pro_passes_kekka_mail_error.sql
--
-- retirement_pro_passes に列を2つ足します（A-2a・senjutsu_20260902z.md 1番・ad.md 8番）。
--   kekka       jsonb  … 保存と計算の口（/retirement/pro/inputs）が置く計算結果（画面8・13の分）。
--                        ★null＝まだ計算していない（頁は画面7から始めます）。★R（全通り）は入れません
--   mail_error  text   … ご購入のメールの道の印。★null＝送る道に未到達。
--                        字は 'sending'／'email_null'／'network_error'／'send_failed'／'no_message_id'（webhook の注記）。
--                        ★メールアドレスは書きません
-- ★null 可・既定値なし。★RLS は有効・ポリシー0のまま（service role だけが読む）。
-- ★021 は C-2 の索引（expires_at）。この便では作りません。
-- 戻すときは _rollback/020_retirement_pro_passes_kekka_mail_error.rollback.sql

alter table public.retirement_pro_passes
  add column if not exists kekka jsonb,
  add column if not exists mail_error text;

comment on column public.retirement_pro_passes.kekka is
  '保存と計算の口が置く計算結果（画面8・13の分・v1）。null＝まだ計算していない。R（全通り）は入れない';
comment on column public.retirement_pro_passes.mail_error is
  'ご購入のメールの道の印。null＝送る道に未到達／sending／email_null／network_error／send_failed／no_message_id。メールアドレスは書かない';
