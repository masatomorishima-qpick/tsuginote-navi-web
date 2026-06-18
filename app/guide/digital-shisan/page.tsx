import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/digital-shisan';
const PAGE_TITLE = 'デジタル資産の整理と引き継ぎ｜種類の一覧と、家族が困らない備え方';
const PAGE_DESCRIPTION =
  'ネット銀行・サブスク・スマホの写真——暮らしの多くは「デジタル資産」になりました。デジタル資産とは何か、種類の一覧、いま整理が必要な理由、そして金額もパスワードも書かずに「在りか」を残す整理・引き継ぎの基本まで、まとめて解説します。';

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
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const toc = [
  { id: 'toha', label: 'デジタル資産とは' },
  { id: 'types', label: 'デジタル資産の種類【一覧】' },
  { id: 'why', label: 'なぜ今、整理が必要なのか' },
  { id: 'howto', label: '整理・書き出しのやり方' },
  { id: 'hikitsugi', label: '「もしものとき」（入院・事故・死亡など）の引き継ぎの基本' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'related', label: '関連記事（テーマ別に深掘り）' },
];

const typeRows = [
  { type: 'お金（金融）', ex: 'ネット銀行、ネット証券、NISA、iDeCo', visible: '見えにくい（紙の通帳・報告書がない）' },
  { type: '決済・電子マネー', ex: 'PayPay、交通系IC、ウォレット登録のカード', visible: '見えにくい' },
  { type: 'ポイント', ex: '各種ポイント、マイル', visible: 'ほぼ見えない（本人のみ利用可が多い）' },
  { type: 'サブスク', ex: '動画・音楽・アプリ課金、定期購入', visible: '見えにくい（請求だけが続く）' },
  { type: 'SNS・アカウント', ex: 'LINE、Instagram、X など', visible: '見えにくい' },
  { type: '写真・データ', ex: 'iCloud、Googleフォト、みてね', visible: '見えにくい' },
  { type: 'メール', ex: 'Gmail など（各種通知のハブ）', visible: '見えにくい' },
  { type: '暗号資産・NFT', ex: '取引所の口座、ウォレット', visible: '非常に見えにくい' },
  { type: '端末そのもの', ex: 'スマホ・パソコンのパスコード、生体認証', visible: '鍵そのもの（最初の壁）' },
];

