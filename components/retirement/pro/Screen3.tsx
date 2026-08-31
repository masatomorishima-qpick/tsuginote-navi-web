/**
 * components/retirement/pro/Screen3.tsx
 *
 * 退職金受け取りのポイント（無料）。**数字はすべて `freeResult()` から**（§2の3）。
 *
 * 【守っていること】
 *  §5-1  「41,216通り」は**その方の実際の通り数**。固定値ではない。
 *  §5-3  **「手取り最小」「最大差」「税0の通り数」を出さない。**公的年金の額で大きく動くため
 *        （検査が「出ていないこと」を見ています）。
 *  §5-3-2 差が変わる要因に**受け取る年**も挙げる。「公的年金がいくらでも変わりません」と書かない。
 *  §7-1  本文16px以上。§7-5 金額は等幅数字。§2の10 「画面◯」と書かない。
 *  §8-2  #7 `pro_screen3_view`（画面内に入った）。
 */

'use client';

import { useEffect, useRef } from 'react';
import type { FreeResult } from '@/lib/retirement/pro/free';
import { trackOnce } from '@/lib/retirement/pro/track';

/** 年金で受け取れる期間の幅（5年〜20年・1年きざみ）。エンジンの列挙と同じ */
const NENKIN_KIKAN_MIN = 5;
const NENKIN_KIKAN_MAX = 20;

function Axis({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <b className="block text-base font-bold text-slate-900">{title}</b>
      <span className="mt-1 block text-base leading-relaxed text-slate-800">{body}</span>
    </div>
  );
}

export default function Screen3({ r }: { r: FreeResult }) {
  const ref = useRef<HTMLDivElement>(null);
  const toori = r.toorisu.toLocaleString('en-US');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) {
        trackOnce('screen3', 'pro_screen3_view');   // §8-2 #7
        io.disconnect();
      }
    }, { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="mt-12 border-t border-slate-200 pt-8">
      <h2 className="text-[22px] font-bold text-slate-900">退職金受け取りのポイント</h2>
      <p className="mt-2 text-base leading-relaxed text-slate-800">
        あなたが選べるのは「いつ」「どうやって」の組み合わせです。
      </p>

      <h3 className="mt-6 text-[18px] font-bold text-slate-900">自力で計算するのが難しい理由</h3>
      <div className="mt-3 space-y-3">
        <Axis
          title="いつ受け取るか"
          body={`あなたのiDeCo等は${r.saitanAge}歳から75歳まで、1歳きざみで受け取り始められます`}
        />
        <Axis
          title="一時金にするか、年金にするか"
          body={`年金にする場合、あなたは${NENKIN_KIKAN_MIN}年から${NENKIN_KIKAN_MAX}年まで1年きざみで期間を選べます`}
        />
        <Axis
          title="一部を一時金、残りを年金にする"
          body="取り扱っている金融機関であれば、あなたはこの組み合わせも選べます"
        />
        <Axis
          title="60歳以降も掛金を払い続ける"
          body="2026年12月から、あなたは70歳まで加入を続けられるようになります"
        />
        <Axis
          title="公的年金を受け取り始める年齢"
          body="あなたは60歳から75歳まで選べます。遅らせると年金が増え、その間にiDeCo等を受け取ると税が下がることがあります"
        />
      </div>

      <p className="mt-4 text-center text-base text-slate-800">この5つを組み合わせると</p>
      <div aria-hidden className="mx-auto mt-1 h-0 w-0 border-x-[13px] border-t-[16px] border-x-transparent border-t-[#0f5f4e]" />

      <div className="mt-3 rounded-2xl bg-slate-50 p-5 text-center">
        <p className="text-base text-slate-900">あなたが選べる受け取り方は、最大で</p>
        <div className="mt-1 text-[34px] font-bold leading-tight tabular-nums text-[#0f5f4e]">
          {toori}通り
        </div>
      </div>

      <h3 className="mt-8 text-[18px] font-bold text-slate-900">そのうえで、実行できない案は出しません</h3>
      <p className="mt-2 text-base leading-relaxed text-slate-800">
        「70歳で退職金を受け取る」という案が紹介されることがありますが、
        <b className="font-bold">退職金を受け取る年を選べる方は多くありません。</b>
        このツールは、あなたが⑤で入力した年齢で計算します。
        <b className="font-bold">あなたが実際に選べない案は出しません。</b>
      </p>

      <h3 className="mt-8 text-[18px] font-bold text-slate-900">退職金手取り簡易比較</h3>
      <table className="mt-3 w-full border-collapse">
        <tbody>
          <tr className="border-b border-slate-200">
            <td className="py-3 pr-3 text-base leading-relaxed text-slate-900">
              {/*
                【項目4・2026-08-17】「多くの方が選ぶ『同じ年にまとめて一時金』」から差し替え。
                出典（運営管理機関連絡協議会の統計）が言っているのは
                **「iDeCo等を一時金で受け取ったか、年金で受け取ったか」**（87.1%）で、
                **「退職金と同じ年に受け取ったか」は入っていません。**言葉を統計に合わせます。
                **「あなたの場合：」を落とさないこと。**落とすと
                「多くの方がその年齢を選んだ」と読める余地が残ります。
                **年齢は固定しない**（gamen2 の taishoku_age / kijun_age）。
              */}
              <b className="font-bold">
                {r.bunkiKijun === 'onaji'
                  ? <>多くの方が「一時金だけ」を選択（あなたの場合：退職金{r.taishokuAge}歳・iDeCo等{r.kijunAge}歳）</>
                  : <>あなたが選べる中で、いちばん早く一時金で受け取る（退職金{r.taishokuAge}歳・iDeCo等{r.kijunAge}歳）</>}
              </b>
            </td>
            <td className="py-3 text-right text-base tabular-nums text-slate-900">
              {r.tedori.toLocaleString('en-US')}円
            </td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="py-3 pr-3 text-base leading-relaxed text-slate-900">
              <b className="font-bold">あなたの手取りは、いちばん多くて</b>
            </td>
            <td className="py-3 text-right text-base tabular-nums text-slate-900">
              {r.saidai.toLocaleString('en-US')}円
            </td>
          </tr>
          <tr>
            <td className="py-3 pr-3 text-base leading-relaxed text-slate-900">
              <b className="font-bold">差</b>
            </td>
            <td className="py-3 text-right text-base tabular-nums text-slate-900">
              <b className="font-bold">{r.sa.toLocaleString('en-US')}円</b>
            </td>
          </tr>
        </tbody>
      </table>

      {/* §5-3-2：向きは書かない。受け取る年も要因に挙げる（E-16） */}
      <p className="mt-3 text-base leading-relaxed text-slate-800">
        <b className="font-bold">
          この差は、まだうかがっていない情報（退職金以外の収入・公的年金・すでに受け取った退職手当等・所得控除・退職金を受け取る年など）によって変わります。
        </b>
        受け取り方が最大{toori}通りあることは変わりません。公的年金・保険料・医療費まで入れて最大{toori}通りを比べるのは、有料版です。
      </p>
      <p className="mt-3 text-base leading-relaxed text-slate-800">
        <b className="font-bold">
          有料版では、その受け取り方で公的医療保険料・介護保険料・医療費の負担が上がらないかまで見ます。
        </b>
      </p>
    </section>
  );
}
