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
const ARTICLE = getLoanArticle('/loan/kojo-shuryo-kuriage');
const PAGE_PATH = ARTICLE.path;

export const metadata = buildArticleMetadata(ARTICLE);

/* ===== 目次（H2 と対応） ===== */
const TOC: TocItem[] = [
  { id: 'conclusion', label: '結論:控除の終了は、繰り上げ返済のブレーキが外れる時期です' },
  { id: 'what-changes', label: '控除が終わると、何が変わるのか' },
  { id: 'final-year', label: '【最終年の人へ】実行するなら12月ではなく、翌年1月です' },
  { id: 'effect', label: '終了後の繰り上げ返済は、いくら効くのか' },
  { id: 'lump-sum', label: '一括返済(全額繰り上げ)という選択肢と、その代償' },
  { id: 'check-refi', label: '繰り上げ返済の前に、借り換えを確認してください' },
  { id: 'dont', label: '繰り上げ返済をやらない方がいい人(控除終了後でも)' },
  { id: 'calculator', label: '自分の数字で計算する' },
  { id: 'faq', label: '住宅ローン控除の終了と繰り上げ返済に関するよくある質問' },
  { id: 'sources', label: 'この記事の前提と出典' },
];

/* ===== FAQ（表示と JSON-LD の両方をこの配列から作る・6問） ===== */
const FAQS: Faq[] = [
  {
    q: '住宅ローン控除が終わったら、繰り上げ返済すべきですか？',
    a: '控除期間中にあった「残高を減らすと控除も減る」という相殺が消えるため、繰り上げ返済の効果がそのまま得になります。残高2,006万円・残り22年・金利1.0%なら、100万円の繰り上げで利息が23.9万円減ります。ただし生活防衛資金の確保と、借り換えとの比較(金利差0.5%以上なら借り換えが先)を先に確認してください。',
  },
  {
    q: '繰り上げ返済は何月にするのが得ですか？',
    a: '控除の最終年にいる人は、12月ではなく翌年1月です。12月に実行すると最後の控除が減り、100万円あたり約5,000〜9,000円の差になります。控除が完全に終わっている人は、月による差はありません。早いほど利息の節約が大きくなります。',
  },
  {
    q: '一括返済と一部繰り上げ返済、どちらがいいですか？',
    a: '残高2,006万円を一括返済すれば残りの利息229.6万円が全額消えますが、手元の現金と団信の保障を失います。一部繰り上げなら、現金と団信を残しながら利息を減らせます(100万円で23.9万円)。数字の大きさだけでなく、失うものを含めて比較してください。',
  },
  {
    q: '一括返済すると団信はどうなりますか？',
    a: '完済と同時に団信は終了します。契約者に万一のことがあった場合に残高が保険で返済されるという保障がなくなるため、家族の保障を団信に頼っている場合は、生命保険の見直しとあわせて検討してください。',
  },
  {
    q: '控除が終わった後の借り換えで、返済期間を10年未満にしても大丈夫ですか？',
    a: '控除を受けていないのであれば、償還期間10年以上という控除の要件を気にする必要はありません。なお控除期間中の場合、国税庁は償還期間を「当初の契約で最初に償還した月から、繰り上げ後の最終の償還月まで」で判定するとしています。',
  },
  {
    q: '控除の最終年かどうか、どこで確認できますか？',
    a: '控除を最初に受けた年(居住開始年)と控除期間(10年または13年)で決まります。確定申告の控え、または年末調整で提出している「住宅借入金等特別控除申告書」の綴りで確認できます。',
  },
];

const jsonLd = buildArticleJsonLd({ article: ARTICLE, faqs: FAQS });

const h2 = 'mt-10 scroll-mt-20 text-[20px] font-bold text-slate-900 sm:text-[22px]';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const note = 'mt-2 text-[13px] leading-relaxed text-slate-500';
const ulCls = 'mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700';
const olCls = 'mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700';
const linkCls = 'text-blue-700 underline hover:no-underline';

