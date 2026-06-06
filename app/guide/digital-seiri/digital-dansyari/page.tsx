import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/digital-seiri/digital-dansyari';
const PAGE_TITLE =
  'デジタル断捨離のやり方｜スマホ・アカウント・サブスクをスッキリ整理する全手順';
const PAGE_DESCRIPTION =
  'デジタル断捨離のやり方を5つのステップ（写真・アプリ・サブスク・アカウント・メール）に分けて全手順で解説。スマホ・パソコンが軽くなり、無駄な出費も減らせます。最後に、多くの人が見落とす「整理した情報の残し方」まで紹介。';

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | つぎの手ナビ`,
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
    images: [
      {
        url: `${SITE_URL}/images/guide/digital-seiri/digital-dansyari-main.webp`,
        width: 1600,
        height: 900,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [`${SITE_URL}/images/guide/digital-seiri/digital-dansyari-main.webp`],
  },
};

const toc = [
  { id: 'what', label: 'デジタル断捨離とは？' },
  { id: 'merits', label: 'デジタル断捨離の5つのメリット' },
  { id: 'overview', label: 'まず全体像をつかむ｜整理は5つのステップで' },
  { id: 'step1', label: 'ステップ1｜写真・データを整理する' },
  { id: 'step2', label: 'ステップ2｜アプリを整理する' },
  { id: 'step3', label: 'ステップ3｜サブスク・定期課金を見直す' },
  { id: 'step4', label: 'ステップ4｜アカウント・パスワードを整理する' },
  { id: 'step5', label: 'ステップ5｜メール・連絡先を整理する' },
  { id: 'blindspot', label: 'ほとんどの人が見落とすこと' },
  { id: 'finish', label: '仕上げ｜「捨てる」から「残す」へ' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ' },
];

const faqs = [
  {
    q: 'デジタル断捨離は、どこから始めるのがいいですか？',
    a: '写真・データからがおすすめです。容量への効果を最も実感しやすく、勢いがつきます。一度に全部やろうとせず、この記事の5つのステップを1日1つなど、分けて進めると挫折しません。',
  },
  {
    q: 'どのくらいの頻度でやればいいですか？',
    a: '大掃除のように年1回しっかりやるのに加え、サブスクの見直しだけは半年に1回がおすすめです。固定費に直結するため、頻度を上げる価値が最も高いところです。',
  },
  {
    q: '間違って消してしまわないか不安です。',
    a: 'アプリは後からいつでも再インストールできます。写真は、先にクラウドへバックアップしてから端末の整理を始めれば安心です。迷うものは「保留」フォルダを作って一時退避し、数か月後に見返して判断する方法もあります。',
  },
  {
    q: '整理したパスワードの管理は、結局どうするのが安全ですか？',
    a: 'パスワード管理アプリで一元管理し、サービスごとに異なるパスワードを使い、重要なアカウントには二段階認証を設定する——この3点が基本です。メモ帳への平文保存や使い回しは避けてください。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      image: `${SITE_URL}/images/guide/digital-seiri/digital-dansyari-main.webp`,
      mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`,
      datePublished: '2026-06-05',
      dateModified: '2026-06-05',
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
          name: 'デジタル整理術',
          item: `${SITE_URL}/guide/digital-seiri`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'デジタル断捨離のやり方',
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

