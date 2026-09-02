-- 019_retirement_pro_passes_mail_sent_at の取り消し
--
-- ★この列を落とすと、「どの方にメールを送れたか」が分からなくなります。
--   ★先に、必ず数えてください：
--     select count(*) as okutta   from public.retirement_pro_passes where mail_sent_at is not null;
--     select count(*) as mada     from public.retirement_pro_passes where mail_sent_at is null;
--   ★「まだ送っていない（mada）」が 0 でなければ、落とす前に、その方々にどう連絡するかを決めてください。
--   ★通行証そのものは消えません。消えるのは「送れた時刻」だけです。

alter table public.retirement_pro_passes
  drop column if exists mail_sent_at;
