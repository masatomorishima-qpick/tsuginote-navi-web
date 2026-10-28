-- 給湯器「お湯が出ない」診断（/kyutoki/oyu-ga-denai）の週次ファネル
-- Supabase の SQL Editor に貼って実行する（読み取りのみ。テーブルは変更しない）。
-- 前提：lp_event_logs の記録時刻の列が created_at であること（Supabase の既定）。違う場合は列名だけ直す。
--
-- 見る順番：①全体の流れ → ②どこで止めたか → ③広告キーワード別 → ④診断の版別

-- ① 週ごとの全体の流れ（診断開始 → 結果 → 送客クリック）
select
  date_trunc('week', created_at at time zone 'Asia/Tokyo')::date as week_jst,
  count(distinct visit_id) filter (where event_name = 'kyutoki_diag_start')   as starts,
  count(distinct visit_id) filter (where event_name = 'kyutoki_diag_stop')    as stopped,
  count(distinct visit_id) filter (where event_name = 'kyutoki_diag_result')  as results,
  count(distinct visit_id) filter (where event_name = 'kyutoki_diag_result' and metadata->>'partner' <> 'none') as results_with_partner,
  count(distinct visit_id) filter (where event_name = 'kyutoki_partner_click') as partner_clicks,
  round(100.0 * count(distinct visit_id) filter (where event_name = 'kyutoki_partner_click')
        / nullif(count(distinct visit_id) filter (where event_name = 'kyutoki_diag_start'), 0), 1) as start_to_click_pct
from lp_event_logs
where lp_id = 'kyutoki-oyu-ga-denai'
group by 1
order by 1 desc;

-- ② 送客せずに止めた理由（凍結・断水・賃貸・ガス臭）。凍結が急に増えた週は入札を下げる目安。
select
  date_trunc('week', created_at at time zone 'Asia/Tokyo')::date as week_jst,
  metadata->>'reason' as reason,
  count(distinct visit_id) as visits
from lp_event_logs
where lp_id = 'kyutoki-oyu-ga-denai' and event_name = 'kyutoki_diag_stop'
group by 1, 2
order by 1 desc, 3 desc;

-- ③ 広告キーワード（utm_term）別：どの検索語が送客まで届いているか。
--    送客率が低いキーワードは除外や入札引き下げの候補。
select
  coalesce(metadata->>'utm_term', '(自然検索・直接)') as utm_term,
  count(distinct visit_id) filter (where event_name = 'kyutoki_diag_start')    as starts,
  count(distinct visit_id) filter (where event_name = 'kyutoki_diag_stop')     as stopped,
  count(distinct visit_id) filter (where event_name = 'kyutoki_partner_click') as partner_clicks
from lp_event_logs
where lp_id = 'kyutoki-oyu-ga-denai'
  and created_at >= now() - interval '28 days'
group by 1
order by starts desc
limit 50;

-- ④ 診断の版（version）別：文言や分岐を変えた前後の比較。
select
  metadata->>'version' as version,
  count(distinct visit_id) filter (where event_name = 'kyutoki_diag_start')    as starts,
  count(distinct visit_id) filter (where event_name = 'kyutoki_diag_result')   as results,
  count(distinct visit_id) filter (where event_name = 'kyutoki_partner_click') as partner_clicks,
  round(100.0 * count(distinct visit_id) filter (where event_name = 'kyutoki_partner_click')
        / nullif(count(distinct visit_id) filter (where event_name = 'kyutoki_diag_start'), 0), 1) as start_to_click_pct
from lp_event_logs
where lp_id = 'kyutoki-oyu-ga-denai'
group by 1
order by 1 desc;

-- ⑤ 診断を始めずに離れた人の割合は GA4 側で見る（ページ表示 → kyutoki_diag_start）。
