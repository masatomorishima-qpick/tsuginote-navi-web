import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import {
  RetirementArticleHeader, Toc, TableScroll,
  buildRetirementArticleJsonLd, buildRetirementArticleMetadata,
  tableCls, thCls, tdCls, ORG_NAME,
  type TocItem,
} from '@/components/retirement/RetirementArticle';
import { getRetirementArticle } from '@/lib/retirement/articles';

/* ===== メタ情報 =====
 * 実体は lib/retirement/articles.ts（レジストリ）が持つ。ここでは参照するだけ。
 * 記事9・記事11・記事12と同じ組み立て（駅1-5指示書3-2）。
 *
 * この記事にツールは埋め込まない（駅1-5指示書0章）。退職所得の計算は記事9のツールが
 * 担っているため、「自分の数字はどこに書いてあるか」の章末に導線を1本置くにとどめる。 */
const ARTICLE = getRetirementArticle('/retirement/souki-taishoku-warimashi');

export const metadata = buildRetirementArticleMetadata(ARTICLE);

/* この記事はFAQ節を持たない（確定稿にFAQがない）。faqs を渡さないので
 * FAQPage ノードは生成されない（記事9・記事11・記事12と同じ）。 */
const jsonLd = buildRetirementArticleJsonLd({ article: ARTICLE });

/* ===== 目次（H2 と対応）=====
 * ツールへの導線は見出しではないため目次に載せない（記事11・記事12と同じ）。 */
const TOC: TocItem[] = [
  { id: 'warimashi-is-taishoku-shotoku', label: '割増退職金も、退職所得です' },
  { id: 'yobikata', label: '呼び方が違っても、税の扱いは同じです' },
  { id: 'toukei', label: '早期優遇で辞めた人は、平均でいくら受け取っているか' },
  { id: 'kojo-and-kinzoku', label: '退職所得控除は、勤続年数だけで決まります' },
  { id: 'hikaku', label: '割増の増える分と、控除の減る分を並べます' },
  { id: 'kitei-bun-nomi', label: '規程分だけなら、税がかからない場合があります' },
  { id: 'taishokubi', label: '退職日が1か月違うと、手取りが106,470円変わります' },
  { id: 'where-to-find', label: '自分の数字はどこに書いてあるか' },
  { id: 'cautions', label: 'やらない方がいい人と、この記事で扱わないこと' },
  { id: 'sources', label: '出典' },
];

const h2 = 'mt-10 scroll-mt-20 text-[20px] font-bold text-slate-900 sm:text-[22px]';
const h3 = 'mt-6 text-[16px] font-bold text-slate-900 sm:text-[17px]';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const ulCls = 'mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700';
const linkCls = 'text-blue-700 underline hover:no-underline';

export default function SoukiTaishokuWarimashiPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <RetirementArticleHeader article={ARTICLE} />

        <Toc items={TOC} />

        {/* 導入（本文冒頭の4段落・H2なし） */}
        <p className={p}>
          勤め先から早期退職の募集を知らされたとき、まず目に入るのは割増の金額です。ただし、募集要項に書かれているのは税を引く前の額面です。
        </p>
        <p className={p}>
          この記事で使う基準ケースでは、割増は1,000万円です。この割増にかかる税は<strong>1,069,312円</strong>、手元に残るのは<strong>8,930,688円</strong>という計算になります。
        </p>
        <p className={p}>
          そして、応募するかどうかの判断は、割増の額だけでは決まりません。5年早く辞めれば、勤続年数も5年短くなります。<strong>退職所得控除は勤続年数だけで決まるため、控除もその分だけ減ります。</strong>
        </p>
        <p className={p}>
          増える割増と、減る控除。この2つを同時に計算に入れないと、手取りは出ません。この記事では、その2つを並べます。
        </p>

        {/* 前提の囲み（本文11〜32行目の {'>'} ブロック）。記事9・記事11・記事12と同じ callout ボックス。
            この記事は「計算の前提」と「税の計算の前提」の2見出し構成なので、囲みの中で分けて出す。 */}
        <blockquote className="mt-4 rounded-xl border-l-4 border-slate-300 bg-slate-50 p-4">
          <p className="text-[14px] font-bold text-slate-800">この記事の計算の前提</p>
          <p className="mt-2 text-[14px] leading-relaxed text-slate-700">
            次の数字は、説明のために仮に置いたものです。実際の金額は人によって違います。
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-slate-700">
            <li>22歳（大学卒）で入社し、55歳で早期退職する</li>
            <li>早期退職した場合の勤続年数は<strong>33年</strong></li>
            <li>定年は60歳。定年まで勤めた場合の勤続年数は<strong>38年</strong></li>
            <li>定年まで勤めた場合の退職金の見込みは<strong>20,000,000円</strong></li>
            <li>早期退職した場合の規程分の退職金は<strong>17,000,000円</strong></li>
            <li>早期退職の割増は<strong>10,000,000円</strong></li>
            <li>受け取り方は全額一時金</li>
          </ul>
          <p className="mt-4 text-[14px] font-bold text-slate-800">税の計算の前提</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-slate-700">
            <li>退職所得は分離課税で、給与や年金と合算しません</li>
            <li>退職所得は、退職金額から退職所得控除を引いた残額の2分の1です（勤続5年超で、役員以外の場合）</li>
            <li>課税標準の1,000円未満を切り捨てて計算しています</li>
            <li>所得税は復興特別所得税（2.1%）を含み、1円未満を切り捨てます</li>
            <li>住民税は一律10%です</li>
            <li>「退職所得の受給に関する申告書」を勤め先に提出した前提です。提出しない場合は源泉徴収の扱いが変わります</li>
            <li>社会保険料は計算に入れていません。退職一時金は退職所得として分離課税され、国民健康保険料の計算のもとになる所得には入らないためです</li>
            <li><strong>早く辞めた5年分の給与は、この比較に含まれていません</strong></li>
          </ul>
        </blockquote>

        {/* 割増退職金も退職所得（本文34〜40行目） */}
        <section id="warimashi-is-taishoku-shotoku">
          <h2 className={h2}>割増退職金も、退職所得です</h2>
          <p className={p}>
            早期退職の割増は、通常の退職金とは別の名前で案内されます。ただし税の上では、<strong>規程分の退職金と割増を合わせて、1つの退職所得</strong>として計算します。別々に税がかかるわけではありません。
          </p>
          <p className={p}>
            <strong>退職所得</strong>とは、退職によって一時に受け取るお金の所得区分のことです。退職所得は<strong>分離課税</strong>です。分離課税とは、給与や年金と合算せず、単独で税額を計算する仕組みのことです（所得税法30条1項）。
          </p>
          <p className={p}>
            退職に基因して一時に支払われるものであれば、退職所得になります。ただし、支払の計算基準が在職している人の賞与と同じ性質だと判断される場合は、退職所得にならないことがあります（所得税基本通達30-1）。<strong>募集要項の記載と、会社から受け取る源泉徴収票の区分を確認してください。</strong>
          </p>
        </section>

        {/* 呼び方が違っても税の扱いは同じ（本文42〜48行目） */}
        <section id="yobikata">
          <h2 className={h2}>呼び方が違っても、税の扱いは同じです</h2>
          <p className={p}>
            早期退職、希望退職、退職勧奨、整理解雇。募集の案内や社内の説明では、いろいろな呼び方が使われます。
          </p>
          <p className={p}>
            税の扱いという点では、この違いを気にする必要はありません。<strong>呼び方が違っても、退職に基因して一時に支払われるものであれば、退職所得として同じように計算します</strong>（所得税基本通達30-1）。解雇の予告に代えて支払われる解雇予告手当も、退職所得にあたります（同30-5）。
          </p>
          <p className={p}>
            ただし、<strong>税以外では違いが出ます。</strong>失業給付（雇用保険）は、会社都合と自己都合で給付日数と給付制限が変わります。これはこの記事では扱わず、別の記事で扱います。
          </p>
        </section>

        {/* 早期優遇の統計（本文50〜69行目） */}
        <section id="toukei">
          <h2 className={h2}>早期優遇で辞めた人は、平均でいくら受け取っているか</h2>
          <p className={p}>
            自分の割増額が多いのか少ないのかを知りたくなりますが、ここには限界があります。<strong>割増額そのものを調べた公表統計は見当たりません。</strong>分かるのは、退職事由ごとの退職給付額の平均です。
          </p>
          <p className={p}>
            次の表は、勤続20年以上かつ45歳以上で退職した人の1人平均退職給付額です。大学・大学院卒（管理・事務・技術職）の数値を使っています。<strong>月収換算</strong>とは、退職時の<strong>所定内賃金</strong>に対する退職給付額の割合のことです。所定内賃金とは、残業代や賞与を含まない、毎月決まって支払われる賃金を指します。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>退職事由</th>
                  <th className={thCls}>1人平均退職給付額</th>
                  <th className={thCls}>月収換算</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>定年</td>
                  <td className={tdCls}>18,960,000円</td>
                  <td className={tdCls}>36.0か月分</td>
                </tr>
                <tr>
                  <td className={tdCls}>会社都合</td>
                  <td className={tdCls}>17,380,000円</td>
                  <td className={tdCls}>27.9か月分</td>
                </tr>
                <tr>
                  <td className={tdCls}>自己都合</td>
                  <td className={tdCls}>14,410,000円</td>
                  <td className={tdCls}>30.3か月分</td>
                </tr>
                <tr>
                  <td className={tdCls}><strong>早期優遇</strong></td>
                  <td className={tdCls}><strong>22,660,000円</strong></td>
                  <td className={tdCls}><strong>39.9か月分</strong></td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            早期優遇は、4つの退職事由のうち<strong>最も金額が大きくなっています。</strong>定年との差は<strong>3,700,000円</strong>、月収換算では<strong>3.9か月分</strong>です。
          </p>
          <p className={p}>
            金額の順番と月収換算の順番が一致していない点に、気づかれたかもしれません。月収換算は、退職時の所定内賃金に対する割合です。<strong>退職事由によって、退職時の所定内賃金の水準が違います。</strong>そのため、金額の順番と月収換算の順番は一致しないことがあります。
          </p>
          <p className={p}>
            この数値の読み方には、注意が必要です。<strong>これは、早期優遇で退職した人と定年退職した人の、それぞれの平均です。</strong>同じ人が両方を選んだ場合の比較ではありません。勤続年数も役職も異なります。また、退職給付額には、年金形式で受け取る分の現在価値も含まれています。
          </p>
          <p className={p}>
            つまりこの表は、「早期優遇なら定年より3,700,000円多くもらえる」ことを示すものではありません。自分の割増額を判断する材料としては、次の章からの計算のほうが役に立ちます。
          </p>
        </section>

        {/* 退職所得控除は勤続年数だけで決まる（本文71〜97行目。2章の置換をL93相当に適用済み） */}
        <section id="kojo-and-kinzoku">
          <h2 className={h2}>退職所得控除は、勤続年数だけで決まります</h2>
          <p className={p}>
            <strong>退職所得控除</strong>とは、退職金から差し引ける金額のことです。この金額までなら税はかかりません。額を決めるのは、勤続年数だけです（所得税法30条3項）。
          </p>
          <ul className={ulCls}>
            <li>勤続20年以下の部分は、1年あたり<strong>400,000円</strong></li>
            <li>勤続20年を超える部分は、1年あたり<strong>700,000円</strong></li>
          </ul>
          <p className={p}>
            20年を超えると、1年あたりの増え方が400,000円から700,000円に上がります。長く勤めた人ほど、控除の伸び方が大きくなります。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>勤続年数</th>
                  <th className={thCls}>退職所得控除</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>20年</td>
                  <td className={tdCls}>8,000,000円</td>
                </tr>
                <tr>
                  <td className={tdCls}>30年</td>
                  <td className={tdCls}>15,000,000円</td>
                </tr>
                <tr>
                  <td className={tdCls}><strong>33年</strong></td>
                  <td className={tdCls}><strong>17,100,000円</strong></td>
                </tr>
                <tr>
                  <td className={tdCls}>34年</td>
                  <td className={tdCls}>17,800,000円</td>
                </tr>
                <tr>
                  <td className={tdCls}>35年</td>
                  <td className={tdCls}>18,500,000円</td>
                </tr>
                <tr>
                  <td className={tdCls}><strong>38年</strong></td>
                  <td className={tdCls}><strong>20,600,000円</strong></td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            基準ケースでは、55歳で早期退職すると勤続33年、定年まで勤めると勤続38年です。控除は17,100,000円と20,600,000円で、<strong>5年早く辞めると控除は3,500,000円減ります。</strong>
          </p>
          <p className={p}>
            早期退職の割増は「月給の何か月分」という形で示されることがあります。ここで1つ、混同しやすい点があります。
          </p>
          <p className={p}>
            <strong>割増の計算に使った期間や倍率は、勤続年数には影響しません。</strong>控除の計算に使う勤続年数は、実際に勤めた期間のままです（所得税基本通達30-6）。割増がどう決められても、それによって勤続年数が増えるわけではありません。割増の金額が増えるだけです。
          </p>
          <p className={p}>
            同じことは、退職日を早めた場合にも当てはまります。割増の条件がどれだけよくても、控除の計算に使う勤続年数は実際に勤めた期間で決まります。<strong>退職所得控除を増やす要素は、勤続年数のほかにありません。</strong>
          </p>
          <p className={p}>
            この点は、次の章の計算にそのまま効いてきます。<strong>割増を増やしても控除は増えないため、割増のうち控除を超えた部分には課税されます。</strong>
          </p>
        </section>

        {/* 割増の増える分と控除の減る分（本文99〜136行目） */}
        <section id="hikaku">
          <h2 className={h2}>割増の増える分と、控除の減る分を並べます</h2>
          <p className={p}>
            ここがこの記事の中心です。基準ケースで、早期退職した場合と定年まで勤めた場合を並べます。
          </p>
          <p className={p}>
            表の見方を先に説明します。<strong>控除後の残額</strong>は、退職金額から退職所得控除を引いた金額です。<strong>退職所得</strong>は、その残額の2分の1です。<strong>課税標準</strong>は、退職所得の1,000円未満を切り捨てた金額で、税率をかける対象になります。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}></th>
                  <th className={thCls}>早期退職（勤続33年）</th>
                  <th className={thCls}>定年まで（勤続38年）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>退職金額</td>
                  <td className={tdCls}>27,000,000円</td>
                  <td className={tdCls}>20,000,000円</td>
                </tr>
                <tr>
                  <td className={tdCls}>退職所得控除</td>
                  <td className={tdCls}>17,100,000円</td>
                  <td className={tdCls}>20,600,000円</td>
                </tr>
                <tr>
                  <td className={tdCls}>控除後の残額</td>
                  <td className={tdCls}>9,900,000円</td>
                  <td className={tdCls}>0円</td>
                </tr>
                <tr>
                  <td className={tdCls}>退職所得</td>
                  <td className={tdCls}>4,950,000円</td>
                  <td className={tdCls}>0円</td>
                </tr>
                <tr>
                  <td className={tdCls}>課税標準</td>
                  <td className={tdCls}>4,950,000円</td>
                  <td className={tdCls}>0円</td>
                </tr>
                <tr>
                  <td className={tdCls}>所得税（復興特別所得税を含む）</td>
                  <td className={tdCls}><strong>574,312円</strong></td>
                  <td className={tdCls}>0円</td>
                </tr>
                <tr>
                  <td className={tdCls}>住民税（10%）</td>
                  <td className={tdCls}><strong>495,000円</strong></td>
                  <td className={tdCls}>0円</td>
                </tr>
                <tr>
                  <td className={tdCls}><strong>税の合計</strong></td>
                  <td className={tdCls}><strong>1,069,312円</strong></td>
                  <td className={tdCls}><strong>0円</strong></td>
                </tr>
                <tr>
                  <td className={tdCls}><strong>手取り</strong></td>
                  <td className={tdCls}><strong>25,930,688円</strong></td>
                  <td className={tdCls}><strong>20,000,000円</strong></td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            定年まで勤めた場合、退職金20,000,000円に対して控除は20,600,000円です。<strong>控除が退職金を上回るため、税は0円です。</strong>手取りは20,000,000円そのままになります。
          </p>
          <p className={p}>
            早期退職の場合、退職金は27,000,000円に増えます。一方で控除は17,100,000円に減ります。両方が同時に動くため、控除後の残額は9,900,000円です。<strong>割増10,000,000円に対する税は1,069,312円</strong>。手元に残るのは<strong>8,930,688円</strong>という計算になります。
          </p>
          <p className={p}>
            では、割増がいくらあれば、定年まで勤めた場合を上回るのでしょうか。割増の額を変えて計算したものが次の表です。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>割増の額</th>
                  <th className={thCls}>早期退職の手取り</th>
                  <th className={thCls}>定年まで（20,000,000円）と比べて</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>3,000,000円</td>
                  <td className={tdCls}>19,780,978円</td>
                  <td className={tdCls}>少ない</td>
                </tr>
                <tr>
                  <td className={tdCls}><strong>3,240,000円</strong></td>
                  <td className={tdCls}><strong>20,002,852円</strong></td>
                  <td className={tdCls}>多い</td>
                </tr>
                <tr>
                  <td className={tdCls}>5,000,000円</td>
                  <td className={tdCls}>21,604,403円</td>
                  <td className={tdCls}>多い</td>
                </tr>
                <tr>
                  <td className={tdCls}>10,000,000円</td>
                  <td className={tdCls}>25,930,688円</td>
                  <td className={tdCls}>多い</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            割増が3,000,000円だと、手取りは定年まで勤めた場合を下回ります。<strong>割増が3,240,000円のとき、定年まで勤めた場合をわずかに上回ります</strong>（20,002,852円）。
          </p>
          <p className={p}>
            <strong>ただし、この3,240,000円は基準ケースの前提での金額です。</strong>誰にでも当てはまる分かれ目ではありません。割増の額、勤続年数、規程分の退職金のいずれかが変われば、この金額は動きます。自分の数字で計算し直す必要があります。
          </p>
          <p className={p}>
            自分の数字で確かめるときは、次の順に見ていくと整理できます。まず、定年まで勤めた場合の退職金の見込額を調べます。次に、早期退職した場合の勤続年数から、退職所得控除を計算します。そのうえで、規程分と割増を足した金額から、その控除を引きます。控除が退職金を上回るなら、その時点で税は0円です。上回らなければ、残った金額の2分の1が課税の対象になります。
          </p>
          <p className={p}>
            そして、もう1つ重要な点があります。<strong>この比較には、早く辞めた5年分の給与が入っていません。</strong>入っているのは退職金だけです。手取りが上回るかどうかは、応募を判断する材料の1つにすぎません。給与の5年分をどう見積もるか、退職後にどの程度の収入が見込めるかは、この表の外にあります。
          </p>
        </section>

        {/* 規程分だけなら税がかからない（本文138〜155行目） */}
        <section id="kitei-bun-nomi">
          <h2 className={h2}>規程分だけなら、税がかからない場合があります</h2>
          <p className={p}>
            基準ケースには、見落とされやすい特徴があります。<strong>規程分の退職金だけなら、税は0円です。</strong>
          </p>
          <p className={p}>
            規程分は17,000,000円で、勤続33年の退職所得控除は17,100,000円です。控除が退職金を上回るため、控除後の残額はありません。
          </p>
          <p className={p}>
            次の表は、規程分だけの場合と、割増を含む場合を並べたものです。どちらも勤続33年です。規程分だけなら17,000,000円、割増10,000,000円を含めると27,000,000円を受け取ります。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}></th>
                  <th className={thCls}>金額</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>規程分のみの税</td>
                  <td className={tdCls}><strong>0円</strong></td>
                </tr>
                <tr>
                  <td className={tdCls}>割増を含む場合の税</td>
                  <td className={tdCls}><strong>1,069,312円</strong></td>
                </tr>
                <tr>
                  <td className={tdCls}>割増に対する税</td>
                  <td className={tdCls}><strong>1,069,312円</strong></td>
                </tr>
                <tr>
                  <td className={tdCls}>割増のうち手元に残る額</td>
                  <td className={tdCls}><strong>8,930,688円</strong></td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            つまり、<strong>割増が加わって初めて課税されます。</strong>1,069,312円という税額は、規程分と割増に割り振られるものではありません。全額が割増によって発生したものです。
          </p>
          <p className={p}>
            この見方をすると、判断の材料が具体的になります。募集要項に書かれた割増10,000,000円のうち、実際に使えるのは8,930,688円です。<strong>割増の額をそのまま生活設計に組み込むと、1,069,312円分だけ多く見積もることになります。</strong>
          </p>
        </section>

        {/* 退職日が1か月違うと（本文157〜177行目） */}
        <section id="taishokubi">
          <h2 className={h2}>退職日が1か月違うと、手取りが106,470円変わります</h2>
          <p className={p}>退職日にも、控除を動かす力があります。</p>
          <p className={p}>
            <strong>勤続年数の1年未満の端数は、切り上げて1年として数えます</strong>（所得税法施行令69条2項）。32年11か月なら33年、33年1か月なら34年です。<strong>1か月の違いで、勤続年数が1年変わることがあります。</strong>
          </p>
          <p className={p}>
            勤続33年の控除は17,100,000円、勤続34年は17,800,000円です。<strong>控除の差は700,000円です。</strong>
          </p>
          <p className={p}>
            ここまでを見ると、退職日を1か月ずらすだけで700,000円の効果があるように見えます。ただし、手取りで見ると、そうはなりません。次の表は、いずれも27,000,000円を受け取る場合の比較です。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>勤務した期間</th>
                  <th className={thCls}>勤続年数</th>
                  <th className={thCls}>退職所得控除</th>
                  <th className={thCls}>手取り</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>32年11か月</td>
                  <td className={tdCls}>33年</td>
                  <td className={tdCls}>17,100,000円</td>
                  <td className={tdCls}>25,930,688円</td>
                </tr>
                <tr>
                  <td className={tdCls}>33年ちょうど</td>
                  <td className={tdCls}>33年</td>
                  <td className={tdCls}>17,100,000円</td>
                  <td className={tdCls}>25,930,688円</td>
                </tr>
                <tr>
                  <td className={tdCls}><strong>33年1か月</strong></td>
                  <td className={tdCls}><strong>34年</strong></td>
                  <td className={tdCls}><strong>17,800,000円</strong></td>
                  <td className={tdCls}><strong>26,037,158円</strong></td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>控除は700,000円増えますが、手取りの差は106,470円です。</strong>
          </p>
          <p className={p}>
            理由は、退職所得の計算方法にあります。退職所得は、控除後の残額の2分の1です。控除が700,000円増えると、残額は700,000円減り、退職所得はその半分だけ減ります。さらに、そこに税率をかけた分が税額の差になります。<strong>控除の増加額が、そのまま手取りの増加額になるわけではありません。</strong>
          </p>
          <p className={p}>
            したがって、この記事では「退職日を1か月ずらせば700,000円得をする」とは書きません。<strong>動くのは106,470円です。</strong>それでも確認する価値はあります。入社日と退職日を数えるだけで分かることだからです。
          </p>
        </section>

        {/* 自分の数字はどこに書いてあるか（本文179〜190行目）。
            本文の「**1. …**」形式の小見出しは、記事9・記事11・記事12と同じく h3 として実装する。 */}
        <section id="where-to-find">
          <h2 className={h2}>自分の数字はどこに書いてあるか</h2>
          <p className={p}>この記事の計算を自分の数字に置き換えるには、3つの情報が必要です。</p>
          <h3 className={h3}>1. 割増額と退職日</h3>
          <p className={p}>
            早期退職の募集要項に書かれています。退職日は、勤続年数の切り上げに関わるため、日付まで確認してください。
          </p>
          <h3 className={h3}>2. 規程分の退職金と、定年まで勤めた場合の見込額</h3>
          <p className={p}>
            退職金規程、社内の退職金試算のシステム、または人事部門で確認できます。<strong>この2つが揃わないと、比較そのものができません。</strong>
          </p>
          <h3 className={h3}>3. 勤続年数</h3>
          <p className={p}>入社日と退職日から数えます。1年未満の端数は切り上げます。</p>
          {/* 記事9のツールへの導線（本文の追記ではなく、テンプレート側の相互参照・駅1-5指示書3-3）。
              位置は「自分の数字はどこに書いてあるか」の章の末尾。読者が3つの情報を確認し終えた
              直後に置く（記事12と同じ考え方）。文言は指示書3-3のとおり一字一句。 */}
          <p className={`${p} mt-8`}>
            → 退職金額に割増を含めた金額を入れると、
            <Link href="/retirement/taishokukin-uketorikata" className={linkCls}>「退職金は一時金と年金どっちで受け取るか」</Link>
            の計算ツールで手取りを試せます。定年まで勤めた場合の金額でもう一度計算すると、この記事の比較ができます。
          </p>
        </section>

        {/* やらない方がいい人・扱わないこと（本文192〜210行目） */}
        <section id="cautions">
          <h2 className={h2}>やらない方がいい人と、この記事で扱わないこと</h2>
          <p className={p}>
            <strong>退職後の収入の見通しが立っていない人には、この記事の比較だけで判断することをおすすめできません。</strong>ここで比べているのは退職金だけです。<strong>早く辞めた5年分の給与は含まれていません。</strong>手取りが上回るという結果が出ても、その5年をどう暮らすかは別の問題です。
          </p>
          <p className={p}>
            <strong>勤続5年以下の人には、この記事の計算は当てはまりません。</strong>短期退職手当等にあたり、2分の1の計算に制限がかかります（所得税法30条2項・4項）。具体的な計算方法は、この記事では扱いません。
          </p>
          <p className={p}>
            <strong>役員の人にも、この記事の計算は当てはまらないことがあります。</strong>特定役員退職手当等にあたる場合、残額の2分の1にする計算が使えません（所得税法30条2項）。こちらも具体的な計算方法は扱いません。
          </p>
          <p className={p}>
            <strong>この記事の数字をそのまま自分に当てはめることも、おすすめできません。</strong>割増額、勤続年数、規程分の退職金のいずれかが変われば、結論の向きが変わります。3,240,000円という金額も、基準ケースのものです。
          </p>
          <h3 className={h3}>この記事で扱わないこと</h3>
          <ul className={ulCls}>
            <li><strong>失業給付（雇用保険）の扱い。</strong>会社都合か自己都合かで、給付日数と給付制限が変わります。別の記事で扱います</li>
            <li><strong>確定申告の要否と、「退職所得の受給に関する申告書」の出し方。</strong>別の記事で扱います</li>
            <li><strong>退職後の健康保険と年金の手続き。</strong>別の記事で扱います</li>
            <li>割増額の交渉方法、退職合意書の内容</li>
            <li>早期退職を断った場合の法的な扱い</li>
            <li>
              退職金を年金形式で受け取る場合。
              <Link href="/retirement/taishokukin-uketorikata" className={linkCls}>退職金は一時金と年金どっちで受け取るか</Link>
              と
              <Link href="/retirement/taishokukin-nenkin-kurisage" className={linkCls}>退職金を年金で受け取るなら、公的年金の受け取り開始年齢と一緒に決めます</Link>
              で扱っています
            </li>
            <li>
              iDeCo・企業型DCと近い時期に受け取る場合。
              <Link href="/retirement/ideco-taishokukin-juntan" className={linkCls}>iDeCoと退職金は、受け取る順番と間隔で手取りが変わります</Link>
              で扱っています
            </li>
          </ul>
        </section>

        {/* 出典（本文212〜223行目の10件を、本文中に番号を振らず末尾に一括で出す） */}
        <section id="sources" className="mt-10 scroll-mt-20">
          <h2 className="mb-3 text-[20px] font-bold text-slate-900">出典</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-slate-700">
            <li>所得税法 第30条（退職所得）</li>
            <li>所得税法施行令 第69条（退職所得控除額に係る勤続年数の計算）</li>
            <li>所得税基本通達 30-1（退職手当等の範囲）</li>
            <li>所得税基本通達 30-5（解雇予告手当）</li>
            <li>所得税基本通達 30-6（退職手当等の支払金額の計算の基礎となった期間と勤続年数との関係）</li>
            <li>国税通則法 第118条第1項（国税の課税標準の端数計算）</li>
            <li>地方税法 第20条の4の2第1項（課税標準額の端数計算）</li>
            <li>国税庁 タックスアンサー No.1420「退職金を受け取ったとき（退職所得）」</li>
            <li>国税庁「所得税の税率」（速算表）</li>
            <li>厚生労働省「令和5年就労条件総合調査」第22表</li>
          </ul>
          {/* 免責＋運営者導線は全記事共通のサイト定型（記事本文ではない）。記事9・記事11・記事12と同じ。
              本文の確定稿には免責文がないため追記せず、サイト共通の信頼導線のみを置く。 */}
          <h3 className="mt-6 text-[16px] font-bold text-slate-900">免責</h3>
          <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
            本記事は一般的な情報提供を目的とした試算であり、税務・投資に関する助言ではありません。実際の税額・社会保険料は、お住まいの自治体や個別の事情によって異なります。受け取り方を決める際は、勤め先の人事部門・企業年金基金、または税務署・税理士にご確認ください。
          </p>
          <p className="mt-4 text-[13px] text-slate-500">
            運営：{ORG_NAME}（
            <Link href="/company" className="text-blue-700 hover:underline">運営会社・お問い合わせ</Link>
            ／
            <Link href="/privacy" className="text-blue-700 hover:underline">プライバシーポリシー</Link>
            ／
            <Link href="/policy" className="text-blue-700 hover:underline">中立性ポリシー</Link>
            ）
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
