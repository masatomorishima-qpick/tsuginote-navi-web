import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/password-kanri/nidankai-ninsho';
const PAGE_IMAGE = `${SITE_URL}/images/guide/password-kanri/nidankai-ninsho-main.webp`;
const PAGE_TITLE = 'スマホの二段階認証とは？設定のやり方と“もしも”の落とし穴';
const PAGE_DESCRIPTION =
  'スマホの二段階認証とは何か、設定のやり方（SMS・認証アプリ・パスキー）、機種変更やリカバリーコードの注意点まで解説。最後に、強くするほど見落とす「もしものとき家族が入れない」問題と備え方も。';

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
  { id: 'what', label: '二段階認証とは？（1分で理解）' },
  { id: 'types', label: '認証方法は主に3種類' },
  { id: 'how', label: '設定のやり方（共通の流れ）' },
  { id: 'recovery', label: 'いちばん大事な「リカバリーコード」' },
  { id: 'trouble', label: 'つまずきやすい場面' },
  { id: 'blindspot', label: '強くするほど、見落とすこと' },
  { id: 'finish', label: '仕上げ｜「鍵の予備」の在りかを残す' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ' },
];

const faqs = [
  {
    q: '二段階認証は全部のサービスに設定すべきですか？',
    a: 'まずは被害の大きい重要アカウント（メール・銀行・決済・SNS）から設定すれば十分です。特にメールは「他サービスのパスワード再発行の入口」なので最優先です。',
  },
  {
    q: 'SMS認証と認証アプリ、どちらがいいですか？',
    a: '安全性は認証アプリ（またはパスキー）が上です。SMSは手軽ですが、機種変更・番号変更・電波状況に弱い面があります。重要アカウントは認証アプリ・パスキーをおすすめします。',
  },
  {
    q: 'スマホを機種変更したらログインできなくなりました。',
    a: '認証アプリの移行を忘れた可能性が高いです。設定時に保存したリカバリーコードがあればそれでログインできます。無い場合は各サービスのアカウント復旧手続きを使ってください。',
  },
  {
    q: 'リカバリーコードはどこに保管すればいいですか？',
    a: '紙に印刷して自宅の安全な場所、またはパスワード管理アプリが現実的です。スマホのメモ帳に平文で置くと、スマホごと使えなくなったとき意味がないので避けてください。',
  },
  {
    q: '海外旅行によく行きます。認証アプリの方がいいですか？',
    a: 'はい、認証アプリ（またはパスキー）がおすすめです。SMS認証は海外で電波・ローミングの状況によりコードが届かず、ログインできなくなることがあります。認証アプリはオフラインでもコードを表示できるので、渡航前に重要アカウントを認証アプリへ切り替えておくと安心です。',
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
          name: 'パスワード・認証管理',
          item: `${SITE_URL}/guide/password-kanri`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'スマホの二段階認証とは',
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

export default function NidankaiNinshoPage() {
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
              <Link href="/guide/password-kanri" className="text-blue-600 hover:underline">
                パスワード・認証管理
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">スマホの二段階認証とは</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ち情報｜パスワード・認証管理
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          スマホの二段階認証とは？
          <span className="mt-2 block text-xl font-medium leading-snug text-slate-600 sm:text-2xl">
            設定のやり方と“もしも”の落とし穴
          </span>
        </h1>

        <p className="mt-7 text-base leading-8 text-slate-700">
          パスワードが漏れても、もう一段の鍵があれば乗っ取りを防げる——それが二段階認証（2段階認証）です。設定は数分。やらない理由がないほど効果の高い対策ですが、
          <strong>強くするほど見落としがちな“落とし穴”</strong>
          もあります。この記事では、仕組みと設定手順をやさしく解説したうえで、その落とし穴と備え方までお伝えします。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/password-kanri/nidankai-ninsho-main.webp"
            alt="リビングでスマホを手に持ち、指紋認証や認証コードでログインを確認する人"
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

        <Section id="what" title="二段階認証とは？（1分で理解）">
          <p>
            二段階認証とは、ログイン時に「<strong>パスワード（知っているもの）</strong>」に加えて、「
            <strong>スマホに届くコードや認証アプリ（持っているもの）</strong>
            」でもう一度本人確認する仕組みです。
          </p>
          <p>
            パスワードだけだと、それが漏れた瞬間に他人がログインできてしまいます。二段階認証があれば、
            <strong>パスワードが漏れても、あなたのスマホがなければログインできない</strong>
            。これが乗っ取り対策として強力な理由です。
          </p>
        </Section>

        <Section id="types" title="認証方法は主に3種類">
          <DotList
            items={[
              'SMS認証：登録した電話番号に届くコードを入力。手軽だが、機種変更・番号変更時に注意が必要',
              '認証アプリ（Google Authenticator など）：アプリが30秒ごとに変わるコードを発行。SMSより安全で、電波がなくても使える',
              'パスキー／生体認証：指紋・顔でログイン。パスワードを使わず、偽サイト（フィッシング）にも強い最新の方式',
            ]}
          />
          <p>
            迷ったら、<strong>重要なアカウントは「認証アプリ」または「パスキー」</strong>がおすすめです。
          </p>
        </Section>

        <Section id="how" title="設定のやり方（共通の流れ）">
          <p>サービスごとに名称は違いますが、流れは共通です。</p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <ol className="space-y-2.5 text-[15px] leading-8 text-slate-800">
              <li>1. アカウントの「セキュリティ」設定を開く</li>
              <li>2. 「二段階認証／2段階認証プロセス」を選ぶ</li>
              <li>3. 認証方法（SMS・認証アプリ・パスキー）を選んで指示に従う</li>
              <li>4. リカバリーコード（バックアップコード）を必ず保存する（後述）</li>
            </ol>
          </div>
          <p>
            まずは<strong>メール・銀行・決済・SNS</strong>
            など、被害が大きい重要アカウントから設定するのが効率的です。Googleアカウントは「Googleアカウントを管理→セキュリティ→2段階認証プロセス」から設定できます。
          </p>
        </Section>

        <Section id="recovery" title="いちばん大事な「リカバリーコード」">
          <p>
            二段階認証で最も見落とされ、最もトラブルになるのが
            <strong>リカバリーコード（バックアップコード）</strong>です。
          </p>
          <p>
            これは「<strong>スマホを失くした・機種変更した・認証アプリが消えた</strong>
            」ときに、代わりにログインするための予備の鍵です（サービスによっては「バックアップコード」「初期化コード」などとも呼ばれます）。設定時に表示されるので、
            <strong>必ず保存</strong>してください。
          </p>
          <DotList
            items={[
              '紙に印刷して、通帳と同じような安全な場所に保管',
              'またはパスワード管理アプリに保管',
              'スマホのメモ帳に平文で置くのは避ける（スマホごと使えなくなると意味がない）',
            ]}
          />
          <p>
            これを保存していないと、スマホを失くした瞬間に自分でも入れなくなります。
          </p>
        </Section>

        <Section id="trouble" title="つまずきやすい場面">
          <DotList
            items={[
              '機種変更：認証アプリは新しい端末へ「移行」が必要。旧端末が使えるうちに移行するか、リカバリーコードで再設定を。SMS認証は電話番号を引き継げばOK',
              '電話番号が変わった：SMS認証のみだと受け取れなくなります。番号変更前に、認証アプリやパスキーへ切り替えておくと安全',
              '海外・電波がない場所：SMSが届かないことがあるので、認証アプリ併用が安心',
            ]}
          />
        </Section>

        <Section id="blindspot" title="二段階認証を強くするほど、見落とすこと">
          <p>
            ここまでで、あなたのアカウントはぐっと安全になりました。でも、二段階認証ならではの“逆説”を知っておいてください。
          </p>
          <p>
            <strong>安全にすればするほど、そのアカウントに入れるのは、あなた一人だけになります。</strong>
          </p>
          <p>
            二段階認証は「本人のスマホがなければ入れない」仕組み。
            <strong>特に最新の「パスキー」を使っている場合、ログインにはあなたの指紋・顔、またはスマホの画面ロック解除番号が必須</strong>
            になります。つまり、あなたが不在のとき、家族があなたの代わりにログインすることは物理的にほぼ不可能です。
          </p>
          <p>
            もしあなたが急に入院したら、事故や病気でスマホを触れなくなったら——
            <strong>家族は、二段階認証で守られた銀行にもメールにも、入りようがありません</strong>
            。リカバリーコードの存在も保管場所も、知っているのはあなただけ。実際、大切な方を亡くした人がデジタル関連で最も困ったのは「スマホ・パソコンのパスワードが分からない」ことでした（2026年
            BlueAdventures調べ）。
          </p>
          <p>
            セキュリティを上げることと、もしものとき家族が困らないことは、両立できます。
          </p>
        </Section>

        <Section id="finish" title="仕上げ｜「鍵の予備」の在りかを残す">
          <p>
            リカバリーコードやマスターパスワードそのものを、今すぐ家族に渡す必要はありません。
            <strong>
              「重要な備えがここにある」という在りかだけを、もしものときだけ信頼できる人へ届く形にしておく。
            </strong>{' '}
            生きている間は誰にも見えず、もしものときだけ届く——この形なら、日常の安全と、いざというときの安心を両方守れます。
          </p>
          <p>
            二段階認証で守りを固めたなら、その仕上げに「鍵の予備の在りか」を残すところまで。それで、備えが本当に完成します。
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

        <Section id="summary" title="まとめ｜数分で乗っ取り対策、最後に在りかを残す">
          <p>
            二段階認証は、パスワードに「持っているもの（スマホ）」の確認を足して乗っ取りを防ぐ仕組みです。重要アカウントからセキュリティ設定で有効化し、リカバリーコードを必ず安全に保管。SMSより認証アプリ・パスキーが安心です。
          </p>
          <p>
            そして、強くするほど「本人しか入れない」状態になる——だからこそ、リカバリーコードや鍵の在りかを、もしものときだけ家族へ届く形で残しておく。ここまでやって、二段階認証の備えは完成します。
          </p>
          <p>
            パスワードそのものの管理は
            <Link
              href="/guide/password-kanri/sumaho-password"
              className="text-blue-600 hover:underline"
            >
              スマホのパスワード管理
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
            「鍵の予備」の在りかを、もしものときに届く形で残すには
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
                パスワードの管理そのものを見直したい方
              </p>
              <Link
                href="/guide/password-kanri/sumaho-password"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                スマホのパスワード管理｜忘れっぽい人でも安全な方法 &rsaquo;
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
