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
const PAGE_PATH = '/loan/karikae/timing';
const PAGE_TITLE = '住宅ローンの借り換えはいつがベストなタイミングか';
const PAGE_DESCRIPTION =
  '住宅ローンの借り換えのタイミングは、金利ではなく自分の条件で決まります。金利の底は誰にも予測できません。残りの返済期間が10年を切ると費用倒れになりやすく、1年待つだけでメリットは7万〜18万円減ります。';
const DATE_PUBLISHED = '2026-07-29';
const DATE_MODIFIED = '2026-07-29';
/* メインビジュアル（H1・最終更新日の下に表示し、Article の image にも使う） */
const VISUAL: MainVisual = {
  src: '/loan/karikae-timing.webp',
  alt: '時間の経過とともに借り換えメリットが減ることを表した図',
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
  { id: 'conclusion', label: '結論：借り換えのタイミングは、金利ではなく自分の条件で決まる' },
  { id: 'years-not-elapsed', label: '「何年目から借り換えるべきか」という考え方は正しいのか' },
  { id: 'wait-cost', label: '1年待つと、借り換えのメリットはいくら減るか' },
  { id: 'four-changes', label: '時間とともに変わる4つの条件' },
  { id: 'no-rush', label: '逆に、いま動かなくていい人' },
  { id: 'triggers', label: '借り換えを考える節目になるとき' },
  { id: 'how-long', label: '手続きにはどれくらいかかるか' },
  { id: 'waiting', label: '「金利が下がるまで待つ」は成立するか' },
  { id: 'calculator', label: '自分の数字で計算する' },
  { id: 'faq', label: '住宅ローンの借り換えのタイミングに関するよくある質問' },
  { id: 'sources', label: 'この記事の前提と出典' },
];

/* ===== FAQ（表示と JSON-LD の両方をこの配列から作る） ===== */
const FAQS: Faq[] = [
  {
    q: '借り換えは何年目からできますか？',
    a: '多くの金融機関では、返済を一定期間（半年〜1年程度）続けていることを条件としています。ただし「何年目からが得か」は経過年数ではなく残りの返済期間で決まります。残り10年を切ると、金利差0.5%程度では費用倒れになる可能性が高くなります。',
  },
  {
    q: '金利が下がるのを待ったほうがいいですか？',
    a: '金利の先行きは予測できません。一方で、待てば残りの返済期間が短くなり、メリットは確実に減ります。残高3,000万円・残り20年なら、1年待つことで約12万円のメリットが失われる計算です。',
  },
  {
    q: '手続きにはどれくらいかかりますか？',
    a: '申し込みから実行まで、おおむね1〜2か月です。事前審査、本審査、契約、一括返済と登記手続きという流れになります。',
  },
  {
    q: '何歳まで借り換えできますか？',
    a: '多くの金融機関が完済時の年齢の上限を80歳未満、申し込み時の年齢の上限を70歳未満としています。金融機関によって条件は異なるため、個別に確認してください。年齢が上がるほど組める返済期間は短くなります。',
  },
  {
    q: '健康状態が悪いと借り換えできませんか？',
    a: '団体信用生命保険への加入が原則必要なため、健康状態によっては借り換えができない場合があります。持病がある方向けの「ワイド団信」を扱う金融機関もありますが、金利が上乗せされるのが一般的です。',
  },
  {
    q: '転職を予定しているのですが、借り換えは転職の前後どちらがいいですか？',
    a: '一般に、転職直後は勤続年数が短くなるため審査が通りにくくなります。借り換えを検討しているなら、転職前に済ませておくほうが選択肢は広がります。ただし個別の審査基準は金融機関によって異なります。',
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
    { name: '借り換えのタイミング', path: PAGE_PATH },
  ],
  faqs: FAQS,
  visual: VISUAL,
});

const h2 = 'mt-10 scroll-mt-20 text-[20px] font-bold text-slate-900 sm:text-[22px]';
const h3 = 'mt-6 text-[16px] font-bold text-slate-900 sm:text-[17px]';
const p = 'mt-3 text-[15px] leading-relaxed text-slate-700';

