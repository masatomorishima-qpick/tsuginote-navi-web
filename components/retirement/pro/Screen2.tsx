/**
 * components/retirement/pro/Screen2.tsx
 *
 * 計算結果（無料）。**数字はすべて `freeResult()` から出します。**画面に書き写しません（§2の3）。
 *
 * 【守っていること】
 *  §5-1  表の最後が**確定申告後の手取り**。緑カードの「上記の手取り◯円より＋◯円」と
 *        **引き算が合う**こと。ここがずれると、最初の画面で信用を失う。
 *        （`sa = saidai − tedori` で作っているので、定義上ずれません）
 *  §5-3-2 **前提の断りは、緑カードより後ろ**に置く。前に置くと「この画面の金額は」が
 *        緑カードに届かない。★字の大きさは、2026-09-23・決め1424（森嶋さんのお決め「これらの注釈は
 *        フォントを小さくして」）で**注記**になりました（基準HTML `chu`）。実装は注記の下限 13px です（§7-1）。
 *  §7-1  本文16px以上・注記13px以上。§7-5 金額は等幅数字。
 *  §7-4  **橙（#c2410c）は購入ボタンにしか使わない。**ここは緑のゴーストボタン。
 *  §2の6 購入ボタンを画面下に固定しない。§2の7 根拠と出典を折りたたまない。
 *  §2の10 利用者に見せる文に「画面◯」と書かない。
 *  §8-2  #6 `pro_result_scroll`／#12 `pro_buy_click`（entry='screen2'）。
 */

'use client';

import { wakachi } from './Wakachi';
import { useEffect, useRef } from 'react';
import type { FreeResult } from '@/lib/retirement/pro/free';
import { track } from '@/lib/retirement/pro/track';
import { observeScrollDepth } from '@/lib/retirement/pro/blocks';
import { yen } from '@/lib/retirement/pro/money';

/** 金額の行。右は等幅数字（§7-5） */
export function Row({ label, note, value, strong, strongLabel }: {
  label: string; note?: string; value: React.ReactNode;
  /** ラベルも値も太字 */ strong?: boolean;
  /** ラベルだけ太字（基準HTMLの「まとめてと分けてを組み合わせた」がこの形） */ strongLabel?: boolean;
}) {
  return (
    <tr className="border-b border-slate-200 last:border-b-0">
      <td className="py-3 pr-3 align-top text-base leading-relaxed text-slate-900">
        {strong || strongLabel ? <b className="font-bold">{label}</b> : label}
        {note ? <span className="mt-0.5 block text-[13px] text-[#5b6470]">{note}</span> : null}
      </td>
      <td className="py-3 text-right align-top text-base tabular-nums text-slate-900">
        {strong ? <b className="font-bold">{value}</b> : value}
      </td>
    </tr>
  );
}

/** 帯の図の座標（基準HTML `svg.zu-haba` の viewBox 0 0 320 100 ・ 帯は x=16 から幅288） */
const OBI_X = 16;
const OBI_HABA = 288;
/** 座標を小数1けたの字にする（基準HTMLの `33.9` と同じ書き方） */
const za = (n: number) => String(Math.round(n * 10) / 10);

/**
 * 幅の帯（2026-09-24・決め1426・戦術Cowork `kaihatsu_ate_20260924b.md` 3節）。
 * 基準HTML（231,055 ／ 745aefae）の `svg.zu-haba` と、属性の並びまで同じ形です。
 * ★数と位置は、ぜんぶ `freeResult()` から来ます（左端 `saisho`・右端 `saidai`・▲ `ichi`・▲の下 `tedori`）。
 * ★▲から右端までの色の濃い所は、▲が右端（`ichi` が 1）の方には出しません（幅が0です）。
 * ★▲の下の字は、`ichiSoroe` が 'hidari' なら帯の左端から左そろえ、'migi' なら帯の右端から右そろえ（基準HTMLの覚え書き）。
 */
