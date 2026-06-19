import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/column/okane-kanri-kichinto';
const PAGE_IMAGE = `${SITE_URL}/images/guide/column/okane-kanri-kichinto-main.webp`;
const PAGE_TITLE = 'お金の管理がきちんとしている人ほど、家族を困らせてしまう3つの理由';
const PAGE_DESCRIPTION =
  'ネット銀行・NISA・ペーパーレス——正しい管理ほど、家族からは「見えない資産」になる。きちんとしている人だけに起きる副作用を、公的な数字と相談事例から解き明かし、金額もパスワードも書かない「どこに何があるかの一覧」を残す15分の備え方までを解説します。';

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
  { id: 'correct', label: 'あなたの「きちんと」は、正しい' },
  { id: 'reason1', label: '理由1：デジタルのお金には「物の手がかり」がない' },
  { id: 'reason2', label: '理由2：きちんとしている人ほど、手がかりを消している' },
  { id: 'reason3', label: '理由3：家族は「ない」ことすら確かめられない' },
  { id: 'kyumin', label: '見つけてもらえなかったお金は、どうなるのか' },
  { id: 'kokoro', label: 'なぜ、きちんとしている人ほど、家族に話さないのか' },
  { id: 'map', label: '答えは、「在りかの一覧」を残すこと' },
  { id: 'faq', label: 'よくある4つの疑問' },
  { id: 'keep', label: '一覧は「作って終わり」にしないことが大切' },
];

