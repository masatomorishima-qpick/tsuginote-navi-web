import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import LoanCalculator from '@/components/loan/LoanCalculator';
import {
  ArticleHeader, Toc, FaqSection, SourcesAndDisclaimer, TableScroll,
  buildArticleJsonLd, buildArticleMetadata, tableCls, thCls, tdCls,
  type Faq, type TocItem,
} from '@/components/loan/LoanArticle';
import { getLoanArticle } from '@/lib/loan/articles';

/* ===== メタ情報 =====
 * 実体は lib/loan/articles.ts（レジストリ）が持つ。ここでは参照するだけ。 */
const ARTICLE = getLoanArticle('/loan/hendo-kotei');
const PAGE_PATH = ARTICLE.path;

/* metadata（canonical / OGP / Twitter / OGP画像）はテンプレート側で組み立てる。
 * 記事ごとに画像や日付書式を書かないための共通化。 */
export const metadata = buildArticleMetadata(ARTICLE);

/* ===== 目次（H2 と対応） ===== */
const TOC: TocItem[] = [
  { id: 'conclusion', label: '結論：変動と固定、いまどちらを選ぶべきか' },
  { id: 'for-whom', label: 'この記事は「すでに変動金利で借りている人」向けです' },
  { id: 'situation', label: '住宅ローンの変動金利と固定金利、いま何が起きているか' },
  { id: 'actual-amount', label: '「金利が倍になった」は、実額でいくらなのか' },
  { id: 'if-rate-rises', label: '変動のまま金利が上がったら、返済はいくら増えるのか' },
  { id: 'switch-cost', label: 'いま固定に切り替えると、月々いくら増えるのか' },
  { id: 'break-even', label: '変動と固定の損益分岐点はどこか' },
  { id: 'years-left', label: '変動と固定、残りの年数で答えは変わる' },
  { id: 'five-year-rule', label: '「返済額が増えていないから大丈夫」は危険な場合があります' },
  { id: 'who-should', label: '変動のままでいい人・固定に変えた方がいい人' },
  { id: 'refinance-needed', label: '固定に変えるには借り換えが必要です' },
  { id: 'calculator', label: '変動と固定を自分の数字で比べる（計算ツール）' },
  { id: 'faq', label: '住宅ローンの変動と固定に関するよくある質問' },
  { id: 'sources', label: 'この記事の前提と出典' },
];

/* ===== FAQ（表示と JSON-LD の両方をここから作る） ===== */
const FAQS: Faq[] = [
  {
    q: '変動金利は今後どこまで上がりますか？',
    a: '正確に予測することは誰にもできません。参考として、日本銀行が2026年3月に公表した推計では、景気を過熱も冷却もさせない金利水準（中立金利）は1.1〜2.5%程度とされていますが、専門家の間でも見方には幅があります。この記事では予測ではなく、「何%まで上がったら判断が変わるか」という分岐点を示しています。',
  },
  {
    q: 'いま固定にすると、金利が高いときに借りることになりませんか？',
    a: '固定金利は長期金利（10年国債利回り）に連動します。2026年6月末の長期金利は2.69%と、1年前より1.2%以上高い水準です。歴史的に見れば高い水準にあることは事実です。ただし、変動金利がこれから上がる可能性も同時にあるため、どちらが結果的に高かったかは後になってしか分かりません。いま判断できるのは、上の分岐点を自分の数字で計算することだけです。',
  },
  {
    q: '一部だけ固定にすることはできますか？',
    a: '金融機関によっては、借入を変動と固定に分ける「ミックスローン」を扱っています。どちらかに決めきれない場合の選択肢になりますが、取り扱いのない金融機関もあります。',
  },
  {
    q: '借り換えずに、いまの銀行で金利タイプを変更できますか？',
    a: '金融機関によっては、変動から固定期間選択型への変更を受け付けている場合があります。手数料が借り換えより低く済むことが多いので、まず現在の借入先に確認する価値があります。ただし全期間固定へ変更できるケースは限られます。',
  },
  {
    q: '5年ルールがあるかどうかは、どこで確認できますか？',
    a: '金銭消費貸借契約書、または借入先のウェブサイトの商品説明で確認できます。分からない場合は借入先に問い合わせてください。',
  },
];

