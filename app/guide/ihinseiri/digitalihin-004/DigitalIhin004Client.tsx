'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AffiliateCtaBox from '@/components/AffiliateCtaBox';
import SiteFooter from '@/components/SiteFooter';

const toc = [
  { id: 'conclusion', label: 'まず結論と最初にやること' },
  { id: 'why-hard', label: 'なぜ遺品のパソコンはすぐ捨てにくいのか' },
  { id: 'check-first', label: '捨てる前に確認したいこと' },
  { id: 'self-limit', label: '自力で進めにくいケース' },
  { id: 'consult', label: '実家片付け全体で考えたいケース' },
  { id: 'related', label: '他の悩みともつながる理由' },
  { id: 'ng', label: 'やってはいけないこと' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめと最短で失敗しない動き方' },
];

const faqs = [
  {
    q: '遺品のパソコンはそのまま捨てても大丈夫ですか？',
    a: 'すぐに捨てるのはおすすめしにくいです。写真、契約情報、ネット銀行やクレジットカードの履歴、仕事のファイルなどが残っている可能性があります。まずは周辺の書類やスマホも含めて、確認が必要な情報がありそうかを整理するのが先です。',
  },
  {
    q: 'パソコンの電源が入らない場合はどうすればいいですか？',
    a: '無理に起動や分解を試すより、まずは外付けHDD、USBメモリ、紙のメモ、通信関連の書類など周辺の手がかりを確認するのがおすすめです。パソコンだけに答えがあるとは限りません。',
  },
  {
    q: 'スマホや書類も多くて何から始めればよいかわかりません。',
    a: 'パソコンだけを単独で処分しようとせず、実家全体の片付けの中で確認対象を分ける方が進めやすいです。特に遠方の実家や物量が多い場合は、最初に保留にするものと片付け対象を分けると混乱しにくくなります。',
  },
  {
    q: 'パソコン以外の遺品も多い場合はどう考えればよいですか？',
    a: 'その場合は、パソコンの処分だけで終わらないことが多いです。スマホ、通帳、郵便物、家具、家電などと一緒に、実家全体の片付けとして考えた方が、後からやり直しになりにくいです。',
  },
];

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
    <section id={id} className="mt-16 scroll-mt-24">
      <h2 className="text-2xl font-bold leading-tight text-slate-900">{title}</h2>
      <div className="mt-6 space-y-5 text-[15px] leading-8 text-slate-700">{children}</div>
    </section>
  );
}

function DotList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[15px] leading-8 text-slate-700">
          <span className="mt-3 h-2.5 w-2.5 shrink-0 rounded-full bg-slate-900" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CrossList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-[15px] leading-8 text-slate-700">
          <span className="mt-1 shrink-0 text-lg font-bold leading-8 text-rose-600">×</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function MicroCopy({ text }: { text: string }) {
  return <p className="mt-3 text-xs leading-6 text-slate-500">{text}</p>;
}

function InfoImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
      <div className="relative aspect-[16/9] w-full">
        <Image src={src} alt={alt} fill className="object-cover" />
      </div>
    </div>
  );
}

function BrandHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/tsuginote-logo.png"
            alt="つぎの手ナビ"
            width={754}
            height={201}
            priority
            className="h-12 w-auto sm:h-14"
          />
        </Link>
      </div>
    </header>
  );
}

