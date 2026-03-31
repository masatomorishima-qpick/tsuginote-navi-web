'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AffiliateCtaBox from '@/components/AffiliateCtaBox';
import SiteFooter from '@/components/SiteFooter';

const toc = [
  { id: 'conclusion', label: 'まず結論と最初にやること' },
  { id: 'why-not-throw', label: 'なぜスマホはすぐ処分しないほうがよいのか' },
  { id: 'check-before', label: '処分前に確認したいこと' },
  { id: 'ng', label: 'データ消去できないときにやってはいけないこと' },
  { id: 'three-options', label: '保管・処分・相談の3つで考える' },
  { id: 'consult', label: '実家片付け全体で考えたいケース' },
  { id: 'self-or-service', label: '自分で進めるか相談するかの目安' },
  { id: 'related', label: '他の悩みともつながる理由' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめと最短で失敗しない動き方' },
];

const faqs = [
  {
    q: '亡くなった親のスマホは、そのまま捨てても大丈夫ですか？',
    a: '確認前の処分は避けたほうが安心です。通信契約、課金、連絡先、写真、各種サービスの手がかりなどが残っていることがあるため、まずは処分してよい状態かどうかを整理するのがおすすめです。',
  },
  {
    q: 'パスワードがわからず初期化できません。それでも処分できますか？',
    a: '初期化できないことだけを理由に、すぐ処分を決めないほうが安心です。先に通信契約や課金の有無、家族で確認したいことが残っていないかを見ておくと、後戻りしにくくなります。',
  },
  {
    q: 'スマホだけでなく、パソコンや書類もあり困っています。',
    a: 'その場合は、スマホ単体ではなく、デジタル遺品や実家片付け全体の問題として見たほうが整理しやすいです。ひとつずつ悩むより、先に全体の順番を決めることで動きやすくなります。',
  },
  {
    q: '迷ったときは、保管と処分のどちらを選ぶべきですか？',
    a: '迷いが残る段階では、後戻りしやすい保管を選ぶほうが安心です。処分は一度進めると戻しにくいため、契約や家族内の確認が済むまでは保管か相談に寄せる考え方が向いています。',
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

export default function DigitalIhin006Client() {
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
              亡くなった親のスマホはどう処分する？データ消去できないときの考え方
            </li>
          </ol>
        </nav>

        <header className="mt-6 rounded-3xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            役立ち情報｜デジタル遺品
          </div>

          <div className="mt-8">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-006/main-visual.png"
              alt="亡くなった親のスマホや書類、封筒、ノートパソコンを前に、処分の順番を落ち着いて整理している様子"
            />
            <MicroCopy text="※パスワードがわからずデータ消去できないスマホは、すぐに捨てる前に、契約・課金・家族の確認事項が残っていないかを整理しておくと安心です。" />
          </div>

          <h1 className="mt-8 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            亡くなった親のスマホはどう処分する？データ消去できないときの考え方
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
            親が亡くなったあと、スマホをどう扱えばよいのか分からず困る方は少なくありません。
            とくに、パスワードがわからずロック解除できない場合は、初期化も進められず、
            「このまま捨てて大丈夫なのか」「データ流出はないのか」と不安になりやすいです。
            この記事では、すぐ処分しないほうがよい理由、先に確認したいこと、やってはいけないこと、
            そして処分・保管・相談の考え方を、実家片付け全体の視点も交えて整理します。
          </p>
        </header>

        <section
          id="conclusion"
          className="mt-8 rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-200"
        >
          <h2 className="text-xl font-bold text-slate-900">まず結論と最初にやること</h2>
          <p className="mt-4 text-[15px] leading-8 text-slate-700">
            亡くなった親のスマホは、パスワードがわからずデータ消去できない場合ほど、
            すぐに捨てるより「いま処分してよい状態か」を先に整理することが大切です。
            通信契約、継続課金、写真や連絡先、他のデジタル機器との関係が残っていることがあるため、
            スマホ単体ではなく、書類やパソコンも含めて確認すると後戻りしにくくなります。
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-amber-100">
              <h3 className="text-base font-bold text-slate-900">最初にやること3つ</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '通信契約や毎月の請求が残っていないかを見る',
                    'スマホの中や周辺資料に確認したい情報がありそうか整理する',
                    '迷うなら処分ではなく、いったん保管か相談に寄せる',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-5 ring-1 ring-amber-100">
              <h3 className="text-base font-bold text-slate-900">後回しにしたいこと</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '確認前に勢いで捨てること',
                    'スマホだけ単独で片付けようとすること',
                    '不確かな方法で無理にロック解除しようとすること',
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

        <Section id="why-not-throw" title="なぜスマホはすぐ処分しないほうがよいのか">
          <p>
            親のスマホをすぐ処分しないほうがよいのは、端末の中身が見えなくても、
            契約や手続きの手がかりにつながっていることがあるためです。
            処分を急ぐと、あとから「確認しておけばよかった」と困りやすくなります。
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">契約の手がかりが残る</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                通信契約、サブスク、メール、SMS、金融アプリなど、あとから確認したい情報の入口になっていることがあります。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">端末そのものが確認材料になる</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                ロック解除できなくても、通信会社、機種、SIMの有無、付属品などから次に見るべきものが分かる場合があります。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">処分を急ぐと後戻りしにくい</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                解約漏れ、課金継続、家族が残したい情報の見落としなど、捨てた後ではやり直しにくい問題が起きやすいです。
              </p>
            </div>
          </div>

          <div className="mt-2">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-006/check-points.png"
              alt="スマホ本体、封筒、メモ、ノートパソコンを並べて処分前に確認する項目を整理している様子"
            />
            <MicroCopy text="※スマホ本体が開けなくても、請求書や付属品、他の端末と合わせて見ることで、確認すべきことが見えてくる場合があります。" />
          </div>
        </Section>

        <Section id="check-before" title="処分前に確認したいこと">
          <p>
            先に処分方法を決めるより、「いま処分してよい状態か」を整理することが大切です。
            ここで完璧に把握しきれなくても、確認すべき範囲をつかめるだけで判断しやすくなります。
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">先に見たいこと</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '通信契約や料金支払いが残っていないか',
                    '銀行、証券、決済、サブスクなどの手がかりがありそうか',
                    '家族が残したい写真や連絡先がないか',
                    'スマホ以外の書類やパソコンにも関連情報があるか',
                    '家族内で保管や処分の判断がそろっているか',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">整理の考え方</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    'スマホを捨てる前に、契約や課金の有無を確認する',
                    'ロック解除より先に、何につながっていそうかを見る',
                    'スマホ単体ではなく、実家全体の片付けの中で考える',
                    '迷う段階では処分より保管を選ぶ',
                  ]}
                />
              </div>
            </div>
          </div>

          <p>
            通信契約の確認や解約の流れが気になる場合は、
            先に
            <Link
              href="/guide/ihinseiri/digitalihin-005"
              className="mx-1 text-slate-900 underline underline-offset-4"
            >
              親が亡くなった後のスマホ解約の流れ
            </Link>
            を見ておくと整理しやすいです。
            また、端末の中身が見られず困っている場合は、
            <Link
              href="/guide/ihinseiri/digitalihin-001"
              className="mx-1 text-slate-900 underline underline-offset-4"
            >
              親のスマホのパスワードがわからないときは？
            </Link>
            も参考になります。
          </p>
        </Section>

        <Section id="ng" title="データ消去できないときにやってはいけないこと">
          <div className="rounded-2xl bg-rose-50 p-5 ring-1 ring-rose-100">
            <CrossList
              items={[
                '確認前に勢いで捨てる',
                '不確かな方法で無理にロック解除しようとする',
                'スマホだけ単独で片付けようとする',
                '家族の確認を待たずに一人で処分を決める',
              ]}
            />
          </div>

          <p>
            とくに避けたいのは、「見られないから不要」と考えて先に処分してしまうことです。
            実際には、スマホは通信契約、継続課金、連絡先、写真、他の端末との関係など、
            さまざまな確認の入口になっていることがあります。
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">スマホだけで悩まない</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                実際には、通帳、請求書、契約書、パソコン、タブレットなどと合わせて見たほうが全体像をつかみやすいです。
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">迷うなら後戻りしやすい方へ</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                処分は一度進めると戻しにくいため、迷いが残る段階では保管か相談に寄せたほうが安心です。
              </p>
            </div>
          </div>
        </Section>

        <Section id="three-options" title="保管・処分・相談の3つで考える">
          <p>
            亡くなった親のスマホは、「捨てるか捨てないか」の二択で考えると迷いやすいです。
            実際には、保管・処分・相談の3つに分けて考えると整理しやすくなります。
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-lg font-bold text-slate-900">保管</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                通信契約、課金、写真、連絡先などの確認が終わっていないなら、まずは保管が基本です。
                端末本体や付属品、関連書類をまとめておくと後で見返しやすくなります。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-lg font-bold text-slate-900">処分</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                必要な確認が済み、家族でも保管不要の認識がそろっているなら、処分を検討しやすくなります。
                大切なのは「もう保管理由が薄い」と整理できてから進めることです。
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-lg font-bold text-slate-900">相談</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                スマホ以外にもパソコンや書類が多い、遠方で通えない、実家全体の整理が止まっている場合は、
                まとめて相談したほうが進めやすいことがあります。
              </p>
            </div>
          </div>
        </Section>

        <Section id="consult" title="実家片付け全体で考えたいケース">
          <p>
            スマホ単体では小さな悩みに見えても、実際には実家全体の整理が止まっているサインになっていることがあります。
            とくに、スマホ以外にもパソコン、書類、契約書、周辺機器が多い場合は、
            端末だけを個別に処分しようとするより、実家片付けの一部として整理したほうが進みやすいです。
          </p>

          <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">実家全体で考えたいケース</h3>
            <div className="mt-4">
              <DotList
                items={[
                  'スマホ以外にもパソコン、書類、ケーブル類が多い',
                  '実家全体の片付けが止まっている',
                  '遠方で何度も通えない',
                  '家族だけで何から始めるか決めにくい',
                ]}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <h3 className="text-lg font-bold text-slate-900">スマホだけ先に処分するリスク</h3>
            <p className="mt-3 text-[15px] leading-8 text-slate-700">
              「もう使わないから」とスマホだけ先に処分すると、後から
              「契約の確認が残っていた」「家族が写真や連絡先を見たかった」
              「他の端末や書類とつながっていた」と気づくことがあります。
              情報が複数の場所に分かれていることが多いため、単独で判断すると抜け漏れが起きやすいです。
            </p>
          </div>

          <div className="mt-2">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-006/consult-scene.png"
              alt="スマホ、箱、書類、ノートパソコンを前に、実家全体の片付けとして整理方針を考えている様子"
            />
            <MicroCopy text="※スマホだけの悩みに見えても、実際には実家全体の整理順が決まっていないことが原因になっている場合があります。" />
          </div>

          <AffiliateCtaBox
            title="スマホだけでなく、実家の遺品整理全体を進めたい方へ"
            serviceLead="パスワードがわからないスマホ、処分に迷うパソコン、残された書類や家財など、ひとつずつ判断するのが難しい場合は、まとめて相談したほうが進めやすいことがあります。"
            description="親のスマホをどう処分するか迷うときは、スマホ単体で考えるより、実家片付けや遺品整理全体の中で整理した方が見通しを立てやすいです。物量が多い場合や、遠方で何度も通えない場合、家族だけで対応が難しい場合は、まず無料見積もりで費用感や進め方を確認しておくと安心です。"
            buttonText="遺品整理110番を確認する"
            href="#"
            lpName="digitalihin_006"
            lpId="guide_ihinseiri_digitalihin_006"
            position="bottom"
            programName="ihinseiri_110"
            ctaId="cta_digitalihin_006_ihin110"
            partnerCategory="estate_cleanup"
            sourceSection="consult"
            gaEventName="cta_click_digitalihin_006_ihin110"
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

        <Section id="self-or-service" title="自分で進めるか相談するかの目安">
          <p>
            ある程度までは家族で進められても、状況によっては相談先を持ったほうが進めやすいことがあります。
            迷うときは、「正解を当てる」より、「後戻りしやすい方を選ぶ」と考えると整理しやすいです。
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">自分で進めやすいケース</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '実家の物量がそれほど多くない',
                    '通信契約や支払いの確認がおおむね終わっている',
                    '家族内で保管不要の認識がそろっている',
                    'スマホ以外のデジタル機器や書類が少ない',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">相談したほうがよいケース</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    'スマホの扱いに強い不安がある',
                    'パソコンや周辺機器、紙の書類も多い',
                    '何から手をつければよいか分からない',
                    '実家片付けそのものが重荷になっている',
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
            <h3 className="text-base font-bold text-slate-900">迷うときの基本</h3>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              迷いが残る段階では、すぐ処分に進むより、いったん保管し、必要なら実家片付けや遺品整理の相談先を持つほうが安心です。
              処分は後戻りが難しい一方、保管や相談は後から方向転換しやすいからです。
            </p>
          </div>
        </Section>

        <Section id="related" title="他の悩みともつながる理由">
          <p>
            スマホ処分の悩みは、スマホのパスワード、スマホ解約、サブスク、パソコン処分、実家片付けともつながっています。
            スマホだけを単独で考えるより、他の記事もあわせて見る方が全体の順番をつくりやすくなります。
          </p>

          <div className="space-y-5">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">スマホの中身確認に困る場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                パスワードがわからず、端末の中身確認が難しいときは、先に別記事で進め方を整理しておくと動きやすいです。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-001" className={secondaryLinkClass}>
                  親のスマホのパスワードがわからないときは？
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">通信契約や解約も気になる場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                処分の前に、そもそも通信契約をどう整理するか見ておきたいことがあります。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-005" className={secondaryLinkClass}>
                  親が亡くなった後のスマホ解約の流れ
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <h3 className="text-base font-bold text-slate-900">パソコンの処分も気になる場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                スマホだけでなく、パソコンや周辺機器も残っている場合は、デジタル遺品全体で整理したほうが進めやすいです。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-004" className={secondaryLinkClass}>
                  遺品のパソコンの捨て方・処分方法
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
            亡くなった親のスマホは、小さな持ち物に見えても、契約や課金、連絡先、写真、
            他のデジタル機器との関係など、いろいろな確認の入口になっていることがあります。
            そのため、パスワードがわからずデータ消去できないときほど、焦って処分を決めないことが大切です。
          </p>

          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <ul className="space-y-3 text-[15px] leading-8 text-slate-700">
              <li>・まず通信契約や課金の有無を整理する</li>
              <li>・ロック解除より先に、何につながっていそうかを見る</li>
              <li>・迷う段階では処分より保管を選ぶ</li>
              <li>・実家全体の片付けが止まっているなら、まとめて相談も検討する</li>
            </ul>
          </div>

          <p>
            スマホだけの悩みに見えても、実際には実家全体の整理が止まっているケースも少なくありません。
            「処分してよいか分からない」「スマホ以外の整理も進まない」と感じているなら、
            無理に一つずつ片付けようとせず、全体で考えることが前に進むきっかけになります。
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
              href="/guide/ihinseiri/digitalihin-005"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">通信契約の整理も必要な方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                親が亡くなった後のスマホ解約の流れ
              </p>
            </Link>

            <Link
              href="/guide/ihinseiri/digitalihin-004"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">パソコン処分も気になる方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                遺品のパソコンの捨て方・処分方法
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