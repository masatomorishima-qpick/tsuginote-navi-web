import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/kazoku-kyoyu/fuufu-joho-kyoyu';
const PAGE_IMAGE = `${SITE_URL}/images/guide/kazoku-kyoyu/fuufu-joho-kyoyu-main.webp`;
const PAGE_TITLE =
  '夫婦の情報共有のやり方｜日常のすれ違い解消から“もしも”の備えまで';
const PAGE_DESCRIPTION =
  '夫婦の情報共有のやり方を、スケジュール・家計・連絡先などの「日常の共有」（アプリ活用）から、見落としがちな「もしものときの備え」まで解説。何を共有し、何は見せずに“在りか”だけ残すか、プライバシーと両立する方法も。';

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
  { id: 'two-types', label: '夫婦で共有したい情報は2種類' },
  { id: 'schedule', label: '日常の共有①｜スケジュール' },
  { id: 'money', label: '日常の共有②｜家計・お金' },
  { id: 'info', label: '日常の共有③｜連絡先・書類・パスワード' },
  { id: 'privacy', label: '「全部共有」はかえってすれ違う' },
  { id: 'moshimo', label: 'いちばん抜けがちな「もしもの共有」' },
  { id: 'finish', label: '仕上げ｜「在りか」だけを届く形で' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ' },
];

