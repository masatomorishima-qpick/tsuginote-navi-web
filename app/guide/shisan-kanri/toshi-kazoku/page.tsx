import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/shisan-kanri/toshi-kazoku';
const PAGE_TITLE =
  '投資、家族に知らせる？知らせない？｜内緒のままで大丈夫か、もしものときどうなるか';
const PAGE_DESCRIPTION =
  '投資を家族に知らせていない・反対されている人へ。なぜ家族に言わない人が多いのか、知らせる/知らせないの考え方、伝え方のコツを中立に解説。そして多くの解説が触れない「知らせないまま、もしものとき家族が口座にたどり着けない」問題と、その備え方まで。';

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
        url: `${SITE_URL}/images/guide/shisan-kanri/toshi-kazoku-main.webp`,
        width: 1600,
        height: 900,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [`${SITE_URL}/images/guide/shisan-kanri/toshi-kazoku-main.webp`],
  },
};

const toc = [
  { id: 'why', label: 'なぜ、家族に投資を知らせない人が多いのか' },
  { id: 'pros-cons', label: '知らせる・知らせない、それぞれの考え方' },
  { id: 'how', label: '知らせると決めたら｜角の立たない伝え方' },
  { id: 'blindspot', label: '「もしものとき、家族はたどり着けるか」' },
  { id: 'finish', label: '第3の道｜生きている間は知らせず、もしものときだけ届く' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ' },
];

const faqs = [
  {
    q: '家族に内緒で投資するのは、いけないことですか？',
    a: 'いけないことではありません。投資を家族に知らせるかどうかは、本来あなたが決めていいことです。ただ、「知らせない」を選ぶなら、もしものときに家族が口座にたどり着けるようにする備えだけは、別にしておくと安心です。',
  },
  {
    q: 'NISAをやっていることは、家族にバレますか？',
    a: '自分から知らせない限り、日常的に家族に通知が届くことは基本的にありません。だからこそ「もしものとき、家族が存在を知らない」状態になりやすく、在りかを残す備えが意味を持ちます。',
  },
  {
    q: '家族に投資を反対されています。どうすればいいですか？',
    a: '説得より、まず相手の不安（過去の損や詐欺の記憶など）を聞くことをおすすめします。そのうえで、少額のつみたてなど堅実な形から「方針」を共有すると、理解されやすくなります。それでも合わなければ、無理に全部を共有せず、もしものときの備えだけ整えておく方法もあります。',
  },
  {
    q: '一人暮らしで、投資を知らせる家族が身近にいません。',
    a: 'その場合こそ、もしものときに「離れて住む家族や信頼できる人へ、口座の在りかだけが届く」備えが役立ちます。日常を見られる心配がないぶん、向いている方法です。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      image: `${SITE_URL}/images/guide/shisan-kanri/toshi-kazoku-main.webp`,
      mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`,
      datePublished: '2026-06-07',
      dateModified: '2026-06-07',
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
          name: '資産・お金の管理',
          item: `${SITE_URL}/guide/shisan-kanri`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: '投資、家族に知らせる？知らせない？',
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

export default function ToshiKazokuPage() {
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
              <Link href="/guide/shisan-kanri" className="text-blue-600 hover:underline">
                資産・お金の管理
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">投資、家族に知らせる？知らせない？</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ち情報｜資産・お金の管理
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          投資、家族に知らせる？知らせない？
          <span className="mt-2 block text-xl font-medium leading-snug text-slate-600 sm:text-2xl">
            内緒のままで大丈夫か、もしものときどうなるか
          </span>
        </h1>

        <p className="mt-7 text-base leading-8 text-slate-700">
          NISAや株式投資を始めたけれど、家族には言っていない——そういう人は、実はとても多いです。ある調査では、投資をしていることを家族以外に「誰にも話さない」人が5割を超え、知らせない最多の理由は「特に話す必要がない」でした（三井住友銀行
          Money VIVA／SMBC日興系の調査）。
          知らせない理由は人それぞれ。お金の話はしにくい、反対されそう、過干渉を避けたい、自分の自由にしたい。どれも自然な感覚です。一方で、ふとこんな不安がよぎることもあるはずです。
          <strong>「もし自分に何かあったら、この口座は——家族は気づけるのだろうか?」</strong>
          この記事では、まず「なぜ家族に知らせない人が多いのか」を落ち着いて整理し、知らせる・知らせないそれぞれの考え方、伝えるときのコツを中立に解説します。そして最後に、多くの解説が触れない「知らせないまま、もしものときどうなるか」と、その現実的な備え方まで。投資のスタンスは人それぞれでいい、という前提で読んでください。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/shisan-kanri/toshi-kazoku-main.webp"
            alt="夜のリビングで一人スマホを見ながら、自分の投資を家族は知っているだろうかと考える人"
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

        <Section id="why" title="なぜ、家族に投資を知らせない人が多いのか">
          <p>
            「隠している」というより「言っていないだけ」のことが大半です。背景には、いくつかの共通した理由があります。
          </p>
          <DotList
            items={[
              'お金の話自体がしにくい：日本では収入や資産の話をタブー視する空気があり、家族でも切り出しにくいものです（調査でも「特に話す必要がない」が最多理由）',
              '反対されそう：投資に慎重な家族だと、「危ないからやめて」と言われそうで言い出せない。実際、打ち明けた人の約8%は反対を経験しています',
              '過去の負の経験：家族や親戚に、投資詐欺や大きな損をした人がいると、「投資＝怖いもの」という空気があり、話が通じにくい',
              '干渉されたくない・自分の裁量でやりたい：いちいち口を出されず、自分の判断で続けたい',
            ]}
          />
          <p>
            どれも責められる理由ではありません。
            <strong>投資を知らせるかどうかは、本来あなたが決めていいこと</strong>
            です。この記事も「家族に全部オープンにすべき」と迫るものではありません。
          </p>
        </Section>

        <Section id="pros-cons" title="知らせる・知らせない、それぞれの考え方">
          <p>
            二択で白黒つける必要はありませんが、判断の材料として両面を整理します。
          </p>
          <p>
            <strong>知らせることのメリット</strong>
          </p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <DotList
              items={[
                '家計や将来設計を一緒に考えられる（教育費・住宅・老後など）',
                '大きな判断（住宅購入や転職）のときに足並みがそろう',
                'もしものとき、家族が資産にたどり着ける',
              ]}
            />
          </div>
          <p>
            <strong>知らせないことの背景（と、その限界）</strong>
          </p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <DotList
              items={[
                'プライバシーが保てる、干渉されない、夫婦でもお金は別々という考え方も尊重されるべき',
                'ただし——「知らせない」を選ぶと、後述の「もしものとき」だけは別の備えが要る',
              ]}
            />
          </div>
          <p>
            ポイントは、
            <strong>
              「日常で家族に話すか」と「もしものときに家族がたどり着けるか」は、分けて考えられる
            </strong>
            ということです。日常は内緒のままでも、もしものときの備えだけは別に用意できます（記事の最後で扱います）。
          </p>
        </Section>

        <Section id="how" title="知らせると決めたら｜角の立たない伝え方">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/shisan-kanri/toshi-kazoku-step.webp"
              alt="ダイニングで夫婦が一緒にパソコンを見ながら、穏やかにお金の話をしている様子"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>
            家族に共有すると決めた場合、いきなり金額から入ると身構えられがちです。順番にコツがあります。
          </p>
          <DotList
            items={[
              '金額より「方針」から：「いくら持っている」より先に、「老後のために少しずつ積み立てている」という目的・スタンスを話すと、反対されにくくなります',
              '少額・つみたてから見せる：NISAのつみたて投資など、コツコツ型から共有すると「堅実な備え」として理解されやすいです',
              '一緒に学ぶ姿勢で：「教えるから一緒にやろう」より「一緒に調べよう」のほうが、対等で角が立ちません',
              '反対されたら、説得より対話：反対の裏には過去の経験や不安があります。否定せず「何が心配か」を聞くほうが、結果的に前に進みます',
            ]}
          />
          <p>
            それでも家族と価値観が合わないこともあります。その場合は無理に全部を共有しなくて大丈夫です。次の「もしものとき」の備えだけは、しておく価値があります。
          </p>
        </Section>

        <Section
          id="blindspot"
          title="知らせない人ほど見落とす｜「もしものとき、家族はたどり着けるか」"
        >
          <p>ここからが、上位の解説記事がほとんど触れていない論点です。</p>
          <p>
            投資を家族に知らせていない場合、いちばんの盲点は
            <strong>
              「もしあなたに何かあったとき、家族はその口座の存在すら知らない」
            </strong>
            ことです。ネット証券もNISAも、紙の通知はほとんど届きません。取引はスマホやパソコンの中で完結し、ログインできるのはあなただけ。家族は「どこの証券会社か」「そもそも投資をしていたのか」を知らなければ、たどり着きようがありません。
          </p>
          <p>
            結果として、
            <strong>持ち主に何かあった口座は、家族に気づかれないまま宙に浮きます。</strong>{' '}
            これは「投資を知られたくない」気持ちとは別の、純粋に実務的な問題です。実際、大切な方を亡くした人がデジタル関連で最も困ったのは「スマホ・パソコンのパスワードが分からない」ことで、約7割が「生前に整理してくれていたら助かった」と答えています（2025年
            BlueAdventures調べ）。
          </p>
          <p>
            つまり、知恵袋や掲示板で繰り返される葛藤——「家族に知られたくない。でも、自分にもしものことがあったら困るのでは」——は、
            <strong>「日常で話すか／隠すか」の二択で考えるから答えが出ない</strong>のです。
          </p>
        </Section>

        <Section id="finish" title="第3の道｜「生きている間は知らせず、もしものときだけ届く」">
          <p>
            「全部オープンにする」と「完全に内緒にする」の間に、第3の選択肢があります。
          </p>
          <p>
            <strong>
              生きている間は、家族に知らせなくていい。でも、もしものときだけ、口座の“在りか”が、自分の選んだ人に届く。
            </strong>{' '}
            ——この形なら、日常のプライバシーや自分の裁量は守ったまま、「宙に浮く口座」のリスクだけを消せます。残高や取引の中身まで生前に見せる必要はありません。「どこに、何があるか」という在りかだけを、もしものときに届く形にしておけばいい。生前に誰へ見せるか・見せないかも、人ごとに選べます。
          </p>
          <p>
            投資のスタンスは、これからも自由でいい。ただ、その自由を、もしものときに家族の負担に変えないために——在りかを残す、という一手だけ加えておく。それで、内緒の投資も「家族を困らせない投資」になります。
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

        <Section id="summary" title="まとめ｜スタンスは自由でいい、在りかだけ残す">
          <p>
            投資を家族に知らせるかどうかは、人それぞれでいい——これが前提です。知らせない理由（お金の話のしにくさ・反対への不安・干渉を避けたい）は自然なもので、無理にオープンにする必要はありません。
          </p>
          <p>
            ただし、「知らせない」を選ぶと、もしものときに家族が口座にたどり着けず、資産が宙に浮くという一点だけは残ります。これは「日常で話すか／隠すか」とは別の問題で、
            <strong>
              「生きている間は知らせず、もしものときだけ在りかが届く」第3の道
            </strong>
            で解けます。スタンスは自由なまま、家族を困らせない。それが、投資と家族の、いちばん無理のない付き合い方です。
          </p>
          <p>
            保険や口座も含めて整理したい方は
            <Link
              href="/guide/shisan-kanri/hoken-ichiran-excel"
              className="text-blue-600 hover:underline"
            >
              保険契約の一覧表をエクセルで作る方法
            </Link>
            、家族との共有の線引きは
            <Link
              href="/guide/kazoku-kyoyu/password-account-kyoyu"
              className="text-blue-600 hover:underline"
            >
              家族とのパスワード・アカウント共有
            </Link>
            もどうぞ。
          </p>
        </Section>

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            口座の「在りか」を、もしものときに届く形で残すには
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、口座やサービスの在りかを、生きている間は誰にも見せず、もしものときだけ選んだ人へ届ける準備ができるサービスです。資産の登録・PDF出力・定期リマインドは無料で使えます。
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
                保険・口座も含めて一覧で把握したい方
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
                家族と何をどこまで共有するか迷っている方
              </p>
              <Link
                href="/guide/kazoku-kyoyu/password-account-kyoyu"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                家族とのパスワード・アカウント共有｜安全なやり方と線引き &rsaquo;
              </Link>
            </li>
          </ul>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
