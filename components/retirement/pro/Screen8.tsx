/**
 * components/retirement/pro/Screen8.tsx
 *
 * 有料版の結果画面。**購入直後にいちばん最初に出る画面です。**
 *
 * 【この画面は計算も分岐も持ちません】
 *   数字は `lib/retirement/pro/gamen8.ts`、文は `lib/retirement/pro/gamen8Bun.ts` が作ります。
 *   ここは**並べるだけ**です（§2の3）。
 *   **カードが1つ・2つ・3つで文が変わる出し分けも、`gamen8Bun()` の側にあります。**
 *
 * 【守っていること】
 *  §7-1   本文16px以上・注記13px以上。
 *  §7-5   金額は等幅数字（tabular-nums）。
 *  §7-8   表とカードは円。
 *  §2の10 利用者に見せる文に「画面◯」と書きません。
 *  §5-2   利用者が見るのは第2部の形です。
 *
 * 【E-23】`gamen8()` は、①結論の基準が見つからないときに**例外で止まります。**
 *   この画面は、その例外を**握りつぶしてはいけません。**
 *   「あなたにとってもいちばんでした」に落ちるのが E-23 そのものです。
 */

'use client';

import { wakachi, wakachiJi } from './Wakachi';
import { useEffect } from 'react';
import type { Bun8 } from '@/lib/retirement/pro/gamen8Bun';
import { track } from '@/lib/retirement/pro/track';

type Saki = 'ichiran' | 'hikaku' | 'keisan' | 'tetsuzuki' | 'konkyo';

type Props = {
  b: Bun8;
  /** カードの数（1／2／3）。**台帳の `pattern` に送ります。**画面では数えません */
  pattern: 1 | 2 | 3;
  /** 「詳細を見る」の行を押したとき。画面9〜13へ */
  onSusumu?: (saki: Saki) => void;
  /** 「結果をダウンロード（Excel）」 */
  onDownload?: () => void;
  /** ★ファイルを作っている間（A-2a）。ボタンを押せなくし、下に1行（字は親から・戦術の字） */
  downloadMatteiru?: boolean;
  downloadBun?: string;
};

