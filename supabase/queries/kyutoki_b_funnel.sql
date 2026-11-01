-- 給湯器 B：見積もりの条件チェック（/kyutoki/mitsumori）の段ごとの数（日別・広告経由のみ）。SELECT だけ。
-- 段：着地 → 開始 → 各設問 → 結果 → 入力欄を出した → 同意 → 送信
-- 合格線（docs/kyutoki-b/page-design.md）：クリック→結果 25%／結果→入力 40%
with e as (
  select (created_at at time zone 'Asia/Tokyo')::date as d, event_name, visit_id, metadata
  from public.lp_event_logs
  where lp_id = 'kyutoki-mitsumori'
    and created_at >= now() - interval '30 days'
    and coalesce(metadata->>'gclid', metadata->>'utm_source', '') <> ''
)
select
  d,
  count(distinct visit_id) filter (where event_name = 'lp_view')            as 着地,
  count(distinct visit_id) filter (where event_name = 'kyutoki_m_start')    as 開始,
  count(distinct visit_id) filter (where event_name = 'kyutoki_m_answer' and metadata->>'n' = '3') as 地域まで,
  count(distinct visit_id) filter (where event_name = 'kyutoki_m_answer' and metadata->>'n' = '5') as 機能まで,
  count(distinct visit_id) filter (where event_name = 'kyutoki_m_stop')     as 対象外,
  count(distinct visit_id) filter (where event_name = 'kyutoki_m_result')   as 結果,
  count(distinct visit_id) filter (where event_name = 'kyutoki_m_result' and metadata->>'form' = 'shown') as 入力欄,
  count(distinct visit_id) filter (where event_name = 'kyutoki_lead_consent') as 同意,
  count(distinct visit_id) filter (where event_name = 'kyutoki_lead_submit')  as 送信
from e
group by d
order by d desc;

-- 受付の段（kyutoki_leads）：入力 → 受付メール → 要件がそろう → 業者へ打診 → 日程確定 → 面談完了
-- select status, count(*) from public.kyutoki_leads group by status;
