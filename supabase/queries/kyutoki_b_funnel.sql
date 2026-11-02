-- 給湯器 B：ニーズの計測（/kyutoki/mitsumori b2、2026-11-03〜）。段ごとの数を、入口（言葉の組）ごとに。SELECT だけ。
-- 段：①着地 → ②開始 → 結果（対象＝form shown）→ ③ボタン押下（主の数字）→ ④メール入力（信頼の目安）
-- 判定：docs/kyutoki-b/measure.md（対象の結果30人、または広告費1.5万円の早い方）
with e as (
  select event_name, visit_id, metadata,
         coalesce(metadata->>'entry', 'mitsumori') as entry
  from public.lp_event_logs
  where lp_id = 'kyutoki-mitsumori'
    and created_at >= '2026-11-03'
    and coalesce(metadata->>'version', '') like 'b2%'
    and coalesce(metadata->>'gclid', metadata->>'utm_source', '') <> ''
)
select
  entry as 入口,
  count(distinct visit_id) filter (where event_name = 'lp_view')                 as 着地,
  count(distinct visit_id) filter (where event_name = 'kyutoki_m_start')         as 開始,
  count(distinct visit_id) filter (where event_name = 'kyutoki_m_result' and metadata->>'form' = 'shown') as 対象の結果,
  count(distinct visit_id) filter (where event_name = 'kyutoki_cta_click')       as ボタン押下,
  count(distinct visit_id) filter (where event_name = 'kyutoki_cta_click' and metadata->>'cta' = 'quotes') as 押下_2社の見積もり,
  count(distinct visit_id) filter (where event_name = 'kyutoki_cta_click' and metadata->>'cta' = 'check')  as 押下_妥当か確かめる,
  count(distinct visit_id) filter (where event_name = 'kyutoki_waitlist_submit') as メール入力
from e
group by entry
order by entry;

-- いちばん知りたいこと（4択）の内訳
-- select metadata->>'need' as need, count(distinct visit_id) from public.lp_event_logs
--  where lp_id = 'kyutoki-mitsumori' and event_name = 'kyutoki_need_select' and created_at >= '2026-11-03' group by 1;
