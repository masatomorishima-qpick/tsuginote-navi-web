import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/digital-seiri/sumaho-kakin-seiri';
const PAGE_TITLE =
  'スマホの有料サービス・課金を整理する方法｜確認から解約までの全手順';
const PAGE_DESCRIPTION =
  'スマホの有料サービス・課金の整理方法を解説。アプリストアのサブスク、アプリ内課金、キャリア決済、キャリアの有料オプションまで「4つの種類」に分けて確認・解約する全手順。気づかず払い続けているお金が見つかります。';

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
    images: [
      {
        url: `${SITE_URL}/images/guide/digital-seiri/sumaho-kakin-main.webp`,
        width: 1600,
        height: 900,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [`${SITE_URL}/images/guide/digital-seiri/sumaho-kakin-main.webp`],
  },
};

const toc = [
  { id: 'types', label: 'スマホの課金は「4つの種類」に分かれている' },
  { id: 'step1', label: 'ステップ1｜3か所で課金を洗い出す' },
  { id: 'step2', label: 'ステップ2｜「使っているか」で仕分ける' },
  { id: 'step3', label: 'ステップ3｜種類別に解約する' },
  { id: 'saving', label: 'どれくらい浮く？' },
  { id: 'extras', label: 'あわせて見直すと効く｜容量とデータ通信量' },
  { id: 'rebound', label: '増やさない習慣｜課金のリバウンドを防ぐ' },
  { id: 'blindspot', label: 'その契約一覧、止められるのはあなただけ' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ' },
];

const faqs = [
  {
    q: '解約したら、すぐに使えなくなりますか？',
    a: '多くのサービスは、解約しても支払い済みの期間末までは使えます。「月末まで使ってから解約しよう」と先延ばしにするより、気づいたときに解約するのが確実です。',
  },
  {
    q: '無料体験だけ使って解約するのは問題ありませんか？',
    a: '問題ありません。無料体験はそのためのお試し期間です。始めたときに解約期限をカレンダーに入れておくと、自動移行を防げます。',
  },
  {
    q: 'アプリを消したのに請求が続いています。なぜですか？',
    a: 'アプリの削除と契約の解約は別だからです。iPhoneは「設定→自分の名前→サブスクリプション」、Androidは「Google Play→お支払いと定期購入」から解約手続きをしてください。',
  },
  {
    q: 'ストレージがいっぱいで、有料のクラウドに入るか迷っています。',
    a: '課金を増やす前に、まず写真・動画・アプリの整理で空きを作るのがおすすめです。整理しても足りない場合に、必要な容量のプランを選べば、無駄のない課金になります。',
  },
  {
    q: '覚えのない引き落としがあります。どうすればいいですか？',
    a: 'まず「引き落とし名 とは」で検索すると、サービス名が分かることが多いです。家族が同じカードで契約している場合もあるので確認を。どうしても心当たりがなければ、カード会社に問い合わせてください。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      image: `${SITE_URL}/images/guide/digital-seiri/sumaho-kakin-main.webp`,
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
          name: 'スマホの有料サービス・課金の整理',
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

export default function SumahoKakinSeiriPage() {
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
            <li className="text-slate-700">スマホの有料サービス・課金の整理</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ち情報｜デジタル整理術
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          スマホの有料サービス・課金を整理する方法
          <span className="mt-2 block text-xl font-medium leading-snug text-slate-600 sm:text-2xl">
            確認から解約までの全手順
          </span>
        </h1>

        <p className="mt-7 text-base leading-8 text-slate-700">
          「スマホ関係で、毎月いくら払っていますか？」——この質問に正確に答えられる人は、ほとんどいません。動画や音楽のサブスク、アプリの月額課金、ゲームの定期パス、契約時につけたままのキャリアオプション。スマホの課金は入り口が多く、バラバラの場所に隠れているからです。
          答えられないのは、あなたの管理が悪いからではありません。
          <strong>確認する場所が4種類に分かれている</strong>
          ことを、誰も教えてくれないからです。
          この記事では、スマホの有料サービスを「4つの種類」に分けて、それぞれの確認方法→仕分け→解約手順を順番に解説します。読み終えるころには、毎月の支払いの全体像がつかめて、止めるべきものが明確になっているはずです。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/digital-seiri/sumaho-kakin-main.webp"
            alt="リビングでスマホとクレジットカードの明細を見比べながら課金とサブスクを整理する男性"
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

        <Section id="types" title="スマホの課金は「4つの種類」に分かれている">
          <p>
            最初にここを押さえると、あとの作業が迷いません。スマホ関係の支払いは、契約の入り口によって次の4種類に分かれます。
          </p>
          <DotList
            items={[
              '① アプリストア経由のサブスク・アプリ内課金：App Store／Google Play を通して契約したもの。動画・音楽アプリの月額、ゲームの定期パスなど。支払いは Apple／Google 経由',
              '② サービスと直接契約したサブスク：サービスの公式サイトでクレジットカードを登録して契約したもの。同じ動画サービスでも、アプリ経由かサイト経由かで「解約する場所」が変わります',
              '③ キャリア決済・キャリアの有料オプション：携帯料金と合算で支払っているもの。契約時につけた留守電・補償・動画オプションなどが残っているケースが多発地帯です',
              '④ 買い切りの有料アプリ：一度払って終わりのもの。継続課金はないので、この記事では整理対象外です',
            ]}
          />
          <p>
            つまり、確認すべき場所は ①アプリストア、②クレジットカード明細、③キャリアの会員ページ、の3か所です。
          </p>
        </Section>

        <Section id="step1" title="ステップ1｜3か所で課金を洗い出す">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/digital-seiri/sumaho-kakin-step.webp"
              alt="スマホのサブスクリプション設定画面を確認している手元"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>
            <strong>① アプリストアのサブスクリプション一覧</strong>
          </p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <DotList
              items={[
                'iPhone：「設定」→ 一番上の自分の名前 →「サブスクリプション」。現在契約中と期限切れの一覧が出ます',
                'Android：「Google Play」→ 右上のアイコン →「お支払いと定期購入」→「定期購入」',
              ]}
            />
          </div>
          <p>ここに出るのが、アプリストア経由の契約すべてです。</p>
          <p>
            <strong>② クレジットカードの明細</strong>
            <br />
            直近2〜3か月の明細を見て、「毎月・毎年、同じ金額が引き落とされている項目」に印をつけます。覚えのない名前は「その名前
            とは」で検索すると、何のサービスか分かります。年1回の引き落とし（年額プラン）を見逃しやすいので、できれば12か月分さかのぼると確実です。
          </p>
          <p>
            <strong>③ キャリアの会員ページ（My docomo／My au／My SoftBank など）</strong>
            <br />
            「契約内容」「オプション」「ご利用中のサービス」の画面を開き、月額のかかっているオプションを確認します。契約時に「最初の1か月無料なので」とつけたオプションが、そのまま数年残っていることは珍しくありません。キャリア決済の利用履歴も同じ画面系統で確認できます。
          </p>
          <p>
            3か所の結果を1つの一覧（メモアプリでも紙でも）にまとめれば、洗い出しは完了です。月額を合計してみてください——多くの人が、ここで想像より大きい数字を見ます。
          </p>
        </Section>

        <Section id="step2" title="ステップ2｜「使っているか」で仕分ける">
          <p>一覧ができたら、1つずつ仕分けます。</p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <DotList
              items={[
                'この1か月で使ったか？——使っていなければ解約候補',
                '同じ役割のものが2つないか？——動画2つ、音楽2つ、クラウド2つ。重複はどちらか1つに',
                '無料体験のまま自動移行していないか？——「試しただけ」のつもりが本契約になっているものは即解約候補',
                '年額換算でいくらか？——月490円は年5,880円。年額で見ると判断が変わります',
              ]}
            />
          </div>
          <p>
            迷ったら、一度解約してみるのがおすすめです。サブスクは解約してもアカウントが消えるわけではなく、必要になればすぐ再開できます。
          </p>
        </Section>

        <Section id="step3" title="ステップ3｜種類別に解約する">
          <p>
            <strong>アプリストア経由（①）</strong>
            ：ステップ1で開いた「サブスクリプション」画面から、各サービスを選んで「解約（定期購入を解約）」を押すだけです。スマホの中で完結します。
          </p>
          <p>
            <strong>直接契約（②）</strong>：「サービス名
            解約」で検索して、公式サイトの解約ページから手続きします。ログインが必要なので、パスワードが分からない場合は先に再設定を。
          </p>
          <p>
            <strong>キャリアオプション（③）</strong>
            ：会員ページの「オプション解約」から手続きします。分かりにくければ、キャリアショップやサポートに「不要な有料オプションを全部外したい」と伝えるのが早道です。
          </p>
          <p>解約時に知っておくと安心な3点：</p>
          <DotList
            items={[
              '解約しても、支払い済みの期間末までは使えます（多くのサービス）。「今すぐ使えなくなる」わけではないので、気づいたときに解約するのが正解です',
              'アプリを削除しても解約にはなりません。請求は続きます。必ず解約手続きを',
              '更新日の直前は避けて余裕を持って。更新日当日の解約は間に合わないことがあります',
            ]}
          />
        </Section>

        <Section id="saving" title="どれくらい浮く？">
          <p>
            使っていないサブスク2〜3件と不要なキャリアオプション2件を止めるだけで、月2,000〜3,000円・
            <strong>年間2〜4万円</strong>
            になるケースは普通にあります。1時間の棚卸しとしては、かなり割のいい作業です。
          </p>
        </Section>

        <Section id="extras" title="あわせて見直すと効く｜容量とデータ通信量">
          <p>課金の整理と相性がいい「払いすぎ」の見直しを2つだけ紹介します。</p>
          <p>
            <strong>使っていないアプリを自動で整理する</strong>
            <br />
            iPhoneは「設定」→「App
            Store」→「非使用のAppを取り除く」をオンにすると、使っていないアプリを自動で端末から外してくれます（データは残り、再インストールで元どおり）。Androidは「Files」アプリの提案機能で未使用アプリをまとめて確認できます。アプリや写真の本格的な整理は
            <Link
              href="/guide/digital-seiri/digital-dansyari"
              className="text-blue-600 hover:underline"
            >
              デジタル断捨離のやり方
            </Link>
            でどうぞ。
          </p>
          <p>
            <strong>アプリごとのデータ通信を見直す</strong>
            <br />
            使っていないアプリが裏で通信を続けていることがあります。iPhoneは「設定」→「モバイル通信」、Androidは「設定」→「ネットワークとインターネット」から、アプリごとにモバイル通信をオフにできます。毎月ギガが足りずに追加購入している人は、ここを見直すと通信プラン自体を下げられることもあります。
          </p>
        </Section>

        <Section id="rebound" title="増やさない習慣｜課金のリバウンドを防ぐ">
          <DotList
            items={[
              '無料体験を始めたら、その場で解約期限をカレンダーに登録——「体験終了の2日前」にリマインダーを入れておけば、自動移行を防げます',
              '課金前にひと呼吸——「無料プランで足りないか」「今あるサービスと重複しないか」を考えてから',
              '契約したら一覧に追記——洗い出しで作った一覧を「契約の台帳」として育てると、次回の見直しが数分で済みます',
            ]}
          />
        </Section>

        <Section id="blindspot" title="その契約一覧、止められるのはあなただけです">
          <p>最後に、一つだけ。</p>
          <p>
            整理を終えたあなたの手元には、「何に、いくら、どこ経由で払っているか」の正確な一覧があります。でも、その一覧の存在も中身も、知っているのはあなた一人です。
          </p>
          <p>
            もし、あなたが急に入院したら。事故や病気で、しばらくスマホを触れなくなったら。サブスクもキャリアオプションも、解約されない限り請求が続きます。家族は「何を契約しているか」を知らないので、止めようがありません。ネット銀行やネット証券と同じで、スマホの中の契約は、本人以外には見えないのです。実際、デジタル関連で困った経験のある遺族は約6割にのぼり、その最多が「パスワードが分からず手が出せない」ことでした（2026年 BlueAdventures調べ）。
          </p>
          <p>
            だから、整理の仕上げにもう一手。
            <strong>
              契約一覧の中身は見せなくていいので、「どこに何があるか」だけを、もしものときに信頼できる人へ届く形にしておく。
            </strong>{' '}
            それだけで、今日の節約が、家族を困らせない備えにもなります。
          </p>
          <p>
            サブスクの請求が本人以外に止められない仕組みについては、コラム
            <Link
              href="/guide/column/subsuku-kaiyaku-riyu"
              className="text-blue-600 hover:underline"
            >
              サブスクは全部、死ぬまでに解約しておかなければならない3つの理由
            </Link>
            で、公的機関の実例とともに詳しく解説しています。
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

        <Section id="summary" title="まとめ｜4種類×3か所で全部見つかる">
          <p>
            スマホの有料サービスは、①アプリストア経由、②直接契約、③キャリア決済・オプション、④買い切り、の4種類。確認場所は「アプリストアのサブスクリプション画面」「カード明細」「キャリア会員ページ」の3か所で、すべて洗い出せます。使っていないものを解約すれば、年間数万円が戻ってきます。
          </p>
          <p>
            そして仕上げに、整理してできた契約一覧の「在りか」を、もしものときだけ信頼できる人に届く形で残しておく。ここまでやって、スマホの課金整理は本当に完成します。
          </p>
          <p>
            スマホ全体を片付けたい方は
            <Link
              href="/guide/digital-seiri/digital-dansyari"
              className="text-blue-600 hover:underline"
            >
              デジタル断捨離のやり方（全体版）
            </Link>
            、会員登録そのものを減らしたい方は
            <Link
              href="/guide/digital-seiri/account-seiri"
              className="text-blue-600 hover:underline"
            >
              会員登録・アカウント整理のやり方
            </Link>
            もどうぞ。
          </p>
        </Section>

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            整理した契約一覧の「在りか」を、もしものときに届く形で残すには
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、整理したデジタル情報を、見られたくないものは伏せたまま、もしものときだけ大切な人へ引き継ぐ準備ができるサービスです。資産の登録・PDF出力・定期リマインドは無料で使えます。
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
                写真・アプリ・メールも含めて丸ごと片付けたい方
              </p>
              <Link
                href="/guide/digital-seiri/digital-dansyari"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                デジタル断捨離のやり方｜スッキリ整理する全手順 &rsaquo;
              </Link>
            </li>
            <li>
              <p className="text-xs font-medium text-slate-500">
                会員登録そのものを減らしたい方
              </p>
              <Link
                href="/guide/digital-seiri/account-seiri"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                会員登録・アカウント整理のやり方｜探し方と退会の全手順 &rsaquo;
              </Link>
            </li>
          </ul>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
