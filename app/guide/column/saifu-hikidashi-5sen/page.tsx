import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/column/saifu-hikidashi-5sen';
const PAGE_IMAGE = `${SITE_URL}/images/guide/column/saifu-hikidashi-5sen-main.webp`;
const PAGE_TITLE = 'この5年で、財布と引き出しから消えたもの5選';
const PAGE_DESCRIPTION =
  '現金、ポイントカード、通帳、印鑑、アルバム——この5年で財布と引き出しから消えた5つには、ある共通点があります。キャッシュレス比率58%、通帳の印紙税、年賀状6分の1。公的な数字で振り返る大変化と、その先にある「史上初めて必要になった習慣」の話。';

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
  { id: 'test', label: '5年前のあなたの財布、何が入っていましたか' },
  { id: 'one', label: '①現金とクレジットカード' },
  { id: 'two', label: '②ポイントカードの束' },
  { id: 'three', label: '③通帳——銀行が「紙をやめたい」本当の理由' },
  { id: 'four', label: '④印鑑と身分証' },
  { id: 'five', label: '⑤アルバムと手紙' },
  { id: 'next5', label: 'おまけ——次の5年で消える順番を待っているもの' },
  { id: 'hikkoshi', label: '消えたのではなく、「引っ越した」だけ' },
  { id: 'gimon', label: 'ここで出そうな、2つの疑問' },
  { id: 'map', label: 'では、引き出しの時代に戻るべきか' },
];

