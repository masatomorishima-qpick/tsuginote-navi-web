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
const ARTICLE = getLoanArticle('/loan/hensai-yoteihyo-excel');
const PAGE_PATH = ARTICLE.path;

export const metadata = buildArticleMetadata(ARTICLE);

/* ===== 目次（H2 と対応） ===== */
const TOC: TocItem[] = [
  { id: 'conclusion', label: '結論:返済予定表は、5つの列と4つの式で作れます' },
  { id: 'why', label: 'なぜ自分で作るのか' },
  { id: 'columns', label: '準備する列は5つです' },
  { id: 'pmt', label: '毎月の返済額をPMT関数で求める' },
  { id: 'arithmetic', label: '残りの3列は四則演算だけです' },
  { id: 'check', label: '検算のしかた' },
  { id: 'gankin', label: '元金均等返済で作る場合' },
  { id: 'prepay', label: '繰り上げ返済を表に組み込む' },
  { id: 'unpaid-line', label: '変動金利の人が1列足すなら:未払利息のライン' },
  { id: 'pitfalls', label: 'つまずきやすい3点' },
  { id: 'calculator', label: '自分の数字で計算する' },
  { id: 'faq', label: '返済予定表をエクセルで作ることに関するよくある質問' },
  { id: 'sources', label: 'この記事の前提と出典' },
];

/* ===== FAQ（表示と JSON-LD の両方をこの配列から作る・6問） ===== */
const FAQS: Faq[] = [
  {
    q: 'PMT関数の引数を教えてください。',
    a: '=PMT(年利/100/12, 年数*12, -借入額) です。第1引数は1か月あたりの利率(年利ではありません)、第2引数は返済回数(年数ではありません)、第3引数は借入額でマイナスを付けます。3,000万円・年1.0%・30年なら96,492円と出ます。',
  },
  {
    q: '利息の計算に関数は要りますか。',
    a: '要りません。「前月の残高 × 年利 ÷ 100 ÷ 12」の掛け算と割り算だけです。元金は「返済額 − 利息」、残高は「前月の残高 − 元金」で求まります。',
  },
  {
    q: '銀行からもらった償還予定表と数字が合いません。',
    a: '円未満の端数処理が金融機関によって異なるため、数十円〜数百円のずれは通常発生します。大きく違う場合は、金利を月利に直しているか、返済回数を月数にしているかを確認してください。',
  },
  {
    q: '繰り上げ返済はどう反映しますか。',
    a: '繰り上げる時点の残高から繰り上げ額を引き、そこから先を同じ式で伸ばします。毎月の返済額を変えなければ期間短縮型、残りの回数を変えずにPMTで返済額を計算し直せば返済額軽減型になります。',
  },
  {
    q: '変動金利が変わったらどうしますか。',
    a: '年利のセルを新しい金利に書き換えます。表全体が計算し直されます。ただし多くの金融機関には5年ルール(金利が変わっても5年間は返済額を据え置く仕組み)があるため、実際の請求額がすぐに変わるとは限りません。',
  },
  {
    q: 'エクセルがなくても作れますか。',
    a: 'Googleスプレッドシートでも同じ式が使えます。PMT関数も四則演算も同じ書き方です。',
  },
];

const jsonLd = buildArticleJsonLd({ article: ARTICLE, faqs: FAQS });

const h2 = 'mt-10 scroll-mt-20 text-[20px] font-bold text-slate-900 sm:text-[22px]';
const h3 = 'mt-6 text-[16px] font-bold text-slate-900 sm:text-[17px]';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const ulCls = 'mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700';
const linkCls = 'text-blue-700 underline hover:no-underline';

/* コードブロック（2026-08-01 新設・記事8が初出）。
 * 主張の強調に使う quote（emerald の左罫線）とは役割が違うので、別のクラスにした。
 * 背景は表の thCls と同じ bg-slate-50 でサイト内から浮かない。
 * 375px でも読めるよう overflow-x-auto ＋ whitespace-pre で横スクロールさせる。 */
const code = 'mt-3 overflow-x-auto whitespace-pre rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-[13px] leading-relaxed text-slate-800';
/** 文中に短く出す式（インライン）。 */
const codeInline = 'rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800';

export default function HensaiYoteihyoExcelPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <ArticleHeader article={ARTICLE} />

        <Toc items={TOC} />

        {/* 結論 */}
        <section id="conclusion">
          <h2 className={h2}>結論:返済予定表は、5つの列と4つの式で作れます</h2>
          <ul className={ulCls}>
            <li><strong>必要な列は5つだけです。</strong>回数・毎月の返済額・うち利息・うち元金・返済後の残高。これで銀行から届く償還予定表と同じものになります。</li>
            <li><strong>毎月の返済額はPMT関数で求めます。</strong><code className={codeInline}>=PMT(年利/100/12, 年数*12, -残高)</code> の1行です。3,000万円・年1.0%・30年なら<strong>96,492円</strong>と出ます。</li>
            <li><strong>残りの3つは四則演算だけです。</strong>利息=前月の残高×年利÷100÷12、元金=返済額−利息、残高=前月の残高−元金。関数は要りません。</li>
            <li><strong>自分で作る意味は、変動金利に追従できることです。</strong>銀行から届く償還予定表は、いまの金利で作られた予定にすぎません。金利が変われば実態と合わなくなりますが、自分の表なら金利のセルを書き換えるだけで全部が計算し直されます。</li>
            <li><strong>繰り上げ返済も同じ表に組み込めます。</strong>途中の残高から繰り上げ額を引き、そこから先を同じ式で伸ばすだけです。</li>
          </ul>
          <p className={p}>
            この記事では、式の入れ方だけでなく<strong>なぜその式になるのか</strong>を説明します。仕組みが分かれば、自分の条件に合わせて表を作り替えられます。
          </p>
          <p className={p}>
            <strong>自分の数字で計算した結果を、数式が入ったExcelファイルとして受け取ることもできます。</strong>記事末尾の計算ツールで試算し、そのままダウンロードしてください。
          </p>
        </section>

        {/* なぜ自分で作るのか */}
        <section id="why">
          <h2 className={h2}>なぜ自分で作るのか</h2>
          <p className={p}>
            住宅ローンを借りると、金融機関から償還予定表(返済予定表)が届きます。すでに手元にあるのに、なぜ自分で作るのか。
          </p>
          <p className={p}>理由は3つあります。</p>
          <p className={p}>
            <strong>1. 変動金利では、届いた表がすぐに実態と合わなくなります。</strong>償還予定表は「いまの金利がずっと続いたら」という前提で作られた予定表です。金利が上がれば、そこに書かれた利息も元金の減り方も変わります。自分の表なら、金利のセルを書き換えるだけで全部が計算し直されます。
          </p>
          <p className={p}>
            <strong>2. 繰り上げ返済の効果を、実行前に自分で確かめられます。</strong>「100万円入れたら何か月縮むか」を、申し込む前に確認できます。
          </p>
          <p className={p}>
            <strong>3. 銀行はこの作り方を積極的には教えません。</strong>各行が自社サイトにシミュレーターを用意しているためです。それ自体は自然なことですが、結果として「自分の手元で管理する方法」の解説は少なくなります。
          </p>
        </section>

        {/* 列 */}
        <section id="columns">
          <h2 className={h2}>準備する列は5つです</h2>
          <p className={p}>新しいシートに、次の5列を作ります。</p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>列</th>
                  <th className={thCls}>内容</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>A</td><td className={tdCls}>回数(1、2、3…)</td></tr>
                <tr><td className={tdCls}>B</td><td className={tdCls}>毎月の返済額</td></tr>
                <tr><td className={tdCls}>C</td><td className={tdCls}>うち利息</td></tr>
                <tr><td className={tdCls}>D</td><td className={tdCls}>うち元金</td></tr>
                <tr><td className={tdCls}>E</td><td className={tdCls}>返済後の残高</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            これとは別に、上部に<strong>入力欄</strong>を3つ作ります。残高・年利(%)・残りの返済年数です。ここを書き換えると表全体が変わる、という作りにします。仮に次の位置に置いたとして説明します。
          </p>
          <ul className={ulCls}>
            <li>B1:残高(例 30000000)</li>
            <li>B2:年利% (例 1)</li>
            <li>B3:残りの返済年数(例 30)</li>
          </ul>
        </section>

        {/* PMT */}
        <section id="pmt">
          <h2 className={h2}>毎月の返済額をPMT関数で求める</h2>
          <p className={p}>
            <strong>PMT関数</strong>は、毎回の返済額を求めるExcelの関数です(Payment の略)。次のように入れます。
          </p>
          <pre className={code}><code>=PMT(B2/100/12, B3*12, -B1)</code></pre>
          <p className={p}>3,000万円・年1.0%・30年なら <strong>96,492円</strong> と表示されます。</p>

          <h3 className={h3}>なぜこの書き方になるのか</h3>
          <p className={p}>3つの引数の意味を押さえると、間違えなくなります。</p>
          <p className={p}>
            <strong>第1引数は「1回あたりの利率」です。</strong>年利ではありません。毎月返すなら1か月分の利率が必要なので、<code className={codeInline}>年利 ÷ 100 ÷ 12</code> とします。年1.0%なら 0.01÷12 です。
          </p>
          <p className={p}>
            <strong>ここが最も多い間違いです。</strong>年利のまま <code className={codeInline}>=PMT(1%, 360, -30000000)</code> と入れると <strong>308,584円</strong> と出ます。正解の3倍以上なので、この間違いは気づけます。
          </p>
          <p className={p}>
            <strong>本当に危ないのは、気づけない間違いのほうです。</strong>金利のセルに <code className={codeInline}>1</code>(パーセント表記)ではなく <code className={codeInline}>0.01</code>(小数)を入れておきながら、式では <code className={codeInline}>/100/12</code> としてしまうと、<code className={codeInline}>=PMT(0.01/100/12, 360, -30000000)</code> となり <strong>83,459円</strong> と出ます。正解の96,492円と桁が同じで、それらしく見えてしまいます。
          </p>
          <p className={p}><strong>金利のセルに何を入れたかで、式の書き方が変わります。</strong></p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>金利セルの入れ方</th>
                  <th className={thCls}>式の書き方</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}><code className={codeInline}>1</code>(パーセントの数値)</td><td className={tdCls}><code className={codeInline}>年利/100/12</code></td></tr>
                <tr><td className={tdCls}><code className={codeInline}>0.01</code>(小数)</td><td className={tdCls}><code className={codeInline}>年利/12</code></td></tr>
                <tr><td className={tdCls}><code className={codeInline}>1%</code>(パーセント書式)</td><td className={tdCls}><code className={codeInline}>年利/12</code></td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            この記事では、入力欄に <code className={codeInline}>1</code> と入れる前提で <code className={codeInline}>/100/12</code> としています。
          </p>
          <p className={p}>
            <strong>第2引数は「返済の回数」です。</strong>年数ではありません。毎月返すなら <code className={codeInline}>年数 × 12</code> です。30年なら360です。
          </p>
          <p className={p}>
            <strong>第3引数は「借入額」で、マイナスを付けます。</strong>Excelの財務関数は「受け取るお金はプラス、支払うお金はマイナス」で扱います。借入額をそのまま入れると返済額がマイナス表示になるため、頭にマイナスを付けて符号を反転させます。
          </p>
        </section>

        {/* 四則演算 */}
        <section id="arithmetic">
          <h2 className={h2}>残りの3列は四則演算だけです</h2>
          <p className={p}>
            関数は要りません。<strong>表の1行目(1回目の返済)から順に見ていきます。</strong>
          </p>
          <p className={p}>
            <strong>C列(利息)</strong> — その月の利息は、<strong>返済前の残高</strong>に1か月分の利率をかけたものです。
          </p>
          <pre className={code}><code>1回目の利息 = 30,000,000 × 1.0 ÷ 100 ÷ 12 = 25,000円</code></pre>
          <p className={p}>
            <strong>D列(元金)</strong> — 返済額のうち、利息でない部分がすべて元金の返済に回ります。
          </p>
          <pre className={code}><code>1回目の元金 = 96,492 − 25,000 = 71,492円</code></pre>
          <p className={p}>
            <strong>E列(残高)</strong> — 元金の分だけ残高が減ります。
          </p>
          <pre className={code}><code>1回目の返済後の残高 = 30,000,000 − 71,492 = 29,928,508円</code></pre>
          <p className={p}>
            2回目以降は、<strong>前の行の残高</strong>を使って同じ計算を繰り返します。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>回数</th>
                  <th className={thCls}>返済額</th>
                  <th className={thCls}>うち利息</th>
                  <th className={thCls}>うち元金</th>
                  <th className={thCls}>返済後の残高</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>1</td><td className={tdCls}>96,492円</td><td className={tdCls}>25,000円</td><td className={tdCls}>71,492円</td><td className={tdCls}>29,928,508円</td></tr>
                <tr><td className={tdCls}>2</td><td className={tdCls}>96,492円</td><td className={tdCls}>24,940円</td><td className={tdCls}>71,551円</td><td className={tdCls}>29,856,957円</td></tr>
                <tr><td className={tdCls}>3</td><td className={tdCls}>96,492円</td><td className={tdCls}>24,881円</td><td className={tdCls}>71,611円</td><td className={tdCls}>29,785,346円</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            返済額は毎回同じなのに、利息が少しずつ減り、元金に回る額が増えていきます。残高が減るからです。この形が<strong>元利均等返済</strong>です。
          </p>
          <p className={p}>
            セルの式にすると、1行目(6行目に置いたとして)は次のようになります。
          </p>
          <pre className={code}><code>{`B6: =$B$4              (毎月の返済額。B4にPMTの結果を置いた場合)
C6: =$B$1*$B$2/100/12  (1回目だけ、返済前の残高はB1)
D6: =B6-C6
E6: =$B$1-D6`}</code></pre>
          <p className={p}>2行目(7行目)からは、前の行の残高を参照します。</p>
          <pre className={code}><code>{`B7: =$B$4
C7: =E6*$B$2/100/12
D7: =B7-C7
E7: =E6-D7`}</code></pre>
          <p className={p}>
            <strong>あとは7行目を下にコピーするだけです。</strong>360回分(30年)なら366行目まで伸ばします。
          </p>
          <p className={p}>
            <code className={codeInline}>$</code> を付けているのは、下にコピーしても参照先がずれないようにするためです(絶対参照)。前の行の残高を指す <code className={codeInline}>E6</code> には付けません。こちらはコピーとともにずれてほしいためです。
          </p>
        </section>

        {/* 検算 */}
        <section id="check">
          <h2 className={h2}>検算のしかた</h2>
          <p className={p}>作った表が正しいか、3か所で確認できます。</p>
          <p className={p}>
            <strong>1. 最終行の残高が0になること。</strong>丸め処理を入れずに式だけで作った場合、最終行はぴったり0になります(実際に検証しました)。ROUND関数などで円未満を丸めている場合は数円〜数十円ずれますが、それ以上大きく残っていれば式が間違っています。
          </p>
          <p className={p}>
            <strong>2. 総返済額。</strong>B列の合計が <strong>3,474万円</strong>(3,000万円・1.0%・30年の場合)。
          </p>
          <p className={p}>
            <strong>3. 総利息。</strong>C列の合計が <strong>474万円</strong>。総返済額から借入額を引いた値と一致します。
          </p>
        </section>

        {/* 元金均等 */}
        <section id="gankin">
          <h2 className={h2}>元金均等返済で作る場合</h2>
          <p className={p}>
            <strong>元金均等返済</strong>は、毎月返す元金を一定にして、そこに利息を足す返し方です。取り扱う金融機関は限られますが、作り方は元利均等より簡単です。PMT関数を使いません。
          </p>
          <ul className={ulCls}>
            <li>毎月の元金 = 借入額 ÷ 返済回数 = 30,000,000 ÷ 360 = <strong>83,333円</strong>(固定)</li>
            <li>利息 = 前月の残高 × 年利 ÷ 100 ÷ 12</li>
            <li>毎月の返済額 = 元金 + 利息</li>
          </ul>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>回数</th>
                  <th className={thCls}>返済額</th>
                  <th className={thCls}>うち元金</th>
                  <th className={thCls}>うち利息</th>
                  <th className={thCls}>返済後の残高</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>1</td><td className={tdCls}>108,333円</td><td className={tdCls}>83,333円</td><td className={tdCls}>25,000円</td><td className={tdCls}>29,916,667円</td></tr>
                <tr><td className={tdCls}>2</td><td className={tdCls}>108,264円</td><td className={tdCls}>83,333円</td><td className={tdCls}>24,931円</td><td className={tdCls}>29,833,333円</td></tr>
                <tr><td className={tdCls}>3</td><td className={tdCls}>108,194円</td><td className={tdCls}>83,333円</td><td className={tdCls}>24,861円</td><td className={tdCls}>29,750,000円</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            総利息は <strong>451万円</strong> で、元利均等(474万円)より<strong>約22万円少なくなります</strong>。ただし返済開始当初の負担は月々約1.2万円重くなります。
          </p>
          <p className={p}>
            なお、この記事で扱っている5年ルール・125%ルールは元利均等返済にのみ適用されるものです。詳しくは<Link href="/loan/5nen-rule" className={linkCls}>住宅ローンの5年ルール・125%ルールとは</Link>で扱っています。
          </p>
        </section>

        {/* 繰り上げ返済 */}
        <section id="prepay">
          <h2 className={h2}>繰り上げ返済を表に組み込む</h2>
          <p className={p}>
            繰り上げ返済は、<strong>途中の残高から繰り上げ額を引く</strong>だけで表現できます。難しい式は要りません。
          </p>
          <p className={p}>
            12回目の返済が終わった時点(残高29,138,155円)で、100万円を繰り上げ返済するとします。<strong>残高を28,138,155円に書き換えて、そこから先を同じ式で伸ばします。</strong>
          </p>
          <p className={p}>ここから先は、選ぶ方法によって伸ばし方が変わります。</p>
          <p className={p}><strong>期間短縮型(毎月の返済額を変えない)</strong></p>
          <ul className={ulCls}>
            <li>B列の返済額は96,492円のまま</li>
            <li>残高が0を下回った行で終わり</li>
            <li>この例では<strong>残り335回で完済</strong>します。繰り上げなしなら348回だったので、<strong>表の行が13行減ります</strong>(最終回は端数の返済になります)</li>
          </ul>
          <p className={p}>
            回数だけを先に知りたい場合は、<strong>NPER関数</strong>で確かめられます。<code className={codeInline}>=NPER(年利/100/12, -毎月の返済額, 繰り上げ後の残高)</code> と入れると、この例では <strong>334.2</strong> と返ります。334回では返しきれず、335回目で終わるという意味です。
          </p>
          <p className={p}><strong>返済額軽減型(返済期間を変えない)</strong></p>
          <ul className={ulCls}>
            <li>残りの回数(348回)を変えずに、返済額を計算し直します</li>
            <li><code className={codeInline}>=PMT(年利/100/12, 348, -28138155)</code> → <strong>93,180円</strong></li>
            <li>毎月の返済が <strong>3,312円</strong> 軽くなります</li>
          </ul>
          <p className={p}>
            <strong>同じ100万円でも、受け取るものが違います。</strong>期間短縮型は将来の利息、返済額軽減型は毎月の余力です。どちらがいくら得かは<Link href="/loan/kuriage-hensai" className={linkCls}>住宅ローンの繰り上げ返済は得か</Link>で数字にしています。
          </p>
        </section>

        {/* 未払利息のライン */}
        <section id="unpaid-line">
          <h2 className={h2}>変動金利の人が1列足すなら:未払利息のライン</h2>
          <p className={p}>
            ここは、市販のテンプレートにはまず入っていない項目です。<strong>変動金利で借りている人には、作っておく価値があります。</strong>
          </p>
          <p className={p}>
            金利が上がったとき、毎月の返済額で利息をまかないきれなくなると、不足分が<strong>未払利息</strong>として残高に上乗せされます。返済しているのに残高が増える状態です。
          </p>
          <p className={p}>これが発生し始める金利は、次の式で求められます。</p>
          <pre className={code}><code>未払利息が発生する金利 = 毎月の返済額 × 12 ÷ 残高 × 100</code></pre>
          <p className={p}>3,000万円・1.0%・30年の場合:</p>
          <pre className={code}><code>96,492 × 12 ÷ 30,000,000 × 100 = 3.86%</code></pre>
          <p className={p}>
            セルの式にすると <code className={codeInline}>=B6*12/E5*100</code> のような形です(前の行の残高を参照)。<strong>この列を作っておくと、返済が進むにつれてラインが上がっていく</strong>のが見えます。残高が減るほど、同じ返済額でカバーできる利息の割合が増えるためです。
          </p>
          <p className={p}>
            つまり<strong>危険なのは、借りたばかりで残高が大きい人</strong>です。この構造は<Link href="/loan/5nen-rule" className={linkCls}>住宅ローンの5年ルール・125%ルールとは</Link>で詳しく扱っています。
          </p>
        </section>

        {/* つまずきやすい点 */}
        <section id="pitfalls">
          <h2 className={h2}>つまずきやすい3点</h2>
          <p className={p}>
            <strong>金利の入れ方と式が噛み合っていない</strong> — 前述の表のとおりです。<code className={codeInline}>0.01</code> と入れて <code className={codeInline}>/100/12</code> にすると <strong>83,459円</strong> という、それらしく見えるのに間違った数字が出ます。<strong>桁が同じなので気づけません。</strong>金利のセルに何を入れたかを必ず確認してください。
          </p>
          <p className={p}>
            <strong>返済回数を年数のまま入れてしまう</strong> — <code className={codeInline}>B3</code> に30と入れて <code className={codeInline}>=PMT(..., B3, ...)</code> としてしまうケースです。この場合 <strong>1,012,969円</strong> と出ます。<code className={codeInline}>B3*12</code> が必要です。
          </p>
          <p className={p}>
            <strong>銀行の償還予定表と1円まで合わせようとする</strong> — 実際の金融機関は円未満を丸めており、丸め方も一律ではありません。自分の表と数十円〜数百円ずれるのは正常です。<strong>判断には影響しないので、合わせようとしないでください。</strong>
          </p>
        </section>

        {/* 計算ツール */}
        <section id="calculator">
          <h2 className={h2}>自分の数字で計算する</h2>
          <p className={p}>
            ここまでの表は代表的なケースです。実際の判断は、あなたの残高・残り年数・現在の金利で計算する必要があります。
          </p>
          {/* 2026-08-01：この記事の主題は償還表なので、ツールは既定の「借り換え・金利」モードのまま
              （defaultMode を指定しない＝記事1〜5・ハブと同じ書き方）。 */}
          <LoanCalculator articlePath={PAGE_PATH} />
          <p className={p}>
            入力するのは、残高・残り年数・現在の金利・金利タイプの4つだけです。年収・資産・生活費はお聞きしません。
          </p>
          <p className={p}>
            <strong>計算した結果は、数式が入ったExcelファイルとしてダウンロードできます。</strong>値だけを書き出したものではないので、ファイルを開いてから残高や金利を書き換えれば、返済予定表がその場で計算し直されます。手元で管理を続けたい方はこちらをお使いください。
          </p>
          <p className={p}>
            なお、ツールを「繰り上げ返済」に切り替えて計算すると、繰り上げ額を入れる欄が増え、<strong>繰り上げ返済の効果を計算するシートもファイルに追加されます</strong>。この記事の「繰り上げ返済を表に組み込む」で説明した内容を、自分の数字で確かめられます。
          </p>
        </section>

        <FaqSection id="faq" heading="返済予定表をエクセルで作ることに関するよくある質問" faqs={FAQS} />

        <SourcesAndDisclaimer
          id="sources"
          assumptions={[
            '毎月の返済額が一定になる返し方(元利均等返済)を基本とし、元金均等返済は該当の節で別に扱っています。いずれもボーナス払いなしで計算しています。',
            '記事内の数値は、借入額3,000万円・年利1.0%・返済期間30年を代表ケースとして計算しています。',
            '円未満の端数処理は行わずに計算しています。実際の金融機関の請求額とは数十円〜数百円の差が生じることがあります。',
            '記事内のすべての数式と数値は、実際に表計算ソフト(LibreOffice Calc)でシートを作成し、記事に記載した式をそのまま入力して計算した結果と一致することを確認しています(2026年7月31日実施)。PMT関数・NPER関数の挙動、償還表の各行の値、総返済額・総利息の合計、元金均等返済との差、繰り上げ返済後の残高と回数がその対象です。',
            '金利は完済まで変わらないと仮定した計算です。',
            '未払利息が発生する金利は「毎月の返済額×12÷残高」で算出しています。実際には日割り計算や約定日の扱いによって差が生じます。',
            '繰り上げ返済の例では、繰り上げ手数料を含めていません。',
          ]}
          sources={[]}
          disclaimer="本記事は一般的な情報と、入力された数字にもとづく試算を提供するものです。特定の金融商品・金融機関の推奨や、投資助言・金融商品の販売勧誘を行うものではありません。Microsoft Excel および Google スプレッドシートは各社の製品であり、当サイトとは関係ありません。関数の仕様は各製品のバージョンによって異なる場合があります。実際の返済額・返済予定については、必ず借入先の金融機関の書面をご確認ください。"
        />

        <p className="mt-8 text-[14px]">
          <Link href="/loan" className={linkCls}>← 住宅ローンの記事一覧へ</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