const jsonLd = buildArticleJsonLd({ article: ARTICLE, faqs: FAQS });

const h2 = 'mt-10 scroll-mt-20 text-[20px] font-bold text-slate-900 sm:text-[22px]';
const h3 = 'mt-6 text-[16px] font-bold text-slate-900 sm:text-[17px]';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const note = 'mt-2 text-[13px] leading-relaxed text-slate-500';

export default function HendoKoteiPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <ArticleHeader article={ARTICLE} />

        <Toc items={TOC} />

        {/* 結論 */}
        <section id="conclusion">
          <h2 className={h2}>結論：変動と固定、いまどちらを選ぶべきか</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700">
            <li>2026年7月時点で、変動金利は年1%前後、全期間固定（フラット35）は年3.14%。<strong>その差はおよそ2.1%</strong>です。</li>
            <li>いま固定に切り替えると、<strong>月々の返済は2万〜4万円増えます</strong>（残高3,000万円・残り30年で約+3.2万円）。</li>
            <li><strong>変動金利が年3.3%前後まで上がり、それが完済まで続く場合に、いま固定へ切り替えた方が総支払額は少なくなります</strong>（借り換え費用を含む試算）。そこまで上がらなければ、変動のままの方が総支払額は少なくなります。</li>
            <li>この分岐点は<strong>残りの返済年数によって変わります</strong>。残り10年なら約3.7%、残り30年なら約3.3%です。<strong>残りが短い人ほど、切り替えのメリットは出にくくなります。</strong></li>
          </ul>
        </section>

        {/* 対象読者 */}
        <section id="for-whom">
          <h2 className={h2}>この記事は「すでに変動金利で借りている人」向けです</h2>
          <p className={p}>「変動と固定どちらがいいか」という問いは、実は2つに分かれます。</p>
          <p className={p}><strong>これから借りる人</strong>は、金利タイプを選ぶだけで、費用はかかりません。</p>
          <p className={p}>
            <strong>すでに変動で借りている人</strong>が固定に変えるには、<strong>借り換え</strong>が必要です。事務手数料や登記費用がかかり、審査もあります。つまり同じ「変動か固定か」でも、<strong>判断の材料がまったく違います</strong>。
          </p>
          <p className={p}>この記事は後者、<strong>すでに変動金利で借りていて、このままでいいのか迷っている人</strong>に向けて書いています。</p>
        </section>

        {/* 現況 */}
        <section id="situation">
          <h2 className={h2}>住宅ローンの変動金利と固定金利、いま何が起きているか</h2>

          <h3 className={h3}>変動型を選ぶ人が減り始めています</h3>
          <p className={p}>
            住宅金融支援機構の「住宅ローン利用者の実態調査」（2026年1月調査／2025年4〜9月に借入した1,237人が対象）によると、金利タイプは変動型が75.0%で最も多いものの、<strong>前回2025年4月調査の79.0%から4.0ポイント減少</strong>しました。一方で固定期間選択型は14.9%（2.7ポイント増）、全期間固定型は10.1%（1.3ポイント増）と、どちらも増えています。
          </p>
          <p className={p}>長く「変動一択」に近い状況が続いていましたが、変動を選ぶ人が減り始めています。</p>

          <h3 className={h3}>きっかけは2025年12月の日銀の政策変更</h3>
          <p className={p}>
            同機構が2026年1月に実施した利用予定者への調査では、<strong>2025年12月の日本銀行の金融政策変更（利上げ）などを受けて、約7割弱が住宅ローンの選び方を見直した</strong>と回答しています。見直しの内容は、借入額を減らす、返済期間を短くする、固定金利タイプへ変更する、などです。
          </p>

          <h3 className={h3}>すでに借りている人は、負担増を実感しています</h3>
          <p className={p}>
            同機構が2025年10月に実施した既存借入者（2024年度以前に借りた人）への調査では、<strong>4割近くが物価上昇によって返済の負担が増したと回答</strong>しており、<strong>その傾向は変動金利タイプの利用者で特に強く</strong>出ています。
          </p>
          <p className={p}>
            あわせて同調査は、<strong>借入時点では金利変動リスクへの認識が薄く、金利の変動が返済額に影響するという理解も不足していた</strong>ことを指摘しています。
          </p>

          <h3 className={h3}>なぜ、借りたときより金利が上がっているのか</h3>
          <p className={p}>
            変動金利は「基準金利－引き下げ幅（優遇幅）」で決まります。優遇幅は契約時に決まり、その後は変わりません。一方で基準金利は市場金利に連動して動きます。
          </p>
          <p className={p}>
            つまり<strong>基準金利が上がると、その分だけ自分の適用金利も上がります</strong>。契約時に0.5%だった人は、基準金利が0.5%上がれば1.0%になります。「金利が倍になった」と感じるのはこのためです。
          </p>

          <h3 className={h3}>変動金利と固定金利の現在の水準</h3>
          <p className={p}>
            長期金利（10年国債利回り）は2026年6月30日時点で2.69%と、1年前より1.2%以上高い水準にあります。これを受けてフラット35の金利は2026年7月に3.14%（物件価格の9割以下を借りる場合・返済期間21〜35年）となりました。前月の3.21%からはわずかに下がっていますが、高い水準が続いています。
          </p>
          <p className={p}>
            変動金利は、ネット銀行で年0.9〜1.0%台、ソニー銀行1.347%、楽天銀行1.500%（いずれも2026年7月・新規借入）といった水準で、<strong>2026年に入ってから1%を超える銀行が増えています</strong>。
          </p>

          <blockquote className="mt-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-4">
            <p className="text-[14px] font-bold text-slate-800">参考：当サイトの診断利用者の場合</p>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-700">
              当サイトで住宅ローンの診断をされた方（n=35・自己申告）では、変動金利を利用している方が26人、固定が9人でした。変動の方の金利は0.70〜1.90%に分布し、<strong>最も多いのは1.0〜1.5%の帯（20人）</strong>。平均は1.153%でした。残高の平均は2,587万円、残りの返済年数の平均は28.8年です。
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
              ※少人数の自己申告データであり、統計的な代表性はありません。この記事の試算は下記の代表ケースにもとづいています。
            </p>
          </blockquote>
        </section>

        {/* 実額 */}
        <section id="actual-amount">
          <h2 className={h2}>「金利が倍になった」は、実額でいくらなのか</h2>
          <p className={p}>
            この記事を書いている運営者自身も、変動金利で住宅ローンを借りています。契約時に0.5%だった金利は、現在1.0%になりました。
          </p>
          <p className={p}>金利が0.5%から1.0%になった場合、率で見れば「倍」ですが、実際の負担増は次のとおりです。</p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>残高</th>
                  <th className={thCls}>残り年数</th>
                  <th className={thCls}>0.5%のとき</th>
                  <th className={thCls}>1.0%になった後</th>
                  <th className={thCls}>月々の増加</th>
                  <th className={thCls}>総額の増加</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>30年</td><td className={tdCls}>59,838円</td><td className={tdCls}>64,328円</td><td className={tdCls}>+4,490円</td><td className={tdCls}>+162万円</td></tr>
                <tr><td className={tdCls}>3,000万円</td><td className={tdCls}>20年</td><td className={tdCls}>131,380円</td><td className={tdCls}>137,968円</td><td className={tdCls}>+6,588円</td><td className={tdCls}>+158万円</td></tr>
                <tr><td className={tdCls}>3,000万円</td><td className={tdCls}>30年</td><td className={tdCls}>89,757円</td><td className={tdCls}>96,492円</td><td className={tdCls}>+6,735円</td><td className={tdCls}>+242万円</td></tr>
                <tr><td className={tdCls}>4,000万円</td><td className={tdCls}>30年</td><td className={tdCls}>119,676円</td><td className={tdCls}>128,656円</td><td className={tdCls}>+8,980円</td><td className={tdCls}>+323万円</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            「倍になった」と聞くと大きく感じ、「0.5%上がっただけ」と聞くと小さく感じます。<strong>実額で見ると、3,000万円・残り30年の人で月6,735円、完済までの総額では242万円の増加</strong>です。判断するときは、率ではなく実額で見てください。
          </p>
        </section>

        {/* 金利上昇 */}
        <section id="if-rate-rises">
          <h2 className={h2}>変動のまま金利が上がったら、返済はいくら増えるのか</h2>
          <p className={p}>
            まず「動かない場合」のリスクを数字にします。現在の適用金利を年1.0%として、そこから金利が上がった場合の毎月の返済額です。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>残高</th>
                  <th className={thCls}>残り年数</th>
                  <th className={thCls}>現在（1.0%）</th>
                  <th className={thCls}>2.0%になったら</th>
                  <th className={thCls}>3.0%になったら</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>10年</td><td className={tdCls}>175,208円</td><td className={tdCls}>184,027円（+8,819円）</td><td className={tdCls}>193,121円（+17,913円）</td></tr>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>20年</td><td className={tdCls}>91,979円</td><td className={tdCls}>101,177円（+9,198円）</td><td className={tdCls}>110,920円（+18,941円）</td></tr>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>30年</td><td className={tdCls}>64,328円</td><td className={tdCls}>73,924円（+9,596円）</td><td className={tdCls}>84,321円（+19,993円）</td></tr>
                <tr><td className={tdCls}>3,000万円</td><td className={tdCls}>10年</td><td className={tdCls}>262,812円</td><td className={tdCls}>276,040円（+13,228円）</td><td className={tdCls}>289,682円（+26,870円）</td></tr>
                <tr className="bg-amber-50"><td className={tdCls}><strong>3,000万円</strong></td><td className={tdCls}><strong>30年</strong></td><td className={tdCls}><strong>96,492円</strong></td><td className={tdCls}><strong>110,886円（+14,394円）</strong></td><td className={tdCls}><strong>126,481円（+29,989円）</strong></td></tr>
                <tr><td className={tdCls}>3,000万円</td><td className={tdCls}>20年</td><td className={tdCls}>137,968円</td><td className={tdCls}>151,765円（+13,797円）</td><td className={tdCls}>166,379円（+28,411円）</td></tr>
                <tr><td className={tdCls}>4,000万円</td><td className={tdCls}>10年</td><td className={tdCls}>350,416円</td><td className={tdCls}>368,054円（+17,637円）</td><td className={tdCls}>386,243円（+35,826円）</td></tr>
                <tr><td className={tdCls}>4,000万円</td><td className={tdCls}>20年</td><td className={tdCls}>183,958円</td><td className={tdCls}>202,353円（+18,396円）</td><td className={tdCls}>221,839円（+37,881円）</td></tr>
                <tr><td className={tdCls}>4,000万円</td><td className={tdCls}>30年</td><td className={tdCls}>128,656円</td><td className={tdCls}>147,848円（+19,192円）</td><td className={tdCls}>168,642円（+39,986円）</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={note}>※毎月の返済額が一定になる返し方（元利均等返済）、ボーナス払いなしで試算しています。</p>
          <p className={p}>
            金利が1%上がると、月々の負担はおおむね<strong>残高1,000万円あたり4,500〜4,800円</strong>増えます。残高3,000万円なら約1万4,000円、4,000万円なら約1万9,000円です。
          </p>
        </section>

        {/* 固定に切り替えた場合 */}
        <section id="switch-cost">
          <h2 className={h2}>いま固定に切り替えると、月々いくら増えるのか</h2>
          <p className={p}>次に「動く場合」のコストです。現在の変動1.0%から、フラット35の3.14%に借り換えた場合の比較です。</p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>残高</th>
                  <th className={thCls}>残り年数</th>
                  <th className={thCls}>変動1.0%のまま</th>
                  <th className={thCls}>固定3.14%に変更</th>
                  <th className={thCls}>月々の差</th>
                  <th className={thCls}>総支払額の差</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>10年</td><td className={tdCls}>175,208円</td><td className={tdCls}>194,417円</td><td className={tdCls}>+19,208円</td><td className={tdCls}>+231万円</td></tr>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>20年</td><td className={tdCls}>91,979円</td><td className={tdCls}>112,326円</td><td className={tdCls}>+20,348円</td><td className={tdCls}>+488万円</td></tr>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>30年</td><td className={tdCls}>64,328円</td><td className={tdCls}>85,838円</td><td className={tdCls}>+21,511円</td><td className={tdCls}>+774万円</td></tr>
                <tr><td className={tdCls}>3,000万円</td><td className={tdCls}>10年</td><td className={tdCls}>262,812円</td><td className={tdCls}>291,625円</td><td className={tdCls}>+28,813円</td><td className={tdCls}>+346万円</td></tr>
                <tr><td className={tdCls}>3,000万円</td><td className={tdCls}>20年</td><td className={tdCls}>137,968円</td><td className={tdCls}>168,490円</td><td className={tdCls}>+30,521円</td><td className={tdCls}>+733万円</td></tr>
                <tr className="bg-amber-50"><td className={tdCls}><strong>3,000万円</strong></td><td className={tdCls}><strong>30年</strong></td><td className={tdCls}><strong>96,492円</strong></td><td className={tdCls}><strong>128,758円</strong></td><td className={tdCls}><strong>+32,266円</strong></td><td className={tdCls}><strong>+1,162万円</strong></td></tr>
                <tr><td className={tdCls}>4,000万円</td><td className={tdCls}>10年</td><td className={tdCls}>350,416円</td><td className={tdCls}>388,833円</td><td className={tdCls}>+38,417円</td><td className={tdCls}>+461万円</td></tr>
                <tr><td className={tdCls}>4,000万円</td><td className={tdCls}>20年</td><td className={tdCls}>183,958円</td><td className={tdCls}>224,653円</td><td className={tdCls}>+40,695円</td><td className={tdCls}>+977万円</td></tr>
                <tr><td className={tdCls}>4,000万円</td><td className={tdCls}>30年</td><td className={tdCls}>128,656円</td><td className={tdCls}>171,677円</td><td className={tdCls}>+43,021円</td><td className={tdCls}>+1,549万円</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={note}>※総支払額の差は借り換え費用を含みません。※変動金利が1.0%のまま完済まで変わらないと仮定した場合の比較です。</p>
          <p className={p}>
            <strong>固定に変えるということは、この差額を払って、金利が上がっても返済額が変わらない状態にする、ということです。</strong>
          </p>
        </section>

        {/* 損益分岐点 */}
        <section id="break-even">
          <h2 className={h2}>変動と固定の損益分岐点はどこか</h2>
          <p className={p}>
            では、変動金利が何%まで上がったら、いま固定に変えた方が得だったことになるのか。借り換え費用（内訳は後述。合計で借入額の約2.6%＋9万円程度と概算）を含めて計算しました。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>残高</th>
                  <th className={thCls}>残り年数</th>
                  <th className={thCls}>借り換え費用の概算</th>
                  <th className={thCls}>分岐となる変動金利</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>10年</td><td className={tdCls}>約61万円</td><td className={tdCls}><strong>3.69%</strong></td></tr>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>20年</td><td className={tdCls}>約61万円</td><td className={tdCls}><strong>3.39%</strong></td></tr>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>30年</td><td className={tdCls}>約61万円</td><td className={tdCls}><strong>3.30%</strong></td></tr>
                <tr><td className={tdCls}>3,000万円</td><td className={tdCls}>10年</td><td className={tdCls}>約87万円</td><td className={tdCls}><strong>3.66%</strong></td></tr>
                <tr><td className={tdCls}>3,000万円</td><td className={tdCls}>20年</td><td className={tdCls}>約87万円</td><td className={tdCls}><strong>3.38%</strong></td></tr>
                <tr className="bg-amber-50"><td className={tdCls}><strong>3,000万円</strong></td><td className={tdCls}><strong>30年</strong></td><td className={tdCls}><strong>約87万円</strong></td><td className={tdCls}><strong>3.29%</strong></td></tr>
                <tr><td className={tdCls}>4,000万円</td><td className={tdCls}>10年</td><td className={tdCls}>約113万円</td><td className={tdCls}><strong>3.65%</strong></td></tr>
                <tr><td className={tdCls}>4,000万円</td><td className={tdCls}>20年</td><td className={tdCls}>約113万円</td><td className={tdCls}><strong>3.37%</strong></td></tr>
                <tr><td className={tdCls}>4,000万円</td><td className={tdCls}>30年</td><td className={tdCls}>約113万円</td><td className={tdCls}><strong>3.28%</strong></td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>読み方</strong>：変動金利がこの水準まで上がり、それが完済まで続いた場合に、いま固定へ切り替えた方が総支払額は少なくなります。そこまで上がらなければ、変動のままの方が総支払額は少なくなります。
          </p>
          <p className={p}>
            いまの変動金利が1.0%前後であることを踏まえると、<strong>分岐点までにはおよそ2.3〜2.7%の上昇余地があります</strong>。なお、現在の適用金利が1.5%の人であれば、上昇余地は約1.8〜2.2%と小さくなります。<strong>自分の金利が高いほど、固定に切り替える判断は近づきます。</strong>
          </p>
        </section>

        {/* 残り年数 */}
        <section id="years-left">
          <h2 className={h2}>変動と固定、残りの年数で答えは変わる</h2>
          <p className={p}>上の表で注目してほしいのは、<strong>残り年数が短いほど分岐点が高くなる</strong>ことです。</p>
          <p className={p}>
            残り30年なら分岐は約3.3%ですが、<strong>残り10年では約3.7%</strong>まで上がります。理由は単純で、借り換え費用は残り年数に関係なくかかるのに対し、金利差による節約効果は残り年数が短いほど小さくなるからです。
          </p>
          <p className={p}>つまり——</p>
          <p className={p}>
            <strong>残りの返済期間が短い人ほど、いま固定に切り替えるメリットは出にくくなります。</strong> 残り10年で残高2,000万円の人が固定に変えると、月々は約1万9,000円増え、費用も約61万円かかりますが、変動が3.69%まで上がらなければ、その支出は回収できません。
          </p>
          <p className={p}>
            <strong>逆に残り期間が長い人ほど、金利上昇の影響を長く受けます。</strong> 残り30年・残高4,000万円の人は、金利が2%上がるだけで月々の負担が約4万円増えます。安心を得るために支払う判断に合理性が出やすいのはこちらです。
          </p>
        </section>

        {/* 5年ルール */}
        <section id="five-year-rule">
          <h2 className={h2}>「返済額が増えていないから大丈夫」は危険な場合があります</h2>
          <p className={p}>
            変動金利には、多くの銀行で<strong>5年ルール</strong>（金利が変わっても5年間は毎月の返済額を据え置く）と<strong>125%ルール</strong>（見直し時も返済額の増加を1.25倍までに抑える）が設けられています。
          </p>
          <p className={p}>
            これは急な負担増を和らげる仕組みですが、<strong>返済すべき利息が消えるわけではありません</strong>。金利が大きく上がると、毎月の返済額では利息分をまかないきれなくなり、不足分が「未払利息」として残高に上乗せされることがあります。返済しているのに残高が減らない、あるいは増えるという状態です。
          </p>
          <p className={p}>
            また、ソニー銀行・SBI新生銀行・PayPay銀行など、<strong>このルールを設けていない銀行もあります</strong>。これらの銀行では金利が上がるとすぐに返済額が変わります。
          </p>
          <p className={p}>
            <strong>まず確認すべきことは、自分の借入先にこのルールがあるかどうかです。</strong> 返済額が変わっていないことと、負担が増えていないことは、同じではありません。
          </p>
          <p className={p}>
            → 仕組みの詳しい解説と、未払利息が発生する金利の求め方は「<Link href="/loan/5nen-rule" className="text-blue-700 underline hover:no-underline">住宅ローンの5年ルール・125%ルールとは</Link>」で扱っています。
          </p>
        </section>

        {/* 向き不向き */}
        <section id="who-should">
          <h2 className={h2}>変動のままでいい人・固定に変えた方がいい人</h2>
          <p className={p}>数字から言えることを整理します。</p>
          <h3 className={h3}>固定への切り替えを検討する価値がある人</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-slate-700">
            <li>残りの返済期間が20年以上ある</li>
            <li>返済負担率（年収に占める年間返済額の割合）が高く、金利が2%上がると家計が回らなくなる</li>
            <li>教育費のピークなど、今後10年以内に支出が増える予定がある</li>
            <li>現在の適用金利がすでに1.5%を超えている</li>
            <li>金利の変動を気にし続けること自体が負担になっている</li>
          </ul>
          <h3 className={h3}>変動のままで問題ない可能性が高い人</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-slate-700">
            <li>残りの返済期間が10年前後、またはそれより短い</li>
            <li>残高が年収に対して小さく、金利が2%上がっても返済を続けられる</li>
            <li>繰上げ返済に回せる資金があり、金利が上がったら残高を減らせる</li>
            <li>借り換えの審査に通る見込みが立たない（転職直後、健康状態など）</li>
          </ul>
          <p className={p}>
            なお、切り替えには借り換えが伴うため、住宅ローン控除の喪失や団信の保障の変化といった副作用もあります。「<Link href="/loan/karikae/demerit" className="text-blue-700 underline hover:no-underline">住宅ローン借り換えのデメリット</Link>」で、損をする6つのケースを数字で整理しています。
          </p>
          <p className={p}>
            <strong>どちらとも言えない場合</strong>、判断を分けるのは「金利がどこまで上がるか」ではなく、<strong>「上がったときに家計が耐えられるか」</strong>です。上限を予測することは誰にもできませんが、耐えられるかどうかは自分の数字で計算できます。
          </p>
        </section>

        {/* 借り換えが必要 */}
        <section id="refinance-needed">
          <h2 className={h2}>固定に変えるには借り換えが必要です</h2>
          <p className={p}>
            いまの銀行で金利タイプを変更できる場合もありますが、多くは<strong>別の銀行への借り換え</strong>になります。その際にかかる費用の目安は次のとおりです。
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-slate-700">
            <li><strong>事務手数料</strong>：借入額の2.2%程度（3,000万円なら約66万円）。定額型（3〜5万円＋金利上乗せ）の金融機関もあります。</li>
            <li><strong>抵当権を設定するときの登録免許税</strong>：借入額の0.4%（3,000万円なら12万円）</li>
            <li><strong>抵当権を抹消するときの登録免許税</strong>：不動産1個につき1,000円（土地と建物なら2,000円）</li>
            <li><strong>司法書士への報酬</strong>：5〜10万円程度</li>
            <li><strong>印紙税</strong>：借入額が1,000万円超5,000万円以下なら2万円（電子契約の場合は不要）</li>
            <li>そのほか、いまの銀行への全額繰上返済手数料がかかる場合があります。</li>
          </ul>
          <p className={p}>合計で<strong>借入額の2.5〜3%程度</strong>が目安です。3,000万円なら約87万円になります。</p>
          <p className={p}>
            <strong>注意点：住宅を取得したときに使えた登録免許税の軽減税率（0.1%）は、借り換えには適用されません。</strong> 軽減の対象は「住宅用家屋の新築または取得をするための資金の貸付け等に係る抵当権の設定登記」であり、あわせて床面積50平方メートル以上、新築または取得後1年以内の登記であることなどが要件とされています（国税庁タックスアンサーNo.7191）。借り換えのための資金は「取得をするための資金」にあたらないため、原則どおり0.4%で計算されます。この点を見落とすと、費用を実際より低く見積もることになります。
          </p>
          <p className={p}>
            なお、<strong>借り換えの審査は新規の借入と同様に行われます</strong>。転職直後、収入が減った、健康状態が変わったなどの場合、審査に通らないことがあります。「いつでも変えられる」と考えていると、変えたいときに変えられない可能性があります。年齢・団信・審査といった条件が時間とともにどう変わるかは「
            <Link href="/loan/karikae/timing" className="text-blue-700 underline hover:no-underline">
              住宅ローンの借り換えはいつがベストなタイミングか
            </Link>
            」で整理しています。
          </p>
          <p className={p}>
            → 借り換えの費用と手続きについて詳しくは「
            <Link href="/loan/karikae/hiyou/" className="text-blue-700 underline hover:no-underline">
              住宅ローンの借り換えにかかる費用と損益分岐点
            </Link>
            」で解説しています。
          </p>
        </section>

        {/* 計算ツール（2026-07-29：Phase 2 の予定どおり、住宅ローン専用ツールを埋め込み） */}
        <section id="calculator">
          <h2 className={h2}>変動と固定を自分の数字で比べる（計算ツール）</h2>
          <p className={p}>
            ここまでの表は代表的なケースです。実際の判断は、あなたの残高・残り年数・現在の金利で計算する必要があります。
          </p>
          <LoanCalculator articlePath={PAGE_PATH} />
          <p className={p}>
            入力するのは、残高・残り年数・現在の金利・金利タイプの4つだけです。金利が上がった場合の返済額、より低い変動へ借り換えた場合の正味のメリット、固定に切り替えた場合の返済額、そしてあなたの条件での損益分岐点を計算します。
          </p>
        </section>

        <FaqSection id="faq" heading="住宅ローンの変動と固定に関するよくある質問" faqs={FAQS} />

        <SourcesAndDisclaimer
          id="sources"
          assumptions={[
            '毎月の返済額が一定になる返し方（元利均等返済）、ボーナス払いなしで計算しています。',
            '変動金利は「年1.0%」を代表値として使用しています。実際の適用金利は借入時期・金融機関・契約時に決まった引き下げ幅（優遇幅）によって異なります。',
            '固定金利は【フラット35】2026年7月の金利3.14%（物件価格の9割以下を借りる場合・返済期間21〜35年）を使用しています。返済期間20年以下の場合は【フラット20】など、より低い金利が適用される場合があります。民間金融機関の全期間固定型はこれと異なります。',
            '借り換え費用は、事務手数料を借入額の2.2%、抵当権設定の登録免許税を借入額の0.4%、抵当権抹消の登録免許税を2,000円、司法書士報酬を7万円、印紙税を2万円として概算しています（合計で借入額の約2.6%＋約9万円）。実際の費用は金融機関・司法書士・契約方法によって異なります。',
            '変動金利のシナリオは「その金利まで上がって完済まで続く」という単純な仮定です。実際には段階的に変動します。',
          ]}
          sources={[
            '住宅金融支援機構「住宅ローン利用者の実態調査」（2026年1月調査、2025年10月調査、2025年4月調査）',
            '住宅金融支援機構【フラット35】金利情報（2026年7月）',
            '日本銀行 金融政策および長期金利の公表資料',
            '国税庁「No.7191 登録免許税の税額表」（住宅取得資金の貸付け等に係る抵当権の設定登記の軽減税率および適用要件。抵当権設定の本則税率は登録免許税法別表第一による）',
          ]}
          disclaimer="本記事は一般的な情報と、入力された数字にもとづく試算を提供するものです。特定の金融商品・金融機関の推奨や、投資助言・金融商品の販売勧誘を行うものではありません。金利や商品条件は変動します。実際の借入・借り換えの判断にあたっては、必ず各金融機関の最新の条件をご確認ください。"
        />

        <p className="mt-8 text-[14px]">
          <Link href="/loan" className="text-blue-700 underline hover:no-underline">← 住宅ローンの記事一覧へ</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
