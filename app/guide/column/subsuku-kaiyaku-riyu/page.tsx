import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/column/subsuku-kaiyaku-riyu';
const PAGE_IMAGE = `${SITE_URL}/images/guide/column/subsuku-kaiyaku-riyu-main.webp`;
const PAGE_TITLE = 'サブスクは全部、死ぬまでに解約しておかなければならない3つの理由';
const PAGE_DESCRIPTION =
  '契約した本人にしか止められない——サブスク（定額制サービス）という仕組みの、ほとんどの人が知らない性質とは。国民生活センターの実例と公的な数字から「デジタル終活」の盲点を解き、解約よりずっと軽い15分の備え方までを解説します。';

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
  { id: 'life', label: '私たちの生活は、もうサブスクでできている' },
  { id: 'reason1', label: '理由1：サブスクには「終わりの日」が存在しない' },
  { id: 'reason2', label: '理由2：「やめます」と言えるのは、あなた一人だけ' },
  { id: 'reason3', label: '理由3：家族は「何を止めればいいか」が分からない' },
  { id: 'beyond', label: '困るのは、サブスクだけではない' },
  { id: 'postpone', label: 'なぜ、私たちは備えを後回しにしてしまうのか' },
  { id: 'answer', label: 'では、本当に全部解約すべきなのか' },
  { id: 'faq', label: 'よくある5つの疑問' },
  { id: 'keep', label: '一覧は「作って終わり」にしないことが大切' },
];

const faqs = [
  {
    q: '家族に知られたくない契約もあるんだけど。',
    a: '一覧は「もしものとき、家族が困らないために必要なもの」だけで構いません。すべてを書く義務はありませんし、生きている間に家族へ見せるかどうかも、あなたが決めることです。大切なのは、家族が困る二大要素——「お金が流れ続ける契約」と「資産のある場所」——の一覧を残すこと。そこさえ押さえれば、目的は果たせます。',
  },
  {
    q: 'パスワード管理アプリ（1Passwordなど）を使っているから大丈夫では？',
    a: 'パスワード管理アプリは、生きている間のあなたを守る道具としてはとても優秀です。ただし、それは「あなたが使う」前提の設計です。家族がそのアプリの存在と、開けるためのマスターパスワードを知らなければ、金庫ごと開かなくなります。かといってマスターパスワードを家族に教えれば、生きている今、すべての中身が見えてしまう。「ふだんは見せたくない。でも、もしものときには届いてほしい」という、ちょうどいい中間が作りにくいのです。',
  },
  {
    q: '夫婦でお互いのスマホのパスワードを教え合っているから、うちは大丈夫では？',
    a: 'それは素晴らしい第一歩です。ただ、2つだけ確認してください。ひとつは、スマホのパスコードを知っていても、その先の各サービスのIDとパスワード、そして「何を契約しているか」までは分からないこと。スマホが開いても、夫のサブスクが何個あるかは、結局メールと明細を掘ることになります。もうひとつは、口頭の共有は時間とともに古くなることです。パスワードを変えたとき、新しい契約を結んだとき、そのつど伝え直しているでしょうか。「教え合ったのは5年前」というご夫婦は少なくありません。共有という発想は正しいので、あとは「全体の一覧」と「更新の仕組み」を足せば完成します。',
  },
  {
    q: 'まだ30代・40代なんだけど、さすがに早くない？',
    a: '順番が逆かもしれません。サブスク・ネット銀行・キャッシュレス決済・クラウドと、デジタルの契約の数は、若い世代ほど多いのが普通です。つまり「もしも」が起きたとき、家族が向き合うデジタル遺品の量は、高齢の方より現役世代のほうがむしろ多い。一方で、備えにかかる時間は15分です。「早すぎる備え」で失うものは何もありませんが、「間に合わなかった備え」で失うものは、この記事に書いてきた通りです。それに、これは何十年も先のための作業ではありません。一覧を作った15分後から、今月の固定費の見直しという形で、自分の役に立ち始めます。',
  },
  {
    q: '紙のエンディングノートじゃだめ？',
    a: 'ないより、ずっと良いです。ただし弱点が2つあります。サブスクや口座は増えたり減ったりするので、書いた内容がすぐ古くなること。そして、家族がそのノートの存在と置き場所を知らなければ、結局見つけてもらえないことです。書いて満足して引き出しの奥で眠る——エンディングノートの一番多い結末がこれです。',
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
          name: 'コラム',
          item: `${SITE_URL}/guide/column`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'サブスクは全部、死ぬまでに解約しておかなければならない3つの理由',
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

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="space-y-4 rounded-r-2xl border-l-4 border-slate-300 bg-slate-50 px-6 py-5 text-[15px] leading-8 text-slate-700">
      {children}
    </blockquote>
  );
}

