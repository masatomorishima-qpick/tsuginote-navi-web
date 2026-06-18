import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/column/pet-omoide-5shukan';
const PAGE_IMAGE = `${SITE_URL}/images/guide/column/pet-omoide-5shukan-main.webp`;
const PAGE_TITLE = 'ペットの思い出を一生ものにする5つの習慣';
const PAGE_DESCRIPTION =
  'スマホに何百枚——私たちは史上いちばんペットを撮っている飼い主かもしれません。でも「撮る」と「残る」は別の話。共有・二重保管・フォトブック・鳴き声の記録、そして見落とされがちな「鍵の引き継ぎ」まで、撮りためた思い出を一生ものにする5つの習慣を解説します。';

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
  { id: 'ima', label: '私たちは、史上いちばんペットを撮っている飼い主かもしれない' },
  { id: 'kyoyu', label: '習慣①：共有を「仕組み」にする' },
  { id: 'nijuu', label: '習慣②：二重に持つ' },
  { id: 'kami', label: '習慣③：年に1冊だけ、紙に戻す' },
  { id: 'koe', label: '習慣④：写真だけでなく、「鳴き声・しぐさ」を残す' },
  { id: 'core', label: 'デジタル写真は劣化しない。その代わり——' },
  { id: 'official', label: 'アカウントの引き継ぎは、どう備えるのか' },
  { id: 'kagi', label: '習慣⑤：鍵を引き継げるようにしておく' },
  { id: 'faq', label: 'ここで出そうな、2つの疑問' },
  { id: 'matome', label: '撮るのと同じくらい、残すのも習慣に' },
];

