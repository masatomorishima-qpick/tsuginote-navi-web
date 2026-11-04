-- 給湯器の記事（検索）：記事ごとの閲覧・配布物の押下・B への押下・紹介先（報酬の出るリンク）の押下。SELECT だけ。日本時間で切る。
-- 使い方：Supabase の SQL の画面に貼って、日付（:from, :to）を書き換えて実行。
-- 自然流入＝広告の印（gclid・utm_source）がない閲覧。
with e as (
  select lp_id, event_name, visit_id, cta_id, created_at at time zone 'Asia/Tokyo' as jst,
         coalesce(metadata->>'gclid', metadata->>'utm_source', '') as ad
  from public.lp_event_logs
  where lp_id like 'kyutoki-%'
    and lp_id not in ('kyutoki-mitsumori', 'kyutoki-shuri')
    and created_at >= timestamptz '2026-11-04 00:00+09'   -- :from
    and created_at <  timestamptz '2099-01-01 00:00+09'   -- :to
)
select
  lp_id as 記事,
  count(distinct visit_id) filter (where event_name = 'lp_view' and ad = '')                               as 自然流入の閲覧,
  count(distinct visit_id) filter (where event_name = 'lp_view' and ad <> '')                              as 広告からの閲覧,
  count(distinct visit_id) filter (where event_name = 'lp_internal_click' and cta_id like '/downloads/kyutoki-%') as 配布物の押下,
  count(distinct visit_id) filter (where event_name = 'lp_internal_click'
                                     and (cta_id = '/kyutoki/mitsumori' or cta_id like '/kyutoki/mitsumori?%' or cta_id like '/kyutoki/mitsumori#%')) as B_への押下,
  count(distinct visit_id) filter (where event_name = 'kyutoki_partner_click')                              as 紹介先の押下,
  count(distinct visit_id) filter (where event_name = 'kyutoki_partner_click' and cta_id like 'gasq-%')      as 紹介先_GAS_Q,
  count(distinct visit_id) filter (where event_name = 'kyutoki_partner_click' and cta_id like 'oyu-%')       as 紹介先_お湯が出ない
from e
group by 1
order by 2 desc;
