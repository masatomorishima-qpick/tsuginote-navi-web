import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import GuideCtaLink from '@/components/guide/GuideCtaLink';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';

const SITE_URL = 'https://www.tsuginotenavi.jp';
const PAGE_PATH = '/guide/digital-seiri/mail-seiri';
const PAGE_IMAGE = `${SITE_URL}/images/guide/digital-seiri/mail-seiri-main.webp`;
const PAGE_TITLE = 'メールの整理術｜あふれた受信トレイをスッキリさせる手順';
const PAGE_DESCRIPTION =
  'あふれた受信トレイを整理する手順を、Gmail・Outlook対応で解説。不要メルマガの解除から自動振り分け（フィルタ）、受信トレイを空に保つコツまで。最後に、見落としがちな「メールは全アカウントの鍵」という視点も。';

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
  { id: 'step1', label: 'ステップ1｜まず減らす（配信解除）' },
  { id: 'step2', label: 'ステップ2｜仕分けを自動化する' },
  { id: 'step3', label: 'ステップ3｜受信トレイを空に保つ' },
  { id: 'step4', label: 'ステップ4｜溜めない習慣' },
  { id: 'blindspot', label: 'メール整理で見落とすこと' },
  { id: 'finish', label: '仕上げ｜「鍵の親玉」の在りかを残す' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ' },
];

