'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';

const toc = [
  { id: 'conclusion', label: 'まず結論｜最初にやること' },
  { id: 'why-hard', label: 'なぜサブスクは放置しやすいのか' },
  { id: 'check-first', label: '最初に確認したいこと' },
  { id: 'self-limit', label: '自力で進めにくいケース' },
  { id: 'consult', label: '相談を考えたいケース' },
  { id: 'related', label: '他の悩みともつながる理由' },
  { id: 'ng', label: 'やってはいけないこと' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ｜最短で失敗しない動き方' },
];

const faqs = [
  {
    q: '亡くなった人のサブスクは、まず何を確認すればいいですか？',
    a: 'まずはクレジットカード明細、口座引き落とし、携帯料金関連の請求、メール通知などを見て、継続課金がありそうなサービス名を把握することが大切です。スマホが開けなくても、紙の書類や通帳から手がかりが見つかることがあります。',
  },
  {
    q: 'スマホが開けないとサブスク解約はできませんか？',
    a: 'スマホが開けなくても、引き落とし履歴やメール、契約書類からサービス名の手がかりを探せる場合があります。まずは何の請求が続いていそうかを整理することが先です。',
  },
  {
    q: '何の請求かわからない場合はどうすればいいですか？',
    a: 'サービス名、引き落とし金額、請求元の名義などをメモして整理すると、確認しやすくなります。わからない請求が多い場合は、サブスクだけでなく相続全体の整理も視野に入れた方が安心です。',
  },
  {
    q: '借金や未払いの不安もある場合はどう考えればいいですか？',
    a: '継続課金だけでなく、借入や未払いも混ざっている可能性があります。見つかる請求だけを順番に止めるのではなく、相続放棄も含めて全体を整理した方が安心です。',
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

export default function DigitalIhin003Client() {
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
            <li className="text-slate-700">亡くなった人のサブスクを解約できないときは？</li>
          </ol>
        </nav>

        <header className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            役立ち情報｜デジタル遺品
          </div>

          <div className="mt-8">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-003/main-visual.webp"
              alt="クレジットカード明細やスマホ、ノートパソコンを前に、継続課金の手がかりを確認している様子"
            />
            <MicroCopy text="※スマホが開けなくても、クレジットカード明細、口座引き落とし、メール通知などから継続課金の手がかりが見つかることがあります。" />
          </div>

          <h1 className="mt-8 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            亡くなった人のサブスクを解約できないときは？
            <br className="hidden sm:block" />
            継続課金が不安なときに確認したいこと
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
            クレジットカード明細や口座引き落としを見て、「この請求は何だろう」と不安になることがあります。
            亡くなった人が使っていたサブスクは、スマホやアプリ中心で契約していることも多く、
            何が登録されているか分からず困る方は少なくありません。
            この記事では、最初に確認したいこと、自力で進めにくいケース、相続放棄も含めて考えたい場面を整理します。
          </p>
        </header>

        <section
          id="conclusion"
          className="mt-8 rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-200"
        >
          <h2 className="text-xl font-bold text-slate-900">
            まず結論｜サブスク名を特定することより、請求全体を整理することが先です
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-slate-700">
            亡くなった人のサブスクを解約できないときは、いきなり解約方法を探し回るよりも、
            クレジットカード明細、口座引き落とし、メール通知、スマホやパソコンの履歴から
            「どんな請求が続いていそうか」を整理することが先です。
            継続課金の中には、サブスクだけでなく、未払い、借入、会費などが混ざっている可能性もあります。
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-amber-100">
              <h3 className="text-base font-bold text-slate-900">最初にやること3つ</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    'クレジットカード明細、口座引き落とし、メール通知から請求を一覧にする',
                    'スマホだけでなく、パソコンや書類も含めて手がかりを探す',
                    '継続課金だけでなく、借金や未払いの可能性も同時に意識する',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-amber-100">
              <h3 className="text-base font-bold text-slate-900">後回しにしたいこと</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    'サービス名が分からないまま闇雲に解約先を探すこと',
                    'スマホの中だけに答えがあると思い込むこと',
                    '請求の全体像を見ないまま片付けを進めること',
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

        <Section id="why-hard" title="なぜサブスクは放置しやすいのか">
          <p>
            サブスクが厄介なのは、紙の契約書がなく、毎月自動で課金されていることが多いからです。
            契約した本人は覚えていても、ご家族から見ると何の請求か分かりにくいことがあります。
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">契約がデジタル完結</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                動画配信、音楽、クラウド、会員サービスなどは、アプリやWeb上で完結していることが多いです。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">請求名だけでは分かりにくい</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                明細に表示される名義だけでは、どのサービスの請求か判断しにくいことがあります。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">他の請求と混ざりやすい</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                サブスクの継続課金と、未払い、借入、会費などが同じ口座やカードから落ちていることもあります。
              </p>
            </div>
          </div>
        </Section>

        <Section id="check-first" title="亡くなった人のサブスクを解約できないときに最初に確認したいこと">
          <p>
            サブスクの解約で困ったときは、まず「解約方法」ではなく、
            「どんな請求が、どこから、いくらで続いていそうか」を整理することが大切です。
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">確認したいもの</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    'クレジットカード明細',
                    '口座引き落とし履歴',
                    'メール通知や領収書メール',
                    'スマホやパソコンのアプリ・ブックマーク',
                    '携帯会社や会員サービス関連の郵便物',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">整理の考え方</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    'サービス名が分からなくても請求元名義を控える',
                    '毎月いくら落ちているかを一覧にする',
                    '継続課金だけでなく借金や未払いの可能性も見る',
                    'スマホが開けなくても他の資料で確認を進める',
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="mt-2">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-003/check-items.webp"
              alt="クレジットカード明細、スマホ、ノートパソコン、書類を並べて継続課金の手がかりを確認している様子"
            />
            <MicroCopy text="※継続課金の全体像を先に整理すると、何を止めるべきか、どこまで確認が必要かを判断しやすくなります。" />
          </div>

          <p>
            ここでは完璧に特定しきれなくても大丈夫です。まずは「請求が続いていそうなもの」を洗い出すだけでも前進です。
          </p>
        </Section>

        <Section id="self-limit" title="自力で進めにくいケース">
          <p>
            ある程度までは自力で整理できても、次のようなケースでは、サブスク解約だけで終わらないことがあります。
          </p>

          <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
            <DotList
              items={[
                '何の請求か分からないものが複数ある',
                'スマホが開けず、アプリやメールが確認できない',
                'クレジットカードや口座引き落としが多く、全体像が見えない',
                'サブスクだけでなく借金や未払いの不安もある',
                '相続全体の手続きも同時に進める必要がある',
              ]}
            />
          </div>

          <p>
            この場合は、継続課金だけを順番に止めるより、相続全体の整理の中で考えた方が進めやすくなることがあります。
          </p>
        </Section>

        <Section id="consult" title="相談を考えたいケース">
          <p>
            サブスクの請求が見つかったときに怖いのは、単に毎月少額が落ち続けることだけではありません。
            その中に、未払い、借入、保証料、会費など、性質の違う支払いが混ざっている可能性があることです。
          </p>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">相談を考えたいケース</h3>
            <div className="mt-4">
              <DotList
                items={[
                  '何の請求か分からないものが複数ある',
                  '継続課金と負債の区別がつかない',
                  '相続放棄も視野に入れた方がよさそう',
                  '家族だけで整理を続けるのが不安',
                ]}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <h3 className="text-lg font-bold text-slate-900">放置のリスク</h3>
            <p className="mt-3 text-[15px] leading-8 text-slate-700">
              サブスクだけだと思っていた請求の中に、未払い金や借入関連の支払いが混ざっていると、
              「少額だから大丈夫」と放置してしまいやすいです。けれど、見落としたまま相続を進めると、
              後から全体の整理がやり直しになりやすくなります。
            </p>
            <p className="mt-3 text-[15px] leading-8 text-slate-700">
              サブスクの解約で困っているように見えても、実際には相続放棄や負債確認も含めて整理した方が安全なケースがあります。
            </p>
          </div>

          <div className="mt-2">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-003/consult-scene.webp"
              alt="複数の請求書類を前に、専門家に相談して安心している遺族の様子"
            />
            <MicroCopy text="※何の請求か分からないものが複数ある場合は、継続課金だけでなく相続全体の整理として考えた方が安心です。" />
          </div>

          <div className="rounded-2xl bg-rose-50 p-6 ring-1 ring-rose-100">
            <h3 className="text-xl font-bold text-slate-900">借金や未払いが気になる方へ</h3>
            <p className="mt-4 text-[15px] leading-8 text-slate-700">
              督促状や借入明細が見つかった場合は、サブスク解約だけで進めず、
              相続放棄も含めて期限や流れを先に確認してください。
            </p>
            <div className="mt-5">
              <Link href="/souzoku-houki" className={secondaryLinkClass}>
                相続放棄について確認する
              </Link>
            </div>
          </div>
        </Section>

        <Section id="related" title="他の悩みともつながる理由">
          <p>
            サブスクの問題は、スマホ、ネット銀行、実家片付けともつながっています。
            継続課金だけを単独で止めようとするより、家の中に残っている資料や他の記事もあわせて見る方が整理しやすくなります。
          </p>

          <div className="space-y-5">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">スマホが開けない場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                アプリやメール通知の確認がしにくいため、他の端末や紙の資料も含めて考える必要があります。
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
                継続課金の引き落とし先から、ネット銀行や証券口座の手がかりが見えてくることもあります。
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
                継続課金の手がかりは、郵便物、パソコン、メモ、カード類の中にも残っていることがあります。実家片付けの視点も重要です。
              </p>
              <div className="mt-4">
                <Link href="/guide/jikka-kataduke/nanikara-a001" className={secondaryLinkClass}>
                  実家の片付けを何から始めるか
                </Link>
              </div>
            </div>
          </div>
        </Section>

        <Section id="ng" title="亡くなった人のサブスクを解約できないときにやってはいけないこと">
          <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
            <CrossList
              items={[
                'サービス名が分からないまま闇雲に解約先を探す',
                'スマホの中だけに答えがあると思い込む',
                '継続課金だけを見て安心してしまう',
                '借金や未払いの可能性を見ないまま片付けを進める',
              ]}
            />
          </div>

          <p>
            見つかった請求だけを順番に止めれば終わるとは限りません。継続課金の背後に、未払い、借入、相続全体の整理が隠れていることもあります。
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
              <h3 className="text-base font-bold text-slate-900">借金や未払いが気になる方へ</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                継続課金に見える請求の中に、別の支払いが混ざっている場合は、相続放棄も含めて確認した方が安心です。
              </p>
              <div className="mt-4">
                <Link href="/souzoku-houki" className={secondaryLinkClass}>
                  相続放棄について確認する
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">相続全体の整理が必要な方へ</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                サブスクだけでなく、名義変更や相続全体の流れも整理したい場合は、先に全体像を確認しておくと動きやすいです。
              </p>
              <div className="mt-4">
                <Link href="/souzoku-tetsuzuki" className={secondaryLinkClass}>
                  相続手続きの相談先を確認する
                </Link>
              </div>
            </div>
          </div>
        </Section>

        <Section id="faq" title="よくある質問">
          <FaqAccordion faqs={faqs} />
        </Section>

        <Section id="summary" title="まとめ｜亡くなった人のサブスクを解約できないときに最短で失敗しない動き方">
          <p>
            亡くなった人のサブスクを解約できないときは、いきなり解約方法を探し回るより、
            まず何の請求が続いているのかを整理することが大切です。
          </p>

          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <ul className="space-y-3 text-[15px] leading-8 text-slate-700">
              <li>・クレジットカード明細や口座引き落としから請求を一覧にする</li>
              <li>・スマホだけでなく、メール、パソコン、書類も確認する</li>
              <li>・継続課金だけでなく、未払い、借金の可能性も意識する</li>
              <li>・何の請求か分からないものが多い場合は、相続全体の整理として考える</li>
            </ul>
          </div>

          <p>
            少額の請求でも、放置すると全体像が見えにくくなります。継続課金に見えるものの中に、
            他の支払いが混ざっていることもあるため、不安がある場合は早めに整理の方針を決めることが大切です。
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
              href="/souzoku-houki"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">負債や未払いも不安な方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                相続放棄の流れと注意点
              </p>
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}