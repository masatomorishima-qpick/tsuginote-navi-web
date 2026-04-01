'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AffiliateCtaBox from '@/components/AffiliateCtaBox';
import SiteFooter from '@/components/SiteFooter';

const toc = [
  { id: 'conclusion', label: 'まず結論｜最初にやること' },
  { id: 'sellable', label: '親のスマホは初期化できなくても売れる？' },
  { id: 'sell-without-reset', label: '初期化せずに親のスマホを売るとどうなる？' },
  { id: 'check-first', label: '親のスマホを売る前に確認したいこと' },
  { id: 'compare', label: '売る・保管する・処分するを比較する' },
  { id: 'cannot-reset', label: '初期化できない・パスワードがわからないときはどうする？' },
  { id: 'consult', label: '自分で判断が難しいときの考え方' },
  { id: 'related', label: '他の悩みともつながる理由' },
  { id: 'ng', label: 'やってはいけないこと' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ｜最短で失敗しない動き方' },
];

const faqs = [
  {
    q: '親のスマホは初期化できなくても売れますか？',
    a: '状態によっては売れることもあります。ただし、売却できることと、今売ってよいことは別です。契約や支払い、相続の手がかりが残っていないかを先に確認した方が安心です。',
  },
  {
    q: 'パスワードがわからないまま売却して大丈夫ですか？',
    a: '急いで売るより、まずは契約や支払いの手がかりが残っていないかを確認した方が安全です。スマホ単体ではなく、書類や他の端末も含めて判断するのがおすすめです。',
  },
  {
    q: '初期化できないスマホは処分した方がいいですか？',
    a: '必ずしもすぐ処分する必要はありません。確認すべき情報が残っている可能性があるため、売る・保管する・処分するのどれがよいかを比べてから考える方が安心です。',
  },
  {
    q: 'スマホを先に解約した方がいいですか？',
    a: '状況によります。解約や売却を急ぐ前に、何の確認が必要かを整理した方が進めやすいです。手がかりの確認がまだなら、先に契約や支払いの状況を見た方が安心です。',
  },
  {
    q: 'スマホ以外にも確認すべきものはありますか？',
    a: 'あります。通帳、郵便物、パソコン、タブレット、メモ、契約書類なども一緒に見るのがおすすめです。スマホだけで答えを探そうとしない方が、全体像をつかみやすくなります。',
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

export default function DigitalIhin007Client() {
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
            <li className="text-slate-700">親のスマホは売れる？初期化できないときは？</li>
          </ol>
        </nav>

        <header className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            役立ち情報｜デジタル遺品
          </div>

          <div className="mt-8">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-007/main-visual.png"
              alt="親のスマホを売るべきか迷い、スマホや書類を前に確認事項を整理している様子"
            />
            <MicroCopy text="※初期化できないスマホは、すぐに売るより、契約や支払いの手がかりが残っていないかを先に確認した方が安心です。" />
          </div>

          <h1 className="mt-8 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            親のスマホは売れる？
            <br className="hidden sm:block" />
            初期化できないときに売却前に確認したいこと
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
            親が亡くなった後、実家の片付けを進める中で「このスマホ、売れるのだろうか」と迷う方は少なくありません。
            とくに、パスワードがわからない、初期化できない、契約や支払いの整理が終わっていないといった状態では、
            売却を急いでよいのか不安になりやすいです。この記事では、親のスマホを売る前に確認したいこと、
            売る・保管する・処分するのどれがよいか、そして自分で判断が難しいときの考え方を順番に整理します。
          </p>

          <div className="mt-6 rounded-2xl bg-amber-50 px-5 py-4 ring-1 ring-amber-200">
            <p className="text-sm leading-7 text-slate-700">
              親のスマホは、状態によっては売れることもあります。ただし、
              <span className="font-semibold text-slate-900"> 初期化できないなら、売れるかどうかだけで判断しない方が安心 </span>
              です。まずは「今売ってよい状態か」を確認してください。
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href="#compare"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              売る・保管・処分を比較する
            </a>
            <a
              href="#consult"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              自分で判断が難しいときの相談先を見る
            </a>
          </div>
        </header>

        <section
          id="conclusion"
          className="mt-8 rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-200"
        >
          <h2 className="text-xl font-bold text-slate-900">
            まず結論｜初期化できない親のスマホは、急いで売らない方がよいことが多い
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-slate-700">
            親のスマホは、見た目がきれいで機種が新しければ、物理的には売れることもあります。
            ただ、売れることと、今売ってよいことは別です。スマホの中には、写真や連絡先だけでなく、
            契約情報、メール、サブスク、ネット銀行やカードの手がかりが残っていることもあります。
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-amber-100">
              <h3 className="text-base font-bold text-slate-900">最初にやること3つ</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '契約や支払いの手がかりが残っていないか確認する',
                    '初期化できない理由を整理する',
                    '売る・保管する・処分するのどれが安全か比較する',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-amber-100">
              <h3 className="text-base font-bold text-slate-900">急がない方がよいケース</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    'パスワードがわからず初期化できない',
                    '契約や支払いの整理が終わっていない',
                    'サブスクや銀行の手がかりが残っていそう',
                    '実家の書類や他の端末もまだ十分に見られていない',
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

        <Section id="sellable" title="親のスマホは初期化できなくても売れる？">
          <p>
            初期化できないスマホでも、端末の状態や買取店の方針によっては買い取られることがあります。
            故障品扱い、ジャンク扱い、部品扱いなど、売却のされ方もさまざまです。
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">物理的には売れることがある</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                機種や状態によっては、初期化できなくても買い取られることがあります。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">でも、今売ってよいとは限らない</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                売却可否と、契約や相続の整理が終わっているかは別に考えた方が安心です。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">故障・ロック・契約未整理は要注意</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                初期化できない理由によっては、売るより保管や処分を先に考えた方がよいことがあります。
              </p>
            </div>
          </div>

          <p>
            大事なのは、「買い取ってもらえるならすぐ売る」で進めないことです。
            親のスマホは、自分の古いスマホを処分する場面とは違い、
            <span className="font-semibold text-slate-900"> 残っている情報や、その後の手続きへの影響 </span>
            も考える必要があります。
          </p>
        </Section>

        <Section id="sell-without-reset" title="初期化せずに親のスマホを売るとどうなる？">
          <p>
            初期化せずにスマホを売ることに不安を感じる方は多いと思います。その不安は自然です。
            なぜなら、初期化できていない状態では、家族がまだ確認していない情報が残っている可能性があるからです。
          </p>

          <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
            <CrossList
              items={[
                'メールや通知の中に契約情報が残っているかもしれない',
                '銀行、証券、サブスク、通販などの手がかりを失うかもしれない',
                '他の遺品や書類と合わせて見れば整理できた情報を先に失うかもしれない',
                '家族内で「先に売ってよかったのか」が後から問題になりやすい',
              ]}
            />
          </div>

          <p>
            つまり、初期化せずに売ることの問題は、単なるデータの不安だけではありません。
            <span className="font-semibold text-slate-900"> 相続や実家整理に必要な手がかりを、確認前に手放してしまうこと </span>
            にもあります。
          </p>
        </Section>

        <Section id="check-first" title="親のスマホを売る前に確認したいこと">
          <p>
            売却を考える前に、まずは次の点を整理しておくと判断しやすくなります。
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">確認したいもの</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '通信契約や料金の手がかり',
                    'サブスクや継続課金の通知',
                    'ネット銀行や証券のアプリ名',
                    'クレジットカードや決済サービスの利用履歴',
                    'メールアドレスや会員サイトの通知',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">スマホ以外にも見たいもの</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '通帳やカード利用明細',
                    '郵便物',
                    'パソコンやタブレット',
                    'メモ帳や手書きの控え',
                    '実家に残っている契約書類',
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <h3 className="text-base font-bold text-slate-900">初期化できない理由を切り分ける</h3>
            <div className="mt-4">
              <DotList
                items={[
                  '画面ロックが解除できない',
                  'Apple ID / Googleアカウントが分からない',
                  '起動しない',
                  '故障している',
                  '通信契約や解約整理が終わっていない',
                ]}
              />
            </div>
          </div>

          <p>
            「初期化できない」といっても状況はさまざまです。理由によって、売却・保管・処分のどれが向いているかは変わります。
          </p>
        </Section>

        <Section id="compare" title="売る・保管する・処分するを比較する">
          <p>
            親のスマホは、すべてを売却前提で考えなくて大丈夫です。状態に応じて、売る・保管する・処分するを分けて考えた方が失敗しにくくなります。
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-lg font-bold text-slate-900">売る</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                確認したい情報がほぼ整理できていて、契約や支払いの見通しも立っている場合に向きます。
              </p>
              <div className="mt-4">
                <DotList
                  items={[
                    '情報確認がほぼ終わっている',
                    '初期化やデータ整理の見通しが立っている',
                    '実家整理もある程度進んでいる',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-lg font-bold text-slate-900">保管する</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                初期化できない、パスワードがわからない、契約や資産の手がかりが残っていそうな場合に向きます。
              </p>
              <div className="mt-4">
                <DotList
                  items={[
                    'まだ確認が必要そう',
                    '家族で判断が終わっていない',
                    '急いで売ると危ない',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-lg font-bold text-slate-900">処分する</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                必要な確認がほぼ終わっていて、売却より安全な処分を優先したい場合に向きます。
              </p>
              <div className="mt-4">
                <DotList
                  items={[
                    '確認が済んでいる',
                    '売却より安全な処分を優先したい',
                    '実家整理の中で処分対象に分けられている',
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <AffiliateCtaBox
              title="売却可否より先に、実家全体の整理を優先したい方へ"
              serviceLead="ご家族だけで判断が難しい場合は、スマホだけでなく書類や家財も含めて整理の方針を立てた方が進めやすいことがあります。"
              description="親のスマホを売るか迷っていても、実際にはスマホ単体ではなく、書類、家財、実家全体の片付けとつながっていることが少なくありません。初期化できない、契約整理が終わらない、どこまで確認してから売るべきか迷う場合は、まず全体整理の相談先を確認しておくと安心です。"
              buttonText="遺品整理110番を確認する"
              href="https://px.a8.net/svt/ejp?a8mat=4AZNCN+786GWQ+39GM+5MFLEA"
              lpName="digitalihin_007"
              lpId="guide_ihinseiri_digitalihin_007"
              position="bottom"
              programName="ihinseiri_110"
              ctaId="cta_digitalihin_007_compare"
              partnerCategory="estate_cleanup"
              sourceSection="compare"
              gaEventName="cta_click_digitalihin_007"
              summaryItems={[
                { label: 'サービス名', value: '遺品整理110番' },
                { label: '対応エリア', value: '全国対応です。' },
                { label: '相談内容', value: '遺品整理・片付け・回収の相談です。' },
                { label: '相談', value: '無料見積もりから確認できます。' },
              ]}
              operatorName="シェアリングテクノロジー株式会社"
            />
          </div>
        </Section>

        <Section id="cannot-reset" title="初期化できない・パスワードがわからないときはどうする？">
          <p>
            初期化できないときに、無理に解除や設定変更を繰り返すのはおすすめしにくいです。親のスマホは、自分の端末とは違い、
            契約や支払い、相続の整理とつながっていることがあるからです。
          </p>

          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <DotList
              items={[
                'まずはスマホ以外の手がかりを探す',
                'スマホが本当に今必要な確認対象かを考える',
                '急いで売却せず、保管も選択肢に入れる',
                '必要なら関連記事を見ながら整理する',
              ]}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">パスワードがわからない場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                ロック解除の考え方や、他の場所から手がかりを探す進め方は、こちらの記事も参考になります。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-001" className={secondaryLinkClass}>
                  親のスマホのパスワードがわからないときは？
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">契約整理や解約も気になる場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                売却や保管を考える前に、スマホ契約の流れも整理しておくと判断しやすくなります。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-005" className={secondaryLinkClass}>
                  親が亡くなった後のスマホ解約の流れ
                </Link>
              </div>
            </div>
          </div>

          <p>
            スマホの売却を急ぐより、まずは「何を確認してから売るべきか」を整理する方が、結果として失敗しにくくなります。
          </p>
        </Section>

        <Section id="consult" title="自分で判断が難しいときは、遺品整理の中で相談する">
          <p>
            親のスマホ売却で悩んでいるように見えても、実際にはパソコン、書類、通帳、郵便物、家具や家電、実家全体の片付けとつながっていることが少なくありません。
          </p>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">相談を考えたいケース</h3>
            <div className="mt-4">
              <DotList
                items={[
                  '初期化できず、売る・保管・処分の判断が止まっている',
                  'スマホ以外にも片付けるものが多い',
                  '遠方の実家で何度も通えない',
                  '家族だけで確認しきれない',
                  '実家整理全体の方針を決めたい',
                ]}
              />
            </div>
          </div>

          <p>
            そのため、スマホ単体で売却判断をするより、
            <span className="font-semibold text-slate-900"> 実家の遺品整理全体の中で整理する </span>
            方が進みやすい場合があります。特に、遠方の実家で時間が限られている、物量が多い、
            家族だけで判断が難しいといった場合は、先に整理方針を相談しておくのも一つの方法です。
          </p>

          <AffiliateCtaBox
            title="スマホだけでなく、実家の遺品整理全体を相談したい方へ"
            serviceLead="ご家族だけで整理が難しい場合は、片付け・仕分け・回収までまとめて相談できるサービスを早めに確認しておくと、全体の見通しを立てやすくなります。"
            description="親のスマホの売却で迷っていても、実際にはスマホ単体ではなく、書類、家財、実家全体の片付けとつながっていることが少なくありません。初期化できない、契約やデータの確認が残っている、どこまで整理してから売ればよいか分からない場合は、まず無料見積もりで進め方を確認しておくと安心です。"
            buttonText="遺品整理110番を確認する"
            href="https://px.a8.net/svt/ejp?a8mat=4AZNCN+786GWQ+39GM+5MFLEA"
            lpName="digitalihin_007"
            lpId="guide_ihinseiri_digitalihin_007"
            position="bottom"
            programName="ihinseiri_110"
            ctaId="cta_digitalihin_007_consult"
            partnerCategory="estate_cleanup"
            sourceSection="consult"
            gaEventName="cta_click_digitalihin_007"
            summaryItems={[
              { label: 'サービス名', value: '遺品整理110番' },
              { label: '対応エリア', value: '全国対応です。' },
              { label: '相談内容', value: '遺品整理・片付け・回収の相談です。' },
              { label: '相談', value: '無料見積もりから確認できます。' },
            ]}
            operatorName="シェアリングテクノロジー株式会社"
          />
        </Section>

        <Section id="related" title="他の悩みともつながる理由">
          <p>
            親のスマホ売却の悩みは、スマホ単体の問題で終わらないことが多いです。実際には、スマホ、ネット銀行、サブスク、実家片付けとつながって考えた方が整理しやすくなります。
          </p>

          <div className="space-y-5">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">ネット銀行や支払いも気になる場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                スマホの中や通知履歴から、ネット銀行やカードの手がかりが見つかることがあります。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-002" className={secondaryLinkClass}>
                  親のネット銀行がわからないときの相続対応
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">サブスクや継続課金も気になる場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                スマホを売る前に、登録メールや課金先を確認しておいた方が安心なことがあります。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-003" className={secondaryLinkClass}>
                  亡くなった人のサブスクを解約できないときは？
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">実家全体の整理も必要な場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                スマホだけでなく、書類、通帳、家具、家電も含めて片付ける必要があることがあります。
              </p>
              <div className="mt-4">
                <Link href="/guide/jikka-kataduke/nanikara-a001" className={secondaryLinkClass}>
                  実家の片付けを何から始めるか
                </Link>
              </div>
            </div>
          </div>
        </Section>

        <Section id="ng" title="親のスマホ売却でやってはいけないこと">
          <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
            <CrossList
              items={[
                '初期化できないまま急いで売る',
                '契約や支払いを確認しないまま手放す',
                'スマホだけを単独で判断する',
                '実家の書類や他端末を見ずに処分する',
                '家族で確認する前に自己判断で進める',
              ]}
            />
          </div>

          <p>
            スマホを売ること自体が悪いわけではありません。問題は、
            <span className="font-semibold text-slate-900"> 確認が必要な段階で、売却だけを急ぐこと </span>
            です。
          </p>
        </Section>

        <Section id="faq" title="よくある質問">
          <FaqAccordion faqs={faqs} />
        </Section>

        <Section id="summary" title="まとめ｜親のスマホは売れるかより、今売ってよい状態かを先に確認する">
          <p>
            親のスマホは、初期化できなくても物理的に売れることはあります。
            ただし、亡くなった後のスマホは、単なる中古端末ではありません。契約や支払い、相続の手がかりが残っていることもあるため、
            <span className="font-semibold text-slate-900"> 「売れるか」よりも「今売ってよい状態か」 </span>
            を先に確認することが大切です。
          </p>

          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <ul className="space-y-3 text-[15px] leading-8 text-slate-700">
              <li>・まずは契約や支払いの手がかりを確認する</li>
              <li>・スマホ以外の書類や端末も一緒に見る</li>
              <li>・売る・保管する・処分するを比較する</li>
              <li>・自分で判断が難しければ、実家整理全体の相談も検討する</li>
            </ul>
          </div>

          <p>
            スマホの売却を急ぐより、全体を少しずつ整理する方が、結果として失敗しにくくなります。
          </p>
        </Section>

        <section className="mt-16 rounded-3xl bg-white p-6 ring-1 ring-slate-200">
          <h2 className="text-xl font-bold text-slate-900">あわせて確認したい記事</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Link
              href="/guide/ihinseiri/digitalihin-001"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">パスワードがわからない方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                親のスマホのパスワードがわからないときは？
              </p>
            </Link>

            <Link
              href="/guide/ihinseiri/digitalihin-005"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">スマホ解約も気になる方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                親が亡くなった後のスマホ解約の流れ
              </p>
            </Link>

            <Link
              href="/guide/ihinseiri/digitalihin-002"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">ネット銀行や支払いも気になる方</p>
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
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}