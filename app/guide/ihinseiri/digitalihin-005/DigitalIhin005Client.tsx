'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AffiliateCtaBox from '@/components/AffiliateCtaBox';
import SiteFooter from '@/components/SiteFooter';

const toc = [
  { id: 'conclusion', label: 'まず結論と最初にやること' },
  { id: 'why-hard', label: 'なぜスマホ解約はすぐ進めにくいのか' },
  { id: 'check-first', label: '解約前に確認したいこと' },
  { id: 'self-limit', label: '自力で進めにくいケース' },
  { id: 'consult', label: '実家片付け全体で考えたいケース' },
  { id: 'related', label: '他の悩みともつながる理由' },
  { id: 'ng', label: 'やってはいけないこと' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめと最短で失敗しない動き方' },
];

const faqs = [
  {
    q: '親が亡くなった後のスマホはすぐ解約した方がよいですか？',
    a: '料金負担が気になっても、すぐに解約する前に、スマホの中に契約や資産の手がかりが残っていないかを整理する方が安心です。電話番号の承継を考える場合や、メール、SMS、金融アプリの確認が必要な場合もあります。',
  },
  {
    q: 'スマホのパスワードがわからない場合でも解約できますか？',
    a: '契約者死亡後の解約手続き自体は進められる場合がありますが、スマホの中の情報確認は別の問題です。スマホが開けなくても、請求書、口座引き落とし、郵便物、他の端末などから手がかりを探せることがあります。',
  },
  {
    q: '承継と解約のどちらを選ぶか迷います。',
    a: 'その電話番号を今後も使いたいか、SMS認証や連絡先として残したい事情があるかで考えると整理しやすいです。番号を残したいなら承継、不要なら解約の方向で検討するとわかりやすいです。',
  },
  {
    q: 'スマホ以外にもパソコンや書類が多い場合はどうすればよいですか？',
    a: 'その場合は、スマホ解約だけを単独で考えるより、実家全体の片付けやデジタル遺品整理の中で順番を整理する方が進めやすいです。確認対象を分けて、後回しにしないものを先に決めるのがおすすめです。',
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

export default function DigitalIhin005Client() {
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
            <li className="text-slate-700">
              親が亡くなった後のスマホ解約の流れと解約前に確認したいこと
            </li>
          </ol>
        </nav>

        <header className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            役立ち情報｜デジタル遺品
          </div>

          <div className="mt-8">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-005/main-visual.png"
              alt="亡くなった親のスマホ、書類、封筒、メモを前に解約前の確認事項を整理している様子"
            />
            <MicroCopy text="※スマホはすぐに解約する前に、電話番号の扱い、契約情報、メールやSMSの手がかりを確認しておくと進めやすくなります。" />
          </div>

          <h1 className="mt-8 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            親が亡くなった後のスマホ解約の流れと解約前に確認したいこと
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
            親が亡くなった後、毎月の通信費が気になってスマホを早く解約したいと思う方は多いです。
            ただ、スマホの中には、メール、SMS、銀行やクレジットカードの通知、サブスク、連絡先など、
            先に確認したい情報が残っていることがあります。
            この記事では、承継か解約かの考え方、解約前に確認したいこと、自力で進めにくいケース、
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
            親のスマホは、料金だけを見てすぐ解約するより、まずは電話番号を残すべきか、
            スマホの中に確認したい契約や資産の手がかりがないかを整理することが先です。
            スマホ単体で考えず、パソコン、郵便物、通帳、クレジットカード明細なども合わせて見ると、
            後から困りにくくなります。
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-amber-100">
              <h3 className="text-base font-bold text-slate-900">最初にやること3つ</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    'その電話番号を承継したいか解約したいかを整理する',
                    'スマホの中や周辺資料に確認したい情報が残っていそうかを見る',
                    'スマホ以外の端末や書類も含めて手がかりを集める',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-amber-100">
              <h3 className="text-base font-bold text-slate-900">後回しにしたいこと</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '料金だけを見てすぐ解約すること',
                    'スマホの中だけに答えがあると思い込むこと',
                    '実家全体の整理と切り離して考えること',
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

        <Section id="why-hard" title="なぜスマホ解約はすぐ進めにくいのか">
          <p>
            親のスマホ解約が難しいのは、通信契約を止めることと、スマホの中の情報を確認することが別問題だからです。
            料金だけを見れば早く止めたいですが、実際には確認したい情報が残っていることがあります。
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">電話番号を残すか迷う</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                今後も番号を使いたい、連絡を受けたい、SMS認証が気になるなど、承継を考える場合があります。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">スマホの中に手がかりがある</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                メール、SMS、金融アプリ、サブスク通知、連絡先など、解約前に見たい情報が残っていることがあります。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">他の遺品と情報が分散している</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                パソコン、通帳、郵便物、契約書類と合わせて見ないと、全体像が見えにくいことがあります。
              </p>
            </div>
          </div>
        </Section>

        <Section id="check-first" title="親のスマホを解約する前に確認したいこと">
          <p>
            解約の手続きに進む前に、まずは何を確認しておきたいかを整理することが大切です。
            ここで完璧に把握しきれなくても、確認が必要そうな範囲を見極めるだけでも前進です。
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">先に見たいこと</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    'その電話番号を残したい事情があるか',
                    'メールやSMSに重要な通知が残っていそうか',
                    '金融アプリやサブスクの手がかりがありそうか',
                    '請求書やクレジットカード明細に通信会社名があるか',
                    'スマホ以外のパソコンや書類にも関連情報があるか',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">整理の考え方</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '承継か解約かを先に考える',
                    'スマホの中だけでなく家全体の資料も見る',
                    '料金停止だけをゴールにしない',
                    '実家全体の片付けの中で順番を考える',
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="mt-2">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-005/check-items.png"
              alt="スマホ、請求書、封筒、メモ、ノートパソコンを並べて解約前の確認事項を整理している様子"
            />
            <MicroCopy text="※スマホの解約前に、通信会社、メール、SMS、金融系アプリ、請求の手がかりを整理しておくと後戻りしにくくなります。" />
          </div>

          <p>
            特に、親がスマホ中心で家計や契約を管理していた場合は、解約だけ先に進めるより、
            先に確認したい情報を整理した方が安心です。
          </p>
        </Section>

        <Section id="self-limit" title="自力で進めにくいケース">
          <p>
            ある程度までは家族で進められても、次のようなケースではスマホ解約だけで終わらないことがあります。
          </p>

          <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
            <DotList
              items={[
                'スマホのパスワードがわからない',
                'パソコンや書類も多く全体像が見えにくい',
                '遠方の実家で何度も通えない',
                '承継か解約か家族内で判断が分かれている',
                '実家全体の片付けも同時に進める必要がある',
              ]}
            />
          </div>

          <p>
            この場合は、スマホだけを先に止めるより、実家全体の整理の中で順番を決めた方が進めやすくなります。
          </p>
        </Section>

        <Section id="consult" title="実家片付け全体で考えたいケース">
          <p>
            親のスマホ解約で悩んでいるように見えても、実際にはパソコン、通帳、郵便物、家具、家電など、
            他の整理とつながっていることが少なくありません。
            そのため、スマホだけ個別に考えるより、実家全体の片付けとして考えた方が動きやすい場合があります。
          </p>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">実家全体で考えたいケース</h3>
            <div className="mt-4">
              <DotList
                items={[
                  'スマホ以外にも整理する遺品が多い',
                  '短い日程でまとめて進めたい',
                  '確認不足で後からやり直したくない',
                  '家族だけでは手が足りない',
                ]}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <h3 className="text-lg font-bold text-slate-900">解約を急ぎすぎるリスク</h3>
            <p className="mt-3 text-[15px] leading-8 text-slate-700">
              スマホだけ先に解約すると、後から「SMS認証が必要だった」「メールを見ておけばよかった」「他の契約の手がかりが残っていた」となりやすいです。
              情報が複数の場所に分かれていることが多いため、単独で考えると抜け漏れが起きやすくなります。
            </p>
            <p className="mt-3 text-[15px] leading-8 text-slate-700">
              実家全体の片付けとして考えることで、先に確認するものと後で処分できるものを分けやすくなります。
            </p>
          </div>

          <div className="mt-2">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-005/consult-scene.png"
              alt="スマホや書類、箱を前に実家全体の片付けとして整理方法を考えている様子"
            />
            <MicroCopy text="※スマホだけでなく、書類やパソコンも含めて整理が必要な場合は、全体の順番を考える方が進めやすいです。" />
          </div>

          <AffiliateCtaBox
            title="スマホだけでなく、実家の遺品整理全体を進めたい方へ"
            serviceLead="ご家族だけで整理が難しい場合は、片付け・仕分け・回収までまとめて相談できるサービスを早めに確認しておくと、全体の見通しを立てやすくなります。"
            description="親のスマホ解約で悩むときは、スマホ単体で考えるより、パソコンや書類、実家全体の片付けの中で整理した方が進みやすいことがあります。物量が多い場合や、遠方で何度も通えない場合、家族だけで対応が難しい場合は、まず無料見積もりで費用感や進め方を確認しておくと安心です。"
            buttonText="遺品整理110番を確認する"
            href="#"
            lpName="digitalihin_005"
            lpId="guide_ihinseiri_digitalihin_005"
            position="bottom"
            programName="ihinseiri_110"
            ctaId="cta_digitalihin_005_ihin110"
            partnerCategory="estate_cleanup"
            sourceSection="consult"
            gaEventName="cta_click_digitalihin_005_ihin110"
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
            スマホ解約の悩みは、スマホのパスワード、ネット銀行、サブスク、実家片付けともつながっています。
            スマホ解約だけを単独で考えるより、他の記事もあわせて見る方が整理しやすくなります。
          </p>

          <div className="space-y-5">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">スマホのパスワードがわからない場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                端末の中身確認が難しいときは、まず別記事で進め方を整理しておくと動きやすいです。
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
                スマホの中や請求書類から、ネット銀行や証券口座の手がかりが見つかることがあります。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-002" className={secondaryLinkClass}>
                  親のネット銀行がわからないときの相続対応
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">継続課金も気になる場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                スマホ解約の前に、サブスクや有料サービスの通知を見ておきたいことがあります。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-003" className={secondaryLinkClass}>
                  亡くなった人のサブスクを解約できないときは？
                </Link>
              </div>
            </div>
          </div>
        </Section>

        <Section id="ng" title="親のスマホ解約でやってはいけないこと">
          <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
            <CrossList
              items={[
                '料金だけを見てすぐ解約する',
                'スマホの中だけに答えがあると思い込む',
                '承継の可能性を考えずに進める',
                '実家全体の整理と切り離して考える',
              ]}
            />
          </div>

          <p>
            スマホ解約は通信契約だけの問題ではなく、メール、SMS、金融アプリ、サブスクなどの確認ともつながることがあります。
            パソコンや書類にも情報が分散している場合があるため、単独で判断しない方が安心です。
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">実家の片付け全体が気になる方へ</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                スマホ解約だけでなく、何から手をつけるか迷う場合は、全体の順番を先に整理すると動きやすくなります。
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
            親が亡くなった後のスマホは、料金だけを見てすぐ解約するのではなく、まず電話番号の扱いと、確認したい情報が残っていそうかを整理するのが基本です。
            スマホだけでなく、書類、パソコン、通帳、郵便物なども合わせて見る方が安心です。
          </p>

          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <ul className="space-y-3 text-[15px] leading-8 text-slate-700">
              <li>・承継か解約かを先に考える</li>
              <li>・メール、SMS、請求、アプリの手がかりを整理する</li>
              <li>・スマホ以外の書類や端末も一緒に見る</li>
              <li>・遺品が多い場合は実家全体の片付けとして考える</li>
            </ul>
          </div>

          <p>
            スマホ解約で悩んでいるときは、実際にはスマホだけの問題ではなく、実家全体の片付けや他のデジタル遺品整理につながっていることも少なくありません。
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
              <p className="text-sm font-semibold text-slate-500">スマホの中身確認に困る方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                親のスマホのパスワードがわからないときは？
              </p>
            </Link>

            <Link
              href="/guide/ihinseiri/digitalihin-002"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">口座や金融情報も気になる方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                親のネット銀行がわからないときの相続対応
              </p>
            </Link>

            <Link
              href="/guide/ihinseiri/digitalihin-003"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">継続課金も気になる方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                亡くなった人のサブスクを解約できないときは？
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