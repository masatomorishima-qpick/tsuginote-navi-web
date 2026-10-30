/**
 * 広告の着地ページ（LP）用のヘッダー。2026-10-31 新設。
 *
 * 記事用の GuideHeader はロゴがトップページへのリンクになっているが、
 * 広告から来た人をサイト内の別ページに逃がさないため、LP ではロゴをリンクにしない（名前を見せるだけ）。
 */
export default function LpHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center px-3 py-3 sm:px-8 sm:py-5">
        <span className="whitespace-nowrap text-base font-bold text-slate-900 sm:text-lg">つぎの手ナビ</span>
      </div>
    </header>
  );
}
