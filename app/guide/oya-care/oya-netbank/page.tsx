import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/oya-care/oya-netbank';
const PAGE_IMAGE = `${SITE_URL}/images/guide/oya-care/oya-netbank-main.webp`;
const PAGE_TITLE =
  '親がネット銀行を使っているなら｜もしものとき家族が困らない「在りか」の備え方';
const PAGE_DESCRIPTION =
  '通帳がないネット銀行は、もしものとき家族から「見えない」資産になりがち。親が元気な今、残高もパスワードも聞かずに「在りか」だけを共有する前向きな備え方を3ステップで解説します。';

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
  { id: 'invisible', label: 'ネット銀行は家族から「見えない」資産になる' },
  { id: 'unreachable', label: 'スマホが開けないと「存在」もわからない' },
  { id: 'ng', label: 'やってはいけない備え方' },
  { id: 'steps', label: '親と一緒に確認する3ステップ' },
  { id: 'arika', label: '共有するのは「在りか」だけ' },
  { id: 'moshimo', label: 'もしものときだけ届く形にする' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ' },
];

const faqs = [
  {
    q: '親の口座のパスワードまで聞いておくべきですか？',
    a: 'いいえ、必要ありません。もしものときに家族が動くために必要なのは「どの銀行に口座があるか」という在りかの情報です。パスワードの値そのものは親本人の管理に任せましょう。つぎの手ナビでは、本人がパスワードを残したい場合も端末内でAES-256暗号化して保管する仕組みになっています。',
  },
  {
    q: '親が認知症になったら、口座はどうなりますか？',
    a: '一般に、金融機関が本人の判断能力の低下を把握すると、本人保護の観点から取引が制限される場合があります。最近では、元気なうちに家族を代理人として登録しておけるネット銀行も増えているため、あらかじめ公式の制度を調べておくのも手です。制度や対応は金融機関によって異なり、家族の状況によって取れる選択肢も変わるため、詳しくは金融機関や専門家にご相談ください。この記事で扱った「在りかの共有」は、そうした事態になる前の、元気なうちにできる準備です。',
  },
  {
    q: '家族が親の代わりにログインしてもいいですか？',
    a: 'おすすめできません。多くの銀行では、規約上、口座は本人が利用するものとされており、本人以外の操作はトラブル時に補償の対象外となる場合があります。操作は本人が行い、家族は「在りか」を知っておく——この分担が安全です。',
  },
  {
    q: '紙のメモに残してもらえば十分ですか？',
    a: '第一歩としては十分意味があります。ただし、紙は紛失や盗み見に弱く、口座が増えたり変わったりしたときに更新が漏れがちです。「人ごと・種別・時間軸」を決めて、もしものときだけ届く仕組みと組み合わせると、より安心です。',
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
          name: '親・家族のケア',
          item: `${SITE_URL}/guide/oya-care`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: '親がネット銀行を使っているなら',
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

const ngItems = [
  {
    method: '親に黙ってIDやパスワードをメモして保管する',
    risk: '本人の同意がない把握は、信頼関係を損ない、親の尊厳を傷つけます',
  },
  {
    method: '家族が親の代わりにログインする',
    risk: '多くの銀行の規約では本人以外の利用は想定されておらず、トラブル時に補償の対象外となる場合があります',
  },
  {
    method: '「全部教えて」と迫る',
    risk: '資産の中身まで開示を求めると、プライバシーとぶつかり、かえって話が進まなくなります',
  },
  {
    method: 'パスワードまで全部紙に書いて渡してもらう',
    risk: '紛失・盗み見に弱く、変更のたびに更新が漏れがちです',
  },
];

function NgTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[15px] leading-7">
        <thead>
          <tr className="bg-slate-50 text-left">
            <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
              避けたい備え方
            </th>
            <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
              なぜダメなのか（リスク）
            </th>
          </tr>
        </thead>
        <tbody>
          {ngItems.map((item) => (
            <tr key={item.method}>
              <td className="border border-slate-200 px-4 py-3 align-top font-medium text-slate-900">
                <span aria-hidden="true" className="mr-1.5 font-bold text-rose-600">×</span>
                {item.method}
              </td>
              <td className="border border-slate-200 px-4 py-3 align-top text-slate-700">
                {item.risk}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function OyaNetbankPage() {
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
              <Link href="/guide/oya-care" className="text-blue-600 hover:underline">
                親・家族のケア
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">親がネット銀行を使っているなら</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ち情報｜親・家族のケア
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          親がネット銀行を使っているなら
          <span className="mt-2 block text-xl font-medium leading-snug text-slate-600 sm:text-2xl">
            もしものとき家族が困らない「在りか」の備え方
          </span>
        </h1>

        <p className="mt-7 text-base leading-8 text-slate-700">
          「親がネット銀行を使い始めた」——振込のたびに窓口へ行く必要がなくなり、通帳の記帳も不要。本人にとっては間違いなく便利になりました。ただ、ひとつだけ、家族の立場から気づいておきたいことがあります。
          <strong>
            通帳がない。郵便物も来ない。つまり、家族からはその口座が「見えない」
          </strong>
          ということです。この記事では、親のプライバシーに踏み込まず、残高もパスワードも聞かずに、「どこに何があるか」＝
          <strong>在りか</strong>
          だけを共有して、もしものときに家族が困らない状態をつくる方法を解説します。親が元気な今だからこそできる、前向きな備えです。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/oya-care/oya-netbank-main.webp"
            alt="明るいリビングで、親と子がスマホを見ながら銀行口座の在りかについて穏やかに話している様子"
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

        <Section id="invisible" title="通帳がないネット銀行は、家族から「見えない」資産になる">
          <p>これまでの銀行口座には、家の中に「物理的な手がかり」がありました。</p>
          <DotList
            items={[
              '紙の通帳やキャッシュカードが引き出しにある',
              '取引のお知らせや残高通知が郵便で届く',
              '銀行の窓口やATMに行く姿を家族が見ている',
            ]}
          />
          <p>
            ネット銀行では、この手がかりがほぼゼロになります。口座のすべてはスマホやパソコンの画面の中。しかも、ネット銀行を使いこなしている人ほどペーパーレス設定を済ませていて、郵便物も届きません。
          </p>
          <p>
            これは資産の多い少ないの話ではなく、
            <strong>
              「情報の在りかが家族に伝わる経路が、仕組みとして存在しない」
            </strong>
            という話です。便利にした本人に悪気はなく、家族にも落ち度はない。それでも、何も準備しなければ「見えない」状態が続きます。
          </p>
        </Section>

        <Section id="unreachable" title="スマホが開けないと、残高どころか「存在」もわからない">
          <p>
            ネット銀行の入口は、スマホのロック画面です。もし親が急な入院などで一時的にスマホを操作できなくなったとき、ロックが解除できなければ、家族は残高を確認できないだけでなく、
            <strong>その口座が存在することすら知りようがありません</strong>。
          </p>
          <p>
            実際、大切な方を亡くした人がデジタル関連で最も困ったのは「スマホ・パソコンのパスワードが分からない」ことでした（2026年
            BlueAdventures調べ）。
          </p>
          <p>
            ここで大切なのは、不安をふくらませることではありません。逆です。
            <strong>
              「どの銀行を使っているか」が家族に伝わる形さえ作っておけば、この心配はほぼ解消します。
            </strong>
            ネット銀行の便利さはそのままに、備えだけを足せばいい。次の章から、その具体的なやり方を見ていきます。
          </p>
        </Section>

        <Section id="ng" title="やってはいけない備え方｜親に黙って把握・代理ログイン">
          <p>先に、やりがちだけれど避けたい方法を確認しておきます。</p>
          <NgTable />
          <p>
            共通する問題は、<strong>「本人の理解と同意」が抜けている</strong>
            こと、そして「全部」を知ろうとすることです。備えの主役はあくまで親本人。家族は、もしものときに動ける最小限の情報——在りか——を受け取れる形を、一緒につくるのが役割です。
          </p>
        </Section>

        <Section id="steps" title="元気な今、親と一緒に確認する3ステップ">
          <p>
            確認するのは次の3つだけです。残高・暗証番号・パスワードの中身は聞きません。だからこそ、親も答えやすくなります。
          </p>
          <DotList
            items={[
              '①どの銀行を使っているか——銀行名だけで十分です。ネット銀行のほか、ネット証券やスマホ決済も使っていれば名前だけ控えます',
              '②入口はどこか——スマホのアプリか、パソコンのサイトか。どの端末を使っているか。登録している電話番号・メールアドレスはどれか（パスワード再設定の経路になるため）',
              '③何の引き落とし・入金があるか——年金の受取口座か、公共料金や通信費の引き落としがあるか。もしものとき、家族が「止まると困るもの」を把握できます',
            ]}
          />
          <p>
            切り出し方は、「お金のことを教えて」ではなく
            <strong>「もしものとき困らないように、どこに何があるかだけ教えて」</strong>
            。管理ではなく安心のための確認だと伝わると、話は進みやすくなります。帰省や通院の付き添いなど、顔を合わせるタイミングで一度、30分もあれば終わります。
          </p>
        </Section>

        <Section id="arika" title="「全部把握」はいらない。共有するのは「在りか」だけ">
          <p>
            親の資産を子が「全部把握」しようとすると、どうしても緊張が生まれます。親には親の暮らしとプライバシーがあり、それは何歳になっても変わりません。
          </p>
          <p>
            そこで発想を変えます。
            <strong>共有するのは「在りか」だけ。中身は共有しない。</strong>
          </p>
          <DotList
            items={[
              '「○○銀行に口座がある」——共有する',
              '「残高がいくらか」——共有しない',
              '「パスワードが何か」——共有しない',
            ]}
          />
          <p>
            在りかだけなら、親は見られたくないものを見せずに済み、子は詮索の後ろめたさを感じずに済みます。さらに、共有の形は3つの軸で細かく決められると理想的です。
            <strong>
              誰に届けるか（人ごと）・どの情報を届けるか（種別）・いつ届けるか（時間軸＝もしものときだけ）
            </strong>
            。たとえば「銀行口座の在りかは長男にだけ、もしものときだけ」という形です。
          </p>
          <p>
            夫婦間の情報共有でも同じ考え方が使えます。詳しくは
            <Link
              href="/guide/kazoku-kyoyu/fuufu-joho-kyoyu"
              className="text-blue-600 hover:underline"
            >
              夫婦の情報共有のやり方
            </Link>
            もどうぞ。
          </p>
        </Section>

        <Section id="moshimo" title="生きている間は見せず、もしものときだけ届く形にする">
          <p>在りかを確認したら、それを「もしものときに家族へ届く形」で残します。</p>
          <p>
            紙のメモやエンディングノートに書いておくのも第一歩としては立派です。ただ、紙には「どこにしまったか家族が知らない」「書いた後に口座が増えた・変わった」「普段から見える場所に置くと盗み見が心配」という弱点があります。
          </p>
          <p>
            「つぎの手ナビ デジタル資産」は、この弱点を仕組みで解決します。
            <strong>
              登録した在りかの情報は、生きている間は誰にも見せず、もしものとき（入院・事故など）だけ、あらかじめ指定した大切な人へ届く
            </strong>
            形で準備できます。資産の登録・PDF出力・定期リマインドは無料。親自身が登録するのが基本ですが、最初の設定を家族が一緒に手伝うのもおすすめです。
          </p>
          <p>
            急な入院のときに家族が必要とする情報の全体像は、
            <Link
              href="/guide/moshimo-sonae/kyu-nyuin-sonae"
              className="text-blue-600 hover:underline"
            >
              急な入院に備えて、家族に伝えておく情報リスト
            </Link>
            にまとめています。
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

        <Section id="summary" title="まとめ｜「在りか」の共有は、親への干渉ではなく贈り物">
          <p>
            親がネット銀行を使っているなら、確認することは3つだけ。
            <strong>どの銀行か・入口はどこか・何の引き落としがあるか。</strong>
            残高もパスワードも聞かない「在りか」の共有なら、親のプライバシーを守ったまま、もしものときに家族が困らない状態をつくれます。
          </p>
          <p>
            それは親を管理することではなく、「あなたが倒れても、家族は大丈夫」という安心を、家族みんなで用意すること。元気な今だからこそ、穏やかに話せる備えです。
          </p>
          <p>
            投資や証券口座について家族と話すきっかけづくりには、
            <Link
              href="/guide/shisan-kanri/toshi-kazoku"
              className="text-blue-600 hover:underline"
            >
              投資、家族に知らせる？知らせない？
            </Link>
            もあわせてどうぞ。
          </p>
        </Section>

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            「もしものときだけ届く」備えを、親子で今日のうちに
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
                急な入院など「もしも」に具体的に備えたい方
              </p>
              <Link
                href="/guide/moshimo-sonae/kyu-nyuin-sonae"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                急な入院に備えて、家族に伝えておく情報リスト &rsaquo;
              </Link>
            </li>
            <li>
              <p className="text-xs font-medium text-slate-500">
                夫婦・パートナー間の情報共有も整えたい方
              </p>
              <Link
                href="/guide/kazoku-kyoyu/fuufu-joho-kyoyu"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                夫婦の情報共有のやり方｜日常のすれ違い解消から“もしも”の備えまで &rsaquo;
              </Link>
            </li>
            <li>
              <p className="text-xs font-medium text-slate-500">
                投資・証券口座を家族にどう伝えるか考えたい方
              </p>
              <Link
                href="/guide/shisan-kanri/toshi-kazoku"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                投資、家族に知らせる？知らせない？｜もしものときどうなるか &rsaquo;
              </Link>
            </li>
          </ul>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
