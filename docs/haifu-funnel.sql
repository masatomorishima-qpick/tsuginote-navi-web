-- 相続・保険の配布物のページ（検索）：ページごとの閲覧・配布物の押下・紹介先の押下。SELECT だけ。日本時間で切る。
-- 対象：lp_id が guide-souzoku-*（相続のページ。11/10 から相続税の計算 guide-souzoku-zei-keisan も）と guide-hoken-*（保険の一覧表と、11/10 からの保険の記事）。2026-11-05 から計測。
-- 道具の利用：計算などの道具が使われた数（souzokuzei_calc など、lp_ と partner_click 以外の event_name）。
-- 紹介先の押下は event_name = 'partner_click'（cta_id は「紹介先-置き場所」）。
with e as (
  select lp_id, event_name, visit_id, cta_id,
         coalesce(metadata->>'gclid', metadata->>'utm_source', '') as ad,
         coalesce(metadata->>'ref', '') as ref
  from public.lp_event_logs
  where (lp_id like 'guide-souzoku-%' or lp_id like 'guide-hoken-%')
    and created_at >= timestamptz '2026-11-05 00:00+09'   -- :from
    and created_at <  timestamptz '2099-01-01 00:00+09'   -- :to
)
select
  lp_id as ページ,
  count(distinct visit_id) filter (where event_name = 'lp_view' and ad = '')                          as 自然流入の閲覧,
  count(distinct visit_id) filter (where event_name = 'lp_internal_click' and cta_id like '/downloads/%') as 配布物の押下,
  count(distinct visit_id) filter (where event_name not like 'lp\_%' and event_name <> 'partner_click') as 道具の利用,
  count(distinct visit_id) filter (where event_name = 'partner_click')                                 as 紹介先の押下,
  -- AI の答えから来た閲覧（2026-11-11 から ref を記録。#95 の取り込み後）
  count(distinct visit_id) filter (where event_name = 'lp_view' and ref ~ '(chatgpt\.com|openai\.com|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com|claude\.ai)') as AIから来た閲覧,
  string_agg(distinct split_part(cta_id, '-', 1), ',') filter (where event_name = 'partner_click')     as 押された紹介先
from e
group by 1
order by 2 desc;
