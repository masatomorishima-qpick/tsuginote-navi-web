import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} つぎの手ナビ</p>

          <nav className="flex flex-wrap items-center justify-center gap-5">
            {/* 2026-07-29 削除：「デジタル資産の整理」（/login?next=/digital）。
                メインのコンテンツではなく、開発を止めているプロダクトへの新規登録導線が
                残っていると、機微なデータを預ける利用者が生まれてしまうため。
                /digital・/login への直接アクセスは従来どおり可能（noindex と
                robots.txt の Disallow も維持）。 */}
            {/* 2026-07-29 追加：/loan 配下がサイト内のどこからもHTMLのリンクで辿れない状態
                （/shisan 側の導線はJSで描画されるためクローラーに見えない）だったため、
                共通フッターに入口を置く。サーバー出力のHTMLに href="/loan" が必ず含まれる。 */}
            <Link href="/loan" className="hover:text-slate-700">
              住宅ローンの判断
            </Link>
            <Link href="/guide" className="hover:text-slate-700">
              役立ちガイド
            </Link>
            <Link href="/privacy" className="hover:text-slate-700">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="hover:text-slate-700">
              利用規約
            </Link>
            <Link href="/company" className="hover:text-slate-700">
              運営会社
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}