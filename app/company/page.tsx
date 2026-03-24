import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <Link
              href="/"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              ← トップへ戻る
            </Link>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            運営会社
          </h1>

          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200">
            <dl className="divide-y divide-slate-200 text-sm sm:text-base">
              <div className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr] sm:px-6">
                <dt className="font-semibold text-slate-900">サイト名</dt>
                <dd className="text-slate-700">つぎの手ナビ</dd>
              </div>

              <div className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr] sm:px-6">
                <dt className="font-semibold text-slate-900">運営者名</dt>
                <dd className="text-slate-700">BlueAdventures</dd>
              </div>

              <div className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr] sm:px-6">
                <dt className="font-semibold text-slate-900">代表者</dt>
                <dd className="text-slate-700">森嶋　聖人</dd>
              </div>

              <div className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr] sm:px-6">
                <dt className="font-semibold text-slate-900">所在地</dt>
                <dd className="text-slate-700">神奈川県横浜市西区浅間町1丁目4番3号ウィザードビル402</dd>
              </div>

              <div className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr] sm:px-6">
                <dt className="font-semibold text-slate-900">メールアドレス</dt>
                <dd className="text-slate-700">info@blueadventures.jp</dd>
              </div>

              <div className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr] sm:px-6">
                <dt className="font-semibold text-slate-900">事業内容</dt>
                <dd className="text-slate-700">
                  相続・手続き・相談先案内に関する情報提供、
                  提携先専門家・事業者の案内、関連サービスの企画・運営
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}