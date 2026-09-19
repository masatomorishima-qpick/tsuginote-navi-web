/**
 * components/retirement/pro/Screen56.tsx — 有料版の説明と購入（無料の最後の画面）
 *
 * 【この画面のいちばん大事なこと】
 *  §8-5：**11ブロックあり、`photo` を除く10を測ります**（イベント#10 `pro_pricing_block_view`）。
 *  §8-4「ここを削ると、離脱の原因が永久に分からなくなります」。
 *  区切りは `data-block-start` の印から**次の印の直前まで**。印はHTML側に置きます。
 *
 * 【守っていること】
 *  §2の6  **購入ボタンを画面下に固定しない**（追従バーにしない）
 *  §2の7  根拠と出典を折りたたまない
 *  §2の12 金融機関・士業への紹介や送客をしない　§2の13 書類の作成・代筆をにおわせない
 *  §2の14 **保険料の「金額」を出さない**
 *  §6の12 **返金の方針は、本文と同じ大きさで、購入ボタンのすぐ上**（特商法15条の3ただし書）
 *  §3-3   **インボイスを発行できないことを、購入ボタンの手前に書く**
 *  §7-4   **橙（#c2410c）は購入ボタンにだけ**
 *
 * 【固定の例】AI比較の3つの金額は「勤続38年・退職金2,000万円・iDeCo等500万円・
 *  公的年金220万円の方の例」です（§5-3）。**その方の数字である必要がありません。**
 *  一方、緑カードの差額と通り数は**その方の数字**なので `freeResult()` から出します。
 */

'use client';

import { wakachi } from './Wakachi';
import { useEffect, useRef } from 'react';
import type { FreeResult } from '@/lib/retirement/pro/free';
import { track, trackOnce } from '@/lib/retirement/pro/track';
import { observePricingBlocks, observeScrollDepth } from '@/lib/retirement/pro/blocks';

const KAKAKU = 19_800;

function H3({ block, children }: { block: string; children: React.ReactNode }) {
  return (
    <h3 data-block-start={block} className="mt-8 text-[18px] font-bold text-slate-900">
      {children}
    </h3>
  );
}

/** 単語の途中で改行しない（基準HTML `.kz`・決め1343・1344） */
const KZ = '[word-break:keep-all] [overflow-wrap:anywhere] [line-break:strict]';

