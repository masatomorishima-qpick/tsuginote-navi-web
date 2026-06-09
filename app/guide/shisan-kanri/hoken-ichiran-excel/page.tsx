import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/shisan-kanri/hoken-ichiran-excel';
const PAGE_TITLE =
  '保険契約の一覧表をエクセルで作る方法｜無料テンプレート付き・書く項目はこれだけ';
const PAGE_DESCRIPTION =
  '保険契約の一覧表をエクセルで作る方法を解説。そのまま使える無料テンプレート（登録不要）付き。書くべき項目と書いてはいけないもの、保険証券や控除証明書からの拾い方、年1回の見直しのコツまで、この1記事で完成します。';

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
        url: `${SITE_URL}/images/guide/shisan-kanri/hoken-ichiran-main.webp`,
        width: 1600,
        height: 900,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [`${SITE_URL}/images/guide/shisan-kanri/hoken-ichiran-main.webp`],
  },
};

const toc = [
  { id: 'download', label: 'まず、テンプレートをダウンロード' },
  { id: 'items', label: '一覧表に書く項目と、その理由' },
  { id: 'ng', label: '書いてはいけないもの' },
  { id: 'howto', label: '作り方｜情報は3か所から拾う' },
  { id: 'review', label: '作ったあと｜年1回の見直し' },
  { id: 'blindspot', label: 'その一覧表、家族は「在りか」を知っていますか？' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ' },
];

const faqs = [
  {
    q: 'エクセルではなく紙のノートでもいいですか？',
    a: '構いません。大切なのは「1か所にまとまっていること」と「保管場所が決まっていること」です。ただし書き直しや合計計算はエクセルのほうがラクで、年1回の更新が続きやすい傾向があります。',
  },
  {
    q: '家族の分（配偶者・親の保険）も同じシートに書くべきですか？',
    a: '同じファイルで構いませんが、契約者ごとにシートを分けると混ざりません。親の保険は、把握できている範囲で書いておくだけでも、いざというときの助けになります。',
  },
  {
    q: 'テンプレートに勤務先の団体保険や共済も書いていいですか？',
    a: 'ぜひ書いてください。団体保険・共済は証券が手元にないことが多く、忘れられやすい代表格です。給与明細の控除欄が手がかりになります。',
  },
  {
    q: '一覧表はクラウド（Googleドライブ等）に保存しても大丈夫ですか？',
    a: 'パスワードや暗証番号を書いていなければ、実用上は問題ありません。ただし共有設定を「自分のみ」にしておくこと、そしてその保存場所を家族がたどれる形にしておくことが大切です。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      image: `${SITE_URL}/images/guide/shisan-kanri/hoken-ichiran-main.webp`,
      mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`,
      datePublished: '2026-06-06',
      dateModified: '2026-06-06',
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
          name: '資産・お金の管理',
          item: `${SITE_URL}/guide/shisan-kanri`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: '保険契約の一覧表をエクセルで作る方法',
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

export default function HokenIchiranExcelPage() {
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
              <Link href="/guide/shisan-kanri" className="text-blue-600 hover:underline">
                資産・お金の管理
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">保険契約の一覧表をエクセルで作る</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ち情報｜資産・お金の管理
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          保険契約の一覧表をエクセルで作る方法
          <span className="mt-2 block text-xl font-medium leading-snug text-slate-600 sm:text-2xl">
            無料テンプレート付き・書く項目はこれだけ
          </span>
        </h1>

        <p className="mt-7 text-base leading-8 text-slate-700">
          生命保険、医療保険、がん保険、火災保険、自動車保険——気づけば家庭の保険は数件〜十数件になります。「何に、いくら払っているか」をすぐ答えられる人は、ほとんどいません。
          保険契約の一覧表を一度作ると、毎月の保険料の合計が見え、重複や入りすぎに気づけて、更新や満期の管理もラクになります。この記事では、
          <strong>そのまま使えるエクセルのテンプレート（無料・登録不要）</strong>
          と、書くべき項目・書いてはいけないもの・作り方のコツを順番に解説します。30分あれば、わが家の保険の全体像が1枚にまとまります。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/shisan-kanri/hoken-ichiran-main.webp"
            alt="ダイニングテーブルでノートパソコンと書類を使い、保険契約の一覧表を作っている様子"
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

        <Section id="download" title="まず、テンプレートをダウンロード">
          <div className="rounded-2xl bg-emerald-50 p-6 text-center">
            <p className="text-[15px] leading-8 text-slate-700">
              記入例2行入り・月額合計は自動計算。登録やメールアドレスの入力は不要です。
            </p>
            <p className="mt-4">
              <a
                href="/downloads/hoken-keiyaku-ichiran.xlsx"
                download
                className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                保険契約一覧表テンプレート（Excel）を無料ダウンロード
              </a>
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Excelのほか、Googleスプレッドシートや無料のオフィスソフトでも開けます。
            </p>
          </div>
        </Section>

        <Section id="items" title="一覧表に書く項目と、その理由">
          <p>
            テンプレートの列は、次の考え方で選んであります。多すぎると挫折するので、「もしものとき・見直しのときに本当に使う情報」だけに絞っています。
          </p>
          <DotList
            items={[
              '保険の種類・保険会社・商品名——どの保険かを特定する基本情報',
              '契約者・被保険者・受取人——誰の契約で、誰のための保障か。家族で複数契約があると、ここが意外と混ざります',
              '保険料（月額換算）——年払いのものも月額に換算して書くと、家計に占める保険の合計が一目で分かります（テンプレートは自動合計）',
              '払込方法——どの口座・カードから引き落とされているか。家計の見直しや、口座を整理するときに必要です',
              '保険期間・満期——更新型は更新時に保険料が上がることが多いので、時期の把握が大切',
              '証券番号と、証券・書類の保管場所——問い合わせ・手続きのときに最初に聞かれる情報と、その現物の場所',
              '連絡先（代理店・担当者）——いざというとき「どこに電話すればいいか」',
              'メモ・引き継ぎの希望——特約の内容や、「この保険はこうしてほしい」という意思',
            ]}
          />
        </Section>

        <Section id="ng" title="書いてはいけないもの">
          <p>
            一覧表は便利な反面、書く内容を間違えると危険にもなります。
            <strong>ログインID・パスワード・暗証番号は、エクセルに書かないでください。</strong>{' '}
            エクセルは暗号化されていない平文のファイルです。パソコンの紛失や誤送信、クラウドの共有設定ミスで、そのまま漏えいします。
          </p>
          <p>
            パスワード類は、暗号化された専用の仕組みで管理するのが安全です（詳しくは
            <Link
              href="/guide/password-kanri/sumaho-password"
              className="text-blue-600 hover:underline"
            >
              スマホのパスワード管理
            </Link>
            で解説しています）。一覧表には「どの保険があるか」まで、鍵は別の金庫に——この分担が基本です。
          </p>
        </Section>

        <Section id="howto" title="作り方｜情報は3か所から拾う">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src="/images/guide/shisan-kanri/hoken-ichiran-step.webp"
              alt="保険証券や控除証明書などの書類を手に取り、情報を確認している手元"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p>
            「契約内容を覚えていない」状態からでも作れます。次の3か所を見れば、ほぼ全部そろいます。
          </p>
          <p>
            <strong>① 保険証券（または契約内容のお知らせ）</strong>
            <br />
            商品名・証券番号・保障内容・期間がすべて載っています。見つからない保険は、それ自体が「保管場所を決めるべきもの」です。
          </p>
          <p>
            <strong>② 生命保険料控除証明書（毎年10〜11月に届くハガキ）</strong>
            <br />
            年末調整・確定申告用に各社から届くので、「入っている保険会社の一覧」として使えます。1年分を集めれば、契約の漏れチェックになります。
          </p>
          <p>
            <strong>③ 口座・クレジットカードの明細</strong>
            <br />
            毎月・毎年の保険料の引き落としから、忘れている契約が見つかることがあります。共済や勤務先のグループ保険など、証券が手元にないものもここで拾えます。
          </p>
          <p>
            埋まらない欄があっても大丈夫です。まず分かるところまで書き、保険会社のマイページやコールセンターで確認しながら埋めていけば完成します。
          </p>
        </Section>

        <Section id="review" title="作ったあと｜年1回の見直しで「生きた一覧」に">
          <p>
            一覧表は作って終わりではなく、年1回の更新で価値が出ます。おすすめは
            <strong>控除証明書が届く10〜11月</strong>
            。手元に各社のハガキが揃うので、答え合わせが簡単です。
          </p>
          <p>見直しのチェックポイントは3つだけ：</p>
          <div className="rounded-2xl bg-slate-50 p-6">
            <DotList
              items={[
                '月額合計は家計に対して適正か（一般に、入りすぎに気づくケースが多いです）',
                '同じ保障が重複していないか（医療特約と単体の医療保険、など）',
                '受取人・住所・引き落とし口座は最新か（結婚・引っ越し・口座整理のあとは特に）',
              ]}
            />
          </div>
        </Section>

        <Section id="blindspot" title="その一覧表、家族は「在りか」を知っていますか？">
          <p>
            ここまでで、わが家の保険は1枚に整理されました。最後に、一つだけ確認させてください。
          </p>
          <p>
            <strong>その一覧表の存在と保存場所を、家族は知っているでしょうか。</strong>
          </p>
          <p>
            保険は「もしものとき」のための備えです。でも、もしあなたが急に入院したら、家族が最初に困るのは「そもそも何の保険に入っているか分からない」こと。せっかく作った一覧表も、パソコンの中のどこかに眠っていたら、家族にとっては存在しないのと同じです。実際、大切な方を亡くした人の約7割が「生前に整理してくれていたら助かった」と答えています（2026年
            BlueAdventures調べ）。
          </p>
          <p>
            かといって、ファイルの中身を今すぐ家族に全部見せる必要はありません。
            <strong>
              「保険の一覧がここにある」という在りかだけを、もしものときに信頼できる人へ届く形にしておく
            </strong>
            ——それで十分です。今日作った一覧表を、家族に届く備えに変えるところまでやって、保険の整理は本当に完成します。
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

        <Section id="summary" title="まとめ｜30分で作って、年1回更新して、在りかを残す">
          <p>
            保険契約の一覧表は、①テンプレートをダウンロードし、②保険証券・控除証明書・口座明細の3か所から情報を拾って埋め、③パスワード類は書かない——この手順で30分あれば作れます。作ったら年1回（控除証明書の季節）に見直して、生きた一覧に育てていく。
          </p>
          <p>
            そして仕上げは、一覧表の「在りか」を、もしものときだけ信頼できる人に届く形で残しておくこと。それで、保険という備えが本当に家族を守るものになります。
          </p>
          <p>
            サブスクなど毎月の支払い全体の整理は
            <Link
              href="/guide/digital-seiri/sumaho-kakin-seiri"
              className="text-blue-600 hover:underline"
            >
              スマホの有料サービス・課金を整理する方法
            </Link>
            、パスワードの安全な管理は
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
            一覧表の「在りか」を、もしものときに届く形で残すには
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-8 text-slate-600">
            「つぎの手ナビ
            デジタル資産」は、整理した情報を、見られたくないものは伏せたまま、もしものときだけ大切な人へ引き継ぐ準備ができるサービスです。資産の登録・PDF出力・定期リマインドは無料で使えます。
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
                投資を家族に知らせるか迷っている方
              </p>
              <Link
                href="/guide/shisan-kanri/toshi-kazoku"
                className="mt-1 inline-block text-base font-medium text-blue-600 hover:underline"
              >
                投資、家族に知らせる？知らせない？｜もしものときどうなるか &rsaquo;
              </Link>
            </li>
            <li>
              <p className="text-xs font-medium text-slate-500">
                サブスクなど毎月の支払いも棚卸ししたい方
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
