'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AffiliateCtaBox from '@/components/AffiliateCtaBox';
import SiteFooter from '@/components/SiteFooter';

const toc = [
  { id: 'conclusion', label: 'まず結論｜最初にやること' },
  { id: 'why-hard', label: 'なぜネット銀行は見落としやすいのか' },
  { id: 'check-first', label: '最初に確認したい手がかり' },
  { id: 'self-limit', label: '自力で進めにくいケース' },
  { id: 'consult', label: '相談を考えたいケース' },
  { id: 'related', label: '他の悩みともつながる理由' },
  { id: 'ng', label: 'やってはいけないこと' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ｜最短で失敗しない動き方' },
];

const faqs = [
  {
    q: '親のネット銀行がわからないとき、まず何を見ればいいですか？',
    a: 'まずは通帳、郵便物、メールアドレスの手がかり、スマホやパソコンに残っている金融機関名、口座引き落としの履歴などを確認するのがおすすめです。紙の資料が少なくても、引き落とし先やメール通知から手がかりが見つかることがあります。',
  },
  {
    q: '通帳がない場合、ネット銀行の有無はどう確認できますか？',
    a: '通帳がなくても、銀行名の記載があるメール、キャッシュカード、スマホアプリ、パソコンのブックマーク、口座引き落とし履歴などから手がかりを探せる場合があります。ただし、自力で全体を把握しきれないこともあるため、必要に応じて相談を検討した方が安心です。',
  },
  {
    q: 'ネット銀行がありそうでも、スマホが開けないと確認できませんか？',
    a: 'スマホが開けなくても、郵便物、パソコン、通帳、引き落とし履歴などから確認できることがあります。スマホだけで答えを探そうとせず、家にある資料全体で考えることが大切です。',
  },
  {
    q: '負債もあるかもしれない場合はどうすればいいですか？',
    a: '借金や督促の手がかりがある場合は、資産確認だけでなく相続放棄も含めて考えた方が安心です。片付けや確認だけで進めず、期限や流れを早めに整理してください。',
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

export default function DigitalIhin002Client() {
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
            <li className="text-slate-700">親のネット銀行がわからないときの相続対応</li>
          </ol>
        </nav>

        <header className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            役立ち情報｜デジタル遺品
          </div>

          <div className="mt-8">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-002/main-visual.png"
              alt="親のネット銀行や口座の手がかりを、通帳やノートパソコン、郵便物から確認している様子"
            />
            <MicroCopy text="※通帳が少なくても、メール、引き落とし履歴、スマホやパソコン内の手がかりから金融機関名が見つかることがあります。" />
          </div>

          <h1 className="mt-8 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            親のネット銀行がわからないときの相続対応
            <br className="hidden sm:block" />
            口座不明で困ったときに最初に確認したいこと
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
            通帳が少ない、紙の明細が見当たらない、スマホやアプリ中心でお金を管理していた。
            こうした場合、親がネット銀行や証券口座を使っていたか分からず、不安になる方は少なくありません。
            この記事では、どこから手がかりを探すか、自力でどこまで進めるか、相談を考えたいケースは何かを順番に整理します。
          </p>
        </header>

        <section
          id="conclusion"
          className="mt-8 rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-200"
        >
          <h2 className="text-xl font-bold text-slate-900">
            まず結論｜通帳が少ないなら、紙・メール・引き落とし履歴を横断して確認する
          </h2>
          <p className="mt-4 text-[15px] leading-8 text-slate-700">
            親のネット銀行がわからないときは、通帳だけで答えを探さず、郵便物、メールアドレス、
            スマホやパソコン、口座引き落とし履歴などを横断して手がかりを集めることが大切です。
            それでも全体像がつかめない場合は、自力で抱え込まず相談先を早めに確認した方が安心です。
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-amber-100">
              <h3 className="text-base font-bold text-slate-900">最初にやること3つ</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '通帳、郵便物、メール通知、口座引き落としから金融機関名の手がかりを探す',
                    'スマホだけでなく、パソコン、タブレット、ブックマーク、アプリ履歴も確認する',
                    '自力で全体像がつかみにくいときは、相談を前提に整理を進める',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-amber-100">
              <h3 className="text-base font-bold text-slate-900">後回しにしたいこと</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '通帳がないから何も分からないと決めつけること',
                    'スマホの中だけに答えがあると思い込むこと',
                    '借金や負債の可能性を見ないまま片付けを進めること',
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

        <Section id="why-hard" title="なぜネット銀行は見落としやすいのか">
          <p>
            ネット銀行が見落としやすい理由は、紙の通帳や郵送物が少ないことがあるからです。
            以前なら通帳や残高明細で気づけたものが、今はアプリやメール通知だけで運用されていることもあります。
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">通帳がないことがある</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                ネット銀行では紙の通帳が発行されないことがあり、家の中を見ただけでは気づきにくいです。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">通知がメール中心</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                入出金やお知らせが郵便ではなくメール中心だと、紙の手がかりが少なくなりやすいです。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">スマホで完結していることが多い</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                アプリだけで管理していると、スマホやパソコンを見ない限り存在に気づきにくいことがあります。
              </p>
            </div>
          </div>
        </Section>

        <Section id="check-first" title="親のネット銀行がわからないときに最初に確認したい手がかり">
          <p>
            ネット銀行の有無を確認したいときは、金融機関名の手がかりを少しずつ集める意識が大切です。
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">確認したいもの</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '口座引き落としの履歴や通帳',
                    '銀行名が入った郵便物やはがき',
                    'スマホやパソコンのメール通知',
                    'ブラウザのブックマークや保存済みログイン先',
                    'キャッシュカードや本人名義のカード類',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">確認の考え方</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '金融機関名だけでも控えておく',
                    'アプリ名やロゴの記憶も手がかりにする',
                    '資産だけでなく負債や未払いも同時に見る',
                    'スマホだけでなく家全体の資料で考える',
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="mt-2">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-002/check-items.png"
              alt="通帳、ノートパソコン、スマートフォン、郵便物を並べてネット銀行の手がかりを確認している様子"
            />
            <MicroCopy text="※金融機関名が分かるだけでも、その後の確認や相談が進めやすくなります。" />
          </div>

          <p>
            手がかりを集める段階では、完璧に把握しきれなくても大丈夫です。
            まずは「どの金融機関が関係していそうか」を整理するだけでも前進です。
          </p>
        </Section>

        <Section id="self-limit" title="自力で進めにくいケース">
          <p>
            ある程度までは自力で確認できても、全体像をつかみきれないことがあります。
            特に次のようなケースでは、自力だけで進めるのが難しくなりやすいです。
          </p>

          <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
            <DotList
              items={[
                '通帳やカード類が少なく、紙の手がかりがほとんどない',
                'スマホが開けず、メールやアプリの確認ができない',
                '金融機関が複数ありそうで整理しきれない',
                '資産だけでなく借金や未払いの不安もある',
                '相続全体の手続きも並行して考えなければならない',
              ]}
            />
          </div>

          <p>
            こうした場合は、「自分で全部見つけてから相談する」のではなく、
            手がかりがある段階で相談を視野に入れた方が結果として進めやすいことがあります。
          </p>
        </Section>

        <Section id="consult" title="相談を考えたいケース">
          <p>
            親のネット銀行がわからないときは、資産の見落としだけでなく、
            相続全体の判断が遅れやすくなることがあります。特に、自力での確認範囲に限界を感じるときは、
            相談先を早めに確認しておくと安心です。
          </p>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">相談を考えたいケース</h3>
            <div className="mt-4">
              <DotList
                items={[
                  '通帳が少なく、ネット銀行利用の可能性が高い',
                  '紙の資料では全体像がつかめない',
                  '不動産や相続人など、他の手続きも重なっている',
                  '負債や未払いの可能性も気になっている',
                ]}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <h3 className="text-lg font-bold text-slate-900">専門家に依頼するメリット</h3>
            <p className="mt-3 text-[15px] leading-8 text-slate-700">
              司法書士や弁護士などの専門家に相談すると、銀行ごとの相続手続きの整理に加えて、
              証券保管振替機構（ほふり）の「登録済加入者情報の開示請求」のような、
              個人では煩雑になりやすい確認手続きを進めやすくなります。
            </p>
            <p className="mt-3 text-[15px] leading-8 text-slate-700">
              また、ネット銀行や証券口座を見落としたまま遺産分割や申告を進めると、
              後から修正が必要になるだけでなく、状況によっては過少申告加算税や延滞税などの負担が生じる可能性もあります。
            </p>
          </div>

          <div className="mt-2">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-002/consult-scene.png"
              alt="司法書士が書類や財産確認の手続きを整理し、遺族が安心して相談している様子"
            />
            <MicroCopy text="※複雑な照会手続きや確認も、専門家に相談すると漏れなく安全に進めやすくなります。" />
          </div>
<AffiliateCtaBox
  title="相続税申告や税理士探しを相談したい方へ"
  description="相続税の申告が必要か分からない方や、どの税理士に相談すべきか迷っている方向けの相談先です。費用感や依頼範囲を整理しながら、状況に合う税理士を無料で探しやすくなります。"
  buttonText="税理士ドットコムで無料相談する"
  href="https://h.accesstrade.net/sp/cc?rk=0100kl2m00oq1p"
  lpName="zeirishi_dotcom_inheritance_lp"
  position="bottom"
  programName="税理士ドットコム"
  summaryItems={[
    { label: "相談内容", value: "相続税申告・税理士探しの相談" },
    { label: "こんな方に", value: "税理士を比較して決めたい方" },
    { label: "タイミング", value: "相続税や費用感が気になったとき" },
  ]}
/>
        </Section>

        <Section id="related" title="他の悩みともつながる理由">
          <p>
            親のネット銀行がわからないときは、金融機関だけを個別に探すより、
            スマホ、サブスク、郵便物、実家片付けとつなげて考えた方が確認漏れを減らしやすくなります。
          </p>

          <div className="space-y-5">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">スマホが開けない場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                アプリ名やメール通知の確認がしにくいため、紙の資料や他の端末も含めて考える必要があります。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-001" className={secondaryLinkClass}>
                  親のスマホのパスワードがわからないときは？
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">毎月の請求やサブスクも気になる場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                引き落とし履歴の中に、金融機関以外の継続課金が混ざっていることもあります。支払い全体として確認した方が整理しやすいです。
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
                ネット銀行の手がかりは、郵便物、書類、パソコン、カード類の中に残っていることがあります。実家片付けの視点も重要です。
              </p>
              <div className="mt-4">
                <Link href="/guide/jikka-kataduke/nanikara-a001" className={secondaryLinkClass}>
                  実家の片付けを何から始めるか
                </Link>
              </div>
            </div>
          </div>
        </Section>

        <Section id="ng" title="親のネット銀行がわからないときにやってはいけないこと">
          <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
            <CrossList
              items={[
                '通帳がないから何も分からないと決めつける',
                'スマホの中だけに答えがあると思い込む',
                '引き落とし履歴を見ないまま片付けを進める',
                '負債の可能性を見ずに資産だけ探そうとする',
              ]}
            />
          </div>

          <p>
            見つかる資産だけを見るのではなく、借金や未払いの可能性も同時に意識することが大切です。
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
              <h3 className="text-base font-bold text-slate-900">借金や未払いが気になる方へ</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                督促状や借入明細が見つかった場合は、資産確認だけで進めず、相続放棄も含めて期限や流れを確認してください。
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
                不動産や名義変更、相談先選びも含めて整理したい場合は、全体の流れを先に整理しておくと動きやすいです。
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

        <Section id="summary" title="まとめ｜親のネット銀行がわからないときに最短で失敗しない動き方">
          <p>
            親のネット銀行がわからないときは、通帳がないことだけで諦めず、
            郵便物、メール、引き落とし履歴、スマホ、パソコンなどを横断して手がかりを集めることが大切です。
          </p>

          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <ul className="space-y-3 text-[15px] leading-8 text-slate-700">
              <li>・通帳だけでなく、引き落とし履歴やメール通知も確認する</li>
              <li>・スマホ以外の端末や書類も一緒に見る</li>
              <li>・資産だけでなく、借金や未払いの可能性も意識する</li>
              <li>・自力で限界を感じたら、相談先を早めに確認する</li>
            </ul>
          </div>

          <p>
            スマホや紙の資料が十分に残っていなくても、確認の仕方を広げることで手がかりが見つかることがあります。
            一方で、全体像が見えないまま抱え込み続けると、相続全体の判断が遅れやすくなります。
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