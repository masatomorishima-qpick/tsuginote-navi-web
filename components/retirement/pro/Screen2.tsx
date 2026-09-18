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

import { wakachi } from './Wakachi';
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

/** 単語の途中で改行しない（基準HTML `.ph .body .kz`・決め1343） */
const KZ = '[word-break:keep-all] [overflow-wrap:anywhere] [line-break:strict]';

/**
 * 「有料版が公的年金まで見る理由」の例の数（決め1343）。**あなたの数ではありません。固定の例です。**
 * 基準HTML（219,643 ／ 988e520d）の `span.kz-n` から1字1句。`kensa/kz_rei_ate.py` が engine で当てます。
 */
const KZ_REI_SA = '＋274,290円';
/** 同じ数の、断り（「※この◯円は、…」・決め1349）の中の字。固定の字です。`kensa/kz_rei_ate.py` が枠の数と engine の両方に当てます */
const KZ_REI_SA_DAN = '274,290円';

export default function Screen2({ r, onBuy }: { r: FreeResult; onBuy: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    return observeScrollDepth('pro_result_scroll', rootRef.current);   // §8-2 #6
  }, []);

  // 「なぜ差が出るのか」の1文に出てくる3つの額（§7-8 の規則3）
  const naze = bunAmounts(r.kojo, r.uketori, r.hamidashi);

  // 【2026-09-18・決め1348・1350】単語の途中で改行しないよう、字に <wbr> を自動で入れます（./Wakachi.tsx）。字は変えません。
  return wakachi(
    <div ref={rootRef}>
      <h1 className="text-[26px] font-bold leading-tight text-slate-900 sm:text-[30px]">
        老後のお金の受け取りシミュレーション 計算結果
      </h1>

      {/*
        ★★★2026-09-16・決め1269（★戦術Cowork `senjutsu_20260916.md` 1-3）
          ★★**前の回、こちらは3行をここに並べました。★3行は役目が違いました。**
          ★★★戦術Coworkが基準HTMLを直され、★**3行がそれぞれ別の所に移りました。**★同じ並びにしています ──

            (1) ここ（★見出しのすぐ下・注記）…… ★**入力の前提**。★計算の前に読むものです
            (2) 緑カードのすぐ下・**本文・太字** ……… ★**結果の読み方**。★金額をご覧になったあとに読んでいただきます
            (3) 「この画面の金額は…」の箱の中・いちばん下・**本文** …… ★**前提の断り**（★§5-3-2）

          ★★§5-3-2「**前提の断りは、緑カードより後ろ**に置く。★**注記（13px）ではなく本文（16px）**」。
          ★★★**こちらで字を1文字も変えていません。**★変えたいときは、消す前に戦術Coworkへ投げてください。
      */}
      <p className="mt-4 text-[13px] leading-relaxed text-[#5b6470]">
        あなたのiDeCo等の中身 …… iDeCo・企業型DC（小規模企業共済は含めていません）
      </p>

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

      {/* 【2026-09-18・決め1350（戦術Cowork `kaihatsu_ate_20260918j.md` C）】差が0円の方の緑カードの字を
            「手取りは変わりませんでした」から「手取りは増えませんでした」に替えました（基準HTML 226,887 ／ e9045851 の 704行）。
            差が0円の方も、受け取り方によっては手取りが少なくなるためです（決め1345〜1347）。数は今までどおり r.tedori と r.kazoeta。
          緑カード。引き算は定義上合う（sa = saidai − tedori）。
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
              あなたの場合、受け取り方を変えても、手取りは増えませんでした。
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
        ★★★2026-09-16・決め1269（★戦術Cowork `senjutsu_20260916.md` 1-3 の(2)）
          ★★**緑カードのすぐ下**です。★**結果の読み方**ですので、★金額をご覧になったあとに読んでいただきます。
          ★★基準HTMLは `<p class="hon"><b>…</b></p>`（★**本文・太字**）です。★注記にしません。
        【2026-09-18・決め1346（戦術Cowork `kaihatsu_ate_20260918f.md` 3-2・森嶋さんのお決め）】字を替えました。
          前 …… 「どの受け取り方でも手取りが同じ額になる方もいます。」
          いま … 「受け取り方を変えても手取りが増えない方もいます。」（基準HTML 222,774 ／ 9c153ae4 の 701行から1字1句）
          理由（戦術Cowork）…… 答え合わせファイル1,250人で、最大と最小が同じ額の方は0人でした（手数料が受け取り方で違うため）。
      */}
      <p className="mt-4 text-base font-bold leading-relaxed text-slate-900">
        受け取り方を変えても手取りが増えない方もいます。
      </p>

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
        {/*
          ★★★2026-09-16・決め1269（★戦術Cowork `senjutsu_20260916.md` 1-3 の(3)）
            ★★**この箱の中・いちばん下**です。★**前提の断り**ですので、★§5-3-2 のとおり**本文（16px）**にします。
            ★★基準HTMLは `<p class="hon"><b>無料版は、受け取る年だけを計算します。</b>退職した翌年以降の…</p>`
              ── ★★★**太字は1文目だけ**です。★2文目は太字ではありません。
        */}
        <p className="mt-2 text-base leading-relaxed text-slate-900">
          <b className="font-bold">無料版は、受け取る年だけを計算します。</b>
          退職した翌年以降の税と社会保険料は、有料版で計算します。
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

      {/*
        【2026-09-18・決め1343（戦術Cowork `kaihatsu_ate_20260918d.md` 3-2・森嶋さんの承認済み）】
          前の1行（「上記の手取り最大＋◯◯円は、退職金とiDeCo等だけを見た数字です。有料版では、…最大◯◯通りの手取りを比べます。」）を、
          このかたまりに置き替えました。基準HTML（219,643 ／ 988e520d）711〜735行 `div.kz-sec`。

          止め1 …… このかたまりの「＋274,290円」は、あなたの数ではありません。固定の例です。
            `r`（freeResult）の数につないではいけません。無料版は公的年金をうかがっていないため、ご本人では計算できない数です。
            この数は `kensa/kz_rei_ate.py` が engine を回して、基準HTMLとこの本の両方と一致することを確かめています。
            前の1行が読んでいた `r.sa`・`r.toorisu`・`r.bunkiSa` は、ここでは1つも読みません。
          断り（2026-09-18・決め1349）…… 「※この274,290円は、…増減は入っていません。」の数は `KZ_REI_SA_DAN`（固定の字）です。緑の枠の数とずれていないことは `kensa/kz_rei_ate.py` が数えます。
          止め2 …… 単語の途中で改行しない。`<wbr>` の位置は、字と同じく基準HTMLから1字1句写しています。
            `.kz` と同じ3つ（word-break:keep-all ／ overflow-wrap:anywhere ／ line-break:strict）を付けています。
          止め3 …… 絵に、量を表す形（棒・矢印の高さ）を足さない。絵は基準HTMLのSVGを1字1句写したものです。
          字の大きさは「2. 絶対に守ること」5番（本文16px以上・注記13px以上）に合わせています（基準HTMLの 12px・11.5px・13.5px・14px を上げました）。
      */}
      <div className="mt-[30px] mb-1.5 border-t border-slate-200 pt-[22px] text-center">
        <h2 className={`${KZ} mb-3 text-[22px] font-bold leading-[1.4] tracking-[-0.02em] text-slate-900`}>
          有料版が<br />公的年金まで<wbr />見る理由
        </h2>
        <p className={`${KZ} mb-2.5 text-[13px] leading-[1.75] text-[#5b6470]`}>
          例：<wbr />65歳・<wbr />退職金2,000万円<wbr />（勤続38年）・<wbr />iDeCo等500万円<wbr />（加入20年）・<wbr />公的年金 年220万円<wbr />（65歳から<wbr />受け取り）
        </p>
        <svg className="mt-1 mb-2 block h-auto w-full" viewBox="0 0 320 132" role="img" aria-label="公的年金の受け取り時期を、あとへずらす絵">
          <line x1="14" y1="104" x2="306" y2="104" stroke="#c7ccd3" strokeWidth="2" strokeLinecap="round"/>
          <g fill="#c7ccd3"><circle cx="30" cy="104" r="3.5"/><circle cx="82" cy="104" r="3.5"/><circle cx="134" cy="104" r="3.5"/><circle cx="186" cy="104" r="3.5"/><circle cx="238" cy="104" r="3.5"/><circle cx="290" cy="104" r="3.5"/></g>
          <rect x="14" y="70" width="140" height="26" rx="8" fill="#eaf0f8" stroke="#2c4a7c" strokeWidth="1.5"/>
          <text x="84" y="88" textAnchor="middle" fontSize="13" fontWeight="700" fill="#2c4a7c">iDeCo等</text>
          <rect x="14" y="20" width="96" height="30" rx="9" fill="none" stroke="#9aa3ad" strokeWidth="1.5" strokeDasharray="4 4"/>
          <text x="62" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill="#9aa3ad">公的年金</text>
          <rect x="196" y="20" width="110" height="30" rx="9" fill="#0f5f4e"/>
          <text x="251" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">公的年金</text>
          <path d="M114 35 C 140 6, 166 6, 188 30" fill="none" stroke="#0f5f4e" strokeWidth="2.4" strokeLinecap="round"/>
          <path d="M180 30 L 190 33 L 189 22" fill="none" stroke="#0f5f4e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          <text x="160" y="126" textAnchor="middle" fontSize="11" fill="#5b6470">受け取る時期</text>
        </svg>
        <div className="mb-1.5 rounded-[14px] border-[1.5px] border-[#0f5f4e] bg-[#e8f3f0] px-3 pt-3 pb-2.5">
          <p className={`${KZ} m-0 text-base font-bold leading-[1.7] text-slate-900`}>
            iDeCo等の<wbr />受け取り方と<wbr />一緒に、<wbr />公的年金の<wbr />受け取り時期も<wbr />ずらすと、<br />手取りが最大<span className="mx-0.5 inline-block text-[24px] leading-[1.35] tracking-[-0.02em] tabular-nums text-[#0f5f4e]">{KZ_REI_SA}</span><wbr />多くなります
          </p>
        </div>
        <p className={`${KZ} mb-[18px] text-[13px] leading-[1.7] text-[#5b6470]`}>
          ※この{KZ_REI_SA_DAN}は、<wbr />退職金と<wbr />iDeCo等の<wbr />手取りの差です。<wbr />公的年金を<wbr />遅らせたことによる、<wbr />公的年金<wbr />そのものの<wbr />増減は<wbr />入っていません。
        </p>
        <p className={`${KZ} m-0 text-base leading-[1.85] text-slate-900`}>
          有料版は<br />公的年金の<wbr />受け取り時期も<wbr />加味した<br />様々な<wbr />受け取り<wbr />パターンを<wbr />可視化して<br /><b className="font-bold">手取りの差を<wbr />明確にします。</b>
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
