import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/digital-seiri/account-seiri';
const PAGE_TITLE =
  'スマホの会員登録・アカウント整理のやり方｜不要な登録の探し方と退会の全手順';
const PAGE_DESCRIPTION =
  '増えすぎた会員登録・アカウントの整理方法を解説。使っていない登録サービスの洗い出し方（メール検索・パスワード保存一覧・ログイン連携など5つ）から、退会のコツと注意点、残すアカウントの安全な管理まで、この1記事で全手順が分かります。';

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
        url: `${SITE_URL}/images/guide/digital-seiri/account-seiri-main.webp`,
        width: 1600,
        height: 900,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [`${SITE_URL}/images/guide/digital-seiri/account-seiri-main.webp`],
  },
};

const toc = [
  { id: 'risks', label: '放置アカウントの4つのリスク' },
  { id: 'overview', label: '全体像｜整理は3ステップ＋仕上げ' },
  { id: 'step1', label: 'ステップ1｜登録しているサービスを洗い出す' },
  { id: 'step2', label: 'ステップ2｜残す・退会するを仕分ける' },
  { id: 'step3', label: 'ステップ3｜退会する' },
  { id: 'rebound', label: '増やさない習慣｜リバウンドを防ぐ' },
  { id: 'finish1', label: '仕上げ①｜残すアカウントを安全に整える' },
  { id: 'finish2', label: '仕上げ②｜一覧の「在りか」を残す' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ' },
];

const faqs = [
  {
    q: 'アプリを削除すれば、退会したことになりますか？',
    a: 'なりません。アプリの削除は端末から入り口を消すだけで、アカウントと登録情報はサービス側に残り続けます。退会（アカウント削除）の手続きを別途行ってください。',
  },
  {
    q: '退会ページがどうしても見つかりません。',
    a: '「サービス名 退会」で検索しても見つからない場合は、問い合わせフォームやサポート窓口から「退会と個人情報の削除」を依頼できます。退会方法の案内は事業者の義務なので、遠慮なく連絡して大丈夫です。',
  },
  {
    q: '何年も前に登録したサービスの個人情報は、まだ残っているのでしょうか？',
    a: '退会していなければ、残っていると考えるのが安全です。だからこそ、メール検索やパスワード保存一覧で古い登録を見つけ出し、順番に退会していく価値があります。',
  },
  {
    q: 'アカウントはいくつまで減らすべきですか？',
    a: '数に正解はありません。目安は「全部を自分で把握できているか」。把握できる数まで減らし、残りを一覧にして管理できていれば十分です。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      image: `${SITE_URL}/images/guide/digital-seiri/account-seiri-main.webp`,
      mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`,
      datePublished: '2026-06-05',
      dateModified: '2026-06-05',
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
          name: 'デジタル整理術',
          item: `${SITE_URL}/guide/digital-seiri`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: '会員登録・アカウント整理のやり方',
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

export default function AccountSeiriPage() {
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
              <Link href="/guide/digital-seiri" className="text-blue-600 hover:underline">
                デジタル整理術
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">会員登録・アカウント整理のやり方</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ち情報｜デジタル整理術
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          スマホの会員登録・アカウント整理のやり方
          <span className="mt-2 block text-xl font-medium leading-snug text-slate-600 sm:text-2xl">
            不要な登録の探し方と退会の全手順
          </span>
        </h1>

        <p className="mt-7 text-base leading-8 text-slate-700">
          「このサービス、いつ登録したんだっけ」——通販サイト、ポイントサービス、SNS、アプリ、無料会員登録。長年ネットを使っていると、会員登録は気づかないうちに数十〜数百に膨れ上がります。そして、そのほとんどは自分でも思い出せません。
          思い出せない登録は、放っておいても消えません。あなたの名前・メールアドレス・場合によっては住所やカード情報が、使っていないサービスの中に残り続けます。
          この記事では、増えすぎた会員登録・アカウントを整理する手順を、「洗い出す→仕分ける→退会する」の3ステップで解説します。どこに登録したか思い出せない状態からでも大丈夫です。順番にやっていきましょう。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/digital-seiri/account-seiri-main.webp"
            alt="ダイニングテーブルでスマホとパソコンを使い、会員登録しているサービスを整理する女性"
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

        <Section id="risks" title="放置アカウントの4つのリスク">
          <p>整理を始める前に、なぜ放置がよくないのかを確認しておきます。</p>
          <DotList
            items={[
              '情報漏えいの入り口になる：使っていないサービスで漏えいが起きても気づけません。漏れたメールアドレスとパスワードが、他のサービスへの不正ログインに使われることがあります（使い回している場合は特に）',
              '個人情報が残り続ける：退会しない限り、名前・生年月日・住所・購入履歴などはサービス側に保管されたままです。守る対象は、少ないほど安全です',
              'メールのノイズが増え続ける：登録したままのサービスからのお知らせメールが、本当に必要なメールを埋もれさせます',
              '探す・取り戻す時間を奪われ続ける：「IDどれだっけ」「パスワードどれだっけ」——思い出す、探す、再設定する。アカウントが多いほど、この小さな時間とストレスが日常に積み重なっていきます',
            ]}
          />
          <p>
            裏を返せば、アカウントを整理するだけで「漏れる場所」「残る情報」「届くノイズ」が一度に減ります。
          </p>
        </Section>

        <Section id="overview" title="全体像｜整理は3ステップ＋仕上げ">
          <div className="rounded-2xl bg-slate-50 p-6">
            <ol className="space-y-2.5 text-[15px] leading-8 text-slate-800">
              <li>1. 洗い出す——どこに登録しているかを見つける</li>
              <li>2. 仕分ける——残す・退会するを決める</li>
              <li>3. 退会する——不要な登録を消す</li>
            </ol>
          </div>
          <p>
            仕上げに、<strong>残したアカウントを安全に管理する</strong>ところまでやって完了です。
          </p>
        </Section>

        <Section id="step1" title="ステップ1｜登録しているサービスを洗い出す5つの方法">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/digital-seiri/account-seiri-list.webp"
              alt="スマホを見ながら、登録しているサービスをノートに書き出して一覧を作っている手元"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>
            「どこに登録したか覚えていない」が最大の壁です。記憶に頼らず、次の5つの場所から機械的に拾い出します。
          </p>
          <p>
            <strong>① メールを検索する（いちばん確実）</strong>
            <br />
            メールアプリで「登録完了」「ご登録ありがとうございます」「ようこそ」「会員登録」などのキーワードを検索します。過去に登録したサービスからの初回メールが一覧で出てきます。これだけで大半が見つかります。
          </p>
          <p>
            <strong>② ブラウザ・パスワード管理機能の保存一覧を見る</strong>
            <br />
            iPhoneなら設定の「パスワード」、AndroidやChromeなら「Googleパスワードマネージャー」に、保存されたログイン情報の一覧があります。ここには「いつか登録したサービス」がそのまま並んでいます。
          </p>
          <p>
            <strong>③ SNSログイン（連携ログイン）の一覧を見る</strong>
            <br />
            「Googleでログイン」「Appleでサインイン」「LINEでログイン」を使って登録したサービスは、各アカウントの設定画面から連携先の一覧を確認できます（例：Googleアカウント→「データとプライバシー」→サードパーティ製のアプリとサービス）。
          </p>
          <p>
            <strong>④ スマホのアプリ一覧を見る</strong>
            <br />
            アプリの中には、会員登録とセットのものが多くあります。ホーム画面の奥で眠っているアプリは、登録の手がかりです。
          </p>
          <p>
            <strong>⑤ クレジットカードの明細を見る</strong>
            <br />
            有料の登録（月額・年額）は、明細の定期的な引き落としから見つかります。
          </p>
          <p>
            見つけたものは、メモアプリでも紙でもいいので一覧にしておきます。この一覧が、このあとの仕分けと、記事の最後に話す「仕上げ」で効いてきます。
          </p>
        </Section>

        <Section id="step2" title="ステップ2｜残す・退会するを仕分ける">
          <p>一覧ができたら、1つずつ仕分けます。判断基準はシンプルです。</p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <DotList
              items={[
                'この1年で使ったか？——使っていなければ退会候補',
                'また使うとき、再登録できるか？——ほとんどのサービスは数分で再登録できます。「いつか使うかも」は残す理由になりません',
                '残高・ポイント・データはないか？——ある場合は、使い切るか引き継いでから退会へ',
              ]}
            />
          </div>
          <p>
            迷ったら退会で構いません。アカウントはアプリと同じで、必要になればまた作れます。
          </p>
        </Section>

        <Section id="step3" title="ステップ3｜退会する｜手順とつまずきポイント">
          <p>
            <strong>基本は「サービス名 退会」で検索。</strong>{' '}
            退会ページはサイトの奥に置かれていることが多いので、サイト内を探し回るより検索が早道です。
          </p>
          <p>つまずきやすいポイントを先に押さえておきます。</p>
          <DotList
            items={[
              'アプリを消しても退会にはなりません。アプリの削除は「入り口を消す」だけで、アカウントと個人情報はサービス側に残ったままです。退会手続きは別に必要です',
              'メルマガ解除と退会は別物です。配信停止はメールが止まるだけで、登録情報は残ります',
              '退会ページが見つからないときは、問い合わせフォームから「退会と個人情報の削除」を依頼できます。事業者には対応する義務があります',
              'ログインできない（パスワードを忘れた）ときは、先にパスワード再設定をしてから退会します。登録メールアドレス自体が分からない場合は、ステップ1の②（保存一覧）が手がかりになります',
              '機種変更・電話番号の変更でSMS認証が通らないときは、そのサービスの問い合わせ窓口から本人確認の代替手段（登録メールアドレスでの確認、本人確認書類の提出など）を相談します。「認証できないから放置」がいちばん危険です',
            ]}
          />
          <p>
            1日で全部やる必要はありません。「1日5件」のようにペースを決めて消化していくのが、挫折しないコツです。
          </p>
        </Section>

        <Section id="rebound" title="増やさない習慣｜整理後のリバウンドを防ぐ">
          <p>
            退会で減らしても、登録はまた増えます。AIツールをはじめ、新しいサービスは次々と現れ、そのたびに会員登録を求められるからです。整理を一度きりにしないために、2つの習慣だけ持っておきましょう。
          </p>
          <DotList
            items={[
              '登録する前に、ひと呼吸——「ゲスト購入で済まないか」「既に持っているサービスで代用できないか」を考えてから登録します。入り口で1つ断れば、出口で1つ退会する手間が消えます',
              '登録したら、その場で一覧に追記——ステップ1で作った一覧に、サービス名と登録メールアドレスをすぐ書き足します。「あとでまとめて」が、数年後の「どこに登録したか分からない」をつくります',
            ]}
          />
        </Section>

        <Section id="finish1" title="仕上げ①｜残すアカウントを安全に整える">
          <p>退会が済んだら、残したアカウントを守ります。やることは2つだけです。</p>
          <DotList
            items={[
              'パスワードの使い回しをやめる——1か所の漏えいが全部に波及するのを防ぐ、いちばん効果の大きい対策です。パスワード管理アプリを使えば、覚えるのはマスターパスワード1つで済みます',
              '重要なアカウントに二段階認証を設定する——メール・銀行・決済系だけでも設定しておくと、安全性が大きく変わります',
            ]}
          />
          <p>
            ここまでで、アカウント整理そのものは完了です。登録は減り、残ったものは安全に守られ、どこに何があるかの一覧も手元にある。
          </p>
        </Section>

        <Section
          id="finish2"
          title="仕上げ②｜その一覧、あなたしか知らない状態になっていませんか？"
        >
          <p>最後に、一つだけ確認させてください。</p>
          <p>
            ステップ1で作った「自分がどこに登録しているかの一覧」。整理を経て、それはあなたのデジタル生活の正確な地図になりました。でもその地図の存在を知っているのは、おそらくあなた一人です。
          </p>
          <p>
            もし、あなたが急に入院したら。事故や病気で、しばらくスマホを触れなくなったら。家族は、どのサービスに何があるのか、どこから手をつければいいのか、知るすべがありません。ネット銀行やネット証券は紙の通知が届かず、有料サービスは止めない限り請求が続きます。実際、大切な方を亡くした人の約7割が「生前に整理してくれていたら助かった」と答えています（2026年 BlueAdventures調べ）。
          </p>
          <p>
            せっかく作った地図です。
            <strong>
              中身は見せなくていいので、「この地図がある」ということだけ、もしものときに信頼できる人へ届く形にしておく
            </strong>
            ——それが、アカウント整理の本当の仕上げです。
          </p>
          <p>
            整理した一覧を生かして、「どこに何があるか」を残しておく。それだけで、今日の片付けが、家族の安心にまでつながります。
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

        <Section id="summary" title="まとめ｜「洗い出す→仕分ける→退会する」＋一覧を残す">
          <p>
            増えすぎた会員登録・アカウントの整理は、①メール検索などで洗い出す、②1年使ったかで仕分ける、③「サービス名
            退会」で退会する、の3ステップで進めます。残すアカウントはパスワードの使い回しをやめ、二段階認証で守る。
          </p>
          <p>
            そして、整理の過程でできた「どこに登録しているかの一覧」は、中身は伏せたまま、もしものときだけ信頼できる人に届く形で残しておく。ここまでやって、アカウント整理は本当に完成します。
          </p>
          <p>
            スマホ全体を片付けたい方は、
            <Link
              href="/guide/digital-seiri/digital-dansyari"
              className="text-blue-600 hover:underline"
            >
              デジタル断捨離のやり方（全体版）
            </Link>
            もあわせてどうぞ。
          </p>
        </Section>

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            整理した一覧の「在りか」を、もしものときに届く形で残すには
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、整理したデジタル情報を、見られたくないものは伏せたまま、もしものときだけ大切な人へ引き継ぐ準備ができるサービスです。資産の登録・PDF出力・定期リマインドは無料で使えます。
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
                スマホの課金・サブスクを徹底的に見直したい方
              </p>
              <Link
                href="/guide/digital-seiri/sumaho-kakin-seiri"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                スマホの有料サービス・課金を整理する方法 &rsaquo;
              </Link>
            </li>
            <li>
              <p className="text-xs font-medium text-slate-500">
                残すアカウントのパスワードを安全に管理したい方
              </p>
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