function Card({ title, body, kz }: {
  title: React.ReactNode;
  /** 無いカードもあります（「手数料・紹介料」のカードは見出しだけ・決め1343） */
  body?: React.ReactNode;
  /** 見出しと本文を、単語の途中で切らない組み方にする（基準HTMLの `div.vtxt kz`・決め1344） */
  kz?: boolean;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 p-4${kz ? ` ${KZ}` : ''}`}>
      <b className="block text-base font-bold leading-relaxed text-slate-900">{title}</b>
      {body !== undefined ? <span className="mt-1 block text-base leading-relaxed text-slate-800">{body}</span> : null}
    </div>
  );
}

export default function Screen56({ r, onBuy }: { r: FreeResult; onBuy: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stops = [observePricingBlocks(el), observeScrollDepth('pro_pricing_scroll', el)];
    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver((es) => {
        for (const e of es) if (e.isIntersecting) { trackOnce('pricing', 'pro_pricing_view'); io.disconnect(); }
      }, { threshold: 0 });
      io.observe(el);
      stops.push(() => io.disconnect());
    }
    return () => { for (const s of stops) s(); };
  }, []);

  // 【2026-09-18・決め1348・1350】単語の途中で改行しないよう、字に <wbr> を自動で入れます（./Wakachi.tsx）。字は変えません。
  return wakachi(
    <section id="pro-pricing" ref={ref} className="mt-12 border-t border-slate-200 pt-8">
      <h2 className="text-[22px] font-bold text-slate-900">
          [有料版]老後のお金の受け取りシミュレーションについて
      </h2>

      {/* 1. 写真（測りません。先頭なので必ず見えます） */}
      <div
        data-block-start="photo"
        className="mt-4 flex h-40 items-center justify-center rounded-2xl bg-slate-100 text-center text-[13px] leading-relaxed text-[#5b6470]"
      >
        ここに写真を入れます
        <br />
        （安心感・上質な時間を連想させるもの）
      </div>

      {/* 2. 4つの見方 */}
      <H3 block="4views">有料版では、あなたの受け取り方を4つの見方で比べます</H3>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-base leading-relaxed text-slate-900">
        <li><b className="font-bold">手取りがいちばん多い</b>のはどれか</li>
        <li><b className="font-bold">最初の年に多く受け取れる</b>のはどれか</li>
        <li><b className="font-bold">いちばん早く受け取り終える</b>のはどれか</li>
        <li><b className="font-bold">公的医療保険料・介護保険料が上がらない</b>のはどれか</li>
      </ul>

      {/* 【E-20】差が0円の方（407人中48人＝12%）には「0円」を出さず、文のカードにします（2026-09-18・決め1347 で、そのカードの字を替えました。下の覚え書き）。
          **「差が出ます」と断定しない／「有料版でないと分かりません」と書かない。**事実だけを置きます。 */}
      {r.bunkiSa === 'aru' ? (
        <>
          <div className="mt-4 rounded-2xl border border-[#0f5f4e]/25 bg-[#f0f7f4] p-5 text-center">
            <p className="text-base font-bold text-slate-900">あなたの場合、一度にまとめて受け取るより</p>
            <div className="mt-1 text-[34px] font-bold leading-tight tabular-nums text-[#0f5f4e]">
              {r.sa.toLocaleString('en-US')}円
            </div>
            <p className="mt-1 text-base font-bold text-[#0f5f4e]">手取りが多くなる受け取り方があります。</p>
          </div>
          {/* 緑カードの下に前提の断り（§5-3-2。カードより後ろに置くこと） */}
          <p className="mt-3 text-base leading-relaxed text-slate-800">
            <b className="font-bold">
              この{r.sa.toLocaleString('en-US')}円も、退職金以外の収入・公的年金・すでに受け取った退職手当等・所得控除を「なし」として計算しています。
            </b>
            あなたに当てはまるものがあると、実際の金額は変わります。
          </p>
        </>
      ) : (
        /*
          【2026-09-18・決め1347（戦術Cowork `kaihatsu_ate_20260918h.md` B-2・戦略Coworkの止め・森嶋さんのお決め）】
            差が0円の方（`r.bunkiSa === 'nashi'`＝`free.ts` 237行 `sa > 0 ? 'aru' : 'nashi'`）にだけ出す箱と1行です。
            上の緑の箱と「この◯円も…」の1行とは、どちらか一方だけが出ます（両方を同時に出さない）。
            字は基準HTML（224,881 ／ 1e102a66）835〜836行 `data-sa0="1"` の2つから1字1句。差を計算し直していません。
            前はここに「あなたの場合、退職金とiDeCo等の受け取り方だけを変えても、手取りは変わりませんでした。」と
            「有料版では、あなたが公的年金を…まだ見ていない部分です。」の箱が在りました（基準HTMLには無い字でした）。
            「変わりませんでした」は「どう受け取っても同じ額」と読まれるので外しました（決め1345・1346・1347）。
            出る箱が1つだけであることは `kensa/sa0_hako_mon.tsx` が数えます。
        */
        <>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-base leading-relaxed text-slate-900">
              <b className="font-bold">あなたの場合、いちばん多く残るのは、一度にまとめて受け取る方法です。</b>
              受け取り方によっては、手取りが少なくなることがあります。どの受け取り方でいくら少なくなるかは、有料版でご覧いただけます。
            </p>
          </div>
          <p className="mt-3 text-base leading-relaxed text-slate-800">
            <b className="font-bold">
              この結果も、退職金以外の収入・公的年金・すでに受け取った退職手当等・所得控除を「なし」として計算しています。
            </b>
            あなたに当てはまるものがあると、実際の金額は変わります。
          </p>
        </>
      )}
      <p className="mt-3 text-base leading-relaxed text-slate-800">
        4つとも同じ受け取り方になる方もいます。その場合は「どの見方で比べても同じです」とお伝えします。分かれる場合は、方向ごとに並べて差額を示します。
      </p>

      {/* 3. ほかと違うところ */}
      <H3 block="different">有料版が、ほかと違うところ</H3>
      <div className="mt-3 space-y-3">
        {/*
          【2026-09-18・決め1344（戦術Cowork `kaihatsu_ate_20260918f.md` 2-3）】前からある3枚に、単語の途中で切らない組み方を入れました。
            字も太字の位置も変えていません。`<wbr>` の位置は基準HTML（222,774 ／ 9c153ae4）833〜835行から1字1句（機械で写しました）。
            前は「介護保険／料」「計／算します」「根拠／の条文」の3か所で、単語の途中で切れていました。
        */}
        <Card
          kz
          title={<>公的年金・<wbr />iDeCo等・<wbr />税金を、<wbr />同じ年の上に<wbr />並べて計算し、<wbr />国民健康保険料・<wbr />介護保険料・<wbr />医療費の負担も<wbr />チェックできます</>}
          body={<>公的年金は<wbr />年金事務所、<wbr />iDeCo等は<wbr />金融機関、<wbr />税金は<wbr />税務署。<wbr />ばらばらに<wbr />聞くしか<wbr />なかった<wbr />3つを、<wbr />まとめて<wbr />計算します。<wbr />税金だけを<wbr />見て<wbr />決めると、<wbr /><b className="font-bold">国民健康保険料の<wbr />軽減が<wbr />なくなる案</b>を<wbr />選んでしまう<wbr />ことがあります</>}
        />
        <Card
          kz
          title={<>あなたが<wbr />実際に<wbr />選べる<wbr />受け取り方だけを<wbr />計算します</>}
          body={<>退職金を<wbr />受け取る年を<wbr />選べる方は<wbr />多くありません。<wbr />このツールは、<wbr />あなたが<wbr />ご入力になった<wbr />年齢で<wbr />計算します。<wbr /><b className="font-bold">あなたが<wbr />実際に<wbr />選べない案は<wbr />出しません。</b></>}
        />
        <Card
          kz
          title={<>答えだけでなく、<wbr />計算の<wbr />全ステップと<wbr />根拠の条文を<wbr />お見せします</>}
          body={<>1通りずつ、<wbr />所得税・<wbr />住民税・<wbr />復興特別所得税・<wbr />防衛特別所得税と<wbr />手数料まで<wbr />計算し、<wbr />条文から<wbr />別に<wbr />組み直した<wbr />計算と<wbr />突き合わせています</>}
        />
        {/*
          【2026-09-18・決め1343（戦術Cowork `kaihatsu_ate_20260918d.md` 3-3・森嶋さんの承認済み）】4枚めのカード。
            決め1319(3)で「できないこと」の3枚めから外した字を、1字も変えずにここへ戻しました。
            根拠 …… 実装指示書 v4 92行「2. 絶対に守ること」12番。
            見せ方 …… 太字1つ。単語の途中で切らないため、`<wbr>` の位置は基準HTML（219,643 ／ 988e520d）817行から1字1句（222,774 ／ 9c153ae4 では 837行・字は同じ）。
            この字が買う前の画面に在ることは `kensa/tesuryo_mon.mjs` が数えます（本番化の前の門・戦術Cowork 3-3）。
        */}
        <Card
          kz
          title={<>当社は<wbr />金融機関からも<wbr />士業からも、<wbr />手数料・紹介料を<wbr />受け取っていません</>}
        />
      </div>

      {/*
        ★★★2026-09-17・決め1312（★戦術Cowork `senjutsu_20260917c.md` 2-2・戦略Coworkのお決め）
          ★★**「AIに聞けば無料でできるのでは」というご質問について**（★見出しと、その下の6つのかたまり）を、
            ★**この画面から外しました**（★**803字 ／ 太字18か所**）。
          ★理由 …… ★★**買う直前の画面を短くするためです**（★買う前に読む字 7,596 → **6,995字**）。
          ★★★**消していません。**★控えは置き場の `bin/senjutsu/ai_hikaku_20260917.html`（2,648バイト）。
            ★★**記事のどこへ移すかは、戦略Coworkがお決めになります。**★**この回では、どこにも足していません。**
          ★★あわせて `lib/retirement/pro/blocks.ts` の一覧から `ai` を外しました（★決め1313）──
            ★**画面に無いのに一覧に在ると、`pro_pricing_block_view` の `ai` がただ 0件になり、
              ★★「ai で全員落ちた」と読まれる道が在ります。**
      */}
      {/* 5. そのほかに含まれるもの */}
      <details data-block-start="included" className="mt-6 rounded-xl border border-slate-200 p-4">
        <summary className="cursor-pointer text-base font-bold text-slate-900">そのほかに含まれるもの</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-base leading-relaxed text-slate-900">
          <li>あなたが確定申告をした場合に戻る額</li>
          <li>iDeCo等の給付事務手数料・口座管理手数料</li>
          <li>あなたがすでに受け取った退職手当等（前の勤め先の退職金・企業年金の一時金・iDeCo等の一時金）による、退職所得控除の調整</li>
        </ul>
      </details>

      {/* 6. できないこと */}
      <H3 block="cannot">できないこと</H3>
      <div className="mt-3 space-y-3">
        <Card
          title="× 保険料そのものの金額。"
          body={<>計算に使う率が市区町村によって違い、全国分のデータが公表されていないためです。かわりに<b className="font-bold">上がるかどうか</b>と、<b className="font-bold">あなたの所得が国の定める基準をいくら超えるか</b>をお伝えします。<b className="font-bold">あなたが実際にお支払いになる金額は、お住まいの市区町村にご確認ください。</b></>}
        />
        <Card
          title="× 運用による増減。"
          body={<>年金で受け取る間も運用は続きますが、将来の利回りは分からないため<b className="font-bold">0%</b>で計算しています</>}
        />
        {/*
          【2026-09-17・決め1319(3)（戦術Cowork まとめ・3版 5-2／戦略Coworkのお決め）】字を替えました。

          前 …… 「× 書類の作成・代筆、金融商品の紹介。」＋
                 「当社は金融機関からも士業からも、手数料・紹介料を受け取っていません」
          いま … 「× 書類の作成・代筆、金融商品のご紹介。」＋
                 「期待のずれを防ぐため、ここに書いています」

          【理由】「手数料・紹介料を受け取っていません」は「できないこと」ではなく
            「しないと決めていること」で、「×」の欄に置くと弱みとして読まれるため。

          【2026-09-18・決め1343 で戻しました】移す先は「有料版が、ほかと違うところ」の4枚めのカードです
            （この本の「3. ほかと違うところ」）。字は1字も変えていません。

          （2026-09-17〜18 のあいだ、買う前の画面にこの字は在りませんでした。
            そのあいだもサイトからは消えていません） ── `app/policy/page.tsx` 101行
            「当サイトは金融商品を販売していません。販売による手数料も受け取っていません。」が在り、
            `app/retirement/pro/page.tsx` 78行の `SiteFooter`（`components/SiteFooter.tsx` 37行）から
            1回押せば行けます。
            なお、この約束は実装指示書 v4 92行「2. 絶対に守ること」12番にも在ります。
        */}
        <Card
          title="× 書類の作成・代筆、金融商品のご紹介。"
          body="期待のずれを防ぐため、ここに書いています"
        />
      </div>

      {/* 7. 計算に入れていないもの
          【2026-09-18・決め1349（戦術Cowork `kaihatsu_ate_20260918j.md` B-1）】畳みを外しました（前は `<details>`）。
          計算に入れていないものは計算の根拠に当たるため、実装指示書 v4 87行「2. 絶対に守ること」7番で畳みません。
          基準HTML（226,887 ／ e9045851）862〜869行に合わせ、見出しは本文の太字。字は1字も変えていません。
          計測の区切り（`data-block-start="notincluded"`）は、見出しと並びを包む `<div>` に移しました（`pro_pricing_block_view` の `notincluded` はそのまま測れます）。 */}
      <div data-block-start="notincluded" className="mt-6">
        <p className="text-base leading-relaxed text-slate-900"><b className="font-bold">そのほか、計算に入れていないもの</b></p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-base leading-relaxed text-slate-900">
          <li><b className="font-bold">介護保険料の段階と金額。</b>段階の数も区切りも市区町村の条例で違います。<b className="font-bold">あなたの段階は、お住まいの市区町村にご確認ください。</b></li>
          <li><b className="font-bold">高額療養費・高額介護サービス費。</b>医療費の窓口負担が2割・3割になるかどうかはお伝えしますが、ひと月の自己負担の上限は計算していません</li>
          <li><b className="font-bold">あなたが受け取り切る前に亡くなった場合。</b>残りは相続税の対象に変わります（500万円×相続人の数までは非課税）。このツールは<b className="font-bold">あなたが受け取り切ること</b>を前提に比べています。年金で長く受け取るほど、この残りは大きくなります</li>
          <li><b className="font-bold">一部の所得控除。</b>特定親族特別控除・勤労学生控除・医療費控除・雑損控除・寄附金控除は計算に入れていません。所得金額調整控除も、給与の収入が850万円を超える場合の分は入れていません</li>
        </ul>
      </div>

      {/* 8. お役に立てない場合 */}
      <div data-block-start="notfor" className="mt-6 rounded-xl border border-[#c2841e] bg-[#fdf6e7] p-4">
        <b className="text-base font-bold leading-relaxed text-slate-900">次の場合は、有料版ではお役に立てません。</b>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-base leading-relaxed text-slate-900">
          {/*
            ★★★2026-09-16・決め1264（★戦術Cowork `senjutsu_20260915l.md` 1-3）
              ★前 …… 「iDeCo・企業型DC・**小規模企業共済**のいずれもお持ちでない場合。…」
              ★★★**なぜ誤りか** …… ★**小規模企業共済だけをお持ちの方は、「お持ちでも」対象外です**
                （★③が0円になるため）。★★「お持ちでない場合は対象外」と書くと、
                ★★★**「お持ちなら通る」と読めます。★通りません。**
              ★★基準HTML 757行は、戦術Coworkが直されました。
          */}
          <li>iDeCo・企業型DCのいずれもお持ちでない場合。比べる受け取り方がないためです</li>
          <li>受け取り方をご自身で選べない場合。お勤め先やご利用の金融機関によっては一時金しか選べないことがあります</li>
        </ul>
      </div>

      {/* 9. ご入力いただくこと */}
      <H3 block="inputs">有料版でご入力いただくこと</H3>
      <p className="mt-2 text-base leading-relaxed text-slate-800">
        いまの5項目に加えて、<b className="font-bold">15項目</b>をうかがいます。
      </p>
      <p className="mt-1 text-base leading-relaxed text-[#5b6470]">
        生まれた年月日／退職後の収入／企業年金／公的年金の見込額／勤続期間／iDeCo等の加入期間／すでに受け取った退職手当等／扶養しているご家族／社会保険料／生命保険料／まとまった支出の予定／年金の受取回数／公的年金を受け取り始める年齢
      </p>
      <p className="mt-3 text-base leading-relaxed text-slate-800">
        このほかに<b className="font-bold">「詳細を入力する」8項目</b>があります。
        <b className="font-bold">あてはまる方が入力すると、より精度の高い計算結果になります。</b>
      </p>
      <p className="mt-1 text-base leading-relaxed text-[#5b6470]">
        配偶者がいる／19歳以上23歳未満・70歳以上のご家族を扶養している／障害者手帳をお持ちの方がいる／寡婦・ひとり親／役員退職慰労金がある／障害が原因で退職する／お住まいの市区町村
      </p>

      {/* 10. ご用意いただくもの */}
      <H3 block="prepare">ご用意いただくもの</H3>
      <table className="mt-3 w-full border-collapse">
        <thead>
          <tr>
            <th className="w-40 border-b border-slate-300 py-2 text-left text-base font-bold text-slate-900">お手元に</th>
            <th className="border-b border-slate-300 py-2 text-left text-base font-bold text-slate-900">使うところ</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200">
            <td className="py-3 pr-3 text-base text-slate-900">ねんきん定期便</td>
            <td className="py-3 text-base leading-relaxed text-slate-900">⑩ あなたの老齢厚生年金・老齢基礎年金の見込額</td>
          </tr>
          <tr>
            <td className="py-3 pr-3 text-base text-slate-900">源泉徴収票</td>
            <td className="py-3 text-base leading-relaxed text-slate-900">⑮ あなたの社会保険料等の金額</td>
          </tr>
        </tbody>
      </table>

      {/*
        §6の3・§6の9：**「わからない」を選べることと、不利な側で計算することを購入前に伝える文。**
        消えていると「後出しにしない」という約束が消えます。**落とさないこと。**
      */}
      <p className="mt-3 text-base leading-relaxed text-slate-800">
        そろっていなくても始められます。勤続期間とiDeCo等の加入期間は
        <b className="font-bold">「わからない」を選べます</b>
        （<b className="font-bold">あなたに不利な側</b>で計算し、どう置いたかをお示しします）。
        ねんきん定期便の額は、あとから入れ直せます。
      </p>

      {/* 11. 価格とボタン。**画面下に固定しない**（§2の6） */}
      <div data-block-start="price" className="mt-8 rounded-2xl border-2 border-[#0f5f4e]/25 p-5">
        <p className="text-base font-bold text-slate-900">有料版価格</p>
        <div className="mt-1 text-[34px] font-bold leading-tight tabular-nums text-slate-900">
          {KAKAKU.toLocaleString('en-US')}円<span className="ml-1 text-base font-bold">（税込）</span>
        </div>
        <p className="mt-1 text-base leading-relaxed text-slate-800">購入から1年間、何度でも計算し直せます。</p>

        {/* §3-3の3：インボイスを発行できないことを、購入ボタンの手前に */}
        <p className="mt-4 text-base leading-relaxed text-slate-900">
          当社は適格請求書発行事業者ではないため、インボイス（適格請求書）の発行はいたしかねます。
          お支払いの控えは、決済画面からお受け取りいただけます。
        </p>

        {/*
          §6の12：**返金の方針は、折りたたまない・小さくしない。購入ボタンのすぐ上。**
          特定商取引法15条の3ただし書「顧客にとって見やすい箇所において明瞭に判読できるように表示する」
        */}
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-base font-bold text-slate-900">返金について</p>
          <p className="mt-2 text-base leading-relaxed text-slate-900">
            <b className="font-bold">お客様のご都合による返金は、お受けしていません。</b>ご購入後すぐに計算結果をご覧いただけるためです。
          </p>
          <p className="mt-2 text-base leading-relaxed text-slate-900">
            当社に原因のある不具合があったときは、お支払いいただいた額の全額を返金します。計算に誤りがあった、画面が表示されない、お支払いいただいたのにご利用いただけない、などです。support@tsuginotenavi.jp までご連絡ください。
          </p>
          <p className="mt-2 text-base leading-relaxed text-slate-900">
            推奨する動作環境の外でのご利用と、保守のための一時的な停止は、上記の不具合に含みません。
          </p>
        </div>

        {/* 【2026-09-19・決め1359（戦術Cowork `kaihatsu_ate_20260919p.md` 1）】下の並び（7本・13px）と3つのリンクを、
            購入ボタンの下から、「返金について」の箱と同意の1行の間へ移しました。字は1字も変えていません。字の大きさ（13px）も同じです。
            断りは購入ボタンより上（戦略Coworkの条件）。購入ボタンより下には、何も残りません。基準HTML（228,599 ／ dc2ffbf7）842〜861行。 */}
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-[#5b6470]">
          {/*
            ★★★2026-09-16・決め1297（★戦術Cowork `senjutsu_20260916i.md` 1-4）── ★**主語を入れました。**
              ★前 …… 「入力した内容は保存され、直したいところだけ変えられます。」
              ★★**画面1の「あなたが入力した金額を、当社は保存しません。」と対**になります
                （★無料＝当社は保存しない ／ 有料＝当社に保存される）。
              ★★基準HTML **786行**から1字1句。
          */}
          {/*
            2026-09-17・決め1308・1312（戦術Cowork `senjutsu_20260917c.md` 2-1）
              9本に置き替えました（前は4本）。基準HTML 775〜786行から1字1句。
              足した5本 …… ①計算し直すと前の結果は残りません（決め1308 ── 買う前の5画面に 0か所でした）
                ／②当社に原因のある不具合 ／③お客様のご都合による返金
                ／④⑤保存期間と削除（「保存期間」「削除」も買う前に 0か所。字はプライバシーポリシー 15-4・15-6 から）
              太字（`<b>`）の付く所も、基準HTMLのとおりです。
          */}
          {/*
            【2026-09-17・決め1326（戦術Cowork まとめ・3版 4節）】返金の2本を外しました（9本 → 7本）。

            【なぜ外すか】返金の字は、この `<ul>` の 60行ほど上に、すでに在ります
              ── 275〜285行の `<div className="mt-4 rounded-xl bg-slate-50 p-4">`（見出し「返金について」・3段落）。
              そちらが、実装指示書 v4 922行・1260行の言う「購入ボタンのすぐ上・本文と同じ大きさ・
              折りたたまない」を満たしている本物です。
              この `<ul>` は買うボタンの **下** で、字も 13px（注記の大きさ）です。（2026-09-19・決め1359 で、この `<ul>` は購入ボタンの上へ移しました。字と 13px は同じです）
              ですので、ここに返金を置くと、**同じことを2か所で、しかも下の方が小さく**申し上げることになります。

            【どうして入ったか】決め1312 のとき、戦術Coworkは基準HTMLだけを数えて
              「買う前の5画面に『返金』0か所」と見ました。実装には前から在りました。
              こちらも、足す前に実装の同じ所を数えていませんでした。
              戦術Coworkが基準HTML 771〜788行に、実装から1字1句写して足し直しています。

            【止め】基準HTMLの字を直す前に、本番実装の同じ所を開いて数える（決め1326・`tome.md` A2）。
          */}
          <li><b className="font-bold">あなたが入力した内容は当社に保存され、直したいところだけ変えられます。</b></li>
          <li><b className="font-bold">計算し直すと、前の結果は残りません。</b>残しておきたいときは、先にファイルをダウンロードしてください。</li>
          <li><b className="font-bold">あなたが入力した内容とメールアドレスは、ご利用いただける期間（購入から1年）が過ぎたあと、60日以内に削除します。</b></li>
          <li><b className="font-bold">それより前に削除してほしいときは、support@tsuginotenavi.jp までご連絡ください。</b>ご購入時のメールアドレス宛に、ご本人の確認のご連絡をします。</li>
          <li>ご購入時のメールアドレスに、結果を開き直すリンクをお送りします。</li>
          <li>都度のお支払いです。自動更新はありません。</li>
          <li>決済はStripeを利用します。あなたのメールアドレスは米国のStripe, Inc.およびResendに送られます。</li>
        </ul>

        {/* B-1b の2：3つのリンク。★必ず別のタブで開く（同じタブで移ると、戻ったときに入力が消えるため） */}
        <p className="mt-3 text-[13px] leading-relaxed text-[#5b6470]">
          <a href="/retirement/pro/tokushoho" target="_blank" rel="noopener noreferrer" className="underline">特定商取引法に基づく表記</a>
          ・
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline">利用規約</a>
          ・
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline">プライバシーポリシー</a>
          （別のタブで開きます）
        </p>

        {/* B-1b の3：購入で同意。ボタンの直前。折りたたまない・小さくしない（§6の12と同じ扱い） */}
        <p className="mt-4 text-base leading-relaxed text-slate-900">
          「有料版購入」を押すと、利用規約と特定商取引法に基づく表記に同意したものとみなします。
        </p>

        {/* §7-4：橙はこのボタンにだけ */}
        <button
          type="button"
          onClick={() => { track('pro_buy_click', { entry: 'screen5-6' }); onBuy(); }}
          className="mt-4 w-full rounded-xl bg-[#c2410c] px-6 py-4 text-[18px] font-bold text-white
                     focus:outline-none focus:ring-2 focus:ring-[#c2410c] focus:ring-offset-2"
        >
          有料版購入
        </button>
      </div>
    </section>
  );
}