function Obi({ r }: { r: FreeResult }) {
  const x = OBI_X + OBI_HABA * r.ichi;
  const koi = r.ichi < 1;
  const aria = `受け取り方${r.kazoeta.toLocaleString('en-US')}通りの手取りの幅を表した帯です。`
    + `いちばん少ないのは${yen(r.saisho)}、いちばん多いのは${yen(r.saidai)}。`
    + `あなたのいまの受け取り方${yen(r.tedori)}は、左から${r.ichiHyoji}%の位置にあります。`;
  return (
    <svg data-zu="haba" className="mt-5 block h-auto w-full" viewBox="0 0 320 100" role="img" aria-label={aria}>
      <text x="16" y="17" fontSize="10" fill="#5b6470">いちばん少ない</text>
      <text x="304" y="17" textAnchor="end" fontSize="10" fill="#0f5f4e">いちばん多い</text>
      <text x="16" y="33" fontSize="11.5" fill="#5b6470">{yen(r.saisho)}</text>
      <text x="304" y="33" textAnchor="end" fontSize="11.5" fontWeight="700" fill="#0f5f4e">{yen(r.saidai)}</text>
      <rect x="16" y="42" width="288" height="18" rx="9" fill="#eef0f3" stroke="#c7ccd3"/>
      {koi ? (
        <rect x={za(x)} y="42" width={za(OBI_X + OBI_HABA - x)} height="18" rx="9" fill="#e8f3f0" stroke="#0f5f4e"/>
      ) : null}
      <line x1={za(x)} y1="40" x2={za(x)} y2="62" stroke="#1a1d21" strokeWidth="2"/>
      <path d={`M${za(x)} 66 L${za(x - 5.2)} 74 L${za(x + 5.2)} 74 Z`} fill="#1a1d21"/>
      {r.ichiSoroe === 'hidari' ? (
        <text x="16" y="90" fontSize="11.5" fill="#1a1d21">いまの受け取り方 <tspan fontWeight="700">{yen(r.tedori)}</tspan></text>
      ) : (
        <text x="304" y="90" textAnchor="end" fontSize="11.5" fill="#1a1d21">いまの受け取り方 <tspan fontWeight="700">{yen(r.tedori)}</tspan></text>
      )}
    </svg>
  );
}

/** 注記（基準HTML `p.chu` 11.5px → 実装は注記の下限 13px・§7-1） */
const CHU = 'text-[13px] leading-relaxed text-[#5b6470]';