function DotList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[15px] leading-8 text-slate-700">
          <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CrossList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[15px] leading-8 text-slate-700">
          <span className="mt-1 shrink-0 text-lg font-bold leading-8 text-rose-600">×</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function DigitalDansyariPage() {
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
              <Link href="/guide/digital-seiri" className="text-blue-600 hover:underline">
                デジタル整理術
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">デジタル断捨離のやり方</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ち情報｜デジタル整理術
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          デジタル断捨離のやり方
          <span className="mt-2 block text-xl font-medium leading-snug text-slate-600 sm:text-2xl">
            スマホ・アカウント・サブスクをスッキリ整理する全手順
          </span>
        </h1>

        <p className="mt-7 text-base leading-8 text-slate-700">
          「写真が何千枚も溜まっている」「使っていないアプリで画面が埋まっている」「いつの間にか増えた月額課金、全部把握できていない」——心当たりがあるなら、デジタル断捨離のタイミングです。
          デジタルなものは、物理的な場所を取らないぶん「散らかっている」ことに気づきにくいもの。けれど放っておくと、スマホの動作が重くなり、無駄な出費が積み重なり、セキュリティのリスクも高まります。
          この記事では、何から手をつければいいか分からない人のために、デジタル断捨離の全体像と、ステップごとの具体的なやり方を順番に解説します。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/digital-seiri/digital-dansyari-main.webp"
            alt="リビングのソファでスマホを操作しながらデジタル断捨離を進める40代の男性"
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

        <Section id="what" title="デジタル断捨離とは？ただ「捨てる」ことではない">
          <p>
            デジタル断捨離とは、スマホやパソコンの中に溜まったデータ・アプリ・アカウント・サブスクなどを見直し、不要なものを手放して、必要なものを「使いやすく・分かりやすい状態」に整えることです。
          </p>
          <p>
            ポイントは、ただ削除して減らすだけではない、という点です。本当のゴールは「自分が把握できている状態」をつくること。何がどこにあるか分かっていれば、必要なときにすぐ取り出せ、無駄な出費にもすぐ気づけます。「減らす」と同時に「整える」——これがデジタル断捨離の本質です。
          </p>
        </Section>

        <Section id="merits" title="デジタル断捨離の5つのメリット">
          <p>手をつける前に、なぜやる価値があるのかを確認しておきましょう。</p>
          <DotList
            items={[
              'スマホ・パソコンが軽くなる：ストレージに余裕が生まれ、動作が快適になります',
              '無駄な出費が減る：使っていないサブスクの解約で、固定費がそのまま浮きます。年間で数万円になることも',
              'セキュリティリスクが下がる：使わないアカウントは情報漏えいの入り口。減らすほど安全になります',
              '探す時間がなくなる：「あのデータどこだっけ」「あのID何だっけ」に費やす時間がゼロに',
              '頭がスッキリする：散らかったデジタル環境は知らず知らず脳の負担に。整えると気持ちまで軽くなります',
            ]}
          />
        </Section>

        <Section id="overview" title="まず全体像をつかむ｜整理は5つのステップで進める">
          <p>
            やみくもに始めると挫折します。デジタル断捨離は、次の5つのステップに分けて進めるのが効率的です。上から順に取り組んでいきましょう。
          </p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <ol className="space-y-2.5 text-[15px] leading-8 text-slate-800">
              <li>1. 写真・データ</li>
              <li>2. アプリ</li>
              <li>3. サブスク・定期課金</li>
              <li>4. アカウント・パスワード</li>
              <li>5. メール・連絡先</li>
            </ol>
          </div>
          <p>それぞれのやり方を、具体的に見ていきます。</p>
        </Section>

        <Section id="step1" title="ステップ1｜写真・データを整理する">
          <p>
            スマホの容量を最も圧迫しているのが写真・動画です。ここから手をつけると効果を実感しやすく、勢いがつきます。
          </p>
          <p>
            まずは「明らかに不要なもの」から消します。ピンボケ写真、同じ構図の連写、スクリーンショット、保存したまま忘れていたミーム画像など。これらをまとめて削除するだけで、数百枚単位で減ることもあります。
          </p>
          <p>
            次に、残したい写真をクラウド（Googleフォト、iCloud、Amazon
            Photosなど）にバックアップし、端末からは削除する運用に切り替えると、本体の容量を保ちながら思い出を守れます。「重複写真を自動検出して削除」できる整理アプリを使うと、さらに時短になります。
          </p>
        </Section>

        <Section id="step2" title="ステップ2｜アプリを整理する">
          <p>ホーム画面を埋め尽くすアプリも、使っているものはごく一部のはず。</p>
          <p>
            判断基準はシンプルで、「3か月以上開いていないアプリは消す」。多くのスマホでは設定からアプリごとの最終使用日や使用時間を確認できます。迷ったら、一度消してみて、本当に必要なら再インストールすればいい——アプリは後からいつでも戻せます。
          </p>
          <p>
            消したあとは、よく使うアプリをホーム画面の取り出しやすい位置に集約し、残りはフォルダにまとめると、日々の操作もラクになります。
          </p>
        </Section>

        <Section id="step3" title="ステップ3｜サブスク・定期課金を見直す（ここが効きます）">
          <p>
            デジタル断捨離で最も「お金に直結する」のがこのステップです。動画配信、音楽、クラウドストレージ、アプリの月額課金、新聞・雑誌のデジタル版——気づかないうちに増え、使っていないのに払い続けているものが必ずあります。
          </p>
          <p>
            <strong>まず、契約中のサブスクを洗い出します。</strong> 方法は3つ。
          </p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <DotList
              items={[
                'スマホの「サブスクリプション」設定を確認する（iPhoneは設定→自分の名前→サブスクリプション、Androidは Google Play→お支払いと定期購入）',
                'クレジットカードの明細から「毎月・毎年、同じ金額が引き落とされている項目」を拾う',
                '銀行口座の引き落とし履歴を見る',
              ]}
            />
          </div>
          <p>
            <strong>次に、1つずつ「この1か月で使ったか？」を自問します。</strong>{' '}
            使っていないもの、無料体験のまま自動で本契約に移行していたものは、解約候補です。
          </p>
          <p>
            <strong>最後に解約します。</strong>{' '}
            解約ページは見つけにくく設計されていることが多いので、「サービス名
            解約」で検索すると手順にたどり着けます。アプリ経由で契約したものは、アプリストアの設定からまとめて解約できます。
          </p>
          <p>この棚卸しを一度やるだけで、月数千円・年数万円が浮くことも珍しくありません。</p>
        </Section>

        <Section id="step4" title="ステップ4｜アカウント・パスワードを整理する（最重要）">
          <p>
            長年ネットを使っていると、登録したサービスのアカウントは数十〜数百に膨れ上がります。使っていないアカウントの放置は、情報漏えいの温床です。
          </p>
          <p>
            <strong>まず、使っていないサービスを退会します。</strong>{' '}
            過去に使ったネットショップ、SNS、ポイントサービスなど。「サービス名
            退会」で手順を確認できます。退会すれば、そのサービスから個人情報が漏れるリスクそのものが消えます。
          </p>
          <p>
            <strong>次に、残すアカウントのパスワードを整理します。</strong>{' '}
            ここで多くの人がやりがちな危険な保管法があります。
          </p>
          <div className="rounded-2xl bg-rose-50 p-6">
            <CrossList
              items={[
                'スマホのメモ帳やLINEの「自分だけのトーク」に平文で保存する',
                '同じパスワードを複数のサービスで使い回す',
                'ブラウザに保存しっぱなしで、マスターパスワードもかけていない',
              ]}
            />
          </div>
          <p>
            これらは、1か所が破られると全部が芋づる式に漏れる状態です。安全なのは、パスワード管理アプリで一元管理し、サービスごとに異なる強固なパスワードを使い、重要なアカウントは二段階認証を有効にすること。これだけで、安全性は大きく変わります。
          </p>
        </Section>

        <Section id="step5" title="ステップ5｜メール・連絡先を整理する">
          <p>
            最後は、毎日少しずつ散らかり続けるところです。ここを整えると、日々の「ノイズ」が目に見えて減ります。
          </p>
          <p>
            <strong>まず、不要なメルマガを配信解除します。</strong>{' '}
            受信トレイを開いて、読まずに削除しているメールの送信元を確認し、本文末尾の「配信停止」リンクから解除していきます。1通ずつ削除し続けるより、元を断つほうが圧倒的にラクです。ここ数か月の受信分をざっと見て、「届いても開かないもの」を10件解除するだけでも、受信トレイの景色が変わります。
          </p>
          <p>
            <strong>次に、残ったメールを整理します。</strong>{' '}
            全部をフォルダ分けする必要はありません。「あとで見返す可能性があるもの（契約・購入・手続き関連）」だけ残し、それ以外は思い切ってアーカイブか削除。検索すれば見つかるのがメールの良いところなので、完璧な分類を目指さないのがコツです。
          </p>
          <p>
            <strong>連絡先も同じ要領で。</strong>{' '}
            誰だか思い出せない連絡先、重複している連絡先を削除・統合します。スマホの連絡先アプリには重複をまとめる機能があるので、活用しましょう。
          </p>
        </Section>

        <Section id="blindspot" title="デジタル断捨離で、ほとんどの人が見落とすこと">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/digital-seiri/digital-dansyari-family.webp"
              alt="ダイニングで穏やかに会話する家族。整理したデジタル情報を家族と共有できている安心のイメージ"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>
            ここまでで、あなたのデジタル環境はかなりスッキリしたはずです。写真は減り、サブスクの無駄は止まり、アカウントとパスワードは整理され、受信トレイも静かになった。
          </p>
          <p>でも、ここで一つだけ問いを置かせてください。</p>
          <p>
            <strong>
              そうして整理した情報は、いま「あなたしか分からない状態」になっていませんか？
            </strong>
          </p>
          <p>
            デジタル断捨離は、自分が使いやすいように整える作業です。だからこそ、整えれば整えるほど、その情報はあなたの頭の中とあなたのスマホの中だけに最適化されていきます。パスワード管理アプリのマスターパスワード、どのサブスクに入っているか、どの口座やサービスを使っているか——きれいに整理されているのに、それを知っているのはあなた一人。
          </p>
          <p>
            もし、あなたが急に入院したら。事故や病気で、しばらくスマホを触れなくなったら。あなたの家族は、整理されたその情報に、たどり着けるでしょうか。
          </p>
          <p>
            ネット銀行やネット証券は紙の通知が届きません。サブスクは解約しない限り請求が続きます。スマホにロックがかかっていれば、家族は中身にアクセスできません。実際、大切な方を亡くした人の約6割がデジタル関連で困ったと答え、その最多が「スマホ・パソコンのパスワードが分からない」ことでした（2025年 BlueAdventures調べ）。
            <strong>整理された情報ほど、本人以外には「存在しないのと同じ」になりやすい</strong>
            ——これがデジタル断捨離の、最後の盲点です。
          </p>
        </Section>

        <Section id="finish" title="デジタル断捨離の仕上げ｜「捨てる」から「残す」へ">
          <p>
            では、家族に全部見せて共有すればいいのか。そう簡単でもありません。資産の額や、見られたくない個人的な情報まで、生きている間にすべて開示したい人はいないはずです。だから多くの人は、ここで手が止まり、後回しにします。
          </p>
          <p>
            解決の方向はシンプルです。
            <strong>
              全部を見せる必要はなく、「どこに何があるか」という在りかだけを、中身は伏せたまま、もしものときだけ信頼する人に届く形にしておく。
            </strong>{' '}
            これがデジタル断捨離の本当の仕上げです。
          </p>
          <p>
            増やす・整理すると同じ熱量で、この「残す」を一手加える。それだけで、今日のスッキリが、もしものときの安心にまで延びます。
          </p>
          <p>
            デジタル断捨離は、自分のために始める作業です。けれど最後のひと手間で、それは家族のための備えにもなります。せっかく整えたこの機会に、「在りかを残す」ところまで、やってしまいましょう。
          </p>
        </Section>

        <Section id="faq" title="よくある質問">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={faq.q}
                className={index === faqs.length - 1 ? '' : 'border-b border-slate-200 pb-6'}
              >
                <h3 className="text-base font-semibold text-slate-900">{faq.q}</h3>
                <p className="mt-3 text-[15px] leading-8 text-slate-700">{faq.a}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="summary" title="まとめ｜「減らす・整える」のあとに「残す」を一手">
          <p>
            デジタル断捨離は、①写真・データ、②アプリ、③サブスク、④アカウント・パスワード、⑤メール・連絡先の5つのステップで進めるのが近道です。スマホ・パソコンは軽くなり、無駄な出費は止まり、セキュリティも上がります。
          </p>
          <p>
            そして仕上げは、整理した情報の「在りか」を、中身は伏せたまま、もしものときだけ信頼できる人に届く形で残しておくこと。ここまでやって、デジタル断捨離は本当に完成します。
          </p>
        </Section>

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            整理した情報の「在りか」を、もしものときに届く形で残すには
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、整理したデジタル情報を、見られたくないものは伏せたまま、もしものときだけ大切な人へ引き継ぐ準備ができるサービスです。資産の登録・PDF出力・定期リマインドは無料で使えます。
          </p>
          <div className="mt-6">
            <Link
              href="/signup?next=/digital"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              無料で始める（新規登録）
            </Link>
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
              <p className="text-xs font-medium text-slate-500">
                アカウントと会員登録を本格的に減らしたい方
              </p>
              <Link
                href="/guide/digital-seiri/account-seiri"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                会員登録・アカウント整理のやり方｜探し方と退会の全手順 &rsaquo;
              </Link>
            </li>
            <li>
              <p className="text-xs font-medium text-slate-500">
                スマホの課金・サブスクを徹底的に見直したい方
              </p>
              <Link
                href="/guide/digital-seiri/sumaho-kakin-seiri"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                スマホの有料サービス・課金を整理する方法 &rsaquo;
              </Link>
            </li>
          </ul>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