function FaqAccordion({
  faqs,
}: {
  faqs: { q: string; a: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleFaqToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.q}
              className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200"
            >
              <button
                type="button"
                onClick={() => handleFaqToggle(index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-base font-bold text-slate-900">{faq.q}</span>
                <span className="shrink-0 text-xl font-bold text-slate-500">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-slate-200 px-5 py-4 text-[15px] leading-8 text-slate-700">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const secondaryLinkClass =
  'inline-flex rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-300 transition hover:bg-slate-50';

export default function DigitalIhin004Client() {
  return (
    <main className="bg-slate-50">
      <BrandHeader />

      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <nav className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-slate-700 hover:underline">
                ホーム
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/guide" className="hover:text-slate-700 hover:underline">
                役立ち情報
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/guide/ihinseiri" className="hover:text-slate-700 hover:underline">
                遺品整理・実家片付け
              </Link>
            </li>
            <li>/</li>
            <li className="text-slate-700">遺品のパソコンの捨て方と安全に処分する進め方</li>
          </ol>
        </nav>

        <header className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            役立ち情報｜デジタル遺品
          </div>

          <div className="mt-8">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-004/main-visual.png"
              alt="遺品のパソコンや書類、スマホを前に確認対象を整理している様子"
            />
            <MicroCopy text="※パソコンだけでなく、スマホ、書類、外付けHDD、郵便物なども一緒に見ると、確認すべき情報が見えやすくなります。" />
          </div>

          <h1 className="mt-8 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            遺品のパソコンの捨て方と安全に処分する進め方
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
            親が亡くなったあと、実家の片付けで困りやすいもののひとつがパソコンです。
            見た目はただの家電でも、写真、メール、契約情報、ネット銀行の履歴、仕事のファイルなど、
            故人の大切な情報が入っていることがあります。
            この記事では、遺品のパソコンをすぐ捨てずに確認したいこと、自力で進めにくいケース、
            実家全体の片付けとして考えた方がよい場面を整理します。
          </p>
        </header>

        <section
          id="conclusion"
          className="mt-8 rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-200"
        >
          <h2 className="text-xl font-bold text-slate-900">
            まず結論と最初にやること
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-slate-700">
            遺品のパソコンは、いきなり初期化したり処分方法を探したりするより、
            まずは中に確認すべき情報がありそうかを整理することが先です。
            パソコンだけでなく、スマホ、郵便物、通帳、メモ、外付けHDDなども一緒に見ると、
            契約や資産の手がかりが見つかることがあります。
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-amber-100">
              <h3 className="text-base font-bold text-slate-900">最初にやること3つ</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    'パソコン本体をすぐ捨てずに確認対象として分ける',
                    'スマホ、書類、外付けHDD、メモなど周辺の手がかりを集める',
                    '契約や資産に関わる情報が残っていそうかを整理する',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-amber-100">
              <h3 className="text-base font-bold text-slate-900">後回しにしたいこと</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '急いで初期化して終わりにすること',
                    'パソコンだけを単独で処分対象にすること',
                    '実家全体の片付けと切り離して考えること',
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">ページの見取り図</h2>
          <ul className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            {toc.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="hover:text-slate-900 hover:underline">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <Section id="why-hard" title="なぜ遺品のパソコンはすぐ捨てにくいのか">
          <p>
            パソコンが難しいのは、単なる家電ではなく、故人の生活や契約の入口になっていることがあるからです。
            家族からは見えにくい情報がまとまって入っているため、すぐ捨てると後から困ることがあります。
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">写真やメールが残っている</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                思い出の写真だけでなく、契約メールや各種通知の手がかりが見つかることがあります。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">契約や資産につながることがある</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                ネット銀行、証券、クレジットカード、通販、会員サイトなどの情報が残っている場合があります。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">他の遺品と情報が分散している</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                スマホ、通帳、郵便物、メモ、外付け機器などと合わせて見ないと全体像が見えにくいことがあります。
              </p>
            </div>
          </div>
        </Section>

        <Section id="check-first" title="遺品のパソコンを捨てる前に確認したいこと">
          <p>
            処分方法を考える前に、まずは何を確認すべきかを整理することが大切です。
            ここで完璧に把握しきれなくても、確認が必要そうかどうかを見極めるだけでも前進です。
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">先に見たいもの</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    'パソコンの近くにあるメモや契約書類',
                    '故人が使っていたスマホやタブレット',
                    '外付けHDDやUSBメモリ',
                    '通帳やクレジットカードの利用明細',
                    '郵便物や会員サービスの通知',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">確認の考え方</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '写真や書類だけでなく契約情報の手がかりも意識する',
                    'パソコンだけに答えがあると思い込まない',
                    'すぐ処分せず保留にするものを分ける',
                    '実家全体の片付けの中で順番を考える',
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="mt-2">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-004/check-items.png"
              alt="パソコン、外付けHDD、スマホ、書類を並べて確認対象を整理している様子"
            />
            <MicroCopy text="※パソコン単体で判断するより、周辺の遺品や書類も含めて見ると、確認の抜け漏れを減らしやすくなります。" />
          </div>

          <p>
            特に、故人がネットで買い物をしていた、銀行やカードをよく使っていた、
            写真や書類をデジタルで管理していた場合は、急いで処分するより確認を優先した方が安心です。
          </p>
        </Section>

        <Section id="self-limit" title="自力で進めにくいケース">
          <p>
            ある程度までは家族で進められても、次のようなケースではパソコンの処分だけで終わらないことがあります。
          </p>

          <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
            <DotList
              items={[
                'パソコン以外にもスマホや書類が多い',
                '遠方の実家で何度も通えない',
                '何を残して何を捨てるか判断しにくい',
                '家族内で処分の判断が分かれている',
                '実家全体の片付けも同時に進める必要がある',
              ]}
            />
          </div>

          <p>
            この場合は、パソコンだけ先に片付けるより、実家全体の整理の中で順番を決めた方が進めやすくなります。
          </p>
        </Section>

        <Section id="consult" title="実家片付け全体で考えたいケース">
          <p>
            遺品のパソコン処分で悩んでいるように見えても、実際にはスマホ、通帳、郵便物、家具、家電など、
            他の整理とつながっていることが少なくありません。
            そのため、パソコンだけ個別に処分するより、実家全体の片付けとして考えた方が動きやすい場合があります。
          </p>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">実家全体で考えたいケース</h3>
            <div className="mt-4">
              <DotList
                items={[
                  'パソコン以外にも整理する遺品が多い',
                  '短い日程でまとめて進めたい',
                  '確認不足で後からやり直したくない',
                  '家族だけでは手が足りない',
                ]}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <h3 className="text-lg font-bold text-slate-900">急いで捨てるリスク</h3>
            <p className="mt-3 text-[15px] leading-8 text-slate-700">
              パソコンだけ先に処分すると、後から「スマホも確認すべきだった」「通帳や郵便物と合わせて見ればわかった」となりやすいです。
              情報が複数の場所に分かれていることが多いため、単独で考えると抜け漏れが起きやすくなります。
            </p>
            <p className="mt-3 text-[15px] leading-8 text-slate-700">
              実家全体の片付けとして考えることで、確認すべきものと処分できるものを分けやすくなります。
            </p>
          </div>

          <div className="mt-2">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-004/consult-scene.png"
              alt="実家の片付け全体を整理しながら相談先を検討している様子"
            />
            <MicroCopy text="※パソコン以外にも遺品が多い場合は、処分だけでなく全体の整理の順番を考える方が進めやすいです。" />
          </div>

<AffiliateCtaBox
  title="スマホやパソコンだけでなく、実家の遺品整理全体を進めたい方へ"
  serviceLead="ご家族だけで整理が難しい場合は、片付け・仕分け・回収までまとめて相談できるサービスを早めに確認しておくと、全体の見通しを立てやすくなります。"
  description="親のスマホのパスワードがわからないときは、スマホ単体で考えるより、パソコンや書類、実家全体の片付けの中で整理した方が進みやすいことがあります。物量が多い場合や、遠方で何度も通えない場合、家族だけで対応が難しい場合は、まず無料見積もりで費用感や進め方を確認しておくと安心です。"
  buttonText="遺品整理110番を確認する"
  href="https://px.a8.net/svt/ejp?a8mat=4AZNCN+786GWQ+39GM+5MFLEA"
  lpName="digitalihin_004"
  lpId="guide_ihinseiri_digitalihin_004"
  position="bottom"
  programName="ihinseiri_110"
  ctaId="cta_digitalihin_004_ihin110"
  partnerCategory="estate_cleanup"
  sourceSection="consult"
  gaEventName="cta_click_digitalihin_004_ihin110"
  summaryItems={[
    {
      label: 'サービス名',
      value: '遺品整理110番',
    },
    {
      label: '対応エリア',
      value: '全国対応です。',
    },
    {
      label: '相談内容',
      value: '遺品整理・片付け・回収の相談です。',
    },
    {
      label: '相談',
      value: '無料見積もりから確認できます。',
    },
  ]}
  operatorName="シェアリングテクノロジー株式会社"
/>
        </Section>

        <Section id="related" title="他の悩みともつながる理由">
          <p>
            パソコンの処分の悩みは、スマホ、ネット銀行、実家片付けともつながっています。
            パソコンだけを単独で考えるより、他の記事もあわせて見る方が整理しやすくなります。
          </p>

          <div className="space-y-5">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">スマホが開けない場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                パソコンとスマホが連携していることもあるため、スマホの確認が必要になるケースがあります。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-001" className={secondaryLinkClass}>
                  親のスマホのパスワードがわからないときは？
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">ネット銀行や口座も気になる場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                パソコンの中や周辺資料から、ネット銀行や証券口座の手がかりが見つかることがあります。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-002" className={secondaryLinkClass}>
                  親のネット銀行がわからないときの相続対応
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">実家全体の整理も必要な場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                パソコンだけでなく、通帳、郵便物、家具、家電も含めて片付ける必要があることがあります。
              </p>
              <div className="mt-4">
                <Link href="/guide/jikka-kataduke/nanikara-a001" className={secondaryLinkClass}>
                  実家の片付けを何から始めるか
                </Link>
              </div>
            </div>
          </div>
        </Section>

        <Section id="ng" title="遺品のパソコン処分でやってはいけないこと">
          <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
            <CrossList
              items={[
                '急いで初期化して終わりにする',
                '中身を確認しないまま手放す',
                'パソコンだけを単独で処分対象にする',
                '実家全体の整理と切り離して考える',
              ]}
            />
          </div>

          <p>
            パソコンが古く見えても、契約や写真、メールなどの手がかりが残っていることがあります。
            また、パソコン以外の遺品と情報が分散していることも多いため、単独で判断しない方が安心です。
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">実家の片付け全体が気になる方へ</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                パソコン処分だけでなく、何から手をつけるか迷う場合は、全体の順番を先に整理すると動きやすくなります。
              </p>
              <div className="mt-4">
                <Link href="/guide/jikka-kataduke/nanikara-a001" className={secondaryLinkClass}>
                  実家の片付けを何から始めるか
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">相続全体も気になる方へ</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                書類や名義変更、相談先選びも含めて整理したい場合は、全体の流れを先に見ておくと動きやすいです。
              </p>
              <div className="mt-4">
                <Link href="/souzoku-tetsuzuki" className={secondaryLinkClass}>
                  相続手続きの流れを確認する
                </Link>
              </div>
            </div>
          </div>
        </Section>

        <Section id="faq" title="よくある質問">
          <FaqAccordion faqs={faqs} />
        </Section>

        <Section id="summary" title="まとめと最短で失敗しない動き方">
          <p>
            遺品のパソコンは、すぐに捨てるのではなく、まず確認対象として扱うのが基本です。
            周辺の書類やスマホ、外付け機器も含めて、契約や資産、写真などの手がかりがないかを整理してから処分を考える方が安心です。
          </p>

          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <ul className="space-y-3 text-[15px] leading-8 text-slate-700">
              <li>・パソコン本体をすぐ捨てずに確認対象として分ける</li>
              <li>・スマホ、書類、外付けHDD、メモも一緒に見る</li>
              <li>・契約や資産の手がかりがありそうかを整理する</li>
              <li>・遺品が多い場合は実家全体の片付けとして考える</li>
            </ul>
          </div>

          <p>
            パソコン処分で悩んでいるときは、実際にはパソコンだけの問題ではなく、実家全体の片付けや他のデジタル遺品整理につながっていることも少なくありません。
            遠方で時間が限られている、物量が多い、家族だけでは進めにくい場合は、早めに整理の方針を決めることが大切です。
          </p>
        </Section>

        <section className="mt-16 rounded-3xl bg-white p-6 ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">あわせて確認したい記事</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Link
              href="/guide/ihinseiri/digitalihin-001"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">スマホが開けない方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                親のスマホのパスワードがわからないときは？
              </p>
            </Link>

            <Link
              href="/guide/ihinseiri/digitalihin-002"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">ネット銀行や口座も気になる方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                親のネット銀行がわからないときの相続対応
              </p>
            </Link>

            <Link
              href="/guide/jikka-kataduke/nanikara-a001"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">実家全体の整理も必要な方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                実家の片付けを何から始めるか
              </p>
            </Link>

            <Link
              href="/souzoku-tetsuzuki"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">相続全体の流れを見たい方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                相続手続きの流れと相談先
              </p>
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}