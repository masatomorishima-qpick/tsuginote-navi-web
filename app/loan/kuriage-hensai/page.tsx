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
const ARTICLE = getLoanArticle('/loan/kuriage-hensai');
const PAGE_PATH = ARTICLE.path;

export const metadata = buildArticleMetadata(ARTICLE);

/* ===== 目次（H2 と対応） ===== */
const TOC: TocItem[] = [
  { id: 'conclusion', label: '結論:繰り上げ返済は「いくら得か」より「何に使うか」で決まります' },
  { id: 'what-happens', label: '繰り上げ返済をすると、何が起きるのか' },
  { id: 'two-types', label: '期間短縮型と返済額軽減型は、何が違うのか' },
  { id: 'how-much', label: 'いくら繰り上げると、いくら減るのか' },
  { id: 'kojo', label: '住宅ローン控除の期間中に、繰り上げ返済していいのか' },
  { id: 'short-period', label: '返済期間が短くなりすぎる場合の注意' },
  { id: 'vs-karikae', label: '繰り上げ返済より先に、借り換えを計算した方がいい場合があります' },
  { id: 'hendo-risk', label: '変動金利のリスク対策として、繰り上げ返済は有効か' },
  { id: 'timing', label: 'いつ実行するのがいいのか' },
  { id: 'fee', label: '繰り上げ返済に手数料はかかるか' },
  { id: 'dont', label: '繰り上げ返済をやらない方がいい人' },
  { id: 'calculator', label: '自分の数字で計算する' },
  { id: 'faq', label: '住宅ローンの繰り上げ返済に関するよくある質問' },
  { id: 'sources', label: 'この記事の前提と出典' },
];

/* ===== FAQ（表示と JSON-LD の両方をこの配列から作る・7問） ===== */
const FAQS: Faq[] = [
  {
    q: '繰り上げ返済は期間短縮型と返済額軽減型のどちらがいいですか？',
    a: '減る利息だけを見れば期間短縮型が約2倍です(残高3,000万円・金利1.0%・残り30年・100万円の繰り上げで、期間短縮型34.2万円に対し返済額軽減型15.8万円)。ただし返済額軽減型は毎月の返済が3,216円下がり、その状態が完済まで続きます。総額を減らしたいなら期間短縮型、毎月の余力が必要なら返済額軽減型です。',
  },
  {
    q: '住宅ローン控除の期間中に繰り上げ返済すると損しますか？',
    a: '金利が控除率(居住開始年により0.7%または1%)を下回っている場合は、控除が終わるまで待った方がわずかに得です。ただし差は数万円以内で、金利が控除率を上回っていれば、いま繰り上げる方が得になります。また年末残高が借入限度額を超えている場合は、繰り上げ返済しても控除額が減らないため、損は発生しません。中古住宅の「その他の住宅」は借入限度額が2,000万円と低いため、この状態に該当しやすくなります。',
  },
  {
    q: '繰り上げ返済と借り換えはどちらを先にすべきですか？',
    a: '金利差が0.5%以上あり、残りの返済期間が15年以上あるなら、同じ金額でも借り換えの方が効果が大きくなります(残高3,000万円・残り20年で、繰り上げ34.3万円に対し借り換え75.9万円)。金利差が0.3%程度しかない場合は逆で、繰り上げ返済の方が効きます。',
  },
  {
    q: '繰り上げ返済に手数料はかかりますか？',
    a: 'インターネット経由の一部繰り上げ返済を無料としている金融機関が多くありますが、窓口では有料になる場合があります。三菱UFJ銀行は店頭窓口16,500円、インターネット無料と公表しています。完済(全額繰り上げ返済)は別料金になることがあります。借入先の最新の条件を確認してください。',
  },
  {
    q: '繰り上げ返済はいくらからできますか？',
    a: '金融機関によって異なります。借入先の商品説明で確認してください。',
  },
  {
    q: '繰り上げ返済で返済期間が10年未満になるとどうなりますか？',
    /* 2026-07-31 改稿：本文（short-period の節）とあわせて、国税庁の質疑応答事例にもとづく
       通算判定の説明に差し替え。FAQ は JSON-LD にもそのまま出るため、本文と食い違わせない。 */
    a: '住宅ローン控除には償還期間10年以上という要件があります。国税庁の質疑応答事例によると、この期間は「当初の契約で最初に償還した月から、繰り上げ後の最終の償還月まで」の通算で判定します。返済開始から10年以上経過していれば、期間短縮をしても要件を満たします。10年未満で大きく期間短縮する場合は、実行前に借入先または税務署に確認してください。返済期間が変わらない返済額軽減型を選べば、この問題は生じません。',
  },
  {
    q: '変動金利が上がりそうなときに繰り上げ返済は有効ですか？',
    a: '期間短縮型であれば、未払利息が発生する金利のラインを上げる効果があります。3,000万円を35年・0.5%で借りた直後の場合、100万円の繰り上げでラインは3.12%から3.22%に上がります。返済額軽減型ではラインは変わりません。',
  },
];

const jsonLd = buildArticleJsonLd({ article: ARTICLE, faqs: FAQS });

const h2 = 'mt-10 scroll-mt-20 text-[20px] font-bold text-slate-900 sm:text-[22px]';
const h3 = 'mt-6 text-[16px] font-bold text-slate-900 sm:text-[17px]';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const note = 'mt-2 text-[13px] leading-relaxed text-slate-500';
const ulCls = 'mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700';
const olCls = 'mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700';
const linkCls = 'text-blue-700 underline hover:no-underline';

