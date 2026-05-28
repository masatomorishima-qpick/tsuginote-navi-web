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
 *   4. プラン（FREE / STANDARD）
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
import { redirect } from 'next/navigation';
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
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';

export const metadata: Metadata = {
  title: 'つぎの手ナビ デジタル資産｜大切な方へのデジタル引き継ぎ',
  description:
    'スマホ・PC のパスワードや、ご利用中のサブスク・SNS を大切な方に引き継ぐ準備ができるサービスです。30 日間無料、クレジットカード登録不要。',
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect('/digital');
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 antialiased">
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
            className="h-full w-full object-cover"
          />
        </div>

        <h1 className="text-3xl font-bold leading-snug tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
          もしもの時、
          <br />
          大切な方が困らない準備を
        </h1>

        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
          スマホ・PC のパスワードと、
          <br />
          デジタル情報の引き継ぎを、
          <br className="sm:hidden" />
          いまから整える場所
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/signup?next=/digital"
            className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-5 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02] hover:bg-emerald-700 sm:w-auto sm:text-xl"
          >
            無料ではじめる
          </Link>
        </div>

        <p className="mt-4 text-sm text-slate-500 sm:text-base">
          ※ クレジットカード不要・30 日間無料
        </p>
      </div>
    </section>
  );
}

