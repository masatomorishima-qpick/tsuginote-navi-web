import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/digital-seiri/sabusuku-kanri';
const PAGE_IMAGE = `${SITE_URL}/images/guide/digital-seiri/sabusuku-kanri-main.webp`;
const PAGE_TITLE =
  'サブスク管理アプリの選び方と使い方｜契約の見える化から“もしもの備え”まで';
const PAGE_DESCRIPTION =
  '増えすぎたサブスクの管理は、月額・年額の見える化と更新日リマインドが鍵。サブスク管理アプリの選び方・できることから、アプリに頼らない管理法、家族が困らない「在りか」の備えまで解説します。';

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
  { id: 'problem', label: 'サブスク、いくつ契約しているか言えますか？' },
  { id: 'tanaoroshi', label: 'まず書き出しから' },
  { id: 'app', label: 'サブスク管理アプリでできること' },
  { id: 'select', label: '選び方の4つの軸' },
  { id: 'noapp', label: 'アプリを使わない管理法' },
  { id: 'blindspot', label: '管理の盲点｜一覧を知るのは自分だけ' },
  { id: 'finish', label: '仕上げ｜在りかごと届く形で残す' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ' },
];

const faqs = [
  {
    q: '無料のサブスク管理アプリで十分ですか？',
    a: '契約数が10件前後までなら、多くの場合は無料の範囲で足ります。登録数の上限・広告・複数端末対応などが有料の条件になっていることが多いので、まず無料で始めて不足を感じたら検討すれば十分です。',
  },
  {
    q: '銀行口座やカードと連携するタイプは安全ですか？',
    a: '連携型の多くは、参照専用の仕組みで明細を読み取る設計になっています。ただし安心して使うには、提供元がはっきりしたアプリを選び、アプリ自体とアカウントに強いパスワード・二段階認証を設定することが前提です。連携に抵抗があれば、手入力型でも管理の目的は十分果たせます。',
  },
  {
    q: 'サブスクの一覧は家族と共有しておくべきですか？',
    a: '日常的に全部見せる必要はありません。共有しておきたいのは「一覧がどこにあるか」という在りかです。生きている間は見せず、もしものときだけ届く形にしておけば、プライバシーと家族の安心を両立できます。',
  },
  {
    q: '管理アプリをやめたら、登録したデータはどうなりますか？',
    a: 'アプリを削除しても、サブスクの契約自体は続きます（解約にはなりません）。乗り換えるときは、新しい管理場所に一覧を移してからやめると抜け漏れを防げます。',
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
      datePublished: '2026-06-11',
      dateModified: '2026-06-11',
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
          name: 'サブスク管理アプリの選び方と使い方',
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

export default function SabusukuKanriPage() {
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
            <li className="text-slate-700">サブスク管理アプリの選び方と使い方</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ち情報｜デジタル整理術
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          サブスク管理アプリの選び方と使い方
          <span className="mt-2 block text-xl font-medium leading-snug text-slate-600 sm:text-2xl">
            契約の見える化から“もしもの備え”まで
          </span>
        </h1>

        <p className="mt-7 text-base leading-8 text-slate-700">
          動画に音楽、クラウド、アプリの月額課金——「サブスク、全部でいくつ契約してる？」と聞かれて、即答できる人は多くありません。1つひとつは数百円でも、合計すると毎月数千円。しかも自動更新なので、使っていなくても引き落としは続きます。
          この記事では、
          <strong>書き出しが終わったあとのサブスクを「把握できている状態」に保つ方法</strong>
          を解説します。サブスク管理アプリでできること・選び方から、アプリを使わない管理法、そして多くの解説が触れない「自分しか一覧を知らない」という管理の盲点まで。読み終えるころには、わが家に合った管理の仕組みが決められるはずです。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/digital-seiri/sabusuku-kanri-main.webp"
            alt="明るいリビングでスマホのサブスク一覧を確認しながら、家計を見直している様子"
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

        <Section id="problem" title="サブスク、いくつ契約しているか言えますか？">
          <p>サブスクが把握しづらいのは、性格や注意力の問題ではなく、仕組みの問題です。</p>
          <DotList
            items={[
              '金額が小さい——月数百円だと「まあいいか」で記憶から消えます',
              '入口がバラバラ——アプリ内課金、公式サイト、キャリア決済、クレジットカード直契約と、契約の場所が分かれています',
              '自動更新——何もしなくても続くので、「やめどき」を考える機会がありません',
              '気づくのは明細——クレジットカードの明細で「これ何の引き落とし？」となって初めて思い出します',
            ]}
          />
          <p>
            だからこそ、頭で覚えるのではなく、<strong>一覧で見える場所を1つ作る</strong>
            のが管理の基本です。
          </p>
        </Section>

        <Section id="tanaoroshi" title="まず書き出しから（このひと手間だけ先に）">
          <p>
            管理の仕組みを作る前に、今契約しているサブスクの洗い出しが必要です。スマホの課金履歴・カード明細からの確認手順と、不要なものの解約のやり方は、
            <Link
              href="/guide/digital-seiri/sumaho-kakin-seiri"
              className="text-blue-600 hover:underline"
            >
              スマホの有料サービス・課金を整理する方法
            </Link>
            で全手順を解説しています。本記事は「書き出しが終わったあと、二度と散らからないようにする」パートです。
          </p>
        </Section>

        <Section id="app" title="サブスク管理アプリでできること">
          <p>サブスク管理アプリは、契約中のサブスクを登録しておくと、次のことをやってくれます。</p>
          <DotList
            items={[
              '一覧化：何に入っているかが1画面で見える',
              '合計の見える化：月あたり・年あたりの総額を自動計算。「年間にすると◯万円」が見えると、見直しのモチベーションになります',
              '更新日前の通知：更新日や無料トライアル終了日の前にリマインド。「解約し忘れて1年分課金」を防げます。通知のタイミング（当日・1日前・3日前・1週間前など）を選べるものが多いです',
              '入力の手軽さ：主要なサブスクがプリセットされていて、選ぶだけで登録できるアプリもあります',
            ]}
          />
        </Section>

        <Section id="select" title="選び方の4つの軸">
          <p>アプリは数多くありますが、見るポイントは4つだけです。</p>
          <DotList
            items={[
              '①手入力型か、連携型か——手入力型はサブスク管理に特化したシンプルなアプリで（App StoreやGoogle Playで「サブスク管理」と検索すると見つかります）、口座やカードをアプリに渡さない安心感があります。連携型はマネーフォワード MEなどの家計簿アプリで、明細から自動で拾えますが、サブスク以外の管理も含めて使うかどうかで選びましょう',
              '②通知のタイミングを選べるか——更新日の何日前に知らせてくれるか。年払いのサブスクがあるなら、1週間以上前に通知できるものが安心です',
              '③無料で足りるか——登録数の上限や広告の有無が無料・有料の違いになっていることが多いです。まず無料で始めて、不足を感じたら課金で十分です',
              '④スマホ以外でも見られるか——パソコンやタブレットでも確認したい人は、複数端末対応かを確認しましょう',
            ]}
          />
        </Section>

        <Section id="noapp" title="アプリを使わない管理法もある">
          <p>数が少ない人は、アプリを増やさない管理も現実的です。</p>
          <DotList
            items={[
              'スマホのメモ・リマインダー：サブスク名・金額・更新日を1枚のメモに。更新日はカレンダーやリマインダーに登録しておけば通知も作れます',
              '紙のリスト：書き換えは面倒ですが、家族の目に届きやすいのが利点です',
              'エクセル・スプレッドシート：集計は得意ですが、更新が続かない・共有範囲が広がりやすいといった弱点もあります',
            ]}
          />
          <p>
            管理方法ごとの安全性や続けやすさの違いは
            <Link
              href="/guide/kazoku-kyoyu/joho-kyoyu-hikaku"
              className="text-blue-600 hover:underline"
            >
              パスワード・情報管理の方法の比較
            </Link>
            で詳しく扱っています。どの方法でも大事なのは1つ。
            <strong>「ここを見ればサブスクが全部わかる」場所を1か所に決める</strong>ことです。
          </p>
        </Section>

        <Section id="blindspot" title="管理の盲点｜そのサブスク一覧、自分しか知らない">
          <p>
            ここまでで、あなたのサブスクは見える化され、更新日には通知が来る状態になりました。ただ、この管理には盲点が1つあります。
          </p>
          <p>
            <strong>その一覧を見られるのは、あなただけ</strong>だということです。
          </p>
          <p>
            サブスクは、止めない限り引き落とされ続けます。もしあなたが急な入院などでスマホを操作できなくなったら——家族は、解約どころか「そもそも何に入っているのか」に、たどり着けるでしょうか。アプリの中の一覧は、スマホのロックの内側にあるからです。
          </p>
          <p>
            管理の仕上げは、「自分が把握する」の一歩先、
            <strong>「もしものとき、家族も把握できる」</strong>ところまでです。
          </p>
          <p>
            なぜそこまで必要なのか——サブスクという仕組みの性質から知りたい方は、コラム
            <Link
              href="/guide/column/subsuku-kaiyaku-riyu"
              className="text-blue-600 hover:underline"
            >
              サブスクは全部、死ぬまでに解約しておかなければならない3つの理由
            </Link>
            をどうぞ。
          </p>
        </Section>

        <Section id="finish" title="仕上げ｜一覧の「在りか」ごと、届く形で残す">
          <p>といっても、サブスクのIDやパスワードを家族に渡す必要はありません。</p>
          <p>
            「つぎの手ナビ デジタル資産」なら、
            <strong>
              契約しているサブスクや口座の「在りか」を登録し、生きている間は誰にも見せず、もしものときだけ指定した大切な人へ届く
            </strong>
            形で残せます。資産の登録・PDF出力・定期リマインドは無料。
            <strong>定期リマインドは「サブスクの定期見直し」の仕組みとしてもそのまま使えます</strong>
            ——リマインドが届くたびに一覧を見直せば、使っていないサブスクの解約タイミングにもなります。
          </p>
          <p>
            日常の見える化はアプリで、もしもの備えは届く仕組みで。2つそろって、サブスク管理は完成します。
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

        <Section id="summary" title="まとめ｜見える化はアプリで、もしもは届く仕組みで">
          <p>
            サブスク管理は、①
            <Link
              href="/guide/digital-seiri/sumaho-kakin-seiri"
              className="text-blue-600 hover:underline"
            >
              書き出しで現状を洗い出し
            </Link>
            、②「ここを見れば全部わかる」場所を1か所に決め（アプリ・メモ・紙のどれでも）、③月額・年額と更新日を見える状態に保つ——この3段階で散らからなくなります。
          </p>
          <p>
            そして最後に、その一覧の「在りか」を、もしものときだけ家族に届く形で残しておく。自分のための見える化が、家族のための安心にまで延びて、サブスク管理は本当に完成します。
          </p>
          <p>
            会員登録そのものを減らしたい方は
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
            サブスクの「在りか」を、もしものときに届く形で残す
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            あなたにもしもがあったとき、家族が「どこに何があるか」にたどり着けるように。「つぎの手ナビ デジタル資産」は、パスワードや口座・契約・写真の在りかを、生きている間は誰にも見せず、もしものときだけ選んだ人へ届ける準備ができるサービスです。登録・PDF出力・定期リマインドは無料。あなたにできる、いちばんやさしい準備です。
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
                まずサブスクの見直し・解約から始めたい方
              </p>
              <Link
                href="/guide/digital-seiri/sumaho-kakin-seiri"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                スマホの有料サービス・課金を整理する方法｜確認から解約までの全手順 &rsaquo;
              </Link>
            </li>
            <li>
              <p className="text-xs font-medium text-slate-500">
                増えすぎた会員登録ごと減らしたい方
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
                管理方法（アプリ・紙・エクセル等）を比べて選びたい方
              </p>
              <Link
                href="/guide/kazoku-kyoyu/joho-kyoyu-hikaku"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                パスワードや大事な情報、エクセル管理は危険？方法の比較 &rsaquo;
              </Link>
            </li>
          </ul>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
