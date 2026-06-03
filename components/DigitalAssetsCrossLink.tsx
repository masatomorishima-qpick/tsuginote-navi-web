/**
 * DigitalAssetsCrossLink
 *
 * 既存サイト（相続放棄コンテンツ、アンケート結果ページ等）から、
 * デジタル資産機能 `/digital` への動線を提供する共通カード。
 *
 * 未ログインユーザーでも次のステップが明確になるよう、
 * 「ログイン画面 → ダッシュボード」に遷移する構成にしてある。
 */

import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

type Variant = 'default' | 'compact';

type Props = {
  variant?: Variant;
  className?: string;
};

export default function DigitalAssetsCrossLink({
  variant = 'default',
  className = '',
}: Props) {
  if (variant === 'compact') {
    return (
      <div
        className={`rounded-2xl border border-emerald-200 bg-emerald-50 p-4 ${className}`}
      >
        <p className="text-sm font-semibold text-emerald-900">
          ご家族のために、デジタル資産も整理しませんか
        </p>
        <p className="mt-1 text-xs leading-6 text-emerald-800/90">
          Netflix、LINE、iCloud、PayPay…増えたサブスクやアカウントを、
          パスワードを預けずに整理・共有できる無料ツールです。
        </p>
        <Link
          href="/login?next=/digital"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline"
        >
          3分ではじめる <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <section
      aria-label="デジタル資産の整理のご案内"
      className={`rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-8 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <ShieldCheck
            className="h-5 w-5 text-emerald-700"
            aria-hidden="true"
          />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold tracking-wider text-emerald-700">
            つぎの手ナビからのご案内
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Netflix、LINE、iCloud …
            <br className="sm:hidden" />
            ご家族は把握されていますか？
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
            気づけば増えたサブスクやアカウント。亡くなったあとに
            ご家族がひとつずつ探し当てるのは大きな負担です。
            <strong>
              つぎの手ナビ デジタル資産整理
            </strong>
            なら、パスワードや口座番号を預けることなく、
            サービス名ともしものときのご希望だけを整理して、
            ご家族に共有できます。
          </p>

          <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
            <li className="flex gap-2">
              <span className="text-emerald-600">✓</span>
              パスワード・ID・口座番号は一切お預かりしません
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600">✓</span>
              家族への手紙つきPDFでいつでも渡せます
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-600">✓</span>
              もしものとき、大切な方へ情報を確実に連携
            </li>
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/login?next=/digital"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              3分ではじめる
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <span className="text-xs text-slate-500">
              無料 ・ 登録はメールまたはGoogleアカウントのみ
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
