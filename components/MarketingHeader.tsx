/**
 * MarketingHeader
 *
 * 認証不要の公開ページ（/login, /privacy, /terms, /company 等）で使う共通ヘッダー。
 * /digital/* で使う DigitalHeader とは別物。
 *
 * ロゴをクリックすると TOP（/）に戻る。シンプルで邪魔にならない最小構成。
 */

import Link from 'next/link';

export default function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
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
