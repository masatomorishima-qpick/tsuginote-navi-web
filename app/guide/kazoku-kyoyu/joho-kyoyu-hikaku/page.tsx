import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/kazoku-kyoyu/joho-kyoyu-hikaku';
const PAGE_TITLE =
  'パスワードや大事な情報、エクセル管理は危険？家族に残す・共有する方法の比較';
const PAGE_DESCRIPTION =
  'パスワードや大事な情報をエクセル・スプレッドシートで管理するのは危険？という疑問に中立で答えます。エクセル／スプレッドシート／パスワード管理アプリ／専用サービスの4つを正直に比較し、自分に合う方法を選ぶための判断軸（時間の制御・暗号化・本体ロック・情報の鮮度）まで。';

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
        url: `${SITE_URL}/images/guide/kazoku-kyoyu/joho-kyoyu-hikaku-main.webp`,
        width: 1600,
        height: 900,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [`${SITE_URL}/images/guide/kazoku-kyoyu/joho-kyoyu-hikaku-main.webp`],
  },
};

const toc = [
  { id: 'excel', label: 'エクセル／スプレッドシート管理の長所と短所' },
  { id: 'compare', label: '4つの方法を中立比較' },
  { id: 'axis', label: '自分に合う方法を選ぶ4つの判断軸' },
  { id: 'tradeoff', label: 'トレードオフを正直に' },
  { id: 'pc', label: 'パソコンが前提、という見落とし' },
  { id: 'summary', label: 'まとめ' },
  { id: 'faq', label: 'よくある質問' },
];