export default function KarikaeTimingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Breadcrumb
          crumbs={[
            { name: '住宅ローン', path: '/loan' },
            { name: '借り換え', path: '/loan/karikae' },
            { name: '借り換えのタイミング', path: PAGE_PATH },
          ]}
        />

        <h1 className="text-[24px] font-bold leading-tight text-slate-900 sm:text-[30px]">
          住宅ローンの借り換えはいつがベストなタイミングか｜判断できることとできないこと
        </h1>
        <ArticleUpdatedAt dateModified={DATE_MODIFIED} />
        <ArticleVisual visual={VISUAL} />

        <Toc items={TOC} />

        {/* 結論 */}
        <section id="conclusion">
          <h2 className={h2}>結論：借り換えのタイミングは、金利ではなく自分の条件で決まる</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700">
            <li><strong>金利がいつ底になるかは、誰にも予測できません。</strong>「もう少し下がってから」という判断は、根拠のない賭けになります。</li>
            <li>一方で、<strong>判断できるのは自分の条件です。</strong>残りの返済期間と年齢は、確実に一方向にしか進みません。健康状態や勤務先は良くも悪くも変わりますが、<strong>変わったときに借り換えができなくなる可能性があります。</strong>「必要になったら借り換えればいい」という前提は、必ずしも成り立ちません。</li>
            <li><strong>残りの返済期間が10年を切ると、金利差0.5%程度では費用のほうが上回ります。</strong>残高3,000万円・残り10年なら、借り換えても約8万円の損です。</li>
            <li><strong>1年待つだけで、借り換えのメリットは7万〜18万円減ります。</strong>残高と残り期間が減るためです。</li>
            <li>借り換えの手続きには<strong>1〜2か月</strong>かかります。その間に借り換え先の金利が0.25%上がると、残高3,000万円・残り20年のケースで<strong>メリットが+76万円から−5万円に反転します。</strong></li>
          </ul>
          <p className={p}>
            つまり、<strong>判断すべきは「金利が下がるか」ではなく「自分の条件で、いま元が取れるか」</strong>です。
          </p>
        </section>

        {/* 経過年数ではなく残り年数 */}
        <section id="years-not-elapsed">
          <h2 className={h2}>「何年目から借り換えるべきか」という考え方は正しいのか</h2>
          <p className={p}>
            「借りて何年目から借り換えるのが得か」という質問をよく見かけますが、<strong>経過年数は判断材料になりません。</strong>決めるのは<strong>残りの返済期間</strong>です。
          </p>
          <p className={p}>
            残高3,000万円・金利差0.5%（年1.5%→年1.0%）の場合、残り年数によって結果はこう変わります。
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
                <tr><td className={tdCls}>30年</td><td className={tdCls}>+166万円</td></tr>
                <tr><td className={tdCls}>25年</td><td className={tdCls}>+120万円</td></tr>
                <tr><td className={tdCls}>20年</td><td className={tdCls}>+76万円</td></tr>
                <tr><td className={tdCls}>15年</td><td className={tdCls}>+33万円</td></tr>
                <tr><td className={tdCls}><strong>10年</strong></td><td className={tdCls}><strong>−8万円</strong></td></tr>
                <tr><td className={tdCls}>7年</td><td className={tdCls}>−33万円</td></tr>
                <tr><td className={tdCls}>5年</td><td className={tdCls}>−48万円</td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>残り10年前後が分かれ目です。</strong>これより短いと、借り換え費用（残高3,000万円で約87万円）を金利差で回収しきれません。
          </p>
          <p className={p}>
            同じ「借りて10年目」でも、35年ローンなら残り25年でメリットが出ますし、20年ローンなら残り10年で費用倒れになります。<strong>経過年数ではなく、残り年数で考えてください。</strong>
          </p>
          <p className={p}>
            → 費用の内訳は「<Link href="/loan/karikae/hiyou" className="text-blue-700 underline hover:no-underline">住宅ローンの借り換え費用はいくら？</Link>」で解説しています。
          </p>
        </section>

        {/* 1年待つコスト */}
        <section id="wait-cost">
          <h2 className={h2}>1年待つと、借り換えのメリットはいくら減るか</h2>
          <p className={p}>
            「もう少し様子を見よう」と1年待った場合、どれだけメリットが減るかを計算しました（現在1.5%→借り換え後1.0%。待っている間も返済は進み、残高と残り期間が減ります）。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>残高</th>
                  <th className={thCls}>残り年数</th>
                  <th className={thCls}>いま実行</th>
                  <th className={thCls}>1年後に実行</th>
                  <th className={thCls}>差</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>15年</td><td className={tdCls}>+19万円</td><td className={tdCls}>+12万円</td><td className={tdCls}><strong>−7万円</strong></td></tr>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>20年</td><td className={tdCls}>+48万円</td><td className={tdCls}>+40万円</td><td className={tdCls}><strong>−8万円</strong></td></tr>
                <tr><td className={tdCls}>2,000万円</td><td className={tdCls}>30年</td><td className={tdCls}>+108万円</td><td className={tdCls}>+99万円</td><td className={tdCls}><strong>−9万円</strong></td></tr>
                <tr><td className={tdCls}>3,000万円</td><td className={tdCls}>15年</td><td className={tdCls}>+33万円</td><td className={tdCls}>+23万円</td><td className={tdCls}><strong>−10万円</strong></td></tr>
                <tr><td className={tdCls}>3,000万円</td><td className={tdCls}>20年</td><td className={tdCls}>+76万円</td><td className={tdCls}>+64万円</td><td className={tdCls}><strong>−12万円</strong></td></tr>
                <tr><td className={tdCls}>3,000万円</td><td className={tdCls}>30年</td><td className={tdCls}>+166万円</td><td className={tdCls}>+153万円</td><td className={tdCls}><strong>−14万円</strong></td></tr>
                <tr><td className={tdCls}>4,000万円</td><td className={tdCls}>20年</td><td className={tdCls}>+104万円</td><td className={tdCls}>+88万円</td><td className={tdCls}><strong>−16万円</strong></td></tr>
                <tr><td className={tdCls}>4,000万円</td><td className={tdCls}>30年</td><td className={tdCls}>+225万円</td><td className={tdCls}>+207万円</td><td className={tdCls}><strong>−18万円</strong></td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>待つこと自体に、年7万〜18万円のコストがかかります。</strong>これは金利が変わらなかった場合の数字です。金利が動けば、この上に変動分が乗ります。
          </p>
        </section>

        {/* 4つの条件 */}
        <section id="four-changes">
          <h2 className={h2}>時間とともに変わる4つの条件</h2>
          <p className={p}>
            金利の先行きは分かりませんが、次の4つは時間とともに変わります。<strong>前の2つは確実に一方向へ、後の2つは予測できない形で</strong>変わります。
          </p>

          <h3 className={h3}>残りの返済期間（確実に減ります）</h3>
          <p className={p}>
            上の表のとおりです。<strong>1年経つごとに、借り換えで得られる金額は確実に減ります。</strong>そして残り10年を切ると、多くの場合マイナスになります。
          </p>

          <h3 className={h3}>年齢（確実に上がります）</h3>
          <p className={p}>
            多くの金融機関では、<strong>完済時の年齢の上限を80歳未満</strong>としています。これは団体信用生命保険（団信）の保障期間が80歳の誕生日までとされているためです。申し込み時の年齢についても、70歳未満としている金融機関が多くなっています。
          </p>
          <p className={p}>
            借り換えは新しい借入なので、この条件が改めて適用されます。<strong>年齢が上がるほど、組める返済期間は短くなります。</strong>
          </p>

          <h3 className={h3}>健康状態（良くも悪くも変わります）</h3>
          <p className={p}>
            住宅ローンの借り換えでは、原則として団信への加入が必要です。<strong>健康状態によっては加入できず、借り換えそのものができません。</strong>
          </p>
          <p className={p}>
            健康状態は改善することもあります。ただし、<strong>悪化したときには借り換えという選択肢そのものが失われる</strong>点は意識しておく必要があります。持病がある場合でも加入できる「ワイド団信」を扱う金融機関もありますが、金利が上乗せされるのが一般的です。
          </p>

          <h3 className={h3}>勤務先・収入（良くも悪くも変わります）</h3>
          <p className={p}>
            借り換えの審査は、新規の借入と同じように行われます。収入が増えれば審査は通りやすくなりますが、<strong>転職直後、独立直後、収入が減った、といった状況では通りにくくなります。</strong>
          </p>
          <p className={p}>
            つまり、<strong>「必要になったら借り換えればいい」という前提は、必ずしも成り立ちません。</strong>選べるうちに選べるかどうかを確認しておく、という考え方が現実的です。
          </p>
        </section>

        {/* 動かなくていい人 */}
        <section id="no-rush">
          <h2 className={h2}>逆に、いま動かなくていい人</h2>
          <p className={p}>急ぐ必要がないケースもあります。</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-700">
            <li><strong>残りの返済期間が10年前後、またはそれより短い人。</strong>上の表のとおり、費用倒れになる可能性が高い。無理に動く理由はありません。</li>
            <li><strong>金利差が0.3%未満の人。</strong>残高と残り期間が大きければメリットが出ることもありますが、条件は厳しくなります。実際に計算してから判断してください。</li>
            <li><strong>近いうちに転職や独立を予定している人。</strong>むしろ<strong>その前に</strong>動くべきかを検討してください。転職後は審査が通りにくくなります。</li>
            <li><strong>数年以内に売却を検討している人。</strong>借り換え費用を回収する前に完済することになります。</li>
          </ul>
          <p className={p}>
            <strong>住宅ローン控除を受けている人</strong>も、動く前に確認が必要です。借り換え後の返済期間を10年未満にすると控除の対象から外れ、残高2,000万円で控除期間があと5年なら約70万円を失います。「<Link href="/loan/karikae/demerit" className="text-blue-700 underline hover:no-underline">住宅ローン借り換えのデメリット</Link>」で整理しています。
          </p>
        </section>

        {/* 節目 */}
        <section id="triggers">
          <h2 className={h2}>借り換えを考える節目になるとき</h2>
          <p className={p}>
            <strong>固定期間選択型の期間が終わるとき。</strong>当初10年固定などの期間が終わると、優遇幅が変わって金利が上がることがあります。<strong>終了の数か月前</strong>から準備を始めるのが現実的です。
          </p>
          <p className={p}>
            <strong>変動金利の見直しがあったとき。</strong>多くの金融機関では年2回（4月と10月）に金利を見直し、その2か月後（6月・12月）の返済分から新しい金利が適用されます。<strong>返済額が変わったタイミングは、自分の条件を確認する機会</strong>になります。
          </p>
          <p className={p}>
            <strong>収入や家族構成が変わる前。</strong>転職、独立、出産、配偶者の退職など、審査に影響しうる変化の<strong>前</strong>に検討しておくと選択肢が広がります。
          </p>
        </section>

        {/* 手続き期間 */}
        <section id="how-long">
          <h2 className={h2}>手続きにはどれくらいかかるか</h2>
          <p className={p}>
            借り換えの手続きは、申し込みから実行まで<strong>おおむね1〜2か月</strong>かかります。事前審査、本審査、契約、そして現在の借入先への一括返済と抵当権の抹消・設定という流れになるためです。
          </p>
          <p className={p}><strong>この期間が持つ意味は、思ったより大きいです。</strong></p>
          <p className={p}>
            残高3,000万円・残り20年・現在1.5%の人が、1.0%に借り換えるつもりで手続きを始めたとします。
          </p>
          <TableScroll>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th className={thCls}>実際に借り換えられた金利</th>
                  <th className={thCls}>費用を引いた後</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className={tdCls}>1.00%（想定どおり）</td><td className={tdCls}><strong>+76万円</strong></td></tr>
                <tr><td className={tdCls}>1.25%（0.25%上昇）</td><td className={tdCls}><strong>−5万円</strong></td></tr>
                <tr><td className={tdCls}>1.50%（0.5%上昇）</td><td className={tdCls}><strong>−87万円</strong></td></tr>
              </tbody>
            </table>
          </TableScroll>
          <p className={p}>
            <strong>借り換え先の金利が0.25%上がるだけで、メリットは消えます。</strong>
          </p>
          <p className={p}>
            これは、金利差0.5%程度の借り換えが<strong>非常に薄い利ざやの上に成り立っている</strong>ことを示しています。金利差が小さい借り換えを検討する場合は、<strong>適用金利がいつ確定するのか</strong>を金融機関に確認してください。
          </p>
        </section>

        {/* 待つは成立するか */}
        <section id="waiting">
          <h2 className={h2}>「金利が下がるまで待つ」は成立するか</h2>
          <p className={p}>
            この記事では、<strong>金利の先行きを予測しません。</strong>私たちにも分からないからです。
          </p>
          <p className={p}>
            ただし、<strong>待つことのコストは計算できます。</strong>上で見たとおり、1年待てば7万〜18万円のメリットが失われます。もし待った先で金利が0.2%下がったとしても、失った分を取り戻せるとは限りません。
          </p>
          <p className={p}>
            そして、<strong>変動金利で借りている場合は、待つ間に金利が上がるリスクも同時に負っています。</strong>金利が上がったときに返済がどうなるか、固定に変えるべきかについては、別記事で扱っています。
          </p>
          <p className={p}>
            → 「<Link href="/loan/hendo-kotei" className="text-blue-700 underline hover:no-underline">住宅ローンは変動と固定どちらがいいか</Link>」
          </p>
          <p className={p}>
            <strong>判断できるのは、いまの自分の条件で元が取れるかどうかだけです。</strong>それを計算したうえで、取れるなら動く、取れないなら動かない。金利の予測を判断の軸にしないことをおすすめします。
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

        <FaqSection id="faq" heading="住宅ローンの借り換えのタイミングに関するよくある質問" faqs={FAQS} />

        <SourcesAndDisclaimer
          id="sources"
          assumptions={[
            '毎月の返済額が一定になる返し方（元利均等返済）、ボーナス払いなしで計算しています。',
            '「1年待った場合」の試算は、1年間は現在の金利で返済を続け、残高と残り期間が減った状態で借り換えるものとして計算しています。',
            '借り換え費用は、事務手数料を借入額の2.2%、抵当権設定の登録免許税を借入額の0.4%、抵当権抹消の登録免許税を2,000円、司法書士報酬を7万円、印紙税を2万円として概算しています（合計で借入額の約2.6%＋約9万円）。',
            '正味メリットは「借り換えによって減る総返済額 − 借り換え費用」で計算しています。金利は完済まで変わらないと仮定した単純な比較です。',
            '年齢・団信・審査に関する記載は一般的な傾向であり、条件は金融機関によって異なります。',
          ]}
          sources={[
            '国税庁「No.7191 登録免許税の税額表」「No.7140 印紙税額の一覧表（その1）第1号文書から第4号文書まで」',
            '各金融機関が公表している住宅ローンの申込条件（完済時年齢・申込時年齢・団信の加入要件）',
          ]}
          disclaimer="本記事は一般的な情報と、入力された数字にもとづく試算を提供するものです。特定の金融商品・金融機関の推奨や、投資助言・金融商品の販売勧誘を行うものではありません。審査基準・費用・商品条件は金融機関によって異なり、また変動します。実際の借り換えの判断にあたっては、必ず各金融機関の最新の条件をご確認ください。"
        />

        <p className="mt-8 text-[14px]">
          <Link href="/loan/karikae" className="text-blue-700 underline hover:no-underline">← 借り換えの記事一覧へ</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