const listRows = [
  { name: 'Netflix', price: '約1,600円', pay: '楽天カード', memo: '家族も観ている。残す' },
  {
    name: 'クラウドストレージ',
    price: '年払い 約13,000円',
    pay: '三井住友カード',
    memo: '写真が全部ここにある',
  },
  { name: '英語学習アプリ', price: '約2,000円', pay: 'キャリア決済', memo: '最近使ってない……' },
];

const sources = [
  '国民生活センター「今から考えておきたい『デジタル終活』——スマホの中の“見えない契約”で遺された家族が困らないために」（2024年11月20日）',
  '国民生活センター 見守り新鮮情報 第505号「始めましょう！デジタル終活」（2025年2月20日）',
  '総務省「令和6年 通信利用動向調査」（スマートフォン保有世帯90.5%）',
  '厚生労働省「令和6年（2024）人口動態統計月報年計（概数）の概況」（年間死亡数 約160万人）',
  '弁護士JPニュース「相続発生『動画サブスクの契約を解除したいが…』故人の『デジタル遺品』どのように“整理”する？」（2025年1月）',
  'ナイル株式会社（Appliv）「サブスク利用実態調査」（2024年3月）',
  '株式会社プラネット「サブスクリプションに関する意識調査」（Fromプラネット第161号、調査実施2021年6月・n=4,000）',
  '2026年 BlueAdventures調べ（デジタル遺品に関する自社調査）',
];

