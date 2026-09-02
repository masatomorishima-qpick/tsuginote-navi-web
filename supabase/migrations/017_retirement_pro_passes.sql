-- =====================================================================
-- 017_retirement_pro_passes — 退職金とiDeCoの受け取り方シミュレーション（有料版）の通行証
--
-- 作成：2026-09-02（B-2・戦術Cowork senjutsu_20260902f.md 4番ア／同g.md 3番）
-- 対象：Supabase SQL Editor で masato が手動実行
--
-- ★このファイルから先（017〜）は、退職金とiDeCoの受け取り方シミュレーション（有料版）のもの。
--   デジタル資産機能（001〜016）とは別。README も参照。
--
-- 何のための表か
--   19,800円をお支払いいただいた方に、1年間の「通行証」を1枚だけ発行する。
--   通行証が生きている間、画面7〜13が開き、入力が残り、直せる（規約15-3・15-9）。
--
-- ★入るのは、払い終わった方だけ。無料版のままの方の入力は、この表に入らない
--   （プライバシーポリシー15-1「ご購入いただかなかった場合の、無料版でのご入力内容（無料版では保存しません）」）。
--
-- ★書くのは webhook（service role）だけ。利用者の認証が無いため、RLS はポリシーを1つも置かない。
-- =====================================================================

create table if not exists public.retirement_pro_passes (
  -- 主キー。DB が振る。★これは通行証の鍵ではない
  id                          uuid        primary key default gen_random_uuid(),

  -- ★鍵。通行証そのもの。crypto.randomBytes(32) を base64url にした43文字。推測できない
  pass_key                    text        not null unique,

  -- Stripe の Checkout Session（cs_…）。★二重に作らない仕組みは、この unique
  stripe_checkout_session_id  text        not null unique,

  -- Stripe の PaymentIntent（pi_…）。返金の手続きのときに要る
  stripe_payment_intent_id    text,

  -- Stripe の決済画面でご入力いただいたもの（customer_details.email）
  -- ★この事業が自分で持つ、はじめての個人情報
  -- ★null を許します。取れなかったときも通行証は作り、あとで手で連絡します（senjutsu_20260902h.md 2番）
  email                       text,

  -- ★Stripe の知らせ（event）の created から。サーバーの「いま」は使わない
  purchased_at                timestamptz not null,

  -- ★買った日時の1年後・JST で同じ月日・同じ時刻。作るときに決めて、あとで動かさない（規約15-3）
  expires_at                  timestamptz not null,

  -- 無料版の5項目（買った時点のもの。★単位は画面のまま＝万円・年・歳）
  -- { taishokukinMan, kinzokuNensu, idecoMan, kanyuNensu, taishokuAge }
  -- 有料版の入力は A-2 で足す
  inputs                      jsonb       not null,

  -- 最後に inputs を直した時刻。B-2 では purchased_at と同じ値
  updated_at                  timestamptz not null
);

-- 探すため。pass_key と stripe_checkout_session_id は unique 制約が索引を兼ねる
create index if not exists retirement_pro_passes_email_idx
  on public.retirement_pro_passes (email);

-- ★RLS を有効にし、ポリシーは1つも置かない
--   → anon・authenticated からは読めない・書けない。service role だけが読み書きする
alter table public.retirement_pro_passes enable row level security;

comment on table public.retirement_pro_passes is
  '退職金とiDeCoの受け取り方シミュレーション（有料版）の通行証。1購入=1行。webhook が service role で書く。RLS 有効・ポリシー無し';
comment on column public.retirement_pro_passes.pass_key is
  '通行証の鍵。43文字（base64url）。メールでお送りするリンクの中身';
comment on column public.retirement_pro_passes.expires_at is
  '購入から1年（JST で同じ月日・同じ時刻）。作るときに決めて動かさない';
