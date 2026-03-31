import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import AffiliateCtaBox from '@/components/AffiliateCtaBox';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: '親が亡くなった実家の片付けは何から？先に分けるもの・捨てないもの・進め方|つぎの手ナビ',
  description:
    '親が亡くなった後の実家の片付けで、最初にやること、捨ててはいけないもの、自分でやるか業者に頼むかの判断基準を整理します。',
};

const firstActions = [
  '通帳・保険証券・権利書・契約書を先に分ける',
  '郵便物や請求書をひとまとめにする',
  '捨てるものではなく「保留するもの」を先に決める',
];

const notYetActions = [
  '家全体の一気処分',
  '大型家具の搬出',
  '思い出品の細かい整理',
];

const firstDay30min = [
  '捨てる前に部屋の写真を撮る',
  '「残すもの」「捨てるもの」「保留するもの」の一時置き場を作る',
  '郵便物と書類だけを先に集める',
];

const firstDayHalf = [
  '重要書類ボックスを作る',
  '金融・保険・不動産・借金でざっくり分ける',
  '家族で「触らない場所」を決める',
];

const doNotDiscard = {
  money: [
    '通帳、キャッシュカード',
    '保険証券',
    '年金関係書類',
    'クレジットカード明細',
    '税金や公共料金の通知書',
  ],
  property: [
    '権利証（登記済証・登記識別情報）',
    '固定資産税の書類',
    '賃貸契約書',
    '不動産関係の書類',
  ],
  debt: [
    '借入明細',
    '督促状',
    'ローン返済予定表',
    '保証人関係の書類',
    '遺言書らしきもの',
  ],
  digital: [
    'スマホ',
    'パソコン',
    'タブレット',
    'メールの手がかり',
    '会員サービスやサブスクの情報',
  ],
};

const timingCases = {
  notUrgent: [
    '持ち家で退去期限がない',
    '書類確認がまだ終わっていない',
    '相続人や財産整理が進んでいない',
  ],
  urgent: [
    '賃貸で家賃が発生している',
    '退去期限がある',
    '遠方で管理が難しい',
    '空き家の近隣対応が必要',
  ],
};

const judgementCases = {
  self: [
    '部屋数が少なく、物量が比較的少ない',
    '家族で協力して作業できる',
    '急ぎではない',
    '重要な書類の整理が先にできている',
  ],
  service: [
    '一軒家などで物量が多い',
    '遠方で何度も通えない',
    '退去期限が迫っている',
    '高齢の家族だけでは対応が難しい',
    '精神的な負担が大きい',
  ],
};

