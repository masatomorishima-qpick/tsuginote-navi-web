-- 検証中の仮説（docs/hypotheses.md）の数字を出す。読むだけ（SELECT のみ）。
-- 期間は 10/30 0:00（日本時間）以降。版ごとに、訪問（visit_id）の数で数える。

-- 仮説1：給湯器の診断の結果を見た人のうち、紹介先を押した人の割合
select 'H1 給湯器 結果→紹介先' as kakusetsu,
       metadata->>'version' as version,
       count(distinct visit_id) filter (where event_name = 'kyutoki_diag_result')   as results,
       count(distinct visit_id) filter (where event_name = 'kyutoki_partner_click') as partner_clicks,
       round(100.0 * count(distinct visit_id) filter (where event_name = 'kyutoki_partner_click')
             / nullif(count(distinct visit_id) filter (where event_name = 'kyutoki_diag_result'), 0), 1) as rate_pct
from lp_event_logs
where lp_id = 'kyutoki-oyu-ga-denai' and created_at >= '2026-10-29 15:00:00+00'
group by 2
union all
-- 仮説3：評価制度のページに広告から来た人のうち、診断を始めた人の割合
select 'H3 評価制度 訪問→診断の開始',
       metadata->>'version',
       count(distinct visit_id) filter (where event_name = 'lp_view'),
       count(distinct visit_id) filter (where event_name = 'trend_check_start'),
       round(100.0 * count(distinct visit_id) filter (where event_name = 'trend_check_start')
             / nullif(count(distinct visit_id) filter (where event_name = 'lp_view'), 0), 1)
from lp_event_logs
where lp_id = 'trend-scs' and created_at >= '2026-10-29 15:00:00+00' and metadata ? 'gclid'
group by 2
order by 1, 2;