export default function KojoShuryoKuriagePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <ArticleHeader article={ARTICLE} />

        <Toc items={TOC} />

        {/* 結論 */}
        <section id="conclusion">
          <h2 className={h2}>結論:控除の終了は、繰り上げ返済のブレーキが外れる時期です</h2>
          <ul className={ulCls}>
            <li><strong>住宅ローン控除が終わると、繰り上げ返済をためらう理由がひとつ消えます。</strong>控除期間中は「年末残高が減ると控除も減る」という相殺がありましたが、終了後は利息の節約がそのまま手取りの得になります。</li>
            <li><strong>いま控除の最終年にいる人は、12月ではなく翌年1月に実行してください。</strong>12月に繰り上げるとその年の年末残高が減り、最後の控除が減ります。1か月待つコスト(利息)より控除の減少の方が大きく、100万円あたり約5,000〜9,000円、1月の方が得です。</li>
            <li><strong>終了後の実行は早いほど効きますが、急ぐほどの差ではありません。</strong>残高2,006万円・残り22年・金利1.0%の人が100万円を繰り上げると利息が23.9万円減ります。実行を1年遅らせたときの損失は約1.2万円です。</li>
            <li><strong>一括返済(全額)は、残りの利息229.6万円を消す代わりに、手元の現金2,006万円と団信の保障を手放す選択です。</strong>数字の上では最大ですが、失うものも最大です。</li>
            <li><strong>繰り上げ返済の前に、借り換えを先に計算してください。</strong>控除が終わった人は「返済期間を10年未満にすると控除が消える」という制約からも自由になっており、借り換えの選択肢はむしろ広がっています。</li>
          </ul>
          <p className={p}>
            この記事は、住宅ローン控除が終わった人(および最終年の人)に向けて、手元の資金をどう使うかを数字で整理します。控除がまだ数年残っている人は、<Link href="/loan/kuriage-hensai" className={linkCls}>住宅ローンの繰り上げ返済は得か</Link>で「控除期間中に繰り上げていいのか」を先に確認してください。
          </p>
        </section>

        {/* 何が変わるのか */}
        <section id="what-changes">
          <h2 className={h2}>控除が終わると、何が変わるのか</h2>
          <p className={p}>
            住宅ローン控除は、年末時点のローン残高に応じた金額(残高×0.7%または1%。率は居住開始年で決まります)が所得税や住民税から差し引かれる制度です。控除期間は原則10年または13年です。
          </p>
          <p className={p}>
            この期間中、繰り上げ返済には見えにくいコストがありました。残高を減らすと、翌年以降の控除額も減るからです。「控除期間中は繰り上げ返済するな」という通説はここから来ています(実際には差は数万円以内です。詳しくは<Link href="/loan/kuriage-hensai" className={linkCls}>繰り上げ返済の記事</Link>で計算しています)。
          </p>
          <p className={p}>
            <strong>控除が終わると、この相殺が消えます。</strong>繰り上げ返済で減らした利息が、そのまま得になります。「控除が終わったら繰り上げ返済」とよく言われるのは、この意味では正しい整理です。
          </p>
          <p className={p}>
            問題は、<strong>いつ・いくら・どの方法で</strong>やるかです。以下、順に数字にします。
          </p>
        </section>

        {/* 最終年の人へ */}
        <section id="final-year">
          <h2 className={h2}>【最終年の人へ】実行するなら12月ではなく、翌年1月です</h2>
          <p className={p}>
            控除の最終年にいる人が年内に繰り上げ返済をすると、その年の年末残高が減り、<strong>最後の1回の控除が減ります。</strong>
          </p>
          <p className={p}>100万円を12月に繰り上げた場合と、翌年1月まで待った場合の比較です。</p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>現在の金利</th>
                  <th className={thCls}>控除率0.7%の場合</th>
                  <th className={thCls}>控除率1%の場合</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>0.7%</td>
                  <td className={tdCls}>1月の方が約6,400円得</td>
                  <td className={tdCls}>1月の方が約9,400円得</td>
                </tr>
                <tr>
                  <td className={tdCls}>1.0%</td>
                  <td className={tdCls}>1月の方が約6,200円得</td>
                  <td className={tdCls}>1月の方が約9,200円得</td>
                </tr>
                <tr>
                  <td className={tdCls}>1.5%</td>
                  <td className={tdCls}>1月の方が約5,800円得</td>
                  <td className={tdCls}>1月の方が約8,800円得</td>
                </tr>
                <tr>
                  <td className={tdCls}>2.0%</td>
                  <td className={tdCls}>1月の方が約5,300円得</td>
                  <td className={tdCls}>1月の方が約8,300円得</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            計算の中身は単純です。12月に実行すると最後の控除が「繰り上げ額×控除率」だけ減ります(100万円なら7,000円または1万円)。一方、1か月遅らせるコストは1か月分の利息(100万円・金利1.0%なら約833円)だけです。差し引きで、待つ方が得になります。
          </p>
          <p className={p}>
            繰り上げる金額が大きいほど、この差も比例して大きくなります。300万円なら約1.9万〜2.8万円の差です。
          </p>
          <p className={note}>
            ※この比較は、控除を満額使えている(所得税・住民税から控除しきれている)場合のものです。また、年末残高の判定は12月31日時点なので、正確には「その年の残高証明に反映される前か後か」で決まります。金融機関によって繰り上げ返済の反映日が異なるため、12月下旬の実行は反映タイミングも確認してください。
          </p>
        </section>

        {/* 効果 */}
        <section id="effect">
          <h2 className={h2}>終了後の繰り上げ返済は、いくら効くのか</h2>
          <p className={p}>
            代表ケースで計算します。3,000万円を35年・金利1.0%で借り、控除13年で終了した人です。この時点で残高は約2,006万円、残りの返済期間は22年、毎月の返済額は84,686円です。
          </p>
          <p className={p}><strong>繰り上げる金額別の効果(期間短縮型)</strong></p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>繰り上げる金額</th>
                  <th className={thCls}>減る利息</th>
                  <th className={thCls}>短縮される期間</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>50万円</td>
                  <td className={tdCls}>12.1万円</td>
                  <td className={tdCls}>7.3か月</td>
                </tr>
                <tr>
                  <td className={tdCls}>100万円</td>
                  <td className={tdCls}>23.9万円</td>
                  <td className={tdCls}>14.6か月</td>
                </tr>
                <tr>
                  <td className={tdCls}>300万円</td>
                  <td className={tdCls}>67.2万円</td>
                  <td className={tdCls}>43.4か月</td>
                </tr>
                <tr>
                  <td className={tdCls}>500万円</td>
                  <td className={tdCls}>104.9万円</td>
                  <td className={tdCls}>71.4か月</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            控除10年で終了した人(2021年以前に居住開始)の場合は、残高約2,247万円・残り25年の時点で100万円を繰り上げると、利息が27.6万円減ります。残り期間が長い分、効果はやや大きくなります。
          </p>
          <p className={p}><strong>実行を遅らせた場合のコスト(100万円・期間短縮型)</strong></p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>実行時期</th>
                  <th className={thCls}>終了直後と比べた損失</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>終了直後</td>
                  <td className={tdCls}>—</td>
                </tr>
                <tr>
                  <td className={tdCls}>1年後</td>
                  <td className={tdCls}>約1.2万円</td>
                </tr>
                <tr>
                  <td className={tdCls}>3年後</td>
                  <td className={tdCls}>約3.6万円</td>
                </tr>
                <tr>
                  <td className={tdCls}>5年後</td>
                  <td className={tdCls}>約6.0万円</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            早いほど効くのは事実ですが、<strong>1年悩んでも失うのは1万円強です。</strong>生活防衛資金を確保してから実行しても、失うものは大きくありません。
          </p>
          <p className={p}>
            期間短縮型と返済額軽減型の違い(利息の減りは短縮型が約2倍、軽減型は毎月の余力が増える)は<Link href="/loan/kuriage-hensai" className={linkCls}>繰り上げ返済の記事</Link>で扱っています。控除が終わった後の選択でも、この使い分けは同じです。
          </p>
          {/* 2026-08-01 追加：記事8（返済予定表をエクセルで作る）への相互参照。節の切れ目に配置。 */}
          <p className={p}>
            → 繰り上げ返済の効果を自分の返済予定表で確かめたい場合は、<Link href="/loan/hensai-yoteihyo-excel" className={linkCls}>住宅ローンの返済予定表をエクセルで作る方法</Link>をご覧ください。
          </p>
        </section>

        {/* 一括返済 */}
        <section id="lump-sum">
          <h2 className={h2}>一括返済(全額繰り上げ)という選択肢と、その代償</h2>
          <p className={p}>
            残高2,006万円を一括返済できる資金があるなら、残りの利息229.6万円は全額消えます。数字の上ではこれが最大の節約です。
          </p>
          <p className={p}>ただし、失うものを3つ、先に確認してください。</p>
          <p className={p}>
            <strong>1. 手元の現金2,006万円</strong> — 繰り上げ返済したお金は原則戻せません。住宅ローンは一般に他の借入より金利が低く、いざというときに同じ条件で借り直すことはできません。
          </p>
          <p className={p}>
            <strong>2. 団体信用生命保険(団信)</strong> — 住宅ローンには団信が付いており、契約者に万一のことがあれば残高が保険で返済されます。完済すれば団信は終了します。<strong>一括返済は、その保障を自分の現金で置き換えることを意味します。</strong>残された家族の保障を団信に頼っている場合、生命保険の見直しとセットで考える必要があります。
          </p>
          <p className={p}>
            <strong>3. 全額繰り上げ返済の手数料</strong> — 一部繰り上げ返済と手数料体系が異なる金融機関があります。2026年7月に確認した例では、住信SBIネット銀行は固定金利特約期間中の全額繰上返済が33,000円、三菱UFJ銀行はインターネットでも16,500円です(一部繰上返済はいずれも無料)。借入先の条件を確認してください。
          </p>
          <p className={p}>
            「利息229.6万円の節約」は、「2,006万円を今後22年拘束されずに済むことと、団信」との交換です。どちらが重いかは家計と家族構成によって変わります。<strong>全額ではなく一部を繰り上げて、現金と団信を残す中間の選択もあります。</strong>
          </p>
          {/* 2026-08-03 追加：記事9（退職金の受け取り方）への相互参照（駅1指示書5-2）。
              既存の本文・数値・見出しは変更していない。dateModified も更新しない。 */}
          <p className={p}>
            → 退職金の受け取り方によって、手元に残る金額そのものが変わります。
            <Link href="/retirement/taishokukin-uketorikata" className={linkCls}>「退職金は一時金と年金どっちで受け取るか」</Link>をご覧ください。
          </p>
        </section>

        {/* 借り換えの確認 */}
        <section id="check-refi">
          <h2 className={h2}>繰り上げ返済の前に、借り換えを確認してください</h2>
          <p className={p}>
            控除が終わった人こそ、繰り上げ返済の前に確認すべきことがあります。<strong>いまの金利です。</strong>
          </p>
          <p className={p}>
            <Link href="/loan/kuriage-hensai" className={linkCls}>繰り上げ返済の記事</Link>で計算したとおり、金利差が0.5%以上あり残りの返済期間が15年以上あるなら、同じ資金でも借り換えの方が効果が大きくなります(残高3,000万円・残り20年で、繰り上げ+34.3万円に対し借り換え+75.9万円)。金利差が0.3%程度なら繰り上げ返済が先です。
          </p>
          <p className={p}>さらに、控除が終わった人には借り換えの制約がひとつ消えています。</p>
          <p className={p}>
            控除期間中は、借り換え後の返済期間を10年未満にすると控除の対象から外れるという制約がありました(国税庁は、償還期間を「当初の契約で最初に償還した月から、短縮後の最終の償還月まで」で判定するとしています)。<strong>控除が終わっていれば、この心配は不要です。</strong>残り期間を大きく縮める借り換えも、選択肢に入ります。
          </p>
          <p className={p}>判断の順序は次のとおりです。</p>
          <ol className={olCls}>
            <li>いまの金利と、借り換え先の金利の差を確認する(0.5%以上・残り15年以上なら借り換えを先に計算)</li>
            <li>借り換えの価値がなければ、繰り上げ返済を検討する</li>
            <li>どちらも、生活防衛資金を確保した上で行う</li>
          </ol>
          <p className={p}>
            → 費用は<Link href="/loan/karikae/hiyou" className={linkCls}>住宅ローンの借り換え費用はいくら？</Link>、時期は<Link href="/loan/karikae/timing" className={linkCls}>借り換えはいつがベストか</Link>で扱っています。
          </p>
        </section>

        {/* やらない方がいい人 */}
        <section id="dont">
          <h2 className={h2}>繰り上げ返済をやらない方がいい人(控除終了後でも)</h2>
          <p className={p}>控除が終わっても、繰り上げ返済が常に正解になるわけではありません。</p>
          <p className={p}>
            <strong>生活防衛資金を削ることになる人</strong> — 生活費の6か月分程度を残した上で、余剰分で行うのが基本です。上の表のとおり、1年待つコストは1万円強にすぎません。
          </p>
          <p className={p}>
            <strong>金利差0.5%以上・残り15年以上で、先に借り換えを計算すべき人</strong> — 順序が逆です。
          </p>
          <p className={p}>
            <strong>今後10年以内に教育費などの大きな支出が見えている人</strong> — 現金を手放す判断は慎重に。行うなら返済額軽減型で毎月の余力を作る選択もあります。
          </p>
          <p className={p}>
            <strong>団信を家族の保障として重視する人</strong> — 繰り上げた分は保障の外に出ます。特に一括返済は保障の消滅とセットです。
          </p>
          <p className={p}>
            <strong>変動金利で、金利上昇に備えたい人</strong> — 期間短縮型の繰り上げ返済は未払利息が発生するラインをわずかに上げますが、幅は限られます(100万円で+0.11ポイント)。本格的な備えは<Link href="/loan/hendo-kotei" className={linkCls}>変動と固定の比較</Link>で検討してください。
          </p>
        </section>

        {/* 計算ツール */}
        <section id="calculator">
          <h2 className={h2}>自分の数字で計算する</h2>
          <p className={p}>
            ここまでの表は代表的なケースです。実際の判断は、あなたの残高・残り年数・現在の金利で計算する必要があります。
          </p>
          {/* 2026-07-31：この記事の主題に合わせて繰り上げ返済モードを初期表示にする
              （記事1〜5と /loan ハブは指定しないので従来どおり借り換え・金利モード）。 */}
          <LoanCalculator articlePath={PAGE_PATH} defaultMode="kuriage" />
          <p className={p}>
            入力するのは、残高・残り年数・現在の金利・金利タイプと繰り上げ額の5つだけです。年収・資産・生活費はお聞きしません。
          </p>
        </section>

        <FaqSection id="faq" heading="住宅ローン控除の終了と繰り上げ返済に関するよくある質問" faqs={FAQS} />

        <SourcesAndDisclaimer
          id="sources"
          assumptions={[
            '毎月の返済額が一定になる返し方(元利均等返済)、ボーナス払いなしで計算しています。',
            '代表ケースは「3,000万円・35年・金利1.0%で借入れ、13年経過(残高約2,006万円・残り22年)」です。10年経過の場合は残高約2,247万円・残り25年です。',
            '金利は完済まで変わらないと仮定した単純な比較です。',
            '12月と1月の比較は、控除を満額使えている場合の計算です。繰り上げ額×控除率(最後の1回分)と、1か月分の利息(繰り上げ額×金利÷12)の差で概算しています。',
            '期間短縮型で計算しています。返済額軽減型は利息の軽減が小さくなります。',
          ]}
          sources={[
            '国税庁「No.1211-1 住宅の新築等をし、令和4年以降に居住の用に供した場合(住宅借入金等特別控除)」(控除率0.7%・控除期間)',
            '国税庁「No.1212・No.1213」(令和3年までに居住した場合の控除率1%・控除期間)',
            '国税庁 質疑応答事例「繰上返済等をした場合の償還期間」(償還期間は当初の契約により定められていた最初に償還した月から、短くなった償還期間の最終の償還月までで判定すること)',
            '住信SBIネット銀行・SBI新生銀行・三菱UFJ銀行の各手数料ページ(繰上返済手数料。2026年7月確認)',
          ]}
          disclaimer="本記事は一般的な情報と、入力された数字にもとづく試算を提供するものです。特定の金融商品・金融機関の推奨や、投資助言・金融商品の販売勧誘を行うものではありません。税制・手数料・商品条件は変更されることがあり、また金融機関によって異なります。住宅ローン控除の適用については、必ず国税庁の最新の情報または税務署にご確認ください。"
        />

        <p className="mt-8 text-[14px]">
          <Link href="/loan" className={linkCls}>← 住宅ローンの記事一覧へ</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
