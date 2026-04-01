'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AffiliateCtaBox from '@/components/AffiliateCtaBox';
import SiteFooter from '@/components/SiteFooter';

const toc = [
  { id: 'conclusion', label: 'まず結論｜最初にやること' },
  { id: 'why-not-trash', label: '遺品のパソコンをそのまま捨ててはいけない理由' },
  { id: 'check-first', label: '捨てる前に確認したいこと' },
  { id: 'data-erase', label: 'データ消去の考え方' },
  { id: 'dispose-methods', label: '処分方法を比較する' },
  { id: 'cannot-init', label: '初期化できない・ログインできないときはどうするか' },
  { id: 'consult', label: '業者に頼んだ方がよいケース' },
  { id: 'related', label: '他の悩みともつながる理由' },
  { id: 'ng', label: 'やってはいけないこと' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ｜最短で失敗しない動き方' },
];

const faqs = [
  {
    q: '遺品のパソコンはそのまま捨てても大丈夫ですか？',
    a: 'そのまま捨てるのはおすすめしにくいです。写真、契約情報、ネット銀行やクレジットカードの履歴、メール、仕事のファイルなどが残っている可能性があります。まずは処分前に確認が必要な情報がありそうかを整理してください。',
  },
  {
    q: 'パソコンの電源が入らない場合はどうすればいいですか？',
    a: '無理に分解したり何度も起動を試したりするより、まずは外付けHDD、USBメモリ、紙のメモ、通信関連の書類、スマホなど周辺の手がかりを確認するのがおすすめです。パソコンだけに答えがあるとは限りません。',
  },
  {
    q: '初期化できないときでも処分できますか？',
    a: '初期化できない場合でも、処分方法はあります。ただし、確認が必要な情報が残っていないかを見たうえで、データ消去や回収の考え方を整理してから進めた方が安心です。',
  },
  {
    q: 'スマホや書類も多くて何から始めればよいかわかりません。',
    a: 'パソコンだけを単独で処分しようとせず、実家全体の片付けの中で確認対象と処分対象を分ける方が進めやすいです。特に遠方の実家や物量が多い場合は、最初に保留にするものを分けると混乱しにくくなります。',
  },
  {
    q: 'パソコン以外の遺品も多い場合はどう考えればよいですか？',
    a: 'その場合は、パソコン処分だけで終わらないことが多いです。スマホ、通帳、郵便物、家具、家電などと一緒に、実家全体の片付けとして考えた方が、後からやり直しになりにくいです。',
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
            <li className="text-slate-700">遺品のパソコンはどう捨てる？</li>
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
            遺品のパソコンはどう捨てる？
            <br className="hidden sm:block" />
            安全な処分方法とやってはいけないこと
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
            遺品のパソコンは、そのまま捨てたり急いで初期化したりする前に、
            中に確認すべき情報が残っていないかを整理することが大切です。
            写真やメールだけでなく、契約情報、ネット銀行の手がかり、会員サイト、仕事のファイルなどが
            入っていることもあります。この記事では、遺品のパソコンを安全に処分するために、
            先に確認したいこと、データ消去の考え方、処分方法の違いを順番に整理します。
          </p>

          <div className="mt-6 rounded-2xl bg-amber-50 px-5 py-4 ring-1 ring-amber-200">
            <p className="text-sm leading-7 text-slate-700">
              遺品のパソコンは、初期化できない場合でも処分方法があります。まずは急いで手放さず、
              確認すべきものと処分してよいものを分けるのがおすすめです。
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href="#dispose-methods"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              処分方法を先に見る
            </a>
            <a
              href="#consult"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              遺品整理の相談先を見る
            </a>
          </div>
        </header>

        <section
          id="conclusion"
          className="mt-8 rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-200"
        >
          <h2 className="text-xl font-bold text-slate-900">
            まず結論｜遺品のパソコンは、そのまま捨てずに確認してから処分する
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-slate-700">
            遺品のパソコンは、いきなり初期化したり捨てたりするより、
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

        <Section id="why-not-trash" title="遺品のパソコンをそのまま捨ててはいけない理由">
          <p>
            遺品のパソコンが難しいのは、単なる家電ではなく、故人の生活や契約の入口になっていることがあるからです。
            家族からは見えにくい情報がまとまって入っているため、そのまま捨てると後から困ることがあります。
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
              <h3 className="text-base font-bold text-slate-900">情報漏えいの不安がある</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                個人情報やログイン情報が残っている可能性があるため、処分方法とデータ消去の考え方を分けて考える必要があります。
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

        <Section id="data-erase" title="データ消去の考え方">
          <p>
            遺品のパソコン処分で不安になりやすいのが、データ消去です。
            ただし、データを消すことと、捨て方を決めることは分けて考えた方が整理しやすくなります。
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">先に意識したいこと</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '確認すべき情報が残っていないかを見る',
                    'スマホや書類に手がかりが残っていないか合わせて確認する',
                    '外付けHDDやUSBメモリも忘れずに見る',
                    '処分だけ急がず、保留にする期間を持つ',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
              <h3 className="text-base font-bold text-slate-900">急いでやらない方がいいこと</h3>
              <div className="mt-4">
                <CrossList
                  items={[
                    '確認前に初期化する',
                    'ログインできないまま自己判断で進める',
                    '周辺機器を見ずに本体だけ処分する',
                    '実家の他の遺品を確認せずに終わらせる',
                  ]}
                />
              </div>
            </div>
          </div>

          <p>
            「安全に捨てたい」という気持ちが強いと、すぐに消去へ進みたくなりますが、
            まずは確認対象と処分対象を分けて考えることが失敗を減らす近道です。
          </p>
        </Section>

        <Section id="dispose-methods" title="遺品のパソコンの処分方法を比較する">
          <p>
            遺品のパソコン処分には、自治体回収、メーカー回収、回収業者、遺品整理の中でまとめて進める方法などがあります。
            どれがよいかは、パソコン単体なのか、実家全体の片付けの一部なのかで変わります。
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">パソコン単体で進める方法</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                他に片付けるものが少なく、確認もほぼ終わっている場合は、単体処分を考えやすいです。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">保留にして後で処分する方法</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                契約や資産の手がかりが残っていそうなら、先に保留にして他の遺品確認を進める方が安心です。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">実家片付けと一緒に進める方法</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                遺品が多い場合は、パソコンだけ切り出すより、実家片付け全体の中で進めた方が楽なことがあります。
              </p>
            </div>
          </div>
        </Section>

        <Section id="cannot-init" title="初期化できない・ログインできないときはどうするか">
          <p>
            パソコン処分でよく困るのが、「パスワードがわからない」「初期化できない」「電源が入らない」というケースです。
            こうした場合でも、すぐに詰みではありません。
          </p>

          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <DotList
              items={[
                'まずは周辺のスマホ、書類、メモ、外付け機器の確認を優先する',
                'ログインできないなら、確認対象としていったん保留にする',
                '本体だけで判断せず、実家全体の整理と一緒に考える',
                '自力で難しい場合は、処分方法だけでなく整理方針ごと相談する',
              ]}
            />
          </div>

          <p>
            初期化できないこと自体よりも、「確認が必要かもしれないのに急いで処分する」ことの方が失敗につながりやすいです。
          </p>
        </Section>

        <Section id="consult" title="業者に頼んだ方がよいケース">
          <p>
            遺品のパソコン処分で悩んでいるように見えても、実際にはスマホ、通帳、郵便物、家具、家電など、
            他の整理とつながっていることが少なくありません。
            そのため、パソコンだけ個別に処分するより、実家全体の片付けとして考えた方が動きやすい場合があります。
          </p>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">業者相談を考えたいケース</h3>
            <div className="mt-4">
              <DotList
                items={[
                  'パソコン以外にも整理する遺品が多い',
                  '短い日程でまとめて進めたい',
                  '確認不足で後からやり直したくない',
                  '家族だけでは手が足りない',
                  '遠方の実家で何度も通えない',
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
            title="パソコンだけでなく、実家の遺品整理全体を進めたい方へ"
            serviceLead="ご家族だけで整理が難しい場合は、片付け・仕分け・回収までまとめて相談できるサービスを早めに確認しておくと、全体の見通しを立てやすくなります。"
            description="遺品のパソコン処分は、パソコン単体で考えるより、スマホや書類、家具、家電も含めた実家全体の片付けの中で整理した方が進みやすいことがあります。物量が多い場合や、遠方で何度も通えない場合、家族だけで対応が難しい場合は、まず無料見積もりで費用感や進め方を確認しておくと安心です。"
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
            パソコン処分の悩みは、スマホ、ネット銀行、実家片付けともつながっています。
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

        <Section id="summary" title="まとめ｜遺品のパソコンを安全に処分するための進め方">
          <p>
            遺品のパソコンは、すぐに捨てるのではなく、まず確認対象として扱うのが基本です。
            周辺の書類やスマホ、外付け機器も含めて、契約や資産、写真などの手がかりがないかを整理してから処分を考える方が安心です。
          </p>

          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <ul className="space-y-3 text-[15px] leading-8 text-slate-700">
              <li>・パソコン本体をすぐ捨てずに確認対象として分ける</li>
              <li>・スマホ、書類、外付けHDD、メモも一緒に見る</li>
              <li>・データ消去と処分方法は分けて考える</li>
              <li>・遺品が多い場合は実家全体の片付けとして考える</li>
              <li>・家族だけで難しい場合は業者相談も検討する</li>
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