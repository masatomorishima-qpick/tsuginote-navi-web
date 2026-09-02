-- 020 を戻す：kekka と mail_error の列を落とします。
-- ★kekka を落とすと、その方は次に開いたとき画面7から始まります（inputs の raw28 は残るので、入力は残っています）。
-- ★mail_error を落とすと「送ったかもしれない（sending）」の印が消えます。★先に mail_sent_at が null の行数を数えてください。
alter table public.retirement_pro_passes
  drop column if exists kekka,
  drop column if exists mail_error;
