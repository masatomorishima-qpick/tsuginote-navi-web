import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import {
  Breadcrumb, Toc, FaqSection, SourcesAndDisclaimer, TableScroll, ArticleUpdatedAt,
  buildArticleJsonLd, buildArticleMetadata, tableCls, thCls, tdCls,
  type Faq, type TocItem,
} from '@/components/loan/LoanArticle';

/* ===== メタ情報 ===== */
const PAGE_PATH = '/loan/karikae/hiyou';
const PAGE_TITLE = '住宅ローンの借り換え費用はいくら？手数料の内訳と元が取れる条件';
const PAGE_DESCRIPTION =
  '住宅ローンの借り換え費用は借入額の2.8〜3.4%程度、残高3,000万円なら約87万円です。事務手数料と登録免許税が借入額に比例して増えます。費用を引いた後にいくら残るのかを残高・残り年数・金利差ごとの表で示します。';
const DATE_PUBLISHED = '2026-07-28';
const DATE_MODIFIED = '2026-07-28';

/* metadata（canonical / OGP / Twitter / OGP画像）はテンプレート側で組み立てる。
 * 記事ごとに画像や日付書式を書かないための共通化。 */
export const metadata = buildArticleMetadata({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
});

/* ===== 目次（H2 と対応） ===== */
const TOC: TocItem[] = [
  { id: 'conclusion', label: '結論：住宅ローンの借り換え費用はいくらか' },
  { id: 'breakdown', label: '住宅ローンの借り換え費用の内訳' },
  { id: 'by-balance', label: '残高別の借り換え費用の目安' },
  { id: 'break-even', label: '借り換え費用を払っても元が取れるのはどんな場合か' },
  { id: 'rule-of-thumb', label: '「金利差1%・残高1,000万円・残期間10年」という目安は正しいのか' },
  { id: 'fee-type', label: '事務手数料は定率型と定額型のどちらが得か' },
  { id: 'roll-in', label: '借り換え費用は現金で払うか、借入額に組み込むか' },
  { id: 'reduce-cost', label: '借り換え費用を抑える方法' },
  { id: 'before-you-go', label: '借り換えの前に確認しておきたいこと' },
  { id: 'calculator', label: '自分の数字で計算する' },
  { id: 'faq', label: '住宅ローンの借り換え費用に関するよくある質問' },
  { id: 'sources', label: 'この記事の前提と出典' },
];

/* ===== FAQ（表示と JSON-LD の両方をここから作る・6問） ===== */
const FAQS: Faq[] = [
  {
    q: '借り換え費用は全部でいくらかかりますか？',
    a: '借入額の2.8〜3.4%程度が目安です。残高1,000万円なら約34万円、3,000万円なら約87万円、5,000万円なら約139万円になります。金融機関や司法書士によって変わるため、実際の見積もりで確認してください。',
  },
  {
    q: '諸費用が安い金融機関を選べば得ですか？',
    a: '必ずしもそうとは限りません。事務手数料が定額の代わりに金利が0.2%程度上乗せされる場合、残り期間が長いと総負担は大きくなります。手数料と金利の両方を含めて比べてください。',
  },
  {
    q: '登記費用はなぜ人によって違うのですか？',
    a: '抵当権を設定するときの登録免許税が借入額の0.4%で計算されるためです。借入額が大きいほど増えます。加えて司法書士報酬も依頼先によって差があります。',
  },
  {
    q: '住宅を買ったときは登録免許税が安かったのですが、借り換えでも同じですか？',
    a: 'いいえ。軽減税率（0.1%）の対象は「住宅用家屋の新築または取得をするための資金の貸付け等に係る抵当権の設定登記」で、取得後1年以内の登記であることなどが要件です。借り換えは原則どおり0.4%になります。',
  },
  {
    q: '借り換え費用はローンに組み込めますか？',
    a: '多くの金融機関で組み込めます。ただし組み込んだ分にも金利がつきます。残高3,000万円・諸費用87万円を残り30年で組み込むと、利息が約14万円増える計算です。',
  },
  {
    q: 'いまの銀行に払う手数料はありますか？',
    a: '全額繰上返済手数料がかかる場合があります。0円のところもあれば、2〜3万円程度かかるところもあります。契約内容を確認してください。',
  },
];

