/**
 * /  — つぎの手ナビ デジタル資産 ランディングページ
 *
 * Figma 提案ベースの全面リデザイン:
 *   - 大きな日本語タイポグラフィ（ヒーロー36-40px / 見出し30px / 本文18-20px）
 *   - 写真中心の構成（円形ファミリー写真 + 最小限の本文）
 *   - シンプルなチェックリスト・カード型UI
 *   - 高コントラスト + 太い緑のCTA
 *   - 各セクションは1〜2フレーズまで、視覚的に区切る
 *
 * セクション構成:
 *   1. Hero（写真 + コピー + CTA）
 *   2. こんな方におすすめ（4項目）
 *   3. できること（4機能）
 *   4. プラン（無料プラン / 有料プラン）
 *   5. ご利用の流れ（5ステップ: 登録 → 整理 → 招待 → 連携 → 完全削除）+ 退会について
 *   6. 数値バンド（中間CTA）
 *   7. 安心・安全へのこだわり（3項目）
 *   8. FAQ（厳選5項目）
 *   9. 最終CTA + 写真
 *   10. フッター（ダーク）
 *
 * 写真は placehold.co のプレースホルダ。本番デプロイ前に Figma の最終写真に差替え予定。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Lock,
  Check,
  ArrowRight,
  UserPlus,
  FolderClosed,
  Send,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'つぎの手ナビ デジタル資産｜大切な方へのデジタル引き継ぎ',
  description:
    'スマホ・パソコン のパスワードや、ご利用中のサブスク・SNS を大切な方に引き継ぐ準備ができるサービスです。メール登録だけですぐに始められ、無料プランはずっと無料です。',
};

const SITE_URL = 'https://www.tsuginotenavi.jp';

// サービスLP向け構造化データ（GEO/AI検索の理解精度向上）。
// 価格・無料範囲はページ表示（Plans セクション）と一致させること。
const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${SITE_URL}/#service`,
  name: 'つぎの手ナビ デジタル資産',
  serviceType: 'デジタル資産の整理・引き継ぎサービス',
  url: SITE_URL,
  description:
    'スマホ・パソコンのパスワードや、利用中のサブスク・SNS・ネット銀行などのデジタル資産を整理し、もしものときに選んだ大切な方へ届ける準備ができるサービス。無料プラン（登録・PDF出力・定期リマインド）は無料。',
  provider: { '@id': `${SITE_URL}/#organization` },
  areaServed: { '@type': 'Country', name: '日本' },
  offers: [
    {
      '@type': 'Offer',
      name: '無料プラン',
      price: '0',
      priceCurrency: 'JPY',
      description:
        'デジタル資産・サービスの登録（無制限）、大切な方に共有（PDF出力）、定期リマインド',
    },
    {
      '@type': 'Offer',
      name: '有料プラン',
      priceCurrency: 'JPY',
      description:
        '初回登録から30日間無料でお試し。スマホ・パソコンのパスワード保管、連携アカウント（最大10名）など。料金は連携するお一人につき月額¥110（税込）。',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '110',
        priceCurrency: 'JPY',
        unitText: '月（税込）／お一人',
      },
    },
  ],
};

// TOP は未ログイン向けの静的 LP。広告流入（ほぼ未ログイン）で毎回 Supabase 認証
// 通信が走ると LCP/FCP を大きく悪化させるため、サーバー認証は行わず静的生成する。
// 「ログイン済みユーザー→/digital」への誘導は middleware の Cookie 判定で行う
// （ネットワーク往復なし）。これにより TOP は CDN キャッシュ可能になる。
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <Header />
      <main className="flex-1">
        <Hero />
        <Audience />
        <Features />
        <Plans />
        <UsageFlow />
        <StatsCTA />
        <Trust />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

// =============================================================================
// Header
// =============================================================================
function Header() {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-8 sm:py-5">
        <Link
          href="/"
          className="flex min-w-0 flex-shrink items-baseline gap-1.5 sm:gap-2"
        >
          <span className="whitespace-nowrap text-base font-bold text-slate-900 sm:text-lg">
            つぎの手ナビ
          </span>
          <span className="hidden whitespace-nowrap text-xs text-slate-500 sm:inline sm:text-sm">
            デジタル資産
          </span>
        </Link>
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-3">
          <Link
            href="/login?next=/digital"
            className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:px-4 sm:py-2 sm:text-base"
          >
            ログイン
          </Link>
          <Link
            href="/signup?next=/digital"
            className="whitespace-nowrap rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 sm:px-5 sm:py-2 sm:text-base"
          >
            新規登録
          </Link>
        </div>
      </div>
    </header>
  );
}

// =============================================================================
// 1. Hero
// =============================================================================
function Hero() {
  return (
    <section className="bg-gradient-to-b from-emerald-50 to-white px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-16">
      <div className="mx-auto max-w-3xl text-center">
        {/* Hero 円形ファミリー写真 */}
        <div className="mx-auto mb-10 aspect-square w-56 overflow-hidden rounded-full shadow-lg sm:w-72">
          <Image
            src="/images/hero-family.webp"
            alt="食卓を囲む 3 世代の日本人家族"
            width={576}
            height={576}
            priority
            sizes="(max-width: 640px) 224px, 288px"
            className="h-full w-full object-cover"
          />
        </div>

        <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
          <span className="inline-block">あなたにもしもがあったら、</span>
          <span className="inline-block">家族のために何ができる？</span>
        </h1>

        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
          今できるのは家族を&ldquo;困らせない準備&rdquo;。スマホ・パソコンのパスワードや大切なデジタル情報を、生前は誰にも見せず、もしもの時だけ大切な人へ。
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/signup?next=/digital"
            className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-5 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02] hover:bg-emerald-700 sm:w-auto sm:text-xl"
          >
            無料ではじめる
          </Link>
        </div>

        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
          ※ 登録は無料。30 日間の無料お試し後、有料プランの登録がなければ、自動で無料プランに切り替わります。
        </p>
      </div>
    </section>
  );
}