/** `\n` を `<br>` にする。**文の中の改行は `gamen8Bun()` が決めています** */
function Gyo({ t }: { t: string }) {
  const xs = t.split('\n');
  // 【2026-09-19・決め1352】1行ずつ、単語の途中で改行しない印（<wbr>）を入れます（./Wakachi.tsx の wakachiJi）。字は変えません
  return (
    <>
      {xs.map((x, i) => (
        <span key={i}>
          {wakachiJi(x)}
          {i < xs.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  );
}

/**
 * 「詳細を見る」の行。**字と並びは基準HTMLのまま**（★消していません）。
 *
 * ★★★【2026-09-15・決め1236】**v1 では `dasu: true` の行だけを出します。**
 *   ★★理由 …… ★`PaidApp.tsx` が受けるのは `konkyo` **1つだけ**です。
 *     ★ほかの4行は、★★**押しても何も起きません**。
 *   ★★★**押しても何も起きない道を、画面に出さない**（★戦術Cowork 決め1236）。
 *     ★「あとで作ります」は、★利用者には見えません。
 *   ★★v1.1 で画面9〜12を繋ぐ日に、★**その行の `dasu` を `true` にしてください**
 *     （★字を書き直さずに済むように、★消さずに残しています）。
 *
 * ★★★**下の `MICHI_ZENBU` は、`kensa/gamen8_michi_mon.tsx` が読みます**
 *   （★出している行の先が、ぜんぶ `PaidApp.tsx` の `onSusumu` で受けられているか）。
 */
export const MICHI_ZENBU: { saki: Saki; na: string; sub: string; dasu: boolean }[] = [
  { saki: 'ichiran', na: 'あなたの受け取り方の一覧', sub: '並べ替えと絞り込みで探す', dasu: false },
  { saki: 'hikaku', na: '受け取り方の比較', sub: '図で見る、手取りと時期の差', dasu: false },
  { saki: 'keisan', na: 'あなたの税金の計算過程', sub: '1円まで追える全ステップ', dasu: false },
  { saki: 'tetsuzuki', na: 'あなたの手続き', sub: 'いつ何をすればよいか', dasu: false },
  { saki: 'konkyo', na: 'この計算の根拠', sub: '使った法令と、入れていないもの', dasu: true },
];
const MICHI = MICHI_ZENBU.filter((x) => x.dasu);

export default function Screen8({ b, pattern, onSusumu, onDownload, downloadMatteiru = false, downloadBun }: Props) {
  // §8-3。`pattern` は `gamen8()` の `kado_su` をそのまま渡してください（画面で数えない）
  useEffect(() => { track('pro_result8_view', { pattern }); }, [pattern]);

  // 【2026-09-19・決め1352】単語の途中で改行しないよう、字に <wbr> を自動で入れます（./Wakachi.tsx）。字は変えません。
  return wakachi(
    <div>
      <h1 className="text-[24px] font-bold leading-tight text-slate-900 sm:text-[28px]">
        {b.midashi[0]}
        <br />
        {b.midashi[1]}
      </h1>

      {/* ---- いちばん上の答え ---- */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
        <p className="text-base leading-relaxed text-slate-800">
          <Gyo t={b.atama.lbl} />
        </p>
        <p className="mt-2 text-[34px] font-bold tabular-nums leading-tight text-slate-900 sm:text-[40px]">
          {b.atama.ookii}
        </p>
        <p className="mt-2 text-base font-bold text-slate-900">{b.atama.sub}</p>
      </div>

      {/* ---- 方向の数 ---- */}
      <div className="mt-6 text-center">
        <p className="text-[19px] font-bold leading-relaxed text-slate-900">
          <Gyo t={b.judge.hon} />
        </p>
        {b.judge.hosoku ? (
          <p className="mt-2 text-base leading-relaxed text-slate-800">{b.judge.hosoku}</p>
        ) : null}
      </div>

      {/* ---- ④A すでに公的年金を受け取り始めている方だけ ----
             **空でなければ置くだけです。**出すかどうかは `gamen8()` の `koteki_sudeni` が決めています。
             ここに条件を書きません（§2の3）。
             ★置き場所は、答え（いちばん上）と方向の数の**後**、カードの**前**にしました。
               比べたものの前提ですので、比べた中身を読む前に置いています。
               戦術Coworkからは場所の指定がありませんでしたので、**こちらで決めました**（第75便で確かめていただきます） */}
      {b.sudeni ? (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-base leading-relaxed text-slate-800">
            <Gyo t={b.sudeni} />
          </p>
        </div>
      ) : null}

      {/* ---- カード（手取りの多い順）。**差は2枚目の後**（オーナー判断・2026-08-13）---- */}
      {b.cards.map((c, i) => (
        <div key={i}>
          <div className="mt-5 rounded-2xl border border-slate-300 bg-white p-4 sm:p-5">
            <p className="text-[15px] font-bold text-[#127a63]">{c.why}</p>
            <p className="mt-2 text-[17px] font-bold leading-relaxed text-slate-900">
              <Gyo t={c.how} />
            </p>
            <table className="mt-3 w-full text-base">
              <tbody>
                {c.hyo.map(([na, v, soe]) => (
                  <tr key={na} className="border-t border-slate-200">
                    <td className="py-2 text-slate-700">
                      {na}
                      {/* ★添え字（税金の字の型・senjutsu_20260905g.md 1番①）。Screen2 の Row の note と同じ形 */}
                      {soe ? <span className="mt-0.5 block text-[13px] text-[#5b6470]">{soe}</span> : null}
                    </td>
                    <td className="py-2 text-right font-bold tabular-nums text-slate-900">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {i === 1 && b.sa ? (
            <div className="mt-3 rounded-xl bg-slate-100 p-4 text-center">
              <p className="text-[15px] text-slate-700">増える税金の差</p>
              <p className="text-[22px] font-bold tabular-nums text-slate-900">{b.sa.zei}</p>
              <p className="mt-1 text-[15px] text-slate-700">
                手取りの差 {b.sa.tedori}（手数料の差を含みます）
              </p>
            </div>
          ) : null}
        </div>
      ))}

      {/* ---- なぜこれが答えになるのか（控除に収まる方だけ）---- */}
      {b.naze.hon ? (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-base font-bold text-slate-900">{b.naze.midashi}</p>
          <p className="mt-1.5 text-base leading-relaxed text-slate-800">
            <Gyo t={b.naze.hon} />
          </p>
        </div>
      ) : null}

      {/* ---- 境目の注意（カードごと）---- */}
      {b.sakaime.map((s, i) => (
        <div key={i} className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-base font-bold text-slate-900">{s.midashi}</p>
          <ul className="mt-1.5 list-disc pl-5 text-base leading-relaxed text-slate-800">
            {s.gyo.map((x, j) => <li key={j}>{x}</li>)}
          </ul>
          <p className="mt-1.5 text-base leading-relaxed text-slate-800">{s.ato}</p>
        </div>
      ))}

      {/* ---- 注意点 ---- */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-base font-bold text-slate-900">注意点</p>
        <div className="mt-1.5 text-base leading-relaxed text-slate-800">
          {b.chui.map((x, i) => <p key={i}>・{x}</p>)}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-base leading-relaxed text-slate-800">{b.shinkokusho}</p>
      </div>

      {/* ---- ファイルで受け取る ---- */}
      <h2 className="mt-8 text-[19px] font-bold text-slate-900">結果をファイルで受け取る</h2>
      <p className="mt-2 text-base leading-relaxed text-slate-800">
        この画面の結果と、計算に使った内容を1つのファイルにまとめてお渡しします。
        ご家族やご相談相手にお見せする場合も、これ1つで足ります。
      </p>
      <button
        type="button"
        onClick={() => { if (!downloadMatteiru) onDownload?.(); }}
        disabled={downloadMatteiru}
        className="mt-3 w-full rounded-xl border-2 border-[#127a63] bg-white px-4 py-3.5 text-[17px] font-bold text-[#127a63] disabled:cursor-not-allowed disabled:opacity-60"
      >
        結果をダウンロード（Excel）
      </button>
      {downloadMatteiru && downloadBun ? (
        <p className="mt-2 text-base leading-relaxed text-slate-800">{downloadBun}</p>
      ) : null}
      {/* ★★★【2026-09-15・決め1223】**ボタンのすぐ下**（★基準HTML 892行と同じ並び）。
          ★字は `gamen8Bun()` が持ちます（★ここに式も字も置きません・§2の3）。
          ★★**待っている間だけでなく、いつも出します** ── ★押す前に読めなければ意味がありません。 */}
      <div className="mt-2">
        {b.nokoranai.map((x, i) => (
          <p key={i} className="text-[13px] leading-relaxed text-[#5b6470]">{x}</p>
        ))}
      </div>
      <table className="mt-4 w-full text-base">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="py-2 font-bold text-slate-900">ファイルの中身</th>
            <th className="py-2 font-bold text-slate-900">入っているもの</th>
          </tr>
        </thead>
        <tbody>
          {b.fileNakami.map(([a, c]) => (
            <tr key={a} className="border-b border-slate-200 align-top">
              <td className="py-2 pr-3 text-slate-800">{a}</td>
              <td className="py-2 text-slate-800">{c}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[13px] leading-relaxed text-[#5b6470]">
        {/* ★★★決め1248（2026-09-15）。★前は「表計算ソフトをお持ちでない場合のために、同じ内容のPDFも一緒に
            お渡しします。」でした。★★決め1201で「PDFは作りません」と決まり、決め1216で基準HTMLの4か所も
            直っていましたが、★★★**この1行だけが古いまま残っていました**（★基準HTMLの「PDF」は0か所）。
            ★19,800円をお支払いになった方に、**作らないものをお渡しすると書いていました**。
            ★いまは基準HTML 891行から1字1句写しています。 */}
        Excel（.xlsx）です。表計算ソフトをお持ちでない方も、この画面は、お送りするメールのリンクから、ご購入から1年のあいだ何度でもお開きになれます。
      </p>

      {/* ---- 詳細を見る ---- */}
      <h2 className="mt-8 text-[19px] font-bold text-slate-900">詳細を見る</h2>
      <div className="mt-3">
        {MICHI.map(({ saki, na, sub }) => (
          <button
            key={saki}
            type="button"
            onClick={() => onSusumu?.(saki)}
            className="flex w-full items-center justify-between border-b border-slate-200 py-4 text-left"
          >
            <span>
              <span className="block text-[17px] font-bold text-slate-900">{na}</span>
              <span className="mt-0.5 block text-[13px] text-[#5b6470]">{sub}</span>
            </span>
            <span aria-hidden="true" className="text-[20px] text-slate-400">›</span>
          </button>
        ))}
      </div>

      <div className="h-16" aria-hidden="true" />
    </div>
  );
}
