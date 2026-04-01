'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AffiliateCtaBox from '@/components/AffiliateCtaBox';
import SiteFooter from '@/components/SiteFooter';

const toc = [
  { id: 'conclusion', label: 'まず結論｜最初に整理したいこと' },
  { id: 'method', label: '故人のスマホを見る方法で先に考えたい確認手段' },
  { id: 'purpose', label: '何を確認したいのかを整理する' },
  { id: 'iphone-android', label: 'iPhone・Androidで考え方は違う？' },
  { id: 'data', label: '故人のスマホのデータはどう考える？' },
  { id: 'next-step', label: '確認目的ごとに次の一手を決める' },
  { id: 'ng', label: 'やってはいけないこと' },
  { id: 'consult', label: '自分で整理が難しいときの相談先' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ｜最短で失敗しない動き方' },
];

const faqs = [
  {
    q: '故人のスマホは家族が見てもよいですか？',
    a: '確認が必要な事情で中身を見たいと考える方は多いです。ただし、興味本位で見るのではなく、何を確認したいのかを先に整理しておくと混乱しにくくなります。',
  },
  {
    q: '亡くなった人のスマホはどうなりますか？',
    a: 'そのまま何もしなければ、契約や課金、保存データなどが残り続けることがあります。まずは何を整理すべきかを考えることが大切です。',
  },
  {
    q: '故人のスマホのデータはどうすればいいですか？',
    a: 'すぐに消すのではなく、まず確認が必要なものがあるかを考えるのがおすすめです。見ること、消すこと、処分することは分けて考えた方が安心です。',
  },
  {
    q: '亡くなった人のiPhoneのロック解除はできますか？',
    a: 'iPhoneでもAndroidでも、まずは無理に解除を急がず、何を確認したいのかを整理した方が進めやすいです。ロック解除そのものを目的にしないことが大切です。',
  },
  {
    q: 'パスワードがわからないと何も確認できませんか？',
    a: 'スマホ以外にも、郵便物、通帳、パソコン、メモなどから確認できることがあります。スマホだけで答えを探さない方が整理しやすいです。',
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

export default function DigitalIhin008Client() {
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
            <li className="text-slate-700">故人のスマホを見る方法は？</li>
          </ol>
        </nav>

        <header className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            役立ち情報｜デジタル遺品
          </div>

          <div className="mt-8">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-008/main-visual.png"
              alt="故人のスマホや書類を前に、何を確認したいのかを落ち着いて整理している様子"
            />
            <MicroCopy text="※故人のスマホは、無理にロック解除を急ぐより、まず何を確認したいのかを整理した方が進めやすいことがあります。" />
          </div>

          <h1 className="mt-8 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            故人のスマホを見る方法は？
            <br className="hidden sm:block" />
            ロック解除を急ぐ前に確認したいこと
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
            故人のスマホを前にすると、「中を確認しないと何も進められないのでは」と不安になりやすいです。
            実際、連絡先、写真、契約情報、サブスク、ネット銀行の手がかりなど、生活や手続きに関わる情報がスマホに集まっていることもあります。
            ただし、故人のスマホは、とにかく開けばよいというものでもありません。大切なのは、無理にロック解除を急ぐことではなく、
            まず何を確認したいのか、そして今ある手がかりでどこまで確認できるのかを整理することです。
          </p>

          <div className="mt-6 rounded-2xl bg-amber-50 px-5 py-4 ring-1 ring-amber-200">
            <p className="text-sm leading-7 text-slate-700">
              故人のスマホを見る方法を考えるときは、
              <span className="font-semibold text-slate-900"> 「どう開くか」だけでなく、「何を確認したいか」 </span>
              を先に整理した方が、結果として早く進みやすいです。
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <a
              href="#method"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              見る方法を先に確認する
            </a>
            <a
              href="#purpose"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              確認目的を整理する
            </a>
            <a
              href="#consult"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              自分で難しい場合の相談先を見る
            </a>
          </div>
        </header>

        <section
          id="conclusion"
          className="mt-8 rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-200"
        >
          <h2 className="text-xl font-bold text-slate-900">
            まず結論｜故人のスマホは、無理に開く前に「何を確認したいか」を整理する
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-slate-700">
            故人のスマホを見たい理由は、興味本位ではなく、たいてい実務的な確認のためです。
            通信契約、サブスク、資産の手がかり、連絡先など、目的が分かると優先順位も決まりやすくなります。
            ロック解除そのものを先に目指すより、何を確認したいのかを整理した方が、結果として進めやすいことが多いです。
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-amber-100">
              <h3 className="text-base font-bold text-slate-900">最初に整理したい3つ</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    'どうやって確認できそうか',
                    '何を確認したいのか',
                    '無理に開かずに済むものはないか',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-amber-100">
              <h3 className="text-base font-bold text-slate-900">確認したいことの代表例</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '通信契約やスマホ解約',
                    'サブスクや毎月の請求',
                    'ネット銀行や資産の手がかり',
                    '家族や知人への連絡先',
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

        <Section id="method" title="故人のスマホを見る方法で先に考えたい現実的な確認手段">
          <p>
            故人のスマホの中身を見たいとき、最初からロック解除だけを考えると手が止まりやすくなります。
            まずは、現実的に確認できる手段を整理した方が進めやすいです。
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">ロック解除できなくても確認しやすいもの</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '郵便物',
                    '通帳やカード利用明細',
                    'パソコンやタブレット',
                    'メモや手帳',
                    '契約書類',
                    '外付け機器',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">スマホ本体を見る前に整理したいこと</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '端末はiPhoneかAndroidか',
                    '画面ロックなのか、アカウント情報が分からないのか',
                    '端末は起動するか',
                    '家族が把握している情報はあるか',
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
            <h3 className="text-base font-bold text-slate-900">自力で確認が難しい場合は、無理に進めない</h3>
            <div className="mt-4">
              <CrossList
                items={[
                  '当てずっぽうで何度も入力する',
                  '初期化や削除を急ぐ',
                  'スマホだけに答えがあると思い込む',
                ]}
              />
            </div>
          </div>

          <p>
            まずは、他端末や書類から情報を集め、
            <span className="font-semibold text-slate-900"> 本当にスマホの中を見ないと確認できないことは何か </span>
            を先に整理した方が安心です。
          </p>
        </Section>

        <Section id="purpose" title="故人のスマホの中身を見たいとき、まず整理したい確認目的">
          <p>
            スマホの中身を見たい理由を整理すると、次の一手が決まりやすくなります。
          </p>

          <div className="space-y-5">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-lg font-bold text-slate-900">通信契約やスマホ解約のために見たい</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                契約キャリア、料金、名義、回線整理などを確認したいケースです。
                この場合は、スマホの中身だけでなく、請求書類や契約関連の郵送物もあわせて見た方が進めやすくなります。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-005" className={secondaryLinkClass}>
                  親が亡くなった後のスマホ解約の流れ
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-lg font-bold text-slate-900">サブスクや毎月の請求を確認したい</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                動画配信、音楽配信、アプリ課金、継続課金などを確認したいケースです。
                この場合は、メール通知やカード明細、登録サービスの履歴も重要な手がかりになります。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-003" className={secondaryLinkClass}>
                  亡くなった人のサブスクを解約できないときは？
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-lg font-bold text-slate-900">ネット銀行や資産の手がかりを探したい</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                銀行アプリ、証券アプリ、メール通知、決済サービスなどの存在を確認したいケースです。
                スマホだけでなく、通帳、郵便物、パソコンも一緒に見た方が安心です。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-002" className={secondaryLinkClass}>
                  親のネット銀行がわからないときの相続対応
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-lg font-bold text-slate-900">連絡先や生活情報を確認したい</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                家族や知人への連絡、会員サービス、仕事や生活の連絡先などを確認したいケースです。
                ただし、ここでも「何を確認する必要があるのか」を先に決めておくと、余計な混乱を減らしやすくなります。
              </p>
            </div>
          </div>
        </Section>

        <Section id="iphone-android" title="亡くなった人のiPhone・Androidで考え方は違う？">
          <p>
            故人のスマホを見る方法を考えるとき、iPhoneかAndroidかで止まりやすい場所は少し変わります。
            ただし、根本の考え方は共通です。
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">iPhoneで止まりやすいポイント</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '画面ロック',
                    'Apple ID',
                    '初期化と中身確認の違いを混同しやすい',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">Androidで止まりやすいポイント</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '画面ロック',
                    'Googleアカウント',
                    '端末ごとの差で混乱しやすい',
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <h3 className="text-base font-bold text-slate-900">共通して大事なこと</h3>
            <div className="mt-4">
              <DotList
                items={[
                  '無理に解除を繰り返さない',
                  'まずは確認目的を整理する',
                  '他の手がかりを見ながら進める',
                ]}
              />
            </div>
          </div>
        </Section>

        <Section id="data" title="故人のスマホのデータはどう考えればいい？">
          <p>
            故人のスマホを見たいとき、気になるのが中のデータです。ただし、
            <span className="font-semibold text-slate-900"> 見ること、消すこと、処分することは別 </span>
            に考えた方が整理しやすくなります。
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">まずは消さずに、確認が必要かを考える</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '写真',
                    'メール',
                    '契約情報',
                    '資産の手がかり',
                    '会員サービスの情報',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
              <h3 className="text-base font-bold text-slate-900">急いで初期化・処分しない方がよいケース</h3>
              <div className="mt-4">
                <CrossList
                  items={[
                    '契約や支払いの整理が終わっていない',
                    'サブスクや銀行の手がかりが残っていそう',
                    '他の遺品や書類もまだ十分に見られていない',
                  ]}
                />
              </div>
            </div>
          </div>

          <p>
            まずは「何を確認するのか」を決めることが先です。見ることと、消すことと、処分することをごちゃ混ぜにしない方が安心です。
          </p>
        </Section>

        <Section id="next-step" title="確認目的ごとに次の一手を決める">
          <p>
            「見る目的」が整理できたら、次に何をするかを決めやすくなります。
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">通信契約を確認したい</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                契約キャリアや解約の流れを確認したい方は、スマホ解約の記事へ進むと整理しやすいです。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-005" className={secondaryLinkClass}>
                  親が亡くなった後のスマホ解約の流れ
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">課金や請求を止めたい</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                サブスクや継続課金の整理を優先したい方は、サブスク整理の記事へ進むと分かりやすいです。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-003" className={secondaryLinkClass}>
                  亡くなった人のサブスクを解約できないときは？
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">口座や資産を確認したい</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                銀行や資産の手がかりを優先したい方は、ネット銀行整理の記事へ進むと整理しやすいです。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-002" className={secondaryLinkClass}>
                  親のネット銀行がわからないときの相続対応
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">相続全体の流れも整理したい</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                スマホだけでなく、相続や名義変更も含めて全体像を知りたい方は、相続手続きLPも参考になります。
              </p>
              <div className="mt-4">
                <Link href="/souzoku-tetsuzuki" className={secondaryLinkClass}>
                  相続手続きの流れと相談先
                </Link>
              </div>
            </div>
          </div>
        </Section>

        <Section id="ng" title="故人のスマホを見るときにやってはいけないこと">
          <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
            <CrossList
              items={[
                '何を確認したいか決めずに操作する',
                '当てずっぽうで何度も解除を試す',
                '興味本位で中身を見る',
                'スマホだけに答えがあると思い込む',
                '書類や他端末を見ずに自己判断する',
              ]}
            />
          </div>

          <p>
            スマホを見ること自体が目的になると、必要な確認とそうでない確認の区別がつきにくくなります。
            大切なのは、
            <span className="font-semibold text-slate-900"> 確認の目的に沿って必要な情報だけを整理すること </span>
            です。
          </p>
        </Section>

        <Section id="consult" title="自分で整理が難しいときは、実家全体の片付けや相続整理の中で考える">
          <p>
            故人のスマホの悩みは、スマホ単体では終わらないことが多いです。
            実際には、書類、通帳、パソコン、家財、契約整理とつながっているケースが少なくありません。
          </p>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">実家全体の整理も必要になりやすいケース</h3>
            <div className="mt-4">
              <DotList
                items={[
                  '書類や通帳も多く、どこから見ればよいか分からない',
                  'スマホだけでなくパソコンやタブレットもある',
                  '実家の片付け全体を同時に進める必要がある',
                  '遠方で時間が限られている',
                  '家族だけで判断しきれない',
                ]}
              />
            </div>
          </div>

          <AffiliateCtaBox
            title="スマホだけでなく、実家の遺品整理全体を相談したい方へ"
            serviceLead="ご家族だけで整理が難しい場合は、片付け・仕分け・回収までまとめて相談できるサービスを早めに確認しておくと、全体の見通しを立てやすくなります。"
            description="故人のスマホの中身確認で悩んでいても、実際にはスマホ単体ではなく、書類、通帳、パソコン、実家全体の片付けとつながっていることが少なくありません。物量が多い場合や、遠方で何度も通えない場合、家族だけで対応が難しい場合は、まず無料見積もりで整理の進め方を確認しておくと安心です。"
            buttonText="遺品整理110番を確認する"
            href="https://px.a8.net/svt/ejp?a8mat=4AZNCN+786GWQ+39GM+5MFLEA"
            lpName="digitalihin_008"
            lpId="guide_ihinseiri_digitalihin_008"
            position="bottom"
            programName="ihinseiri_110"
            ctaId="cta_digitalihin_008_cleanup"
            partnerCategory="estate_cleanup"
            sourceSection="consult"
            gaEventName="cta_click_digitalihin_008"
            summaryItems={[
              { label: 'サービス名', value: '遺品整理110番' },
              { label: '対応エリア', value: '全国対応です。' },
              { label: '相談内容', value: '遺品整理・片付け・回収の相談です。' },
              { label: '相談', value: '無料見積もりから確認できます。' },
            ]}
            operatorName="シェアリングテクノロジー株式会社"
          />

          <div className="mt-8">
            <AffiliateCtaBox
              title="資産や相続全体の整理も相談したい方へ"
              description="故人のスマホの中身を確認したい理由が、銀行や資産の手がかり、相続全体の整理につながる場合は、相続税や相談先も含めて整理した方が安心です。費用感や相談先の候補を早めに把握したい方に向いています。"
              buttonText="税理士ドットコムで無料相談する"
              href="https://h.accesstrade.net/sp/cc?rk=0100kl2m00oq1p"
              lpName="digitalihin_008"
              lpId="guide_ihinseiri_digitalihin_008"
              position="bottom"
              programName="zeirishi_dotcom"
              ctaId="cta_digitalihin_008_zeirishi"
              partnerCategory="tax_accountant_service"
              sourceSection="consult"
              gaEventName="cta_click_digitalihin_008"
              summaryItems={[
                { label: '相談内容', value: '相続税申告・税理士探しの相談' },
                { label: 'こんな方に', value: '相続全体の費用や税務も気になる方' },
                { label: 'タイミング', value: '手続きの全体像を整理したいとき' },
              ]}
            />
          </div>
        </Section>

        <Section id="faq" title="よくある質問">
          <FaqAccordion faqs={faqs} />
        </Section>

        <Section id="summary" title="まとめ｜故人のスマホを見る方法より、まず確認目的と優先順位を整理する">
          <p>
            故人のスマホを見る方法を考えるとき、どうしても「どう開くか」に意識が向きやすいです。
            でも本当に大切なのは、
            <span className="font-semibold text-slate-900"> 何を確認したいのか、今どこまで確認できるのかを先に整理すること </span>
            です。
          </p>

          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <ul className="space-y-3 text-[15px] leading-8 text-slate-700">
              <li>・まずは現実的な確認手段を整理する</li>
              <li>・通信・課金・資産・連絡先のどれを優先するか決める</li>
              <li>・ロック解除だけを目的にしない</li>
              <li>・難しい場合はスマホ単体で抱え込まない</li>
            </ul>
          </div>

          <p>
            スマホを見ること自体が目的ではなく、その先の手続きや整理を前に進めることが本来の目的です。
            焦って無理に開こうとするより、優先順位を整理しながら進めた方が、結果として失敗しにくくなります。
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
              <p className="text-sm font-semibold text-slate-500">スマホ解約を進めたい方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                親が亡くなった後のスマホ解約の流れ
              </p>
            </Link>

            <Link
              href="/guide/ihinseiri/digitalihin-003"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">サブスクや請求を整理したい方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                亡くなった人のサブスクを解約できないときは？
              </p>
            </Link>

            <Link
              href="/guide/ihinseiri/digitalihin-002"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">資産や口座の手がかりを確認したい方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                親のネット銀行がわからないときの相続対応
              </p>
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}