const faqs = [
  {
    q: '相続の制度があるから、最後は何とかなるのでは？',
    a: '制度はあります。ただ、この記事で見た通り、銀行は一行ずつの照会、証券はほふりへの開示請求（6,050円・約1か月・判明するのは証券会社名まで）という手間と費用が、悲しみの中の家族に乗ります。そして何より、すべての制度は「家族が、資産の存在を疑って、探し始めること」が出発点です。一覧はその出発点を、丸ごと省略してあげるものです。',
  },
  {
    q: '夫婦でお金の話はしているから、うちは大丈夫では？',
    a: '素晴らしいことです。では、2つだけ確認を。配偶者は、あなたの口座を「全部」言えますか？　昔の給与口座や、キャンペーンで作った口座まで含めて。そしてもうひとつ——その共有、最後に更新したのはいつですか？　口座もNISAも増えたり変わったりします。口頭の共有は、時間とともに最新の一覧ではなく「古い情報」になってしまいます。特に、お互いが自立して資産を運用している共働きの夫婦ほど、注意が必要です。「相手もきちんとしているから」という信頼があるからこそ、あえて相手の財布には踏み込まない。家庭円満の知恵ですが、この距離感がそのまま死角になります。お互いの管理能力が高い夫婦ほど、お互いの資産の「在りか」を知らない——記事全体でお話ししてきた逆説は、夫婦の間でも起きるのです。',
  },
  {
    q: '一覧を作って、誰かに見られたら怖くない？',
    a: '金額・暗証番号・パスワードを書かなければ、その一覧は「あなたがどの銀行を使っているか」以上の情報を含みません。それでも気になる場合は、保管場所を工夫するか、ふだんは誰にも見せず、もしものときにだけ選んだ家族へ届く形で残せる仕組みを使う方法があります（後述します）。',
  },
  {
    q: 'まだ40代なので、さすがに早くない？',
    a: 'むしろ40代こそ、資産の「デジタル化率」がいちばん高い世代です。ネット銀行もNISAもキャッシュレスも使いこなしている世代の資産は、上の世代より見つけにくい。つまり、もしもの場合に家族が直面する難易度は、私たちの世代がいちばん高いのです。一方で備えは15分。釣り合いを考えれば、答えは出ています。',
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
      datePublished: '2026-06-12',
      dateModified: '2026-06-12',
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
          name: 'お金の管理がきちんとしている人ほど、家族を困らせてしまう3つの理由',
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

const mapRows = [
  { bank: '住信SBIネット銀行', type: '普通預金・定期', memo: '生活費のメイン口座' },
  { bank: 'SBI証券', type: 'NISA・投資信託', memo: '毎月積み立て。教育費のつもり' },
  { bank: 'ゆうちょ銀行', type: '普通預金', memo: '昔の給与口座。ほぼ使っていない' },
  { bank: 'PayPay', type: '残高・ポイント', memo: 'スマホ決済。残高が残っているはず' },
];

const sources = [
  '国民生活センター「今から考えておきたい『デジタル終活』——スマホの中の“見えない契約”で遺された家族が困らないために」（2024年11月20日）',
  '国民生活センター 見守り新鮮情報 第505号「始めましょう！デジタル終活」（2025年2月20日）',
  '証券保管振替機構「登録済加入者情報の開示請求」（費用・手続きの詳細は同機構の案内による）',
  '金融庁「NISA口座の利用状況に関する調査」／日本証券業協会 集計資料（2025年12月末時点・約2,826万口座、累計買付額約71.4兆円）',
  '政府広報オンライン「放置したままの口座はありませんか？10年たつと『休眠預金』に。」（毎年約1,200億円）',
  '金融庁「休眠預金等活用法Q&A」',
  '2026年 BlueAdventures調べ（デジタル遺品に関する自社調査）',
];

export default function OkaneKanriKichintoPage() {
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
            <li className="text-slate-700">お金の管理がきちんとしている人ほど、家族を困らせてしまう3つの理由</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          コラム｜デジタル資産との付き合い方
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          お金の管理がきちんとしている人ほど、家族を困らせてしまう3つの理由
        </h1>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/column/okane-kanri-kichinto-main.webp"
            alt="整ったデスクでスマホの家計管理アプリを確認している、お金の管理がきちんとした人の手元"
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

        <Section id="correct" title="あなたの「きちんと」は、正しい">
          <p>
            マネーフォワード
            MEやZaimで毎月の収支を把握している。銀行は、振込手数料の安い住信SBIネット銀行や楽天銀行に乗り換えた。SBI証券か楽天証券でNISA口座を開いて、毎月コツコツ、オルカンやS&amp;P500を積み立てている。明細は紙をやめてWeb化し、家に余計な書類を溜めない——。
          </p>
          <p>
            もし当てはまるものがあったなら、あなたはお金の管理が「きちんとしている人」です。手数料を払わず、書類を溜めず、将来に備えて手を打っている。どれも、まったく正しい行動です。この記事は「その管理をやめましょう」という話ではありません。
          </p>
          <p>
            ただ、その「きちんとさ」には、ほとんど知られていない副作用がひとつあります。きちんとすればするほど、ある一点においてだけ、状況が悪くなっていくのです。
          </p>
          <p>しかも皮肉なことに、お金にだらしない人には、この副作用はほとんど起きません。</p>
          <p>順番にお話しします。</p>
        </Section>

        <Section id="reason1" title="理由1：デジタルのお金には、「物の手がかり」がない">
          <p>ひと昔前の話をします。</p>
          <p>
            かつて、家族が亡くなったあとの「お金探し」は、引き出しから始まりました。通帳、銀行印、キャッシュカード。郵便受けには銀行や証券会社からの取引報告書が届き、台所には銀行の名前が入ったカレンダーやタオルが掛かっている。家の中を丁寧に探せば、故人がどこの金融機関と付き合っていたか、物が教えてくれたのです。
          </p>
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/column/okane-kanri-kichinto-tsucho.webp"
              alt="机の引き出しにしまわれた古い通帳と印鑑——かつてのお金の「物の手がかり」"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>いま、その「物」が消えつつあります。</p>
          <p>
            住信SBIネット銀行にも、楽天銀行にも、PayPay銀行にも、紙の通帳はありません。SBI証券や楽天証券から、紙の取引報告書は基本的に届きません（電子交付が標準です）。郵便物は来ない、粗品のカレンダーも来ない。つまり——
            <strong>家の中に、探す場所そのものが存在しない</strong>のです。
          </p>
          <p>
            誤解しないでください。これは各社のサービスの欠陥ではありません。紙をなくしたからこそ手数料が安く、金利が良い。ペーパーレスは、ネット銀行・ネット証券の長所そのものです。ただ、その長所には「家族から見えない」という裏面がある、という話です。
          </p>
          <p>
            しかも、これはもう少数派の話ではありません。NISA口座は2025年末時点で約2,826万口座。日本の大人のおよそ4人に1人が持っている計算です（概算）。買い付けられた金額は累計でおよそ71兆円。この巨大なお金の多くが、通帳も紙の報告書もない「物の手がかりのない資産」として積み上がっています。見えない資産は、いまや国民的な規模になっているのです。
          </p>
          <p>
            口座はどこにあるのか。スマホとパソコンの中です。正確に言えば、スマホの中のアプリと、メールの奥の開設通知の中。そしてそのスマホを開けるのは、パスワードを知っている本人だけです。
          </p>
          <p>
            ここまでは、「まあ、ネットだからそうだよね」という話です。多くの方が薄々わかっています。本当の問題は、ここからです。
          </p>
        </Section>

        <Section id="reason2" title="理由2：きちんとしている人ほど、手がかりを自分の手で消している">
          <p>思い出してください。あなたが「きちんとした人」になるためにやってきたことを。</p>
          <p>
            紙の明細をやめて、Web明細に切り替えた。届いた郵便物は、確認したらすぐ処分。メールの受信箱は整理して、不要な通知は配信停止。書類は断捨離して、家はすっきり。
          </p>
          <p>ぜんぶ、良い習慣です。ただ、視点を変えると、まったく別の意味を持ちます。</p>
          <p>
            あなたがやってきたのは、
            <strong>自分の資産の手がかりを、家の中から一つずつ消していく作業</strong>
            でもあったのです。
          </p>
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/column/okane-kanri-kichinto-seiri.webp"
              alt="紙の書類がひとつもない、すっきりと片付いたリビング——手がかりが消えた家"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>
            紙の明細をやめた瞬間、家族が郵便物から口座に気づく道が消えました。書類を断捨離した瞬間、引き出しから見つかる道が消えました。残った手がかりは、あなたのスマホの中だけ。そしてスマホには鍵が掛かっています。
          </p>
          <p>つまり、こういうことです。</p>
          <p>
            <strong>
              きちんと整理された資産ほど、本人以外にとっては「存在しないのと同じ」になる。
            </strong>
          </p>
          <p>
            逆を考えると、この皮肉がよく分かります。お金にだらしない人——書類を捨てられず、郵便物が山積みで、銀行のカレンダーを何年も掛けている人——の資産は、家族がすぐ見つけられます。手がかりが散らかっているからです。一方、模範的な管理をしてきたあなたの資産は、どこからも見つかりません。
            <strong>管理の優等生ほど、見つけてもらえない。</strong>{' '}
            これがこの記事でいちばんお伝えしたい事実です。
          </p>
          <p>
            この副作用は、管理が上手な人ほど強く出ます。きちんとした人は、口座を目的別に使い分けるからです。給与と生活費は三菱UFJ銀行、貯蓄は金利で選んだ楽天銀行、投資はSBI証券のNISAとクレカ積立、節税のためのiDeCo（イデコ）か会社の企業型DC、コインチェックで少額だけ買ってみた暗号資産、日々の決済はPayPayとクレジットカード。使い分けは家計管理の王道ですが、口座の数が増えるほど、家族が探し当てなければならない場所も増えていきます。しかもiDeCoや暗号資産は、NISA以上に「家族がその存在を想像すらしない」資産の代表です。ゆうちょ銀行ひとつに全部入っている人と、4つの金融機関とアプリに最適配置しているあなた。もしものとき、家族にとって難しいのはどちらでしょうか。
          </p>
          <p>
            念のため言っておくと、「だからだらしない方がいい」という話では、まったくありません。あなたの使い分けは家計の成績を確実に上げています。進んだやり方をしている人は、備えも一歩だけ進める。それだけの話です。
          </p>
          <p>
            SBI証券で毎月コツコツ積み立てたNISAも、楽天銀行に移しておいた定期も、その存在を知っているのが世界であなた一人なら、家族にとっては最初から無かったお金と変わらないのです。
          </p>
        </Section>

        <Section id="reason3" title="理由3：家族は、「ない」ことすら確かめられない">
          <p>「でも、家族が本気で探せば、調べる方法があるんでしょう？」</p>
          <p>
            そう思った方のために、遺された家族が実際に何をすることになるか、具体的にお見せします。
          </p>
          <p>
            まず入口で立ち止まります。国民生活センターには、こんな相談が実際に寄せられています。亡くなったお兄さんがネット銀行を使っていたようなので口座を確認したい。しかしスマホのロックが解除できず、
            <strong>そもそもどの銀行と契約していたのかが分からない</strong>
            という相談です。携帯電話会社の店舗でロック解除を頼んでも、返ってくる答えは「初期化はできますが、解除はできません」。初期化すれば手がかりごと消えます。
          </p>
          <p>
            ITに詳しい方なら、「Appleの『故人アカウント管理連絡先』や、Googleの『アカウント無効化管理ツール』があるのでは？」と気づいたかもしれません。その通りで、万一のときに家族へアカウントの権限を渡す公式機能は存在します。ただし、どちらも本人が生前に自分で設定しておく必要があり、さらに——
            <strong>
              設定してあること自体を家族が知らなければ、遺された人はその機能に手を出せません
            </strong>
            。優れた機能ですら、最初の入り口となる「どこに何があるかの一覧」がなければ届かないのです。
          </p>
          <p>では、スマホを諦めて制度で調べるとどうなるか。</p>
          <p>
            <strong>銀行の場合。</strong>{' '}
            実は、日本中の銀行をまとめて「故人の口座はありますか」と調べられる公的な仕組みは、現在のところありません。家族は心当たりのある銀行に、<strong>一行ずつ</strong>
            、戸籍などの書類を揃えて照会していくことになります。心当たりがなければ、当てずっぽうで問い合わせるしかありません。
          </p>
          <p>
            <strong>証券の場合。</strong>{' '}
            こちらには「ほふり（証券保管振替機構）への開示請求」という仕組みがあり、故人がどの証券会社に口座を持っていたかを調べられます。ただし条件があります。費用は請求1件あたり6,050円（税込）。戸籍謄本などの書類を揃えて郵送し、結果が届くまで約1か月。しかも分かるのは「どの証券会社か」までで、
            <strong>残高を知るには、判明した証券会社それぞれに、また別の手続き</strong>
            が必要です。
          </p>
          <p>
            仕組み自体はあるのです。出口は、ちゃんとある。でも考えてみてください。この6,050円と1か月の手続きは、
            <strong>「故人がどこかに証券口座を持っていたはずだ」と家族が思っていること</strong>
            が大前提です。あなたがNISAのことを誰にも話していなければ、家族の頭に「証券口座を探す」という発想自体が浮かびません。探されなかった口座は、見つかりません。
          </p>
          <p>
            そして家族には、もうひとつ残酷な問題が残ります。1つ口座が見つかっても、「これで全部なのか」が永遠に分からないのです。
            <strong>「ある」ことの確認はできても、「もうない」ことの確認はできない。</strong>{' '}
            探し物に終わりの合図がない。それが、デジタル時代の資産探しの正体です。
          </p>
          <p>
            そして、この終わりのない探し物には、もうひとつ過酷な条件がつきます。
            <strong>探す側には、締め切りがある</strong>
            のです。相続を放棄するかどうかの判断は、原則として相続を知ってから3か月以内。相続税の申告と納付は10か月以内。資産の全体像がつかめないと、「相続すべきか・放棄すべきか」の判断も、税金の計算もできません。終わりの見えない探し物を、締め切りに追われながらやる——これが、在りかの一覧を持たない家族に課される仕事です。
          </p>
          <p>
            私たちBlueAdventuresが2026年に行った調査でも、大切な方を亡くした経験のある人の60.9%が「デジタル関係で困った経験がある」と答え、困りごとの第1位は「スマホ・パソコンのパスワードが分からない」でした。お金の在りかへの扉が、最初の一枚から開かないのです。
          </p>
          <p>
            親がネット銀行を使っているご家庭の備え方は、
            <Link href="/guide/oya-care/oya-netbank" className="text-blue-600 hover:underline">
              親がネット銀行を使っているなら
            </Link>
            でも詳しく解説しています。
          </p>
        </Section>

        <Section id="kyumin" title="見つけてもらえなかったお金は、どうなるのか">
          <p>「見つからなかった口座のお金は、最後はどうなるの？」と思った方へ。</p>
          <p>
            10年以上、誰も出し入れしない預金は「休眠預金」と呼ばれます。政府広報によれば、この休眠預金は
            <strong>毎年およそ1,200億円</strong>
            生まれています。2018年からは法律により、持ち主の現れないお金は預金保険機構へ移され、子ども支援や地域活性化などの公益活動に活用される仕組みになりました。
          </p>
          <p>
            もちろん、この1,200億円のすべてが亡くなった方の口座ではありません。引っ越しで忘れられた口座なども含まれます。また、休眠預金になったあとでも、金融機関で手続きをすれば引き出すことは可能です。
          </p>
          <p>
            ただ、構図は変わりません。
            <strong>
              持ち主に忘れられたお金、家族に気づかれなかったお金が、毎年それだけの規模で生まれ続けている
            </strong>
            ということです。あなたが将来のためにと積み立てているお金も、家族がその存在を知らなければ、いつかこの列に並ぶことになります。それは社会の役には立つかもしれませんが、あなたがそのお金に込めた「家族のため」という意図とは、違う結末のはずです。
          </p>
        </Section>

        <Section id="kokoro" title="なぜ、きちんとしている人ほど、家族に話さないのか">
          <p>
            ここで少し、心の話をします。なぜ私たちは、自分のお金のことを家族に話さないままでいるのでしょうか。
          </p>
          <p>理由は3つあると思います。</p>
          <p>
            <strong>1つ目は、話す必要を感じないから。</strong>{' '}
            自分で完璧に管理できているので、誰かと共有する動機がそもそも生まれません。管理が下手な人ほど家族に頼り、上手な人ほど一人で完結する。きちんとしている人ほど共有から遠ざかるのは、構造的な必然なのです。
          </p>
          <p>
            <strong>2つ目は、お金の話が気まずいから。</strong>{' '}
            元気なうちに資産の話を切り出すと、「縁起でもない」という空気になりがちです。金額を知られるのも、なんとなく落ち着かない。だから先送りになります。
          </p>
          <p>
            <strong>3つ目は、単純に、面倒だから。</strong>{' '}
            私たちの2026年の調査では、デジタルの整理を行動に移せない理由として最も多かったのは、知識の不足ではなく「面倒・手間」でした。動機の問題は知識の問題のおよそ2倍。みんな、やり方が分からないのではなく、重い腰が上がらないのです。
          </p>
          <p>
            3つに共通するのは、どれも「金額を見せること」への抵抗だという点です。そして、ここに突破口があります。実は、家族に金額を知らせる必要は、まったくないのです。
          </p>
        </Section>

        <Section id="map" title="答えは、「在りかの一覧」を残すこと">
          <p>
            ここまで読んで、「じゃあネット銀行をやめて、紙の通帳に戻ろうか」と思った方。ちょっと待ってください。
          </p>
          <p>
            手数料の安さも、ペーパーレスの身軽さも、NISAの積み立ても、ぜんぶ正しい。やめる必要はありませんし、戻る必要もありません。やることは引き算ではなく、
            <strong>足し算</strong>
            です。いまの管理の習慣に、「本人以外でも、在りかが分かる状態にしておく」という習慣を、ひとつだけ追加する。
          </p>
          <p>
            その具体的な形が、<strong>資産の「在りかの一覧」を残すこと</strong>。これだけです。
          </p>
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/column/okane-kanri-kichinto-chizu.webp"
              alt="ノートに金融機関の名前だけを書き出して、資産の在りかの一覧を作っている手元"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>一覧に書くのは、「どこに・何があるか」だけ。</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[15px] leading-7">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    金融機関
                  </th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    種類
                  </th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    ひとことメモ
                  </th>
                </tr>
              </thead>
              <tbody>
                {mapRows.map((row) => (
                  <tr key={row.bank}>
                    <td className="border border-slate-200 px-4 py-3 align-top font-medium text-slate-900">
                      {row.bank}
                    </td>
                    <td className="border border-slate-200 px-4 py-3 align-top">{row.type}</td>
                    <td className="border border-slate-200 px-4 py-3 align-top">{row.memo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            <strong>金額は書きません。暗証番号もパスワードも書きません。</strong>{' '}
            家族が困るのは「いくらあるか分からない」ことではなく、「どこにあるか分からない」ことだからです。在りかさえ分かれば、亡くなったことを証明する書類で、家族は正規の手続きを進められます。金額を見せる気まずさと、家族を路頭に迷わせるリスクを、切り離せるのです。
          </p>
          <p>
            作り方は15分です。
            <strong>
              ① スマホのアプリ一覧を眺めて、銀行・証券・決済系のアプリを書き出す
            </strong>
            （銀行アプリ、証券アプリ、PayPayや楽天ペイ、家計簿アプリの連携先も手がかりになります）。
            <strong>② メールを「口座開設」「取引報告書」で検索して、漏れを拾う。③ 給料や引き落としの経路をたどって、ハブになっている口座を確認する。</strong>{' '}
            これでほぼ網羅できます。ついでに「ほぼ使っていない口座」が見つかったら、生きているうちに自分で解約しておくと、一覧はもっとシンプルになります。
          </p>
          <p>
            そして、一覧には「見直し日」をひとつ決めておきましょう。誕生日でも、年末の大掃除でも、NISAの年間投資額を確認するタイミングでも構いません。口座は増えたり減ったりするので、年に1回の数分の手直しで、一覧は「古い情報」にならずに済みます。
          </p>
          <p>
            完成した一覧の置き場所も、大げさに考える必要はありません。立派なエンディングノートを買わなくても、通帳ケースや保険証券のファイルの底に1枚挟んでおく。あるいは「もしものときは、これを見て」と一言添えて、家族のLINEに画像を送っておく。金額もパスワードも書いていない一覧ですから、これくらい軽い渡し方で十分です。重く切り出す必要がないことこそ、「金額を書かない一覧」の一番の利点なのです。
          </p>
          <p>
            投資を家族にどう伝えるか迷っている方は、
            <Link href="/guide/shisan-kanri/toshi-kazoku" className="text-blue-600 hover:underline">
              投資、家族に知らせる？知らせない？
            </Link>
            もあわせてどうぞ。
          </p>
        </Section>

        <Section id="faq" title="よくある4つの疑問">
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
            最後にひとつだけ。紙の一覧にも弱点があります。口座は増えたり減ったりするので内容がすぐ古くなること。そして、家族がその紙の存在と置き場所を知らなければ、結局見つけてもらえないことです。
          </p>
          <p>
            こうした口座やNISA、パスワードといった「デジタル資産」の在りかを、ふだんは誰にも見せずに整理しておき、もしものときにだけ、自分が選んだ家族へ引き継げるようにする専用のサービスもあります。私たちが運営する
            <strong>「つぎの手ナビ デジタル資産」</strong>
            もそのひとつで、資産の登録・一覧のPDF出力・見直しの定期リマインドまでは無料で使えます。
          </p>
          <p>あなたの「きちんと」は、何も間違っていません。足りないのは、最後の1ピースだけ。</p>
          <p>
            コツコツ積み上げてきたその努力を、家族に届く形に変える作業は、15分で終わります。それはあなたの資産管理の、本当の完成だと思うのです。
          </p>
        </Section>

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            資産の在りかの一覧を、もしものときだけ届く形で残すなら
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
                サブスクにも同じ仕組みの問題があります
              </p>
              <Link
                href="/guide/column/subsuku-kaiyaku-riyu"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                サブスクは全部、死ぬまでに解約しておかなければならない3つの理由 &rsaquo;
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
            <li>
              <p className="text-xs font-medium text-slate-500">
                投資を家族にどう伝えるか考えたい方
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