const faqs = [
  {
    q: 'エクセルでのパスワード管理は、絶対にダメですか？',
    a: '絶対にダメということはありません。ファイルにパスワードをかけ、共有範囲を限定し、定期的に更新すれば、手軽な方法として機能します。ただしエクセルの暗号化は強固ではなく、共有時の漏えいや「もしものときの渡し方」に弱点があるため、重視する軸によっては別の方法が向きます。',
  },
  {
    q: 'スプレッドシートを家族と共有しておけば、もしものとき安心ですか？',
    a: '「もしものときに家族がすぐアクセスできる」という点では有効です。一方で、共有した瞬間から相手は中身を常に見られる状態になります。「生きている間は見せたくない」情報がある場合は、時間の制御ができる方法を検討してください。',
  },
  {
    q: 'パスワード管理アプリと専用サービスは何が違いますか？',
    a: 'パスワード管理アプリは「自分が日常使うパスワードを安全に保管・入力する」ためのもの。専用サービス（つぎの手ナビ等）は「もしものときに、選んだ人へ情報を引き継ぐ」ことに特化しています。目的が違うので、両方を併用する人もいます。',
  },
  {
    q: '結局、何を基準に選べばいいですか？',
    a: '本文の4つの判断軸（時間の制御・暗号化・本体の鍵・情報の鮮度）のうち、自分がいちばん大事にするものから選ぶのがおすすめです。「すぐ渡る手軽さ」なら表計算、「生前は秘匿で、もしものときだけ安全に渡す」なら専用サービス、と整理できます。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      image: `${SITE_URL}/images/guide/kazoku-kyoyu/joho-kyoyu-hikaku-main.webp`,
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
          name: '家族間の情報共有',
          item: `${SITE_URL}/guide/kazoku-kyoyu`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'パスワード・情報管理の方法の比較',
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

const compareRows = [
  {
    method: 'エクセル（PC保存）',
    cost: '無料',
    crypto: '弱い／なし',
    timing: '✕（手渡し前提）',
    device: '△（PCが開けば）',
    fresh: '△（手動）',
  },
  {
    method: 'スプレッドシート（共有）',
    cost: '無料',
    crypto: '通信は暗号化／中身は共有相手に見える',
    timing: '✕（共有すると今すぐ全部見える）',
    device: '✕（対象外）',
    fresh: '○（編集しやすい）',
  },
  {
    method: 'パスワード管理アプリ',
    cost: '無料〜有料',
    crypto: '強い（暗号化保管）',
    timing: '△（共有機能はあるが原則"今"共有）',
    device: '✕（本体の鍵は引き継げない）',
    fresh: '○',
  },
  {
    method: '専用サービス（つぎの手ナビ等）',
    cost: '月110円〜（無料枠あり）',
    crypto: '強い（端末内で暗号化）',
    timing: '○（生前は非開示、もしものときだけ届く）',
    device: '○（本体の鍵も託せる）',
    fresh: '○（生きた台帳）',
  },
];

export default function JohoKyoyuHikakuPage() {
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
            <li className="text-slate-700">パスワード・情報管理の方法の比較</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ち情報｜家族間の情報共有
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          パスワードや大事な情報、エクセル管理は危険？
          <span className="mt-2 block text-xl font-medium leading-snug text-slate-600 sm:text-2xl">
            家族に残す・共有する方法の比較
          </span>
        </h1>

        <p className="mt-7 text-base leading-8 text-slate-700">
          パスワードや口座、契約の情報を、エクセルやスプレッドシートで一覧にしている人は多いはずです。特にNISAなどのネット証券、ネット銀行、サブスク、仮想通貨など、郵送物の届かないデジタル資産が増えるほど、無料で手軽に一覧化できる表計算は便利です。一方で、「これって危なくない？」「もしものとき、家族にちゃんと渡るの？」と気になったことはないでしょうか。
          結論から言うと、
          <strong>どの方法にも長所と短所があり、「自分が何を重視するか」で選ぶのが正解</strong>
          です。この記事では、エクセル／スプレッドシート／パスワード管理アプリ／専用サービスの4つを、否定せず中立に比較します。そのうえで、家族に大事な情報を残す・引き継ぐときに見るべき「判断軸」を整理します。読み終えるころには、自分に合う方法が決められるはずです。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/kazoku-kyoyu/joho-kyoyu-hikaku-main.webp"
            alt="パソコンとスマホを前に、パスワードや大事な情報をどの方法で管理・家族に残すか比較検討している人"
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

        <Section id="excel" title="まず、エクセル／スプレッドシート管理の長所と短所">
          <p>否定から入らないために、まず正直なところを書きます。</p>
          <p>
            <strong>長所（だから多くの人が使っている）</strong>
          </p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <DotList
              items={[
                '無料で、追加のアプリもいらない',
                '表の形で見やすく、自由にカスタマイズできる',
                'スプレッドシートなら、リンク1つで家族とすぐ共有できる',
              ]}
            />
          </div>
          <p>
            <strong>短所（「危険」と言われる理由）</strong>
          </p>
          <div className="rounded-2xl bg-rose-50 p-6">
            <DotList
              items={[
                '暗号化が弱い／していない：エクセルのファイルパスワードは強固な暗号化ではなく、解除ツールも出回っています。スプレッドシートを「リンクを知る全員が閲覧可」にしていると、URLが漏れただけで中身が見られます',
                '共有時の漏えいリスク：メールやチャットでファイルを送ると、誤送信や共有範囲の設定ミスで、第三者に渡ることがあります',
                '更新が止まりやすい：作った瞬間から情報は古くなります。手動更新が前提なので、気づけば何年も前のまま、ということが起きます',
                '「今すぐ・ずっと・全部見える」しかできない：共有すると、相手は今この瞬間から、ずっと、全部を見られます。「生きている間は見せず、もしものときだけ」という渡し方ができません',
              ]}
            />
          </div>
          <p>
            特に最後の点は、家族に「もしものための情報」を残すときに、見落とされがちな弱点です。
          </p>
        </Section>

        <Section id="compare" title="4つの方法を中立比較">
          <p>家族に大事な情報を残す・共有する主な方法を、フラットに並べます。</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-[13px] leading-6">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-900">
                  <th className="p-2 font-semibold">方法</th>
                  <th className="p-2 font-semibold">費用</th>
                  <th className="p-2 font-semibold">暗号化</th>
                  <th className="p-2 font-semibold">生前は見せず“もしものときだけ”渡せるか</th>
                  <th className="p-2 font-semibold">本体（スマホ・パソコン）の鍵</th>
                  <th className="p-2 font-semibold">更新のしやすさ</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((r) => (
                  <tr key={r.method} className="border-b border-slate-200 align-top text-slate-700">
                    <td className="p-2 font-semibold text-slate-900">{r.method}</td>
                    <td className="p-2">{r.cost}</td>
                    <td className="p-2">{r.crypto}</td>
                    <td className="p-2">{r.timing}</td>
                    <td className="p-2">{r.device}</td>
                    <td className="p-2">{r.fresh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-500">
            ※ どれが「正解」ということはありません。重視する軸が違うだけです。次でその軸を整理します。
          </p>
        </Section>

        <Section id="axis" title="自分に合う方法を選ぶ4つの判断軸">
          <p>「どれが良いか」は、次の4つのうち何を重視するかで決まります。</p>
          <p>
            <strong>① 時間の制御｜生きている間は見せず、もしものときだけ渡せるか</strong>
            <br />
            家族に残す情報には、「今は見られたくないが、もしものときは渡したい」ものがあります。スプレッドシートの共有は「今すぐ・ずっと・全部見える」しかできません。時間の制御（生前は非開示→もしものときに引き継ぐ）が必要なら、その仕組みを持つ方法を選ぶ必要があります。
          </p>
          <p>
            <strong>② 暗号化の安全性｜中身が守られるか</strong>
            <br />
            パスワードや口座情報は、漏れると実害が大きい情報です。平文のメモやファイルパスワード頼みより、暗号化して保管できる方法のほうが安全です。「クラウドに置く＝危険」ではなく、「暗号化されているか」で判断します。
          </p>
          <p>
            <strong>③ 本体の鍵｜スマホ・パソコンが開かないときどうするか</strong>
            <br />
            大切な方の死後にデジタルで困った経験は約6割、その最多は「スマホ・パソコンのパスワードが分からない」ことでした（2026年
            BlueAdventures調べ）。本体のロックが開かなければ、中のエクセルにもアプリにもたどり着けません。
            <strong>本体そのものの鍵を引き継げるか</strong>
            は、見落とされがちですが決定的な軸です。
          </p>
          <p>
            <strong>④ 情報の鮮度｜更新が止まらないか</strong>
            <br />
            表計算は作った瞬間から古くなります。引っ越し・口座変更・パスワード更新のたびに直さないと、いざというとき役に立ちません。更新が続く仕組み（生きた台帳）かどうかも、長く使うなら重要です。
          </p>
        </Section>

        <Section id="tradeoff" title="トレードオフを正直に">
          <p>
            ここは公平に書きます。
            <strong>無料の手軽さ・即時性には、専用サービスにない強みがあります。</strong>
          </p>
          <p>
            たとえば、家族と共有済みのスプレッドシートは、
            <strong>もしものときに家族が“即座に”アクセスできます</strong>
            。一方、つぎの手ナビのような専用サービスは、なりすましや誤開示を防ぐために、書類確認や一定の異議申立期間といった手続きを経てから開示されます。
            <strong>「すぐ渡る」ことを最優先するなら、共有済みのスプレッドシートのほうが速い</strong>
            ——これは事実です。
          </p>
          <p>つまり選択は、こう整理できます。</p>
          <DotList
            items={[
              '手軽さ・即時性を最優先するなら：無料の表計算（ただし暗号化と共有範囲に注意）',
              '生前の秘匿性・安全性・本体の鍵まで含めて備えるなら：専用サービス',
            ]}
          />
          <p>
            どちらが正しいではなく、<strong>あなたが何を大事にするか</strong>です。
          </p>
        </Section>

        <Section id="pc" title="パソコンが前提、という見落とし">
          <p>
            もう一つ、表計算管理には前提があります。それは「パソコンが使えること」。総務省の調査では、パソコンの世帯保有率は66.4%、個人の利用率は46.8%（スマホは74.4%）で、年代によって差があります（総務省 通信利用動向調査 2024年）。家族の中に、もしものとき
            <strong>パソコンを開いて表計算を扱える人がいるとは限りません</strong>
            。仮にスマホでそのファイルを開けたとしても、画面が小さく、膨大なIDやパスワードが並んだ表は非常に見づらく、いざというとき必要な1行を探すのに迷子になりがちです。スマホだけで完結し、必要な情報にたどり着きやすい方法かどうかも、家族構成によっては判断材料になります。
          </p>
        </Section>

        <Section id="summary" title="まとめ｜「手軽さ・即時性」か「秘匿性・安全性」かで選ぶ">
          <p>
            パスワードや大事な情報を家族に残す・共有する方法は、エクセル／スプレッドシート／パスワード管理アプリ／専用サービスがあり、どれにも長所と短所があります。選ぶときの軸は4つ——①生前は見せずもしものときだけ渡せるか、②暗号化されて安全か、③本体（スマホ・パソコン）の鍵を引き継げるか、④更新が止まらないか。
          </p>
          <p>
            <strong>無料の手軽さと即時性</strong>を取るなら表計算、
            <strong>生前の秘匿性・安全性と、本体の鍵まで含めた備え</strong>
            を取るなら専用サービス、というトレードオフで考えると、自分に合う方法が見えてきます。
          </p>
          <p>
            「生きている間は誰にも見せず、もしものときだけ、選んだ人へ届く」形を重視する方は、その仕組みを持つ
            <Link href="/" className="text-blue-600 hover:underline">
              つぎの手ナビ デジタル資産
            </Link>
            も選択肢の一つです。パスワードそのものの管理は
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

        <section className="mt-14 rounded-3xl bg-slate-50 p-8 text-center sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">
            「生前は見せず、もしものときだけ渡す」を選びたい方へ
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、パスワードを端末内で暗号化して保管し、生きている間は誰にも見せず、もしものときだけ選んだ人へ引き継ぐ準備ができるサービスです。資産の登録・PDF出力・定期リマインドは無料で使えます。
          </p>
          <div className="mt-6">
            <Link
              href="/signup?next=/digital"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              無料で始める（新規登録）
            </Link>
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
                自分のパスワードを安全に管理する方法から知りたい方
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
                保険や契約を一覧で整理したい方
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
      </div>

      <SiteFooter />
    </main>
  );
}
