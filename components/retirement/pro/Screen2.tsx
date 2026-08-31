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
 *        緑カードに届かない。**注記（13px）ではなく本文（16px）。**
 *  §7-1  本文16px以上・注記13px以上。§7-5 金額は等幅数字。
 *  §7-4  **橙（#c2410c）は購入ボタンにしか使わない。**ここは緑のゴーストボタン。
 *  §2の6 購入ボタンを画面下に固定しない。§2の7 根拠と出典を折りたたまない。
 *  §2の10 利用者に見せる文に「画面◯」と書かない。
 *  §8-2  #6 `pro_result_scroll`／#12 `pro_buy_click`（entry='screen2'）。
 */

'use client';

import { useEffect, useRef } from 'react';
import type { FreeResult } from '@/lib/retirement/pro/free';
import { track } from '@/lib/retirement/pro/track';
import { observeScrollDepth } from '@/lib/retirement/pro/blocks';
import { yen, signedYen, bunAmounts } from '@/lib/retirement/pro/money';

/** 金額の行。右は等幅数字（§7-5） */
function Row({ label, note, value, strong, strongLabel }: {
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

export default function Screen2({ r, onBuy }: { r: FreeResult; onBuy: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    return observeScrollDepth('pro_result_scroll', rootRef.current);   // §8-2 #6
  }, []);

  // 「なぜ差が出るのか」の1文に出てくる3つの額（§7-8 の規則3）
  const naze = bunAmounts(r.kojo, r.uketori, r.hamidashi);

  return (
    <div ref={rootRef}>
      <h1 className="text-[26px] font-bold leading-tight text-slate-900 sm:text-[30px]">
        退職金とiDeCoの受け取り方シミュレーション 計算結果
      </h1>

      {/* 入力の整合の警告（勤め始めが早すぎる など）。あるときだけ出す */}
      {r.hantei.keikoku.length > 0 ? (
        <div className="mt-4 rounded-xl border border-[#c2841e] bg-[#fdf6e7] p-4">
          {r.hantei.keikoku.map((k) => (
            <p key={k} className="text-base leading-relaxed text-slate-900">{k}</p>
          ))}
        </div>
      ) : null}

      <h2 className="mt-7 text-[20px] font-bold text-slate-900">あなたの手取り計算</h2>
      {/*
        【E-20】基準は「あなたが選べる中で、いちばん早く両方を一時金で受け取る受け取り方」。
        iDeCo等は最短で請求できる年齢より前には受け取れません（確定拠出年金法33条1項）。
        ⑤がそれより若い方（407人中200人＝49%）に「同じ年にまとめて」は**選べません。**
        **2文目は本文（16px）で、注記にしないこと。**金額の前に伝わる必要があります（後出しにしない）。
      */}
      {r.bunkiKijun === 'onaji' ? (
        <p className="mt-2 text-base leading-relaxed text-slate-800">
          退職金とiDeCo等を<b className="font-bold">同じ年にまとめて一時金で</b>受け取った場合です。
        </p>
      ) : (
        <p className="mt-2 text-base leading-relaxed text-slate-800">
          あなたの退職金を{r.taishokuAge}歳、iDeCo等を{r.kijunAge}歳で、それぞれ一時金で受け取った場合です。
          <br />
          あなたのiDeCo等は{r.kijunAge}歳より前には受け取れないため、{r.taishokuAge}歳の年にまとめることはできません。
        </p>
      )}

      <table className="mt-3 w-full border-collapse">
        <tbody>
          <Row label="あなたが受け取る額" value={yen(r.uketori)} />
          <Row
            label="いったん引かれる税金"
            note="勤め先や運営管理機関が支払うときに引きます（源泉徴収）"
            value={`−${r.gensen.toLocaleString('en-US')}円`}
          />
          <Row label="iDeCo等の給付事務手数料" value={`−${r.tesuryo.toLocaleString('en-US')}円`} />
          <Row label="確定申告で戻る額" note="戻るのは翌年です" value={`＋${r.modoru.toLocaleString('en-US')}円`} />
          <Row label="あなたの手取り" value={yen(r.tedori)} strong />
        </tbody>
      </table>

      <p className="mt-3 text-[13px] leading-relaxed text-[#5b6470]">
        ※あなたが「退職所得の受給に関する申告書」を出す前提で計算しています（出さない場合は下の※をご覧ください）。
        <br />
        ※この計算に、<b className="font-bold text-slate-900">公的医療保険料・介護保険料は入っていません。</b>
        <b className="font-bold text-slate-900">受け取り方によっては、これらの負担が上がることがあります。</b>
        有料版で判定します。
      </p>

      {/* 緑カード。引き算は定義上合う（sa = saidai − tedori）。
          【E-20】差が0円の方（407人中48人＝12%）には「＋0円」を出さず、文のカードにします。
          **「ありません」ではなく「ありませんでした」。**この計算が置いている前提の中での話です。 */}
      <div className="mt-6 rounded-2xl border border-[#0f5f4e]/25 bg-[#f0f7f4] p-5 text-center">
        {r.bunkiSa === 'aru' ? (
          <>
            <p className="text-base font-bold text-slate-900">あなたが受け取り方を変えると、手取りは最大</p>
            <div className="mt-1 text-[34px] font-bold leading-tight tabular-nums text-[#0f5f4e]">
              {yen(r.saidai)}
            </div>
            <p className="mt-1 text-base leading-relaxed text-slate-900">
              上記の手取り{r.tedori.toLocaleString('en-US')}円より
              <b className="font-bold text-[#0f5f4e]">{signedYen(r.sa)}</b>
              <br />
              になります。
            </p>
          </>
        ) : (
          <>
            <p className="text-base font-bold text-slate-900">
              あなたの場合、受け取り方を変えても、手取りは変わりませんでした。
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

      {/*
        §5-3-2：前提の断りは**緑カードより後ろ**。ここより上の金額に「この画面の金額は」が届く。
        注記（13px）ではなく**本文（16px）**。画面が嘘にならないための文なので小さくしない。
      */}
      <div className="mt-5 rounded-xl bg-slate-50 p-4 sm:p-5">
        <p className="text-base leading-relaxed text-slate-900">
          <b className="font-bold">この画面の金額は、まだうかがっていないことを、次のように置いて計算しています。</b>
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-base leading-relaxed text-slate-900">
          <li>退職金以外の収入、公的年金 … <b className="font-bold">なし</b></li>
          <li>すでに受け取った退職手当等（前の勤め先の退職金・企業年金の一時金など） … <b className="font-bold">なし</b></li>
          <li>社会保険料・生命保険料・扶養などの所得控除 … <b className="font-bold">なし</b></li>
          <li>
            退職金を受け取るのは … <b className="font-bold">今年（{r.genzaiNen}年）</b>
            （税金の決まりは年ごとに変わります）
          </li>
        </ul>
        <p className="mt-2 text-base leading-relaxed text-slate-900">
          <b className="font-bold">あなたに当てはまるものがあると、実際の金額は変わります。多くなることも、少なくなることもあります。</b>
          有料版では、これらをうかがって計算します。
        </p>
      </div>

      <h2 className="mt-8 text-[20px] font-bold text-slate-900">なぜ差が出るのか</h2>

      {/*
        【E-20】基準が2つの年に分かれる方（407人中200人＝49%）では、枠も年ごとに分かれます。
        1年ぶんの表に押し込むと、その方に当てはまらない文になります。**年ごとに出します。**
        枠に収まる方（407人中41人＝10%）には「はみ出した額 0円」を出しません。
      */}
      {r.bunkiKijun === 'onaji' ? (
        <>
          <p className="mt-2 text-base leading-relaxed text-slate-800">
            {/* §7-8 の規則3：この1文の中の額を**まとめて**決める */}
            <b className="font-bold">退職所得控除は、税金がかからずに受け取れる「枠」です。</b>
            あなたの枠は勤続{r.kinzokuNensu}年で{naze[0]}。
            {r.bunkiHami === 'koeru' ? (
              <>
                同じ年にまとめて{naze[1]}を受け取ると
                <b className="font-bold">枠を{naze[2]}はみ出し、そのはみ出した分にだけ税金がかかります。</b>
              </>
            ) : (
              <>
                同じ年にまとめて{naze[1]}を受け取っても、枠に収まります。
                <b className="font-bold">この受け取り方では、あなたの退職所得に税金はかかりません。</b>
              </>
            )}
          </p>

          <table className="mt-3 w-full border-collapse">
            <tbody>
              <Row label="あなたが受け取る額" value={yen(r.uketori)} />
              <Row label={`あなたの退職所得控除（勤続${r.kinzokuNensu}年）`} value={`−${r.kojo.toLocaleString('en-US')}円`} />
              {r.bunkiHami === 'koeru' ? (
                <>
                  <Row label="はみ出した額" value={yen(r.hamidashi)} />
                  <Row label="その2分の1に税金がかかります" value={yen(r.kazei)} strong />
                </>
              ) : (
                <Row label="枠の残り" value={yen(Math.max(0, r.kojo - r.uketori))} strong />
              )}
            </tbody>
          </table>
        </>
      ) : (
        <>
          <p className="mt-2 text-base leading-relaxed text-slate-800">
            <b className="font-bold">退職所得控除は、税金がかからずに受け取れる「枠」です。</b>
            あなたのiDeCo等は{r.kijunAge}歳より前には受け取れないため、受け取る年が2つに分かれます。
            この枠は、年ごとに決まります。
          </p>

          {r.nenbetsu.map((n) => {
            // 【2026-08-19】ここに `bunAmounts(...n.hitomatome)` を呼んで、
            //   戻り値を使っていない行がありました。**消しました。**
            //   この段は**表**なので、§7-8「表とカードは円」でぜんぶ円です。
            //   規則3（同じ文で万円と円を混ぜない）は、**本文の文**にだけ効きます。
            //   `bunAmounts()` は値を返すだけで、呼んでも何も確かめません。
            //   **呼んだだけで守った気になっていました。**
            return (
              <div key={n.year} className="mt-4">
                <h3 className="text-[18px] font-bold text-slate-900">
                  {n.year}年（あなたの{n.gens.join('・')}を{n.age}歳で）
                </h3>
                <table className="mt-2 w-full border-collapse">
                  <tbody>
                    <Row label="あなたが受け取る額" value={yen(n.shunyu)} />
                    <Row label={`あなたの退職所得控除（${n.nensu}年）`} value={`−${n.kojoAdj.toLocaleString('en-US')}円`} />
                    {n.hamidashi > 0 ? (
                      <>
                        <Row label="はみ出した額" value={yen(n.hamidashi)} />
                        <Row label="その2分の1に税金がかかります" value={yen(n.kazei)} strong />
                      </>
                    ) : (
                      <Row label="枠の残り" value={yen(Math.max(0, n.kojoAdj - n.shunyu))} strong />
                    )}
                  </tbody>
                </table>
                {n.genkaku > 0 ? (
                  <p className="mt-2 text-base leading-relaxed text-slate-800">
                    この年の枠は、退職金と重なる{n.kasanariNen}年分（{n.genkaku.toLocaleString('en-US')}円）を差し引いた後の額です。
                  </p>
                ) : null}
              </div>
            );
          })}
          <p className="mt-3 text-base leading-relaxed text-slate-800">
            この「重なる分」の中身は、このあとの「退職所得控除について」でお伝えします。
          </p>
        </>
      )}

      <p className="mt-3 text-base leading-relaxed text-slate-800">
        <b className="font-bold">この枠は、受け取る年をずらしたり、一時金と年金に分けたりすると変化します。</b>
        だから<b className="font-bold">同じ金額を受け取っても、受け取り方で手取りが変わります。</b>
      </p>

      <h2 className="mt-8 text-[20px] font-bold text-slate-900">みんなは、どう受け取っているの？</h2>
      <p className="mt-2 text-base leading-relaxed text-slate-800">
        iDeCo等を受け取った方が、実際に選んだ受け取り方です。
      </p>
      <table className="mt-3 w-full border-collapse">
        <tbody>
          <Row label="一度にまとめて受け取った（一時金だけ）" value={<>87.1%<sup>※</sup></>} />
          <Row label="分けて受け取った（年金だけ）" value="10.4%" />
          {/* 基準HTMLでは太字は**ラベル側**。値ではない */}
          <Row label="まとめてと分けてを組み合わせた" value="2.5%" strongLabel />
        </tbody>
      </table>
      <p className="mt-3 text-base leading-relaxed text-slate-800">
        <b className="font-bold">ほとんどの方が、一度にまとめて受け取っています。</b>でも、
        <b className="font-bold">みんなと同じ受け取り方が、あなたにいちばん多く残る受け取り方とは限りません。</b>
      </p>

      {/* §2の7：出典は折りたたまない */}
      <p className="mt-3 text-[13px] leading-relaxed text-[#5b6470]">
        ※運営管理機関連絡協議会「確定拠出年金統計資料（2025年3月末）」（厚生労働省ホームページ掲載）の個人型年金（iDeCo）の実数から当社が算出しました。
      </p>
      {/* 上の「出さない場合は下の※をご覧ください」が指す先。**同じ画面に置くこと**（検査あり） */}
      <p className="mt-2 text-[13px] leading-relaxed text-[#5b6470]">
        ※<b className="font-bold text-slate-900">「退職所得の受給に関する申告書」を出さない場合</b>は、
        あなたの退職金の<b className="font-bold text-slate-900">収入金額の20.42%</b>がいったん源泉徴収されます
        （所得税法201条3項＋復興特別所得税）。
        <b className="font-bold text-slate-900">最終的な税額は変わりません。</b>
        確定申告で精算されます。変わるのは、いったん引かれる額と、戻ってくるまでの時間だけです。
      </p>

      <p className="mt-6 text-base leading-relaxed text-slate-800">
        {r.bunkiSa === 'aru'
          ? <>上記の手取り最大{signedYen(r.sa)}は、<b className="font-bold">退職金とiDeCo等だけを見た数字</b>です。</>
          : <>上記の手取り{r.tedori.toLocaleString('en-US')}円は、あなたの<b className="font-bold">退職金とiDeCo等だけを見た数字</b>です。</>}
        有料版では、あなたの<b className="font-bold">公的年金・保険料・医療費の負担まで見て</b>、最大
        <span className="tabular-nums">{r.toorisu.toLocaleString('en-US')}</span>通りの手取りシミュレーションを抽出します。
      </p>

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
