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
 * 記事9（/retirement/taishokukin-uketorikata）と同じ組み立て。
 *
 * この記事にツールは埋め込まない（駅1-2指示書2-3）。iDeCoの調整計算は後日
 * ツールv2（TaishokukinCalculator の拡張）に統合する方針のため、
 * 記事9のツールへのリンクを1本置くにとどめる。 */
const ARTICLE = getRetirementArticle('/retirement/ideco-taishokukin-juntan');

export const metadata = buildRetirementArticleMetadata(ARTICLE);

/* この記事はFAQ節を持たない（確定稿にFAQがない）。faqs を渡さないので
 * FAQPage ノードは生成されない（記事9と同じ）。 */
const jsonLd = buildRetirementArticleJsonLd({ article: ARTICLE });

/* ===== 目次（H2 と対応）=====
 * ツールへの導線は見出しではないため目次に載せない（2026-08-04 masato確定）。 */
const TOC: TocItem[] = [
  { id: 'deduction-basics', label: '退職所得控除は、受け取るたびにゼロから使えるわけではありません' },
  { id: 'order-and-years', label: '何年空ければよいかは、受け取る順番によって違います' },
  { id: 'transition', label: '改正はすでに適用されています' },
  { id: 'cases', label: 'どれだけ違うのか' },
  { id: 'overlap-calc', label: '収入が控除より少ないと、重複期間は短く計算されます' },
  { id: 'where-to-find', label: '自分の数字はどこに書いてあるか' },
  { id: 'cautions', label: 'やらない方がいい人と、この記事で扱わないこと' },
  { id: 'sources', label: '出典' },
];

const h2 = 'mt-10 scroll-mt-20 text-[20px] font-bold text-slate-900 sm:text-[22px]';
const h3 = 'mt-6 text-[16px] font-bold text-slate-900 sm:text-[17px]';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const note = 'mt-2 text-[13px] leading-relaxed text-slate-500';
const ulCls = 'mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700';
const linkCls = 'text-blue-700 underline hover:no-underline';

export default function IdecoTaishokukinJuntanPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <RetirementArticleHeader article={ARTICLE} />

        <Toc items={TOC} />

        {/* 導入（本文冒頭の3段落・H2なし） */}
        <p className={p}>
          勤続25年で退職金2,200万円、iDeCoに20年加入して一時金600万円を受け取る人がいるとします。この人が受け取り方を変えるだけで、手元に残る金額は<strong>952,419円</strong>変わります。
        </p>
        <p className={p}>
          金額そのものは1円も変わりません。変わるのは、受け取る順番と、2つの受け取りの間隔だけです。
        </p>
        <p className={p}>
          差を生んでいるのは、退職所得控除の使え方です。この記事では、その仕組みと、令和8年から変わったルールの正確な中身を、国税庁の説明にもとづいて確認します。
        </p>

        {/* 控除は受け取るたびにゼロからではない */}
        <section id="deduction-basics">
          <h2 className={h2}>退職所得控除は、受け取るたびにゼロから使えるわけではありません</h2>
          <p className={p}>
            <strong>退職所得控除</strong>とは、退職金を一時金で受け取るときに、税金の計算から差し引ける金額のことです。額は勤続年数だけで決まります。
          </p>
          <ul className={ulCls}>
            <li>勤続20年以下：<strong>40万円 × 勤続年数</strong>（80万円に満たない場合は80万円）</li>
            <li>勤続20年超：<strong>800万円 + 70万円 ×（勤続年数 − 20年）</strong></li>
          </ul>
          <p className={p}>1年未満の端数は、切り上げて1年として数えます。</p>
          <p className={p}>
            ここで押さえておく必要があるのが、<strong>iDeCoの一時金も、税の計算では退職所得として扱われる</strong>ことです。国税庁は、確定拠出年金法にもとづく<strong>老齢給付金</strong>として支給される一時金なども退職所得とみなされる、と説明しています（国税庁 No.1420）。老齢給付金とは、iDeCoや企業型DCで積み立てた資産を、受給できる年齢に達して受け取るときの給付のことです。
          </p>
          <p className={p}>
            つまり、退職金とiDeCoの一時金は、別々の制度から出るお金でありながら、同じ「退職所得」という箱の中で計算されます。
          </p>
          <p className={p}>
            そして、この控除は受け取るたびにゼロから使えるわけではありません。<strong>近い時期に2回受け取ると、勤続期間とiDeCoの加入期間が重なっている分だけ、後から受け取る方の控除が減ります。</strong>これを調整計算といいます。
          </p>
          <p className={p}>
            減る幅は小さくありません。この記事の例では、退職金の控除が2,060万円から1,460万円まで下がるケースが出てきます。
          </p>
        </section>

        {/* 何年空ければよいか */}
        <section id="order-and-years">
          <h2 className={h2}>何年空ければよいかは、受け取る順番によって違います</h2>
          <p className={p}>
            調整計算をするかどうかは、「前に受け取った退職手当等が、どれだけ前か」で決まります。そして遡る期間は、<strong>受け取る順番によって違います</strong>。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>受け取りの順番</th>
                  <th className={thCls}>遡る期間</th>
                  <th className={thCls}>世間の呼び方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>iDeCo等が先 → 退職金が後（<strong>令和8年1月1日以後</strong>に受け取ったiDeCo等）</td>
                  <td className={tdCls}><strong>前年以前9年内</strong></td>
                  <td className={tdCls}>10年ルール</td>
                </tr>
                <tr>
                  <td className={tdCls}>iDeCo等が先 → 退職金が後（<strong>令和8年1月1日前</strong>に受け取ったiDeCo等）</td>
                  <td className={tdCls}><strong>前年以前4年内</strong></td>
                  <td className={tdCls}>5年ルール</td>
                </tr>
                <tr>
                  <td className={tdCls}>退職金が先 → iDeCo等が後</td>
                  <td className={tdCls}><strong>前年以前19年内</strong></td>
                  <td className={tdCls}>20年ルール</td>
                </tr>
                <tr>
                  <td className={tdCls}>退職金 → 退職金</td>
                  <td className={tdCls}>前年以前4年内</td>
                  <td className={tdCls}>—</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={note}>（国税庁 No.2732）</p>
          <p className={p}>
            条文の書き方と、世間の呼び方の対応を確認しておきます。条文は「<strong>前年以前9年内</strong>」です。受け取る年の前年から数えて9年なので、空ける期間としては<strong>10年</strong>になります。「10年ルール」と呼ばれているのは、この9年内のことです。同じように、「5年ルール」は条文の「前年以前4年内」を指しています。
          </p>
          <p className={p}>順番による違いは、次の2点です。</p>
          <p className={p}>
            <strong>iDeCoを先に受け取る場合は、10年空ければ調整計算はありません。</strong>改正前は5年でしたが、令和8年1月1日以後に受け取る分から9年内に変わりました。
          </p>
          <p className={p}>
            <strong>退職金を先に受け取る場合は、前年以前19年内です。</strong>空ける期間としては20年になります。<strong>そして、こちらは今回改正されていません。</strong>iDeCoを後にする方が、必要な間隔ははるかに長いことになります。
          </p>
          <p className={p}>
            なお、退職金を2回受け取る場合（前の勤務先と今の勤務先など）は、前年以前4年内です。
          </p>
        </section>

        {/* 改正はすでに適用 */}
        <section id="transition">
          <h2 className={h2}>改正はすでに適用されています</h2>
          <p className={p}>
            9年内が適用されるのは、<strong>令和8年（2026年）1月1日以後に支払を受けたiDeCo等の一時金</strong>です。この日はすでに過ぎているため、<strong>これから受け取る人には9年内が適用されます。</strong>
          </p>
          <p className={p}>
            4年内が関係するのは、<strong>令和8年1月1日より前にiDeCo等の一時金を受け取り済みの人</strong>です。その分は、従来どおり4年内で判定されます。
          </p>
          <p className={p}>
            この違いは、金額として表れます。以下の例は、すべて次の前提で計算しています。
          </p>

          <blockquote className="mt-4 rounded-xl border-l-4 border-slate-300 bg-slate-50 p-4">
            <p className="text-[14px] font-bold text-slate-800">この記事の例に共通する前提</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-slate-700">
              <li>退職金は、勤続38年で2,000万円、または勤続25年で2,200万円</li>
              <li>iDeCoの一時金は600万円、加入期間は20年</li>
              <li><strong>この人は、勤続期間の中でiDeCoに20年間加入していたものとします</strong></li>
              <li>iDeCoの一時金と退職金以外の所得は考慮しない</li>
              <li>所得税には復興特別所得税を含む。住民税は10%（市町村民税6% + 道府県民税4%）</li>
              <li>iDeCoは一時金で受け取る（年金形式は扱いません）</li>
            </ul>
          </blockquote>

          <p className={p}>
            <strong>60歳でiDeCoを受け取り、65歳で退職金を受け取る（5年空け）</strong>という同じ受け取り方でも、iDeCoを受け取った時期によって結論が変わります。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>退職金の側</th>
                  <th className={thCls}>令和8年1月1日前にiDeCoを受け取っていた場合</th>
                  <th className={thCls}>令和8年1月1日以後に受け取った場合</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>勤続38年・2,000万円</td>
                  <td className={tdCls}>控除2,060万円（満額）→ 税<strong>0円</strong></td>
                  <td className={tdCls}>控除1,460万円 → 税<strong>446,122円</strong></td>
                </tr>
                <tr>
                  <td className={tdCls}>勤続25年・2,200万円</td>
                  <td className={tdCls}>控除1,150万円（満額）→ 税<strong>1,160,572円</strong></td>
                  <td className={tdCls}>控除550万円 → 税<strong>2,112,991円</strong></td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            改正前は、5年空ければ「前年以前4年内」の外に出るため、調整計算の対象になりませんでした。改正後は9年内に入るため、対象になります。<strong>受け取り方は同じで、時期が違うだけです。</strong>
          </p>
          <p className={p}>
            すでにiDeCoを受け取っている人は、その受取年月を確認してください。判定が変わります。
          </p>
        </section>

        {/* どれだけ違うのか */}
        <section id="cases">
          <h2 className={h2}>どれだけ違うのか</h2>
          <p className={p}>
            まず、退職金が控除の範囲に収まる人で、仕組みを見ます。<strong>勤続38年・退職金2,000万円・iDeCoの一時金600万円</strong>の場合です。
          </p>
          <p className={p}>
            単独で受け取るなら、退職金の控除は勤続38年で<strong>2,060万円</strong>、iDeCoの控除は加入20年で<strong>800万円</strong>です。どちらも受け取る金額を上回っています。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>ケース</th>
                  <th className={thCls}>iDeCoの税</th>
                  <th className={thCls}>退職金の控除</th>
                  <th className={thCls}>退職金の税</th>
                  <th className={thCls}>税の合計</th>
                  <th className={thCls}>手取り</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}><strong>A</strong> 60歳iDeCo → 65歳退職金（5年空け）</td>
                  <td className={tdCls}>0円</td>
                  <td className={tdCls}><strong>1,460万円</strong></td>
                  <td className={tdCls}>446,122円</td>
                  <td className={tdCls}><strong>446,122円</strong></td>
                  <td className={tdCls}>25,553,878円</td>
                </tr>
                <tr>
                  <td className={tdCls}><strong>B</strong> 60歳iDeCo → 70歳退職金（10年空け）</td>
                  <td className={tdCls}>0円</td>
                  <td className={tdCls}><strong>2,060万円</strong>（満額）</td>
                  <td className={tdCls}>0円</td>
                  <td className={tdCls}><strong>0円</strong></td>
                  <td className={tdCls}><strong>26,000,000円</strong></td>
                </tr>
                <tr>
                  <td className={tdCls}><strong>C</strong> 65歳退職金 → その後iDeCo</td>
                  <td className={tdCls}>425,912円</td>
                  <td className={tdCls}>2,060万円（満額）</td>
                  <td className={tdCls}>0円</td>
                  <td className={tdCls}><strong>425,912円</strong></td>
                  <td className={tdCls}>25,574,088円</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            3つとも、受け取る金額そのものは同じです。ケースBの手取り26,000,000円が、税が引かれる前の金額にあたります。
          </p>
          <p className={p}><strong>AとCはほぼ同じ水準で、Bだけが0円です。</strong></p>
          <p className={p}>
            <strong>ケースA</strong>では、iDeCoが「前年以前9年内」に入るため、調整計算が行われます。重複期間は15年と計算され（理由は次章）、その分の控除相当額600万円が差し引かれて、退職金の控除は2,060万円から<strong>1,460万円</strong>になります。控除が2,000万円を下回った結果、課税の対象が生まれます。
          </p>
          <p className={p}>
            課税退職所得は（2,000万円 − 1,460万円）× 1/2 で<strong>270万円</strong>です。所得税は 2,700,000円 × 10% − 97,500円 = 172,500円、これに復興特別所得税を含めて<strong>176,122円</strong>（1円未満切捨て）。住民税は 2,700,000円 × 10% = <strong>270,000円</strong>。<strong>税の合計は446,122円</strong>という計算になります。
          </p>
          <p className={p}>
            <strong>ケースB</strong>は、10年空けたことで調整計算がありません。退職金の控除は満額の2,060万円で、退職金2,000万円を上回ります。iDeCoの控除800万円も一時金600万円を上回ります。<strong>両方が満額の控除を使えるため、税は0円です。</strong>
          </p>
          <p className={p}>
            <strong>ケースC</strong>は、退職金が先です。退職金の控除は満額の2,060万円で税は0円ですが、後から受け取るiDeCoの側で調整が入ります。退職金の勤続期間から逆算した年数は37年で、iDeCoの加入期間20年をすべて含みます。そのためiDeCoの控除は800万円から<strong>0円</strong>まで削られ、最低額の<strong>80万円</strong>が適用されます。課税退職所得は（600万円 − 80万円）× 1/2 で<strong>260万円</strong>です。所得税は 2,600,000円 × 10% − 97,500円 = 162,500円、これに復興特別所得税を含めて<strong>165,912円</strong>。住民税は 2,600,000円 × 10% = <strong>260,000円</strong>。<strong>税の合計は425,912円</strong>という計算になります。
          </p>
          <p className={p}>
            次に、<strong>退職金が控除を超える人</strong>——冒頭に挙げた勤続25年・退職金2,200万円の人を見ます。控除が減った影響が、より大きく出ます。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>ケース</th>
                  <th className={thCls}>退職金の控除</th>
                  <th className={thCls}>課税退職所得</th>
                  <th className={thCls}>所得税</th>
                  <th className={thCls}>住民税</th>
                  <th className={thCls}>税の合計</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}><strong>A</strong> 5年空け（調整あり）</td>
                  <td className={tdCls}><strong>550万円</strong></td>
                  <td className={tdCls}>825万円</td>
                  <td className={tdCls}>1,287,991円</td>
                  <td className={tdCls}>825,000円</td>
                  <td className={tdCls}><strong>2,112,991円</strong></td>
                </tr>
                <tr>
                  <td className={tdCls}><strong>B</strong> 10年空け（調整なし）</td>
                  <td className={tdCls}><strong>1,150万円</strong>（満額）</td>
                  <td className={tdCls}>525万円</td>
                  <td className={tdCls}>635,572円</td>
                  <td className={tdCls}>525,000円</td>
                  <td className={tdCls}><strong>1,160,572円</strong></td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            所得税の計算は、Aが 8,250,000円 × 23% − 636,000円 = 1,261,500円 に復興特別所得税を含めて1,287,991円、Bが 5,250,000円 × 20% − 427,500円 = 622,500円 に復興特別所得税を含めて635,572円です。
          </p>
          <p className={p}>
            <strong>AとBの差は952,419円です。</strong>どちらもiDeCoの税は0円なので（加入20年の控除800万円が一時金600万円を上回るため）、この差がそのまま手取りの差になります。冒頭に挙げた金額はこれです。
          </p>
          <p className={p}>
            なお、この1,160,572円は、令和8年1月1日前にiDeCoを受け取っていた場合の税額と同じです。どちらも控除が満額使えるためで、<strong>「10年空ける」と「改正前に受け取っていた」は、結果として同じ位置にあります。</strong>
          </p>
        </section>

        {/* 重複期間の逆算 */}
        <section id="overlap-calc">
          <h2 className={h2}>収入が控除より少ないと、重複期間は短く計算されます</h2>
          <p className={p}>ケースAで、重複期間が15年になった理由を説明します。</p>
          <p className={p}>
            国税庁の説明では、<strong>前の退職手当等の収入金額が、その期間に対応する控除額に満たない場合、収入金額から逆算した年数を重複期間とみなす</strong>とされています。逆算の算式は次のとおりです。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>前の退職手当等の収入金額</th>
                  <th className={thCls}>算式</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>800万円以下</td>
                  <td className={tdCls}>収入金額 ÷ 40万円</td>
                </tr>
                <tr>
                  <td className={tdCls}>800万円超</td>
                  <td className={tdCls}>（収入金額 − 800万円）÷ 70万円 + 20</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>1未満の端数は切り捨てます。</p>
          <p className={p}>
            ケースAでは、先に受け取ったiDeCoの一時金が600万円です。800万円以下なので、上の段の算式を使います。
          </p>
          <p className={`${p} font-bold`}>600万円 ÷ 40万円 = 15年</p>
          <p className={p}>
            この15年が重複期間とみなされます。そして、この15年に対応する控除額 <strong>15年 × 40万円 = 600万円</strong> が、後から受け取る退職金の控除から差し引かれます。2,060万円 − 600万円 = 1,460万円 という計算です。
          </p>
          <p className={p}>
            <strong>この逆算は、受け取る側に有利に働くことがあります。</strong>この人のiDeCoの加入期間は20年ですが、重複期間として使われるのは15年です。実際の加入期間より5年分短く計算されるため、退職金の控除の目減りもその分小さくなります。
          </p>
          <p className={p}>
            一方、ケースCでは逆になりました。先に受け取った退職金2,000万円は800万円を超えるため、下の段の算式で逆算すると37年です。これはiDeCoの加入期間20年をすべて含むので、重複期間は20年、つまり加入期間の全部になります。<strong>先に受け取る金額が大きいほど、逆算される年数は長くなり、後から受け取る方の控除は削られやすくなります。</strong>
          </p>
        </section>

        {/* 記事9のツールへの導線（本文ではなくテンプレート側の相互参照・駅1-2指示書2-3）。
            この記事にツールは埋め込まないため、「自分の数字はどこに書いてあるか」の直前に置く。 */}
        <p className={`${p} mt-8`}>
          → 退職金そのものの受け取り方(一時金・年金・併用)の手取り比較は、
          <Link href="/retirement/taishokukin-uketorikata" className={linkCls}>「退職金は一時金と年金どっちで受け取るか」</Link>の計算ツールで試せます。
        </p>

        {/* 自分の数字はどこに書いてあるか */}
        <section id="where-to-find">
          <h2 className={h2}>自分の数字はどこに書いてあるか</h2>
          <p className={p}>この記事の計算を自分の数字に置き換えるには、3つの情報が必要です。</p>
          <h3 className={h3}>1. iDeCoの加入期間と、一時金の見込額</h3>
          <p className={p}>
            運営管理機関（証券会社など）の口座画面で確認できます。年1回届く「取引状況のお知らせ」にも記載されています。控除の額を決めるのは加入期間なので、両方が必要です。
          </p>
          <h3 className={h3}>2. 退職金の額と勤続年数</h3>
          <p className={p}>
            退職金規程、または会社から届く選択届に記載されています。記載がなければ人事部門に確認してください。
          </p>
          <h3 className={h3}>3. すでに受け取ったiDeCo等がある場合は、その受取年月</h3>
          <p className={p}>
            経過措置の判定に使います。令和8年1月1日より前か後かで、遡る期間が4年内か9年内かに分かれます。年だけでなく月まで確認してください。
          </p>
        </section>

        {/* やらない方がいい人・扱わないこと */}
        <section id="cautions">
          <h2 className={h2}>やらない方がいい人と、この記事で扱わないこと</h2>
          <p className={p}>
            <strong>何も確認せずに、60歳でiDeCoを受け取り、その数年後に退職金を受け取ることは、おすすめできません。</strong>控除が重なって目減りするためです。勤続25年・退職金2,200万円の例では、5年空けと10年空けで税が952,419円変わる計算になりました。少なくとも、自分の勤続年数と控除額を確認してから決める必要があります。
          </p>
          <p className={p}>
            <strong>逆に、10年空けるためだけに受け取りを遅らせることも、おすすめできません。</strong>iDeCoは受け取りを遅らせている間も運用が続きますが、口座管理手数料もかかり続けます。また、iDeCoの受給開始には年齢の上限があります。この記事は税の観点だけを扱っており、これらの費用や期限は計算に含めていません。税で得られる差と、遅らせることで生じる費用や制約を、あわせて確認してください。
          </p>
          <h3 className={h3}>この記事で扱わないこと</h3>
          <ul className={ulCls}>
            <li>iDeCoを年金形式で受け取る場合（公的年金等の雑所得となり、計算が変わります）</li>
            <li>企業型DCと企業年金（DB）を併せて受け取る場合</li>
            <li>受給開始の年齢上限や口座管理手数料など、税以外の判断材料</li>
            <li>勤続5年以下の場合、および役員等の場合の取り扱い</li>
          </ul>
          <p className={p}>いずれも、この記事の計算をそのまま当てはめないでください。</p>
          {/* 本文が記事9を名指ししている箇所。B案（2026-08-04 masato確定）でリンクにする。
              文言は本文のまま・リンクを張るだけで、語句は一切変えていない。 */}
          <p className={p}>
            なお、退職金そのものを一時金と年金のどちらで受け取るかは、別の記事
            <Link href="/retirement/taishokukin-uketorikata" className={linkCls}>「退職金は一時金と年金どっちで受け取るか」</Link>
            で扱っています。この記事は、そこで「別の記事で扱います」とした、iDeCo・企業型DCとの控除の調整にあたります。
          </p>
        </section>

        {/* 出典 */}
        <section id="sources" className="mt-10 scroll-mt-20">
          <h2 className="mb-3 text-[20px] font-bold text-slate-900">出典</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-slate-700">
            <li>国税庁 タックスアンサー No.1420「退職金を受け取ったとき（退職所得）」</li>
            <li>国税庁 タックスアンサー No.2732「退職手当等に対する源泉徴収」</li>
            <li>地方税法 第328条の3・第50条の4（退職所得の分離課税の税率）</li>
          </ul>
          {/* 免責＋運営者導線は全記事共通のサイト定型（記事本文ではない）。記事9と同じブロック。 */}
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