// =============================================================================
// 2. こんな方におすすめ
// =============================================================================
function Audience() {
  const items = [
    '親の相続でスマートフォン・PC のパスワードに困った経験がある',
    '健康診断や入院で「もしも」を意識したことがある',
    '退職や老後を見据えたデジタル資産の整理に興味がある',
    '大切な方にデジタル情報を残しておきたい',
  ];

  return (
    <section className="px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
          こんな方におすすめ
        </h2>

        <ul className="mt-12 space-y-4">
          {items.map((it, i) => (
            <li
              key={i}
              className="flex items-center gap-4 rounded-2xl bg-emerald-50 px-6 py-5 sm:px-8 sm:py-6"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 sm:h-10 sm:w-10">
                <Check className="h-4 w-4 text-white sm:h-5 sm:w-5" aria-hidden="true" />
              </span>
              <span className="text-base font-medium text-slate-800 sm:text-lg">{it}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// =============================================================================
// 3. できること
// =============================================================================
function Features() {
  // できることセクションのアイコン定義（カスタム PNG）
  const items = [
    {
      iconSrc: '/images/icons/password.png',
      iconAlt: '盾と鍵のアイコン',
      title: 'パスワード保管',
      body: 'スマホ・PC のロック解除パスワードを暗号化して保管。本人のマスターコードなしでは誰も取り出せません。',
    },
    {
      iconSrc: '/images/icons/organize.png',
      iconAlt: '整理されたグリッドのアイコン',
      title: 'デジタル資産の整理',
      body: 'サブスク・SNS・金融など、お使いのサービスを 7 カテゴリで整理。「もしもの時」の希望も指定できます。',
    },
    {
      iconSrc: '/images/icons/pdf-export.png',
      iconAlt: '書類と矢印のアイコン',
      title: '大切な方に共有',
      body: '有効期限つきの URL を発行して大切な方にお伝えするか、同じ内容の A4 PDF をその場でダウンロード。印刷・郵送・メール添付にもお使いいただけます。',
    },
    {
      iconSrc: '/images/icons/wishes.png',
      iconAlt: '封筒とハートのアイコン',
      title: 'もしもの指示も残せる',
      body: '解約してほしい・大切な方に引き継ぎたい・思い出として残したい ── サービスごとに選べます。',
    },
  ];

  return (
    <section className="bg-emerald-50/50 px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
          できること
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
        <p className="mt-4 text-center text-base text-slate-600 sm:text-lg">
          まずは 30 日間、無料でじっくり試せます
        </p>

        <div className="mt-12 space-y-5 sm:space-y-6">
          {/* FREE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">FREE</h3>
              <p className="text-2xl font-bold text-slate-900 sm:text-3xl">
                ¥0
                <span className="ml-1 text-sm font-normal text-slate-500">ずっと無料</span>
              </p>
            </div>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">まずは試してみたい方へ</p>

            <ul className="mt-6 space-y-3 text-base text-slate-700 sm:text-lg">
              <PlanRow ok>デジタル資産・サービスの登録（無制限）</PlanRow>
              <PlanRow ok>大切な方に共有（PDF・期限付き URL）</PlanRow>
              <PlanRow ok>定期リマインド</PlanRow>
              <PlanRow>スマホ・PC のパスワード保管</PlanRow>
              <PlanRow>連携アカウントでの常時共有</PlanRow>
            </ul>
          </div>

          {/* STANDARD（新モデル：共有 ID 単位の従量課金） */}
          <div className="relative rounded-2xl border-2 border-emerald-500 bg-white p-6 shadow-lg sm:p-8">
            <span className="absolute -top-3 left-6 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white sm:left-8">
              おすすめ
            </span>
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">STANDARD</h3>
              <p className="text-right">
                <span className="text-2xl font-bold text-slate-900 sm:text-3xl">¥110</span>
                <span className="ml-1 text-sm font-normal text-slate-500">
                  / 月（税込）/ お一人
                </span>
              </p>
            </div>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              大切な方 1 名ごと ¥110/月。最初の招待から 30 日間は無料。
              <br />
              <span className="text-xs">例：妻に共有 = ¥110/月、妻+お子様 2 人 = ¥330/月</span>
            </p>

            <ul className="mt-6 space-y-3 text-base text-slate-700 sm:text-lg">
              <PlanRow ok strong>デジタル資産・サービスの登録（無制限）</PlanRow>
              <PlanRow ok strong>スマホ・PC のパスワード保管</PlanRow>
              <PlanRow ok strong>大切な方への連携アカウント（最大 10 名）</PlanRow>
              <PlanRow ok>PDF 出力 / 定期リマインド / 操作履歴</PlanRow>
              <PlanRow ok>見守り通知（後日リリース）</PlanRow>
            </ul>
          </div>
        </div>
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
        '面倒な書類は不要。会員登録すれば、その場でデジタル資産の整理を始められます。',
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
        'ご家族・パートナー・親しい友人など、信頼できる方を招待。最初の招待から 30 日間は無料でお試しいただけます。',
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
        '連携から 1 年間、大切な方に必要な情報をご活用いただいた後、すべてのデータを完全に削除します。お預かりした情報を、最後まで責任を持って守ります。',
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
          大切な方の死後、
          <br className="sm:hidden" />
          困った経験のある方は
        </h2>

        <div className="mx-auto mt-8 max-w-md rounded-2xl bg-emerald-600/40 px-8 py-8 sm:py-10">
          <p className="text-5xl font-bold sm:text-6xl">60.9%</p>
          <p className="mt-3 text-sm text-emerald-50 sm:text-base">
            最多の困りごとは
            <br />
            <b className="text-white">「スマホ・PC のパスワード不明」（29%）</b>
          </p>
          <p className="mt-2 text-xs text-emerald-100 sm:text-sm">
            2026 年 BlueAdventures 調べ
          </p>
        </div>

        <p className="mt-8 text-base leading-relaxed text-emerald-50 sm:text-lg">
          つぎの手ナビなら、その「鍵」となる
          <br className="sm:hidden" />
          スマホ・PC のパスワードを
          <br />
          安全に保管し、必要なときに大切な方に届けられます。
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/signup?next=/digital"
            className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-white px-8 py-5 text-lg font-bold text-emerald-700 shadow-lg transition hover:scale-[1.02] hover:bg-emerald-50 sm:w-auto sm:text-xl"
          >
            無料ではじめる
          </Link>
        </div>
        <p className="mt-4 text-sm text-emerald-100 sm:text-base">
          ※ メールアドレスだけで簡単登録
          <br className="sm:hidden" />
          ・クレジットカード不要
        </p>
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
      title: '完全プライベート',
      body: '生前は本人しかアクセスできません。大切な方や運営でも閲覧不可です。',
    },
    {
      title: 'データ暗号化',
      body: 'スマホ・PC のパスワードは AES-256 で暗号化して保管します。',
    },
    {
      title: '広告なし',
      body: '安心して使っていただけるよう、広告は一切表示しません。',
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
      q: '大切な方は、登録した情報をどうやって受け取れますか？',
      a:
        '受け取り方は 2 通りあります。(1) ご本人が生前に「大切な方に共有」ページから、有効期限つきの URL や PDF をお渡しする方法。(2) ご逝去後に、運営の本人確認と異議申立期間（14 日間）を経て、登録された大切な方へ情報を連携する方法です。どちらの場合も、サービス名・ご希望・担当の方・メモ・公式 URL などの登録内容が連携対象となります。',
    },
    {
      q: 'マスターコードを忘れたらどうなりますか？',
      a: 'マスターコードは当社でも復元できない設計です。お客様自身で安全に保管をお願いします。万一忘れた場合は、保存したパスワードを削除して、新しいマスターコードで再登録していただきます。',
    },
    {
      q: 'STANDARD から FREE に戻したら、サービスの登録情報はどうなりますか？',
      a:
        'すべての情報は保持されます。デジタル資産・サービスの登録は FREE プランでも無制限にご利用いただけます。STANDARD 限定の機能（スマホ・PC のパスワード保管 等）のみご利用いただけなくなりますが、登録した資産情報は引き続き閲覧・編集できます。',
    },
    {
      q: 'クレジットカード以外の支払い方法はありますか？',
      a: 'クレジットカード（Visa / Mastercard / JCB / AMEX）、Apple Pay、Google Pay に対応しています。',
    },
    {
      q: 'データはどのように保管されますか？',
      a: '日本のクラウドデータベースに暗号化して保管します。スマホ・PC のパスワードはお客様のマスターコードで暗号化された状態で保存され、サーバー側でも取り出せません。',
    },
  ];

  return (
    <section id="faq" className="bg-slate-50 px-5 py-20 sm:px-8 sm:py-24">
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
          大切な方への、
          <br className="sm:hidden" />
          いちばん最初の贈り物を
        </h2>

        <div className="mt-10 flex justify-center">
          <Link
            href="/signup?next=/digital"
            className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-5 text-lg font-bold text-white shadow-lg transition hover:scale-[1.02] hover:bg-emerald-700 sm:w-auto sm:text-xl"
          >
            無料ではじめる
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>

        <p className="mt-4 text-sm text-slate-500 sm:text-base">
          5 分で登録完了 ・ 今すぐ使える
        </p>
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
