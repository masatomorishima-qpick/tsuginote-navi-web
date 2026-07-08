/**
 * /shisan 共通のヘッダー・フッター（追加要件B：ブランド統一）。
 * 診断ページ（page.tsx）にあったものを、チャット・マイページと共用するため切り出し。
 */

import Link from "next/link";

export function ShisanHeader() {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="mx-auto flex max-w-2xl items-center px-4 py-3">
        <Link href="/shisan" className="flex min-w-0 items-baseline gap-1.5 sm:gap-2">
          <span className="whitespace-nowrap text-base font-bold text-slate-900 sm:text-lg">つぎの手ナビ</span>
          <span className="whitespace-nowrap text-[11px] font-semibold text-emerald-700">資産づくり（β）</span>
        </Link>
      </div>
    </header>
  );
}

export function ShisanFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8 text-slate-500 text-xs">
        <div className="font-bold text-slate-700 mb-1">つぎの手ナビ 資産づくり（β）</div>
        <p className="mb-3 leading-relaxed">
          一般的な情報と、あなたが入力した数字による試算のみを提供します。特定の金融商品・保険・サービスの推奨や投資助言は行いません。すべて目安です。
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">プライバシーポリシー</a>
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">利用規約</a>
          <a href="/company" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-700">運営会社・お問い合わせ</a>
        </nav>
        <div>SSL 暗号化通信 ・ © 2026 Blue Adventures</div>
      </div>
    </footer>
  );
}
