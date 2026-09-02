-- 018_retirement_pro_passes_email_nullable の取り消し
--
-- ★email が空（null）の行が1つでもあると、この SQL は落ちます。
--   ★先に、必ず数えてください：
--     select count(*) from public.retirement_pro_passes where email is null;
--   ★0 でなければ、戻す前にその行をどうするか（手で連絡して埋めるか、消すか）を決めてください。
--   ★通行証を勝手に消さないでください。お支払いいただいた方のものです。

alter table public.retirement_pro_passes
  alter column email set not null;