const faqs = [
  {
    q: '夫婦で銀行の暗証番号まで共有すべきですか？',
    a: '日常的に共有する必要はありません。安全上は個人に留めるのが基本です。大切なのは「暗証番号そのもの」より、「もしものときに、口座の在りかと手続きの入口が分かる」状態にしておくこと。日常の共有とは別の仕組みで備えられます。',
  },
  {
    q: '共有したいけれど、自分の貯金や買い物履歴は見られたくありません。',
    a: 'それで問題ありません。家計簿アプリの多くは「共有する支出」と「個人の支出」を分けられます。共有は“選ぶ”もの。全部オープンにする必要はありません。',
  },
  {
    q: 'どのアプリから始めればいいですか？',
    a: 'まずは効果が分かりやすい「予定の共有」から。TimeTreeかGoogleカレンダーで共有カレンダーを1つ作るだけで、すれ違いが目に見えて減ります。慣れてきたら家計、情報ノートへ広げましょう。',
  },
  {
    q: '共働きで忙しく、共有が続きません。',
    a: '完璧を目指さないのがコツです。「予定だけ」「お金だけ」と1つに絞って始め、入力も気づいた方がやる、くらいで十分。続けることのほうが、網羅することより大事です。',
  },
  {
    q: '相手が情報共有に乗り気ではありません。',
    a: '「管理し合う」ではなく「お互いラクになる・もしものとき助かる」と伝えると進みやすくなります。特に「どちらかが倒れたとき、もう片方が困らないため」という“もしも”の話は、共有を前向きに考えるきっかけになります。',
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
      datePublished: '2026-06-10',
      dateModified: '2026-06-10',
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
          name: '家族間の情報共有',
          item: `${SITE_URL}/guide/kazoku-kyoyu`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: '夫婦の情報共有のやり方',
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

export default function FuufuJohoKyoyuPage() {
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
              <Link href="/guide/kazoku-kyoyu" className="text-blue-600 hover:underline">
                家族間の情報共有
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">夫婦の情報共有のやり方</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ち情報｜家族間の情報共有
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          夫婦の情報共有のやり方
          <span className="mt-2 block text-xl font-medium leading-snug text-slate-600 sm:text-2xl">
            日常のすれ違い解消から“もしも”の備えまで
          </span>
        </h1>

        <p className="mt-7 text-base leading-8 text-slate-700">
          「言った・言ってない」で予定が衝突する。家計の支出がお互い見えない。子どものプリントが片方しか把握していない——夫婦の情報共有は、毎日の小さなストレスを減らす効果があります。
          ただ、夫婦の共有には<strong>2つの種類</strong>
          があります。ひとつは「日常の共有」。もうひとつが、ほとんどの人が後回しにする「もしもの共有」——片方が急に動けなくなったとき、もう片方が代わりに動けるか、という備えです。この記事では、日常の共有を便利なアプリで仕組み化する方法をまとめ、そのうえで見落としがちな「もしもの共有」と、プライバシーを守りながら備える方法までお伝えします。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/kazoku-kyoyu/fuufu-joho-kyoyu-main.webp"
            alt="明るいリビングで夫婦がスマホとカレンダーを見ながら、予定や情報を共有している様子"
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

        <Section id="two-types" title="夫婦で共有したい情報は、大きく2種類">
          <p>整理のために、共有したいものを2つに分けて考えます。</p>
          <DotList
            items={[
              '日常の共有：スケジュール、家計・支出、買い物リスト、子どもの予定、連絡先、Wi-Fiパスワードなど。「毎日をスムーズにする」ための共有',
              'もしもの共有：口座・保険・契約の在りか、解約に必要な情報、スマホ・パソコンのロック解除など。「片方が動けないとき、もう片方が困らない」ための共有',
            ]}
          />
          <p>
            多くの解説は前者だけを扱います。でも、本当に夫婦の安心を完成させるのは後者です。まず前者から、実用的に片付けていきましょう。
          </p>
        </Section>

        <Section id="schedule" title="日常の共有①｜スケジュール（予定のすれ違いをなくす）">
          <p>
            いちばん効果が分かりやすいのが予定の共有です。お互いの仕事のシフト、飲み会、子どもの行事を1つのカレンダーに集約すると、「聞いてない」が激減します。
          </p>
          <DotList
            items={[
              'TimeTree：夫婦・家族向けの定番カレンダー共有アプリ。予定ごとにメモやチャットを付けられる',
              'Googleカレンダー：すでに使っているなら、カレンダーを相手と共有するだけ。スマホ・パソコンのどちらからでも見られる',
              'iPhone同士：標準カレンダーの共有機能でも十分',
            ]}
          />
          <p>
            コツは、<strong>夫婦で1つ「共有カレンダー」を決め、個人の予定とは分ける</strong>
            こと。何でも全部一緒にすると、かえって見づらくなります。
          </p>
        </Section>

        <Section id="money" title="日常の共有②｜家計・お金（支出を見える化する）">
          <p>
            「何にいくら使ったか」がお互い見えないと、家計はすれ違います。家計簿アプリで共有すると、入力の手間も分担できます。
          </p>
          <DotList
            items={[
              '家計簿の共有アプリ（マネーフォワード ME、OsidOri など）を使って、夫婦で同じ家計を見られるようにする',
              'たとえば「OsidOri」のようなアプリなら、夫婦それぞれの個人口座とは別に「共有する支出」だけを選んでペアリングできるため、全部を見せ合う必要はありません',
            ]}
          />
          <p>
            ※ アプリによって共有のしくみは異なります。1つのアカウントを夫婦で共用するタイプ（マネーフォワード ME など）は、連携した口座・カードの残高がお互いに見える状態になりやすいので、「見せたくない個人口座は連携しない」など、共有範囲を決めてから始めると安心です。
          </p>
          <p>
            ここで早くも「全部は見せたくない」が出てきます。これは後半で詳しく扱います。
          </p>
        </Section>

        <Section id="info" title="日常の共有③｜連絡先・書類・パスワードを1か所に">
          <p>
            予定とお金以外の「こまごました情報」も、1か所にまとめると探す手間が消えます。保険会社の連絡先、Wi-Fiパスワード、子どもの学校関係、契約の更新日など。
          </p>
          <DotList
            items={[
              'スマホの純正メモアプリ（iPhoneのメモ共有機能など）や、情報共有アプリ（Notion など）に、夫婦共通の「家のことノート」を作る',
              '紙の書類は写真を撮ってクラウドのアルバムに入れておくと、外出先でも確認できる',
              'パスワードの共有は、LINEやメモで送らず専用の安全な仕組みを使う',
            ]}
          />
          <p>
            ただし、パスワードやアカウントは「何を共有してよくて、何は個人に留めるべきか」の線引きが大切です。ここは安全に関わるので、詳しくは
            <Link
              href="/guide/kazoku-kyoyu/password-account-kyoyu"
              className="text-blue-600 hover:underline"
            >
              家族とのパスワード・アカウント共有
            </Link>
            で具体的な手順とともに解説しています。
          </p>
        </Section>

        <Section id="privacy" title="「全部共有」はかえってすれ違う｜夫婦でも見られたくないはある">
          <p>
            ここで立ち止まりましょう。
            <strong>「夫婦なんだから全部共有すべき」——これは、実はうまくいきません。</strong>
          </p>
          <p>
            個人の貯金、趣味の買い物履歴、友人とのやり取り。夫婦でも、見られたくない領域は誰にでもあります。それを無理に全部オープンにしようとすると、かえって監視のようになり、息苦しくなります。
          </p>
          <p>
            うまくいく夫婦の共有は、「全部か、ゼロか」ではありません。
            <strong>共有するものを“選ぶ”</strong>
            のがコツです。予定とWi-Fiは共有、個人のお小遣いは別々——このくらいの線引きを一度言葉にしておくと、後の気まずさがなくなります。
          </p>
        </Section>

        <Section id="moshimo" title="いちばん抜けがちな「もしもの共有」">
          <p>
            日常の共有が整っても、まだ抜けているものがあります。それが冒頭で触れた「もしもの共有」です。
          </p>
          <p>
            考えてみてください。あなたが急に入院したら、事故や病気でスマホを操作できなくなったら——
            <strong>
              パートナーは、あなたの口座から支払いを続けられますか？ 加入している保険の請求ができますか？ 不要な契約を解約できますか？
            </strong>
          </p>
          <p>
            これらに必要な情報は、TimeTreeにも家計簿アプリにも入っていません。口座のログイン、保険証券の場所、契約の一覧、そしてスマホ・パソコンのロック解除——
            <strong>もしものときに最も必要なこれらは、日常の共有からすっぽり抜け落ちている</strong>
            のが普通です。実際、大切な方を亡くした人がデジタル関連で最も困ったのは「スマホ・パソコンのパスワードが分からない」ことでした（2026年
            BlueAdventures調べ）。
          </p>
          <p>
            共働きで、それぞれがネット銀行・ネット証券・サブスクを別々に持っている夫婦ほど、この“見えない部分”は大きくなります。
          </p>
        </Section>

        <Section id="finish" title="仕上げ｜見せずに「在りか」だけを、もしものときだけ届く形で">
          <p>
            ではどうするか。ここでも「全部見せる」と「何も残さない」の二択にする必要はありません。
          </p>
          <p>
            <strong>
              資産額や中身を今すぐ見せる必要はありません。「口座はここ」「保険はここ」「スマホの鍵はここ」という“在りか”だけを、もしものときだけパートナーに届く形にしておく。
            </strong>{' '}
            生きている間はお互いのプライバシーを守ったまま、いざというときだけ、必要な人に必要な情報が渡る——この形なら、夫婦の距離感を保ちつつ、もしもにも備えられます。
          </p>
          <p>
            しかも、届け先は「情報の種類ごと」に選べます。日常の予定や家庭のお金はパートナー（配偶者）へ、仕事関係のもしもの在りかは職場の同僚や親へ、といったように、内容に合わせて届ける相手を分けることもできます。
          </p>
          <p>
            夫婦の情報共有は、日常を便利にして終わりではありません。
            <strong>もしものとき、もう片方が動けるよう「在りか」を残すところまで</strong>
            やって、はじめて本当の安心になります。
          </p>
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

        <Section id="summary" title="まとめ｜日常はアプリで、もしもは「別の仕組み」で">
          <p>
            夫婦の情報共有は、①予定・家計・連絡先などの「日常の共有」をアプリで仕組み化し、②「全部か、ゼロか」ではなく共有するものを選び、③見落としがちな「もしもの共有」（口座・保険・契約・スマホの鍵の在りか）まで備える——この3段階で考えると、無理なく安心まで届きます。
          </p>
          <p>
            そして、もしもの備えは「生きている間は見せず、もしものときだけ届く」形で。日常はアプリ、もしもは別の仕組み。道具を分ければ、便利さもプライバシーも安心も、すべて手に入ります。
          </p>
          <p>
            パスワード・アカウントの共有の線引きは
            <Link
              href="/guide/kazoku-kyoyu/password-account-kyoyu"
              className="text-blue-600 hover:underline"
            >
              家族とのパスワード・アカウント共有
            </Link>
            、保険や契約を一覧で整理するなら
            <Link
              href="/guide/shisan-kanri/hoken-ichiran-excel"
              className="text-blue-600 hover:underline"
            >
              保険契約の一覧表をエクセルで作る方法
            </Link>
            もどうぞ。
          </p>
        </Section>

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            「もしものときだけ届く」備えを、今日のうちに
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、口座やアカウントの在りかを、生きている間は誰にも見せず、もしものときだけ選んだ人へ届ける準備ができるサービスです。資産の登録・PDF出力・定期リマインドは無料で使えます。
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
          <h2 className="border-b border-slate-200 pb-3 text-xl font-semibold text-slate-900">
            あわせて確認したい記事
          </h2>
          <ul className="mt-5 space-y-5">
            <li>
              <p className="text-xs font-medium text-slate-500">
                パスワード・アカウントの共有の線引きを知りたい方
              </p>
              <Link
                href="/guide/kazoku-kyoyu/password-account-kyoyu"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                家族とのパスワード・アカウント共有｜安全なやり方と線引き &rsaquo;
              </Link>
            </li>
            <li>
              <p className="text-xs font-medium text-slate-500">
                保険・契約を一覧で把握しておきたい方
              </p>
              <Link
                href="/guide/shisan-kanri/hoken-ichiran-excel"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                保険契約の一覧表をエクセルで作る方法｜無料テンプレート付き &rsaquo;
              </Link>
            </li>
            <li>
              <p className="text-xs font-medium text-slate-500">
                急な入院など「もしも」に具体的に備えたい方
              </p>
              <Link
                href="/guide/moshimo-sonae/kyu-nyuin-sonae"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                急な入院に備えて、家族に伝えておく情報リスト &rsaquo;
              </Link>
            </li>
          </ul>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
