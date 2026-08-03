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
            {/* 2026-08-03 追加：退職金・年金セクション（駅1）の入口。/loan と同じく、
                サーバー出力HTMLから /retirement へ辿れるようにする。 */}
            <Link href="/retirement" className="hover:text-slate-700">
              退職金・年金の判断
            </Link>
            <Link href="/guide" className="hover:text-slate-700">
              役立ちガイド
            </Link>
            <Link href="/privacy" className="hover:text-slate-700">
              プライバシーポリシー
            </Link>
            {/* 2026-07-30 追加：中立性ポリシー（/policy）。ASP経由の広告リンクを掲載する前に
                「広告が結論を変えない」ためのルールを公開する方針（後付けは信頼を毀損するため）。
                信頼表記の並び（プライバシーポリシーと利用規約の間）に置き、全ページの
                サーバー出力HTMLから辿れるようにする。 */}
            <Link href="/policy" className="hover:text-slate-700">
              中立性ポリシー
            </Link>
            <Link href="/terms" className="hover:text-slate-700">
              利用規約
            </Link>
            <Link href="/company" className="hover:text-slate-700">
              運営会社
            </Link>
          </nav>
        </div>

        {/* 2026-07-29 追加：中立性の免責。もともと /shisan 専用の ShisanFooter にだけ
            あったものを、フッター統一にあわせて全ページ共通に移した。
            記事ごとの免責は読み切った人にしか届かないが、フッターの一文は
            どのページでも、どの深さで離脱しても目に入るため。 */}
        <p className="mt-6 border-t border-slate-100 pt-4 text-center text-xs leading-relaxed text-slate-500 sm:text-left">
          本サイトは一般的な情報と、入力された数字にもとづく試算のみを提供します。特定の金融商品・保険・サービスの推奨や、投資助言・金融商品の販売勧誘は行いません。すべて目安です。
        </p>
      </div>
    </footer>
  );
}