const jsonLd = buildArticleJsonLd({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  crumbs: [
    { name: '住宅ローン', path: '/loan' },
    { name: '借り換え', path: '/loan/karikae' },
    { name: '借り換え費用と元が取れる条件', path: PAGE_PATH },
  ],
  faqs: FAQS,
});

const h2 = 'mt-10 scroll-mt-20 text-[20px] font-bold text-slate-900 sm:text-[22px]';
const h3 = 'mt-6 text-[16px] font-bold text-slate-900 sm:text-[17px]';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const note = 'mt-2 text-[13px] leading-relaxed text-slate-500';

export default function KarikaeHiyouPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Breadcrumb
          crumbs={[
            { name: '住宅ローン', path: '/loan' },
            { name: '借り換え', path: '/loan/karikae' },
            { name: '借り換え費用と元が取れる条件', path: PAGE_PATH },
          ]}
        />

        <h1 className="text-[24px] font-bold leading-tight text-slate-900 sm:text-[30px]">
          住宅ローンの借り換え費用はいくら？手数料の内訳と、元が取れる条件
        </h1>
        <ArticleUpdatedAt dateModified={DATE_MODIFIED} />

        <Toc items={TOC} />

        {/* 結論 */}
        <section id="conclusion">
          <h2 className={h2}>結論：住宅ローンの借り換え費用はいくらか</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700">
            <li>借り換えにかかる費用は、<strong>借入額の2.8〜3.4%程度</strong>が目安です。残高3,000万円なら<strong>約87万円</strong>になります。</li>
            <li>内訳で最も大きいのは<strong>事務手数料（借入額の2.2%程度）</strong>、次いで<strong>抵当権を設定するときの登録免許税（借入額の0.4%）</strong>です。<strong>どちらも借入額に比例して増えます。</strong></li>
            <li>費用を払っても元が取れるかは、<strong>金利差・残高・残りの返済期間</strong>の3つで決まります。残高3,000万円・残り20年で金利が1%下がるなら、費用を引いても<strong>約254万円</strong>のメリットが出ます。</li>
            <li>一方、<strong>残りの返済期間が5年しかない場合は、金利が1%下がっても、どの残高でも費用のほうが上回ります。</strong></li>
            <li>よく言われる「金利差1%以上・残高1,000万円以上・残期間10年以上」という目安は、<strong>満たしていても手取りは18万円程度にとどまり、満たしていなくても得になる場合があります。</strong>この目安は入口の判断材料にすぎません。</li>
          </ul>
        </section>

        {/* 内訳 */}
        <section id="breakdown">
          <h2 className={h2}>住宅ローンの借り換え費用の内訳</h2>
          <p className={p}>借り換えでかかる費用は、次のとおりです。</p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>項目</th>
                  <th className={thCls}>金額の目安</th>
                  <th className={thCls}>支払先</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>事務手数料</td><td className={tdCls}>借入額の2.2%程度（定率型の場合）</td><td className={tdCls}>借り換え先の金融機関</td></tr>
                <tr><td className={tdCls}>抵当権設定の登録免許税</td><td className={tdCls}>借入額の0.4%</td><td className={tdCls}>国</td></tr>
                <tr><td className={tdCls}>抵当権抹消の登録免許税</td><td className={tdCls}>不動産1個につき1,000円</td><td className={tdCls}>国</td></tr>
                <tr><td className={tdCls}>司法書士への報酬</td><td className={tdCls}>5〜10万円程度</td><td className={tdCls}>司法書士</td></tr>
                <tr><td className={tdCls}>印紙税</td><td className={tdCls}>契約金額により2万円など</td><td className={tdCls}>国</td></tr>
                <tr><td className={tdCls}>全額繰上返済手数料</td><td className={tdCls}>0〜3万円程度</td><td className={tdCls}>いま借りている金融機関</td></tr>
              </tbody>
            </table>
          </TableScroll>

          <h3 className={h3}>事務手数料には「定率型」と「定額型」があります</h3>
          <p className={p}>
            最も大きい費用が事務手数料です。<strong>借入額の2.2%（税込）とする「定率型」</strong>が、ネット銀行を中心に主流になっています。3,000万円を借り換えるなら66万円です。
          </p>
          <p className={p}>
            一方で、<strong>手数料を3〜5万円程度の定額にする代わりに、金利を0.2%前後上乗せする「定額型」</strong>を用意している金融機関もあります。目先の出費は小さくなりますが、金利の上乗せは完済まで続きます。どちらが有利かは残りの返済期間で変わります（後述します）。
          </p>
          <p className={p}>
            なお、<strong>保証料が必要な金融機関もあります</strong>。ネット銀行では保証料無料としているところが多い一方、保証料型の場合は一括で支払うか、金利に0.2%程度上乗せする形になります。
          </p>

          <h3 className={h3}>登記費用は借入額に比例します（見落とされやすい費用）</h3>
          <p className={p}>
            借り換えでは、いまの銀行の抵当権を消し、新しい銀行の抵当権を設定します。このとき登録免許税がかかります。
          </p>
          <p className={p}>
            <strong>抵当権を設定するときの登録免許税は、借入額の0.4%です。</strong>3,000万円なら12万円、4,000万円なら16万円になります。抹消のほうは不動産1個につき1,000円なので、土地と建物で2,000円です。
          </p>
          <p className={p}>ここに司法書士への報酬（5〜10万円程度）が加わります。</p>
          <p className={p}>
            <strong>注意したいのは、住宅を買ったときに使えた軽減税率（0.1%）が、借り換えには適用されないことです。</strong>
          </p>
          <p className={p}>
            国税庁のタックスアンサーによれば、この軽減の対象は「住宅用家屋の新築または取得をするための資金の貸付け等に係る抵当権の設定登記」であり、あわせて床面積50平方メートル以上であることや、新築または取得後1年以内の登記であることなどの要件を満たす必要があるとされています。
          </p>
          <p className={p}>
            借り換えのための資金は「取得をするための資金」にあたらず、また借り換えの時点では通常「取得後1年」を過ぎています。<strong>そのため原則どおり0.4%で計算されます。</strong>
          </p>
          <p className={p}>
            「登記費用は10万円くらい」と一律で説明している記事もありますが、<strong>実際には借入額が大きいほど増えます。</strong>費用を低く見積もる原因になりやすい部分です。
          </p>

          <h3 className={h3}>印紙税は契約金額で決まります（電子契約なら不要）</h3>
          <p className={p}>
            住宅ローンの契約書（金銭消費貸借契約書）は、印紙税法の第1号文書にあたります。国税庁が公表している一覧表では、契約金額に応じて次のように定められています。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>契約金額</th>
                  <th className={thCls}>印紙税額</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>500万円を超え1千万円以下</td><td className={tdCls}>1万円</td></tr>
                <tr><td className={tdCls}>1千万円を超え5千万円以下</td><td className={tdCls}>2万円</td></tr>
                <tr><td className={tdCls}>5千万円を超え1億円以下</td><td className={tdCls}>6万円</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>電子契約を選べば、印紙税はかかりません。</strong>紙の契約書を作らないためです。多くのネット銀行が電子契約に対応しています。
          </p>
          <p className={p}>
            なお、不動産の譲渡契約書などに設けられている印紙税の軽減措置は、住宅ローンの契約書（消費貸借に関する契約書）には適用されません。
          </p>

          <h3 className={h3}>そのほかにかかる費用</h3>
          <p className={p}>
            いま借りている金融機関に支払う<strong>全額繰上返済手数料</strong>があります。0円の金融機関もあれば、2〜3万円程度かかるところもあります。契約内容によって異なるため、事前に確認してください。
          </p>
        </section>

        {/* 残高別 */}
        <section id="by-balance">
          <h2 className={h2}>残高別の借り換え費用の目安</h2>
          <p className={p}>
            上記を積み上げると、残高別の費用はおおよそ次のようになります（事務手数料は定率型2.2%、司法書士報酬7万円として計算）。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>残高</th>
                  <th className={thCls}>事務手数料</th>
                  <th className={thCls}>登録免許税(設定)</th>
                  <th className={thCls}>抹消</th>
                  <th className={thCls}>司法書士</th>
                  <th className={thCls}>印紙税</th>
                  <th className={thCls}>合計</th>
                  <th className={thCls}>借入額に対する割合</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>1,000万円</td><td className={tdCls}>22万円</td><td className={tdCls}>4万円</td><td className={tdCls}>0.2万円</td><td className={tdCls}>7万円</td><td className={tdCls}>1万円</td><td className={tdCls}><strong>約34万円</strong></td><td className={tdCls}>3.42%</td></tr>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>44万円</td><td className={tdCls}>8万円</td><td className={tdCls}>0.2万円</td><td className={tdCls}>7万円</td><td className={tdCls}>2万円</td><td className={tdCls}><strong>約61万円</strong></td><td className={tdCls}>3.06%</td></tr>
                <tr className="bg-amber-50"><td className={tdCls}><strong>3,000万円</strong></td><td className={tdCls}>66万円</td><td className={tdCls}>12万円</td><td className={tdCls}>0.2万円</td><td className={tdCls}>7万円</td><td className={tdCls}>2万円</td><td className={tdCls}><strong>約87万円</strong></td><td className={tdCls}>2.91%</td></tr>
                <tr><td className={tdCls}>4,000万円</td><td className={tdCls}>88万円</td><td className={tdCls}>16万円</td><td className={tdCls}>0.2万円</td><td className={tdCls}>7万円</td><td className={tdCls}>2万円</td><td className={tdCls}><strong>約113万円</strong></td><td className={tdCls}>2.83%</td></tr>
                <tr><td className={tdCls}>5,000万円</td><td className={tdCls}>110万円</td><td className={tdCls}>20万円</td><td className={tdCls}>0.2万円</td><td className={tdCls}>7万円</td><td className={tdCls}>2万円</td><td className={tdCls}><strong>約139万円</strong></td><td className={tdCls}>2.78%</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>残高が小さいほど、借入額に対する割合は高くなります。</strong>司法書士報酬や印紙税など、借入額に比例しない費用の重みが相対的に大きくなるためです。
          </p>
        </section>

        {/* 元が取れる条件 */}
        <section id="break-even">
          <h2 className={h2}>借り換え費用を払っても元が取れるのはどんな場合か</h2>
          <p className={p}>
            費用を差し引いた後に、いくら手元に残るのか。金利が1%下がるケース（年2.0%→年1.0%）で計算しました。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>残高</th>
                  <th className={thCls}>残り5年</th>
                  <th className={thCls}>残り10年</th>
                  <th className={thCls}>残り15年</th>
                  <th className={thCls}>残り20年</th>
                  <th className={thCls}>残り30年</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>500万円</td><td className={tdCls}>−9万円</td><td className={tdCls}>+4万円</td><td className={tdCls}>+18万円</td><td className={tdCls}>+33万円</td><td className={tdCls}>+64万円</td></tr>
                <tr><td className={tdCls}>1,000万円</td><td className={tdCls}>−9万円</td><td className={tdCls}>+18万円</td><td className={tdCls}>+46万円</td><td className={tdCls}>+75万円</td><td className={tdCls}>+138万円</td></tr>
                <tr><td className={tdCls}>1,500万円</td><td className={tdCls}>−9万円</td><td className={tdCls}>+31万円</td><td className={tdCls}>+73万円</td><td className={tdCls}>+117万円</td><td className={tdCls}>+211万円</td></tr>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>−9万円</td><td className={tdCls}>+45万円</td><td className={tdCls}>+101万円</td><td className={tdCls}>+160万円</td><td className={tdCls}>+284万円</td></tr>
                <tr className="bg-amber-50"><td className={tdCls}><strong>3,000万円</strong></td><td className={tdCls}>−9万円</td><td className={tdCls}>+72万円</td><td className={tdCls}>+156万円</td><td className={tdCls}><strong>+244万円</strong></td><td className={tdCls}>+431万円</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={note}>※総返済額の減少分から借り換え費用を引いた金額です。</p>
          <p className={p}>
            <strong>注目してほしいのは、残り5年の列がすべて約−9万円で並んでいることです。</strong>
          </p>
          <p className={p}>
            これは偶然ではありません。残り5年では、金利1%の差で減る利息の額が、借入額に比例する費用（事務手数料と登録免許税）とほぼ釣り合ってしまいます。結果として、<strong>借入額に比例しない固定的な費用（司法書士報酬や印紙税など）だけが損失として残ります。</strong>
          </p>
          <p className={p}>
            <strong>残りの返済期間が短い場合、残高がいくら大きくても借り換えは報われません。</strong>これは費用の構造から生じる、避けようのない結果です。
          </p>
          <p className={p}>金利差ごとに見ると、次のようになります（残高3,000万円）。</p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>金利差</th>
                  <th className={thCls}>残り5年</th>
                  <th className={thCls}>残り10年</th>
                  <th className={thCls}>残り15年</th>
                  <th className={thCls}>残り20年</th>
                  <th className={thCls}>残り30年</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>0.3%</td><td className={tdCls}>−64万円</td><td className={tdCls}>−39万円</td><td className={tdCls}>−14万円</td><td className={tdCls}>+13万円</td><td className={tdCls}>+70万円</td></tr>
                <tr><td className={tdCls}>0.5%</td><td className={tdCls}>−48万円</td><td className={tdCls}>−7万円</td><td className={tdCls}>+36万円</td><td className={tdCls}>+81万円</td><td className={tdCls}>+177万円</td></tr>
                <tr><td className={tdCls}>0.8%</td><td className={tdCls}>−24万円</td><td className={tdCls}>+41万円</td><td className={tdCls}>+111万円</td><td className={tdCls}>+184万円</td><td className={tdCls}>+341万円</td></tr>
                <tr><td className={tdCls}>1.0%</td><td className={tdCls}>−8万円</td><td className={tdCls}>+74万円</td><td className={tdCls}>+161万円</td><td className={tdCls}>+254万円</td><td className={tdCls}>+453万円</td></tr>
              </tbody>
            </table>
          </TableScroll>
        </section>

        {/* 目安の検証 */}
        <section id="rule-of-thumb">
          <h2 className={h2}>「金利差1%・残高1,000万円・残期間10年」という目安は正しいのか</h2>
          <p className={p}>
            住宅ローンの借り換えでは、<strong>「金利差が1%以上」「残高が1,000万円以上」「残りの返済期間が10年以上」</strong>という3つの条件がよく挙げられます。三井住友銀行やSBI新生銀行など、大手金融機関のサイトでも判断の目安として紹介されている、業界で定着した基準です。
          </p>
          <p className={p}>この目安が実際にどうなのか、上の計算で確かめてみます。</p>

          <h3 className={h3}>3条件をちょうど満たす場合、手元に残るのは約18万円</h3>
          <p className={p}>
            残高1,000万円・残り10年・金利差1%（年2.0%→年1.0%）で計算すると、総返済額は約52.9万円減ります。ここから費用34万円を引くと、<strong>手元に残るのは約18万円</strong>です。
          </p>
          <p className={p}>
            <strong>得にはなりますが、「借り換えメリットがある」という表現から想像するより小さい金額です。</strong>手続きの手間や審査の負担を考えると、これを大きいと感じるかどうかは人によります。
          </p>

          <h3 className={h3}>3条件を満たさなくても、得になる場合があります</h3>
          <p className={p}>
            一方で、金利差が1%に届かなくても、残高と残り期間が大きければ十分なメリットが出ます。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>条件</th>
                  <th className={thCls}>費用を引いた後</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>残高3,000万円・残り20年・金利差0.5%</td><td className={tdCls}><strong>+81万円</strong></td></tr>
                <tr><td className={tdCls}>残高3,000万円・残り30年・金利差0.5%</td><td className={tdCls}><strong>+177万円</strong></td></tr>
                <tr><td className={tdCls}>残高4,000万円・残り30年・金利差0.5%</td><td className={tdCls}><strong>+240万円</strong></td></tr>
                <tr><td className={tdCls}>残高3,000万円・残り30年・金利差0.3%</td><td className={tdCls}><strong>+70万円</strong></td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>金利差0.3%でも、残高3,000万円・残り30年なら約70万円が残ります。</strong>「1%以上ないと意味がない」という理解は、この条件では正しくありません。
          </p>

          <h3 className={h3}>この目安をどう使うべきか</h3>
          <p className={p}>
            3条件は、<strong>多くの人にとって安全側に立った入口の基準</strong>と考えるのが適切です。満たしていれば損はしにくい。ただし満たしていなくても得になる場合があり、満たしていても得が小さい場合があります。
          </p>
          <p className={p}>
            <strong>結局のところ、判断できるのは自分の残高・残り期間・金利差で計算したときだけです。</strong>
          </p>
        </section>

        {/* 定率型と定額型 */}
        <section id="fee-type">
          <h2 className={h2}>事務手数料は定率型と定額型のどちらが得か</h2>
          <p className={p}>
            事務手数料には定率型（借入額の2.2%）と定額型（3〜5万円＋金利0.2%程度の上乗せ）があります。残高3,000万円で、完済までの負担を比較しました。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>残りの返済期間</th>
                  <th className={thCls}>定率型（2.2%＝66万円）</th>
                  <th className={thCls}>定額型（5万円＋金利0.2%上乗せ）</th>
                  <th className={thCls}>差</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>5年</td><td className={tdCls}>66万円</td><td className={tdCls}>21万円</td><td className={tdCls}><strong>定額型が45万円有利</strong></td></tr>
                <tr><td className={tdCls}>10年</td><td className={tdCls}>66万円</td><td className={tdCls}>36万円</td><td className={tdCls}><strong>定額型が30万円有利</strong></td></tr>
                <tr><td className={tdCls}>15年</td><td className={tdCls}>66万円</td><td className={tdCls}>53万円</td><td className={tdCls}><strong>定額型が13万円有利</strong></td></tr>
                <tr><td className={tdCls}>20年</td><td className={tdCls}>66万円</td><td className={tdCls}>70万円</td><td className={tdCls}>定率型が4万円有利</td></tr>
                <tr><td className={tdCls}>30年</td><td className={tdCls}>66万円</td><td className={tdCls}>105万円</td><td className={tdCls}><strong>定率型が39万円有利</strong></td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}><strong>分かれ目は、残り15〜20年あたりです。</strong></p>
          <p className={p}>
            金利の上乗せは完済まで効き続けるため、<strong>残り期間が長い人ほど定率型が有利</strong>になります。逆に<strong>残り期間が短い人は、定額型のほうが総負担を抑えられます</strong>。
          </p>
          <p className={note}>※上乗せ幅は金融機関によって異なります。実際の条件で計算し直してください。</p>
        </section>

        {/* 組み込み */}
        <section id="roll-in">
          <h2 className={h2}>借り換え費用は現金で払うか、借入額に組み込むか</h2>
          <p className={p}>
            多くの金融機関では、諸費用を借入額に組み込むことができます。手元の現金を減らさずに済みますが、<strong>組み込んだ分にも金利がつきます。</strong>
          </p>
          <p className={p}>残高3,000万円・諸費用87万円を組み込んだ場合、金利1.0%で増える利息は次のとおりです。</p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>残りの返済期間</th>
                  <th className={thCls}>増える利息</th>
                  <th className={thCls}>月々の増加</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>10年</td><td className={tdCls}>約4.5万円</td><td className={tdCls}>+7,639円</td></tr>
                <tr><td className={tdCls}>20年</td><td className={tdCls}>約9.0万円</td><td className={tdCls}>+4,010円</td></tr>
                <tr><td className={tdCls}>30年</td><td className={tdCls}>約13.8万円</td><td className={tdCls}>+2,805円</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>残り30年で組み込むと、利息が約14万円増えます。</strong>それでも手元に現金を残す価値のほうが大きいと判断する人もいます。急な出費に備える資金が不足している場合は、組み込みを選ぶ理由になります。
          </p>
          <p className={p}>
            判断の目安は、<strong>その現金を手元に置いておく必要があるかどうか</strong>です。金額としては、上の表のとおり数万円から十数万円の差になります。
          </p>
        </section>

        {/* 費用を抑える */}
        <section id="reduce-cost">
          <h2 className={h2}>借り換え費用を抑える方法</h2>
          <p className={p}><strong>電子契約を選ぶ</strong>と、印紙税（2万円など）がかかりません。</p>
          <p className={p}>
            <strong>残り期間が短いなら定額型の手数料を検討する</strong>。上の比較のとおり、残り15年以下なら定額型が有利になる可能性があります。
          </p>
          <p className={p}>
            <strong>抵当権の抹消登記を自分で行う</strong>という方法もあります。司法書士報酬のうち抹消分（1〜2万円程度）を節約できますが、法務局での手続きが必要です。なお、抵当権の設定登記は金融機関が司法書士を指定するのが一般的で、自分で行うことはほぼできません。
          </p>
          <p className={p}>
            <strong>複数の金融機関を比較する</strong>。事務手数料の方式、保証料の有無、金利のすべてが金融機関によって違います。金利だけで比べると、手数料の差で逆転することがあります。
          </p>
        </section>

        {/* 前に確認 */}
        <section id="before-you-go">
          <h2 className={h2}>借り換えの前に確認しておきたいこと</h2>
          <p className={p}>
            <strong>借り換えの審査は、新規の借入と同じように行われます。</strong>転職直後、収入が減った、健康状態が変わったなどの場合、審査に通らないことがあります。「必要になったら借り換えればいい」と考えていると、必要になったときに選べない可能性があります。
          </p>
          <p className={p}>
            <strong>そして、費用を計算する前に決めるべきことがあります。</strong>変動金利のままでいくのか、固定に変えるのか。この判断によって、借り換え後の金利も、費用に見合うかどうかも変わります。
          </p>
          <p className={p}>
            → 「
            <Link href="/loan/hendo-kotei/" className="text-blue-700 underline hover:no-underline">
              住宅ローンは変動と固定どちらがいいか
            </Link>
            」で、2026年7月時点の金利をもとに比較しています。
          </p>
        </section>

        {/* 計算ツール導線 */}
        <section id="calculator">
          <h2 className={h2}>自分の数字で計算する</h2>
          <p className={p}>
            ここまでの表は代表的なケースです。実際の判断は、あなたの残高・残り年数・現在の金利で計算する必要があります。
          </p>
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-[15px] leading-relaxed text-slate-700">
              現在ご利用いただける診断ツールでは、住宅ローンの借り換えで得られる金額の目安を計算できます。残高・残り年数・金利を入力すると、借り換えによる月々の軽減額と、手数料を差し引いた正味のメリットが表示されます。
            </p>
            <p className="mt-3">
              → <Link href="/shisan" className="font-bold text-emerald-800 underline hover:no-underline">資産づくり診断で計算する</Link>
            </p>
          </div>
        </section>

        <FaqSection id="faq" heading="住宅ローンの借り換え費用に関するよくある質問" faqs={FAQS} />

        <SourcesAndDisclaimer
          id="sources"
          assumptions={[
            '毎月の返済額が一定になる返し方（元利均等返済）、ボーナス払いなしで計算しています。',
            '借り換え費用は、事務手数料を借入額の2.2%、抵当権設定の登録免許税を借入額の0.4%、抵当権抹消の登録免許税を2,000円（不動産2個）、司法書士報酬を7万円、印紙税を国税庁の一覧表の金額として積み上げています。全額繰上返済手数料は含めていません。',
            '正味メリットは「借り換えによって減る総返済額 − 借り換え費用」で計算しています。金利は完済まで変わらないと仮定した単純な比較です。',
            '定額型手数料の比較では、手数料5万円・金利0.2%上乗せという条件を用いています。実際の条件は金融機関によって異なります。',
          ]}
          sources={[
            '国税庁「No.7191 登録免許税の税額表」（住宅取得資金の貸付け等に係る抵当権の設定登記の軽減税率および適用要件。抵当権設定の本則税率は登録免許税法別表第一による）',
            '国税庁「No.7140 印紙税額の一覧表（その1）第1号文書から第4号文書まで」（消費貸借に関する契約書の印紙税額）',
            '三井住友銀行、SBI新生銀行の各ウェブサイト（借り換えの目安として挙げられている3条件）',
          ]}
          disclaimer="本記事は一般的な情報と、入力された数字にもとづく試算を提供するものです。特定の金融商品・金融機関の推奨や、投資助言・金融商品の販売勧誘を行うものではありません。費用や商品条件は金融機関によって異なり、また変動します。実際の借り換えの判断にあたっては、必ず各金融機関の最新の条件をご確認ください。"
        />

        <p className="mt-8 text-[14px]">
          <Link href="/loan/karikae" className="text-blue-700 underline hover:no-underline">← 住宅ローンの借り換えの記事一覧へ</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