// =============================================================================
// 2. 自分ごと化セクション（旧「こんな方におすすめ」を作り直し）
// =============================================================================
function Audience() {
  const points = [
    {
      title: 'スマホ・パソコンが開けないと、家族は手が出せない',
      body: 'いちばん困るのは、本体のパスワードが分からないこと。',
    },
    {
      title: 'もしもは、ある日突然かもしれない',
      body: '年齢に関係なく、備える時間が予告なく終わることもあります。',
    },
    {
      title: 'だから、元気な今こそ',
      body: '必要なのは重い手続きではなく、数分の準備。',
    },
  ];

  return (
    <section className="px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold leading-snug text-slate-900 sm:text-3xl md:text-4xl">
          その「もしも」は、
          <br className="sm:hidden" />
          いつ訪れるか分かりません。
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          スマホやパソコンには、連絡先・写真・お金まわり・契約まで大切な情報がぎっしり。もしものとき、それらに
          <b className="font-bold text-slate-800">家族がたどり着けるのは、あなたが準備していた場合だけ</b>
          です。
        </p>

        <ul className="mt-12 space-y-4">
          {points.map((p, i) => (
            <li
              key={i}
              className="flex items-start gap-4 rounded-2xl bg-emerald-50 px-6 py-5 sm:px-8 sm:py-6"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 sm:h-10 sm:w-10">
                <Check className="h-4 w-4 text-white sm:h-5 sm:w-5" aria-hidden="true" />
              </span>
              <span className="text-base text-slate-800 sm:text-lg">
                <b className="font-bold">{p.title}</b>
                <span className="mt-1 block text-sm text-slate-600 sm:text-base">
                  {p.body}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-10 max-w-xl text-center text-base font-medium leading-relaxed text-slate-700 sm:text-lg">
          あなたの「もしも」に備えることは、
          <br className="sm:hidden" />
          残された人への、いちばんやさしい思いやりです。
        </p>
      </div>
    </section>
  );
}

// =============================================================================
// 3. できること
// =============================================================================
function Features() {
  // 2026-05 改訂：機能の羅列ではなく「得られる価値」を 3 つに集約。
  //   有料プランで提供される主要機能であることを見出しに明示。
  const items = [
    {
      iconSrc: '/images/icons/shield-check.png',
      iconAlt: '盾とチェックマークのアイコン',
      title: '大切な方へ情報を確実に連携',
      body:
        'ご逝去を運営が確認し、14 日間の異議申立期間を経て、登録情報をご指定の連携先（最大 10 名）へ連携します。',
    },
    {
      iconSrc: '/images/icons/password.png',
      iconAlt: '盾と鍵のアイコン',
      title: 'スマホ・パソコンのパスワードも安全に引き継ぎ',
      body:
        '端末内で暗号化して保管するため、運営にも平文では見えません。生前はあなたのマスターコードで守られ、連携先は「連携の合言葉」でのみ受け取れます。',
    },
    {
      iconSrc: '/images/icons/wishes.png',
      iconAlt: '封筒とハートのアイコン',
      title: '「どうしてほしいか」も伝えられる',
      body:
        '解約・引き継ぎ・追悼 ── サービスごとに、あなたの意思を残せます。',
    },
  ];

  return (
    <section className="bg-emerald-50/50 px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold leading-snug text-slate-900 sm:text-3xl md:text-4xl">
          もしもの安心を、
          <br />
          3 つのかたちで。
          <span className="mt-2 block text-sm font-medium text-slate-500 sm:text-base md:text-lg">
            （有料プラン）
          </span>
        </h2>

        <div className="mt-12 space-y-5">
          {items.map((it, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-center gap-4 sm:gap-5">
                <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-100 sm:h-16 sm:w-16">
                  <Image
                    src={it.iconSrc}
                    alt={it.iconAlt}
                    width={64}
                    height={64}
                    className="h-9 w-9 sm:h-10 sm:w-10"
                  />
                </span>
                <h3 className="text-lg font-bold text-slate-900 sm:text-xl">{it.title}</h3>
              </div>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                {it.body}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500 sm:text-base">
          ※ 無料プランでも、デジタル資産の登録と PDF 出力はご利用いただけます。
        </p>
      </div>
    </section>
  );
}

// =============================================================================
// 4. プラン
// =============================================================================
function Plans() {
  return (
    <section id="plans" className="px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
          プラン
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-base leading-relaxed text-slate-600 sm:text-lg">
          ※ 登録は無料。30 日間の無料お試し後、有料プランの登録がなければ、自動で無料プランに切り替わります。
        </p>

        <div className="mt-12 space-y-5 sm:space-y-6">
          {/* 無料プラン */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">無料プラン</h3>
              <p className="text-2xl font-bold text-slate-900 sm:text-3xl">¥0</p>
            </div>

            <ul className="mt-6 space-y-3 text-base text-slate-700 sm:text-lg">
              <PlanRow ok>デジタル資産・サービスの登録（無制限）</PlanRow>
              <PlanRow ok>大切な方に共有（PDF 出力）</PlanRow>
              <PlanRow ok>定期リマインド</PlanRow>
              <PlanRow>スマホ・パソコンのパスワード保管</PlanRow>
              <PlanRow>大切な方への連携アカウント（最大 10 名）</PlanRow>
              <PlanRow>操作履歴</PlanRow>
            </ul>
          </div>

          {/* 有料プラン（共有 ID 単位の従量課金） */}
          <div className="relative rounded-2xl border-2 border-emerald-500 bg-white p-6 shadow-lg sm:p-8">
            <span className="absolute -top-3 left-6 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white sm:left-8">
              おすすめ
            </span>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">有料プラン</h3>
              <p className="text-right">
                <span className="text-2xl font-bold text-slate-900 sm:text-3xl">¥110</span>
                <span className="ml-1 text-sm font-normal text-slate-500">
                  / 月（税込）/ お一人
                </span>
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-500 sm:text-sm">
              例：妻に連携 = ¥110/月、妻+お子様 2 人 = ¥330/月
            </p>

            <ul className="mt-6 space-y-3 text-base text-slate-700 sm:text-lg">
              <PlanRow ok>デジタル資産・サービスの登録（無制限）</PlanRow>
              <PlanRow ok>大切な方に共有（PDF 出力）</PlanRow>
              <PlanRow ok>定期リマインド</PlanRow>
              <PlanRow ok strong>スマホ・パソコンのパスワード保管</PlanRow>
              <PlanRow ok strong>大切な方への連携アカウント（最大 10 名）</PlanRow>
              <PlanRow ok strong>操作履歴</PlanRow>
            </ul>
          </div>
        </div>

        {/* PDF 内容に関する補足 */}
        <p className="mx-auto mt-6 max-w-xl text-center text-xs leading-relaxed text-slate-500 sm:text-sm">
          ※ PDF に含まれるのは、登録したサービス名・公式 URL・引き継ぎご希望・メモ・担当の方のみです。
          パスワードや口座番号などの機微情報は一切含まれません。
        </p>
      </div>
    </section>
  );
}

function PlanRow({
  children,
  ok,
  strong,
}: {
  children: React.ReactNode;
  ok?: boolean;
  strong?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      {ok ? (
        <Check
          className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
            strong ? 'text-emerald-700' : 'text-emerald-500'
          }`}
          aria-hidden="true"
        />
      ) : (
        <span aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-center text-slate-300">
          ―
        </span>
      )}
      <span
        className={
          ok
            ? strong
              ? 'font-semibold text-slate-900'
              : 'text-slate-700'
            : 'text-slate-400'
        }
      >
        {children}
      </span>
    </li>
  );
}

// =============================================================================
// 5. ご利用の流れ（Apple Store 風 / 全体ジャーニーの 5 ステップ）
// =============================================================================
function UsageFlow() {
  const steps = [
    {
      number: '01',
      title: '数十秒で、すぐに始められる。',
      subtitle: 'メール認証 または Google アカウント',
      description:
        'ご登録時に書類のご準備は不要。会員登録すれば、その場でデジタル資産の整理を始められます。',
      icon: UserPlus,
    },
    {
      number: '02',
      title: 'デジタル資産を、丁寧に登録する。',
      subtitle: 'サービス・デバイス・希望',
      description:
        'ご利用中のオンラインサービスや、スマートフォン・PC を登録。「もしも」のときに大切な方にどう引き継いでほしいかも、合わせて記録できます。',
      icon: FolderClosed,
    },
    {
      number: '03',
      title: '信頼できる大切な方を、招待する。',
      subtitle: '最大 10 名まで、月額 ¥110/名',
      description:
        'ご家族・パートナー・親しい友人など、信頼できる方を招待。初回登録から 30 日間は無料でお試しいただけます。',
      icon: Send,
    },
    {
      number: '04',
      title: 'もしものときに、大切な方へ情報を連携。',
      subtitle: '運営確認と異議申立期間を経たうえで連携',
      description:
        'ご逝去の事実が確認された後、書類確認（5 営業日以内）と異議申立期間（14 日間）を経て、登録された情報をご指定の大切な方へ連携します。',
      icon: ShieldCheck,
    },
    {
      number: '05',
      title: '1 年間お役立ていただいて、完全削除。',
      subtitle: '個人情報を、最後まで守る',
      description:
        'もしものときの情報連携から 1 年間、大切な方に必要な情報をご活用いただいた後、すべてのデータを完全に削除します。お預かりした情報を、最後まで責任を持って守ります。',
      icon: Trash2,
    },
  ];

  return (
    <section id="usage-flow" className="bg-[#F5F5F0] px-6 py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-4xl">
        {/* セクション見出し */}
        <div className="mb-16 md:mb-24 lg:mb-32 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
            ご利用の流れ
          </h2>
        </div>

        {/* Steps */}
        <div className="space-y-16 md:space-y-24 lg:space-y-32">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              {/* 番号 */}
              <span className="mb-6 inline-block text-4xl font-bold tracking-tight text-emerald-600 md:text-5xl lg:text-6xl">
                {step.number}
              </span>

              {/* アイコン */}
              <div className="mb-6 flex justify-center md:mb-8">
                <step.icon
                  className="h-12 w-12 text-gray-400 md:h-14 md:w-14 lg:h-16 lg:w-16"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>

              {/* タイトル */}
              <h3 className="mb-3 text-[1.75rem] font-bold leading-tight tracking-tight text-gray-900 md:mb-4 md:text-4xl lg:text-[2.75rem]">
                {step.title}
              </h3>

              {/* サブタイトル */}
              <p className="mb-4 text-lg font-light text-gray-500 md:mb-6 md:text-xl lg:text-2xl">
                {step.subtitle}
              </p>

              {/* 説明 */}
              <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* ヘルプ導線 */}
        <div className="mt-16 text-center md:mt-24 lg:mt-32">
          <Link
            href="/digital/settings/help"
            className="text-sm text-emerald-600 transition-colors hover:text-emerald-700 md:text-base"
          >
            詳しくはヘルプをご覧ください →
          </Link>
        </div>

        {/* 退会について */}
        <div className="mt-20 pt-12 md:mt-28 md:pt-16 lg:mt-36">
          <div className="text-center">
            <h3 className="mb-3 text-lg font-medium text-gray-500 md:text-xl">
              退会について
            </h3>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-gray-400 md:text-base">
              設定画面からいつでも退会いただけます。退会するとすべてのデータが即時削除され、復元はできません。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// 6. 数値バンド + 中間 CTA
// =============================================================================
function StatsCTA() {
  return (
    <section className="bg-emerald-700 px-5 py-16 text-white sm:px-8 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold leading-snug sm:text-3xl md:text-4xl">
          大切な方を亡くした後、
          <br className="sm:hidden" />
          デジタル関連で困った経験のある人は
        </h2>

        <div className="mx-auto mt-8 max-w-md rounded-2xl bg-emerald-600/40 px-8 py-8 sm:py-10">
          <p className="text-5xl font-bold sm:text-6xl">60.9%</p>
          <p className="mt-3 text-sm text-emerald-50 sm:text-base">
            最多の困りごとは
            <br />
            <b className="text-white">「スマホ・パソコンのパスワードが分からない」</b>
          </p>
          <p className="mt-2 text-xs text-emerald-100 sm:text-sm">
            2026 年 BlueAdventures 調べ
          </p>
        </div>

        <p className="mt-8 text-base leading-relaxed text-emerald-50 sm:text-lg">
          あなたの家族を、この 60.9% にしないために。
          <br className="sm:hidden" />
          スマホ・パソコンのパスワードを安全に保管し、必要なときだけ大切な人へ届けられます。
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/signup?next=/digital"
            className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-white px-8 py-5 text-lg font-bold text-emerald-700 shadow-lg transition hover:scale-[1.02] hover:bg-emerald-50 sm:w-auto sm:text-xl"
          >
            無料ではじめる
          </Link>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// 7. 安心・安全へのこだわり
// =============================================================================
function Trust() {
  const items = [
    {
      title: '見られるのはご本人だけ',
      body:
        'スマホ・パソコンのパスワードは、ご本人が決めた合言葉（マスターコード）で守られ、ご本人とご指定の連携先以外は見られません。',
    },
    {
      title: '強いセキュリティで大切に保管',
      body:
        '端末内で AES-256 暗号化してから保管します。マスターコードがなければ中身は見られません。',
    },
    {
      title: '1 年後の完全削除',
      body:
        'もしものときの連携を終えた後、すべての情報を 1 年後に完全削除します。',
    },
  ];

  return (
    <section className="px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
          安心・安全へのこだわり
        </h2>

        <div className="mt-12 space-y-5">
          {items.map((it, i) => (
            <div
              key={i}
              className="rounded-2xl border border-emerald-200 bg-white p-6 sm:p-7"
            >
              <div className="flex items-start gap-4 sm:gap-5">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-base font-bold text-white sm:h-10 sm:w-10 sm:text-lg">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 sm:text-xl">{it.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-slate-600 sm:text-lg">
                    {it.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// 8. FAQ
// =============================================================================
function FAQ() {
  const faqs = [
    {
      q: '連携先の方は、登録した情報をどうやって受け取れますか？',
      a:
        '受け取り方は 2 通りあります。生前にご本人から PDF や連携アカウントを通じて共有を受ける方法と、ご逝去の事実を運営が確認し 14 日間の異議申立期間を経て自動で連携される方法です。なお、PDF にはデジタル資産情報のみが含まれ、スマホ・パソコン のパスワードは含まれません。',
    },
    {
      q: '連携先の方も会員登録は必要ですか？費用はかかりますか？',
      a:
        '連携先の方も、メール認証または Google アカウントで無料の会員登録が必要です。費用は招待したご本人がご負担いただくため、連携先の方には一切かかりません。',
    },
    {
      q: 'マスターコードを忘れたらどうなりますか？',
      a: 'マスターコードは当社でも復元できない設計です。お客様自身で安全に保管をお願いします。万一忘れた場合は、保存したパスワードを削除して、新しいマスターコードで再登録していただきます。',
    },
    {
      q: '有料プランから無料プランに戻したら、サービスの登録情報はどうなりますか？',
      a:
        'すべての情報は保持されます。デジタル資産・サービスの登録は無料プランでも無制限にご利用いただけます。有料プラン限定の機能（スマホ・パソコンのパスワード保管 等）のみご利用いただけなくなりますが、登録した資産情報は引き続き閲覧・編集できます。',
    },
    {
      q: 'どんな決済方法に対応していますか？',
      a: 'クレジットカード（Visa / Mastercard / JCB / AMEX）に対応しています。',
    },
    {
      q: 'データはどのように保管されますか？',
      a: '日本のサーバーで強いセキュリティをかけて保管します。スマホ・パソコン のパスワードはお客様のマスターコードで守られており、運営側でも中身を見ることはできません。',
    },
  ];

  return (
    <section id="faq" className="bg-slate-50 px-5 py-20 sm:px-8 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            '@id': `${SITE_URL}/#faq`,
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: { '@type': 'Answer', text: faq.a },
            })),
          }),
        }}
      />
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
          よくある質問
        </h2>

        <div className="mt-10 space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group rounded-2xl bg-white open:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-5 text-base font-bold text-slate-900 sm:px-7 sm:py-6 sm:text-lg">
                <span>{faq.q}</span>
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl text-emerald-700 transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="px-6 pb-6 text-base leading-relaxed text-slate-600 sm:px-7 sm:pb-7 sm:text-lg">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// 9. 最終 CTA
// =============================================================================
function FinalCTA() {
  return (
    <section className="bg-emerald-50/50 px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        {/* 最終 CTA 円形ファミリー写真（親子の縁側シーン） */}
        <div className="mx-auto mb-8 aspect-square w-44 overflow-hidden rounded-full shadow-lg sm:w-52">
          <Image
            src="/images/cta-family.webp"
            alt="縁側で穏やかに語らう親子"
            width={416}
            height={416}
            className="h-full w-full object-cover"
          />
        </div>

        <h2 className="text-2xl font-bold leading-snug text-slate-900 sm:text-3xl md:text-4xl">
          あなたにできる、
          <br className="sm:hidden" />
          家族への思いやりを。
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
          もしものときの「どこに何があるか分からない」を、いまのうちに無くしておく。それが、大切な人への最初の贈り物になります。
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/signup?next=/digital"
            className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-5 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02] hover:bg-emerald-700 sm:w-auto sm:text-xl"
          >
            無料ではじめる
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// Footer（ダーク）
// =============================================================================
function Footer() {
  return (
    <footer className="bg-slate-900 px-5 py-12 text-center sm:px-8 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-base font-semibold text-white sm:text-lg">
          つぎの手ナビ デジタル資産
        </p>
        <p className="mt-2 text-xs text-slate-400 sm:text-sm">大切な方へのデジタル引き継ぎ</p>

        <nav className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm sm:text-base">
          <Link href="/guide" className="text-slate-300 hover:text-white">
            役立ちガイド
          </Link>
          <Link href="/terms" className="text-slate-300 hover:text-white">
            利用規約
          </Link>
          <Link href="/privacy" className="text-slate-300 hover:text-white">
            プライバシーポリシー
          </Link>
          <Link href="/company" className="text-slate-300 hover:text-white">
            運営会社・お問い合わせ
          </Link>
        </nav>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>SSL 暗号化通信 ・ AES-256 データ暗号化</span>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Blue Adventures
        </p>
      </div>
    </footer>
  );
}
