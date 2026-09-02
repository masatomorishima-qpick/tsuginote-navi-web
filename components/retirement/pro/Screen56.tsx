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

function Card({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <b className="block text-base font-bold leading-relaxed text-slate-900">{title}</b>
      <span className="mt-1 block text-base leading-relaxed text-slate-800">{body}</span>
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

  return (
    <section id="pro-pricing" ref={ref} className="mt-12 border-t border-slate-200 pt-8">
      <h2 className="text-[22px] font-bold text-slate-900">
          [有料版]退職金とiDeCoの受け取り方シミュレーションについて
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

      {/* 【E-20】差が0円の方（407人中48人＝12%）には「0円」を出さず、文のカードにします。
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
        <div className="mt-4 rounded-2xl border border-[#0f5f4e]/25 bg-[#f0f7f4] p-5">
          <p className="text-base font-bold leading-relaxed text-slate-900">
            あなたの場合、退職金とiDeCo等の受け取り方だけを変えても、手取りは変わりませんでした。
          </p>
          <p className="mt-3 text-base leading-relaxed text-slate-900">
            有料版では、あなたが公的年金を受け取り始める年齢（60歳〜75歳）と、
            公的医療保険料・介護保険料・医療費の窓口負担も含めて計算します。
            ここまでの計算では、まだ見ていない部分です。
          </p>
        </div>
      )}
      <p className="mt-3 text-base leading-relaxed text-slate-800">
        4つとも同じ受け取り方になる方もいます。その場合は「どの見方で比べても同じです」とお伝えします。分かれる場合は、方向ごとに並べて差額を示します。
      </p>

      {/* 3. ほかと違うところ */}
      <H3 block="different">有料版が、ほかと違うところ</H3>
      <div className="mt-3 space-y-3">
        <Card
          title="公的年金・iDeCo等・税金を、同じ年の上に並べて計算し、国民健康保険料・介護保険料・医療費の負担もチェックできます"
          body={<>公的年金は年金事務所、iDeCo等は金融機関、税金は税務署。ばらばらに聞くしかなかった3つを、まとめて計算します。税金だけを見て決めると、<b className="font-bold">国民健康保険料の軽減がなくなる案</b>を選んでしまうことがあります</>}
        />
        <Card
          title="あなたが実際に選べる受け取り方だけを計算します"
          body={<>退職金を受け取る年を選べる方は多くありません。このツールは、あなたがご入力になった年齢で計算します。<b className="font-bold">あなたが実際に選べない案は出しません。</b></>}
        />
        <Card
          title="答えだけでなく、計算の全ステップと根拠の条文をお見せします"
          body="1通りずつ、所得税・住民税・復興特別所得税・防衛特別所得税と手数料まで計算し、条文から別に組み直した計算と突き合わせています"
        />
      </div>

      {/* 4. AIについて。**ここの金額は固定の例**（§5-3） */}
      <H3 block="ai">「AIに聞けば無料でできるのでは」というご質問について</H3>
      <table className="mt-3 w-full border-collapse">
        <thead>
          <tr><th colSpan={2} className="border-b border-slate-300 py-2 text-left text-base font-bold text-slate-900">生成AI3つの質問結果</th></tr>
          <tr>
            <th className="w-24 border-b border-slate-200 py-2 text-left text-base font-bold text-slate-900">聞いた相手</th>
            <th className="border-b border-slate-200 py-2 text-left text-base font-bold text-slate-900">返ってきた答え</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-200">
            <td className="py-3 pr-3 align-top text-base text-slate-900">1件目</td>
            <td className="py-3 align-top text-base leading-relaxed text-slate-900">
              <b className="font-bold">当社と同じ結論</b>（iDeCo等を60歳から5年の年金）。ただし所得税の基礎控除を
              <b className="font-bold">95万円</b>としていました（あなたが受け取る令和8年分は
              <b className="font-bold tabular-nums">1,040,000円</b>です）
            </td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="py-3 pr-3 align-top text-base text-slate-900">2件目</td>
            <td className="py-3 align-top text-base leading-relaxed text-slate-900">
              「退職金の<b className="font-bold">5年後</b>にiDeCo等を一時金で受け取れば<b className="font-bold">税金は0円</b>」。
              <b className="font-bold">事実と違います</b>
            </td>
          </tr>
          <tr>
            <td className="py-3 pr-3 align-top text-base text-slate-900">3件目</td>
            <td className="py-3 align-top text-base leading-relaxed text-slate-900">
              「両方を60歳で一時金」。住民税を課税退職所得の<b className="font-bold">3%</b>（正しくは10%）、
              公的年金等控除を<b className="font-bold">120万円</b>（正しくは110万円）としていました
            </td>
          </tr>
        </tbody>
      </table>

      <p className="mt-3 text-base leading-relaxed text-slate-800">
        <b className="font-bold">結論、全てのツールで異なる結果になりました。2件目がいちばん危ない答えです。</b>
        退職金を先に受け取った場合、控除が戻るのは<b className="font-bold">20年後</b>です（5年ではありません）。
        当社が計算すると、この受け取り方の税金は<b className="font-bold tabular-nums">343,751円</b>、
        手取りは<b className="font-bold tabular-nums">24,651,057円</b>。
        <b className="font-bold">同じ年にまとめて受け取るより69,285円少なくなります。</b>
        つまり、この助言に従うと、何もしないより悪くなります。
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-[#5b6470]">
        ※この3つの金額は、<b className="font-bold text-slate-900">勤続38年・退職金2,000万円・iDeCo等500万円・公的年金220万円の方の例</b>です。公的年金の額によって変わるため、無料版ではお一人ずつの金額は出していません。有料版では、あなたの公的年金の見込額を入れて計算します。
      </p>
      <p className="mt-3 text-base leading-relaxed text-slate-800">
        <b className="font-bold">そして3件とも、5年の年金にすると60歳の時点で手元に入る額が3,720,342円少なくなることを、金額では書きませんでした。</b>
      </p>
      <div className="mt-3 rounded-xl border border-[#c2841e] bg-[#fdf6e7] p-4">
        <b className="text-base font-bold leading-relaxed text-slate-900">
          AIは、合っているときと間違っているときで、まったく同じ自信で答えます。
        </b>
        <span className="mt-1 block text-base leading-relaxed text-slate-900">
          当社は、アウトプットの信頼性を担保するために、条件分岐のパターンとそれに見合う計算式を作ったうえでアウトプットしています。
          <b className="font-bold">根拠にした条文も、計算の全ステップもお見せします。</b>
        </span>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-[#5b6470]">
        ※聞いた質問は3件とも同じ文です。AIは日々更新されるため、いま同じことを聞いても同じ答えになるとは限りません。
        <b className="font-bold text-slate-900">この結果は2026年8月時点のものです。</b>
      </p>

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
        <Card
          title="× 書類の作成・代筆、金融商品の紹介。"
          body="当社は金融機関からも士業からも、手数料・紹介料を受け取っていません"
        />
      </div>

      {/* 7. 計算に入れていないもの */}
      <details data-block-start="notincluded" className="mt-6 rounded-xl border border-slate-200 p-4">
        <summary className="cursor-pointer text-base font-bold text-slate-900">そのほか、計算に入れていないもの</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-base leading-relaxed text-slate-900">
          <li><b className="font-bold">介護保険料の段階と金額。</b>段階の数も区切りも市区町村の条例で違います。<b className="font-bold">あなたの段階は、お住まいの市区町村にご確認ください。</b></li>
          <li><b className="font-bold">高額療養費・高額介護サービス費。</b>医療費の窓口負担が2割・3割になるかどうかはお伝えしますが、ひと月の自己負担の上限は計算していません</li>
          <li><b className="font-bold">あなたが受け取り切る前に亡くなった場合。</b>残りは相続税の対象に変わります（500万円×相続人の数までは非課税）。このツールは<b className="font-bold">あなたが受け取り切ること</b>を前提に比べています。年金で長く受け取るほど、この残りは大きくなります</li>
          <li><b className="font-bold">一部の所得控除。</b>特定親族特別控除・勤労学生控除・医療費控除・雑損控除・寄附金控除は計算に入れていません。所得金額調整控除も、給与の収入が850万円を超える場合の分は入れていません</li>
        </ul>
      </details>

      {/* 8. お役に立てない場合 */}
      <div data-block-start="notfor" className="mt-6 rounded-xl border border-[#c2841e] bg-[#fdf6e7] p-4">
        <b className="text-base font-bold leading-relaxed text-slate-900">次の場合は、有料版ではお役に立てません。</b>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-base leading-relaxed text-slate-900">
          <li>iDeCo・企業型DC・小規模企業共済のいずれもお持ちでない場合。比べる受け取り方がないためです</li>
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
            当社に原因のある不具合があったときは、お支払いいただいた額の全額を返金します。計算に誤りがあった、画面が表示されない、お支払いいただいたのにご利用いただけない、などです。info@blueadventures.jp までご連絡ください。
          </p>
          <p className="mt-2 text-base leading-relaxed text-slate-900">
            推奨する動作環境の外でのご利用と、保守のための一時的な停止は、上記の不具合に含みません。
          </p>
        </div>

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

        <ul className="mt-3 list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-[#5b6470]">
          <li>入力した内容は保存され、直したいところだけ変えられます。</li>
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
      </div>
    </section>
  );
}
