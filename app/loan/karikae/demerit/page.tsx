import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import LoanCalculator from '@/components/loan/LoanCalculator';
import {
  Breadcrumb, Toc, FaqSection, SourcesAndDisclaimer, TableScroll, ArticleUpdatedAt, ArticleVisual,
  buildArticleJsonLd, buildArticleMetadata, tableCls, thCls, tdCls,
  type Faq, type TocItem, type MainVisual,
} from '@/components/loan/LoanArticle';

/* ===== メタ情報 ===== */
const PAGE_PATH = '/loan/karikae/demerit';
const PAGE_TITLE = '住宅ローン借り換えのデメリット｜損をする6つのケース';
const PAGE_DESCRIPTION =
  '住宅ローンの借り換えで損をするのは主に6つのケースです。費用を回収できない、住宅ローン控除が受けられなくなる（約70万円の損）、月々の返済が下がっても総額では87万円増える、など数字で確認します。';
const DATE_PUBLISHED = '2026-07-29';
const DATE_MODIFIED = '2026-07-29';
/* メインビジュアル（H1・最終更新日の下に表示し、Article の image にも使う） */
const VISUAL: MainVisual = {
  src: '/loan/karikae-demerit.webp',
  alt: '見えにくい部分に費用が隠れていることを表した図',
};

export const metadata = buildArticleMetadata({
  path: PAGE_PATH,
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
});

/* ===== 目次（H2 と対応） ===== */
const TOC: TocItem[] = [
  { id: 'conclusion', label: '結論：借り換えで損をするのは、主に次の6つのケースです' },
  { id: 'cost', label: 'デメリット1：費用を回収できないことがある' },
  { id: 'tax-credit', label: 'デメリット2：住宅ローン控除が受けられなくなる場合がある' },
  { id: 'roll-in', label: 'デメリット3：諸費用を借入額に組み込むと、控除額が減る' },
  { id: 'extend', label: 'デメリット4：月々の返済額が下がっても、総返済額は増えることがある' },
  { id: 'insurance', label: 'デメリット5：団信の保障内容が変わることがある' },
  { id: 'screening', label: 'デメリット6：審査に落ちる可能性がある' },
  { id: 'effort', label: 'デメリット7として挙げられがちなこと：手続きの手間' },
  { id: 'worth-it', label: 'それでも借り換えを検討する価値がある人' },
  { id: 'calculator', label: '自分の数字で計算する' },
  { id: 'faq', label: '住宅ローン借り換えのデメリットに関するよくある質問' },
  { id: 'sources', label: 'この記事の前提と出典' },
];

/* ===== FAQ（表示と JSON-LD の両方をこの配列から作る・6問） ===== */
const FAQS: Faq[] = [
  {
    q: '借り換えると住宅ローン控除は使えなくなりますか？',
    a: '一定の要件を満たせば引き続き受けられます。要件は「新しい住宅ローンが当初の住宅ローンの返済のためのものであることが明らかであること」と「新しい住宅ローンが10年以上の償還期間であることなど、控除の対象となる要件に当てはまること」です。返済期間を10年未満にすると対象から外れます。',
  },
  {
    q: '諸費用をローンに組み込むと何が起きますか？',
    a: '利息が増えます（残高3,000万円・残り30年で約14万円）。加えて、住宅ローン控除の対象になる残高が国税庁の定める按分の計算により小さくなり、控除額が減ります（10年で約5万円程度）。',
  },
  {
    q: '月々の返済額が下がるなら、得ではないのですか？',
    a: '返済期間を延ばした場合、月々は下がっても総返済額は増えることがあります。残高3,000万円・残り20年の人が30年に延ばすと、月々は約4万8,000円下がりますが、総額では約87万円増えます。目的が月々の負担軽減なら合理的ですが、「得をした」とは限りません。',
  },
  {
    q: '借り換えの審査に落ちたら費用はかかりますか？',
    a: '事前審査（仮審査）の段階では費用は発生しないのが一般的です。本審査を通過して契約に進んだ後にキャンセルする場合は、金融機関によって扱いが異なるため、事前に確認してください。',
  },
  {
    q: '団信の保障は同じですか？',
    a: '借り換え先の団信に新たに加入するため、内容が同じとは限りません。がん保障などの特約を付けている場合は、借り換え先に同等の商品があるか、金利の上乗せ幅はどうかを確認してください。',
  },
  {
    q: '借り換えないほうがいいのはどんな人ですか？',
    a: '残りの返済期間が10年前後またはそれより短い人、金利差が0.3%未満の人、住宅ローン控除の期間がまだ残っていて返済期間を10年以上に保てない人、近いうちに転職や売却を予定している人です。',
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
    { name: '借り換えのデメリット', path: PAGE_PATH },
  ],
  faqs: FAQS,
  visual: VISUAL,
});

