import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/moshimo-sonae/kyu-nyuin-sonae';
const PAGE_IMAGE = `${SITE_URL}/images/guide/moshimo-sonae/kyu-nyuin-sonae-main.webp`;
const PAGE_TITLE =
  '急な入院に備えて、家族に伝えておく情報リスト｜持ち物だけでは足りない';
const PAGE_DESCRIPTION =
  '急な入院に備えて準備しておくことを、持ち物だけでなく「家族が代わりに動けるための情報」まで解説。連絡先・保険証券の場所・口座やスマホのロックなど、本人が動けないときに家族が困らない備えのリスト。';

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | つぎの手ナビ デジタル資産`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
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
  { id: 'mochimono', label: 'まず押さえる｜入院の持ち物（要点）' },
  { id: 'joho', label: '本当に大事なのは「家族が動ける情報」' },
  { id: 'list', label: '「連絡してほしい人リスト」の作り方' },
  { id: 'arika', label: '持ち物は用意できても、情報は「在りか」が問題' },
  { id: 'finish', label: '仕上げ｜在りかをもしものときだけ届く形で' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ' },
];

const faqs = [
  {
    q: 'まず何から準備すればいいですか？',
    a: '「連絡してほしい人リスト」から始めるのがおすすめです。紙やスマホのメモに5〜10人書き出し、家族がその場所を知っている状態にするだけで、いざというときの初動が大きく変わります。',
  },
  {
    q: '持ち物リストは病院のものと自分のもの、どちらに従えばいいですか？',
    a: '持ち物は病院から渡される案内が最も確実です。この記事の持ち物は最低限の目安として、詳細は入院先の指示に従ってください。',
  },
  {
    q: '家族に保険や口座を全部教えるのは抵抗があります。',
    a: '全部を今すぐ見せる必要はありません。「どこにあるか」という在りかだけを、もしものときだけ家族へ届く形にしておけば、プライバシーを守りつつ備えられます。加入保険の整理には「保険契約の一覧表をエクセルで作る方法」（無料テンプレート付き）も役立ちます。',
  },
  {
    q: '一人暮らしで近くに家族がいません。',
    a: 'その場合こそ、「もしものときに、離れて住む家族や信頼できる人へ連絡先や在りかが届く」備えが役立ちます。日常を見られる心配がないぶん、向いている方法です。',
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
      datePublished: '2026-06-09',
      dateModified: '2026-06-09',
      inLanguage: 'ja',
      author: { '@type': 'Organization', name: 'つぎの手ナビ デジタル資産', url: SITE_URL },
      publisher: { '@type': 'Organization', name: 'BlueAdventures', url: SITE_URL },
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
          name: 'もしもの備え',
          item: `${SITE_URL}/guide/moshimo-sonae`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: '急な入院に備えて家族に伝えておく情報',
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

export default function KyuNyuinSonaePage() {
  return (
    <main className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
              <Link href="/guide/moshimo-sonae" className="text-blue-600 hover:underline">
                もしもの備え
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">急な入院に備えて家族に伝えておく情報</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ち情報｜もしもの備え
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          急な入院に備えて、家族に伝えておく情報リスト
          <span className="mt-2 block text-xl font-medium leading-snug text-slate-600 sm:text-2xl">
            持ち物だけでは足りない
          </span>
        </h1>

        <p className="mt-7 text-base leading-8 text-slate-700">
          入院は、ある日突然やってきます。事故や急な発症で、自分では準備する時間がないことも珍しくありません。
          「入院の準備」と聞くと、まず思い浮かぶのは着替えや洗面用具などの“持ち物”でしょう。もちろん大切ですが、
          <strong>本当に困るのは「物」ではなく「情報」</strong>
          です。入院して本人が動けなくなると、銀行でお金を下ろす、支払いを止める、必要な書類を探す——こうしたことを、家族が代わりにやらなければなりません。そのとき情報がどこにあるか分からないと、家族は立ち往生します。
          この記事では、急な入院に備えて準備しておくことを、「持ち物」と「家族が動くための情報」の両面から整理します。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/moshimo-sonae/kyu-nyuin-sonae-main.webp"
            alt="明るい部屋で、もしものときに家族へ伝えることをノートに書き出して準備する人"
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

        <Section id="mochimono" title="まず押さえる｜入院の持ち物（要点だけ）">
          <p>
            定番の持ち物は、病院から渡される案内に従えば大丈夫です。最低限、次のものを押さえておきましょう。
          </p>
          <DotList
            items={[
              'マイナ保険証（マイナンバーカード）・医療証・お薬手帳（手続きと治療に必須。※家族が代わりに手続きするとき、カードの保管場所と4桁の暗証番号が分からず止まる、という盲点が増えています）',
              '印鑑・現金・診察券',
              '着替え・下着（3セット目安）・洗面用具・コップ',
              '充電器（スマホの充電は連絡の生命線）',
            ]}
          />
          <p>
            持ち物の詳細は病院の案内が確実です。この記事では、ここから先の「<strong>情報の備え</strong>
            」に重点を置きます。
          </p>
        </Section>

        <Section id="joho" title="本当に大事なのは「家族が代わりに動ける情報」">
          <p>
            入院して本人がベッドから動けない間、家族は本人の代わりにいろいろな対応をします。そのとき必要になるのが、次の情報です。
            <strong>元気な今のうちに、まとめておく</strong>のがポイントです。
          </p>
          <DotList
            items={[
              '連絡してほしい人のリスト：職場、親族、友人など。「誰に・どの順で」連絡するか',
              '加入している保険と、証券・書類の保管場所：入院給付金の請求に必要。どこにあるか家族が分かるように',
              '引き落とし・支払いの情報：家賃・カード・サブスクなど。本人が払えない間、止める/続けるの判断に',
              'かかりつけ医・持病・常用薬：救急や転院のときに役立つ',
              'スマホ・パソコンのロック解除：連絡や手続きの多くがこの中にある。家族が開けないと、病院の売店で本人のスマホ決済を使って日用品を代わりに買うことすらできない、ということも起きます',
            ]}
          />
          <p>
            特に最後の「スマホ・パソコンのロック」は見落とされがちですが、
            <strong>いまや連絡先も金融も契約も、その中にあります</strong>
            。ここが開かないと、家族は手も足も出ません。
          </p>
        </Section>

        <Section id="list" title="「連絡してほしい人リスト」の作り方">
          <p>いちばん手をつけやすく、効果が大きいのがこれです。</p>
          <DotList
            items={[
              '紙でもスマホのメモでも、「もしものとき連絡してほしい人」を5〜10人書き出す',
              '名前・続柄・電話番号・「何を頼みたいか」を一言添える',
              '家族がその存在と場所を知っている状態にしておく（作っただけで誰も知らないと意味がない）',
            ]}
          />
        </Section>

        <Section id="arika" title="持ち物は用意できても、情報は「在りか」が問題">
          <p>
            ここまでで気づいたことがあるはずです。
            <strong>
              持ち物は本人やその場で用意できますが、情報は「どこにあるか」を家族が知らないと使えません。
            </strong>
          </p>
          <p>
            保険証券の場所、口座、スマホのロック、連絡先——これらを全部、紙に書いて家族に渡しておけば安心？
            いいえ、そこには別の悩みがあります。
            <strong>資産額や見られたくない情報まで、元気なうちに全部見せたい人はいない</strong>
            。かといって何も残さなければ、もしものとき家族が困る。実際、大切な方を亡くした人がデジタル関連で最も困ったのは「スマホ・パソコンのパスワードが分からない」ことでした（2026年
            BlueAdventures調べ）。
          </p>
        </Section>

        <Section id="finish" title="仕上げ｜「在りか」を、もしものときだけ届く形で">
          <p>
            解決はシンプルです。
            <strong>
              中身を今すぐ見せる必要はありません。「保険はここ」「連絡先はここ」「スマホの鍵はここ」という“在りか”だけを、もしものときだけ信頼できる人へ届く形にしておく。
            </strong>{' '}
            生きている間は誰にも見えず、入院や事故などのもしものときだけ、指定した家族に届く——この形なら、プライバシーを守りながら、家族を「分からない」から守れます。
          </p>
          <p>
            急な入院の備えは、持ち物をそろえて終わりではありません。
            <strong>家族が代わりに動けるよう、情報の在りかを残すところまで</strong>
            やって、はじめて本当の備えになります。
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

        <Section id="summary" title="まとめ｜持ち物＋情報の在りかで、本当の備えに">
          <p>
            急な入院の備えは、①最低限の持ち物（保険証・お薬手帳・着替え・充電器）に加え、②家族が代わりに動くための情報（連絡先・保険の場所・支払い・スマホのロック）を整えること。そして、③その情報の「在りか」を、もしものときだけ家族へ届く形で残すこと。
          </p>
          <p>持ち物だけでなく情報まで備えて、はじめて「もしも」に強くなります。</p>
          <p>
            保険や契約を一覧で整理したい方は
            <Link
              href="/guide/shisan-kanri/hoken-ichiran-excel"
              className="text-blue-600 hover:underline"
            >
              保険契約の一覧表をエクセルで作る方法
            </Link>
            、スマホのロックや鍵を守るパスワード管理は
            <Link
              href="/guide/password-kanri/sumaho-password"
              className="text-blue-600 hover:underline"
            >
              スマホのパスワード管理
            </Link>
            もどうぞ。
          </p>
        </Section>

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            情報の「在りか」を、もしものときに届く形で残すには
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
              <p className="text-xs font-medium text-slate-500">保険・契約を一覧で把握しておきたい方</p>
              <Link
                href="/guide/shisan-kanri/hoken-ichiran-excel"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                保険契約の一覧表をエクセルで作る方法｜無料テンプレート付き &rsaquo;
              </Link>
            </li>
            <li>
              <p className="text-xs font-medium text-slate-500">スマホのロック・鍵を安全に備えたい方</p>
              <Link
                href="/guide/password-kanri/sumaho-password"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                スマホのパスワード管理｜忘れっぽい人でも安全な方法 &rsaquo;
              </Link>
            </li>
          </ul>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
