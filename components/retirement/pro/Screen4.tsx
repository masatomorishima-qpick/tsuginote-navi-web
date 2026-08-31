/**
 * components/retirement/pro/Screen4.tsx
 *
 * 退職所得控除について（無料）。**数字はすべて `freeResult().g4` から**（§2の3）。
 *
 * 【図（§7-7）】
 *  ・図の中は**目盛りと凡例だけ**。文字は**12px以上**。
 *  ・**年齢は目盛りそのものなので、図の中に残します**（外に「も」置く、が §7-7 の意味）。
 *  ・**判断の文**（「空けたのは◯年 → 控除はほとんど戻りません」「◯年空けたとき」）は
 *    図の**外**に出しています。ここが §7-7 の本体です。
 *  ・SVGの見かけの大きさは `font-size × (表示幅 ÷ viewBoxの幅)` で決まり、**本文のpxとは無関係**。
 *    横390pxの端末（左右余白20px）で表示幅350px、viewBox幅343 → 約1.02倍。
 *    **12 と書けば約12.2pxで出ます。**入らないときは目盛りを間引くこと。小さくしない。
 *
 * §8-2 #8 `pro_screen4_view`。§2の7 根拠と出典は折りたたまない。
 */

'use client';

import { useEffect, useRef } from 'react';
import type { FreeResult } from '@/lib/retirement/pro/free';
import { trackOnce } from '@/lib/retirement/pro/track';
import { yen, bunAmounts } from '@/lib/retirement/pro/money';

const AKARI = '#0f5f4e';
const WARUI = '#8f2f2f';

function Row({ label, note, value, valueNote, strong }: {
  label: string; note?: string; value: string; valueNote?: string; strong?: boolean;
}) {
  return (
    <tr className="border-b border-slate-200 last:border-b-0">
      <td className="py-3 pr-3 align-top text-base leading-relaxed text-slate-900">
        {strong ? <b className="font-bold">{label}</b> : label}
        {note ? <span className="mt-0.5 block text-[13px] text-[#5b6470]">{note}</span> : null}
      </td>
      <td className="py-3 text-right align-top text-base tabular-nums text-slate-900">
        {strong ? <b className="font-bold">{value}</b> : value}
        {valueNote ? <span className="mt-0.5 block text-[13px] text-[#5b6470]">{valueNote}</span> : null}
      </td>
    </tr>
  );
}

/** 帯グラフ2本。**中は目盛り（年齢）と凡例（退職金・iDeCo等）だけ** */
function Bands({ a, b, modoru }: { a: number; b: number; modoru: number }) {
  return (
    <svg
      viewBox="0 0 343 148"
      width="100%"
      role="img"
      aria-label={`退職金を${a}歳、iDeCo等を${b}歳で受け取る場合と、${modoru}年空けた場合の比較`}
    >
      {/* --- 上の帯：この例（1年しか空けない） --- */}
      <line x1="22" y1="44" x2="331" y2="44" stroke="#e3e6ea" strokeWidth="2" />
      <line x1="22" y1="44" x2="52" y2="44" stroke={WARUI} strokeWidth="4" />
      <circle cx="22" cy="44" r="6" fill={AKARI} />
      <circle cx="52" cy="44" r="6" fill={WARUI} />
      <text x="22" y="32" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1a1d21">{a}歳</text>
      <text x="60" y="32" fontSize="12" fontWeight="700" fill="#1a1d21">{b}歳</text>
      <text x="22" y="64" textAnchor="middle" fontSize="12" fill="#5b6470">退職金</text>
      <text x="60" y="64" fontSize="12" fill="#5b6470">iDeCo等</text>

      {/* --- 下の帯：控除が満額に戻るまで空けた場合 --- */}
      <line x1="22" y1="118" x2="331" y2="118" stroke="#e3e6ea" strokeWidth="2" />
      <line x1="22" y1="118" x2="331" y2="118" stroke={AKARI} strokeWidth="4" />
      <circle cx="22" cy="118" r="6" fill={AKARI} />
      <circle cx="331" cy="118" r="6" fill={AKARI} />
      <text x="22" y="106" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1a1d21">{a}歳</text>
      <text x="331" y="106" textAnchor="end" fontSize="12" fontWeight="700" fill="#1a1d21">{a + modoru}歳</text>
      <text x="22" y="138" textAnchor="middle" fontSize="12" fill="#5b6470">退職金</text>
      <text x="331" y="138" textAnchor="end" fontSize="12" fill="#5b6470">iDeCo等</text>
    </svg>
  );
}

