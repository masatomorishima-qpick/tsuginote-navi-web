/**
 * /digital/settings/upgrade/success
 *
 * Stripe Checkout 成功時のランディングページ。
 *
 * Webhook より先にユーザーがここに到達するケースに備え、
 * 画面側ではプラン情報を「処理中の可能性あり」として表現する。
 * 実際の DB 反映は Webhook 経由で行う設計（このページでは反映しない）。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { createDigitalServerClient } from '@/lib/supabase/digitalServer';

export const metadata: Metadata = {
  title: 'お支払い完了 | つぎの手ナビ',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function UpgradeSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const supabase = await createDigitalServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?next=/digital/settings/upgrade');
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600">
          <CheckCircle2 className="h-7 w-7 text-white" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-emerald-900">
          お支払いを受け付けました
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-emerald-900/90">
          STANDARD プランへのアップグレードを承りました。
          スマホ・PC のパスワード保管をはじめ、すべての機能をご利用いただけます。
          領収書はご登録のメールアドレスに Stripe より送信されます。
        </p>
        {session_id && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs text-emerald-900/60 hover:text-emerald-900/80">
              お問い合わせの際に必要な情報を表示
            </summary>
            <div className="mt-2 rounded-lg bg-white/50 p-3 text-xs text-emerald-900/70">
              <p className="font-medium">サポート用 ID（保管する必要はありません）</p>
              <p className="mt-1 break-all font-mono text-[11px] text-emerald-900/60">
                {session_id}
              </p>
              <p className="mt-2 text-[11px] text-emerald-900/60">
                ※ 万が一お支払いに関するお問い合わせをいただく際、
                サポート担当が照合に使用する場合があります。
                日常的に保管・確認する必要はありません。
              </p>
            </div>
          </details>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <Sparkles
          className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600"
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-slate-900">反映には数十秒かかる場合があります</p>
          <p className="mt-1 text-slate-600">
            ダッシュボードのプラン表示が「STANDARD」に切り替わらない場合は、
            画面を再読み込みしてください。1 分以上待っても切り替わらない場合は、
            設定画面の「お支払い情報の管理」からカスタマーポータルでご確認いただけます。
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/digital"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          ダッシュボードへ
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          href="/digital/settings"
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          設定画面へ
        </Link>
      </div>
    </div>
  );
}
