import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/digital-seiri/sumaho-shashin-seiri';
const PAGE_TITLE =
  'スマホの写真整理のやり方｜減らす・分類・バックアップの全手順【iPhone/Android】';
const PAGE_DESCRIPTION =
  'スマホの写真整理のやり方を「減らす→分類→バックアップ→溜めない」の手順で解説。iPhone・Android両対応、無料の容量や重複削除のコツも。最後に、多くの人が見落とす「整理した写真を、もしものとき家族が取り出せるか」という視点まで。';

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
        url: `${SITE_URL}/images/guide/digital-seiri/sumaho-shashin-main.webp`,
        width: 1600,
        height: 900,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [`${SITE_URL}/images/guide/digital-seiri/sumaho-shashin-main.webp`],
  },
};

const toc = [
  { id: 'overview', label: '全体像｜写真整理は4ステップ' },
  { id: 'step1', label: 'ステップ1｜まず減らす' },
  { id: 'step2', label: 'ステップ2｜分類する' },
  { id: 'step3', label: 'ステップ3｜バックアップする' },
  { id: 'step4', label: 'ステップ4｜溜めない習慣' },
  { id: 'blindspot', label: '整理した写真、家族は取り出せますか？' },
  { id: 'finish', label: '仕上げ｜思い出こそ「在りか」を残す' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ' },
];

const faqs = [
  {
    q: '写真は何枚まで減らせばいいですか？',
    a: '枚数に正解はありません。目安は「探したいときに見つけられるか」。アルバムと検索で目的の1枚にたどり着けるなら、無理に減らさなくて大丈夫です。',
  },
  {
    q: '無料の容量だけで足りますか？',
    a: '写真が数千枚あると、Googleフォトの15GBやiCloudの5GBはいずれ足りなくなります。まず不要な写真を減らし、それでも足りなければ有料プランを検討、の順がおすすめです（2026年6月時点の無料枠）。',
  },
  {
    q: '間違えて大事な写真を消してしまいました。',
    a: 'iPhoneなら「最近削除した項目」に30日間残っているので、そこから復元できます。Googleフォトにもゴミ箱があり、一定期間は復元可能です。慌てず確認してください。',
  },
  {
    q: 'クラウドにバックアップしておけば、家族も見られますか？',
    a: 'そのままでは見られません。クラウドは本人のアカウントなので、家族と見たい写真は「共有ライブラリ」や「パートナー共有」を設定する必要があります。アカウント自体の在りかは、もしものときに届く形で別に残しておくと安心です。',
  },
  {
    q: '「在りかを残す」とは具体的にどうすることですか？',
    a: '「写真はGoogleフォトに保存」「ログインはこのメールアドレス」といった“どこに何があるか”の情報を、引き継ぎ用のサービス（当サイトを運営する「つぎの手ナビ デジタル資産」など）に登録しておくことです。写真そのものをアップロードするのではなく、保存先やアカウントの場所の手がかりだけを預けます。もしものときに、それが指定した家族へ届きます。',
  },
  {
    q: '「つぎの手ナビ」に在りかを登録したら、今すぐ家族に見られてしまいますか？',
    a: 'いいえ、見られません。日常の共有（共有ライブラリなど）とは違い、つぎの手ナビに登録した在りかは、あなたが元気な間は誰にも見えません。入院や事故などの「もしものとき」に、書類確認などの手続きを経てはじめて、指定した人にだけ届く仕組みです。生前のプライバシーは守られます。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      image: `${SITE_URL}/images/guide/digital-seiri/sumaho-shashin-main.webp`,
      mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`,
      datePublished: '2026-06-07',
      dateModified: '2026-06-07',
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
          name: 'スマホの写真整理のやり方',
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

export default function SumahoShashinSeiriPage() {
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
            <li className="text-slate-700">スマホの写真整理のやり方</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ち情報｜デジタル整理術
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          スマホの写真整理のやり方
          <span className="mt-2 block text-xl font-medium leading-snug text-slate-600 sm:text-2xl">
            減らす・分類・バックアップの全手順【iPhone/Android】
          </span>
        </h1>

        <p className="mt-7 text-base leading-8 text-slate-700">
          気づけばスマホの写真は数千枚。容量はいっぱい、見たい1枚はなかなか見つからない——そんな状態になっていませんか。
          写真整理は、やみくもに始めると挫折します。コツは「①減らす→②分類→③バックアップ→④溜めない」の順で進めること。この記事では、iPhone・Androidの両方に対応した手順を、迷わないように解説します。最後に、ほとんどの人が見落とす「
          <strong>整理したその写真、いざというとき家族は取り出せるのか</strong>
          」という視点まで。数千枚あっても大丈夫。この記事を読めば迷わない手順がわかり、まずは30分、スマホを開くのが楽しみになります。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/digital-seiri/sumaho-shashin-main.webp"
            alt="リビングのソファでスマホの写真アプリを開き、たまった写真を整理している人"
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

        <Section id="overview" title="全体像｜写真整理は4ステップ">
          <div className="rounded-2xl bg-slate-50 p-6">
            <ol className="space-y-2.5 text-[15px] leading-8 text-slate-800">
              <li>1. 減らす——不要な写真を消す</li>
              <li>2. 分類する——見たい1枚にすぐ届くようにする</li>
              <li>3. バックアップする——思い出を安全に保つ＆端末の容量を空ける</li>
              <li>4. 溜めない——これ以上散らからない習慣をつくる</li>
            </ol>
          </div>
          <p>上から順にやれば、途中で迷いません。</p>
        </Section>

        <Section id="step1" title="ステップ1｜まず減らす">
          <p>
            整理は「減らす」から。ここで一気に身軽になります。次のものは、まとめて消して問題ないことが多いです。
          </p>
          <DotList
            items={[
              'ピンボケ・手ブレ写真',
              '同じ構図の連写（ベスト1枚だけ残す）',
              'スクリーンショット（用が済んだもの）',
              '撮ったまま忘れたメモ代わりの写真、保存したミーム画像',
              '重複している写真',
            ]}
          />
          <p>
            <strong>重複や似た写真は、自動でまとめると速い</strong>
            です。iPhoneの「写真」アプリには似た写真を集める「重複」項目があり、まとめて結合できます。Androidや各種整理アプリにも、AIで重複を検出して一括削除する機能があります。
          </p>
          <p>
            <strong>消す前に知っておくと安心</strong>
            ：iPhoneで削除した写真は、すぐ消えるのではなく「最近削除した項目」に
            <strong>30日間</strong>
            残り、その間は復元できます（30日経過で完全削除。2026年6月時点・Apple公式）。だから「間違えて消したら？」を恐れず、テンポよく進めて大丈夫です。
          </p>
        </Section>

        <Section id="step2" title="ステップ2｜分類する">
          <p>
            減らしたら、見たい写真にすぐ届くように分けます。ポイントは、
            <strong>フォルダで階層を作り込むより、アルバムとタグ・検索を使う</strong>こと。
          </p>
          <DotList
            items={[
              'アルバムを作る：「旅行」「子ども」「行事」など、後で探したい単位で。多すぎると逆に探しにくいので、大きめのくくりで十分です',
              '年→月→イベントの順でゆるく分けると、時系列でたどりやすくなります',
              '検索を活用する：写真アプリは「海」「ケーキ」「2024」などのキーワードや人物で検索できます。全部を手で分類しなくても、検索で十分見つかるのが今の写真アプリの強みです',
            ]}
          />
          <p>
            完璧な分類を目指さないのがコツ。「探せればいい」くらいの気楽さが、続ける秘訣です。
          </p>
        </Section>

        <Section id="step3" title="ステップ3｜バックアップする（と、容量を空ける）">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/digital-seiri/sumaho-shashin-step.webp"
              alt="スマホとノートパソコンを並べ、写真をクラウドにバックアップしながら整理している手元"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>
            写真整理でいちばん大事なのが、ここです。
            <strong>端末が壊れたり失くしたりしても思い出を失わない</strong>
            ために、クラウドにバックアップします。同時に、端末から移せば容量も空きます。
          </p>
          <p>主な選択肢（2026年6月時点）：</p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <DotList
              items={[
                'Googleフォト：1つのGoogleアカウントにつき無料で15GB（Gmail・Googleドライブと共有）。超えると Google One（有料・100GB〜）で増量。iPhone・Android どちらでも使えます',
                'iCloud写真：Appleの標準。無料は5GBと少なめで、写真が多いと iCloud+（有料・50GB〜）が現実的。iPhoneと相性がよい',
                'Amazon Photos：プライム会員は写真を容量無制限で保存できる（動画は別枠）',
              ]}
            />
          </div>
          <p>
            <strong>端末の容量を空ける方法は、使っているアプリで少し違います。</strong>{' '}
            ここを間違えると、クラウドの写真まで消してしまうことがあるので、アプリ別に押さえておきましょう。
          </p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <DotList
              items={[
                'iPhone（iCloud写真）の場合：「iCloud写真」をオンにしたまま、設定の「写真」で「iPhoneのストレージを最適化」を選びます。すると写真はクラウドに保存され、端末内には軽い縮小版だけが残るので、容量が自動で大きく空きます。※iCloud写真をオンにしているときに端末側で写真を削除すると、クラウドからも消えるので注意してください',
                'Googleフォト・Amazon Photosの場合：先にクラウドへ自動保存（バックアップ）された状態で、アプリ内の「デバイスから削除（空き容量を増やす）」を押すと、クラウドに残したまま端末の写真だけを安全に消せます',
              ]}
            />
          </div>
          <p>
            どちらも狙いは同じ「思い出はクラウドで守り、端末は軽く保つ」こと。アプリに合った手順を使えば、安全に容量を空けられます。
          </p>
        </Section>

        <Section id="step4" title="ステップ4｜溜めない習慣">
          <p>
            一度整理しても、写真は毎日増えます。リバウンドを防ぐ習慣を2つだけ。
          </p>
          <DotList
            items={[
              'スキマ時間に都度：電車の待ち時間や休憩中に、その日撮った失敗写真を消すだけでも溜まりません。オフラインでもできます',
              '月1の見直し：月末に一度、連写やスクショをまとめて整理。「大掃除」を小さく分割すると続きます',
            ]}
          />
        </Section>

        <Section id="blindspot" title="整理した写真、いざというとき家族は取り出せますか？">
          <p>
            ここまでで、写真はスッキリ片付き、クラウドにも安全にバックアップされたはずです。でも、最後に一つだけ考えてほしいことがあります。
          </p>
          <p>
            <strong>そのクラウドは、あなたのアカウントです。</strong>
          </p>
          <p>
            GoogleフォトもiCloudも、ログインできるのはあなただけ。もしあなたが急に入院したら、事故や病気でスマホを触れなくなったら——家族は、何千枚もの思い出に、一枚もたどり着けません。きれいに整理してまとめたからこそ、その写真は「あなたのアカウントの中だけ」に最適化されています。これは、整理が上手な人ほど起きやすい盲点です。
          </p>
          <p>
            写真は、資産や契約とは違います。家族が<strong>いちばん見たいもの</strong>
            かもしれません。それなのに、本人しか開けない場所にしまわれている——ここに、もう一手かける価値があります。
          </p>
        </Section>

        <Section id="finish" title="仕上げ｜思い出こそ「在りか」を残す">
          <p>やることは2つです。</p>
          <p>
            <strong>① 日常は、家族と見られるようにしておく</strong>
            <br />
            iPhoneの「共有ライブラリ」や、Googleフォトの「パートナー共有」を設定すると、選んだ写真を家族と自動で共有できます。日常の家族写真は、ひとりで抱え込まず、見られる形にしておくと安心です。
          </p>
          <p>
            <strong>② もしものときは、在りかが届くようにしておく</strong>
            <br />
            共有したくない写真や、アカウント自体の在りかは、生きている間は見せなくていい。けれど「どこに、何があるか」という在りかだけを、もしものときだけ信頼できる人に届く形にしておく。誰に見せるか・見せないかは、人ごとに選べます。
          </p>
          <p>
            整理して終わり、ではなく、整理した思い出が<strong>ちゃんと家族に渡る</strong>
            ところまで。そこまでやって、写真整理は本当に完成します。
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

        <Section id="summary" title="まとめ｜減らして・分類して・バックアップ、最後に在りかを残す">
          <p>
            スマホの写真整理は、①不要を減らす、②アルバムと検索で分類、③クラウドにバックアップ（容量を空ける手順はアプリで使い分け）、④スキマ時間で溜めない——この4ステップで進めれば、数千枚あっても迷わず片付きます。
          </p>
          <p>
            そして仕上げは、整理した思い出を「家族が見られる形」「もしものとき在りかが届く形」にしておくこと。きれいに片付けた写真が、ちゃんと大切な人に渡るところまでやって、写真整理は完成します。
          </p>
          <p>
            スマホ全体を片付けたい方は
            <Link
              href="/guide/digital-seiri/digital-dansyari"
              className="text-blue-600 hover:underline"
            >
              デジタル断捨離のやり方
            </Link>
            、アカウントの在りかを守るパスワード管理は
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
            整理した思い出を、もしものときに届く形で残すには
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、整理した写真やアカウントの“在りか”を、もしものときだけ大切な人へ届ける準備ができるサービスです。資産の登録・PDF出力・定期リマインドは無料で使えます。
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
                写真以外もまとめてスマホを片付けたい方
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
                写真や思い出を守る土台＝パスワードを安全にしたい方
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