const faqs = [
  {
    q: 'フォルダ分けと検索、どちらが効率的ですか？',
    a: '検索を主、フォルダ（ラベル）は最小限が効率的です。今のメールは検索が強力なので、細かい分類に時間をかけるより「あとで見返すもの」だけ分ければ十分です。',
  },
  {
    q: 'メルマガの「配信停止」を押すと、かえって迷惑メールが増えませんか？',
    a: '正規の事業者のメールなら、配信停止で止まります。明らかに不審な迷惑メールは、リンクを押さず「迷惑メール報告」でブロックするのが安全です。',
  },
  {
    q: '大量の未読をリセットしたいです。',
    a: '期間や送信元で絞り込み、まとめてアーカイブ（削除ではなく）するのがおすすめです。アーカイブなら検索で後から取り出せるので、思い切って受信トレイを空にできます。',
  },
  {
    q: 'メールのパスワードは特別に守るべきですか？',
    a: 'はい。メールは他サービスのパスワード再発行の入口なので、最重要です。強固なパスワード＋二段階認証で守り、その在りかはもしものときに家族へ届く形にしておくと安心です。',
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
          name: 'デジタル整理術',
          item: `${SITE_URL}/guide/digital-seiri`,
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: 'メールの整理術',
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

export default function MailSeiriPage() {
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
              <Link href="/guide/digital-seiri" className="text-blue-600 hover:underline">
                デジタル整理術
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">メールの整理術</li>
          </ol>
        </nav>

        <p className="mt-10 text-xs font-medium uppercase tracking-wide text-slate-500">
          役立ち情報｜デジタル整理術
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          メールの整理術
          <span className="mt-2 block text-xl font-medium leading-snug text-slate-600 sm:text-2xl">
            あふれた受信トレイをスッキリさせる手順
          </span>
        </h1>

        <p className="mt-7 text-base leading-8 text-slate-700">
          「未読が何千件」「メルマガに大事なメールが埋もれる」——受信トレイは、放っておくと一番散らかる場所です。
          メール整理は、フォルダを細かく作り込むより「<strong>減らす→自動化する→空に保つ→溜めない</strong>
          」の4ステップで進めるのがコツです。この記事では、Gmail・Outlookどちらでも使える手順を、迷わないように解説します。最後に、ほとんどの人が見落とす「メールという場所の、もうひとつの重要な役割」にも触れます。
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl">
          <Image
            src="/images/guide/digital-seiri/mail-seiri-main.webp"
            alt="ダイニングテーブルでノートパソコンとスマホを使い、受信トレイのメールを整理する人"
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

        <Section id="step1" title="ステップ1｜まず減らす（メルマガの配信解除）">
          <p>
            受信トレイが重い最大の原因は、読まないメルマガ・通知メールです。1通ずつ削除し続けるより、
            <strong>元から断つ</strong>のが速い。
          </p>
          <DotList
            items={[
              '受信トレイをざっと見て、「届いても開かないメール」の送信元を10件ほどピックアップ',
              '各メール本文の末尾にある「配信停止／unsubscribe」リンクから解除',
              '「広告・プロモーション」をまとめて検索して、不要なものを一括処理',
            ]}
          />
          <p>
            ここ数か月分を見て、解除を10件するだけで受信トレイの景色が変わります。
          </p>
        </Section>

        <Section id="step2" title="ステップ2｜仕分けを自動化する">
          <p>
            手で振り分けるのは続きません。<strong>ルール（フィルタ）で自動化</strong>します。
          </p>
          <p className="rounded-2xl bg-amber-50 p-5 text-sm leading-7 text-slate-700">
            ※ 自動仕分け（フィルタ）の細かい設定は、スマホのアプリからは作れない／機能が限られることがあります。
            <strong>パソコンのブラウザ、またはスマホのブラウザで「PC版サイト」を開いて設定</strong>
            するとスムーズです。
          </p>
          <DotList
            items={[
              'Gmail：検索窓で送信元を指定→「フィルタを作成」→「ラベルを付ける」「受信トレイをスキップ（アーカイブ）」。通知や明細など“見たいが今は不要”を自動で整理棚へ',
              'Outlook：「仕分けルール」で送信者・件名ごとにフォルダへ自動振り分け',
              'ラベル／フォルダは「あとで見返すもの（契約・購入・手続き）」中心に少なめに。多すぎると逆に探せません',
            ]}
          />
          <p>
            完璧な分類は不要です。<strong>検索で見つかる</strong>のがメールの強み。分類は最小限でOK。
          </p>
        </Section>

        <Section id="step3" title="ステップ3｜受信トレイを空に保つ（Inbox Zero）">
          <p>
            届いたメールは「その場で1回さばく」と溜まりません。判断はシンプルに3つ。
          </p>
          <DotList
            items={[
              'すぐ済む（1〜2分）→ その場で返信・処理してアーカイブ',
              'あとで対応→ 「要対応」ラベルだけ付けて受信トレイから出す',
              '読むだけ／不要→ アーカイブか削除',
            ]}
          />
          <p>
            「受信トレイ＝未処理の箱」と決め、処理したら必ず外へ。これだけで常にスッキリします。
          </p>
        </Section>

        <Section id="step4" title="ステップ4｜溜めない習慣">
          <DotList
            items={[
              'スキマ時間に都度：通勤や待ち時間に、その場でメルマガ解除・アーカイブ',
              '月1の点検：フィルタの見直しと、古い「要対応」の処理',
            ]}
          />
        </Section>

        <Section id="blindspot" title="メール整理で、ほとんどの人が見落とすこと">
          <p>
            ここまでで受信トレイは軽くなりました。最後に、メールという場所の“もうひとつの顔”を確認してください。
          </p>
          <p>
            <strong>メールは、あなたの全アカウントの「鍵の親玉」です。</strong>
          </p>
          <p>
            銀行・SNS・ショッピング——たいていのサービスは、パスワードを忘れたとき「登録メールアドレス宛に再設定リンク」を送ります。つまり
            <strong>メールに入れる人は、芋づる式にほぼ全部のアカウントに入れる</strong>
            。だからこそ、メールのパスワードは最重要で、二段階認証で守るべきものです。
          </p>
          <p>
            そして逆に——もしあなたが急に入院したら、事故や病気でスマホを触れなくなったら。
            <strong>家族は、そのメールに、たどり着けるでしょうか。入れなければ、銀行もサブスクも、何ひとつたどれません。</strong>
            実際、大切な方を亡くした人がデジタル関連で最も困ったのは「スマホ・パソコンのパスワードが分からない」ことでした（2026年
            BlueAdventures調べ）。さらに、Googleなどは「2年間ログインなどの利用がないアカウントは、データもろとも削除する場合がある」とポリシーで定めています。本人も家族も入れないまま放置されると、最悪の場合
            <strong>メールアカウント自体が消え、紐づく全サービスのパスワード再発行が永久にできなくなる</strong>
            おそれもあります。整理して使いやすくなったメールほど、本人だけの場所になっていきます。
          </p>
        </Section>

        <Section id="finish" title="仕上げ｜「鍵の親玉」の在りかを残す">
          <p>
            メールアドレスやそのパスワードを、今すぐ家族に教える必要はありません。
            <strong>
              「メインのメールはこれ」「鍵はここにある」という在りかだけを、もしものときだけ信頼できる人へ届く形にしておく。
            </strong>{' '}
            それで、日常の使いやすさと、もしものときの安心が両立します。
          </p>
          <p>
            メールを整えたなら、その勢いで「鍵の親玉の在りか」を残すところまで。それが、メール整理の本当の仕上げです。
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

        <Section id="summary" title="まとめ｜減らして・自動化して・空に保つ、最後に在りかを残す">
          <p>
            メール整理は、①不要メルマガを解除して減らす、②フィルタで仕分けを自動化、③受信トレイを空に保つ（Inbox
            Zero）、④スキマ時間で溜めない——この順で、フォルダを作り込まなくても続きます。
          </p>
          <p>
            そして、メールは全アカウントの「鍵の親玉」。整理した今こそ、その在りかを、もしものときだけ家族へ届く形で残しておく。ここまでやって、メール整理は本当に完成します。
          </p>
          <p>
            会員登録そのものを減らしたい方は
            <Link href="/guide/digital-seiri/account-seiri" className="text-blue-600 hover:underline">
              会員登録・アカウント整理のやり方
            </Link>
            、メールの鍵を守るパスワード管理は
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
            「鍵の親玉」の在りかを、もしものときに届く形で残すには
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
                会員登録・アカウントごと減らしたい方
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
                メールの鍵＝パスワードを安全にしたい方
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
