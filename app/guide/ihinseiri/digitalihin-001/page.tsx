import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import AffiliateCtaBox from '@/components/AffiliateCtaBox';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title:
    '親のスマホのパスワードがわからないときは？亡くなった後に最初に確認したいこと | つぎの手ナビ',
  description:
    '親のスマホのパスワードがわからないときは、解除方法を探し続けるよりも先に、契約や支払いの手がかりを確認することが大切です。亡くなった後に何をどの順番で確認すべきかを整理します。',
};

const toc = [
  { id: 'conclusion', label: 'まず結論｜最初に確認したいこと' },
  { id: 'unlock-clues', label: 'ロック解除を急ぐ前に手がかりを探す場所' },
  { id: 'can-check', label: 'スマホが開かなくても確認できるもの' },
  { id: 'carrier-support', label: 'キャリアショップやメーカーに相談するときの考え方' },
  { id: 'cases', label: 'ケース別｜次の一手' },
  { id: 'digital-estate', label: 'スマホだけでなく実家全体で整理する' },
  { id: 'ihin-seiri', label: '家族だけで整理が難しいとき' },
  { id: 'debt-risk', label: '借金や未払いの不安があるとき' },
  { id: 'ng', label: 'やってはいけないこと' },
  { id: 'faq', label: 'よくある質問' },
  { id: 'summary', label: 'まとめ｜最短で失敗しない動き方' },
];

