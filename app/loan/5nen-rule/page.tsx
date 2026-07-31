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
const ARTICLE = getLoanArticle('/loan/5nen-rule');
const PAGE_PATH = ARTICLE.path;

export const metadata = buildArticleMetadata(ARTICLE);

/* ===== 目次（H2 と対応） ===== */
const TOC: TocItem[] = [
  { id: 'conclusion', label: '結論：返済額が変わらないことと、負担が増えていないことは違います' },
  { id: 'what-is-5nen', label: '5年ルールとは' },
  { id: 'what-is-125', label: '125%ルールとは' },
  { id: 'not-applied', label: '5年ルール・125%ルールが適用されない返済方法があります' },
  { id: 'breakdown', label: '返済額が変わらないとき、内訳はどう変わるのか' },
  { id: 'unpaid-interest', label: '未払利息とは何か' },
  { id: 'threshold', label: '未払利息が発生するラインは計算できます' },
  { id: 'who-is-at-risk', label: 'リスクが高いのは、借りたばかりの人です' },
  { id: 'no-rule-banks', label: '5年ルール・125%ルールがない金融機関もあります' },
  { id: 'how-to-check', label: '自分の借入先にルールがあるか確認する方法' },
  { id: 'is-rule-good', label: 'ルールはある方がいいのか' },
  { id: 'what-to-do', label: '金利が上がったときに、実際どうするか' },
  { id: 'calculator', label: '自分の数字で計算する' },
  { id: 'faq', label: '住宅ローンの5年ルール・125%ルールに関するよくある質問' },
  { id: 'sources', label: 'この記事の前提と出典' },
];

/* ===== FAQ（表示と JSON-LD の両方をこの配列から作る・6問） ===== */
const FAQS: Faq[] = [
  {
    q: '5年ルールがあれば、金利が上がっても損はしませんか？',
    a: 'いいえ。5年ルールは毎月の返済額を据え置くだけで、払うべき利息が減るわけではありません。金利が上がると返済額に占める利息の割合が増え、元金の減り方が遅くなります。総返済額はむしろ増えます。',
  },
  {
    q: '未払利息はいつ発生しますか？',
    a: 'その月の利息が毎月の返済額を超えたときです。「毎月の返済額×12÷残高」で計算した金利を超えると発生します。3,000万円を35年・0.5%で借りた直後なら3.12%、5年後なら3.59%が目安です。',
  },
  {
    q: '未払利息はどうなりますか？',
    a: '残高に上乗せされます。返済を続けているのに残高が増える状態になり、5年後の見直しではこの増えた残高をもとに新しい返済額が計算されます。',
  },
  {
    q: '125%ルールがあれば返済額は1.25倍までしか上がりませんか？',
    a: '毎月の返済額の上がり幅は抑えられます。ただし債務そのものが減るわけではないため、抑えられた分は返済期間の終盤や最終回に持ち越されます。',
  },
  {
    q: '5年ルール・125%ルールがない銀行はどこですか？',
    a: 'ソニー銀行、SBI新生銀行、PayPay銀行が、いずれも自社の公表資料で採用していないことを明記しています（2026年7月時点で確認）。ルールの有無は変更される可能性があるため、必ず最新の商品説明でご確認ください。',
  },
  {
    q: '自分の借入先にルールがあるか、どこで確認できますか？',
    a: '金銭消費貸借契約書、商品説明書（重要事項説明書）、金融機関のウェブサイトの商品概要で確認できます。分からない場合は借入先に直接問い合わせてください。',
  },
];

const jsonLd = buildArticleJsonLd({ article: ARTICLE, faqs: FAQS });

const h2 = 'mt-10 scroll-mt-20 text-[20px] font-bold text-slate-900 sm:text-[22px]';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const quote = 'mt-3 rounded-lg border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-[15px] font-bold leading-relaxed text-slate-800';

