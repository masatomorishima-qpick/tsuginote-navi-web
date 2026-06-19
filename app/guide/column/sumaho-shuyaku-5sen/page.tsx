import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/column/sumaho-shuyaku-5sen';
const PAGE_IMAGE = `${SITE_URL}/images/guide/column/sumaho-shuyaku-5sen-main.webp`;
const PAGE_TITLE = 'この5年で、スマホ1台に集約された機能5選';
const PAGE_DESCRIPTION =
  'お金、きっぷ、診察券、身分証、そして家の鍵まで——この5年でスマホ1台に集まった5つの機能を、公的な数字とともに振り返ります。便利になった一方で、家族が代わりに開けられなくなった。その先にある「史上初めて必要になった一覧」の話。';

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | つぎの手ナビ デジタル資産`,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}${PAGE_PATH}`,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: 'つぎの手ナビ',
    type: 'article',
    locale: 'ja_JP',
    images: [{ url: PAGE_IMAGE, width: 1600, height: 900 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [PAGE_IMAGE],
  },
};

const toc = [
  { id: 'intro', label: 'スマホ1台が、財布にも、鍵にも、身分証にもなった' },
  { id: 'okane', label: '①お金——財布より先に、スマホで払う' },
  { id: 'kippu', label: '②きっぷ・チケット——改札もコンサートもスマホ' },
  { id: 'card', label: '③診察券・会員証——カードの束がアプリの中へ' },
  { id: 'honnin', label: '④本人確認書類——身分証もスマホとカード1枚に' },
  { id: 'kagi', label: '⑤家の鍵——玄関もスマホで開く時代へ' },
  { id: 'core', label: 'ここまでの5つに、共通するひとつの性質' },
  { id: 'modoru', label: 'では、不便だった昔に戻るべきか' },
  { id: 'faq', label: 'ここで出そうな、2つの疑問' },
  { id: 'matome', label: 'まとめ——軽くなった荷物に、一覧を1枚' },
];

const summaryRows = [
  { item: '①お金', dest: 'QRコード決済・スマホのウォレット' },
  { item: '②きっぷ・チケット', dest: 'モバイルSuica・電子チケット' },
  { item: '③診察券・会員証', dest: '各サービスのアプリ' },
  { item: '④本人確認書類', dest: 'マイナンバーカード＋スマホ' },
  { item: '⑤家の鍵', dest: 'スマートロック（これから）' },
];

