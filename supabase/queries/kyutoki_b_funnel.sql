-- 給湯器 B：ニーズの計測（/kyutoki/mitsumori）。版ごと・入口ごとの段の数。SELECT だけ。
-- b2（2026-11-03〜11-04）：2問 → 結果画面にボタン。b3（2026-11-04〜）：最初の画面に総額の一覧とボタン、押したあとにお住まい。
-- 段：着地 → 総額とボタンを見た（kyutoki_m_result の form＝shown。ニーズの分母）→ ボタン押下（主の数字）
--     → 賃貸で止まった（押下から外して読む）→ メール入力（信頼の目安）
-- 入口：b3 から lp_view にも entry が入る。b2 の着地は entry が無いので、広告の組の番号（utm_content）で分ける
--   （組の番号は Google 広告の管理画面で確かめる。B2_費用・相場＝204797185827）。
-- 判定：docs/kyutoki-b/measure.md
with e as (
  select event_name, visit_id, metadata,
         coalesce(metadata->>'version', '') as ver,
         coalesce(metadata->>'entry', 'mitsumori') as entry,
         coalesce(metadata->>'utm_content', '') as grp
  from public.lp_event_logs
  where lp_id = 'kyutoki-mitsumori'
    and created_at >= '2026-11-03'
    and coalesce(metadata->>'version', '') ~ '^b[23]'
    and coalesce(metadata->>'gclid', metadata->>'utm_source', '') <> ''
)
select
  left(ver, 2) as 版,
  grp as 広告の組,
  max(entry) filter (where entry <> 'mitsumori') as 入口,
  count(distinct visit_id) filter (where event_name = 'lp_view')                 as 着地,
  count(distinct visit_id) filter (where event_name = 'kyutoki_m_result' and metadata->>'form' = 'shown') as 総額とボタンを見た,
  count(distinct visit_id) filter (where event_name = 'kyutoki_cta_click')       as ボタン押下,
  count(distinct visit_id) filter (where event_name = 'kyutoki_cta_click' and metadata->>'cta' = 'quotes') as 押下_2社の見積もり,
  count(distinct visit_id) filter (where event_name = 'kyutoki_cta_click' and metadata->>'cta' = 'check')  as 押下_妥当か確かめる,
  count(distinct visit_id) filter (where event_name = 'kyutoki_m_stop' and metadata->>'reason' = 'rent') as 賃貸で止まった,
  count(distinct visit_id) filter (where event_name = 'kyutoki_waitlist_submit') as メール入力
from e
group by 1, 2
order by 1, 2;

-- いちばん知りたいこと（4択）の内訳
-- select metadata->>'need' as need, count(distinct visit_id) from public.lp_event_logs
--  where lp_id = 'kyutoki-mitsumori' and event_name = 'kyutoki_need_select' and created_at >= '2026-11-03' group by 1;

-- 訪問ごとの流れ（少ないうちは1人ずつ読む。日本時間）
-- select right(visit_id, 6) as 訪問, min(to_char(created_at at time zone 'Asia/Tokyo', 'MM-DD HH24:MI')) as 時刻,
--   max(metadata->>'utm_term') as 言葉, max(metadata->>'version') as 版,
--   string_agg(event_name || coalesce(':' || (metadata->>'cta'), '') || coalesce(':' || (metadata->>'answer'), ''), ' > ' order by created_at) as 流れ
-- from public.lp_event_logs where lp_id = 'kyutoki-mitsumori' and created_at >= '2026-11-04'
--   and event_name not in ('lp_section_view') group by visit_id order by 2;