export default function Screen4({ r }: { r: FreeResult }) {
  const ref = useRef<HTMLDivElement>(null);
  const g = r.g4;
  const A = g.jotai === 'A';
  // §7-8 の規則3：同じ文に出てくる額をまとめて決める
  const card = bunAmounts(g.honsoku, g.kojoAdj);
  const osa = bunAmounts(g.taishokukin, g.taishokuKojo);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { trackOnce('screen4', 'pro_screen4_view'); io.disconnect(); }
    }, { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="mt-12 border-t border-slate-200 pt-8">
      <h2 className="text-[22px] font-bold text-slate-900">退職所得控除について</h2>
      <p className="mt-2 text-base leading-relaxed text-slate-800">
        受け取る順番と、<b className="font-bold">退職金を受け取った年から、iDeCo等を受け取る年までの年数</b>
        を意識しないと、退職所得控除が使えなくなります。この年数のことを、この画面では
        <b className="font-bold">「空ける年数」</b>と呼びます。
      </p>

      {/* §5-4：状態で色と文が変わる。「ほとんど戻りません」はやめ、**数で書く** */}
      <div className={A
        ? 'mt-4 rounded-xl border border-[#8f2f2f]/30 bg-[#fdf2f2] p-4'
        : 'mt-4 rounded-xl border border-[#0f5f4e]/30 bg-[#f0f7f4] p-4'}>
        <b className="text-base font-bold leading-relaxed text-slate-900">
          例：あなたが退職金を{g.taishokuAge}歳、iDeCo等を{g.idecoAge}歳で一時金で受け取る場合、
          {A
            ? <>あなたのiDeCo等の退職所得控除{card[0]}のうち、使えるのは{card[1]}です。</>
            : <>あなたのiDeCo等の退職所得控除{card[0]}は、そのまま使えます。</>}
        </b>
      </div>

      {/* §7-7：判断の文は図の**外**。図の中は目盛り（年齢）と凡例だけ。
          §5-4：状態Bでは図を出さない（比べる相手がありません） */}
      {A && g.modoruNen !== null ? (
        <>
          <p className="mt-4 text-base font-bold text-[#8f2f2f]">この例（{g.aketa}年しか空けない）</p>
          <div className="mt-1">
            <Bands a={g.taishokuAge} b={g.idecoAge} modoru={g.modoruNen} />
          </div>
          <p className="mt-1 text-base leading-relaxed text-slate-900">
            上の帯は<b className="font-bold text-[#8f2f2f]">空けたのは{g.aketa}年 → 使える控除は{card[1]}</b>、
            下の帯は<b className="font-bold" style={{ color: AKARI }}>{g.modoruNen}年空けたとき</b>（控除が満額に戻ります）です。
          </p>
        </>
      ) : null}

      <table className="mt-5 w-full border-collapse">
        <tbody>
          <Row label={`あなたのiDeCo等（加入${g.kanyuNensu}年）の控除`} value={yen(g.honsoku)} />
          <Row label="退職金と重なる期間" value={`${g.kasanariNen}年`} />
          <Row label="削られる控除" value={g.genkaku > 0 ? `−${g.genkaku.toLocaleString('en-US')}円` : '0円'} />
          <Row label="差し引き" value={yen(g.sashihiki)} />
          <Row label="あなたが使える控除" note="80万円を下回る場合は80万円になります" value={yen(g.kojoAdj)} strong />
          <Row label="課税される退職所得" value={yen(g.kazei)} />
          <Row label="あなたが引かれる税金" value={yen(g.zei)} />
        </tbody>
      </table>

      {g.osamaru ? (
        <p className="mt-3 text-base leading-relaxed text-slate-800">
          {/* §7-8 の規則3：この1文の2つの額をまとめて決める */}
          あなたの退職金{osa[0]}は、退職所得控除{osa[1]}に収まっています。
          <b className="font-bold">
            この場合、重なりを数える期間は勤続{g.kinzokuNensu}年ではなく{g.minashiNensu}年になります。
          </b>
          縮めるのは<b className="font-bold">就職の日から</b>なので、
          <b className="font-bold">{g.chijimeFrom}〜{g.chijimeTo}</b>が重なりを数える期間です。
          {A ? (
            <>
              あなたのiDeCo等の加入期間（{g.kanyuFrom}〜{g.kanyuTo}）と重なるのは、
              <b className="font-bold">
                {g.kasanariFrom}〜{g.kasanariTo}の{g.kasanariTsuki}か月＝{Math.floor(g.kasanariTsuki / 12)}年
              </b>です。
              {/* 「最後の1年」とは限らない（1,200人中311人で違う）。**月数で書く** */}
              <b className="font-bold">
                あなたのiDeCo等の加入期間{g.kanyuTsuki}か月のうち、縮めた期間からはみ出す{g.hamideruTsuki}か月は重なりません。
              </b>
            </>
          ) : (
            <b className="font-bold">
              あなたのiDeCo等の加入期間（{g.kanyuFrom}〜{g.kanyuTo}）とは重なりません。だから、削られる控除はありません。
            </b>
          )}
        </p>
      ) : null}

      {A && g.modoruNen !== null ? (
        <div className="mt-4 rounded-xl border border-[#c2841e] bg-[#fdf6e7] p-4">
          <b className="text-base font-bold leading-relaxed text-slate-900">
            あなたが{g.aketa}年空けても{g.modoruNen - 1}年空けても、効果はまったくありません。
          </b>
          <br />
          <span className="text-base leading-relaxed text-slate-900">
            この例で控除が戻るのは、<b className="font-bold">{g.modoruNen}年空けたとき</b>です。
          </span>
        </div>
      ) : null}

      <h3 className="mt-8 text-[18px] font-bold text-slate-900">受け取る順番で、空ける年数が変わります</h3>
      <table className="mt-3 w-full border-collapse">
        <tbody>
          {/* §5-4：**20年・10年を実装で直に書かない。**施行令70条1項の窓＋1年 */}
          <Row label={g.junban[0][0]} note={A ? '上記例' : undefined}
               value={`${g.junban[0][1]}年`} valueNote="改正前から変わっていません" strong />
          <Row label={g.junban[1][0]} note="退職所得控除の10年ルール"
               value={`${g.junban[1][1]}年`} valueNote="2026年1月1日改訂" strong />
        </tbody>
      </table>
      <p className="mt-3 text-base leading-relaxed text-slate-800">
        <b className="font-bold">
          2026年（令和8年）1月1日から、iDeCo等を先に受け取った場合は10年空けないと控除が戻らなくなりました（以前は5年でした）。
        </b>
        これが<b className="font-bold">退職所得控除の10年ルール</b>です。
      </p>

      <p className="mt-4 text-[13px] leading-relaxed text-[#5b6470]">
        ※上の表は、<b className="font-bold text-slate-900">
          勤続{g.kinzokuNensu}年ちょうど・iDeCo等の加入{g.kanyuNensu}年ちょうど・すでに受け取った退職手当等なし・今年（{r.genzaiNen}年）受け取る場合
        </b>で計算しています。ここが違うと、控除の額と重なる年数、そして税額が変わります。
      </p>

      {/* §2の7：根拠と出典は折りたたまない */}
      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-[13px] leading-relaxed text-[#5b6470]">
        <b className="block font-bold text-slate-900">この画面の根拠にした資料</b>
        <p className="mt-1">
          財務省 令和7年度税制改正の大綱「退職手当等…の支払を受ける年の前年以前９年内に老齢一時金の支払を受けている場合には…退職所得控除額の計算における勤続期間等の重複排除の特例の対象とする」「令和８年１月１日以後に老齢一時金の支払を受けている場合であって、同日以後に支払を受けるべき退職手当等について適用する」
        </p>
        <p className="mt-1">
          国税庁「源泉徴収のあらまし」Ⅳ2⑵イ「上記１の⑵に掲げる表又は次のハ以下により計算した退職所得控除額が80万円に満たない場合には、退職所得控除額は80万円とされます（所法30⑥二）」／同ニ「重複している部分の期間…を勤続年数とみなして、上記１の⑵に掲げる表により計算した金額」
        </p>
      </div>
    </section>
  );
}