const h2 = 'mt-10 scroll-mt-20 text-[20px] font-bold text-slate-900 sm:text-[22px]';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';
const quote = 'mt-3 rounded-lg border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-[15px] font-bold leading-relaxed text-slate-800';

export default function KarikaeDemeritPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Breadcrumb
          crumbs={[
            { name: '住宅ローン', path: '/loan' },
            { name: '借り換え', path: '/loan/karikae' },
            { name: '借り換えのデメリット', path: PAGE_PATH },
          ]}
        />

        <h1 className="text-[24px] font-bold leading-tight text-slate-900 sm:text-[30px]">
          住宅ローン借り換えのデメリット｜損をする6つのケースと確認すべきこと
        </h1>
        <ArticleUpdatedAt dateModified={DATE_MODIFIED} />
        <ArticleVisual visual={VISUAL} />

        <Toc items={TOC} />

        {/* 結論 */}
        <section id="conclusion">
          <h2 className={h2}>結論：借り換えで損をするのは、主に次の6つのケースです</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700">
            <li><strong>費用を回収できない</strong>：残りの返済期間が10年を切ると、金利差0.5%程度では費用のほうが上回ります。</li>
            <li><strong>住宅ローン控除が受けられなくなる</strong>：借り換え後の返済期間を10年未満にすると、控除の対象から外れます。残高2,000万円で控除期間があと5年残っていれば、<strong>約70万円を失う</strong>計算です。</li>
            <li><strong>諸費用を借入額に組み込むと、控除額が減る</strong>：国税庁が定める按分の計算により、控除の対象になる残高が小さくなります。</li>
            <li><strong>月々の返済額が下がっても、総返済額が増える</strong>：返済期間を延ばした場合です。月々が約4.8万円下がるのに、<strong>総額では87万円増える</strong>ケースがあります。</li>
            <li><strong>団信の保障内容が変わることがある</strong>：現在の団信に付けている特約と同じ内容が、借り換え先にあるとは限りません。</li>
            <li><strong>審査に落ちる</strong>：借り換えは新規の借入と同じ審査を受けます。</li>
          </ul>
          <p className={p}>以下、それぞれ数字で確認します。</p>
        </section>

        {/* デメリット1 */}
        <section id="cost">
          <h2 className={h2}>デメリット1：費用を回収できないことがある</h2>
          <p className={p}>
            借り換えには<strong>借入額の2.8〜3.4%程度</strong>の費用がかかります。残高3,000万円なら約87万円です。
          </p>
          <p className={p}>
            この費用を金利差で回収できなければ、借り換えは損になります。残高3,000万円・金利差0.5%（年1.5%→年1.0%）の場合、残りの返済期間によって結果はこう変わります。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>残りの返済期間</th>
                  <th className={thCls}>費用を引いた後</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>20年</td><td className={tdCls}>+76万円</td></tr>
                <tr><td className={tdCls}>15年</td><td className={tdCls}>+33万円</td></tr>
                <tr><td className={tdCls}><strong>10年</strong></td><td className={tdCls}><strong>−8万円</strong></td></tr>
                <tr><td className={tdCls}>7年</td><td className={tdCls}>−33万円</td></tr>
                <tr><td className={tdCls}>5年</td><td className={tdCls}>−48万円</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>残り10年前後が分かれ目</strong>です。これより短ければ、金利が下がっても損になります。
          </p>
          <p className={p}>
            → 費用の内訳は「<Link href="/loan/karikae/hiyou" className="text-blue-700 underline hover:no-underline">住宅ローンの借り換え費用はいくら？</Link>」で解説しています。
          </p>
        </section>

        {/* デメリット2 */}
        <section id="tax-credit">
          <h2 className={h2}>デメリット2：住宅ローン控除が受けられなくなる場合がある</h2>
          <p className={p}><strong>これは見落とされやすく、金額の影響が大きい落とし穴です。</strong></p>
          <p className={p}>
            国税庁の説明によれば、借り換えによる新しい住宅ローンは、従前の住宅ローンを消滅させるための新たな借入金であるため、<strong>原則として住宅ローン控除の対象とはなりません。</strong>
          </p>
          <p className={p}>ただし、次のすべての要件を満たす場合には、引き続き控除を受けられるとされています。</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-[15px] leading-relaxed text-slate-700">
            <li>新しい住宅ローン等が<strong>当初の住宅ローン等の返済のためのもの</strong>であることが明らかであること</li>
            <li>新しい住宅ローン等が<strong>10年以上の償還期間</strong>であることなど、住宅ローン控除の対象となる要件に当てはまること</li>
          </ol>
          <p className={p}><strong>問題になるのは2番目です。</strong></p>
          <p className={p}>
            借り換えを機に返済期間を短くする人は少なくありません。しかし<strong>返済期間を10年未満に設定すると、その時点で控除の対象から外れます。</strong>
          </p>
          <p className={p}>控除額は年末残高の0.7%です。失う金額を計算すると、次のようになります。</p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>残高</th>
                  <th className={thCls}>控除期間の残り</th>
                  <th className={thCls}>失う金額</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>1,500万円</td><td className={tdCls}>3年</td><td className={tdCls}>約32万円</td></tr>
                <tr><td className={tdCls}>1,500万円</td><td className={tdCls}>5年</td><td className={tdCls}>約52万円</td></tr>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>3年</td><td className={tdCls}>約42万円</td></tr>
                <tr><td className={tdCls}><strong>2,000万円</strong></td><td className={tdCls}><strong>5年</strong></td><td className={tdCls}><strong>約70万円</strong></td></tr>
                <tr><td className={tdCls}>2,500万円</td><td className={tdCls}>5年</td><td className={tdCls}>約88万円</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}><strong>借り換えで得られるメリットを、控除の喪失が上回る可能性があります。</strong></p>
          <p className={p}>
            なお、控除を受けられる年数は居住を開始した年から数えた一定期間であり、<strong>借り換えによって延長されることはありません。</strong>
          </p>
          <p className={p}>
            <strong>確認すべきこと</strong>：いま住宅ローン控除を受けているなら、まず<strong>控除期間があと何年残っているか</strong>を確認してください。そのうえで、借り換え後の返済期間を10年以上に保てるかを検討します。
          </p>
        </section>

        {/* デメリット3 */}
        <section id="roll-in">
          <h2 className={h2}>デメリット3：諸費用を借入額に組み込むと、控除額が減る</h2>
          <p className={p}>
            借り換えの諸費用は、借入額に組み込めることが多くあります。ただし<strong>組み込んだ場合、住宅ローン控除の対象になる残高が小さくなります。</strong>
          </p>
          <p className={p}>
            国税庁の計算方法では、借り換え後の借入額が借り換え直前の残高を上回る場合、控除の対象となる年末残高は次の式で求めます。
          </p>
          <p className={quote}>控除対象額 ＝ 年末残高 × 借り換え直前の残高 ÷ 新しい借入額</p>
          <p className={p}>具体例で示します。</p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>項目</th>
                  <th className={thCls}>金額</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>借り換え直前の残高</td><td className={tdCls}>2,800万円</td></tr>
                <tr><td className={tdCls}>諸費用（約82万円）を組み込んだ新しい借入額</td><td className={tdCls}>2,882万円</td></tr>
                <tr><td className={tdCls}>年末残高</td><td className={tdCls}>2,750万円</td></tr>
                <tr><td className={tdCls}>按分率（2,800万 ÷ 2,882万）</td><td className={tdCls}>0.9715</td></tr>
                <tr><td className={tdCls}><strong>控除の対象になる額</strong></td><td className={tdCls}><strong>2,672万円</strong>（按分しなければ2,750万円）</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            この差により、控除額は年約5,500円、<strong>10年間で約5万円</strong>減る計算になります。
          </p>
          <p className={p}>
            金額としては大きくありませんが、<strong>「諸費用を組み込めば手元の現金が減らない」という説明だけでは足りない</strong>ということです。組み込みには、利息の増加（残高3,000万円・残り30年で約14万円）に加えて、この控除の減少も伴います。
          </p>
        </section>

        {/* デメリット4 */}
        <section id="extend">
          <h2 className={h2}>デメリット4：月々の返済額が下がっても、総返済額は増えることがある</h2>
          <p className={p}><strong>これが最も誤解されやすい点です。</strong></p>
          <p className={p}>
            借り換えの際に返済期間を延ばすと、毎月の負担は大きく下がります。しかし総額では増えることがあります。
          </p>
          <p className={p}>
            残高3,000万円・現在1.5%・残り20年の人が、1.0%に借り換えるケースで比較します。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>借り換え後の設定</th>
                  <th className={thCls}>毎月の返済額</th>
                  <th className={thCls}>現在との差</th>
                  <th className={thCls}>総返済額（費用込み）</th>
                  <th className={thCls}>現在との差</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>現状（1.5%・残20年）</td><td className={tdCls}>144,764円</td><td className={tdCls}>—</td><td className={tdCls}>3,474万円</td><td className={tdCls}>—</td></tr>
                <tr><td className={tdCls}>1.0%・<strong>20年</strong>のまま</td><td className={tdCls}>137,968円</td><td className={tdCls}>−6,795円</td><td className={tdCls}>3,398万円</td><td className={tdCls}><strong>−76万円</strong></td></tr>
                <tr><td className={tdCls}>1.0%・<strong>25年</strong>に延長</td><td className={tdCls}>113,062円</td><td className={tdCls}>−31,702円</td><td className={tdCls}>3,479万円</td><td className={tdCls}>+5万円</td></tr>
                <tr><td className={tdCls}>1.0%・<strong>30年</strong>に延長</td><td className={tdCls}>96,492円</td><td className={tdCls}><strong>−48,272円</strong></td><td className={tdCls}>3,561万円</td><td className={tdCls}><strong>+87万円</strong></td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>30年に延ばすと、月々は約4万8,000円も下がります。しかし総額では87万円増えます。</strong>
          </p>
          <p className={p}>
            月々の負担を下げること自体が目的なら、これは合理的な選択です。教育費のピークを乗り切る、収入が下がった、といった事情があるなら意味があります。
          </p>
          <p className={p}>
            <strong>問題は、「月々が下がった」ことだけを見て「得をした」と考えてしまうことです。</strong>返済期間を延ばす提案を受けたときは、必ず総額でも比較してください。
          </p>
        </section>

        {/* デメリット5 */}
        <section id="insurance">
          <h2 className={h2}>デメリット5：団信の保障内容が変わることがある</h2>
          <p className={p}>
            住宅ローンの借り換えでは、<strong>現在の団体信用生命保険（団信）を脱退し、借り換え先の団信に新たに加入します。</strong>
          </p>
          <p className={p}>ここで2つの問題が起こりえます。</p>
          <p className={p}>
            <strong>保障内容が同じとは限りません。</strong>いまの団信に、がん保障や三大疾病保障などの特約を付けている場合、借り換え先に同等の商品があるとは限りません。あっても金利の上乗せ幅が違うことがあります。
          </p>
          <p className={p}>
            <strong>健康状態によっては加入できません。</strong>団信への加入は原則として必要です。借入時から健康状態が変わっていると、加入を断られる可能性があります。持病がある方向けの「ワイド団信」を扱う金融機関もありますが、金利が上乗せされるのが一般的です。
          </p>
          <p className={p}>
            <strong>確認すべきこと</strong>：いまの団信にどんな特約が付いているかを、契約書類で確認してください。金利の比較だけでは、保障の差を見落とします。
          </p>
        </section>

        {/* デメリット6 */}
        <section id="screening">
          <h2 className={h2}>デメリット6：審査に落ちる可能性がある</h2>
          <p className={p}>
            借り換えは新規の借入と同じ審査を受けます。当初の借入時に通ったからといって、いま通るとは限りません。
          </p>
          <p className={p}>
            審査に影響しやすいのは、勤務先や勤続年数（転職・独立の直後）、収入の変動、健康状態、他の借入（自動車ローンやカードローンなど）、そして年齢です。多くの金融機関が完済時の年齢の上限を80歳未満、申し込み時の年齢の上限を70歳未満としています。
          </p>
          <p className={p}>
            また、<strong>物件の担保評価</strong>も見られます。当初の借入時より評価が下がっていると、希望額を借りられないことがあります。
          </p>
          <p className={p}>
            なお、事前審査（仮審査）の段階では費用は発生しないのが一般的です。<strong>まず事前審査を通して、借り換えられるかどうかを確認してから判断する</strong>という進め方ができます。
          </p>
        </section>

        {/* デメリット7 */}
        <section id="effort">
          <h2 className={h2}>デメリット7として挙げられがちなこと：手続きの手間</h2>
          <p className={p}>
            借り換えには<strong>1〜2か月</strong>かかります。事前審査、本審査、契約、そして現在の借入先への一括返済と抵当権の抹消・設定という流れです。書類の準備も必要ですし、金融機関によっては平日の来店を求められます。
          </p>
          <p className={p}>
            ただし、これは「デメリット」というより<strong>コスト</strong>として費用と一緒に判断すべきものです。数十万円のメリットが見込めるなら、1〜2か月の手間は割に合う場合が多いでしょう。逆にメリットが十数万円なら、手間に見合うかは考える余地があります。
          </p>
          <p className={p}>
            → 手続きの時期については「<Link href="/loan/karikae/timing" className="text-blue-700 underline hover:no-underline">住宅ローンの借り換えはいつがベストなタイミングか</Link>」で解説しています。
          </p>
        </section>

        {/* それでも価値がある人 */}
        <section id="worth-it">
          <h2 className={h2}>それでも借り換えを検討する価値がある人</h2>
          <p className={p}>デメリットを並べましたが、条件が合えばメリットは確実にあります。</p>
          <p className={p}>
            <strong>残りの返済期間が15年以上あり、金利差が0.5%以上ある人</strong>は、費用を差し引いても数十万円から百万円単位のメリットが出ます。残高3,000万円・残り20年・金利差0.5%なら+76万円です。
          </p>
          <p className={p}>
            <strong>変動金利で借りていて、金利上昇に耐えられない人</strong>は、損得より先に「返済を続けられるか」で判断する必要があります。この場合、固定への切り替えは総額が増えても合理的な選択になりえます。
          </p>
          <p className={p}>
            → 「<Link href="/loan/hendo-kotei" className="text-blue-700 underline hover:no-underline">住宅ローンは変動と固定どちらがいいか</Link>」
          </p>
          <p className={p}>
            <strong>逆に、残りの返済期間が10年前後、金利差が0.3%未満、住宅ローン控除の期間がまだ残っている</strong>——このいずれかに当てはまるなら、慎重に計算してください。<strong>借り換えないことも、立派な選択です。</strong>
          </p>
        </section>

        {/* 計算ツール */}
        <section id="calculator">
          <h2 className={h2}>自分の数字で計算する</h2>
          <p className={p}>
            ここまでの表は代表的なケースです。実際の判断は、あなたの残高・残り年数・現在の金利で計算する必要があります。<strong>費用のほうが上回る場合は、その旨も表示します。</strong>
          </p>
          <LoanCalculator articlePath={PAGE_PATH} />
        </section>

        <FaqSection id="faq" heading="住宅ローン借り換えのデメリットに関するよくある質問" faqs={FAQS} />

        <SourcesAndDisclaimer
          id="sources"
          assumptions={[
            '毎月の返済額が一定になる返し方（元利均等返済）、ボーナス払いなしで計算しています。',
            '借り換え費用は、事務手数料を借入額の2.2%、抵当権設定の登録免許税を借入額の0.4%、抵当権抹消の登録免許税を2,000円、司法書士報酬を7万円、印紙税を2万円として概算しています（合計で借入額の約2.6%＋約9万円）。',
            '住宅ローン控除の額は、年末残高の0.7%として計算しています。控除率・上限額・対象期間は住宅の種類や居住開始の時期によって異なります。',
            '按分の計算例では、借り換え直前の残高2,800万円、諸費用約82万円を組み込んだ新しい借入額2,882万円、年末残高2,750万円という条件を用いています。',
            '団信・審査に関する記載は一般的な傾向であり、条件は金融機関によって異なります。',
          ]}
          sources={[
            '国税庁「No.1233 住宅ローン等の借換えをしたとき」（借り換え後も控除を受けるための要件、年末残高の按分計算）',
            '国税庁「No.7191 登録免許税の税額表」「No.7140 印紙税額の一覧表（その1）第1号文書から第4号文書まで」',
            '各金融機関が公表している住宅ローンの申込条件（完済時年齢・申込時年齢・団信の加入要件）',
          ]}
          disclaimer="本記事は一般的な情報と、入力された数字にもとづく試算を提供するものです。特定の金融商品・金融機関の推奨や、投資助言・金融商品の販売勧誘を行うものではありません。税制・審査基準・費用・商品条件は変更されることがあり、また金融機関によって異なります。住宅ローン控除の適用可否については、必ず国税庁の最新の情報または税務署にご確認ください。実際の借り換えの判断にあたっては、各金融機関の最新の条件をご確認ください。"
        />

        <p className="mt-8 text-[14px]">
          <Link href="/loan/karikae" className="text-blue-700 underline hover:no-underline">← 借り換えの記事一覧へ</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