const faqs = [
  {
    q: '親のスマホのパスワードがわからないとき、まず何をすればいいですか？',
    a: 'まずはスマホを無理に開こうとするより、郵便物、通帳、契約書類、パソコンなどから手がかりを集めることをおすすめします。スマホ単体ではなく、実家全体の整理の中で考えると進めやすくなります。',
  },
  {
    q: 'スマホが開けないと、相続や片付けは進められませんか？',
    a: 'スマホが開けなくても進められることはあります。紙の書類、通帳、郵便物、他の端末から確認できることも多いため、まずは全体像を把握することが大切です。',
  },
  {
    q: 'キャリアショップやメーカーに相談すれば、すぐに解決しますか？',
    a: '相談先として確認する価値はありますが、状況によってすぐに希望どおりに進むとは限りません。まずは契約名義、端末の種類、手元の書類など、今ある情報を整理してから相談した方が話を進めやすくなります。',
  },
  {
    q: 'スマホ以外にもパソコンや書類が多い場合はどうすればいいですか？',
    a: 'スマホだけを個別に考えるより、パソコンや書類、生活用品も含めた遺品整理全体の中で進める方が負担を減らしやすいです。家族だけで難しい場合は遺品整理の相談も選択肢です。',
  },
  {
    q: '借金や督促のような書類が見つかった場合はどうすればいいですか？',
    a: '書類を捨てずに保管し、片付けだけで進めず相続放棄なども含めて確認した方が安心です。判断を急がず、必要に応じて相談先を確認してください。',
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
    <ul className="space-y-3">
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
    <div className="overflow-hidden rounded-2xl bg-white">
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

const secondaryLinkClass =
  'inline-flex rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-300 transition hover:bg-slate-50';

export default function DigitalIhin001Page() {
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
            <li className="text-slate-700">親のスマホのパスワードがわからないときは？</li>
          </ol>
        </nav>

        <header className="mt-6 rounded-3xl bg-white p-6 sm:p-8">
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            役立ち情報｜デジタル遺品
          </div>

          <div className="mt-8">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-001/main-visual.png"
              alt="親のスマホのパスワードがわからず、書類やスマホを前に整理の優先順位を考えている様子"
            />
            <MicroCopy text="※スマホだけにこだわらず、郵便物、通帳、パソコン、書類をあわせて確認すると全体像をつかみやすくなります。" />
          </div>

          <h1 className="mt-8 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            親のスマホのパスワードがわからないときは？
            <br className="hidden sm:block" />
            亡くなった後に最初に確認したいこと
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
            親のスマホのパスワードがわからないときは、ロック解除の方法を探し続けるよりも先に、
            何の契約や支払いがそのスマホにひもづいているかを確認することが大切です。特に亡くなった後は、
            スマホの中だけでなく、他の端末、書類、郵便物、ご実家全体の片付けも含めて手がかりを集めた方が、
            後の解約や相続手続きを進めやすくなります。この記事では、親のスマホのパスワードがわからないときに、
            最初に確認したいことを順番に整理します。
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href="#unlock-clues"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              手がかりを探す場所を見る
            </a>
            <a
              href="#carrier-support"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              相談先の考え方を見る
            </a>
          </div>
        </header>

        <section className="mt-8 rounded-3xl bg-amber-50 p-6">
          <h2 className="text-xl font-bold text-slate-900">まず結論｜スマホだけで抱え込まず、全体の整理を先に決める</h2>
          <p className="mt-4 text-[15px] leading-8 text-slate-700">
            親のスマホのパスワードがわからないときは、解除方法を探し続けるよりも先に、
            契約や支払いの手がかりを集め、スマホ以外の端末や書類も一緒に確認し、
            実家全体の整理をどう進めるかを決めることが大切です。
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white/60 p-5">
              <h3 className="text-base font-bold text-slate-900">最初にやること3つ</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '郵便物、通帳、契約書類から支払いと契約の手がかりを探す',
                    'スマホだけでなく、パソコン、タブレット、メモ類も確認する',
                    '家族だけで難しいなら、実家全体の遺品整理として進め方を決める',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white/60 p-5">
              <h3 className="text-base font-bold text-slate-900">まだやらなくていいこと</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '焦って何度もロック解除を試し続けること',
                    'スマホだけ見ればすべて分かると思い込むこと',
                    '全体方針を決めないまま処分を進めること',
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 rounded-3xl bg-white p-6">
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

        <Section id="conclusion" title="親のスマホのパスワードがわからないときに最初に確認したいこと">
          <p>
            親のスマホのパスワードがわからないと、「まず解除しないと何もできないのでは」と不安になりやすいです。
            ですが、亡くなった後は、無理にロック解除を急ぐ前に、契約や支払いの手がかりを別の場所から確認する方が
            先に進みやすいこともあります。
          </p>

          <div className="rounded-2xl bg-slate-50 p-5">
            <DotList
              items={[
                'スマホの中身を見る前に、契約や支払いの手がかりを集める',
                'スマホだけでなく、通帳、郵便物、パソコン、書類も確認する',
                'スマホ単体の悩みではなく、遺品整理全体の中で整理する',
              ]}
            />
          </div>

          <p>
            大切なのは、「解除できるかどうか」ではなく、「今どこから手をつけると全体が止まりにくいか」です。
            スマホだけに意識が向くと、後から必要になる郵便物や通帳、契約書類の確認が遅れてしまうことがあります。
          </p>
        </Section>

        <Section id="unlock-clues" title="ロック解除を急ぐ前に手がかりを探す場所">
          <p>
            親のスマホのパスワードがわからないときは、解除方法を探し続けるよりも先に、
            今ある情報から契約や支払いの手がかりを集めることが大切です。
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-base font-bold text-slate-900">先に確認したい場所</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '携帯会社やカード会社からの郵便物',
                    '通帳や口座引き落とし明細',
                    '銀行や証券会社の案内',
                    '本人が残したメモや会員証',
                    'パソコンやタブレット内のメールやブックマーク',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-rose-50 p-5">
              <h3 className="text-base font-bold text-slate-900">焦ってやらない方がいいこと</h3>
              <div className="mt-4">
                <CrossList
                  items={[
                    '何度も解除を試してロック時間を延ばす',
                    'スマホの中だけに答えがあると思い込む',
                    '全体方針を決めないまま処分を始める',
                  ]}
                />
              </div>
            </div>
          </div>

          <p>
            スマホの中にすべての答えがあるとは限りません。むしろ、郵便物や通帳、パソコンの方が
            契約や支払いの全体像をつかみやすいこともあります。
          </p>
        </Section>

        <Section id="can-check" title="親のスマホのパスワードがわからなくても確認できるもの">
          <p>
            スマホが開けないと困るのは、写真や連絡先だけではありません。相続や片付けの現場では、
            次のような現実的な困りごとにつながりやすいです。
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-base font-bold text-slate-900">契約や支払いの有無</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                携帯料金、サブスク、クレジットカード利用通知などがスマホにまとまっていると、
                契約中の内容が把握しにくくなります。
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-base font-bold text-slate-900">ネット銀行などの手がかり</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                通帳をほとんど使わず、アプリでお金を管理していた場合、紙の資料だけでは全体像が見えにくいことがあります。
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-base font-bold text-slate-900">実家の片付け全体の優先順位</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                スマホのことで立ち止まると、パソコン、書類、通帳、家具など他の整理まで進みにくくなります。
              </p>
            </div>
          </div>

          <p>
            つまり、スマホが開かないときに本当に見るべきなのは「解除できるか」だけではなく、
            「スマホが開かなくても今わかることは何か」です。
          </p>
        </Section>

        <Section id="carrier-support" title="キャリアショップやメーカーに相談するときの考え方">
          <p>
            親のスマホのパスワードがわからないとき、キャリアショップやメーカーへの相談を考える方も多いです。
            相談先として確認する価値はありますが、すぐに希望どおりに進むとは限りません。
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-base font-bold text-slate-900">先に整理しておきたい情報</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '契約していた通信会社がどこか',
                    '端末の種類や機種が何か',
                    '契約者名義が誰か',
                    '手元にある契約書類や請求書',
                    '家族として今どこまで把握しているか',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-base font-bold text-slate-900">相談前に意識したいこと</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '何を確認したいのかを先に絞る',
                    '契約確認と端末解除は別の話になることがある',
                    '必要書類や本人確認の考え方を事前に把握する',
                    'すぐに解決しない前提で全体整理も並行する',
                  ]}
                />
              </div>
            </div>
          </div>

          <p>
            大切なのは、相談先に丸投げすることではなく、「いま何が分かっていて、何が分からないのか」を整理してから
            相談することです。その方が、スマホだけで止まらず全体を進めやすくなります。
          </p>
        </Section>

        <Section id="cases" title="ケース別｜親のスマホのパスワードがわからないときの次の一手">
          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-base font-bold text-slate-900">通信契約やスマホ料金が気になる場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                毎月の携帯料金が続いていそう、解約や名義変更の流れが気になる場合は、契約の整理から考えた方が進めやすいです。
              </p>
              <div className="mt-4">
                <Link href="/shibougo-tetsuzuki" className={secondaryLinkClass}>
                  親が亡くなった後のスマホ解約の流れを確認する
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-base font-bold text-slate-900">毎月の請求やサブスクが不安な場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                明細を見て何の請求かわからないものがある場合は、支払い先を一覧にして確認した方が整理しやすくなります。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-002" className={secondaryLinkClass}>
                  亡くなった人のサブスクを解約できないときは？
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-base font-bold text-slate-900">ネット銀行や証券口座の有無が気になる場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                通帳が少ない、紙の明細が見当たらない場合は、メールアドレスやパソコン、郵便物まで含めて確認範囲を広げる必要があります。
              </p>
              <div className="mt-4">
                <Link href="/guide/ihinseiri/digitalihin-003" className={secondaryLinkClass}>
                  親のネット銀行がわからないときの相続対応
                </Link>
              </div>
            </div>
          </div>
        </Section>

        <Section id="digital-estate" title="スマホだけでなく、実家全体の片付けとして整理した方が進めやすいです">
          <p>
            親のスマホのパスワードがわからないと、どうしても「まずこの1台を何とかしないと」と思ってしまいます。
            けれど実際には、スマホのまわりには契約書類、パソコン、タブレット、外付け機器、銀行関係の書類、
            会員証、郵便物などがつながっています。
          </p>

          <p>
            さらに、同時に実家の片付けも進めなければならないことが多く、スマホだけで手が止まると
            家全体の整理が長引きやすくなります。
          </p>

          <div className="mt-2">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-001/digital-estate-scene.png"
              alt="スマホ、パソコン、書類をまとめて整理しているデジタル遺品のイメージ"
            />
            <MicroCopy text="※スマホだけを見るのではなく、パソコンや書類も含めて考えると、確認漏れや片付けの停滞を減らしやすくなります。" />
          </div>

          <p>
            そのため、スマホの解除方法を探し続けるより、スマホやパソコンも含めて遺品全体をどう整理するか、
            という視点を持った方が結果として前に進みやすくなります。
          </p>
        </Section>

        <Section id="ihin-seiri" title="家族だけで整理が難しいときは、遺品整理も選択肢になります">
          <p>
            親のスマホのパスワードがわからないとき、すぐに専門的な解除方法を探したくなるかもしれません。
            ただ、実際には家全体の整理をどう進めるかを先に決めた方が現実的なことがよくあります。
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-lg font-bold text-slate-900">遺品整理を考えやすいケース</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '実家に物が多く、どこから手をつければよいか分からない',
                    'スマホ以外にもパソコンや書類が多い',
                    '遠方に住んでいて何度も通えない',
                    '家族だけで片付ける時間や体力が足りない',
                    '精神的につらく、整理そのものに手がつかない',
                  ]}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-lg font-bold text-slate-900">先に整理したいこと</h3>
              <div className="mt-4">
                <DotList
                  items={[
                    '何を残すか',
                    '何を処分するか',
                    'パソコンやスマホなどデジタル端末をどう扱うか',
                    '書類や通帳をどこまで確保できているか',
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="mt-2">
            <InfoImage
              src="/images/guide/ihinseiri/digitalihin-001/service-scene.png"
              alt="実家の遺品整理を専門業者が仕分けしている様子"
            />
            <MicroCopy text="※スマホやパソコンだけでなく、実家全体の整理をまとめて考えると、家族の負担を減らしやすくなります。" />
          </div>

          <AffiliateCtaBox
            title="スマホやパソコンだけでなく、実家の遺品整理全体を進めたい方へ"
            serviceLead="ご家族だけで整理が難しい場合は、片付け・仕分け・回収までまとめて相談できるサービスを早めに確認しておくと、全体の見通しを立てやすくなります。"
            description="親のスマホのパスワードがわからないときは、スマホ単体で考えるより、パソコンや書類、実家全体の片付けの中で整理した方が進みやすいことがあります。物量が多い場合や、遠方で何度も通えない場合、家族だけで対応が難しい場合は、まず無料見積もりで費用感や進め方を確認しておくと安心です。"
            buttonText="遺品整理110番を確認する"
            href="https://px.a8.net/svt/ejp?a8mat=4AZPOQ+9X84II+4FR4+639IP"
            lpName="digitalihin_001"
            lpId="guide_ihinseiri_digitalihin_001"
            position="bottom"
            programName="ihinseiri_110"
            ctaId="cta_digitalihin_001_cleanup"
            partnerCategory="cleanup_service"
            sourceSection="ihin_seiri"
            gaEventName="cta_click_digitalihin_001"
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
          <MicroCopy text="※相談や見積もりは無料です。対応内容や費用条件はリンク先をご確認ください。" />
        </Section>

        <Section id="debt-risk" title="借金や未払いの不安があるときは、別の相談が必要になることもあります">
          <p>
            スマホや書類を整理している中で、借入やローンの案内、督促のような郵便物、
            返済が続いていそうな明細などが見つかることがあります。
            この場合は、遺品整理とは別に、相続放棄を含めた判断が必要になるケースもあります。
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-rose-50 p-5">
              <div className="h-1 w-20 rounded-full bg-rose-500" />
              <h3 className="mt-4 text-base font-bold text-slate-900">借金や未払いが気になる場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                書類を捨てずに保管し、片付けだけで進めず、まず期限や流れを確認した方が安心です。
              </p>
              <div className="mt-4">
                <Link href="/souzoku-houki" className={secondaryLinkClass}>
                  相続放棄について確認する
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="h-1 w-20 rounded-full bg-slate-400" />
              <h3 className="mt-4 text-base font-bold text-slate-900">相続全体の整理が必要な場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                不動産や名義変更、相談先選びで迷う場合は、片付けと並行して全体の流れを整理しておくと動きやすいです。
              </p>
              <div className="mt-4">
                <Link href="/souzoku-tetsuzuki" className={secondaryLinkClass}>
                  相続手続きの相談先を確認する
                </Link>
              </div>
            </div>
          </div>

          <AffiliateCtaBox
            title="相続税や相続全体の相談先も整理したい方へ"
            description="相続放棄を含めて相続全体の流れを整理する中で、相続税申告や税理士への相談が必要になる場合があります。費用感や相談先の候補を把握したい方は、早めに比較しておくと安心です。"
            buttonText="税理士ドットコムで無料相談する"
            href="https://h.accesstrade.net/sp/cc?rk=0100kl2m00oq1p"
            lpName="digitalihin_001"
            lpId="guide_ihinseiri_digitalihin_001"
            position="bottom"
            programName="zeirishi_dotcom"
            ctaId="cta_digitalihin_001_zeirishi"
            partnerCategory="tax_accountant_service"
            sourceSection="debt_risk"
            gaEventName="cta_click_digitalihin_001"
            summaryItems={[
              { label: "相談内容", value: "相続税申告・税理士探しの相談" },
              { label: "こんな方に", value: "相続全体の費用や税務も気になる方" },
              { label: "タイミング", value: "手続きの全体像を整理したいとき" },
            ]}
          />
        </Section>

        <Section id="ng" title="親のスマホのパスワードがわからないときにやってはいけないこと">
          <div className="rounded-2xl bg-rose-50 p-5">
            <CrossList
              items={[
                '焦って何度も解除を試し続ける',
                'スマホだけ見ればすべて分かると思い込む',
                '片付け全体を後回しにし続ける',
                '何を残すか決めないまま処分してしまう',
              ]}
            />
          </div>

          <p>
            気持ちが焦る場面だからこそ、スマホだけで答えを探そうとせず、
            実家の書類や他の端末も含めて確認することが大切です。
          </p>
        </Section>

        <Section id="faq" title="よくある質問">
          <div className="rounded-3xl bg-slate-50 p-6">
            <div className="space-y-5">
              {faqs.map((faq, index) => (
                <div
                  key={faq.q}
                  className={index === faqs.length - 1 ? '' : 'border-b border-slate-200 pb-5'}
                >
                  <h3 className="text-base font-bold text-slate-900">{faq.q}</h3>
                  <p className="mt-3 text-[15px] leading-8 text-slate-700">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="summary" title="まとめ｜親のスマホのパスワードがわからないときに最短で失敗しない動き方">
          <p>
            親のスマホのパスワードがわからないと、どうしてもその1台に意識が集中しがちです。
            けれど、本当に大切なのは、スマホを無理に開くことよりも、契約、支払い、書類、
            パソコン、実家片付けを含めて全体を整理することです。
          </p>

          <div className="rounded-2xl bg-amber-50 p-5">
            <ul className="space-y-3 text-[15px] leading-8 text-slate-700">
              <li>・まずは郵便物、通帳、契約書類から手がかりを集める</li>
              <li>・スマホ以外の端末や遺品も一緒に確認する</li>
              <li>・家族だけで難しい場合は、実家全体の遺品整理として進める</li>
              <li>・借金や督促が見つかったら、片付けだけで進めない</li>
            </ul>
          </div>

          <p>
            スマホのことで立ち止まり続けるより、全体の整理を少しずつ進める方が、
            結果として不安を減らしやすくなります。実家の片付けや遺品の量が多い場合は、
            早めに外部の力を借りることも前向きな選択です。
          </p>
        </Section>

        <section className="mt-16 rounded-3xl bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900">あわせて確認したい記事</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Link
              href="/shibougo-tetsuzuki"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">通信契約の解約が気になる方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                親が亡くなった後のスマホ解約の流れ
              </p>
            </Link>

            <Link
              href="/guide/ihinseiri/digitalihin-002"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">毎月の請求やサブスクが不安な方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                亡くなった人のサブスクを解約できないときは？
              </p>
            </Link>

            <Link
              href="/guide/ihinseiri/digitalihin-003"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">ネット銀行や証券の有無が気になる方</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                親のネット銀行がわからないときの相続対応
              </p>
            </Link>

            <Link
              href="/guide/jikka-kataduke/nanikara-a001"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p className="text-sm font-semibold text-slate-500">
                スマホ以外も含めて実家全体を片付けたい方
              </p>
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