export default function GonenRulePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <ArticleHeader article={ARTICLE} />

        <Toc items={TOC} />

        {/* 結論 */}
        <section id="conclusion">
          <h2 className={h2}>結論：返済額が変わらないことと、負担が増えていないことは違います</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700">
            <li><strong>5年ルール</strong>は、金利が上がっても5年間は毎月の返済額を据え置く仕組みです。<strong>125%ルール</strong>は、5年ごとの見直しでも返済額の増加を1.25倍までに抑える仕組みです。</li>
            <li>どちらも<strong>返済額を抑えるだけで、払うべき利息が減るわけではありません。</strong>変わるのは毎月の返済額に占める「元金」と「利息」の割合です。</li>
            <li>金利が上がると<strong>元金の減り方が急激に鈍ります。</strong>3,000万円を35年・0.5%で借りた人の場合、金利が2.5%になると元金の減り方は<strong>当初の35%</strong>、3.5%になると<strong>3%</strong>まで落ちます。返済額は1円も変わっていません。</li>
            <li>さらに金利が上がって<strong>利息が返済額を超えると、差額が「未払利息」として残高に上乗せ</strong>されます。上の例では<strong>金利4.0%で月8,887円</strong>、5年で約53万円です。</li>
            <li><strong>未払利息が発生するラインは「毎月の返済額×12 ÷ 残高」で計算できます。</strong>そして<strong>このラインは返済が進むほど上がるため、リスクが最も高いのは借りたばかりで残高が大きい人です。</strong></li>
            <li><strong>ソニー銀行・SBI新生銀行・PayPay銀行など、これらのルールを採用していない金融機関もあります。</strong>まず自分の借入先にルールがあるかを確認してください。</li>
          </ul>
        </section>

        {/* 5年ルールとは */}
        <section id="what-is-5nen">
          <h2 className={h2}>5年ルールとは</h2>
          <p className={p}>
            変動金利の住宅ローンでは、<strong>金利は年2回見直されます。</strong>
          </p>
          <p className={p}>
            <strong>ただし、基準日と適用の時期は金融機関によって異なります。</strong>4月1日と10月1日を基準日とし、その2〜3か月後の返済分から適用する金融機関が多い一方で、たとえばソニー銀行は5月1日・11月1日を基準日とし、6月・12月の約定返済日の翌日から適用しています。<strong>自分の借入先がいつ見直すのかは、契約内容で確認してください。</strong>
          </p>
          <p className={p}>
            このとき、<strong>金利が変わっても毎月の返済額は5年間据え置かれる</strong>のが5年ルールです。
          </p>
          <p className={p}>
            急に返済額が上がって家計が破綻することを避けるための緩衝装置で、<strong>多くの金融機関が採用しています。</strong>
          </p>
        </section>

        {/* 125%ルールとは */}
        <section id="what-is-125">
          <h2 className={h2}>125%ルールとは</h2>
          <p className={p}>
            5年が経過して返済額が見直されるとき、<strong>新しい返済額は直前の返済額の1.25倍を超えない</strong>という上限を設ける仕組みです。
          </p>
          <p className={p}>
            たとえば毎月8万円だった返済額は、次の見直しで最大10万円までにしか上がりません。金利が大きく上昇していても、上がり幅はここで抑えられます。
          </p>
        </section>

        {/* 適用されない返済方法 */}
        <section id="not-applied">
          <h2 className={h2}>5年ルール・125%ルールが適用されない返済方法があります</h2>
          <p className={p}>
            <strong>この2つのルールは、元利均等返済（毎月の返済額が一定になる返し方）にのみ適用されます。</strong>
          </p>
          <p className={p}>
            <strong>元金均等返済</strong>（毎月支払う元金を一定にし、そこに利息を上乗せする返し方）を選んだ場合は、<strong>どの金融機関であっても最初からこれらのルールは存在しません。</strong>金利が上がれば、翌月から返済額が上がります。
          </p>
          <p className={p}>
            元金均等返済を扱う金融機関は限られているため、多くの人には関係のない話ですが、自分がどちらで借りているかは確認しておく価値があります。
          </p>
        </section>

        {/* 内訳 */}
        <section id="breakdown">
          <h2 className={h2}>返済額が変わらないとき、内訳はどう変わるのか</h2>
          <p className={p}>ここが最も理解されていない部分です。</p>
          <p className={p}>
            3,000万円を35年・金利0.5%で借りた人（毎月77,876円）が、5年後に残高2,603万円になっている場合で計算しました。<strong>毎月の返済額は77,876円のまま変わりません。</strong>
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>金利</th>
                  <th className={thCls}>月の利息</th>
                  <th className={thCls}>元金に充当される額</th>
                  <th className={thCls}>当初との比</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>0.5%（当初）</td><td className={tdCls}>10,845円</td><td className={tdCls}>67,030円</td><td className={tdCls}>100%</td></tr>
                <tr><td className={tdCls}>1.5%</td><td className={tdCls}>32,536円</td><td className={tdCls}>45,340円</td><td className={tdCls}><strong>68%</strong></td></tr>
                <tr><td className={tdCls}>2.5%</td><td className={tdCls}>54,227円</td><td className={tdCls}>23,649円</td><td className={tdCls}><strong>35%</strong></td></tr>
                <tr><td className={tdCls}>3.0%</td><td className={tdCls}>65,072円</td><td className={tdCls}>12,803円</td><td className={tdCls}><strong>19%</strong></td></tr>
                <tr><td className={tdCls}>3.5%</td><td className={tdCls}>75,918円</td><td className={tdCls}>1,958円</td><td className={tdCls}><strong>3%</strong></td></tr>
                <tr><td className={tdCls}>4.0%</td><td className={tdCls}>86,763円</td><td className={tdCls}><strong>−8,887円</strong></td><td className={tdCls}><strong>元金が増える</strong></td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>金利が2.5%になると、元金の減り方は当初の35%になります。</strong>通帳から引かれる金額は1円も変わっていないのに、借金が減るスピードは3分の1です。
          </p>
          <p className={p}>
            <strong>3.5%では、元金はほぼ減りません。</strong>毎月7万8千円を払っても、そのうち元金に回るのは約2千円です。
          </p>
          <p className={p}>
            そして<strong>4.0%を超えると、元金は減るどころか増え始めます。</strong>
          </p>
        </section>

        {/* 未払利息 */}
        <section id="unpaid-interest">
          <h2 className={h2}>未払利息とは何か</h2>
          <p className={p}>上の表の一番下の行が「未払利息」が発生している状態です。</p>
          <p className={p}>
            <strong>月々の返済額では、その月に発生した利息すら払いきれない。</strong>足りない分は返済額から差し引かれるのではなく、<strong>残高に上乗せされます。</strong>
          </p>
          <p className={p}>
            上の例では、金利4.0%のとき月8,887円が未払利息として積み上がります。金額を並べると次のとおりです。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>金利</th>
                  <th className={thCls}>月あたりの未払利息</th>
                  <th className={thCls}>5年間の累計</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>4.0%</td><td className={tdCls}>8,887円</td><td className={tdCls}>約53万円</td></tr>
                <tr><td className={tdCls}>4.5%</td><td className={tdCls}>19,733円</td><td className={tdCls}>約118万円</td></tr>
                <tr><td className={tdCls}>5.0%</td><td className={tdCls}>30,578円</td><td className={tdCls}>約183万円</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>返済しているのに残高が増えていく状態</strong>です。5年後の見直しでは、この増えた残高をもとに新しい返済額が計算されます。125%ルールがあっても上がり幅は抑えられますが、<strong>債務そのものは減りません。</strong>
          </p>
        </section>

        {/* 発生ライン */}
        <section id="threshold">
          <h2 className={h2}>未払利息が発生するラインは計算できます</h2>
          <p className={p}>
            未払利息が発生するのは、<strong>その月の利息が毎月の返済額を超えたとき</strong>です。したがって、発生し始める金利は次の式で求められます。
          </p>
          <p className={quote}>未払利息が発生する金利 ＝ 毎月の返済額 × 12 ÷ 残高</p>
          <p className={p}>
            3,000万円を35年・0.5%で借りた人（毎月77,876円）の場合、返済の進み具合によってこう変わります。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>経過</th>
                  <th className={thCls}>残高</th>
                  <th className={thCls}>未払利息が発生する金利</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>借入直後</td><td className={tdCls}>3,000万円</td><td className={tdCls}><strong>3.12%</strong></td></tr>
                <tr><td className={tdCls}>5年後</td><td className={tdCls}>2,603万円</td><td className={tdCls}><strong>3.59%</strong></td></tr>
                <tr><td className={tdCls}>10年後</td><td className={tdCls}>2,196万円</td><td className={tdCls}><strong>4.26%</strong></td></tr>
                <tr><td className={tdCls}>15年後</td><td className={tdCls}>1,778万円</td><td className={tdCls}><strong>5.26%</strong></td></tr>
                <tr><td className={tdCls}>20年後</td><td className={tdCls}>1,350万円</td><td className={tdCls}><strong>6.92%</strong></td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            借入時点でのラインは、<strong>借入額に関係なく、返済期間と借入時の金利で決まります。</strong>
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>返済期間</th>
                  <th className={thCls}>借入時の金利</th>
                  <th className={thCls}>借入直後のライン</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>35年</td><td className={tdCls}>0.5%</td><td className={tdCls}>3.12%</td></tr>
                <tr><td className={tdCls}>35年</td><td className={tdCls}>1.0%</td><td className={tdCls}>3.39%</td></tr>
                <tr><td className={tdCls}>30年</td><td className={tdCls}>0.5%</td><td className={tdCls}>3.59%</td></tr>
                <tr><td className={tdCls}>30年</td><td className={tdCls}>1.0%</td><td className={tdCls}>3.86%</td></tr>
                <tr><td className={tdCls}>25年</td><td className={tdCls}>0.5%</td><td className={tdCls}>4.26%</td></tr>
                <tr><td className={tdCls}>25年</td><td className={tdCls}>1.0%</td><td className={tdCls}>4.52%</td></tr>
              </tbody>
            </table>
          </TableScroll>
          {/* 2026-08-01 追加：記事8（返済予定表をエクセルで作る）への相互参照。
              ラインの計算式を示した直後に、それを自分の表の列として持たせる方法へ送る。
              相互参照は節の切れ目に置く方針のため、節の最後・次のh2の直前に置いた。 */}
          <p className={p}>
            → このラインを自分の返済予定表に列として持たせる方法は、「<Link href="/loan/hensai-yoteihyo-excel" className="text-blue-700 underline hover:no-underline">住宅ローンの返済予定表をエクセルで作る方法</Link>」で扱っています。
          </p>
        </section>

        {/* リスクが高い人 */}
        <section id="who-is-at-risk">
          <h2 className={h2}>リスクが高いのは、借りたばかりの人です</h2>
          <p className={p}>上の表から、<strong>直感に反する結論</strong>が出ます。</p>
          <p className={p}>
            <strong>未払利息のラインは、返済が進むほど上がります。</strong>残高が減るので、同じ返済額でカバーできる利息の割合が増えるためです。
          </p>
          <p className={p}>つまり——</p>
          <p className={quote}>返済が進んでいる人ほど安全で、借りたばかりの人ほど危険です。</p>
          <p className={p}>
            3,000万円を35年で借りた直後の人は金利3.12%で未払利息が発生しますが、20年返済した人は6.92%まで発生しません。
          </p>
          <p className={p}>
            <strong>2020年から2024年ごろに超低金利で長期のローンを組んだ人が、最も影響を受けやすい層</strong>ということになります。返済期間が長く、残高が大きく、借入時の金利が低い。この3つが揃うほど、ラインは低くなります。
          </p>
        </section>

        {/* ルールがない金融機関 */}
        <section id="no-rule-banks">
          <h2 className={h2}>5年ルール・125%ルールがない金融機関もあります</h2>
          <p className={p}>
            <strong>すべての金融機関がこれらのルールを設けているわけではありません。</strong>そして採用していない金融機関は、そのことを自ら明記しています。
          </p>
          <p className={p}>
            <strong>ソニー銀行</strong>は「金利変動リスクなどに関する説明書」の中で、<strong>いわゆる「5年ルール」や「125%ルール」に基づく約定返済額の計算を行っていない</strong>と明記しています。適用金利が上昇した場合はその上昇幅に応じて返済額が見直されるため、最終返済額にしわ寄せされることはないとしています。<strong>約定返済額の上限はありません。</strong>なお同行の適用金利の見直しは、5月1日・11月1日を基準日とし、それぞれ6月・12月の約定返済日の翌日から適用されます。
          </p>
          <p className={p}>
            <strong>SBI新生銀行</strong>は変動金利の商品ページで、毎月返済額およびボーナス返済額は適用利率が変更されるたびに変更するとしたうえで、<strong>いわゆる「5年ルール」は同行の住宅ローンでは採用していない</strong>と明記しています。また<strong>返済額の変更幅に上限または下限はなく、「125％ルール」も採用していない</strong>こと、そのため適用利率が急激に上昇した局面では返済額が大幅に増える可能性があることを注意喚起しています。
          </p>
          <p className={p}>
            <strong>PayPay銀行</strong>は公式のよくあるご質問で、<strong>同行の住宅ローンに「5年ルール」や「125％ルール」はない</strong>と回答しています。金利が上昇した場合はその上昇幅に応じて返済額を見直すため、最終返済額へのしわ寄せがないとしています。
          </p>
          <p className={p}>
            <strong>3行に共通しているのは、「返済額はすぐ上がるが、後にしわ寄せしない」という設計思想です。</strong>金利が上がればその月から負担が増えますが、<strong>未払利息が積み上がることはありません。</strong>利息の状況がそのまま返済額に表れるので、自分の状況が見えやすいという面があります。
          </p>
          <p className={p}>
            なお、<strong>ルールの有無や見直しの基準日は金融機関によって異なり、変更される可能性もあります。</strong>必ず最新の商品説明でご確認ください。
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
            （上記はいずれも2026年7月に各金融機関の公表資料で確認した内容です）
          </p>
        </section>

        {/* 確認方法 */}
        <section id="how-to-check">
          <h2 className={h2}>自分の借入先にルールがあるか確認する方法</h2>
          <p className={p}><strong>確認する場所は3つあります。</strong></p>
          <p className={p}>
            <strong>金銭消費貸借契約書</strong>。借入時に受け取った契約書です。「返済額の見直し」「金利の変更」に関する条項に記載があります。
          </p>
          <p className={p}>
            <strong>商品説明書（重要事項説明書）</strong>。契約時に交付されている書類です。変動金利の仕組みとして説明されています。
          </p>
          <p className={p}>
            <strong>金融機関のウェブサイト</strong>。住宅ローンの商品概要や「よくある質問」に記載されていることが多くあります。
          </p>
          <p className={p}>
            <strong>分からなければ、借入先に直接聞くのが確実です。</strong>次のように聞いてください。
          </p>
          <p className={quote}>
            「私の住宅ローンは変動金利ですが、金利が上がった場合に返済額が5年間据え置かれるルールと、見直し時の増加が1.25倍までに制限されるルールは適用されますか。また、未払利息が発生する仕組みはありますか。」
          </p>
          <p className={p}>
            あわせて、<strong>自分の返済方法が元利均等返済か元金均等返済か</strong>も確認しておくとよいでしょう。元金均等返済の場合、これらのルールはそもそも適用されません。
          </p>
        </section>

        {/* ルールはある方がいいのか */}
        <section id="is-rule-good">
          <h2 className={h2}>ルールはある方がいいのか</h2>
          <p className={p}><strong>どちらが良いとは言い切れません。</strong>性質が違うだけです。</p>
          <p className={p}>
            <strong>ルールがある場合</strong>は、金利が上がっても5年間は返済額が変わらないため、家計への急な打撃を避けられます。その代わり、<strong>負担が増えていることが返済額に表れません。</strong>気づかないうちに元金が減らなくなり、未払利息が積み上がる可能性があります。
          </p>
          <p className={p}>
            <strong>ルールがない場合</strong>は、金利が上がるとすぐに返済額が上がります。負担は重くなりますが、<strong>状況がその場で見えます。</strong>未払利息が積み上がることもありません。
          </p>
          <p className={p}>
            つまり——<strong>ルールがあることは「守られている」というより「見えにくくなっている」と理解するほうが正確です。</strong>
          </p>
          <p className={p}>
            <strong>ルールがある場合こそ、自分で状況を確認する必要があります。</strong>返済額が変わっていないことは、負担が増えていないことを意味しません。
          </p>
        </section>

        {/* 実際どうするか */}
        <section id="what-to-do">
          <h2 className={h2}>金利が上がったときに、実際どうするか</h2>
          <p className={p}>
            未払利息が発生するラインは、多くのケースで<strong>3%台</strong>にあります。
          </p>
          <p className={p}>
            そして興味深いことに、<strong>この水準は「変動のままでいるより固定に切り替えた方が総支払額が少なくなる分岐点」とほぼ同じ帯にあります。</strong>当サイトの試算では、その分岐点は残高3,000万円・残り20年で約3.38%、残り30年で約3.29%です。
          </p>
          <p className={p}>
            つまり<strong>変動金利が3%台に乗ると、2つのことが同時に起こります。</strong>固定に切り替えた方が有利になり、同時に未払利息も発生し始める。
          </p>
          <p className={p}>
            いま何をすべきかは、あなたの残高・残り年数・現在の金利によって変わります。
          </p>
          <p className={p}>
            → 「<Link href="/loan/hendo-kotei" className="text-blue-700 underline hover:no-underline">住宅ローンは変動と固定どちらがいいか</Link>」
          </p>
          <p className={p}>
            → 「<Link href="/loan/karikae/hiyou" className="text-blue-700 underline hover:no-underline">住宅ローンの借り換え費用はいくら？</Link>」
          </p>
          {/* 2026-07-31 追加：記事6（繰り上げ返済）への相互参照を3本目として追加。
              ここは選択肢を中立に並べる場所なので、既存2本と同じ「→ 「リンク」」の形に揃え、
              説明は付けない（3本目だけ長いと並びが崩れる。効果の限界＝100万円で0.11ポイントと
              いう但し書きは、主張をしている記事6の本文側にある）。 */}
          <p className={p}>
            → 「<Link href="/loan/kuriage-hensai" className="text-blue-700 underline hover:no-underline">住宅ローンの繰り上げ返済は得か</Link>」
          </p>
        </section>

        {/* 計算ツール */}
        <section id="calculator">
          <h2 className={h2}>自分の数字で計算する</h2>
          <p className={p}>
            ここまでの表は代表的なケースです。実際の判断は、あなたの残高・残り年数・現在の金利で計算する必要があります。
          </p>
          <LoanCalculator articlePath={PAGE_PATH} />
        </section>

        <FaqSection id="faq" heading="住宅ローンの5年ルール・125%ルールに関するよくある質問" faqs={FAQS} />

        <SourcesAndDisclaimer
          id="sources"
          assumptions={[
            '毎月の返済額が一定になる返し方（元利均等返済）、ボーナス払いなしで計算しています。',
            '内訳の試算は、3,000万円を35年・金利0.5%で借り、5年経過して残高2,603万円になった時点で、毎月の返済額77,876円が据え置かれた場合の計算です。',
            '未払利息が発生する金利は「毎月の返済額×12÷残高」で算出しています。実際には日割り計算や約定日の扱いによって差が生じます。',
            '5年ルール・125%ルールの有無、金利見直しの基準日と適用開始時期は金融機関によって異なります。',
          ]}
          sources={[
            'ソニー銀行「金利変動リスクなどに関する説明書」（5年ルール・125%ルールに基づく約定返済額の計算を行っていないこと、適用金利の見直し時期）',
            'SBI新生銀行「住宅ローン 変動金利のご紹介」（5年ルール・125%ルールを採用していないこと、返済額の変更幅に上限・下限がないこと）',
            'PayPay銀行「よくあるご質問」（5年ルール・125%ルールがないこと）',
            '住宅金融支援機構「住宅ローン利用者の実態調査」（金利タイプの選択状況）',
            '※各社の公表内容は2026年7月に確認したものです。',
          ]}
          disclaimer="本記事は一般的な情報と、入力された数字にもとづく試算を提供するものです。特定の金融商品・金融機関の推奨や、投資助言・金融商品の販売勧誘を行うものではありません。金融機関ごとの取り扱いは異なり、また変更されることがあります。ご自身の契約内容については、必ず契約書類または借入先の金融機関にご確認ください。"
        />

        <p className="mt-8 text-[14px]">
          <Link href="/loan" className="text-blue-700 underline hover:no-underline">← 住宅ローンの記事一覧へ</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
