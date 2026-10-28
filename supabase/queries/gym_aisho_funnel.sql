-- パーソナルジム相性診断（/gym/aisho）の週次ファネルとアンケート集計
-- Supabase の SQL Editor に貼って実行する（読み取りのみ。テーブルは変更しない）。
-- 前提：lp_event_logs の記録時刻の列が created_at であること（Supabase の既定）。
--
-- 見る順番：①全体の流れ → ②どの設問で離脱したか → ③広告（utm_content）別 → ④タイプ分布 → ⑤アンケート

-- ① 週ごとの全体の流れ（開始 → 結果 → 紹介先あり → 紹介先クリック → アンケート完了）
select
  date_trunc('week', created_at at time zone 'Asia/Tokyo')::date as week_jst,
  count(distinct visit_id) filter (where event_name = 'gym_diag_start')   as starts,
  count(distinct visit_id) filter (where event_name = 'gym_diag_result')  as results,
  count(distinct visit_id) filter (where event_name = 'gym_diag_result' and metadata->>'partner' <> 'none') as results_with_partner,
  count(distinct visit_id) filter (where event_name = 'gym_partner_click') as partner_clicks,
  count(distinct visit_id) filter (where event_name = 'gym_survey_done')   as survey_done,
  round(100.0 * count(distinct visit_id) filter (where event_name = 'gym_diag_result')
        / nullif(count(distinct visit_id) filter (where event_name = 'gym_diag_start'), 0), 1) as start_to_result_pct,
  round(100.0 * count(distinct visit_id) filter (where event_name = 'gym_partner_click')
        / nullif(count(distinct visit_id) filter (where event_name = 'gym_diag_result' and metadata->>'partner' <> 'none'), 0), 1) as result_to_click_pct
from lp_event_logs
where lp_id = 'gym-aisho'
group by 1
order by 1 desc;

-- ② 設問ごとの到達数（どこで離脱しているか）
select
  question_id,
  count(distinct visit_id) as visits
from lp_event_logs
where lp_id = 'gym-aisho' and event_name = 'gym_diag_answer'
group by 1
order by array_position(array['goal','exp','style','food','gender','plan','area'], question_id);

-- ③ 広告別（ソーシャルメディア広告は utm_content にクリエイティブ名を入れる）
select
  coalesce(metadata->>'utm_source', '(直接)') as utm_source,
  coalesce(metadata->>'utm_content', '-') as utm_content,
  count(distinct visit_id) filter (where event_name = 'gym_diag_start')    as starts,
  count(distinct visit_id) filter (where event_name = 'gym_diag_result')   as results,
  count(distinct visit_id) filter (where event_name = 'gym_partner_click') as partner_clicks
from lp_event_logs
where lp_id = 'gym-aisho'
group by 1, 2
order by starts desc;

-- ④ 結果のタイプと回答の分布（どんな人が来ているか。紹介先選びと広告文の材料）
select
  metadata->>'type'   as trainer_type,
  metadata->>'goal'   as goal,
  metadata->>'gender' as trainer_gender,
  metadata->>'budget' as budget,
  count(distinct visit_id) as visits
from lp_event_logs
where lp_id = 'gym-aisho' and event_name = 'gym_diag_result'
group by 1, 2, 3, 4
order by visits desc;

-- ⑤ アンケート：設問ごとの回答割合（辞めた理由は複数回答なのでカンマで分けて数える）
select
  question_id,
  ans as answer_id,
  count(*) as answers,
  round(100.0 * count(*) / sum(count(*)) over (partition by question_id), 1) as pct
from lp_event_logs,
     lateral unnest(string_to_array(answer_id, ',')) as ans
where lp_id = 'gym-aisho' and event_name = 'gym_survey_answer'
group by 1, 2
order by 1, 3 desc;
