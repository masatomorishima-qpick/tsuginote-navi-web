-- 017_retirement_pro_passes の取り消し。通常の構築では使わない。
-- ★★実行すると、発行済みの通行証がすべて消えます。
--   お支払いいただいた方が、計算結果を開けなくなります。実行する前に必ず行数を数えてください。
--     select count(*) from public.retirement_pro_passes;
drop index if exists public.retirement_pro_passes_email_idx;
drop table if exists public.retirement_pro_passes;
