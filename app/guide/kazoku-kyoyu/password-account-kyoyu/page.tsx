import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/kazoku-kyoyu/password-account-kyoyu';
const PAGE_TITLE =
  '家族とのパスワード・アカウント共有｜どこまで共有する？安全なやり方と線引き';
const PAGE_DESCRIPTION =
  '家族とのパスワード・アカウント共有の安全なやり方を解説。何を共有してよくて、何は個人に留めるべきかの「線引き」から、Apple・Google・管理アプリの共有手順、LINEやメモで送ってはいけない理由まで。夫婦でも全部は見せたくない人のための考え方も。';

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
    images: [
      {
        url: `${SITE_URL}/images/guide/kazoku-kyoyu/password-account-kyoyu-main.webp`,
        width: 1600,
        height: 900,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [`${SITE_URL}/images/guide/kazoku-kyoyu/password-account-kyoyu-main.webp`],
  },
};

const toc = [
  { id: 'line', label: 'まず線引き｜共有してよいもの・個人に留めるもの' },
  { id: 'invite', label: 'パスワードを渡さない方法｜招待・権限付与' },
  { id: 'how', label: '安全な共有のやり方｜3つの方式' },
  { id: 'ng', label: 'やってはいけない共有' },
  { id: 'rules', label: '共有を始めるときの家族ルール' },
  { id: 'gap', label: 'ここまでの整理と、残された問題' },
  { id: 'finish', label: '仕上げ｜第3の選択肢' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ' },
];

const faqs = [
  {
    q: '夫婦でも、パスワードは全部共有すべきですか？',
    a: '全部共有する必要はありません。家族で一緒に使うもの（Wi-Fi・サブスク等）だけ共有し、銀行・決済・メールは個人に留めるのが安全上の基本です。「もしものとき」への備えは、日常の共有とは別の仕組み（そのときだけ届く形）で用意できます。',
  },
  {
    q: 'LINEでパスワードを送ってしまいました。危険ですか？',
    a: '送信履歴に平文で残っている状態です。可能ならそのパスワード自体を変更し、以後は共有グループなど暗号化された仕組みで共有してください。',
  },
  {
    q: '動画サブスクのアカウント共有は規約違反になりませんか？',
    a: 'サービスによります。同居家族での共有を認めるもの、プランによって人数が決まっているものなど条件が異なるため、利用中のサービスの規約・プランをご確認ください。',
  },
  {
    q: '職場やチームでのパスワード共有はどうすればいいですか？',
    a: 'まず会社や組織の規程・ルールに従ってください。業務でのパスワード共有は、権限管理や履歴機能のあるビジネス向けパスワード管理ツールで行う領域です。この記事で扱った共有グループや家族プランは、家族・個人での利用を想定しています。',
  },
  {
    q: '一人暮らしで共有する家族が近くにいません。どう備えればいいですか？',
    a: '日常の共有は無理にしなくて大丈夫です。「もしものときだけ、離れて住む家族や信頼できる人に届く」形の備えなら、一人暮らしでも作れます。むしろ日常を見られる心配がないぶん、向いている方法です。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      image: `${SITE_URL}/images/guide/kazoku-kyoyu/password-account-kyoyu-main.webp`,
      mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`,
      datePublished: '2026-06-06',
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
          name: '家族間の情報共有',
          item: `${SITE_URL}/guide/kazoku-kyoyu`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: '家族とのパスワード・アカウント共有',
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

export default function PasswordAccountKyoyuPage() {
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
              <Link href="/guide/kazoku-kyoyu" className="text-blue-600 hover:underline">
                家族間の情報共有
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">家族とのパスワード・アカウント共有</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ち情報｜家族間の情報共有
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          家族とのパスワード・アカウント共有
          <span className="mt-2 block text-xl font-medium leading-snug text-slate-600 sm:text-2xl">
            どこまで共有する？安全なやり方と線引き
          </span>
        </h1>

        <p className="mt-7 text-base leading-8 text-slate-700">
          Wi-Fiのパスワード、家族で見ている動画サブスク、子どものアカウント管理——家族とパスワードを共有する場面は、当たり前になりました。
          一方で、こんな葛藤はないでしょうか。
          <strong>
            「家族でも、全部を見せるのは抵抗がある。でも、何も共有していないと、もしものとき困るのでは」
          </strong>
          ——実際、この問いはネット上の相談掲示板でも繰り返し議論されていて、答えが出ていません。
          この記事では、まず「何を共有してよくて、何は個人に留めるべきか」という線引きの考え方を整理し、そのうえで安全な共有のやり方（Apple・Google・管理アプリ）を具体的に解説します。最後に、多くの解説が触れない「共有だけでは届かない領域」の備え方まで。読み終えるころには、わが家の共有ルールが決められるはずです。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/kazoku-kyoyu/password-account-kyoyu-main.webp"
            alt="明るいリビングで夫婦がスマホを一緒に見ながら、何を共有するかを穏やかに話し合っている様子"
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

        <Section id="line" title="まず線引き｜「共有してよいもの」と「個人に留めるもの」">
          <p>
            全部共有か、全部秘密か、の二択ではありません。情報の性質で3つに分けると、スッと整理できます。
          </p>
          <p>
            <strong>①共有してよいもの（家族で一緒に使うもの）</strong>
          </p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <DotList
              items={[
                '自宅のWi-Fiパスワード',
                '家族で使う動画・音楽サブスクのアカウント（規約の範囲内で）',
                '家族写真のクラウドアルバム',
                '子どものアカウント（保護者が管理）',
              ]}
            />
          </div>
          <p>
            <strong>②条件つきで共有するもの（必要な人に、必要な分だけ）</strong>
          </p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <DotList
              items={[
                '通販サイトなど、家族の買い物で使うアカウント',
                '家計管理のアプリ（夫婦で家計を共有している場合）',
              ]}
            />
          </div>
          <p>
            <strong>③個人に留めるべきもの（生きている間は共有しない）</strong>
          </p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <DotList
              items={[
                '銀行・証券・決済（クレジットカード・スマホ決済等）のログイン情報',
                'メール本体のパスワード（全サービスの「鍵の再発行場所」なので最重要）',
                '仕事のアカウント（会社の規程上も共有不可）',
                'スマホ・パソコン本体のロック解除',
              ]}
            />
          </div>
          <p>
            ポイントは2つあります。
            <strong>③を共有しないのは、家族を信用していないからではありません。</strong>{' '}
            漏えい経路が増えるほどリスクが上がるという、純粋に安全上の理由です。そしてもう1つ——③こそが、もしものときに家族が一番困る情報でもあります。この矛盾の解き方は、記事の最後で扱います。
          </p>
        </Section>

        <Section id="invite" title="そもそもパスワードを渡さない方法｜招待・権限付与">
          <p>
            共有のやり方に進む前に、ひとつ確認したいことがあります。
            <strong>そのサービス、パスワードを渡さなくても「招待」で済みませんか？</strong>
          </p>
          <DotList
            items={[
              '家族写真：クラウドアルバムの「共有アルバム」に家族を招待すれば、アカウントを渡す必要はありません',
              '家計簿アプリ：夫婦で使うペア機能・招待機能があるものなら、それぞれ自分のアカウントで使えます',
              '通販・動画サブスク：ファミリー機能やプロフィール追加で、メンバーとして招待できるものがあります',
            ]}
          />
          <p>
            招待・権限付与なら、<strong>パスワードはそもそも相手に渡らないので、漏れようがありません</strong>
            。共有をやめるときも、相手を招待から外すだけ。手順としては「①まず招待で済むか確認する→②済まないもの（Wi-Fiなど）だけ、次の共有方式を使う」の順番がいちばん安全です。
          </p>
        </Section>

        <Section id="how" title="安全な共有のやり方｜3つの方式">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/kazoku-kyoyu/password-account-kyoyu-step.webp"
              alt="夫婦が2台のスマホを並べて、パスワード共有の設定を一緒に進めている手元"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>
            ①②と決めたものを共有する方法です。重要なのは、<strong>LINEやメールで送らない</strong>
            こと（理由は後述）。専用の仕組みを使えば、暗号化されたまま渡せて、変更時も自動で同期されます。
          </p>
          <p>
            <strong>方式1：iPhone同士なら「共有グループ」（無料・標準機能）</strong>
            <br />
            iPhoneの標準「パスワード」アプリには、家族とパスワードを共有する「共有グループ」機能があります。
          </p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <DotList
              items={[
                '「パスワード」アプリ（または設定→パスワード）→「＋」→「新規共有グループ」で家族を招待',
                '共有したいパスワードだけを選んでグループに入れる——全部見せる必要はなく、Wi-Fiとサブスクだけ、という使い方ができます',
                'グループ内のパスワードは暗号化されたまま同期され、二段階認証の確認コードも自動入力できます',
                'やめたいときは、グループから外せば共有は止まります',
              ]}
            />
          </div>
          <p>
            <strong>方式2：Androidなら「Googleパスワードマネージャー」のファミリー共有</strong>
            <br />
            Googleパスワードマネージャーでも、Googleの「ファミリーグループ」のメンバーと、選んだパスワードを安全に共有できます。Chromeを使えばパソコンでも同じように使えます。
          </p>
          <p>
            <strong>方式3：家族プランのあるパスワード管理アプリ</strong>
            <br />
            1Password・Bitwarden
            など専用アプリの家族プランは、「家族全員の共有金庫」と「個人の金庫」を分けて持てるのが特長です。iPhoneとAndroidが混在する家族や、共有を細かく整理したい家庭に向きます。月額がかかるので、まずは方式1・2の無料機能で始めて、物足りなければ検討で十分です。
          </p>
        </Section>

        <Section id="ng" title="やってはいけない共有">
          <div className="rounded-2xl bg-rose-50 p-6">
            <CrossList
              items={[
                'LINE・メール・メモアプリでパスワードを送る：送信履歴に平文で残り続けます。スマホの紛失・乗っ取り・誤送信で、そのまま漏れます。「送ったら消す」も、相手側の履歴には残ります',
                '家族全員で同じパスワードを使い回す：1か所漏れると全員のアカウントが危険になります。共有してよいのは「アカウント」であって、「同じパスワードの使い回し」ではありません',
                '紙に書いて冷蔵庫に貼る：来客や工事業者など、家族以外の目に触れます。紙で管理するなら、通帳と同じ場所に保管を',
                'エクセルやスプレッドシートで一覧管理する：中身は暗号化されない平文のままで、ファイルやリンクの共有範囲も広がりがちです',
              ]}
            />
          </div>
          <p>
            エクセル管理の弱点と、家族に残す方法ごとの比較は
            <Link
              href="/guide/kazoku-kyoyu/joho-kyoyu-hikaku"
              className="text-blue-600 hover:underline"
            >
              パスワード・情報管理の方法の比較
            </Link>
            で詳しく扱っています。
          </p>
          <p>
            なお、どうしても1回だけ直接渡す必要があるとき（離れて住む家族に急ぎで伝える場合など）は、
            <strong>
              ①期限付き・1回見たら消える形の共有機能を使う、②用が済んだらそのパスワード自体を変更する
            </strong>
            ——この2点を守るだけで、漏れたときの被害をぐっと小さくできます。
          </p>
        </Section>

        <Section id="rules" title="共有を始めるときの家族ルール（3つだけ）">
          <DotList
            items={[
              '共有の範囲を言葉にしておく——「Wi-Fiとネットフリックスは共有、銀行とメールはお互い個人」。一度話して決めるだけで、後の気まずさがなくなります',
              '共有をやめるときは仕組みから外す——口約束ではなく、共有グループから削除する',
              '年に1回見直す——子どもの成長や契約の変化で、共有すべきものは変わります',
            ]}
          />
        </Section>

        <Section id="gap" title="ここまでの整理と、残された問題">
          <p>
            ここまでで、日常の共有は安全に仕組み化できました。Wi-Fiもサブスクも、選んだものだけ、暗号化されたまま家族と共有できています。
          </p>
          <p>
            でも、冒頭の葛藤を思い出してください。
            <strong>
              線引きの③——銀行・証券・決済・メール・スマホ本体のロック——は、共有しないのが正解
            </strong>
            でした。では、もしあなたが急に入院したら？
            事故や病気で、スマホを操作できなくなったら？
          </p>
          <p>
            家族がいちばん必要とするのは、まさにその③の情報です。実際、大切な方を亡くした人がデジタル関連で最も困ったのは「スマホ・パソコンのパスワードが分からない」ことでした（2026年
            BlueAdventures調べ）。日常の共有グループには入れていないのだから、当然、家族はたどり着けません。
          </p>
          <p>
            つまり——
            <strong>「日常の共有」と「もしものときの引き継ぎ」は、別の道具なのです。</strong>{' '}
            共有グループは「今、一緒に使う」ための道具。もしものときに備える道具は、別に用意する必要があります。
          </p>
        </Section>

        <Section
          id="finish"
          title="仕上げ｜「生きている間は見せず、もしものときだけ届く」という第3の選択肢"
        >
          <p>「全部共有する」と「何も渡さない」の間には、第3の選択肢があります。</p>
          <p>
            <strong>
              生きている間は誰にも見せない。もしものときだけ、自分が選んだ人に届く。
            </strong>{' '}
            ——この形なら、夫婦でもプライバシーは守ったまま、家族を「分からない」から守れます。生前に資産の情報を見せるかどうかも、人ごとに選べます。
          </p>
          <p>
            冒頭の葛藤——「全部見せるのは抵抗がある。でも、もしものとき困る」——は、共有の道具だけで解こうとするから答えが出ないのです。日常の共有は共有グループで。もしものときの備えは、そのときだけ届く仕組みで。道具を分ければ、両方とも手に入ります。
          </p>
          <p>
            今日、家族の共有ルールを決めたなら、その流れで「もしものとき」の備えまで。それが、共有の話し合いの本当の仕上げです。
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

        <Section id="summary" title="まとめ｜共有は「選んだものだけ」、もしもは「別の道具」で">
          <p>
            家族とのパスワード・アカウント共有は、①共有してよいもの・条件つき・個人に留めるものの3つに線引きし、②Apple共有グループ／Googleファミリー共有／管理アプリ家族プランなど暗号化された仕組みで「選んだものだけ」共有し、③LINE・メール・使い回しは避ける——これが安全な形です。
          </p>
          <p>
            そして、個人に留めた情報こそ、もしものときに家族が最も必要とするもの。日常の共有とは別に、「生きている間は見せず、もしものときだけ選んだ人へ届く」備えを用意して、はじめて家族の安心は完成します。
          </p>
          <p>
            パスワードそのものの安全な管理は
            <Link
              href="/guide/password-kanri/sumaho-password"
              className="text-blue-600 hover:underline"
            >
              スマホのパスワード管理
            </Link>
            、家族に残す前提の整理は
            <Link
              href="/guide/digital-seiri/digital-dansyari"
              className="text-blue-600 hover:underline"
            >
              デジタル断捨離のやり方
            </Link>
            もどうぞ。
          </p>
        </Section>

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            「もしものときだけ届く」備えを、今日のうちに
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
                自分のパスワード管理から見直したい方
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
                共有の前に、アカウントそのものを整理したい方
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
                エクセル等の管理方法と比べて検討したい方
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