export default function KuriageHensaiPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <ArticleHeader article={ARTICLE} />

        <Toc items={TOC} />

        {/* 結論 */}
        <section id="conclusion">
          <h2 className={h2}>結論:繰り上げ返済は「いくら得か」より「何に使うか」で決まります</h2>
          <ul className={ulCls}>
            <li><strong>期間短縮型は、返済額軽減型のおよそ2倍の利息を減らします。</strong>残高3,000万円・金利1.0%・残り30年の人が100万円を繰り上げた場合、期間短縮型は利息が34.2万円減り、返済額軽減型は15.8万円です。ただし軽減型は毎月の返済が3,216円下がります。減る利息が違うのではなく、受け取るものが違います。</li>
            <li><strong>「住宅ローン控除の期間中は繰り上げ返済するな」という通説は、金額で見ると誇張です。</strong>いま繰り上げるか控除終了まで待つかの差は、どの条件でも数万円以内でした。金利1.0%・控除率0.7%なら、むしろいま繰り上げる方が2.9万円得です。</li>
            <li><strong>年末残高が借入限度額を超えている人は、繰り上げ返済しても控除額が1円も減りません。</strong>とくに中古住宅(その他の住宅)は借入限度額が2,000万円と低く、残高がこれを上回っていれば控除の損失はゼロです。この層に通説は当てはまりません。</li>
            <li><strong>手元の100万円は、繰り上げ返済より借り換えに使った方が大きい場合があります。</strong>残高3,000万円・残り20年で金利差0.5%なら、繰り上げ34.3万円に対して借り換えは75.9万円です。ただし金利差が0.3%程度しかない場合は逆で、繰り上げ返済の方が効きます。</li>
            <li><strong>早く実行するほど効きますが、焦る必要はありません。</strong>5年遅らせたときのコストは約7万円です。</li>
          </ul>
          <p className={p}>
            繰り上げ返済は「やれば得」ではなく、「手元のお金をどこに使うか」という選択です。この記事では、その順番を数字で整理します。
          </p>
        </section>

        {/* 何が起きるのか */}
        <section id="what-happens">
          <h2 className={h2}>繰り上げ返済をすると、何が起きるのか</h2>
          <p className={p}>
            繰り上げ返済で払ったお金は、<strong>全額が元金に充当されます。</strong>毎月の返済とは扱いが違います。
          </p>
          <p className={p}>
            毎月の返済額は、利息の支払いと元金の返済に分かれています。金利1.0%・残高3,000万円なら、毎月の返済額96,492円のうち25,000円が利息、71,492円が元金です。利息の分は、借りている残高に対して発生する費用なので、返済しても残高は減りません。
          </p>
          <p className={p}>
            繰り上げ返済にはこの利息部分がありません。100万円払えば、残高が100万円減ります。そして残高が減れば、その後に発生する利息も減ります。これが繰り上げ返済で利息が減る理由です。
          </p>
          <p className={p}>
            つまり繰り上げ返済で得られるのは、<strong>「これから先に払うはずだった利息」の免除</strong>です。だから残りの返済期間が長いほど効果が大きくなります。
          </p>
        </section>

        {/* 2つの方法 */}
        <section id="two-types">
          <h2 className={h2}>期間短縮型と返済額軽減型は、何が違うのか</h2>
          <p className={p}>
            繰り上げ返済には2つの方法があります。どちらも元金が減ることは同じで、<strong>減った分をどう使うか</strong>が違います。
          </p>
          <p className={p}>
            <strong>期間短縮型</strong>は、毎月の返済額をそのままにして、返済期間を短くします。
          </p>
          <p className={p}>
            <strong>返済額軽減型</strong>は、返済期間をそのままにして、毎月の返済額を下げます。
          </p>
          <p className={p}>100万円を繰り上げ返済した場合の比較です。</p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>残高・金利・残り年数</th>
                  <th className={thCls}>毎月の返済額</th>
                  <th className={thCls}>期間短縮型</th>
                  <th className={thCls}>返済額軽減型</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>2,000万円・1.0%・20年</td>
                  <td className={tdCls}>91,979円</td>
                  <td className={tdCls}>利息−21.5万円／13.2か月短縮</td>
                  <td className={tdCls}>利息−10.4万円／月々−4,599円</td>
                </tr>
                <tr>
                  <td className={tdCls}>2,000万円・1.0%・30年</td>
                  <td className={tdCls}>64,328円</td>
                  <td className={tdCls}>利息−33.9万円／20.8か月短縮</td>
                  <td className={tdCls}>利息−15.8万円／月々−3,216円</td>
                </tr>
                <tr>
                  <td className={tdCls}>3,000万円・1.0%・10年</td>
                  <td className={tdCls}>262,812円</td>
                  <td className={tdCls}>利息−10.4万円／4.2か月短縮</td>
                  <td className={tdCls}>利息−5.1万円／月々−8,760円</td>
                </tr>
                <tr>
                  <td className={tdCls}>3,000万円・1.0%・20年</td>
                  <td className={tdCls}>137,968円</td>
                  <td className={tdCls}>利息−21.7万円／8.8か月短縮</td>
                  <td className={tdCls}>利息−10.4万円／月々−4,599円</td>
                </tr>
                <tr>
                  <td className={tdCls}>3,000万円・1.0%・30年</td>
                  <td className={tdCls}>96,492円</td>
                  <td className={tdCls}>利息−34.2万円／13.9か月短縮</td>
                  <td className={tdCls}>利息−15.8万円／月々−3,216円</td>
                </tr>
                <tr>
                  <td className={tdCls}>3,000万円・1.5%・30年</td>
                  <td className={tdCls}>103,536円</td>
                  <td className={tdCls}>利息−55.4万円／15.0か月短縮</td>
                  <td className={tdCls}>利息−24.2万円／月々−3,451円</td>
                </tr>
                <tr>
                  <td className={tdCls}>4,000万円・1.0%・30年</td>
                  <td className={tdCls}>128,656円</td>
                  <td className={tdCls}>利息−34.4万円／10.4か月短縮</td>
                  <td className={tdCls}>利息−15.8万円／月々−3,216円</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            利息の減り方だけを見れば、期間短縮型が約2倍です。多くの解説が「期間短縮型の方が得」と書くのはこのためです。
          </p>
          <p className={p}>
            ただしこの比較には、返済額軽減型が返しているものが入っていません。<strong>返済額軽減型は、毎月の返済を3,000〜5,000円下げます。</strong>残り30年なら、その状態が完済まで続きます。
          </p>
          <p className={p}>
            期間短縮型が減らすのは将来の利息、返済額軽減型が減らすのは毎月の支出です。どちらが得かではなく、<strong>いま毎月の余力が必要かどうか</strong>で選ぶことになります。
          </p>
          <ul className={ulCls}>
            <li>家計に余裕があり、総額を減らしたい → 期間短縮型</li>
            <li>教育費のピークが近い、収入が減った、毎月の負担を軽くしたい → 返済額軽減型</li>
          </ul>
          <p className={p}>
            なお、繰り上げ返済のたびにどちらの方法にするかを指定できる金融機関もあります。取り扱いは金融機関によって異なるため、借入先の商品説明で確認してください。
          </p>
        </section>

        {/* いくら減るのか */}
        <section id="how-much">
          <h2 className={h2}>いくら繰り上げると、いくら減るのか</h2>
          <p className={p}>
            繰り上げる金額を変えた場合です(残高3,000万円・金利1.0%・残り30年・期間短縮型)。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>繰り上げる金額</th>
                  <th className={thCls}>減る利息</th>
                  <th className={thCls}>短縮される期間</th>
                  <th className={thCls}>繰り上げ額に対する利息の節約率</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>50万円</td>
                  <td className={tdCls}>17.3万円</td>
                  <td className={tdCls}>7.0か月</td>
                  <td className={tdCls}>34.6%</td>
                </tr>
                <tr>
                  <td className={tdCls}>100万円</td>
                  <td className={tdCls}>34.2万円</td>
                  <td className={tdCls}>13.9か月</td>
                  <td className={tdCls}>34.2%</td>
                </tr>
                <tr>
                  <td className={tdCls}>300万円</td>
                  <td className={tdCls}>98.2万円</td>
                  <td className={tdCls}>41.3か月</td>
                  <td className={tdCls}>32.7%</td>
                </tr>
                <tr>
                  <td className={tdCls}>500万円</td>
                  <td className={tdCls}>156.2万円</td>
                  <td className={tdCls}>68.0か月</td>
                  <td className={tdCls}>31.2%</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>この条件では、繰り上げた金額のおよそ3分の1が利息の節約になります。</strong>100万円を繰り上げると34万円の利息が減る、という感覚です。
          </p>
          <p className={p}>
            節約率が金額とともにわずかに下がるのは、大きく繰り上げるほど返済期間が短くなり、利息が発生する期間そのものが減っていくためです。
          </p>
        </section>

        {/* 住宅ローン控除 */}
        <section id="kojo">
          <h2 className={h2}>住宅ローン控除の期間中に、繰り上げ返済していいのか</h2>
          <p className={p}>
            この章は住宅ローン控除を受けている人向けです。控除を受けていない場合は読み飛ばしてください。結論だけ先に書くと、<strong>控除を理由に繰り上げ返済をためらう必要はほとんどありません。</strong>差はどの条件でも数万円以内で、条件によっては繰り上げた方が得です。以下でその根拠を示します。
          </p>
          <p className={p}>
            「住宅ローン控除を受けている間は繰り上げ返済しない方がいい」とよく言われます。この通説を計算で確かめます。
          </p>

          <h3 className={h3}>なぜそう言われるのか</h3>
          <p className={p}>
            住宅ローン控除は、年末時点のローン残高に応じた金額が所得税や住民税から差し引かれる制度です。戻ってくる金額は、おおまかには<strong>年末残高×控除率</strong>で決まります(正確な計算には後述する上限があります)。
          </p>
          <p className={p}>控除率は居住を開始した年で決まります(国税庁の説明による)。</p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>居住を開始した年</th>
                  <th className={thCls}>控除率</th>
                  <th className={thCls}>控除期間</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>令和4年(2022年)以降</td>
                  <td className={tdCls}>0.7%</td>
                  <td className={tdCls}>認定住宅等は13年。その他の住宅は居住年により13年または10年</td>
                </tr>
                <tr>
                  <td className={tdCls}>令和3年(2021年)まで</td>
                  <td className={tdCls}>1%</td>
                  <td className={tdCls}>原則10年(特別特定取得に該当する場合は13年)</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            借入金利が控除率より低い場合、100万円を借りていることで控除の方が多く戻る状態になります。金利0.5%で控除率1%なら、100万円あたり年1万円が戻り、利息は5,000円です。ここで繰り上げ返済をすると、この差を自分から手放すことになります。これが通説の根拠です。
          </p>

          <h3 className={h3}>実際にはいくら違うのか</h3>
          <p className={p}>
            100万円を「いま繰り上げる」か「控除が終わる5年後まで待って繰り上げる」かを比べました。<strong>どちらも最終的には繰り上げ返済をします。違うのはタイミングだけです。</strong>(残高3,000万円・残り30年・期間短縮型)
          </p>
          <p className={p}><strong>控除率0.7%の場合(2022年以降に居住開始)</strong></p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>現在の金利</th>
                  <th className={thCls}>利息の節約(早く実行した分)</th>
                  <th className={thCls}>控除の損失(5年分)</th>
                  <th className={thCls}>差引</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>0.5%</td>
                  <td className={tdCls}>+2.9万円</td>
                  <td className={tdCls}>−3.6万円</td>
                  <td className={tdCls}><strong>−0.7万円</strong>(待つ方が得)</td>
                </tr>
                <tr>
                  <td className={tdCls}>0.7%</td>
                  <td className={tdCls}>+4.2万円</td>
                  <td className={tdCls}>−3.6万円</td>
                  <td className={tdCls}><strong>+0.6万円</strong>(いま繰り上げる方が得)</td>
                </tr>
                <tr>
                  <td className={tdCls}>1.0%</td>
                  <td className={tdCls}>+6.5万円</td>
                  <td className={tdCls}>−3.6万円</td>
                  <td className={tdCls}><strong>+2.9万円</strong>(いま繰り上げる方が得)</td>
                </tr>
                <tr>
                  <td className={tdCls}>1.5%</td>
                  <td className={tdCls}>+11.1万円</td>
                  <td className={tdCls}>−3.7万円</td>
                  <td className={tdCls}><strong>+7.5万円</strong>(いま繰り上げる方が得)</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}><strong>控除率1%の場合(2021年までに居住開始)</strong></p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>現在の金利</th>
                  <th className={thCls}>利息の節約(早く実行した分)</th>
                  <th className={thCls}>控除の損失(5年分)</th>
                  <th className={thCls}>差引</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>0.5%</td>
                  <td className={tdCls}>+2.9万円</td>
                  <td className={tdCls}>−5.1万円</td>
                  <td className={tdCls}><strong>−2.2万円</strong>(待つ方が得)</td>
                </tr>
                <tr>
                  <td className={tdCls}>0.7%</td>
                  <td className={tdCls}>+4.2万円</td>
                  <td className={tdCls}>−5.1万円</td>
                  <td className={tdCls}><strong>−0.9万円</strong>(待つ方が得)</td>
                </tr>
                <tr>
                  <td className={tdCls}>1.0%</td>
                  <td className={tdCls}>+6.5万円</td>
                  <td className={tdCls}>−5.2万円</td>
                  <td className={tdCls}><strong>+1.4万円</strong>(いま繰り上げる方が得)</td>
                </tr>
                <tr>
                  <td className={tdCls}>1.5%</td>
                  <td className={tdCls}>+11.1万円</td>
                  <td className={tdCls}>−5.2万円</td>
                  <td className={tdCls}><strong>+5.9万円</strong>(いま繰り上げる方が得)</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>差はどの条件でも数万円以内です。</strong>そして金利が控除率を上回っていれば、待つのではなく、いま繰り上げた方が得になります。
          </p>

          <h3 className={h3}>なぜ差が小さいのか</h3>
          <p className={p}>
            金利1.0%・控除率1%のように、金利と控除率が同じ場合を考えます。直感的には損得なしのはずですが、計算では繰り上げ返済の方が1.4万円得になります。
          </p>
          <p className={p}>
            理由は期間の非対称です。<strong>控除の損失は控除期間が終われば止まりますが、利息の節約は完済まで効き続けます。</strong>上の例では控除の損失は5年で打ち切られる一方、利息の節約は残り30年にわたって効きます。
          </p>
          <p className={p}>
            通説はこの点を計算に入れていません。「控除率より金利が低いなら借りている方が得」は各年で見れば正しいのですが、繰り上げ返済の効果は控除期間の外にも及びます。
          </p>

          <h3 className={h3}>借入限度額を超えている人は、繰り上げ返済しても控除が減りません</h3>
          <p className={p}>
            ここまでは「繰り上げ返済すると控除が減る」という前提で計算してきました。<strong>しかし、そもそも控除が減らない人がいます。</strong>
          </p>
          <p className={p}><strong>借入限度額とは何か</strong></p>
          <p className={p}>
            住宅ローン控除には、<strong>控除の計算に使える年末残高の上限</strong>があります。これを借入限度額といいます。
          </p>
          <p className={p}>
            控除額は「年末残高×控除率」ではなく、正確には次のように計算します。
          </p>
          <p className={p}>
            <strong>控除額 ＝ 年末残高と借入限度額のうち、少ない方 × 控除率</strong>
          </p>
          <p className={p}>
            たとえば年末残高4,000万円・借入限度額3,000万円の人の場合、控除の計算に使われるのは3,000万円までです。残りの1,000万円は控除に反映されません。この人の控除額は、3,000万円×0.7%＝21万円になります。
          </p>
          <p className={p}><strong>なぜ繰り上げ返済しても控除が減らないのか</strong></p>
          <p className={p}>
            同じ人が100万円を繰り上げ返済したとします。年末残高は4,000万円から3,900万円に減ります。
          </p>
          <p className={p}>
            しかし控除の計算に使われるのは、相変わらず借入限度額の3,000万円です。<strong>年末残高が限度額を上回っている限り、いくら残高が減っても控除額は21万円のまま変わりません。</strong>
          </p>
          <p className={p}>
            つまりこの人は、控除を1円も失わずに、利息の節約だけを受け取れます。「控除期間中は繰り上げ返済するな」という通説は、この人には当てはまりません。
          </p>
          <p className={p}><strong>自分の借入限度額はいくらか</strong></p>
          <p className={p}>
            借入限度額は、<strong>居住を開始した年</strong>と<strong>住宅の種類</strong>の2つで決まります。国税庁の説明にもとづくと次のとおりです。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>居住を開始した年</th>
                  <th className={thCls}>住宅の種類</th>
                  <th className={thCls}>控除率</th>
                  <th className={thCls}>借入限度額</th>
                  <th className={thCls}>控除期間</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>令和4〜5年・新築等</td>
                  <td className={tdCls}>認定長期優良住宅・低炭素住宅</td>
                  <td className={tdCls}>0.7%</td>
                  <td className={tdCls}>5,000万円</td>
                  <td className={tdCls}>13年</td>
                </tr>
                <tr>
                  <td className={tdCls}>令和4〜5年・新築等</td>
                  <td className={tdCls}>ZEH水準省エネ住宅</td>
                  <td className={tdCls}>0.7%</td>
                  <td className={tdCls}>4,500万円</td>
                  <td className={tdCls}>13年</td>
                </tr>
                <tr>
                  <td className={tdCls}>令和4〜5年・新築等</td>
                  <td className={tdCls}>省エネ基準適合住宅</td>
                  <td className={tdCls}>0.7%</td>
                  <td className={tdCls}>4,000万円</td>
                  <td className={tdCls}>13年</td>
                </tr>
                <tr>
                  <td className={tdCls}>令和4〜5年・新築等</td>
                  <td className={tdCls}>その他の住宅</td>
                  <td className={tdCls}>0.7%</td>
                  <td className={tdCls}>3,000万円</td>
                  <td className={tdCls}>13年</td>
                </tr>
                <tr>
                  <td className={tdCls}>令和6〜7年・新築等</td>
                  <td className={tdCls}>認定長期優良住宅・低炭素住宅</td>
                  <td className={tdCls}>0.7%</td>
                  <td className={tdCls}>4,500万円</td>
                  <td className={tdCls}>13年</td>
                </tr>
                <tr>
                  <td className={tdCls}>令和6〜7年・新築等</td>
                  <td className={tdCls}>ZEH水準省エネ住宅</td>
                  <td className={tdCls}>0.7%</td>
                  <td className={tdCls}>3,500万円</td>
                  <td className={tdCls}>13年</td>
                </tr>
                <tr>
                  <td className={tdCls}>令和6〜7年・新築等</td>
                  <td className={tdCls}>省エネ基準適合住宅</td>
                  <td className={tdCls}>0.7%</td>
                  <td className={tdCls}>3,000万円</td>
                  <td className={tdCls}>13年</td>
                </tr>
                <tr>
                  <td className={tdCls}>令和4年以降・中古住宅</td>
                  <td className={tdCls}>認定住宅等</td>
                  <td className={tdCls}>0.7%</td>
                  <td className={tdCls}>3,000万円</td>
                  <td className={tdCls}>10年</td>
                </tr>
                <tr>
                  <td className={tdCls}>令和4年以降・中古住宅</td>
                  <td className={tdCls}>その他の住宅</td>
                  <td className={tdCls}>0.7%</td>
                  <td className={tdCls}><strong>2,000万円</strong></td>
                  <td className={tdCls}>10年</td>
                </tr>
                <tr>
                  <td className={tdCls}>令和1年10月〜令和3年</td>
                  <td className={tdCls}>一般の住宅(特別特定取得)</td>
                  <td className={tdCls}>1%</td>
                  <td className={tdCls}>4,000万円</td>
                  <td className={tdCls}>10年(条件により13年)</td>
                </tr>
                <tr>
                  <td className={tdCls}>令和1年10月〜令和3年</td>
                  <td className={tdCls}>特定取得以外</td>
                  <td className={tdCls}>1%</td>
                  <td className={tdCls}>2,000万円</td>
                  <td className={tdCls}>10年</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={note}>
            ※令和6〜7年に居住した「その他の住宅」(新築)は原則として控除の対象外です(令和5年末までに建築確認を受けた場合などの例外があります)。
          </p>
          <p className={p}>
            <strong>注目すべきは中古住宅です。</strong>中古住宅の「その他の住宅」は借入限度額が2,000万円と低く設定されています。残高がこれを上回っていれば、繰り上げ返済をしても控除額は変わりません。
          </p>
          <p className={p}>
            借入限度額2,000万円・控除率0.7%・控除の残り5年・金利1.0%・残り30年で、100万円を繰り上げた場合です。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>年末残高</th>
                  <th className={thCls}>100万円繰り上げたときの控除の損失</th>
                  <th className={thCls}>差引</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>2,000万円(限度額と同じ)</td>
                  <td className={tdCls}>約3.6万円</td>
                  <td className={tdCls}>+2.9万円(いま繰り上げる方が得)</td>
                </tr>
                <tr>
                  <td className={tdCls}>2,300万円</td>
                  <td className={tdCls}>約1.3万円</td>
                  <td className={tdCls}>+5.2万円(いま繰り上げる方が得)</td>
                </tr>
                <tr>
                  <td className={tdCls}>2,500万円</td>
                  <td className={tdCls}>0円</td>
                  <td className={tdCls}>+6.5万円(いま繰り上げる方が得)</td>
                </tr>
                <tr>
                  <td className={tdCls}>3,000万円</td>
                  <td className={tdCls}>0円</td>
                  <td className={tdCls}>+6.5万円(いま繰り上げる方が得)</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            繰り上げ返済をしても年末残高が限度額を上回ったままなら、控除の損失はまったく発生しません。<strong>この場合、「控除期間中は繰り上げ返済するな」は成り立ちません。</strong>利息の節約だけが残ります。
          </p>
          <p className={p}>
            一方、新築で省エネ基準を満たす住宅(限度額4,000万円以上)の場合、限度額を超えるのは借入額が大きい人に限られます。たとえば新築の「その他の住宅」(限度額3,000万円)で残高が4,000万円ある、といったケースです。<strong>限度額を超えているかどうかは住宅の種類によって大きく変わります。</strong>
          </p>
          <p className={p}><strong>住宅の種類が分からない場合</strong></p>
          <p className={p}>
            自分の住宅がどの種類にあたるかは、住宅ローン控除を最初に申告したときに使った書類で確認できます。分からない場合は、税務署または確定申告の控えで確認してください。
          </p>

          <h3 className={h3}>控除期間中に繰り上げ返済していいかの判定手順</h3>
          <p className={p}>ここまでを整理すると、確認する順序は次のようになります。</p>
          <ol className={olCls}>
            <li><strong>年末残高が借入限度額を超えているか。</strong>超えていれば控除は減りません。繰り上げ返済して問題ありません。</li>
            <li><strong>超えていない場合、自分の金利と控除率のどちらが高いか。</strong>金利の方が高ければ、いま繰り上げる方が得です。</li>
            <li><strong>控除率の方が高い場合のみ、待つ方がわずかに得です。</strong>ただしその差は数万円以内です。</li>
          </ol>
          <p className={p}>
            いずれの場合も、判断が数十万円単位で変わることはありません。<strong>控除は繰り上げ返済をためらう理由としては小さい</strong>というのが、計算から出る答えです。
          </p>

          <h3 className={h3}>前提として</h3>
          <p className={p}>
            上の計算は、<strong>控除を満額使えている場合</strong>のものです。控除額は所得税から引き切れない分が住民税から引かれますが、住民税からの控除には上限があります。納めている税金が少なく控除を使い切れていない場合、控除の実際の価値は表より小さくなり、繰り上げ返済が有利な方向に動きます。
          </p>
          {/* 2026-07-31 追加：記事7（控除終了後の繰り上げ返済）への相互参照。
              控除の章を読み終えた読者を、控除が終わった後の判断へ送る。
              相互参照は節の切れ目に置く方針のため、章の最後・次のh2の直前に置いた。 */}
          <p className={p}>
            → 控除が終わった後・最終年のタイミングについては<Link href="/loan/kojo-shuryo-kuriage" className={linkCls}>住宅ローン控除が終わったら繰り上げ返済すべきか</Link>で扱っています。
          </p>
        </section>

        {/* 期間が短くなりすぎる場合 */}
        <section id="short-period">
          <h2 className={h2}>返済期間が短くなりすぎる場合の注意</h2>
          <p className={p}>
            住宅ローン控除の要件のひとつに、<strong>償還期間(住宅ローンを返し終えるまでの期間)が10年以上であること</strong>があります。当サイトの<Link href="/loan/karikae/demerit" className={linkCls}>住宅ローン借り換えのデメリット</Link>でも、借り換え後の返済期間を10年未満にすると控除の対象から外れることを扱っています。
          </p>
          <p className={p}>
            期間短縮型の繰り上げ返済では、返済期間が短くなります。<strong>まとまった金額を繰り上げて返済期間が大きく縮んだ結果、この要件を満たさなくなると、控除が受けられなくなる場合があります。</strong>
          </p>
          <p className={p}>
            {/* 2026-07-31 改稿：執筆時に一次資料を確認できなかった「償還期間10年の起算点」が、
                国税庁の質疑応答事例で確定したため差し替え。通算で判定するという事実は、
                「返済開始から10年以上経過している人は要件を満たす」という読者にとって
                大きな違いを生むので、注意喚起にとどめず基準そのものを示す。 */}
            判定の基準について、国税庁は質疑応答事例で、償還期間は「当初の契約により定められていた最初に償還した月から、その短くなった償還期間の最終の償還月までの期間」で判定するとしています。つまり<strong>繰り上げ返済後の残り期間ではなく、返済開始からの通算</strong>で10年以上あるかを見ます。返済開始からすでに10年以上経過している人は、どれだけ期間短縮しても要件を満たします。返済開始から10年未満の人が大きく期間短縮する場合のみ、この要件に注意が必要です。個別の判定は、実行する前に借入先の金融機関または税務署に確認してください。
          </p>
        </section>

        {/* 借り換えとの比較 */}
        <section id="vs-karikae">
          <h2 className={h2}>繰り上げ返済より先に、借り換えを計算した方がいい場合があります</h2>
          <p className={p}>
            手元に100万円あるとき、選択肢は繰り上げ返済だけではありません。同じ100万円を借り換えの費用に使うこともできます。
          </p>
          <p className={p}>
            借り換え費用は借入額の約2.6%＋約9.2万円が目安で、残高3,000万円なら約87万円です。100万円あれば足ります。
          </p>
          <p className={p}><strong>現在1.5%・借り換え先1.0%(金利差0.5%)の場合</strong></p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>残高・残り年数</th>
                  <th className={thCls}>A:100万円を繰り上げ返済</th>
                  <th className={thCls}>B:借り換え(費用を現金で支払う)</th>
                  <th className={thCls}>有利な方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>2,000万円・残り15年</td>
                  <td className={tdCls}>+24.5万円</td>
                  <td className={tdCls}>+18.9万円</td>
                  <td className={tdCls}>繰り上げ返済</td>
                </tr>
                <tr>
                  <td className={tdCls}>3,000万円・残り10年</td>
                  <td className={tdCls}>+15.9万円</td>
                  <td className={tdCls}>−8.5万円</td>
                  <td className={tdCls}>繰り上げ返済</td>
                </tr>
                <tr>
                  <td className={tdCls}>3,000万円・残り15年</td>
                  <td className={tdCls}>+24.8万円</td>
                  <td className={tdCls}>+32.9万円</td>
                  <td className={tdCls}>借り換え</td>
                </tr>
                <tr>
                  <td className={tdCls}>3,000万円・残り20年</td>
                  <td className={tdCls}>+34.3万円</td>
                  <td className={tdCls}>+75.9万円</td>
                  <td className={tdCls}>借り換え</td>
                </tr>
                <tr>
                  <td className={tdCls}>3,000万円・残り30年</td>
                  <td className={tdCls}>+55.4万円</td>
                  <td className={tdCls}>+166.4万円</td>
                  <td className={tdCls}>借り換え</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            金利差が0.5%あり、残りの返済期間が15年以上なら、<strong>同じ100万円でも借り換えの方が2倍前後の効果があります。</strong>繰り上げ返済を考える前に、借り換えで下げられる金利があるかを確認する価値があります。
          </p>
          <p className={p}>
            <strong>ただし、金利差が小さい場合は逆になります。現在1.3%・借り換え先1.0%(金利差0.3%)の場合</strong>
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>残高・残り年数</th>
                  <th className={thCls}>A:100万円を繰り上げ返済</th>
                  <th className={thCls}>B:借り換え</th>
                  <th className={thCls}>有利な方</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>3,000万円・残り15年</td>
                  <td className={tdCls}>+21.2万円</td>
                  <td className={tdCls}>−15.5万円</td>
                  <td className={tdCls}>繰り上げ返済</td>
                </tr>
                <tr>
                  <td className={tdCls}>3,000万円・残り20年</td>
                  <td className={tdCls}>+29.1万円</td>
                  <td className={tdCls}>+10.1万円</td>
                  <td className={tdCls}>繰り上げ返済</td>
                </tr>
                <tr>
                  <td className={tdCls}>3,000万円・残り25年</td>
                  <td className={tdCls}>+37.6万円</td>
                  <td className={tdCls}>+36.4万円</td>
                  <td className={tdCls}>繰り上げ返済</td>
                </tr>
                <tr>
                  <td className={tdCls}>3,000万円・残り30年</td>
                  <td className={tdCls}>+46.6万円</td>
                  <td className={tdCls}>+63.6万円</td>
                  <td className={tdCls}>借り換え</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            金利差が0.3%しかない場合、借り換えが繰り上げ返済を上回るのは残り30年に近い人だけです。それより短ければ、費用を回収する前に効果が尽きます。
          </p>
          <p className={p}>
            参考までに、当サイトで診断をされた方のうち変動金利を利用している方(26人・自己申告)の平均金利は1.153%でした。少人数の自己申告データで統計的な代表性はありませんが、<strong>現在の変動金利の実勢が0.9〜1.0%台であることを踏まえると、借り換えで得られる金利差が0.3%に満たない人は少なくありません。</strong>その場合、手元の資金は繰り上げ返済に回した方が効きます。
          </p>
          <p className={p}>
            判断の順序としては、まず借り換えで下げられる金利差を確認し、それが0.5%以上あって残り期間が15年以上なら借り換えを先に、そうでなければ繰り上げ返済を、という整理になります。
          </p>
          <p className={p}>
            → <Link href="/loan/karikae/hiyou" className={linkCls}>住宅ローンの借り換え費用はいくら？</Link>で費用の内訳を、<Link href="/loan/karikae/timing" className={linkCls}>住宅ローンの借り換えはいつがベストなタイミングか</Link>で実行時期を扱っています。
          </p>
        </section>

        {/* 変動金利のリスク対策 */}
        <section id="hendo-risk">
          <h2 className={h2}>変動金利のリスク対策として、繰り上げ返済は有効か</h2>
          <p className={p}>
            変動金利で借りている場合、繰り上げ返済には利息を減らす以外の効果があります。
          </p>
          <p className={p}>
            多くの金融機関では、金利が上がっても5年間は毎月の返済額を据え置く仕組み(5年ルール)を設けています。返済額が変わらないため負担が増えていないように見えますが、返済額に占める利息の割合は増えています。
          </p>
          <p className={p}>
            そして金利がさらに上がり、毎月の返済額で利息をまかないきれなくなると、不足分が<strong>未払利息</strong>として残高に上乗せされます。返済を続けているのに残高が増える状態です。これが発生し始める金利は、次の式で求められます。
          </p>
          <p className={p}>
            <strong>未払利息が発生する金利 ＝ 毎月の返済額 × 12 ÷ 残高</strong>
          </p>
          <p className={p}>
            繰り上げ返済はこの分母(残高)を減らすため、ラインが上がります。3,000万円を35年・0.5%で借りた直後の場合です。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}></th>
                  <th className={thCls}>毎月の返済額</th>
                  <th className={thCls}>未払利息が発生する金利</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>繰り上げ返済なし</td>
                  <td className={tdCls}>77,876円</td>
                  <td className={tdCls}>3.12%</td>
                </tr>
                <tr>
                  <td className={tdCls}>100万円・期間短縮型</td>
                  <td className={tdCls}>77,876円</td>
                  <td className={tdCls}>3.22%(+0.11ポイント)</td>
                </tr>
                <tr>
                  <td className={tdCls}>300万円・期間短縮型</td>
                  <td className={tdCls}>77,876円</td>
                  <td className={tdCls}>3.46%(+0.35ポイント)</td>
                </tr>
                <tr>
                  <td className={tdCls}>500万円・期間短縮型</td>
                  <td className={tdCls}>77,876円</td>
                  <td className={tdCls}>3.74%(+0.62ポイント)</td>
                </tr>
                <tr>
                  <td className={tdCls}>100万円・返済額軽減型</td>
                  <td className={tdCls}>75,280円</td>
                  <td className={tdCls}>3.12%(変化なし)</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>未払利息への備えとして機能するのは期間短縮型だけです。</strong>返済額軽減型は毎月の返済額と残高が同じ割合で減るため、ラインが動きません。
          </p>
          <p className={p}>
            金利上昇そのものへの対策を目的にするなら、期間短縮型を選ぶことになります。
          </p>
          <p className={p}>
            ただし、繰り上げ返済でラインを上げられる幅は限られます。100万円で0.11ポイント、500万円でも0.62ポイントです。金利上昇に本格的に備えるのであれば、固定金利への切り替えを含めて検討することになります。
          </p>
          <p className={p}>
            → 仕組みの詳細は<Link href="/loan/5nen-rule" className={linkCls}>住宅ローンの5年ルール・125%ルールとは</Link>で、固定への切り替えとの比較は<Link href="/loan/hendo-kotei" className={linkCls}>住宅ローンは変動と固定どちらがいいか</Link>で扱っています。
          </p>
        </section>

        {/* 実行時期 */}
        <section id="timing">
          <h2 className={h2}>いつ実行するのがいいのか</h2>
          <p className={p}>
            繰り上げ返済は早いほど効果があります。残高が大きいうちに減らす方が、免除される利息が多くなるためです。
          </p>
          <p className={p}>
            100万円を期間短縮型で繰り上げ返済する時期を変えた場合です(3,000万円・金利1.0%・35年)。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>実行する時期</th>
                  <th className={thCls}>減る利息</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>借入直後</td>
                  <td className={tdCls}>41.0万円</td>
                </tr>
                <tr>
                  <td className={tdCls}>5年後</td>
                  <td className={tdCls}>34.1万円</td>
                </tr>
                <tr>
                  <td className={tdCls}>10年後</td>
                  <td className={tdCls}>27.6万円</td>
                </tr>
                <tr>
                  <td className={tdCls}>15年後</td>
                  <td className={tdCls}>21.5万円</td>
                </tr>
                <tr>
                  <td className={tdCls}>20年後</td>
                  <td className={tdCls}>15.6万円</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>5年遅らせたときのコストは約7万円です。</strong>早い方がいいのは事実ですが、生活防衛資金を削ってまで急ぐほどの差ではありません。
          </p>
          <p className={p}>
            前述の控除との比較(数万円以内の差)と合わせると、<strong>繰り上げ返済のタイミングを1〜2年悩むことによる損失は、数万円の範囲に収まります。</strong>手元の資金を確保してから実行しても、失うものは大きくありません。
          </p>
        </section>

        {/* 手数料 */}
        <section id="fee">
          <h2 className={h2}>繰り上げ返済に手数料はかかるか</h2>
          <p className={p}>
            2026年7月に3行の公式ページで確認したところ、<strong>いずれもインターネット経由の一部繰り上げ返済は無料</strong>でした。ただし窓口では有料になる場合があり、完済(全額繰り上げ返済)は別料金になることがあります。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>金融機関</th>
                  <th className={thCls}>一部繰り上げ返済</th>
                  <th className={thCls}>全額繰り上げ返済(完済)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={tdCls}>住信SBIネット銀行</td>
                  <td className={tdCls}>無料(変動金利期間中・固定金利特約期間中とも)</td>
                  <td className={tdCls}>変動金利期間中は無料、固定金利特約期間中は33,000円</td>
                </tr>
                <tr>
                  <td className={tdCls}>SBI新生銀行</td>
                  <td className={tdCls}>0円(インターネットバンキングから)</td>
                  <td className={tdCls}>0円</td>
                </tr>
                <tr>
                  <td className={tdCls}>三菱UFJ銀行</td>
                  <td className={tdCls}>インターネット無料、店頭窓口16,500円</td>
                  <td className={tdCls}>インターネット16,500円、店頭窓口33,000円</td>
                </tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={note}>
            ※金額は各行の公表内容にもとづきます。条件や別途必要となる事務手数料の有無は金融機関によって異なり、変更されることがあります。ミックスローン・ペアローンでは契約ごとに手数料がかかる場合があります。実行前に必ず自分の借入先の最新の条件を確認してください。
          </p>
          <p className={p}>
            <strong>手数料の有無は、繰り上げ返済の効果を左右します。</strong>上の表のとおり、同じ操作でも窓口とインターネットで16,500円の差が出る金融機関があります。100万円の繰り上げ返済で減る利息が34万円であることを踏まえれば決定的な金額ではありませんが、少額を何度も繰り上げる場合には無視できません。
          </p>
          <p className={p}>
            繰り上げ返済ができる最低金額も金融機関によって異なります。あわせて借入先の商品説明で確認してください。
          </p>
        </section>

        {/* やらない方がいい人 */}
        <section id="dont">
          <h2 className={h2}>繰り上げ返済をやらない方がいい人</h2>
          <p className={p}>数字から言えることを整理します。</p>
          <p className={p}><strong>手元の生活防衛資金を削ることになる人</strong></p>
          <p className={p}>
            繰り上げ返済したお金は、原則として引き出せません。住宅ローンは一般に他の借入より金利が低く、失業や病気で収入が途絶えたときに必要になるのは現金です。生活費の6か月分程度を残したうえで、余剰分で行うのが基本になります。
          </p>
          <p className={p}><strong>借入金利が控除率を下回っていて、控除期間が残っている人</strong></p>
          <p className={p}>
            金利0.5%・控除率1%のような場合、待った方が得になります。ただし上の表のとおり差は数万円以内です。「絶対にやってはいけない」というほどではありません。
          </p>
          <p className={p}><strong>金利差が0.5%以上あり、残りの返済期間が15年以上ある人</strong></p>
          <p className={p}>
            繰り上げ返済より借り換えの方が効果が大きい可能性があります。順序として、先に借り換えを計算してください。
          </p>
          <p className={p}><strong>返済期間が10年未満になるほど大きく期間短縮する人</strong></p>
          <p className={p}>
            住宅ローン控除の要件を満たさなくなる場合があります。実行前に借入先または税務署に確認してください。
          </p>
          <p className={p}><strong>今後10年以内に大きな支出が見えている人</strong></p>
          <p className={p}>
            教育費のピーク、車の買い替え、親の介護などが控えている場合、現金を減らす判断は慎重に行う必要があります。繰り上げ返済をするとしても、期間短縮型ではなく返済額軽減型が選択肢になります。
          </p>
          <p className={p}><strong>団体信用生命保険の性質を理解していない人</strong></p>
          <p className={p}>
            住宅ローンには団体信用生命保険(団信)が付いており、契約者に万一のことがあった場合、その時点の残高が保険で返済されます。繰り上げ返済で残高を減らすことは、<strong>万一の際に保険で消える債務を、自分の現金で先に消しておくこと</strong>を意味します。繰り上げ返済した分は保障の対象から外れます。この点をどう評価するかは家族構成や他の保障によって変わります。
          </p>
          <p className={p}>繰り上げ返済をしないという判断も、条件によっては合理的です。</p>
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

        <FaqSection id="faq" heading="住宅ローンの繰り上げ返済に関するよくある質問" faqs={FAQS} />

        <SourcesAndDisclaimer
          id="sources"
          assumptions={[
            '毎月の返済額が一定になる返し方(元利均等返済)、ボーナス払いなしで計算しています。',
            '期間短縮型の短縮期間は月単位に丸めずに計算しているため、実際の短縮期間とは端数の差が生じます。',
            '住宅ローン控除の試算は、控除を満額使えている(所得税および住民税から控除しきれている)場合のものです。控除しきれていない場合、控除の価値は小さくなります。',
            '控除の比較は、いずれも最終的に同額の繰り上げ返済を行う前提で、実行時期のみを変えた比較です。',
            '借り換え費用は、事務手数料を借入額の2.2%、抵当権設定の登録免許税を借入額の0.4%、抵当権抹消の登録免許税を2,000円、司法書士報酬を7万円、印紙税を2万円として概算しています(合計で借入額の約2.6%＋約9.2万円)。',
            '借り換えとの比較では、借り換え費用を現金で支払い、返済期間は変えないものとしています。',
            '未払利息が発生する金利は「毎月の返済額×12÷残高」で算出しています。実際には日割り計算や約定日の扱いによって差が生じます。',
            '金利は完済まで変わらないと仮定した単純な比較です。',
          ]}
          sources={[
            '国税庁「No.1211-1 住宅の新築等をし、令和4年以降に居住の用に供した場合(住宅借入金等特別控除)」(控除率0.7%、控除期間、借入限度額、控除額は年末残高等と借入限度額のいずれか少ない方に控除率を乗じて計算すること)',
            '国税庁「No.1211-3 中古住宅を取得し、令和4年以降に居住の用に供した場合(住宅借入金等特別控除)」(中古住宅の各年の控除限度額21万円・14万円、控除率0.7%、控除期間10年。借入限度額3,000万円・2,000万円は控除限度額を控除率で割って算出)',
            '国税庁「No.1212 住宅の新築等をし、令和3年までに居住の用に供した場合(住宅借入金等特別控除)」(控除率1%、各年の控除限度額40万円・20万円、控除期間)',
            '国税庁「No.1213 認定住宅の新築等をし、令和3年までに居住の用に供した場合(住宅借入金等特別控除)」(控除率1%、控除期間)',
            '国税庁「No.1233 住宅ローン等の借換えをしたとき」(償還期間10年以上の要件)',
            // 2026-07-31 追加：償還期間の起算点を通算で判定するという一次資料。
            '国税庁 質疑応答事例「繰上返済等をした場合の償還期間」(償還期間は当初の契約により定められていた最初に償還した月から、短くなった償還期間の最終の償還月までで判定すること)',
            '住信SBIネット銀行「住宅ローン 手数料のご案内」(一部繰上返済・全額繰上返済の手数料)',
            'SBI新生銀行「住宅ローン 繰上返済について」(繰上返済手数料)',
            '三菱UFJ銀行「借入後に必要な住宅ローン手数料」(一部繰上返済手数料・期限前完済手数料)',
            '※各金融機関の公表内容は2026年7月に確認したものです。',
          ]}
          disclaimer="本記事は一般的な情報と、入力された数字にもとづく試算を提供するものです。特定の金融商品・金融機関の推奨や、投資助言・金融商品の販売勧誘を行うものではありません。税制・手数料・商品条件は変更されることがあり、また金融機関によって異なります。住宅ローン控除の適用可否については、必ず国税庁の最新の情報または税務署にご確認ください。実際の繰り上げ返済の判断にあたっては、借入先の金融機関の最新の条件をご確認ください。"
        />

        <p className="mt-8 text-[14px]">
          <Link href="/loan" className={linkCls}>← 住宅ローンの記事一覧へ</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