export default function SubsukuKaiyakuRiyuPage() {
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
            <li className="text-slate-700">サブスクは全部、死ぬまでに解約しておかなければならない3つの理由</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          コラム｜デジタル資産との付き合い方
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          サブスクは全部、死ぬまでに解約しておかなければならない3つの理由
        </h1>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/column/subsuku-kaiyaku-riyu-main.webp"
            alt="リビングのソファでくつろぎながら、スマホで動画配信サービスを楽しんでいる様子"
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

        <Section id="life" title="私たちの生活は、もうサブスクでできている">
          <p>
            朝、Spotifyで音楽を聴きながら出勤する。昼休みにKindle
            Unlimitedで本を読み、夜は家族とNetflixやAmazonプライム・ビデオを観る。撮りためた子どもの写真は、iCloudやGoogleフォトが自動で預かってくれる。仕事ではMicrosoft
            365やChatGPT、それにウイルス対策ソフトも月額や年額で払っている、という方も多いはずです。
          </p>
          <p>
            ひとつひとつは月に数百円から千円ほど。動画も音楽も本も、いまや「買う」より「借りる」ほうが安くて賢い。サブスク（定額制サービス）は、私たちの生活の土台になっています。総務省の調査では、スマートフォンを持つ世帯はすでに9割を超えました。スマホが当たり前になった社会では、サブスクが当たり前になるのも自然な流れです。
          </p>
          <p>
            これ自体は、とても良いことだと思います。私もサブスクに助けられている一人です。先に言っておくと、この記事は「サブスクをやめましょう」という話ではありません。
          </p>
          <p>
            ただ、このサブスクという仕組みには、ほとんどの人が知らない性質がひとつあります。そしてその性質のせいで、「サブスクは全部、死ぬまでに解約しておかなければならない」とまで言える状況が、いま実際に起きています。国の消費生活機関である国民生活センターが、わざわざ報道発表をして注意を呼びかけるほどの状況です。
          </p>
          <p>順番にお話しします。</p>
        </Section>

        <Section id="reason1" title="理由1：サブスクには「終わりの日」が存在しない">
          <p>
            買い切りの商品とサブスクの一番の違いは何でしょうか。値段ではありません。
            <strong>「終わり方」</strong>です。
          </p>
          <p>
            本を1冊買えば、支払いはそこで終わります。DVDを買っても、ゲームソフトを買っても同じです。ところがサブスクは、契約者が自分から「やめます」と手続きをしない限り、支払いが永遠に続く設計になっています。サービスを提供する会社の側から「最近使っていないようなので、終わりにしますね」と言ってくることは、基本的にありません。
          </p>
          <p>しかも、この「やめます」が意外と曲者です。多くの人が、次のような勘違いをしています。</p>
          <p>
            <strong>勘違い①「アプリを消せば終わる」。</strong>{' '}
            スマホからアプリを削除しても、契約は生きています。請求も続きます。アプリはただの「入り口」で、契約そのものは別の場所にあるからです。
          </p>
          <p>
            <strong>勘違い②「無料体験だから大丈夫」。</strong>{' '}
            多くのサブスクは、無料体験の期間が終わると自動で有料契約に切り替わります。「お試しのつもりが、いつの間にか払っていた」という相談は、国民生活センターに数多く寄せられている定番のトラブルです。
          </p>
          <p>
            <strong>勘違い③「使わなければ請求されない」。</strong>{' '}
            サブスクは使った量に関係なく定額です。1年間一度も開かなかった動画サービスにも、満額の請求が続きます。
          </p>
          <p>
            つまりサブスクとは、
            <strong>「契約した瞬間から、本人が意思を持って止めない限り、お金が流れ続ける仕組み」</strong>
            なのです。
          </p>
          <p>
            サブスクのもうひとつの特徴は、<strong>金額の感覚が麻痺しやすい</strong>
            ことです。月980円と聞けば「コーヒー2杯分か」と思いますが、年に直せば11,760円。それが3つあれば年35,000円を超えます。月額表示は、私たちの財布の警戒心をくぐり抜けるのがとても上手なのです。
          </p>
          <p>
            ここで質問です。あなたはいま、何のサブスクをいくつ契約していて、月に合計いくら払っていますか。即答できるでしょうか。
          </p>
          <p>
            即答できなくても、恥ずかしいことではありません。少し古い調査ですが、2021年に株式会社プラネットが4,000人に行った意識調査では、「サブスク」という言葉を聞いたことがあっても、その仕組みの内容までよく理解している人は2割程度にとどまりました。サブスクはそれほど「なんとなく」で使われている仕組みなのです。仕組みをよく知らないまま契約だけが増えていけば、自分のお金の流れを正確に答えられなくなるのは自然なことです。
          </p>
          <p>
            実際、把握しようとクレジットカードの明細を開いてみても、サービス名がローマ字や英語の社名で書かれていて、「この『〇〇〇
            Inc.』って何の請求だっけ？」と分からないことすらあります。契約は日本語のアプリで結んだのに、請求は英語の社名で来る。
            <strong>契約しているのは自分なのに、全体像は自分にも見えていない。</strong>{' '}
            これがサブスクの一つ目の性質です。
          </p>
          <p>
            ただ、ここまでは「生きている間」の話です。自分が困るだけなら、いつでも調べ直せます。本当の問題は、ここから先にあります。自分にも見えていないものは——当然、家族にはもっと見えないのです。
          </p>
        </Section>

        <Section id="reason2" title="理由2：「やめます」と言えるのは、世界であなた一人だけ">
          <p>ここからが、この記事でいちばんお伝えしたいことです。</p>
          <p>
            サブスクの解約は、アカウントにログインして、本人が手続きする仕組みになっています。IDとパスワードを知っているのは契約者本人だけ。つまり——
          </p>
          <p>
            <strong>契約者が亡くなっても、サブスクの請求は止まりません。</strong>
          </p>
          <p>
            これは脅し文句ではありません。国民生活センターが2024年11月に公式に発表した事実です。発表のタイトルは『今から考えておきたい「デジタル終活」——スマホの中の“見えない契約”で遺された家族が困らないために』。そこには、はっきりとこう書かれています。
          </p>
          <Quote>
            <p>
              サブスク契約は、契約者本人が亡くなっても、解約手続きを行わない限り請求が続いてしまいます。
            </p>
          </Quote>
          <p>
            請求はどこまで続くのか。理屈の上では、引き落とし先のクレジットカードや口座が止まるまでです。家族が気づかなければ、月日が経ってもお金は静かに流れ続けます。
          </p>
          <p>
            金額の規模も、ばかになりません。仮に動画・音楽・クラウドなどで月に合計3,000円のサブスクを契約していた人がいたとして、それが2年間誰にも気づかれなければ、引き落とされる総額は72,000円。本人なら一度も使っていないサービスに7万円払う人はいませんが、亡くなったあとの契約には「もったいない」と言ってくれる本人がいないのです（金額はあくまで試算です）。
          </p>
          <p>実際に国民生活センターに寄せられた相談を、ひとつ紹介します。</p>
          <Quote>
            <p>
              夫を亡くした80代の女性。夫の携帯電話は解約しました。やるべきことは済ませたつもりでした。ところが後日、夫のクレジットカードの明細に、見覚えのない請求が残っていることに気づきます。カード会社や携帯電話会社に問い合わせてようやく分かったのは、夫が生前に契約していた、スマホのセキュリティサービスのサブスクでした。
            </p>
            <p>
              解約しようと事業者に連絡すると、返ってきた答えはこうでした。
              <strong>
                「すぐに解約するにはIDとパスワードが必要です。それが分からなければ、すぐには解約できません」
              </strong>
            </p>
          </Quote>
          <p>夫はもういません。IDもパスワードも、もう聞くことはできません。</p>
          <p>
            しかもこのケースには、見落とせない皮肉があります。女性は先に夫の携帯電話を解約していました。良かれと思ってやった、正しい手続きです。ところが携帯電話を解約すると、その電話番号は使えなくなり、番号宛てに届くはずの認証用メッセージ（ログイン時の本人確認）も受け取れなくなります。メールアドレスが携帯電話会社のものだった場合は、メールも消えます。つまり、
            <strong>先に片づけた手続きが、あとの手続きの扉を閉めてしまう</strong>
            ことがあるのです。遺された側は、こうした落とし穴の一覧を持たないまま、悲しみの中を手探りで歩くことになります。
          </p>
        </Section>

        <Section id="reason3" title="理由3：家族は「止め方」ではなく「何を止めればいいか」が分からない">
          <p>もうひとつ、より根本的な壁があります。</p>
          <p>
            仮に家族が「サブスクを解約しなければ」と思い立っても、
            <strong>そもそも何を契約していたのかを知る方法が、ほぼない</strong>のです。
          </p>
          <p>
            サブスクには紙の契約書がほとんどありません。手がかりは、契約したときの確認メールと、クレジットカードの明細くらい。ところがそのメールを見るには、スマホやパソコンのロックを開ける必要があります。そしてスマホのパスワードを知っているのは、本人だけ。
          </p>
          <p>
            これも国民生活センターに実際に寄せられた相談です。亡くなったお兄さんの契約を確認しようと、60代の方が携帯電話会社の店舗にスマホのロック解除を頼みました。返ってきた答えは——
          </p>
          <p>
            <strong>「初期化はできますが、画面ロックの解除はできません」</strong>
          </p>
          <p>
            初期化すれば、中のメールも写真も、契約の手がかりも全部消えます。お店が意地悪をしているのではありません。本人になりすました第三者から持ち主を守るための、セキュリティ上の正しい仕組みです。つまり、
            <strong>
              生きている間あなたを守ってくれる鍵が、あなたが亡くなった瞬間、家族の前に立ちはだかる壁に変わる
            </strong>
            のです。
          </p>
          <p>
            私たちBlueAdventuresが2026年に行った調査でも、大切な方を亡くした経験のある人の
            <strong>60.9%</strong>
            が「デジタル関係で困った経験がある」と答え、困りごとの第1位は「スマホ・パソコンのパスワードが分からない」でした。そして約70%の人が、こう答えています。
            <strong>「生前に整理してくれていたら、助かった」</strong>。
          </p>
          <p>
            ここで「AppleやGoogleが何とかしてくれないの？」と思った方は鋭いです。実は、仕組み自体はあります。Appleには「故人アカウント管理連絡先」、Googleには「アカウント無効化管理ツール」という、もしものときに家族がアカウントへアクセスできるようにする公式機能があり、国民生活センターも活用を勧めています。
          </p>
          <p>
            ただし、どちらも
            <strong>本人が生きている間に、自分で設定しておかなければ使えません</strong>
            。亡くなってから家族が申し込むことはできないのです。そして、この機能の存在を知っている人自体が、まだ非常に少ない。結局、すべての道が同じ一点に戻ってきます——
            <strong>備えられるのは、本人が元気な「今」だけ</strong>だということです。
          </p>
        </Section>

        <Section id="beyond" title="困るのは、サブスクだけではない">
          <p>
            ここまでサブスクの話をしてきましたが、実は同じ構造の問題が、スマホの中のあらゆる場所で起きています。国民生活センターに寄せられた相談には、こんなものもあります。
          </p>
          <p>
            <strong>ネット銀行。</strong>{' '}
            亡くなった家族がネット銀行を使っていたようだが、スマホのロックが解除できず、
            <strong>そもそもどの銀行と契約していたのかが分からない</strong>
            という相談。ネット銀行には紙の通帳も郵送物もほとんどないため、家族が口座の存在に気づくきっかけ自体がないのです。親がネット銀行を使っているご家庭の備え方は、
            <Link href="/guide/oya-care/oya-netbank" className="text-blue-600 hover:underline">
              親がネット銀行を使っているなら
            </Link>
            で詳しく解説しています。
          </p>
          <p>
            <strong>QRコード決済。</strong>{' '}
            故人のコード決済サービスの相続手続きを進めているが、
            <strong>1か月以上たっても終わらない</strong>
            という相談。残高は法律上は相続の対象ですが、手続きの方法はサービスごとにバラバラで、時間がかかります。
          </p>
          <p>
            そして、お金よりも取り返しがつかないものもあります。<strong>写真です。</strong>{' '}
            ひと昔前なら、家族の思い出は本棚のアルバムに残っていました。いまは故人のスマホとクラウドの中です。ロックが解除できなければ、何十年分の家族写真が、一枚も取り出せないまま端末の中に眠ることになります。お金は手続きを頑張れば取り戻せることがありますが、写真には代わりがありません。
          </p>
          <p>
            サブスクのように「払い続けてしまう」ものと、ネット銀行や決済残高のように「受け取れなくなる」もの、写真のように「二度と取り出せなくなる」もの。形は違いますが、原因はまったく同じです。
            <strong>契約の存在と、入り口の鍵を、本人しか知らない。</strong>{' '}
            こうした、スマホやパソコンの中にしか実態のない持ち物は「デジタル遺品」と呼ばれ、相談が年々増えています。
          </p>
          <p>
            これは一部の特別な人の話ではありません。日本では年間およそ160万人が亡くなり、スマートフォンを持つ世帯は9割を超えています。つまりこれからの日本では、
            <strong>亡くなる人のほぼ全員が、デジタル遺品を遺して亡くなる</strong>
            ことになります。デジタル遺品の問題は、減ることのない、これから誰の家庭にも順番に訪れる問題なのです。
          </p>
          <p>
            ひとつ、希望のある事実もお伝えします。IT問題に詳しい弁護士の解説によれば、IDやパスワードが分からない場合でも、遺族が「契約者が亡くなったことを証明する公的な書類」を提出すれば、解約などに対応してもらえる事業者が多いとのことです。出口は、ちゃんとあるのです。ただし——その出口にたどり着くには、
            <strong>「どの会社と契約していたか」を家族が知っていること</strong>
            が大前提です。話はまた、同じ一点に戻ってきます。
          </p>
        </Section>

        <Section id="postpone" title="なぜ、私たちは備えを後回しにしてしまうのか">
          <p>「分かった。たしかに大事だ。今度やろう」</p>
          <p>
            そう思った方が、たぶんこの記事の読者の大半だと思います。そして正直に言うと、
            <strong>その「今度やろう」こそが、この問題の一番の正体</strong>です。
          </p>
          <p>
            人間には「自分だけは大丈夫」「悪いことは自分には起きない」と思い込む心の働きが、生まれつき備わっています。これは欠陥ではなく、毎日を不安にならずに暮らすための、心の安全装置です。ただ、この安全装置のせいで、「もしも」への備えはいつも優先順位の最後尾に回されます。
          </p>
          <p>
            私たちの2026年の調査でも、これを裏づける結果が出ています。デジタルの整理を行動に移せない理由を尋ねると、最も多かったのは「やり方が分からない」という知識の問題ではなく、
            <strong>「面倒・手間」</strong>
            でした。動機の問題は、知識の問題のおよそ2倍。つまり多くの人は、やり方を知らないのではなく、
            <strong>重い腰が上がらない</strong>のです。
          </p>
          <p>
            もうひとつ、後回しを支えている言葉があります。「いつか、元気なうちにやればいい」です。一見、計画のように聞こえます。でも「いつか」には日付がありません。日付のない予定は、予定ではなく、ただの先送りです。そして、その「いつか」がいつまで続くかは、残念ながら誰にも約束されていません。だからこの種の備えは、「いつかやる」ではなく「軽いうちに、ついでに済ませる」が正解なのです。
          </p>
          <p>
            だとすれば、解決策の条件は明確です。「面倒じゃないこと」。学ぶ必要がなく、時間がかからず、今日終わること。
          </p>
          <p>次の章では、その条件を満たす方法を具体的にお見せします。</p>
        </Section>

        <Section id="answer" title="では、本当に全部解約すべきなのか">
          <p>ここまで読んで、「じゃあサブスクを全部やめよう」と思った方。ちょっと待ってください。</p>
          <p>
            冒頭でお話しした通り、サブスクは私たちの生活を確実に豊かにしています。便利なものを、起きるかどうか分からない「もしも」のために全部手放すのは、現実的ではありませんし、その必要もありません。
          </p>
          <p>実は、答えは解約ではありません。</p>
          <p>
            <strong>「自分が何を契約しているか」を、家族に分かる状態にしておくこと。</strong>{' '}
            たったこれだけです。
          </p>
          <p>
            サービス名と、おおまかな月額の一覧。それさえあれば、家族は「何を止めればいいか」が分かります。先ほどの弁護士の解説の通り、契約の存在さえ分かれば、死亡を証明する書類を出して解約する道筋はあるのです。家族が立ち往生するのは、手続きが難しいからではなく、
            <strong>在りかの一覧がないから</strong>。だったら、その一覧を残せばいい。
          </p>

          <h3 className="pt-2 text-lg font-semibold text-slate-900">契約一覧は、15分で作れる</h3>
          <p>やり方は簡単です。3つの場所を見るだけで、契約はほぼ洗い出せます。</p>
          <p>
            <strong>① クレジットカードの明細を3か月分見る。</strong>{' '}
            毎月同じ金額が引かれている項目に印をつけます。年に1回まとめて払う「年払い」の契約を拾うため、できれば過去1年分をざっと眺めると確実です。英語の社名で正体が分からない請求は、その名前でそのままネット検索すると、たいていサービス名が判明します。
          </p>
          <p>
            <strong>② スマホのサブスク管理画面を開く。</strong>{' '}
            iPhoneなら「設定」を開いて一番上の自分の名前→「サブスクリプション」。Androidなら「Google
            Play」のメニューから「定期購入」。アプリ経由で契約したものは、ここに一覧で出てきます。「あ、これまだ契約してた」が一番見つかる場所です。
          </p>
          <p>
            <strong>③ メールを「ご請求」「お支払い」で検索する。</strong>{' '}
            ①②に出てこない、ウェブサイトから直接契約したサービスや、携帯電話料金と一緒に払っているもの（キャリア決済）は、メールに痕跡が残っています。
          </p>
          <p>
            ※ 確認から解約までのより詳しい手順は
            <Link
              href="/guide/digital-seiri/sumaho-kakin-seiri"
              className="text-blue-600 hover:underline"
            >
              スマホの有料サービス・課金を整理する方法
            </Link>
            にまとめています。
          </p>
          <p>洗い出したら、こんな形で書き出します。</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[15px] leading-7">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    サービス名
                  </th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    月額の目安
                  </th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    支払い方法
                  </th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    ひとことメモ
                  </th>
                </tr>
              </thead>
              <tbody>
                {listRows.map((row) => (
                  <tr key={row.name}>
                    <td className="border border-slate-200 px-4 py-3 align-top font-medium text-slate-900">
                      {row.name}
                    </td>
                    <td className="border border-slate-200 px-4 py-3 align-top">{row.price}</td>
                    <td className="border border-slate-200 px-4 py-3 align-top">{row.pay}</td>
                    <td className="border border-slate-200 px-4 py-3 align-top">{row.memo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>そして最後に、もうひとつだけ。</p>
          <p>
            <strong>④ 一覧の「存在」を、家族に一言伝えておく。</strong>{' '}
            「もしものときは、ここに契約の一覧があるから」。この一言がないと、せっかくの一覧も発見されないまま終わる可能性があります。中身を見せる必要はありません。伝えるのは存在と場所だけ。15分の作業の、最後の30秒です。
          </p>
          <p>
            書くのは「サービス名・金額・支払い方法・メモ」の4つだけで十分です。
            <strong>パスワードや暗証番号を、この一覧に書く必要はありません。</strong>{' '}
            家族に必要なのは金庫の中身ではなく、<strong>契約が存在することの分かる一覧</strong>
            だからです。中身を書かなければ、万一この一覧を誰かに見られても、実害はほとんどありません。
          </p>
          <p>
            そしてこの作業には、うれしい副産物があります。ある調査では、サブスクを見直して解約した人の約6割が、
            <strong>年間1万円ほどの節約</strong>
            につながったと答えています。書き出してみると、使っていない契約がたいてい1つや2つ見つかるからです。上の表の「英語学習アプリ」のような行を見つけたら、その場で解約すればいい。将来の家族のためにやったことが、今月の自分の固定費を下げてくれる。これほど割のいい15分は、なかなかありません。
          </p>
        </Section>

        <Section id="faq" title="よくある5つの疑問">
          <p>最後に、ここまで読んだ方から実際によく出る疑問に答えておきます。</p>
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

        <Section id="keep" title="一覧は「作って終わり」にしないことが大切">
          <p>
            ここまでの疑問に共通していたのは、「一覧をどこに置き、どう最新に保つか」という問題です。置き場所の選択肢を整理すると、こうなります。
          </p>
          <p>
            <strong>紙のノート</strong>
            は、手軽で確実ですが、更新が止まりやすく、家族が存在を知らなければ見つかりません。
            <strong>スマホのメモアプリ</strong>
            は、更新は楽ですが、そのスマホ自体が開けなくなったら一覧ごと閉じ込められるという、本末転倒のリスクがあります。
            <strong>家族との口頭共有</strong>
            は、温かい方法ですが、記憶は薄れ、情報は古くなります。
          </p>
          <p>
            それぞれに良さがあるので、まずはどれでも構いません。「ないより、ずっといい」からです。その上で、こうしたデジタルの契約やパスワードといった「デジタル資産」を、ふだんは誰にも見せずに整理しておき、もしものときにだけ、自分が選んだ家族へ引き継げるようにする専用のサービスもあります。私たちが運営する
            <strong>「つぎの手ナビ デジタル資産」</strong>
            もそのひとつで、契約の登録・一覧のPDF出力・見直しの定期リマインドまでは無料で使えます。
          </p>
          <p>
            日々の一覧管理をアプリで仕組み化したい方は、
            <Link
              href="/guide/digital-seiri/sabusuku-kanri"
              className="text-blue-600 hover:underline"
            >
              サブスク管理アプリの選び方と使い方
            </Link>
            もあわせてどうぞ。
          </p>
          <p>
            サブスクを全部解約する必要は、ありません。必要なのは、これからも楽しんで使いながら、その一覧だけを残しておくこと。
          </p>
          <p>
            15分の作業で、この記事に書いた心配は、ぜんぶ「もう考えなくていいこと」になります。それは未来の家族への、小さな贈り物だと思うのです。
          </p>
        </Section>

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            契約の一覧を、もしものときだけ届く形で残すなら
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
                サブスクの見直し・解約の手順を知りたい方
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
                一覧の管理をアプリで仕組み化したい方
              </p>
              <Link
                href="/guide/digital-seiri/sabusuku-kanri"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                サブスク管理アプリの選び方と使い方｜見える化からもしもの備えまで &rsaquo;
              </Link>
            </li>
            <li>
              <p className="text-xs font-medium text-slate-500">
                親のネット銀行が気になった方
              </p>
              <Link
                href="/guide/oya-care/oya-netbank"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                親がネット銀行を使っているなら｜「在りか」の備え方 &rsaquo;
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
