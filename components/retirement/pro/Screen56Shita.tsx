/**
 * components/retirement/pro/Screen56Shita.tsx ── 画面5-6の下「くわしく知りたい方へ」（無料）
 *
 * 【なぜ在るか】（2026-09-19・決め1358・戦術Cowork `kaihatsu_ate_20260919o.md` B）
 *   画面2から購入ボタンまでが長いため、「買うかどうかを決めるのに要るもの」を購入ボタンより上に、
 *   「くわしく知りたい方のためのもの」を購入ボタンより下に置く並べ替えです。消した字0・畳んだ字0。
 *   基準HTML（227,574 ／ 04492583）865〜876行 `<b>画面5-6の下</b>`。
 *
 * 【中身】
 *   ・見出し「くわしく知りたい方へ」（この並べ替えで増えた唯一の字・10字）
 *   ・「みんなは、どう受け取っているの？」の見出し・1行・87.1%の表・1行・出典 …… Screen2.tsx から字を1字も変えずに移したもの
 *   この後ろに、ProApp.tsx が Screen3（退職金受け取りのポイント）・Screen4（退職所得控除について）を続けます（場所だけ動かし、畳んでいません）。
 *
 * 【計測】足していません。`pro_*` の名前も `data-block-start` も、この本には在りません（便o B-2 4）。
 * 【数】この本は `r` を読みません。87.1%・10.4%・2.5% は出典（運営管理機関連絡協議会の統計）の固定の数で、Screen2.tsx に在ったときと同じです。
 */

'use client';

import { wakachi } from './Wakachi';
import { Row } from './Screen2';

export default function Screen56Shita() {
  // 単語の途中で改行しないよう、字に <wbr> を自動で入れます（./Wakachi.tsx・便o B-2 3）。字は変えません。
  return wakachi(
    <section className="mt-12 border-t border-slate-200 pt-8">
      <h2 className="text-[22px] font-bold text-slate-900">くわしく知りたい方へ</h2>

      <h3 className="mt-6 text-[18px] font-bold text-slate-900">みんなは、どう受け取っているの？</h3>
      <p className="mt-2 text-base leading-relaxed text-slate-800">
        iDeCo等を受け取った方が、実際に選んだ受け取り方です。
      </p>
      <table className="mt-3 w-full border-collapse">
        <tbody>
          <Row label="一度にまとめて受け取った（一時金だけ）" value={<>87.1%<sup>※</sup></>} />
          <Row label="分けて受け取った（年金だけ）" value="10.4%" />
          {/* 【2026-09-25】基準HTML（233,168 ／ f58c3c6d）894行は、ラベルも値も `<b>` です（★前の覚え書き「太字はラベル側。値ではない」は基準HTMLと違っていました・`kensa/gamen56_awase.tsx` で見つけました） */}
          <Row label="まとめてと分けてを組み合わせた" value="2.5%" strong />
        </tbody>
      </table>
      <p className="mt-3 text-base leading-relaxed text-slate-800">
        {/* 【2026-09-19・決め1362 ②】「ほとんどの方が、一度にまとめて受け取っています。でも、」を外しました（基準HTML 228,480 ／ 9b8875bc 878行） */}
        <b className="font-bold">みんなと同じ受け取り方が、あなたにいちばん多く残る受け取り方とは限りません。</b>
      </p>

      {/* §2の7：出典は折りたたまない */}
      <p className="mt-3 text-[13px] leading-relaxed text-[#5b6470]">
        ※運営管理機関連絡協議会「確定拠出年金統計資料（2025年3月末）」（厚生労働省ホームページ掲載）の個人型年金（iDeCo）の実数から当社が算出しました。
      </p>
    </section>
  );
}