const faqs = [
  {
    q: 'うちは現金派だから、関係ないのでは？',
    a: '実は、現金派の方にもこの変化は及んでいます。通帳の有料化は本人の意思と関係なく進み、保険証は新規発行が終わり、年金や給付の手続きもオンラインへ寄っていく。財布の中身を現金にしておくことはできても、暮らしの記録がデジタルに引っ越していく流れ自体は、選べないのです。',
  },
  {
    q: 'スマホのパスコードを家族に教えてあるから、大丈夫では？',
    a: '良い備えですが、それは「玄関の鍵」を渡しただけです。玄関が開いても、どの銀行のアプリにお金があり、どのサービスに何の契約があるかは、家の中を全部探さなければ分かりません。必要なのは鍵そのものより、「どこに何があるか」の見取り図です。',
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
          name: 'この5年で、財布と引き出しから消えたもの5選',
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
  {
    item: '現金・カード',
    dest: 'QRコード決済・スマホのウォレット',
    line: '使っている決済サービスの名前',
  },
  { item: 'ポイントカード', dest: 'ポイントアプリ', line: 'よく貯めているポイントの種類' },
  { item: '通帳', dest: '銀行・証券のアプリ', line: '金融機関の名前と口座の種類' },
  {
    item: '保険証券',
    dest: '保険会社のマイページ（Web証券）',
    line: '加入している保険会社名と保険の種類',
  },
  {
    item: '印鑑・身分証',
    dest: 'マイナンバーカード＋残った実印',
    line: '実印・銀行印の保管場所',
  },
  { item: 'アルバム・手紙', dest: 'クラウド写真・LINE', line: '写真がどのサービスにあるか' },
];

const sources = [
  '経済産業省「2025年のキャッシュレス決済比率を算出しました」（2026年3月・新国内指標で58.0%）',
  'みずほ銀行・三井住友銀行 各行公表の通帳手数料（みずほ：2021年1月以降の新規口座で1冊1,100円・70歳未満／三井住友：2021年4月以降の新規口座で年550円）',
  '印紙税法（預金通帳は課税文書・1冊あたり年200円）／日経ビジネス「三菱UFJ銀が脱・紙通帳、重くのしかかっていた印紙税負担」（業界全体で年700億円規模・2019年）',
  '金融庁「NISA口座の利用状況に関する調査」／日本証券業協会 集計資料（2025年12月末時点・約2,826万口座、累計買付額約71.4兆円）',
  '行政手続における押印の見直し（2020年・約1万5,000種類の手続のうち99%超で押印廃止。不動産登記等の実印手続きは存続）',
  '総務省「マイナンバーカード交付状況」（2026年1月末時点・保有枚数率81.2%）',
  '警察庁「マイナンバーカードと運転免許証の一体化」（2025年3月24日運用開始）',
  '政府広報オンライン「マイナ保険証」（2024年12月2日から従来の健康保険証の新規発行終了）',
  '保険法 第95条（保険給付請求権の消滅時効・原則3年）',
  '生命保険協会「生命保険契約照会制度」（2021年7月開始・照会1件3,000円）',
  '日本郵便 年賀はがき発行枚数（ピーク2004年用 約44.6億枚→2026年用 当初発行約7.5億枚）',
  '2026年 BlueAdventures調べ（デジタル遺品に関する自社調査）',
];

export default function SaifuHikidashi5senPage() {
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
            <li className="text-slate-700">この5年で、財布と引き出しから消えたもの5選</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          コラム｜デジタル資産との付き合い方
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          この5年で、財布と引き出しから消えたもの5選
        </h1>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/column/saifu-hikidashi-5sen-main.webp"
            alt="薄くなった財布とスマホがテーブルに置かれた、現代のミニマルな持ち物"
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

        <Section id="test" title="5年前のあなたの財布、何が入っていましたか">
          <p>
            最初に、小さな記憶のテストをさせてください。5年前のあなたの財布には、何が入っていたでしょうか。
          </p>
          <p>
            現金。クレジットカード。ポイントカードの束。診察券。少し重くなった小銭入れ。そして家の引き出しには、通帳と印鑑、保険証、現像した写真、誰かからもらった手紙——。
          </p>
          <p>
            では、いまの財布はどうでしょう。カードは数枚に減り、現金はお守り程度。そもそも財布を持たず、スマホだけで出かける日も増えたはずです。引き出しを最後に開けたのが、いつだったかも思い出せないかもしれません。
          </p>
          <p>
            これは衰退の話ではありません。むしろ逆で、この5年は「持ち物が史上いちばん身軽になった5年」でした。私自身、その便利さを毎日享受している一人です。
          </p>
          <p>
            ただ、ひとつずつのニュースでは知っていても、
            <strong>
              5年分の変化をまとめて並べたとき、何が起きたのかに気づいている人はほとんどいません
            </strong>
            。そして、この「消えた5つ」には、ある共通点があります。それは記事の後半でお話しします。まずは答え合わせから。
          </p>
        </Section>

        <Section id="one" title="①現金とクレジットカード——支払いの半分以上が、もう現金ではない">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/column/saifu-hikidashi-5sen-saifu.webp"
              alt="現金とカードとポイントカードでパンパンに膨らんだ、ひと昔前の財布"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>
            レジの前の風景が変わりました。小銭を数える代わりに、スマホをかざす。QRコード決済にタッチ決済、交通系IC。経済産業省が2026年3月に発表した2025年のキャッシュレス決済比率は、
            <strong>58.0%</strong>
            。算出方法が見直された新しい国内指標での数字ですが、日本の支払いの半分以上が、すでに現金ではなくなった計算です。
          </p>
          <p>
            見落とされがちなのは、この変化が<strong>二段階</strong>
            で起きていることです。第一波は「現金からカードへ」。そして今の第二波は「カードからスマホへ」。クレジットカードそのものをApple
            PayやGoogle
            ウォレットに登録してしまえば、物理カードを財布から出す場面すら消えます。つまり現金だけでなく、
            <strong>カードという「物」まで財布から消え始めている</strong>のです。
          </p>
          <p>
            これは正しい進化です。会計は速く、ポイントが付き、履歴が自動で残る。家計簿アプリと連携すれば、記録の手間すら消えます。財布が軽くなったのは、私たちが賢くなった証拠です。
          </p>
          <p>
            試しに思い出してみてください。
            <strong>最後に銀行の窓口やATMで現金を下ろしたのは、いつでしょうか。</strong>{' '}
            給料は振り込まれ、家賃やカードは引き落とされ、買い物はスマホで払う。お金が「現物」の姿になる瞬間が、生活からほとんど消えた人も多いはずです。お金は今や、生まれてから使われるまで、ずっとデジタルのまま流れています。
          </p>
          <p>
            ただ、ひとつだけ覚えておいてください。現金は、財布を開けば「いくらあるか」が誰の目にも見えました。スマホの中の残高は——この話は、後でまとめてやります。
          </p>
        </Section>

        <Section id="two" title="②ポイントカードの束——財布の厚みは、アプリになった">
          <p>
            5年前の財布を膨らませていた最大の犯人は、実はお金ではなくポイントカードでした。スーパー、ドラッグストア、家電量販店、コーヒーショップ。「ポイントカードはお持ちですか」に応えるたび、財布は厚くなっていきました。
          </p>
          <p>
            いまは、ほとんどがアプリのバーコード提示に置き換わりました。紙のスタンプカードを失くすことも、有効期限切れに泣くこともない。財布は薄くなり、ポイントはむしろ貯まりやすくなった。誰も損をしていない進化です。
          </p>
          <p>
            ここで、ひとつ雑学を。アプリに引っ越したポイントは、立派な「お金の仲間」になりましたが、多くのサービスの規約では、ポイントは
            <strong>本人だけのもの</strong>
            とされていて、家族への引き継ぎや相続の対象にならないのが一般的です（扱いはサービスごとに異なります）。紙のカードの時代は「失くしたら終わり」でしたが、アプリの時代は「本人にしか使えない」。便利さと引き換えに、ポイントは少しだけ「個人の鍵の内側」へ入ったのです。
          </p>
        </Section>

        <Section id="three" title="③通帳——銀行が「紙をやめたい」本当の理由">
          <p>
            通帳は、消えただけではありません。<strong>お金を払う人だけが持てるもの</strong>
            になりました。
          </p>
          <p>
            みずほ銀行では2021年1月以降に開設した口座の紙通帳は1冊1,100円（70歳未満）、三井住友銀行でも2021年4月以降の新規口座では年550円の手数料がかかります。住信SBIネット銀行や楽天銀行などのネット銀行には、最初から紙の通帳がありません。
          </p>
          <p>
            なぜ銀行は、そこまでして紙をやめたいのか。ここに、あまり知られていない事情があります。預金通帳は印紙税法上の「課税文書」で、
            <strong>銀行は通帳1冊につき、毎年200円の印紙税を国に納めています</strong>
            。あなたが通帳を持っているだけで、銀行には毎年コストが発生する。その負担は銀行業界全体で年700億円規模と報じられ、三菱UFJ銀行が「紙の通帳をやめた人に1,000円進呈」というキャンペーンまで行ったのは、このためです。デジタル通帳は課税文書に当たらないので、印紙税がかかりません。
          </p>
          <p>
            つまり通帳の消滅は、流行ではなく<strong>経済の必然</strong>
            です。この流れが巻き戻ることは、まずありません。
          </p>
          <p>
            規模も見ておきましょう。NISA口座は2025年12月末時点で約2,826万口座、累計の買付額はおよそ71.4兆円。日本の大人のおよそ4人に1人が、通帳も紙の報告書もない世界に資産を置いている計算です。
          </p>
          <p>
            これも、悪いことではありません。紙をなくしたからこそ手数料は安く、金利は良くなった。記帳のためにATMに並ぶ時間も消えました。
          </p>
          <p>
            そして、これと同じことが、実は<strong>保険</strong>
            でも起きています。賢く保険を選んでいる人ほど、ペーパーレス割引やWeb申込割引を使って、紙の証券を発行しない「Web証券（マイページ管理）」にしているはずです。合理的な選択です。ただ、ここには銀行口座と決定的に違う点がひとつあります。銀行のお金は、10年放置されて「休眠預金」になっても、手続きをすれば引き出せます。一方、
            <strong>
              保険金は「家族がその契約の存在に気づいて、自ら請求しない限り、1円も支払われない」
            </strong>
            仕組みです（請求主義）。保険会社の側から「保険金をお支払いします」と連絡が来ることは、基本的にありません。しかも保険法では、保険金の請求権は
            <strong>原則3年</strong>
            で時効と定められています。紙の証券が引き出しから消えた先進的な保険ほど、もしものとき家族に見落とされやすい——通帳と同じ「目印の消滅」が、より静かに進んでいるのです。
          </p>
          <p>
            （なお、遺族などが生命保険の契約の有無をまとめて照会できる「生命保険契約照会制度」が2021年7月から始まっています。1回3,000円。出口はあります。ただしこれも、家族が「保険があったはずだ」と思って探し始めることが前提です。）
          </p>
          <p>通帳には、お金の記録の他に、もうひとつ隠れた役割がありました。それは後ほど。</p>
        </Section>

        <Section id="four" title="④印鑑と身分証——ハンコは99%が役目を終えた。残った1%が問題">
          <p>
            2020年、国の行政手続き約1万5,000種類のうち、<strong>99%超で押印が廃止</strong>
            されました。引き出しの印鑑が活躍する場面は、もうほとんど残っていません。
          </p>
          <p>
            面白いのは、<strong>残った1%の中身</strong>
            です。押印が残ったのは、不動産の登記や法人の登記など、実印を求める特に重要な手続きでした。つまりハンコは「日常からは消えたが、人生の大事な場面にだけ残った」のです。ここで質問です。あなたの家の引き出しにある数本の印鑑のうち、どれが実印で、どれが銀行の届出印か——見分けられるのは、おそらくあなただけではないでしょうか。
          </p>
          <p>
            身分証も同じ道を歩んでいます。健康保険証は2024年12月2日で新規発行が終わり、マイナ保険証が基本になりました。2025年3月24日からは運転免許証もマイナンバーカードと一体化できる「マイナ免許証」が始まっています（持ち方は選べます）。マイナンバーカードの保有枚数率は2026年1月末時点で人口の
            <strong>81.2%</strong>
            。引き出しに分散していた「自分を証明するもの」は、カード1枚とスマホに集約されつつあります。
          </p>
          <p>住所変更は楽になり、窓口の待ち時間は減りました。これも前に進んだ変化です。</p>
        </Section>

        <Section id="five" title="⑤アルバムと手紙——思い出は、本棚からクラウドへ">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/column/saifu-hikidashi-5sen-album.webp"
              alt="本棚の古い家族アルバムと年賀状の束——かつて家に残っていた思い出のかたち"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>最後は、お金でも証明書でもないもの。思い出です。</p>
          <p>
            数字がいちばん雄弁なのは、年賀状でしょう。年賀はがきの発行枚数はピークだった2004年用の約44.6億枚から減り続け、
            <strong>2026年用は当初発行で約7.5億枚。およそ6分の1</strong>
            になりました（日本郵便）。手紙とハガキの役割は、LINEとメールに引っ越したのです。
          </p>
          <p>
            写真も同じです。子どもの写真は現像されなくなり、iCloudやGoogleフォトに自動で貯まっていきます。本棚のアルバムが増えなくなった代わりに、スマホの中には何千枚、何万枚という写真が、劣化もせず、検索までできる状態で収まっています。「現像に出す」という言葉自体、もう通じない世代が育ち始めています。
          </p>
          <p>
            昔より思い出が薄くなったわけではありません。むしろ私たちは、史上もっとも多くの記録を残せる時代を生きています。
          </p>
        </Section>

        <Section id="next5" title="おまけ——次の5年で「消える」順番を待っているもの">
          <p>
            ここまでが、すでに起きた5つ。では、次の5年はどうなるでしょう。順番待ちの列は、もう見えています。
          </p>
          <p>
            家の鍵は、スマートロックでスマホに入り始めました。診察券は病院アプリに。ガスや電気の検針票が、いつの間にか紙で来なくなったことに気づいた方もいるでしょう。各種の契約書類も「Web交付をご選択ください」の一言で、紙から消えていきます。
          </p>
          <p>
            個別の品目は違っても、引っ越し先は全部同じです。<strong>スマホの中。</strong>{' '}
            つまりこの記事で話してきた構図は、これから弱まるどころか、年々強まっていきます。だからこそ、次の話が重要になります。
          </p>
        </Section>

        <Section id="hikkoshi" title="消えたのではなく、「引っ越した」だけ——ただし、行き先が問題">
          <p>お待たせしました。ここまでの5つに共通することを、一文で言います。</p>
          <p>
            <strong>
              消えたのではありません。全部、あなたにしか開けられない場所へ引っ越しただけです。
            </strong>
          </p>
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/column/saifu-hikidashi-5sen-lock.webp"
              alt="テーブルの上のスマホのロック画面——5つの引っ越し先を守る、たった一つの鍵"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>
            考えてみてください。かつての財布は、落とせば誰でも中身が見えました。だから困ったわけですが、裏を返せば「中身が見える」ものでした。日本は、落とした財布が現金ごと戻ってくることで知られる国です。でも、スマホは戻ってきても、ロックの先は誰にも開けられません。
          </p>
          <p>
            引き出しも同じです。通帳、印鑑、保険証、アルバム。あなたに何かあれば、家族が引き出しを開けて、そこから全部を見つけることができました。
            <strong>
              通帳の隠れた役割とは、これです。お金の記録であると同時に、「ここに口座がある」と家族に教える、物理的な目印でした。
            </strong>{' '}
            銀行のカレンダーや郵便物も、みんな同じ役割を果たしていました。
          </p>
          <p>
            引っ越し先のスマホは違います。顔認証、指紋、パスコード。中身は強固に守られていて、それ自体はとても良いことです。ただし、その鍵を持っているのは、世界であなた一人。そして鍵の内側には、決済残高、ポイント、銀行口座、NISA、何万枚の写真——この記事で見てきた5つ全部が、まとめて入っています。
          </p>
          <p>
            つまり、こういうことです。「財布と引き出しの時代」には、家族への引き継ぎは
            <strong>自動</strong>
            でした。何も準備しなくても、物が家に残り、家族の目に触れたからです。デジタルに引っ越した今、その引き継ぎは、史上初めて
            <strong>「やらないと、できないこと」</strong>
            になりました。財布と引き出しが黙ってやってくれていた仕事を、いまは誰かが意識して肩代わりする必要があるのです。
          </p>
          <p>
            ここには、避けられない皮肉があります。昔の暮らしの鍵は、家の鍵が1本と、銀行印が1本。いまは、数えきれないIDとパスワード、顔と指紋。
            <strong>守りを強くすればするほど、本人以外には開けられなくなる</strong>
            ——あなたを守る仕組みの強さが、そのまま、家族の前に立つ壁の高さになるのです。これは誰の落ち度でもなく、デジタル化という正しい進化が残した、構造上の課題です。
          </p>
          <p>
            実際、私たちBlueAdventuresが2026年に行った調査では、大切な方を亡くした経験のある人の60.9%が「デジタル関係で困った経験がある」と答えています。困りごとの第1位は「スマホ・パソコンのパスワードが分からない」。引っ越し先の扉が、最初の一枚から開かないのです。
          </p>
        </Section>

        <Section id="gimon" title="ここで出そうな、2つの疑問">
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

        <Section id="map" title="では、引き出しの時代に戻るべきか">
          <p>戻る必要は、まったくありません。</p>
          <p>
            現金に戻せば会計は遅くなり、紙の通帳に戻せば手数料がかかり、写真を全部現像すれば家が埋まります。この5年の変化は、ぜんぶ正しい。巻き戻すのは損です。
          </p>
          <p>
            足すべきものは、ひとつだけ。
            <strong>
              「どこに・何があるか」を本人以外にも分かるようにしておく「在りかの一覧」の習慣
            </strong>
            です。
          </p>
          <p>この記事の5選に沿って書くなら、一覧はこれだけで足ります。</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[15px] leading-7">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    消えたもの
                  </th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    引っ越し先
                  </th>
                  <th className="border border-slate-200 px-4 py-3 font-semibold text-slate-900">
                    一覧に書く1行
                  </th>
                </tr>
              </thead>
              <tbody>
                {mapRows.map((row) => (
                  <tr key={row.item}>
                    <td className="border border-slate-200 px-4 py-3 align-top font-medium text-slate-900">
                      {row.item}
                    </td>
                    <td className="border border-slate-200 px-4 py-3 align-top">{row.dest}</td>
                    <td className="border border-slate-200 px-4 py-3 align-top">{row.line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            気づいたでしょうか。<strong>金額も、パスワードも、1つも書いていません。</strong>{' '}
            書くのは「名前と場所」だけ。これなら万一誰かに見られても実害はほとんどなく、それでいて、かつて引き出しが果たしていた「家族に教える目印」の役割は完全に取り戻せます。所要時間は15分ほど。詳しい手順は
            <Link
              href="/guide/column/okane-kanri-kichinto"
              className="text-blue-600 hover:underline"
            >
              お金の管理がきちんとしている人ほど、家族を困らせてしまう3つの理由
            </Link>
            で紹介しています。毎月の引き落としが続くサブスクの一覧づくりは
            <Link
              href="/guide/column/subsuku-kaiyaku-riyu"
              className="text-blue-600 hover:underline"
            >
              サブスクは全部、死ぬまでに解約しておかなければならない3つの理由
            </Link>
            をどうぞ。
          </p>
          <p>
            うれしい副産物もあります。書き出してみると、使っていないポイントアプリ、ほぼ残高ゼロの口座、忘れていたサブスクがたいてい1つや2つ見つかります。一覧づくりは、将来の備えであると同時に、財布と暮らしをもう一段身軽にする整理でもあるのです。
          </p>
          <p>
            紙に書いて引き出しに入れておくだけでも、ないよりずっと良い。ただ、紙には「内容がすぐ古くなる」「家族がその存在を知らなければ見つからない」という2つの弱点が残ります。こうした口座や契約、写真の在りかといった「デジタル資産」を、ふだんは誰にも見せず、もしものときにだけ選んだ家族へ引き継げるようにする専用のサービスもあります。私たちが運営する
            <strong>「つぎの手ナビ デジタル資産」</strong>
            もそのひとつで、登録・一覧のPDF出力・見直しの定期リマインドまでは無料で使えます。
          </p>
          <p>
            この5年で、私たちの持ち物は史上いちばん身軽になりました。あとは、その身軽さに在りかの一覧を1枚足すだけ。財布と引き出しが黙ってやってくれていた仕事は、それでぜんぶ取り戻せます。もう、考えなくて大丈夫です。
          </p>
        </Section>

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            「どこに何があるか」を、もしものときだけ届く形で残すなら
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、口座や契約、写真の在りかを、生きている間は誰にも見せず、もしものときだけ選んだ人へ届ける準備ができるサービスです。登録・PDF出力・定期リマインドは無料で使えます。
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
            動画でも見る（約20秒）
          </h2>
          <p className="mt-5 text-[15px] leading-8 text-slate-700">
            この記事の内容を、約20秒のショート動画にまとめています。通勤や家事の合間にどうぞ。
          </p>
          <div className="mx-auto mt-5 aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-2xl bg-slate-100">
            <iframe
              src="https://www.youtube.com/embed/rdU7vuuq5B4"
              title="この5年で、財布と引き出しから消えたもの5選（ショート動画）"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          <p className="mt-3 text-center text-sm">
            <a
              href="https://youtube.com/shorts/rdU7vuuq5B4"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              YouTube で見る &rsaquo;
            </a>
          </p>
        </section>

        <section className="mt-14">
          <h2 className="border-b border-slate-200 pb-3 text-xl font-semibold text-slate-900">
            あわせて確認したい記事
          </h2>
          <ul className="mt-5 space-y-5">
            <li>
              <p className="text-xs font-medium text-slate-500">
                資産の在りかの一覧の作り方を詳しく知りたい方
              </p>
              <Link
                href="/guide/column/okane-kanri-kichinto"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                お金の管理がきちんとしている人ほど、家族を困らせてしまう3つの理由 &rsaquo;
              </Link>
            </li>
            <li>
              <p className="text-xs font-medium text-slate-500">
                止めない限り続く「サブスク」の仕組みが気になった方
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
                保険の契約を一覧にして整理したい方
              </p>
              <Link
                href="/guide/shisan-kanri/hoken-ichiran-excel"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                保険契約の一覧表をエクセルで作る方法｜無料テンプレート付き &rsaquo;
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