const faqs = [
  {
    q: 'デジタル資産にはどんな種類がありますか？',
    a: 'ネット銀行・証券などのお金、PayPay等の決済・ポイント、サブスク、SNSアカウント、iCloudやGoogleフォトの写真、メール、暗号資産・NFT、そしてスマホ・パソコン本体の鍵などです。共通点は、紙の手がかりがなく本人の認証の内側にあることです。',
  },
  {
    q: 'デジタル資産は家族に引き継げますか？',
    a: '多くのサービスは規約上、本人以外のログインを原則認めていません。AppleやGoogleには公式の引き継ぎ機能がありますが、本人が生前に設定しておく必要があります。サービスを横断して備えるには、「どこに何があるか」の在りかを、もしものときだけ家族へ届く形で残しておくのが現実的です。',
  },
  {
    q: '暗号資産もデジタル資産ですか？',
    a: 'はい。暗号資産（仮想通貨）やNFTも広い意味でデジタル資産に含まれます。ただし本ページは、だれの暮らしにもある「身のまわりのデジタル資産」の整理と引き継ぎを中心に扱っています。',
  },
  {
    q: '整理は何から始めればいいですか？',
    a: 'まずスマホのアプリ一覧を眺めて、銀行・証券・決済・サブスク・写真のアプリを書き出すところから。次にメールを「口座開設」などで検索して漏れを拾います。金額やパスワードは書かず、サービス名と種類だけで十分です。',
  },
  {
    q: 'パスワードを家族に教えておけば十分ですか？',
    a: 'それは「玄関の鍵」を渡しただけの状態です。スマホが開いても、どのサービスに何があるかは一つずつ探さなければ分かりません。必要なのは鍵そのものより、「どこに何があるか」の一覧です。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`,
      datePublished: '2026-06-14',
      dateModified: '2026-06-14',
      inLanguage: 'ja',
      about: { '@type': 'DefinedTerm', name: 'デジタル資産', inDefinedTermSet: `${SITE_URL}${PAGE_PATH}` },
      author: { '@type': 'Organization', name: 'つぎの手ナビ デジタル資産', url: SITE_URL },
      publisher: { '@type': 'Organization', name: 'BlueAdventures', url: SITE_URL },
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
          name: 'デジタル資産の整理と引き継ぎ',
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
  '金融庁「NISA口座の利用状況に関する調査」／日本証券業協会 集計資料（2025年12月末・約2,826万口座）',
  'Apple「故人アカウント管理連絡先（デジタル遺産プログラム）」設定・利用条件（iOS 15.2／iPadOS 15.2／macOS 12.1以降）',
  'Google「アカウント無効化管理ツール（Inactive Account Manager）」ヘルプ（未使用期間3・6・12・18か月、最大10人指定可）',
  '2026年 BlueAdventures調べ（デジタル遺品に関する意識調査・2026年4月・調査会社によるインターネットアンケート）',
];

export default function DigitalShisanPage() {
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
            <li className="text-slate-700">デジタル資産の整理と引き継ぎ</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ちガイド｜デジタル資産の基本
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          デジタル資産の整理と引き継ぎ
          <span className="mt-2 block text-lg font-medium text-slate-500 sm:text-xl">
            種類の一覧と、家族が困らない備え方
          </span>
        </h1>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/digital-shisan/digital-shisan-main.webp"
            alt="デスクでスマートフォンとノートを使い、デジタル資産を落ち着いて整理する様子"
            width={1600}
            height={900}
            priority
            className="h-auto w-full"
          />
        </div>

        <div className="mt-8 space-y-5 text-[15px] leading-8 text-slate-700">
          <p>
            スマホやパソコン、ネット上の口座・契約・写真——いまや暮らしのほとんどが「デジタル資産」になりました。便利になった一方で、その多くは本人にしか開けない場所にあり、もしものとき家族が見つけられない、という新しい問題が生まれています。このページでは、デジタル資産とは何かを整理し、種類の一覧、いま備えが必要な理由、そして金額もパスワードも書かずに「在りか」を残す整理・引き継ぎの基本を、まとめて解説します。
          </p>
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

        <Section id="toha" title="デジタル資産とは">
          <p>
            デジタル資産とは、スマホ・パソコンやインターネット上で保有・管理する、価値のある情報や権利のことです。広い意味では暗号資産（仮想通貨）やNFTなどの金融的な資産も含みますが、このページでは、もっと身近な——
            <strong>だれの暮らしにもある「身のまわりのデジタル資産」</strong>
            を中心に扱います。
          </p>
          <p>
            たとえば、ネット銀行やネット証券の口座、PayPayなどの決済残高やポイント、動画・音楽のサブスク、SNSのアカウント、スマホの中の写真。これらはすべてデジタル資産です。共通点は、
            <strong>紙の通帳やアルバムのような「物の手がかり」がなく、本人の認証（パスワードや指紋）の内側にある</strong>
            こと。だから、本人以外からは見えにくいのです。
          </p>
        </Section>

        <Section id="types" title="デジタル資産の種類【一覧】">
          <p>
            身のまわりのデジタル資産を、種類ごとに整理すると次のようになります。「家族から見えるか」の列がポイントです。
          </p>
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/digital-shisan/digital-shisan-types.webp"
              alt="スマートフォンやパソコン、カードなど身のまわりのデジタル機器を並べた俯瞰"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[15px] leading-7">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">種類</th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">具体例</th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    家族から見えるか
                  </th>
                </tr>
              </thead>
              <tbody>
                {typeRows.map((row) => (
                  <tr key={row.type}>
                    <td className="border border-slate-200 px-4 py-3 align-top font-medium text-slate-900">
                      {row.type}
                    </td>
                    <td className="border border-slate-200 px-4 py-3 align-top">{row.ex}</td>
                    <td className="border border-slate-200 px-4 py-3 align-top">{row.visible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            スマホ・パソコン本体の鍵は、すべての入口になる「最初の扉」です。ここが開かないと、上のどれにもたどり着けません。
          </p>
        </Section>

        <Section id="why" title="なぜ今、整理が必要なのか">
          <p>
            暮らしのデジタル化は、もう少数派の話ではありません。キャッシュレス決済比率は2025年に58.0%（経済産業省）に達し、NISA口座は2025年12月末で約2,826万口座（金融庁）。多くのお金が、紙の手がかりのないデジタル資産として積み上がっています。
          </p>
          <p>
            そして、もしものときに何が起きるか。私たちBlueAdventuresが2026年4月に行った調査では、
            <strong>大切な方を亡くした経験のある人の60.9%が「デジタル関係で困った経験がある」</strong>
            と回答し、最も多かった困りごとは「スマホ・パソコンのパスワードが分からない」でした。さらに
            <strong>約70%が「生前に整理してくれていたら助かった」</strong>
            と答えています（2026年 BlueAdventures調べ。詳しくは
            <Link href="/guide/research" className="text-blue-600 hover:underline">
              デジタル遺品に関する意識調査
            </Link>
            ）。
          </p>
          <p>
            ここには、デジタル化が残した課題があります。守りを強くするほど（顔認証・指紋・パスコード）、本人以外には開けられなくなる。
            <strong>あなたを守る仕組みの強さが、そのまま、家族の前に立つ壁の高さになる</strong>
            のです。これは誰の落ち度でもなく、便利さの裏面です。だからこそ、便利さはそのままに、「在りか」だけを残す備えが要ります。
          </p>
        </Section>

        <Section id="howto" title="デジタル資産の整理・書き出しのやり方">
          <p>
            整理といっても、難しいことはありません。やるのは「
            <strong>どこに・何があるか</strong>
            」を本人以外にも分かる形にしておくこと。所要時間は15分ほどです。
          </p>
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/digital-shisan/digital-shisan-chizu.webp"
              alt="ノートにサービス名を書き出して、デジタル資産の在りかを一覧にしている手元"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="shrink-0 font-bold text-emerald-600">1.</span>
              <span>
                <strong>スマホのアプリ一覧を眺める。</strong>{' '}
                銀行・証券・決済・ポイント・サブスク・写真のアプリを書き出します。これだけで大半が拾えます。
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-bold text-emerald-600">2.</span>
              <span>
                <strong>メールを検索する。</strong>{' '}
                「口座開設」「ご利用明細」「領収書」などで検索すると、アプリにない契約の漏れが見つかります。
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-bold text-emerald-600">3.</span>
              <span>
                <strong>引き落としをたどる。</strong>{' '}
                クレジットカードや銀行の引き落とし履歴から、忘れているサブスクや契約が見つかります。
              </span>
            </li>
          </ol>
          <p>
            書くのは「サービス名と種類」だけ。
            <strong>金額も、暗証番号も、パスワードも書きません。</strong>{' '}
            家族が困るのは「いくらあるか」ではなく「どこにあるか」だからです。この一覧が、いざというときに資産の在りかを家族へ伝えてくれます。作り方は
            <Link href="/guide/column/okane-kanri-kichinto" className="text-blue-600 hover:underline">
              お金の管理がきちんとしている人ほど、家族を困らせてしまう3つの理由
            </Link>
            で詳しく紹介しています。
          </p>
          <p>
            ついでに「ほぼ使っていない口座・サブスク」が見つかったら、生きているうちに自分で解約しておくと、一覧はもっとシンプルになります。
          </p>
        </Section>

        <Section id="hikitsugi" title="「もしものとき」（入院・事故・死亡など）の引き継ぎの基本">
          <p>整理した「在りか」を、いざというときにどう家族へ渡すか。ここが本題です。</p>
          <p>
            このページでいう「もしものとき」とは、ぼんやりした未来の話ではありません。具体的には、
            <strong>急な入院や事故・病気でスマホやパソコンを自分で開けなくなったとき、認知機能が低下して自分で手続きできなくなったとき、そして亡くなったとき</strong>
            ——つまり「本人が、自分のデジタル資産を自分で扱えなくなった状態」を指します。元気なうちは、この備えが使われることは一切ありません。
          </p>
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/digital-shisan/digital-shisan-hikitsugi.webp"
              alt="家族が並んでスマートフォンを見ながら、在りかの引き継ぎについて穏やかに話す様子"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>
            まず知っておきたいのは、AppleもGoogleも、規約上、本人以外がアカウントにアクセスすることは原則認めていないこと。家族でも勝手にはログインできません（プライバシーを守る正しい設計です）。そのうえで両社は公式機能を用意しています。
            <strong>Appleの「故人アカウント管理連絡先」</strong>、
            <strong>Googleの「アカウント無効化管理ツール」</strong>
            です。いずれも優れた仕組みですが、共通の前提があります——
            <strong>本人が、元気なうちに、自分で設定しておくこと</strong>
            。そして守ってくれるのは各サービスの中だけで、銀行・保険・サブスクなど横断的な「在りか」まではカバーしません。
          </p>
          <p>
            そこで、点在する在りかをまとめて備える考え方が「在りかの引き継ぎ」です。ポイントは3つの軸で整理すること。
            <strong>①人ごと</strong>（誰に届けるか）、<strong>②情報の種類ごと</strong>、
            <strong>③時間軸</strong>（元気なうちは誰にも見せず、入院・事故・死亡などで本人が扱えなくなったときだけ届く）。この3軸で、「全部見せる」でも「何も残さない」でもない、ちょうどよい備えができます。
          </p>
          <p>
            こうした写真や口座、契約の「在りか」を、ふだんは誰にも見せずに整理しておき、もしものときにだけ選んだ家族へ届くようにしておく専用のサービスもあります。私たちが運営する
            <strong>「つぎの手ナビ デジタル資産」</strong>
            もそのひとつで、登録・一覧のPDF出力・見直しの定期リマインドまでは無料で使えます。
          </p>
          <div className="mt-2 text-center">
            <GuideCtaLink
              href="/signup?next=/digital"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              つぎの手ナビを無料で始める
            </GuideCtaLink>
            <p className="mt-2 text-xs text-slate-500">
              登録・一覧のPDF出力・定期リマインドまで無料／いつでも退会できます
            </p>
          </div>
        </Section>

        <Section id="faq" title="よくある質問">
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

        <section id="related" className="mt-14 scroll-mt-24">
          <h2 className="border-b border-slate-200 pb-3 text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
            関連記事（テーマ別に深掘り）
          </h2>
          <div className="mt-6 space-y-6 text-[15px] leading-8 text-slate-700">
            <div>
              <p className="font-semibold text-slate-900">整理する</p>
              <p className="mt-1">
                <Link href="/guide/digital-seiri/digital-dansyari" className="text-blue-600 hover:underline">
                  デジタル断捨離のやり方
                </Link>
                ／
                <Link href="/guide/digital-seiri/sumaho-shashin-seiri" className="text-blue-600 hover:underline">
                  スマホの写真整理
                </Link>
                ／
                <Link href="/guide/digital-seiri/sabusuku-kanri" className="text-blue-600 hover:underline">
                  サブスク管理アプリの選び方
                </Link>
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">守る・認証</p>
              <p className="mt-1">
                <Link href="/guide/password-kanri/sumaho-password" className="text-blue-600 hover:underline">
                  スマホのパスワードのメモは危険？
                </Link>
                ／
                <Link href="/guide/password-kanri/nidankai-ninsho" className="text-blue-600 hover:underline">
                  二段階認証のもしもの落とし穴
                </Link>
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">家族で共有</p>
              <p className="mt-1">
                <Link href="/guide/kazoku-kyoyu/password-account-kyoyu" className="text-blue-600 hover:underline">
                  パスワードを家族と共有する方法
                </Link>
                ／
                <Link href="/guide/kazoku-kyoyu/fuufu-joho-kyoyu" className="text-blue-600 hover:underline">
                  夫婦の情報共有
                </Link>
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">お金の在りか・もしもの備え</p>
              <p className="mt-1">
                <Link href="/guide/shisan-kanri/toshi-kazoku" className="text-blue-600 hover:underline">
                  投資を家族に知らせる？
                </Link>
                ／
                <Link href="/guide/moshimo-sonae/kyu-nyuin-sonae" className="text-blue-600 hover:underline">
                  急な入院に備える情報リスト
                </Link>
                ／
                <Link href="/guide/research" className="text-blue-600 hover:underline">
                  デジタル遺品に関する意識調査（2026年4月）
                </Link>
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            デジタル資産の「在りか」を、もしものときだけ届く形で残す
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、口座や契約、写真の在りかを、生きている間は誰にも見せず、もしものときだけ選んだ人へ届ける準備ができるサービスです。登録・PDF出力・定期リマインドは無料で使えます。
          </p>
          <div className="mt-6">
            <GuideCtaLink
              href="/signup?next=/digital"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              無料で始める（新規登録）
            </GuideCtaLink>
          </div>
          <p className="mt-4 text-sm">
            <Link href="/" className="text-blue-600 hover:underline">
              サービスの詳しい紹介を見る &rsaquo;
            </Link>
          </p>
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
