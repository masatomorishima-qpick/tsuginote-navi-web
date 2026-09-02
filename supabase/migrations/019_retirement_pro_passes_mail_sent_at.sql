-- =============================================================================
-- 019_retirement_pro_passes_mail_sent_at
--
-- retirement_pro_passes に「ご購入のメールを送れた時刻」の列を足す。
--
-- 背景（B-3・戦術Cowork senjutsu_20260902q.md 2番／同 s.md 4番ア）：
--   通行証は webhook の中で作り、そのままメールを送る。
--   ★もし insert のあとで何かが落ちると（Resend の通信が落ちる・想定外の落ち）、
--     Stripe は 5xx を受け取って送り直すが、2度目は stripe_checkout_session_id の
--     unique（23505）に当たり、★メールを送る道に入らないまま 200 で終わってしまう。
--   → ★★「お支払いいただいたのに、リンクが届かない」が、取り返せない形で残る。
--
--   ★この列があると、23505 の道でも「まだ送っていない（null）」を見て送り直せる。
--     ★Stripe の送り直しが、そのまま**メールの取り返し**になる。
--
-- ★null は「まだ送っていない」。時刻が入っていれば「送れた」。
-- ★毎週の突き合わせでは、mail_sent_at が null の行が 0 であることも数える。
-- ★C-4（メールを webhook の外に出す回）に移ったあとも、この列はそのまま要る。
-- =============================================================================

alter table public.retirement_pro_passes
  add column if not exists mail_sent_at timestamptz;

comment on column public.retirement_pro_passes.mail_sent_at is
  'ご購入のメールを送れた時刻。null は「まだ送っていない」。送り直しが取り返しになるための列';
