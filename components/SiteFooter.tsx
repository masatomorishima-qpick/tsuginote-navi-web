import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} つぎの手ナビ</p>

          <nav className="flex flex-wrap items-center justify-center gap-5">
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