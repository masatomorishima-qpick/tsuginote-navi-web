import Link from 'next/link';

/**
 * 広告の着地ページ（LP）用のフッター。2026-10-31 新設。
 *
 * 共通の SiteFooter から、サイト内の別ページへの入口（住宅ローンの判断・退職金・年金の判断・役立ちガイド）を外した。
 * 広告から来た人を他のページに逃がさないため。
 * 中立性ポリシーは LP の最初の画面（PR 表記の横）に置いているので、ここには重ねて置かない。
 * プライバシーポリシー・利用規約・運営会社は、運営者を確かめる場所として残す（広告の審査でも求められる）。
 */
export default function LpFooter() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} つぎの手ナビ</p>
          <nav className="flex flex-wrap items-center justify-center gap-5">
            <Link href="/privacy" className="hover:text-slate-700">プライバシーポリシー</Link>
            <Link href="/terms" className="hover:text-slate-700">利用規約</Link>
            <Link href="/company" className="hover:text-slate-700">運営会社</Link>
          </nav>
        </div>
        <p className="mt-6 border-t border-slate-100 pt-4 text-center text-xs leading-relaxed text-slate-500 sm:text-left">
          本サイトは一般的な情報と、入力された数字にもとづく試算のみを提供します。特定の金融商品・保険・サービスの推奨や、投資助言・金融商品の販売勧誘は行いません。すべて目安です。
        </p>
      </div>
    </footer>
  );
}
