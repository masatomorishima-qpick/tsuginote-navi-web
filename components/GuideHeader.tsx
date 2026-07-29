import Link from 'next/link';

/**
 * 記事・ガイド用の共通ヘッダー。
 *
 * 2026-07-29 の整理：
 *   ・サブタイトル「デジタル資産」を削除。サイトはデジタル資産に特化しておらず、
 *     住宅ローンや資産づくりの記事を読んでいる人に別サービス名を見せることになるため。
 *   ・右上のテキストリンク「つぎの手ナビとは ›」を削除。ロゴと同じ "/" を指しており
 *     完全な重複だった（削除前に両方のリンク先が同じであることを確認済み）。
 *   ・/privacy・/terms・/company もこのヘッダーに統一した。法務ページは記事の読者が
 *     「信用してよいか」を確かめる場所なので、記事と同じ見え方にしておく。
 */
export default function GuideHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center px-3 py-3 sm:px-8 sm:py-5">
        <Link href="/" className="flex min-w-0 items-baseline">
          <span className="whitespace-nowrap text-base font-bold text-slate-900 sm:text-lg">
            つぎの手ナビ
          </span>
        </Link>
      </div>
    </header>
  );
}
