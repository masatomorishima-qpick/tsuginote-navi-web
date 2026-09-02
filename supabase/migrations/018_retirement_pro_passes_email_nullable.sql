-- =============================================================================
-- 018_retirement_pro_passes_email_nullable
--
-- retirement_pro_passes.email を null 可にする。
--
-- 背景（B-2・戦術Cowork senjutsu_20260902h.md 2番／同 i.md 1番）：
--   通行証は Stripe の「払い終わった」知らせで作る。そのとき customer_details.email に
--   字が入っていることを、まだ実物で確かめられていない（確かめられるのは本物を1回買う通し）。
--   ★もし取れなかったとき、not null のままだと DB に書けず 500 を返し、Stripe が送り直しても
--     また 500 になる。★「お支払いいただいたのに通行証が無い」状態が、取り返せない形で残る。
--   ★そこで「メールアドレスが取れなくても通行証は作る（null で入れる）」に変える。
--     取れなかったことは記録に error で残し、Stripe の画面から手でご連絡する。
--
-- ★017 は「流したときの姿」のまま残す（README の「番号順に実行して再現する」を守るため）。
-- ★これ以降、email が空の行があり得る。手で通行証を消すときは
--   stripe_payment_intent_id で絞る道がある（運用手順書を参照）。
-- =============================================================================

alter table public.retirement_pro_passes
  alter column email drop not null;

comment on column public.retirement_pro_passes.email is
  'Stripe の決済画面でご入力いただいたもの（customer_details.email）。★null を許す＝取れなかったときも通行証は作り、あとで手で連絡する（018）';