const faqs = [
  {
    q: '親が亡くなった実家の片付けは何から始める？',
    a: 'まずは捨てることではなく、通帳、保険証券、不動産書類、借金の手がかりになる郵便物や書類を集めて保管することから始めるのがおすすめです。',
  },
  {
    q: '遺品整理で捨ててはいけないものは？',
    a: '通帳、保険証券、権利書、借入明細、督促状、スマホやパソコンなどは先に残してください。あとで契約確認や手続きで必要になることがあります。',
  },
  {
    q: '実家の片付けはいつから始めればいい？',
    a: '持ち家で急ぎの事情がなければ、まずは書類確認と家族内整理を優先して大丈夫です。賃貸や期限がある場合は早めに動いた方が安心です。',
  },
  {
    q: '自分でやるか業者に頼むか迷ったら？',
    a: '物量、期限、距離、家族の負担を基準に判断すると分かりやすいです。無理に抱え込まず、見積もりだけ先に取るのも有効です。',
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

export default function JikkaKatadukeNanikaraPage() {
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
            <li className="text-slate-700">実家の片付けは何から？</li>
          </ol>
        </nav>

        <header className="mt-6 rounded-3xl bg-white p-6 sm:p-8">
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            役立ち情報｜実家片付け
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
            親が亡くなった実家の片付けは何から？
            <br className="hidden sm:block" />
            先に分けるもの・捨てないもの・進め方
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">
            親が亡くなった後の実家の片付けは、すぐに全部進める必要はありません。
            先に書類や契約関係を分けずに処分してしまうと、後から通帳や借金の手がかりが見つからず、
            手続きや確認で困ることがあります。この記事では、最初にやること、捨ててはいけないもの、
            自分でやるか業者に頼むかの判断を整理します。
          </p>

          <div className="mt-8">
            <InfoImage
              src="/images/guide/jikka-kataduke/main-visual.png"
              alt="親が亡くなった後の実家片付けを始める前に書類や物を整理しているイメージ"
            />
            <MicroCopy text="※最初から家全体を片付けるのではなく、書類や契約関係を先に分けると後から困りにくくなります。" />
          </div>
        </header>

        <section className="mt-8 rounded-3xl bg-amber-50 p-6">
          <h2 className="text-xl font-bold text-slate-900">まず結論｜実家の片付けは「捨てる前に分ける」が最優先</h2>
          <p className="mt-4 text-[15px] leading-8 text-slate-700">
            実家の片付けで最も大切なのは、家を空にすることではなく、
            手続きや財産確認に必要なものを安全に確保することです。焦って処分すると、
            後から保険や借金、不動産関係の確認が必要になったときに困りやすくなります。
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white/60 p-5">
              <h3 className="text-base font-bold text-slate-900">最初にやること3つ</h3>
              <div className="mt-4">
                <DotList items={firstActions} />
              </div>
            </div>

            <div className="rounded-2xl bg-white/60 p-5">
              <h3 className="text-base font-bold text-slate-900">まだやらなくていいこと</h3>
              <div className="mt-4">
                <DotList items={notYetActions} />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8">
          <InfoImage
            src="/images/guide/jikka-kataduke/boxes-3way.png"
            alt="実家の片付けで最初に分ける3つの箱のイメージ"
          />
          <MicroCopy text="※実家の片付けでは「残すもの」「保留するもの」「捨てるもの」の3つに分けるだけでも全体像が整理しやすくなります。" />
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900">ページの見取り図</h2>
          <ul className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <li><a href="#first-day" className="hover:text-slate-900 hover:underline">最初の1日でやること</a></li>
            <li><a href="#dont-throw" className="hover:text-slate-900 hover:underline">捨ててはいけないもの一覧</a></li>
            <li><a href="#when-start" className="hover:text-slate-900 hover:underline">いつから始めるか</a></li>
            <li><a href="#self-or-service" className="hover:text-slate-900 hover:underline">自分でやる？業者に頼む？</a></li>
            <li><a href="#before-legal" className="hover:text-slate-900 hover:underline">借金や手続きが気になる場合</a></li>
            <li><a href="#faq" className="hover:text-slate-900 hover:underline">よくある質問</a></li>
          </ul>
        </div>

        <Section id="first-day" title="親が亡くなった実家片付けで、最初の1日でやること">
          <p>
            実家の片付けは、初日に全部終わらせるものではありません。最初の1日は、
            片付けというより「状況把握」と「重要物の確保」に使うのが基本です。
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-base font-bold text-slate-900">最初の30分でやること</h3>
              <div className="mt-4">
                <DotList items={firstDay30min} />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-base font-bold text-slate-900">最初の半日でやること</h3>
              <div className="mt-4">
                <DotList items={firstDayHalf} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-rose-50 p-5">
            <h3 className="text-base font-bold text-rose-900">初日にやらない方がいいこと</h3>
            <div className="mt-4">
              <CrossList
                items={[
                  'その場の勢いで物を捨てる',
                  '価値が分からない物を勝手に売る、処分する',
                  '故人名義の契約物を自己判断で解約する',
                ]}
              />
            </div>
          </div>
        </Section>

        <Section id="dont-throw" title="捨ててはいけないもの一覧｜実家片付けで先に残すべきもの">
          <p>
            実家の片付けで特に注意したいのは、「あとで必要になるものは見つかった時点で必ず確保する」ことです。
          </p>

          <div className="mt-2">
            <InfoImage
              src="/images/guide/jikka-kataduke/files-organized.png"
              alt="実家の片付けで重要書類をクリアファイルに整理している様子"
            />
            <MicroCopy text="※このように重要度別にファイルを分けると、通帳や権利書、請求書などの紛失を防ぎやすくなります。" />
          </div>

          <div className="rounded-3xl bg-white p-6">
            <div className="space-y-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900">お金と契約に関わるもの</h3>
                <div className="mt-4">
                  <DotList items={doNotDiscard.money} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">不動産や名義変更に関わるもの</h3>
                <div className="mt-4">
                  <DotList items={doNotDiscard.property} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">借金や未払い確認で必要になりやすいもの</h3>
                <div className="mt-4">
                  <DotList items={doNotDiscard.debt} />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">デジタルで確認したいもの</h3>
                <div className="mt-4">
                  <DotList items={doNotDiscard.digital} />
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section id="when-start" title="実家の片付けはいつから始める？急がなくていいケースと急いだ方がいいケース">
          <p>
            実家の片付けには、必ずしもすぐ始めなければいけない場面ばかりではありません。
            一方で、状況によっては急いだ方がよいこともあります。
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-lg font-bold text-slate-900">急がなくていいケース</h3>
              <div className="mt-4">
                <DotList items={timingCases.notUrgent} />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-lg font-bold text-slate-900">急いだ方がいいケース</h3>
              <div className="mt-4">
                <DotList items={timingCases.urgent} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-amber-50 p-5">
            <h3 className="text-base font-bold text-slate-900">迷ったときの考え方</h3>
            <p className="mt-3 text-[15px] leading-8 text-slate-700">
              迷ったら、順番は「書類や契約関係の確認」→「残すもの・保留するものの整理」→
              「不用品や家具の処分」です。この順番を守るだけでも、かなり失敗を減らせます。
            </p>
          </div>
        </Section>

        <Section id="self-or-service" title="自分でやる？業者に頼む？判断の目安">
          <p>
            実家の片付けは、必ずしも全部を自力でやる必要はありません。自分たちで進めやすいケースと、
            業者を検討した方がいいケースがあります。
          </p>

          <div className="mt-2">
            <InfoImage
              src="/images/guide/jikka-kataduke/self-or-service-chart.png"
              alt="実家の片付けを自分で進めるか業者に頼むかを判断するフローチャート"
            />
            <MicroCopy text="※物量、期限、距離、家族の負担の4点で考えると、自分で進めるか業者に相談するか判断しやすくなります。" />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-lg font-bold text-slate-900">自分で進めやすいケース</h3>
              <div className="mt-4">
                <DotList items={judgementCases.self} />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-lg font-bold text-slate-900">業者を検討した方がいいケース</h3>
              <div className="mt-4">
                <DotList items={judgementCases.service} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-100 p-5">
            <h3 className="text-base font-bold text-slate-900">見積もり前に整理したいこと</h3>
            <ul className="mt-4 space-y-3 text-[15px] leading-8 text-slate-700">
              <li>・何を残すか</li>
              <li>・何を処分するか</li>
              <li>・買取したい物があるか</li>
              <li>・清掃や搬出をどこまで頼みたいか</li>
            </ul>
          </div>

          <div className="mt-2">
            <InfoImage
              src="/images/guide/jikka-kataduke/service-scene.png"
              alt="実家の片付けを専門業者が丁寧に仕分けしている様子"
            />
            <MicroCopy text="※自力での対応が難しい場合でも、最初に無料見積もりで費用感を確認しておくと判断しやすくなります。" />
          </div>

          <AffiliateCtaBox
            title="ご実家の片付けを一人で抱え込まずに進めたい方へ"
            serviceLead="サービス全体で累計問い合わせ500万件以上の運営実績がある会社に相談できます。"
            description="親が亡くなった後の実家の片付けは、書類の確認や形見分けも重なり、想像以上に負担が大きくなりやすいです。遺品整理110番は全国対応で、まず無料見積もりから相談できます。物量が多い場合や、遠方で何度も通えない場合、退去期限が迫っている場合は、先に費用感を確認しておくと進め方を決めやすくなります。"
            buttonText="無料見積もりを見る"
            href="https://px.a8.net/svt/ejp?a8mat=4AZNCN+786GWQ+39GM+5MFLEA"
            lpName="jikka_kataduke_nanikara"
            lpId="guide_jikka_kataduke_nanikara"
            position="bottom"
            programName="ihinseiri_110"
            ctaId="cta_jikka_kataduke_cleanup"
            partnerCategory="cleanup_service"
            sourceSection="self_or_service"
            gaEventName="cta_click_jikka_kataduke"
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
                label: '受付',
                value: '24時間365日受付です。',
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

        <Section id="before-legal" title="借金や相続が気になるときは、片付けより先に確認したいこと">
          <p>
            片付けの途中で、督促状や借入明細、不動産関係の書類が見つかることがあります。
            その場合は、片付けを優先するより先に状況整理をした方がよいケースがあります。
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-rose-50 p-5">
              <div className="h-1 w-20 rounded-full bg-rose-500" />
              <h3 className="mt-4 text-base font-bold text-slate-900">借金が不安な場合</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                借金や未払い金がありそうな場合は、まず書類を捨てずに確保してください。
                不用意に処分すると、あとで判断しづらくなることがあります。
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
                不動産が複数ある、相続人が多い、誰が何を引き継ぐか不透明などの場合は、
                片付けと並行して全体の整理が必要になります。
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

        <Section id="summary" title="まとめ｜実家の片付けで最短で失敗しない動き方">
          <p>
            親が亡くなった後の実家の片付けは、ただ物を減らす作業ではありません。最初に大切なのは、
            手続きや確認に必要なものを確保することです。
          </p>

          <div className="rounded-2xl bg-amber-50 p-5">
            <ul className="space-y-3 text-[15px] leading-8 text-slate-700">
              <li>・まずは捨てる前に分ける</li>
              <li>・通帳、契約書、不動産書類、借金関係の書類を先に探す</li>
              <li>・急ぐ必要があるケースだけ見極める</li>
              <li>・難しいなら無理に抱え込まず相談する</li>
            </ul>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-rose-50 p-5">
              <h3 className="text-base font-bold text-slate-900">借金が気になる方へ</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                督促状や借入明細が見つかった場合は、片付けだけで進めず、まず期限や流れを確認してください。
              </p>
              <div className="mt-4">
                <Link href="/souzoku-houki" className={secondaryLinkClass}>
                  相続放棄について確認する
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <h3 className="text-base font-bold text-slate-900">相続全体の整理が必要な方へ</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                不動産や名義変更、相談先選びで迷う場合は、全体の流れを先に整理しておくと動きやすくなります。
              </p>
              <div className="mt-4">
                <Link href="/souzoku-tetsuzuki" className={secondaryLinkClass}>
                  相続手続きの相談先を確認する
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </div>

      <SiteFooter />
    </main>
  );
}