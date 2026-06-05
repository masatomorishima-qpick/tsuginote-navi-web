import Link from 'next/link';

/**
 * ガイド記事用ヘッダー — LP（app/page.tsx）の Header と同じ見た目。
 * 旧ロゴ画像（tsuginote-logo.png）は使わない。
 */
export default function GuideHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-8 sm:py-5">
        <Link href="/" className="flex min-w-0 flex-shrink items-baseline gap-1.5 sm:gap-2">
          <span className="whitespace-nowrap text-base font-bold text-slate-900 sm:text-lg">
            つぎの手ナビ
          </span>
          <span className="hidden whitespace-nowrap text-xs text-slate-500 sm:inline sm:text-sm">
            デジタル資産
          </span>
        </Link>
        <Link
          href="/"
          className="flex-shrink-0 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline sm:text-base"
        >
          つぎの手ナビとは &rsaquo;
        </Link>
      </div>
    </header>
  );
}