const faqs = [
  {
    q: 'スマホのパスコードを家族に教えてあるから、大丈夫では？',
    a: '良い備えですが、それは「玄関の鍵」を1本渡しただけの状態です。スマホが開いても、うちの子の写真がiCloudにあるのか、共有アプリにあるのか、別のクラウドにあるのかは、開けた人が一つずつ探さなければ分かりません。さらに、パスコードは機種変更や再設定で変わります。必要なのは1本の鍵そのものより、「どこに何があるか」の一覧のほうです。',
  },
  {
    q: 'うちの子はまだ元気。もしもの話は、早すぎませんか？',
    a: 'おっしゃる通り、これは「もしものため」だけの習慣ではありません。むしろ日常で役に立ちます。あなたが急に入院した日に、お世話をお願いした家族が写真や動画にすぐアクセスできる。スマホを落として買い替えた日に、これまでの全部がちゃんと手元に戻る。鍵の引き継ぎは、遠い未来のためではなく、明日のための備えでもあるのです。',
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
          name: 'ペットの思い出を一生ものにする5つの習慣',
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

function DotList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2.5">
          <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const summaryRows = [
  { habit: '①共有を仕組みに', todo: 'iCloud共有・Googleフォト・共有アプリで家族と自動共有', time: '15分' },
  { habit: '②二重に持つ', todo: 'クラウド＋年1回、ポータブルSSDにコピー', time: '年1回30分' },
  { habit: '③紙に戻す', todo: '年1冊、ベストだけフォトブックに', time: '年1回30分' },
  { habit: '④声・しぐさを残す', todo: '月に数本の短い動画・鳴き声メモ', time: '毎月数分' },
  { habit: '⑤鍵を引き継ぐ', todo: 'ありかの一覧＋公式機能の設定', time: '15分' },
];

const sources = [
  '一般社団法人ペットフード協会「2025年 全国犬猫飼育実態調査」（犬の飼育頭数 約682万頭／猫の飼育頭数 約884万頭・2025年12月発表）',
  'Apple「故人アカウント管理連絡先（デジタル遺産プログラム）」の設定・利用条件（iOS 15.2／iPadOS 15.2／macOS 12.1以降。アクセスキーと死亡証明書の提出が必要）',
  'Google「アカウント無効化管理ツール（Inactive Account Manager）」ヘルプ（未使用期間は3・6・12・18か月から選択、信頼できる連絡先を最大10人まで指定可能）',
];

export default function PetOmoide5ShukanPage() {
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
            <li className="text-slate-700">ペットの思い出を一生ものにする5つの習慣</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          コラム｜ペットの思い出とデジタル
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          ペットの思い出を一生ものにする5つの習慣
        </h1>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/column/pet-omoide-5shukan-main.webp"
            alt="リビングでスマートフォンを使い、くつろぐペットを撮影する飼い主"
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

        <Section id="ima" title="私たちは、史上いちばんペットを撮っている飼い主かもしれない">
          <p>
            今この記事を読んでいるあなたのスマホの中にも、うちの子の写真が何百枚、何千枚と入っているはずです。寝顔、初めて家に来た日、なんでもない散歩の途中、ごはんを待つ顔。撮ったことすら忘れている1枚も、きっとたくさんあります。
          </p>
          <p>
            日本で飼われている犬は約682万頭、猫は約884万頭（2025年・ペットフード協会調べ）。その多くの家に、カメラ付きのスマホがあります。フィルムを現像していた時代は、ペットの写真もアルバム1冊に収まる程度でした。それが今は、1頭につき数百枚、数千枚。私たちは、歴史でいちばんたくさん、うちの子を記録できる時代の飼い主です。
          </p>
          <p>
            これは、とても良いことです。シャッターを切るのにお金も手間もかからなくなったぶん、残せる思い出は何十倍にも増えました。私自身、その手軽さを毎日ありがたく感じている一人です。
          </p>
          <p>
            ただ——撮った枚数と、10年後に「残っている」枚数は、別の話です。たくさん撮ることと、ちゃんと残すことのあいだには、実は小さな段差があります。この記事では、その段差を越えて、撮りためた写真を本当に一生ものにする5つの習慣を紹介します。①から④は、今日その場で始められる定番です。そして5つ目に、見落とされがちな最後のひとつを。
          </p>
        </Section>

        <Section id="kyoyu" title="習慣①：共有を「仕組み」にする——撮る人ひとりに集めない">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/column/pet-omoide-5shukan-kyoyu.webp"
              alt="スマートフォンでペットの写真を家族みんなで一緒に見て笑い合う様子"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>最初の習慣は、写真を一人のスマホに溜め込まないことです。</p>
          <p>
            多くの家庭で、ペットの写真は「よく撮るほうの人」のスマホに集中します。これはとても自然なことですが、ひとつ弱点があります。その1台が、思い出の唯一の置き場所になってしまうことです。
          </p>
          <DotList
            items={[
              <>
                <strong>家族で共有できる仕組みを、ひとつ決めて使う。</strong>{' '}
                iPhoneユーザーなら「iCloud共有アルバム」、Android中心なら「Googleフォトの共有アルバム」、ペット専用の共有アプリでも構いません。大事なのは、撮った写真が自動的に、家族のもう一人の手元にも流れる状態を作ることです。
              </>,
              <>
                <strong>離れて暮らす家族も招待してしまう。</strong>{' '}
                共有アルバムなら、実家の親やきょうだいも、うちの子の成長を一緒に見られます。見せ合う楽しさが増えるうえに、同じ写真が複数の人の手元にあること自体が、いちばん身近なバックアップになります。
              </>,
              <>
                <strong>撮る人が一人だと、思い出も1台に偏ります。</strong>{' '}
                共有を仕組みにしておくと、その偏りから抜け出せます。
              </>,
              <>
                <strong>クラウドの「顔認識」を味方につける。</strong>{' '}
                GoogleフォトやiPhoneの写真アプリは、うちの子の顔を見分けて、自動でアルバムにまとめてくれます。探す手間が減るうえ、Googleフォトの「パートナー共有」のように、選んだ相手へ写真を自動で共有する設定もあります。最初に一度だけ設定すれば、あとは撮るたびに勝手に共有されていきます。
              </>,
            ]}
          />
        </Section>

        <Section id="nijuu" title="習慣②：二重に持つ——クラウドは「便利」だが「絶対」ではない">
          <p>
            次は保管の話です。今やほとんどの人が、写真をiCloudやGoogleフォトといったクラウド（インターネット上の保管場所）に預けています。自動で上がっていき、スマホが壊れても残る。すばらしい仕組みで、これも正しい進化です。とくに、しぐさや散歩の様子を高画質な動画で撮るようになった今、無料の保存枠はあっという間に一杯になり、毎月いくらかの容量追加（サブスクの課金）を払っている方も多いはずです。
          </p>
          <p>
            ただ、クラウドにすべてを預けることには、ひとつだけ覚えておきたい性質があります。クラウドは「あなたのアカウントが使える」という前提の上に成り立っている、という点です。容量が一杯になって古い写真の同期が止まっていた、機種変更のときに設定がうまく引き継げていなかった、といった小さなつまずきは、誰にでも起こります。
          </p>
          <DotList
            items={[
              <>
                <strong>クラウドに加えて、年に1回、手元にもコピーを取る。</strong>{' '}
                1年分の写真と動画を、外付けのディスクにまるごとコピーしておくだけです。動画は1本でも容量が大きいので、持ち運びやすく転送も速い「ポータブルSSD（データを保存する小さな箱）」が今の定番です。誕生日や、家に来た記念日など、日を決めてしまうと忘れません。
              </>,
              <>
                <strong>「クラウドにあるから大丈夫」を、一度だけ疑ってみる。</strong>{' '}
                いちばん怖いのは、消えていることに何年も気づかないことです。年1回のコピーは、そのまま「ちゃんと同期できているか」の点検にもなります。
              </>,
              <>
                <strong>性質の違う2か所に分けて持つ。</strong>{' '}
                クラウドと手元のディスク。どちらか片方に何かあっても、もう片方が残ります。
              </>,
            ]}
          />
        </Section>

        <Section id="kami" title="習慣③：年に1冊だけ、紙に戻す">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/column/pet-omoide-5shukan-photobook.webp"
              alt="家族がペットのフォトブックを開いて眺める様子"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>
            3つ目は、少し逆向きの習慣です。デジタルに溜まった思い出を、年に1冊だけ、あえて紙に戻します。
          </p>
          <p>
            何百枚もある写真を、全部プリントする必要はありません。むしろ、その年のベストを選ぶことに意味があります。
          </p>
          <DotList
            items={[
              <>
                <strong>1年に1冊、フォトブックを作る。</strong>{' '}
                スマホのアプリから数十枚を選ぶだけで、製本された1冊が届くサービスがいくつもあります。その年を代表する一枚一枚を選ぶ時間そのものが、家族でその子の1年を振り返るひとときになります。
              </>,
              <>
                <strong>紙は、鍵がいらない。</strong>{' '}
                これがフォトブックの最大の強みです。データは開くのに端末とパスワードが要りますが、本棚に並んだ1冊は、誰でも、いつでも、何年後でも、ただ開けば見られます。停電でも、機種変更でも、アカウントのことを知らない人でも。
              </>,
              <>
                <strong>完璧を目指さない。</strong>{' '}
                「今年のベスト30枚」で十分です。毎年続けることのほうが、1冊の出来栄えよりずっと大切です。
              </>,
            ]}
          />
          <p>
            リビングの本棚に、その子の1冊が毎年1冊ずつ増えていく。クラウドに数千枚、本棚に毎年1冊。このデジタルとアナログの二段構えが、思い出をいちばん強くします。
          </p>
        </Section>

        <Section id="koe" title="習慣④：写真だけでなく、「鳴き声・しぐさ」を残す">
          <p>
            4つ目は、撮るものを少し広げる習慣です。写真は表情を残しますが、声と動きは残しません。そして、うちの子の声や歩き方ほど、あとから「録っておけばよかった」と思うものはありません。
          </p>
          <DotList
            items={[
              <>
                <strong>月に何本か、短い動画を撮る。</strong>{' '}
                数十秒で十分です。名前を呼んだときの反応、ごはんを待つ声、寝言、トコトコ歩く後ろ姿。10年後のあなたにとって、これは静止画とは別の宝物になります。
              </>,
              <>
                <strong>鳴き声だけのメモも残す。</strong>{' '}
                スマホのボイスメモアプリで、いつもの鳴き声をひとつ。動画より気軽で、容量も小さく、続けやすい習慣です。
              </>,
              <>
                <strong>一緒にいる「普通の日」を撮る。</strong>{' '}
                特別なイベントだけでなく、なんでもない昼寝やじゃれ合いこそ、あとで何度も見返したくなります。
              </>,
            ]}
          />
          <p>
            写真が「どんな顔だったか」を残すなら、声と動画は「どんなふうに生きていたか」を残します。この2つがそろって、思い出は立体になります。
          </p>
          <p>
            ①から④まで、写真をたくさん残し、二重に保管し、紙にも声にも残す方法を見てきました。どれも、思い出を「増やし、守る」ための習慣です。ところが、デジタルの思い出には、紙のアルバムにはなかった、ある決定的な性質があります。冒頭で触れた「小さな段差」の正体は、これです。
          </p>
        </Section>

        <Section id="core" title="デジタル写真は劣化しない。その代わり——">
          <p>ここで、この記事の核心を一文で言います。</p>
          <p>
            <strong>
              デジタル写真は劣化しない。その代わり、「全部いっぺんに消える」という性質を持っています。
            </strong>
          </p>
          <p>
            紙のアルバムを思い出してください。失われるとしたら、1冊ずつ、1枚ずつです。色は少しずつあせ、ページは少しずつ傷む。だからこそ、すべてを一度に失うことは、めったに起きませんでした。
          </p>
          <p>
            デジタルは正反対です。何百枚、何千枚の写真が、たった1つの「鍵」——あなたのアカウントとパスワード——の内側に、まとめて束ねられています。1枚も劣化しないかわりに、その鍵が開かなくなった瞬間、一緒に過ごした年月が、まとめて、一度に、見られなくなる。これがデジタルの思い出の構造です。
          </p>
          <p>
            そして、その鍵を持っているのは、世界であなた一人です。顔認証も、指紋も、パスコードも、あなたの写真を守るために強力に働きます。それ自体は、とても良いことです。ただ、その強力な守りは、いざというとき、あなた以外の家族の前に立つ壁にもなります。
          </p>
          <p>
            少し心配な言い方をしてしまいましたが、結論は前向きです。これは、習慣をもうひとつ足すだけで、きれいに解ける段差です。いちばんたくさん撮っている私たちが、そのまま、いちばん「ちゃんと残せた」飼い主になれる。そのための5つ目を、最後に紹介します。
          </p>
        </Section>

        <Section id="official" title="では、アカウントの引き継ぎは、どう備えるのか">
          <p>
            5つ目に入る前に、詳しい方がきっと頭に浮かべている疑問に、先に答えておきます。「アカウントの引き継ぎなら、AppleやGoogleに公式の仕組みがあるはずでは？」——その通りです。そして、知っておく価値があります。
          </p>
          <p>
            まず大前提として、AppleもGoogleも、規約上、本人以外がアカウントにアクセスすることは原則として認めていません。家族であっても、勝手にログインすることはできない建て付けです。これはプライバシーを守るための、正しい設計です。
          </p>
          <p>そのうえで、両社は「もしものとき」のための公式機能を用意しています。</p>
          <DotList
            items={[
              <>
                <strong>Appleの「故人アカウント管理連絡先」。</strong>{' '}
                信頼できる人を生前に登録しておくと、本人が亡くなったあと、その人がアクセスキーと死亡を証明する書類をAppleに提出し、承認されれば、写真などのデータを受け取れます（iOS 15.2以降などで設定可能）。
              </>,
              <>
                <strong>Googleの「アカウント無効化管理ツール」。</strong>{' '}
                一定期間（3・6・12・18か月から選択）アカウントが使われないと、あらかじめ指定した最大10人へ通知し、データを共有するか削除するかを自動で実行します。
              </>,
            ]}
          />
          <p>
            どちらも、よくできた仕組みです。使えるなら、ぜひ設定しておくべきです。ただ、共通する条件と限界が2つあります。ひとつは、
            <strong>いずれも「本人が、元気なうちに、自分で設定しておく」ことが絶対の前提</strong>
            だということ。設定していなければ、機能は存在しないのと同じです。もうひとつは、これらが守ってくれるのは
            <strong>それぞれのサービスの中だけ</strong>
            だということ。うちの子の写真がiCloudにも、Googleフォトにも、ペット用の共有アプリにもあれば、それらは別々に備える必要があります。
          </p>
          <p>
            公式機能は、思い出を守る大事な一歩です。その一歩を、もう少しまとめて、シンプルにする。それが5つ目の習慣です。
          </p>
        </Section>

        <Section id="kagi" title="習慣⑤：鍵を引き継げるようにしておく">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/column/pet-omoide-5shukan-chizu.webp"
              alt="スマートフォンとノートを並べ、ペットの写真や記録の在りかを整理する穏やかな机の上"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>5つ目は、写真そのものではなく、「写真の鍵」を残す習慣です。</p>
          <p>
            やることは、難しくありません。「うちの子の写真は、どのサービスに、どのアカウントで入っているか」。そして「もしものとき、誰がそれを開けられるようにしておくか」。この2つを、家族の誰かと共有できる状態にしておくだけです。
          </p>
          <DotList
            items={[
              <>
                <strong>思い出のありかを一覧にする。</strong>{' '}
                写真はiCloudと共有アプリ、動画はGoogleフォト、フォトブックは本棚——という一覧を1枚作っておきます。パスワードそのものを紙に書き散らす必要はありません。「どこにあるか」が分かることが、半分以上の備えになります。
              </>,
              <>
                <strong>AppleとGoogleの公式機能を設定する。</strong>{' '}
                前の章で紹介した2つを、この機会に設定しておきましょう。15分ほどで終わります。
              </>,
              <>
                <strong>複数のサービスにまたがる「鍵」は、まとめて備える。</strong>{' '}
                サービスごとにバラバラの引き継ぎ設定をするのは、正直、続きません。元気な今のうちに、まとめて一か所で備えておくほうが、ずっと現実的です。
              </>,
            ]}
          />
          <p>
            ついでに、思い出と同じくらい大切なものを、もうひとつ。動物病院の診察券や、これまでの病歴・飲んでいた薬の記録です。これらもスマホで撮って同じ場所にまとめておくと、急にお世話を誰かにお願いするときや、新しい病院にかかるとき、すぐに引き継げて安心です。写真とあわせて「もしものときのひとまとめ」にしておくと、いざというときに探さずに済みます。
          </p>
          <p>
            こうした写真の在りかを、ふだんは誰にも見せずに整理しておき、もしものときにだけ、選んだ家族へ届くようにしておく専用のサービスもあります。私たちが運営する
            <strong>「つぎの手ナビ デジタル資産」</strong>
            もそのひとつで、登録・一覧のPDF出力・見直しの定期リマインドまでは無料で使えます。
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

        <Section id="matome" title="まとめ——撮るのと同じくらい、残すのも習慣に">
          <p>最後に、5つをまとめます。</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[15px] leading-7">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">習慣</th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">やること</th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    かかる時間
                  </th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row) => (
                  <tr key={row.habit}>
                    <td className="border border-slate-200 px-4 py-3 align-top font-medium text-slate-900">
                      {row.habit}
                    </td>
                    <td className="border border-slate-200 px-4 py-3 align-top">{row.todo}</td>
                    <td className="border border-slate-200 px-4 py-3 align-top">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            ①から④は、思い出を「増やし、守る」習慣。⑤は、それを「ちゃんと渡せる」状態にする習慣です。多くの家庭が①〜④のどれかはすでに始めていますが、⑤に手をつけている人は、まだほとんどいません。いちばん大事で、いちばん忘れられている1つです。
          </p>
          <p>
            私たちは、歴史でいちばんたくさん、うちの子を撮っている飼い主です。あとは、その山のような思い出に、鍵の引き継ぎという習慣をひとつ足すだけ。そうすれば、何年経っても、あの寝顔も、あの鳴き声も、あの歩き方も、まるごと手元に残り続けます。
          </p>
          <p>
            撮った写真は、残してこそ一生ものになります。一覧を1枚足した日から、もう心配しなくて大丈夫です。
          </p>
        </Section>

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            うちの子の思い出の「鍵」を、もしものときだけ届く形で残すなら
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、写真や契約の在りかを、生きている間は誰にも見せず、もしものときだけ選んだ人へ届ける準備ができるサービスです。登録・PDF出力・定期リマインドは無料で使えます。
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
              <p className="text-xs font-medium text-slate-500">子どもの写真でも同じ話です</p>
              <Link
                href="/guide/column/kodomo-omoide-5shukan"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                子どもの思い出を一生ものにする5つの習慣 &rsaquo;
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
            <li>
              <p className="text-xs font-medium text-slate-500">スマホの写真そのものを整理したい方</p>
              <Link
                href="/guide/digital-seiri/sumaho-shashin-seiri"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                スマホの写真整理のやり方 &rsaquo;
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
