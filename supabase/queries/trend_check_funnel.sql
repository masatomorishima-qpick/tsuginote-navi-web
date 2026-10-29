-- トレンド速攻ページ（/check/*）の集計。lp_id は 'trend-<波のid>'（例：trend-scs）。
-- Supabase の SQL Editor に貼って実行する（読み取りのみ）。
-- 改善の回（1週間ごと）の判断に使う：①流れ → ②設問の離脱 → ③広告の語・広告文 → ④結果の分布

-- ① 波ごと・週ごとの流れ（開始 → 結果 → 紹介先あり → 紹介先クリック）
select
  lp_id,
  date_trunc('week', created_at at time zone 'Asia/Tokyo')::date as week_jst,
  metadata->>'version' as version,
  count(distinct visit_id) filter (where event_name = 'trend_check_start')   as starts,
  count(distinct visit_id) filter (where event_name = 'trend_check_result')  as results,
  count(distinct visit_id) filter (where event_name = 'trend_check_result' and metadata->>'partner' <> 'none') as results_with_partner,
  count(distinct visit_id) filter (where event_name = 'trend_partner_click') as partner_clicks,
  round(100.0 * count(distinct visit_id) filter (where event_name = 'trend_partner_click')
        / nullif(count(distinct visit_id) filter (where event_name = 'trend_check_start'), 0), 1) as send_rate_pct
from lp_event_logs
where lp_id like 'trend-%'
group by 1, 2, 3
order by 1, 2 desc;

-- ② 設問ごとの到達数（どこで離脱しているか）
select lp_id, question_id, count(distinct visit_id) as visits
from lp_event_logs
where lp_id like 'trend-%' and event_name = 'trend_check_answer'
group by 1, 2
order by 1, 3 desc;

-- ③ 広告の語（utm_term）と広告文（utm_content）別の開始と送客
select
  lp_id,
  coalesce(metadata->>'utm_term', '(なし)') as utm_term,
  coalesce(metadata->>'utm_content', '(なし)') as utm_content,
  count(distinct visit_id) filter (where event_name = 'trend_check_start')   as starts,
  count(distinct visit_id) filter (where event_name = 'trend_partner_click') as partner_clicks
from lp_event_logs
where lp_id like 'trend-%'
group by 1, 2, 3
order by starts desc;

-- ④ 結果の分布（どんな人が来ているか。直接仕入れの商談材料）
select lp_id, metadata->>'level' as level, metadata->>'size' as company_size, metadata->>'demand' as demand, count(distinct visit_id) as visits
from lp_event_logs
where lp_id like 'trend-%' and event_name = 'trend_check_result'
group by 1, 2, 3, 4
order by visits desc;
