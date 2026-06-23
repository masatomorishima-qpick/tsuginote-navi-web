import type { Metadata } from "next";
import AssetConciergeMvp from "./AssetConciergeMvp";

// テストLP：本体の相続・デジタル承継導線とは切り離した独立ルート。
// TOP・既存導線からはリンクしない。GA4 / Clarity は app/layout.tsx の設置を継承。
export const metadata: Metadata = {
  title: "つぎの手ナビ 資産づくり（β）",
  description:
    "資産づくりの質問に答えると、今月の“次の一手”が見えてくる。繰り上げ・投資・借り換え・教育費を、あなたの数字で中立に。",
  // テスト期間は検索インデックスを避けたい場合は noindex（不要なら削除）
  robots: { index: false, follow: false },
};

function SiteHeader() {
  // TOPページと同じロゴ（テキストワードマーク）。MVPのためリンクなし。
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="mx-auto flex max-w-2xl items-center px-4 py-3">
        <div className="flex min-w-0 items-baseline gap-1.5 sm:gap-2">
          <span className="whitespace-nowrap text-base font-bold text-slate-900 sm:text-lg">つぎの手ナビ</span>
          <span className="hidden whitespace-nowrap text-xs text-slate-500 sm:inline sm:text-sm">デジタル資産</span>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
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

export default function Page() {
  return (
    <>
      <SiteHeader />
      <AssetConciergeMvp />
      <SiteFooter />
    </>
  );
}
