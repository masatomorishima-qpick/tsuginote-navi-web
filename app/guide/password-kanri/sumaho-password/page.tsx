import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/password-kanri/sumaho-password';
const PAGE_TITLE =
  'パスワードをメモ帳で管理するのは危険？スマホでも忘れず安全に管理する方法';
const PAGE_DESCRIPTION =
  'パスワードをメモ帳に書くのは危険？という疑問に答え、忘れっぽい人でも安全に管理できる方法を解説。危険な保管法の見分け方、パスワード管理アプリの始め方、二段階認証・パスキーまで、難しい知識なしで今日から実践できます。';

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
        url: `${SITE_URL}/images/guide/password-kanri/sumaho-password-main.webp`,
        width: 1600,
        height: 900,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [`${SITE_URL}/images/guide/password-kanri/sumaho-password-main.webp`],
  },
};

const toc = [
  { id: 'check', label: 'まず確認｜「危険な保管法」になっていないか' },
  { id: 'why', label: 'なぜメモ帳保管が危ないのか' },
  { id: 'solution', label: '解決策｜忘れっぽい人こそ管理アプリ' },
  { id: 'start', label: '始め方｜今あるもので、今日から' },
  { id: 'make', label: 'アプリを使わない人向け｜覚えやすく強い作り方' },
  { id: 'extra', label: 'もう一段の安全｜二段階認証とパスキー' },
  { id: 'tips', label: '忘れっぽい人向け｜つまずきと対策' },
  { id: 'blindspot', label: 'ここまでの整理と、最後の盲点' },
  { id: 'finish', label: '仕上げ｜「鍵の在りか」を残す' },
  { id: 'locked', label: 'いまパスワードが分からず開けないときは（応急処置）' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ' },
];

const faqs = [
  {
    q: 'スマホのメモアプリ自体に「ロック（鍵）」をかければ安全ですか？',
    a: 'のぞき見対策としては、ロックなしのメモより安全です。ただし、ログイン画面でパスワードを自動入力できないため毎回コピー＆ペーストの手間がかかり、スマホの故障時やアカウントのパスワード自体を忘れたときに取り出しにくい、という弱点が残ります。利便性と安全性の両面から、やはり標準のパスワード管理機能を使うのがおすすめです。',
  },
  {
    q: 'パスワードを紙に書いて管理するのは、結局アリですか？',
    a: '「使い回さず、サービスごとに違うパスワードにする」なら、スマホのメモ帳と違ってネットにつながらない紙のノートに書いて自宅の安全な場所に保管するのも一つの方法です。さらに「IDとパスワードを同じノートに書かない」「末尾の2文字はあえて書かず自分の頭の中のルールにしておく」といった工夫をすれば、万一ノートを落としたときの危険性を大きく減らせます。ただし数が増えると管理が大変なので、多くの人にはパスワード管理アプリのほうが現実的です。',
  },
  {
    q: 'パスワード管理アプリは、逆に危なくないですか？（1か所にまとめる不安）',
    a: '中身は暗号化され、マスターパスワードでしか開けません。使い回しや平文メモのほうが、はるかにリスクは高いです。マスターパスワードを強くし、二段階認証をかければ、まとめて管理するほうが安全です。',
  },
  {
    q: 'ブラウザに保存されたパスワードは、消したほうがいいですか？',
    a: 'スマホやパソコン本体にロック（パスコード・指紋・顔認証）をかけていれば、ブラウザ／OSの保存機能は実用的で安全です。逆に、本体にロックがない状態での保存は避けてください。',
  },
  {
    q: '全部のパスワードを今すぐ変えないとダメですか？',
    a: 'いいえ。まず「使い回している重要なアカウント（メール・銀行・決済）」だけ先に変えれば、リスクは大きく下がります。残りはログインのたびに少しずつで大丈夫です。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      image: `${SITE_URL}/images/guide/password-kanri/sumaho-password-main.webp`,
      mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`,
      datePublished: '2026-06-05',
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
          name: 'パスワード・認証管理',
          item: `${SITE_URL}/guide/password-kanri`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'スマホのパスワード管理',
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

export default function SumahoPasswordPage() {
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
              <Link href="/guide/password-kanri" className="text-blue-600 hover:underline">
                パスワード・認証管理
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">スマホのパスワード管理</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ち情報｜パスワード・認証管理
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          パスワードをメモ帳で管理するのは危険？
          <span className="mt-2 block text-xl font-medium leading-snug text-slate-600 sm:text-2xl">
            スマホでも忘れず安全に管理する方法
          </span>
        </h1>

        <p className="mt-7 text-base leading-8 text-slate-700">
          「パスワードをスマホのメモ帳に書いておくのは危ない」——よく聞きます。でも、サービスごとに違うパスワードなんて覚えられないし、忘れるたびにリセットするのも面倒。結局メモに頼ってしまう、という人は多いはずです。
          安心してください。「全部覚える」のは、そもそも無理です。記憶力の問題ではありません。
          <strong>正しいのは「覚えない仕組みを作る」こと。</strong>{' '}
          忘れっぽい人ほど、この記事の方法が向いています。
          ここでは、なぜ危険な保管法がダメなのかを手短に確認したうえで、忘れっぽくても安全に管理できる現実的なやり方を、順番に解説します。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/password-kanri/sumaho-password-main.webp"
            alt="リビングのソファでスマホを指紋認証や顔認証で解除し、パスワードを安全に管理する人"
            width={1600}
            height={900}
            priority
            className="h-auto w-full"
          />
        </div>

        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-slate-700">
          ※ いま画面ロックやログインが解除できず困っている方は、先に
          <a href="#locked" className="font-medium text-blue-600 hover:underline">
            「開けないときの応急処置」
          </a>
          をご覧ください。
        </p>

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

        <Section id="check" title="まず確認｜「危険な保管法」になっていないか">
          <p>
            次のどれかに当てはまったら、改善の余地があります。脅すためではなく、リスクの大きさを知っておくためのチェックです。
          </p>
          <div className="rounded-2xl bg-rose-50 p-6">
            <CrossList
              items={[
                'メモ帳・LINEの「自分だけのトーク」に、そのまま書いている：スマホを覗かれたり、紛失・修理に出したりしたとき、そのまま全部見られます',
                '同じパスワードを複数のサービスで使い回している：いちばん危険です。どこか1か所が漏れると、同じID・パスワードで他のサービスにも次々ログインされます（リスト型攻撃）',
                '「名前＋誕生日」「123456」など、推測しやすいものにしている：総当たりや推測であっさり破られます',
                'ブラウザに保存しっぱなしで、スマホ自体にロックをかけていない：スマホが開けば、保存パスワードも全部開きます',
              ]}
            />
          </div>
          <p>
            1つでも当てはまるなら、直す価値は十分にあります。逆に、これから紹介する方法に切り替えれば、上のリスクはまとめて消えます。
          </p>
        </Section>

        <Section id="why" title="なぜメモ帳保管が危ないのか（手短に）">
          <p>
            メモ帳が危ないのは、「暗号化されていないから」です。パスワード管理アプリは、保存した内容を端末の中で暗号化し、マスターパスワードでしか開けないようにします。一方、ふつうのメモ帳は中身がそのまま文字で残るので、スマホにアクセスできる人なら誰でも読めてしまいます。
          </p>
          <p>
            さらに見落としがちなのが「クラウドとの同期」です。スマホのメモ帳は自動でネット上（iCloudなど）にバックアップされるものが多く、万一そのアカウントが乗っ取られると、スマホが手元にあっても、メモに書いたパスワードがまとめて盗まれるおそれがあります。
          </p>
          <p>
            つまり問題は「書いて残すこと」ではなく、「暗号化せずに残すこと」。書いて管理すること自体は、むしろ必要です。要は、
            <strong>安全な金庫に入れるか、机に置きっぱなしにするか</strong>の違いです。
          </p>
          <p>
            なお、エクセルやスプレッドシートでの管理が気になる方は、
            <Link
              href="/guide/kazoku-kyoyu/joho-kyoyu-hikaku"
              className="text-blue-600 hover:underline"
            >
              パスワード・情報管理の方法の比較（エクセル管理は危険？）
            </Link>
            もあわせてご覧ください。
          </p>
        </Section>

        <Section id="solution" title="解決策｜忘れっぽい人こそ「パスワード管理アプリ」">
          <p>
            結論はシンプルです。
            <strong>パスワード管理アプリを使い、覚えるのはマスターパスワード1つだけにする。</strong>{' '}
            これで「全部覚える」必要がなくなり、サービスごとに違う強固なパスワードを使えるようになります。
          </p>
          <p>パスワード管理アプリができること：</p>
          <DotList
            items={[
              'サービスごとに自動で強いパスワードを作って、暗号化して保管する',
              'ログイン時に自動で入力してくれる（だから覚えなくていい）',
              'スマホでもパソコンでも同じパスワードを使える',
            ]}
          />
          <p>
            「アプリを入れるのが難しそう」と感じるかもしれませんが、実は多くの人が、すでに持っている機能で始められます。
          </p>
        </Section>

        <Section id="start" title="始め方｜今あるもので、今日から">
          <p>
            <strong>iPhoneの人</strong>
            ：標準の「パスワード」アプリ（設定→パスワード、またはiOSの「パスワード」App）がそのままパスワード管理アプリです。新しくログインや会員登録をするとき「強力なパスワードを使用」を選べば、自動で作って保存してくれます。
          </p>
          <p>
            <strong>Androidの人</strong>
            ：「Googleパスワードマネージャー」がChromeやAndroidに組み込まれています。Googleアカウントの設定から確認・管理できます。
          </p>
          <p>
            <strong>より高機能にしたい人</strong>
            ：専用のパスワード管理アプリ（1Password、Bitwardenなど）もあります。家族との共有や、複数の端末・ブラウザをまたいで使いたい場合に便利です。まずは標準機能から始めて、物足りなくなったら検討すれば十分です。
          </p>
          <p>
            どれを選んでも、やることは同じ。
            <strong>
              新しいパスワードはアプリに作らせる。古い使い回しパスワードは、ログインのついでに少しずつ作り直していく。
            </strong>{' '}
            一度に全部やる必要はありません。
          </p>
        </Section>

        <Section id="make" title="アプリを使わない人向け｜覚えやすく強いパスワードの作り方">
          <p>
            「管理アプリはまだ抵抗がある」という人も、作り方を変えるだけで安全性は大きく上がります。コツは、短く複雑にするのではなく、
            <strong>長くて覚えやすい</strong>こと。長さこそが強さです。
          </p>
          <p>
            <strong>① 無関係な単語を3〜4個つなぐ（パスフレーズ）</strong>
            <br />
            たとえば「みかん・電車・青い・水曜」のように、自分だけが思い出せて、他人には推測できない単語を並べます。意味のある文章や、名前・誕生日は避けてください。長いほど破られにくく、それでいて覚えやすいのが利点です。
          </p>
          <p>
            <strong>② サービスごとに「一部だけ」変える</strong>
            <br />
            土台のパスフレーズは同じでも、サービスごとに頭か末尾を少し変えれば、使い回しを避けられます。ルールは自分の頭の中だけに置き、スマホのメモ帳には書かないのが安全です。
          </p>
          <p>
            この方法でも、数が増えると管理は大変になります。負担を感じ始めたら、無理せずパスワード管理アプリへ移行するのが結局ラクです。
          </p>
        </Section>

        <Section id="extra" title="もう一段の安全｜二段階認証とパスキー">
          <p>
            パスワードに加えて、重要なアカウント（メール・銀行・決済・SNS）には二段階認証を設定しておくと安心です。二段階認証は、パスワードが万一漏れても、スマホに届くコードや認証アプリがないとログインできない仕組み。設定はサービスの「セキュリティ設定」から数分でできます。
          </p>
          <p>
            最近は「パスキー」という、パスワードそのものを使わない仕組みも広がっています。指紋や顔認証でログインでき、フィッシング（偽サイト）にも強いのが特長です。対応しているサービスでは、パスキーに切り替えるとさらに安全で、しかもラクになります。
          </p>
        </Section>

        <Section id="tips" title="忘れっぽい人向け｜よくあるつまずきと対策">
          <DotList
            items={[
              'マスターパスワードまで忘れそう：マスターパスワードは1つだけ。紙に書いて、自宅の安全な場所（通帳と同じような場所）に保管しておけば十分です。これだけはアナログ保管が現実的です',
              '機種変更でログインできなくなりそう：管理アプリの中身はクラウド（iCloud／Googleアカウント）と同期されるので、新しい端末でも同じアカウントでログインすれば引き継げます',
              '指紋・顔認証を使えば、マスターパスワードを毎回打たなくていい：日常はFace IDや指紋で開けて、マスターパスワードは「いざというとき用」に控えておくのが快適です',
            ]}
          />
        </Section>

        <Section id="blindspot" title="ここまでの整理と、最後の盲点">
          <p>
            ここまでで、あなたのパスワードは「使い回しをやめ、暗号化して保管し、重要なものは二段階認証で守る」状態になりました。忘れっぽくても、もう毎回リセットする必要はありません。
          </p>
          <p>
            でも、この「安全な状態」には、パスワードならではの盲点が一つあります。
          </p>
          <p>
            <strong>
              安全にすればするほど、それを開けられるのは、あなた一人だけになる。
            </strong>
          </p>
          <p>
            パスワード管理アプリのマスターパスワード、各サービスの強固なパスワード、二段階認証のスマホ——これらは「本人以外に開けない」ように設計されています。それがセキュリティの本質です。でも裏を返せば、もしあなたが急に入院したら、事故や病気でスマホを触れなくなったら、家族はネット銀行にもサブスクにも、何ひとつたどり着けません。実際、大切な方を亡くした人がデジタル関連で最も困ったのは「スマホ・パソコンのパスワードが分からない」ことでした（2026年 BlueAdventures調べ）。
          </p>
          <p>
            しかも、すべての入り口を守っているマスターパスワードは、いちばん教えたくない情報でもあります。生きている間に家族へ渡すのは、現実的ではありません。
          </p>
        </Section>

        <Section id="finish" title="仕上げ｜「鍵そのもの」ではなく「鍵の在りか」を残す">
          <p>
            解決の方向はシンプルです。
            <strong>
              マスターパスワードそのものを今すぐ家族に教える必要はありません。「どこに、何の備えがあるか」という在りかだけを、中身は伏せたまま、もしものときだけ信頼できる人に届く形にしておく。
            </strong>
          </p>
          <p>
            パスワードを安全に管理することと、もしものときに家族が困らないようにすることは、両立できます。むしろ、きちんと管理している人ほど、この最後の一手で「自分にしか開けない状態」を「いざというとき家族に届く状態」へ変えておく価値があります。
          </p>
          <p>
            今日、パスワードを安全にしたなら、その勢いで「在りかを残す」ところまで。それだけで、毎日の安全が、家族のための安心にまで延びます。
          </p>
        </Section>

        <Section id="locked" title="いまパスワードが分からず開けないときは（応急処置）">
          <p>
            <strong>今まさにロックが解除できなくて困っている</strong>
            ——そんなときは、落ち着いて、次の順で試してください。
          </p>
          <div className="rounded-2xl bg-amber-50 p-6">
            <DotList
              items={[
                'スマホ本体のパスコードを忘れた：何度か間違えてロックがかかっても、Apple ID（iPhone）やGoogleアカウント（Android）でサインインできれば復旧できる場合があります。慌てて連続入力せず、画面の案内に沿って進めます',
                'アプリやサービスのパスワードを忘れた：ログイン画面の「パスワードをお忘れですか？」から、登録メールアドレスやSMSで再設定できます。多くの場合これで解決します',
                '登録メールアドレスも分からない：iPhoneの「設定→パスワード」、Android／Chromeの「Googleパスワードマネージャー」に、過去に保存したログイン情報が残っていないか確認します',
                'どうしても開けず初期化を考える前に：初期化すると中のデータは消えます。クラウド（iCloud／Googleアカウント）にバックアップがあるか、先に必ず確認してください',
              ]}
            />
          </div>
          <p>
            落ち着いて対処できたら、同じことを繰り返さないために、上で紹介した「覚えない仕組み」を整えておきましょう。
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

        <Section id="summary" title="まとめ｜覚えない仕組みを作り、在りかを残す">
          <p>
            パスワードは「全部覚える」のではなく、「覚えない仕組み」を作るのが正解です。使い回しをやめ、パスワード管理アプリで暗号化して保管し、覚えるのはマスターパスワード1つ。重要なアカウントは二段階認証やパスキーで守る。忘れっぽい人ほど、この仕組みがラクで安全です。
          </p>
          <p>
            そして最後に、すべての鍵を握るマスターパスワードと管理の「在りか」を、中身は伏せたまま、もしものときだけ信頼できる人に届く形で残しておく。ここまでやって、パスワード管理は本当に完成します。
          </p>
          <p>
            スマホ全体を片付けたい方は
            <Link
              href="/guide/digital-seiri/digital-dansyari"
              className="text-blue-600 hover:underline"
            >
              デジタル断捨離のやり方
            </Link>
            、増えすぎた会員登録を減らしたい方は
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
            すべての鍵を握る「在りか」を、もしものときに届く形で残すには
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、パスワードを端末内で暗号化して保管し、その「在りか」を、もしものときだけ大切な人へ引き継ぐ準備ができるサービスです。資産の登録・PDF出力・定期リマインドは無料で使えます。
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
                家族とのパスワード共有の線引きに迷っている方
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
                写真・アプリ・サブスクも含めて丸ごと片付けたい方
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
                使い回しの温床になる会員登録を減らしたい方
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