const faqs = [
  {
    q: 'スマホのパスコードを家族に教えてあるから、大丈夫では？',
    a: '良い備えですが、それは「玄関の鍵」を1本渡しただけの状態です。スマホが開いても、どの銀行のアプリにお金があり、どのサービスに何の契約があるかは、中を一つずつ探さなければ分かりません。さらに、パスコードは機種変更や再設定で変わります。必要なのは鍵そのものより、「どこに何があるか」の一覧のほうです。',
  },
  {
    q: '自分はまだ若いし、元気だから関係ないのでは？',
    a: 'これは年齢の話ではなく、スマホに何でも集約している人ほど当てはまる話です。キャッシュレスもモバイルチケットもマイナ保険証も使いこなしている世代ほど、暮らしがスマホ1台に集まっています。だからこそ、もしものときに家族が直面する難しさは、いちばん大きい。そして備えは15分で終わります。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      image: PAGE_IMAGE,
      mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`,
      datePublished: '2026-06-18',
      dateModified: '2026-06-18',
      inLanguage: 'ja',
      author: {
        '@type': 'Organization',
        name: 'つぎの手ナビ デジタル資産',
        url: SITE_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: 'BlueAdventures',
        url: SITE_URL,
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: '役立ちガイド', item: `${SITE_URL}/guide` },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'コラム',
          item: `${SITE_URL}/guide/column`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'この5年で、スマホ1台に集約された機能5選',
          item: `${SITE_URL}${PAGE_PATH}`,
        },
      ],
    },
  ],
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-14 scroll-mt-24">
      <h2 className="border-b border-slate-200 pb-3 text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
        {title}
      </h2>
      <div className="mt-6 space-y-5 text-[15px] leading-8 text-slate-700">{children}</div>
    </section>
  );
}

const sources = [
  '経済産業省「2025年のキャッシュレス決済比率を算出しました」（2026年3月・新国内指標で58.0%）',
  'JR東日本「モバイルSuica」発行数（2023年3月・2,000万枚突破）／交通系電子マネーの月間利用件数（2024年・3億件超）',
  '総務省「マイナンバーカード交付状況」（2026年1月末時点・保有枚数率81.2%）',
  '政府広報オンライン「マイナ保険証」（2024年12月2日から従来の健康保険証の新規発行終了）',
  '警察庁「マイナンバーカードと運転免許証の一体化（マイナ免許証）」（2025年3月24日運用開始）',
  '富士キメラ総研 住宅用スマートロック市場の予測（年間およそ8万台規模）',
];

export default function SumahoShuyaku5senPage() {
  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GuideHeader />

      <div className="mx-auto max-w-3xl px-5 pb-20 pt-8 sm:px-8">
        <nav className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                ホーム
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/guide" className="text-blue-600 hover:underline">
                役立ちガイド
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/guide/column" className="text-blue-600 hover:underline">
                コラム
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">この5年で、スマホ1台に集約された機能5選</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          コラム｜デジタル資産との付き合い方
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          この5年で、スマホ1台に集約された機能5選
        </h1>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/column/sumaho-shuyaku-5sen-main.webp"
            alt="1台のスマートフォンと、役目を終えつつある財布・鍵・きっぷ・カードを並べた俯瞰"
            width={1600}
            height={900}
            priority
            className="h-auto w-full"
          />
        </div>

        <nav className="mt-10 rounded-2xl bg-slate-50 p-6" aria-label="目次">
          <h2 className="text-sm font-semibold text-slate-900">目次</h2>
          <ol className="mt-4 space-y-2.5 text-[15px] leading-7">
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-blue-600 hover:underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <Section id="intro" title="スマホ1台が、財布にも、鍵にも、身分証にもなった">
          <p>
            朝、家を出るとき、あなたが持つものは何でしょうか。5年前なら、財布、家の鍵、定期入れ、診察券、ポイントカードの束——ポケットや鞄は、それなりに重かったはずです。
          </p>
          <p>
            それが今は、スマホ1台あれば、たいていの用事は足りてしまいます。電車に乗るのも、買い物の支払いも、ポイントを貯めるのも、スマホをかざすだけ。財布を持たずに出かける日も、珍しくなくなりました。
          </p>
          <p>
            これは、とても良い変化です。荷物は軽くなり、レジでもたつくこともなく、ポイントの取りこぼしも減りました。私自身、その身軽さを毎日ありがたく感じている一人です。
          </p>
          <p>
            ただ、この「1台にまとまった」という便利さには、ほとんどの人が気づいていない性質がひとつあります。その話は記事の後半で。まずは、この5年でスマホに集まった5つの機能を、順番に見ていきましょう。①から④は「言われてみれば、確かに」という答え合わせです。そして5つ目に、これから来るものを、ひとつ。
          </p>
        </Section>

        <Section id="okane" title="① お金——財布より先に、スマホで払う">
          <p>いちばん大きく変わったのは、お金の払い方です。</p>
          <p>
            経済産業省が2026年3月に発表した2025年のキャッシュレス決済比率は、
            <strong>58.0%</strong>
            。新しい国内指標での数字ですが、日本の支払いの半分以上が、すでに現金ではなくなった計算です。QRコード決済、タッチ決済、交通系IC。さらにクレジットカードそのものをApple
            PayやGoogleウォレットに登録してしまえば、財布からカードを出す場面すら消えます。
          </p>
          <p>
            支払いだけではありません。残高の確認も、送金も、ネット銀行や証券の操作も、スマホのアプリの中。お金は、生まれてから使われるまで、ずっとスマホの中を流れるようになりました。
          </p>
        </Section>

        <Section id="kippu" title="② きっぷ・チケット——改札も、コンサートも、スマホをかざす">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/column/sumaho-shuyaku-5sen-kessai.webp"
              alt="スマートフォンをかざして支払い・改札を通る、現代の日常の手元"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>紙のきっぷや定期券も、スマホに入りました。</p>
          <p>
            モバイルSuicaの発行数は、2023年3月に
            <strong>2,000万枚</strong>
            を超えました（JR東日本）。交通系の電子マネーは、月間の利用件数が2024年に3億件を超えています。改札を通るのも、バスに乗るのも、スマホかスマートウォッチをかざすだけ。券売機に並ぶ時間も、きっぷをなくす心配も減りました。
          </p>
          <p>
            コンサートやイベントのチケットも、いまや多くが電子チケット。スマホの画面を見せて入場します。紙の半券を財布にしまう、という習慣自体が、少しずつ消えています。
          </p>
        </Section>

        <Section id="card" title="③ 診察券・会員証——カードの束が、アプリの中へ">
          <p>財布を分厚くしていた、もうひとつの犯人がカード類です。</p>
          <p>
            病院の診察券、ドラッグストアやスーパーの会員証、飲食店のスタンプカード。その多くが、アプリのバーコード提示に置き換わりました。病院も予約から受付までアプリで完結するところが増え、診察券を忘れて困る、ということが減っています。
          </p>
          <p>
            財布は薄くなり、カードをなくす心配も減りました。これも、間違いなく前に進んだ変化です。
          </p>
        </Section>

        <Section id="honnin" title="④ 本人確認書類——身分証も、スマホとカード1枚に">
          <p>「自分を証明するもの」も、集約が進んでいます。</p>
          <p>
            マイナンバーカードの保有率は、2026年1月末時点で人口の
            <strong>81.2%</strong>
            （総務省）。健康保険証は2024年12月2日で新規発行が終わり、マイナ保険証が基本になりました。2025年3月24日からは、運転免許証をマイナンバーカードと一体化できる「マイナ免許証」も始まっています（持ち方は選べます）。
          </p>
          <p>
            引き出しや財布に分散していた身分証が、カード1枚と、それを読み取るスマホに集まりつつあります。窓口での手続きも、少しずつ簡単になりました。
          </p>
        </Section>

        <Section id="kagi" title="⑤ 家の鍵——玄関も、スマホで開く時代へ（これから来る5つ目）">
          <p>最後は、まだ途中の話です。家の鍵も、スマホに入り始めています。</p>
          <p>
            スマートロックを使えば、玄関の鍵をスマホで開け閉めできます。鍵を持ち歩かなくてよく、締め出される心配も減り、家族に一時的に開ける権限を渡すこともできます。
          </p>
          <p>
            ただ、これはまだ広く普及した段階ではありません。国内の住宅用スマートロックは、調査会社の予測でも年間およそ8万台規模（富士キメラ総研）で、これからの分野です。とはいえ、お金も、きっぷも、身分証も同じ道をたどってきました。家の鍵がスマホに入るのも、時間の問題かもしれません。
          </p>
        </Section>

        <Section id="core" title="ここまでの5つに、共通するひとつの性質">
          <p>さて、ここで視点を変えます。</p>
          <p>
            ①から⑤まで、お金も、きっぷも、カードも、身分証も、そして鍵までもが、スマホ1台に集まってきました。荷物は軽くなり、暮らしはなめらかになりました。これ自体は、何ひとつ間違っていません。
          </p>
          <p>ただ、この「スマホ1台に集まった」という事実には、裏側があります。一文で言います。</p>
          <p>
            <strong>
              かつては家族の誰もが触れた鍵・カード・きっぷが、いまは本人にしか開けない、たった1台のスマホに集まりました。
            </strong>
          </p>
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/column/sumaho-shuyaku-5sen-lock.webp"
              alt="ロック画面が点灯した、しっかり閉じた1台のスマートフォン"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>
            思い出してください。昔の家の鍵は、玄関に置いておけば家族の誰でも使えました。財布は、開ければ中身が見えました。診察券も保険証も、引き出しを開ければ家族が見つけられた。つまり、家族への引き継ぎは、何もしなくても
            <strong>自動</strong>
            でできていたのです。物が家にあり、家族の目に触れたからです。
          </p>
          <p>
            スマホは違います。顔認証、指紋、パスコード。中身は強固に守られていて、それ自体はとても良いことです。ただし、その鍵を持っているのは、世界であなた一人。そして鍵の内側には、お金も、契約も、身分証も、この記事で見てきた5つ全部が、まとめて入っています。
          </p>
          <p>
            便利さと引き換えに、「家族が代わりに開ける」入口が、静かに消えました。もしものとき——急な入院や事故などで、あなたが自分でスマホを開けられなくなったとき——家族は、どのアプリにお金があり、どこと契約しているのかを、開かないスマホの前で立ち止まることになります。
          </p>
        </Section>

        <Section id="modoru" title="では、不便だった昔に戻るべきか">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/column/sumaho-shuyaku-5sen-list.webp"
              alt="ノートに「どこに何があるか」の一覧を書き出している、穏やかな机の上の手元"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>戻る必要は、まったくありません。</p>
          <p>
            現金に戻せば会計は遅くなり、紙のきっぷに戻せば券売機に並ぶことになり、カードの束を持ち歩けば財布はまた重くなります。この5年の集約は、ぜんぶ正しい。巻き戻すのは損です。
          </p>
          <p>
            足すべきものは、ひとつだけ。
            <strong>「どこに、何があるか」を、本人以外にも分かるようにしておく一覧</strong>
            です。
          </p>
          <p>
            使っている決済サービスの名前、口座のある銀行、契約しているサービス。名前と種類だけのメモで十分です。
            <strong>金額も、暗証番号も、パスワードも書きません。</strong>{' '}
            これだけで、かつて財布や引き出しが自動でやってくれていた「家族に教える」役割を、取り戻せます。作り方は
            <Link href="/guide/column/okane-kanri-kichinto" className="text-blue-600 hover:underline">
              お金の管理がきちんとしている人ほど、家族を困らせてしまう3つの理由
            </Link>
            で詳しく紹介しています。
          </p>
          <p>
            この記事は「消えたもの」を扱った
            <Link href="/guide/column/saifu-hikidashi-5sen" className="text-blue-600 hover:underline">
              この5年で、財布と引き出しから消えたもの5選
            </Link>
            の続きでもあります。あちらが「財布から消えた」話なら、こちらは「スマホに集まった」話。引っ越し元と引っ越し先の、両面です。デジタル資産の整理と引き継ぎの全体像は
            <Link href="/guide/digital-shisan" className="text-blue-600 hover:underline">
              デジタル資産の整理と引き継ぎ
            </Link>
            にまとめています。
          </p>
        </Section>

        <Section id="faq" title="ここで出そうな、2つの疑問">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={faq.q}
                className={index === faqs.length - 1 ? '' : 'border-b border-slate-200 pb-6'}
              >
                <h3 className="flex gap-2 text-base font-semibold text-slate-900">
                  <span aria-hidden="true" className="shrink-0 font-bold text-rose-600">Q</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="mt-3 flex gap-2 text-[15px] leading-8 text-slate-700">
                  <span aria-hidden="true" className="shrink-0 font-bold text-blue-600">A</span>
                  <span>{faq.a}</span>
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="matome" title="まとめ——軽くなった荷物に、一覧を1枚">
          <p>最後に、5つをまとめます。</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[15px] leading-7">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    集約された機能
                  </th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    引っ越し先
                  </th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row) => (
                  <tr key={row.item}>
                    <td className="border border-slate-200 px-4 py-3 align-top font-medium text-slate-900">
                      {row.item}
                    </td>
                    <td className="border border-slate-200 px-4 py-3 align-top">{row.dest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            この5年で、私たちの荷物は史上いちばん軽くなりました。あとは、その身軽さに、「どこに何があるか」の一覧を1枚足すだけ。
          </p>
          <p>
            こうしたお金や契約、写真の在りかを、ふだんは誰にも見せず、もしものときにだけ選んだ家族へ届くようにしておく専用のサービスもあります。私たちが運営する
            <strong>「つぎの手ナビ デジタル資産」</strong>
            もそのひとつで、登録・一覧のPDF出力・見直しの定期リマインドまでは無料で使えます。
          </p>
          <p>便利さは、そのままでいい。一覧を1枚足した日から、もう心配しなくて大丈夫です。</p>
        </Section>

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            「どこに何があるか」を、もしものときだけ届く形で残すなら
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            あなたにもしもがあったとき、家族が「どこに何があるか」にたどり着けるように。「つぎの手ナビ デジタル資産」は、パスワードや口座・契約・写真の在りかを、生きている間は誰にも見せず、もしものときだけ選んだ人へ届ける準備ができるサービスです。登録・PDF出力・定期リマインドは無料。あなたにできる、いちばんやさしい準備です。
          </p>
          <div className="mt-6">
            <GuideCtaLink
              href="/signup?next=/digital"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              つぎの手ナビを無料で始める
            </GuideCtaLink>
          </div>
          <p className="mt-4 text-sm">
            <Link href="/" className="text-blue-600 hover:underline">
              サービスの詳しい紹介を見る &rsaquo;
            </Link>
          </p>
        </section>

        <section className="mt-14">
          <h2 className="border-b border-slate-200 pb-3 text-xl font-semibold text-slate-900">
            あわせて確認したい記事
          </h2>
          <ul className="mt-5 space-y-5">
            <li>
              <p className="text-xs font-medium text-slate-500">「消えた側」から見た対の記事</p>
              <Link
                href="/guide/column/saifu-hikidashi-5sen"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                この5年で、財布と引き出しから消えたもの5選 &rsaquo;
              </Link>
            </li>
            <li>
              <p className="text-xs font-medium text-slate-500">「どこに何があるか」の一覧の作り方</p>
              <Link
                href="/guide/column/okane-kanri-kichinto"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                お金の管理がきちんとしている人ほど、家族を困らせてしまう3つの理由 &rsaquo;
              </Link>
            </li>
            <li>
              <p className="text-xs font-medium text-slate-500">整理と引き継ぎの全体像</p>
              <Link
                href="/guide/digital-shisan"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                デジタル資産の整理と引き継ぎ &rsaquo;
              </Link>
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="border-b border-slate-200 pb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            出典
          </h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-500">
            {sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