export default function Screen2({ r, onBuy }: { r: FreeResult; onBuy: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    return observeScrollDepth('pro_result_scroll', rootRef.current);   // §8-2 #6
  }, []);

  // 【2026-09-18・決め1348・1350】単語の途中で改行しないよう、字に <wbr> を自動で入れます（./Wakachi.tsx）。字は変えません。
  // 【2026-09-24・決め1421〜1427（戦術Cowork `kaihatsu_ate_20260924b.md`）】基準HTML（231,055 ／ 745aefae）の画面2の並びに組み替えました。
  //   消した …… 「あなたの手取り計算」の見出し・「なぜ差が出るのか」の節・`kz-sec`（例の方の枠）・「あなたのiDeCo等の中身」の1行・
  //             緑カードの下の「受け取り方を変えても…」の単独の1行（差の箱の中へ）。
  //   足した …… 幅の帯・「いまの受け取り方」「いちばん多い受け取り方」の説明・「無料版の注意点」の1かたまり。
  //   動かした … 明細表 → `<details>`（くわしい内わけを見る）。
  return wakachi(
    <div ref={rootRef}>
      <h1 className="text-[26px] font-bold leading-tight text-slate-900 sm:text-[30px]">
        老後のお金の受け取りシミュレーション 計算結果
      </h1>

      {/* 入力の整合の警告（勤め始めが早すぎる など）。あるときだけ出す */}
      {r.hantei.keikoku.length > 0 ? (
        <div className="mt-4 rounded-xl border border-[#c2841e] bg-[#fdf6e7] p-4">
          {r.hantei.keikoku.map((k) => (
            <p key={k} className="text-base leading-relaxed text-slate-900">{k}</p>
          ))}
        </div>
      ) : null}

      <Obi r={r} />
      {/* 【2026-09-24・戦術Cowork `kaihatsu_ate_20260924c.md` 2-2】差が0円の方には色の濃いところが在りませんので、2文めを替えます */}
      <p className={`mt-2 ${CHU}`}>
        {r.bunkiSa === 'aru'
          ? `${r.kazoeta.toLocaleString('en-US')}通りの手取りの幅です。色の濃いところが、いまの受け取り方より多くなる受け取り方です。`
          : `${r.kazoeta.toLocaleString('en-US')}通りの手取りの幅です。あなたのいまの受け取り方が、いちばん多いところです。`}
      </p>
      {/*
        【E-20】基準は「あなたが選べる中で、いちばん早く両方を一時金で受け取る受け取り方」。
        ⑤がiDeCo等を請求できる最も早い年齢より若い方（407人中200人＝49%）には「同じ年にまとめて」は選べません。
        ★2つの年に分かれる方の字は、下の明細の前の1文（前からの字）と同じ中身です（★戦術Cowork `kaihatsu_ate_20260924c.md` 1節で決まりました）。
        ★同じ年の方の字の頭に「あなたの」を足しました（同 1節）。
      */}
      <p className={`mt-2 ${CHU}`}>
        <b className="font-bold">いまの受け取り方</b> … {r.bunkiKijun === 'onaji'
          ? 'あなたの退職金とiDeCo等を同じ年にまとめて一時金で受け取った場合'
          : `あなたの退職金を${r.taishokuAge}歳、iDeCo等を${r.kijunAge}歳で、それぞれ一時金で受け取った場合`}
        <br />
        <b className="font-bold">いちばん多い受け取り方</b> … {r.kazoeta.toLocaleString('en-US')}通りの中で、手取りがいちばん多くなる受け取り方
      </p>

      {/* 【決め1350】差が0円の方には、上の差の箱に替えて下の箱を出します（両方を同時に出さない）。
          【E-20】差が0円の方（407人中48人＝12%）には「0円」を出さず、文の箱にします。 */}
      <div className="mt-5 rounded-2xl border border-[#0f5f4e]/25 bg-[#f0f7f4] p-5 text-center">
        {r.bunkiSa === 'aru' ? (
          <>
            <p className="text-base text-slate-900"><b className="font-bold">いちばん多い受け取り方との差</b></p>
            <div className="mt-1 text-[34px] font-bold leading-tight tabular-nums text-[#0f5f4e]">
              {yen(r.sa)}
            </div>
            <p className="mt-1 text-base leading-relaxed text-slate-900">
              受け取り方を変えても手取りが増えない方もいます。
            </p>
          </>
        ) : (
          <>
            <p className="text-base text-slate-900">
              <b className="font-bold">あなたの場合、受け取り方を変えても、手取りは増えませんでした。</b>
            </p>
            <div className="mt-1 text-[34px] font-bold leading-tight tabular-nums text-[#0f5f4e]">
              {yen(r.tedori)}
            </div>
            <p className="mt-1 text-base leading-relaxed text-slate-900">
              {r.kazoeta.toLocaleString('en-US')}通りの中に、これより手取りが多くなる受け取り方はありませんでした。
            </p>
          </>
        )}
      </div>

      {/* 【2026-09-23・決め1423】明細表は折りたたんで残します。いまの受け取り方の手取りがどこから出た数かを示すのは、この表だけです。 */}
      <details className="mt-4 rounded-xl border border-slate-200 bg-white">
        <summary className="cursor-pointer p-4 text-base text-slate-900"><b className="font-bold">くわしい内わけを見る</b></summary>
        <div className="px-4 pb-4">
          {r.bunkiKijun === 'onaji' ? (
            <p className="text-base leading-relaxed text-slate-800">
              退職金とiDeCo等を<b className="font-bold">同じ年にまとめて一時金で</b>受け取った場合です。
            </p>
          ) : (
            <p className="text-base leading-relaxed text-slate-800">
              あなたの退職金を{r.taishokuAge}歳、iDeCo等を{r.kijunAge}歳で、それぞれ一時金で受け取った場合です。
              <br />
              あなたのiDeCo等は{r.kijunAge}歳より前には受け取れないため、{r.taishokuAge}歳の年にまとめることはできません。
            </p>
          )}
          <table className="mt-3 w-full border-collapse">
            <tbody>
              <Row label="あなたが受け取る額" value={yen(r.uketori)} />
              <Row
                label="受け取るときに引かれる税金"
                note="勤め先や、iDeCo等を扱う金融機関が、あなたに渡すときに引きます（源泉徴収）"
                value={`−${r.gensen.toLocaleString('en-US')}円`}
              />
              <Row label="iDeCo等の給付事務手数料" value={`−${r.tesuryo.toLocaleString('en-US')}円`} />
              <Row label="確定申告で戻る額" note="戻るのは翌年です" value={`＋${r.modoru.toLocaleString('en-US')}円`} />
              <Row label="あなたの手取り" value={yen(r.tedori)} strong />
            </tbody>
          </table>
        </div>
      </details>

      {/*
        【2026-09-23・決め1424（森嶋さんのお決め）】注釈を1かたまりにし、注記の大きさにしました。
        §5-3-2：前提の断りは**差の箱より後ろ**。ここより上の金額に「ここに出ている金額は」が届く。
      */}
      <div className="mt-5 rounded-xl bg-slate-50 p-4 sm:p-5">
        <p className={CHU}><b className="font-bold">無料版の注意点</b></p>
        <p className={`mt-2 ${CHU}`}>このページの「iDeCo等」は、iDeCo・企業型DCのことです。小規模企業共済は含めていません。</p>
        <p className={`mt-2 ${CHU}`}>ここに出ている金額は、うかがっていないことを次のとおりとして計算しています。</p>
        <ul className={`mt-1.5 list-disc space-y-1 pl-[18px] ${CHU}`}>
          <li>退職金以外の収入、公的年金 … なし</li>
          <li>すでに受け取った退職手当等（前の勤め先の退職金・企業年金の一時金など） … なし</li>
          <li>社会保険料・生命保険料・扶養などの所得控除 … なし</li>
          <li>退職金を受け取るのは … 今年（{r.genzaiNen}年）です。税金の決まりは年ごとに変わります</li>
        </ul>
        <p className={`mt-2 ${CHU}`}>
          あなたに当てはまるものがあると、実際の金額は多くなることも、少なくなることもあります。無料版は、受け取る年だけを計算します。上の4つと、退職した翌年以降の税や社会保険料は、有料版で計算します。
        </p>
        {/* 【2026-09-24・決め1427】差の箱の額についての断り。額は `r.sa`（⑳を動かさず・公的年金0円で出した差）。
            ★差が0円の方には差の箱を出しませんので、この1行も出しません（★戦術Cowork `kaihatsu_ate_20260924c.md` 2-1 で決まりました）。 */}
        {r.bunkiSa === 'aru' ? (
          <p className={`mt-2 ${CHU}`}>
            ※この{yen(r.sa)}は、あなたのiDeCo等の受け取り方だけを変えて出した、退職金とiDeCo等の手取りの差です。退職金を受け取る年齢は変えていません。公的年金は、上のとおり0円として計算しています。
          </p>
        ) : null}
        <p className={`mt-2 ${CHU}`}>
          ※あなたが「退職所得の受給に関する申告書」を出す前提で計算しています。出さない場合は、あなたが受け取る額の20.42%が先に引かれます（所得税法201条3項＋復興特別所得税）。確定申告をすると、多く引かれていた分は戻ります。最後に納める税の額は変わりません。変わるのは、先に引かれる額と、戻ってくるまでの時間だけです。
          <br />
          ※この計算に、<b className="font-bold text-slate-900">公的医療保険料・介護保険料は入っていません。</b>
          受け取り方によっては、これらの負担が上がることがあります。有料版で判定します。
        </p>
      </div>

      {/* §7-4：橙は購入ボタンだけ。ここは案内なので緑の枠線ボタン */}
      <button
        type="button"
        onClick={() => { track('pro_buy_click', { entry: 'screen2' }); onBuy(); }}
        className="mt-4 w-full rounded-xl border-2 border-[#0f5f4e] bg-white px-6 py-4 text-[18px]
                   font-bold text-[#0f5f4e] focus:outline-none focus:ring-2 focus:ring-[#0f5f4e] focus:ring-offset-2"
      >
        有料版について見る
      </button>
    </div>
  );
}
