import type { Metadata } from "next";
import BackButton from "@/components/common/BackButton";
import SiteFooter from "@/components/SiteFooter";
import GuideHeader from "@/components/GuideHeader";

/* 2026-07-29 追加：ページ固有の metadata。
 * これがないと app/layout.tsx の既定（サイト全体のタイトル）がそのまま使われ、
 * 検索結果でトップページと同じタイトルになってしまう。 */
const PAGE_TITLE = "運営会社・お問い合わせ";
const PAGE_DESCRIPTION =
  "つぎの手ナビを運営する Blue Adventures の会社情報とお問い合わせ先です。当サイトは入力された数字にもとづく試算と一般的な情報を提供し、特定の金融商品・金融機関の推奨は行いません。";
const OG_IMAGE = `https://www.tsuginotenavi.jp/og?title=${encodeURIComponent(`${PAGE_TITLE} | つぎの手ナビ`)}`;

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | つぎの手ナビ`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "https://www.tsuginotenavi.jp/company" },
  openGraph: {
    title: `${PAGE_TITLE} | つぎの手ナビ`,
    description: PAGE_DESCRIPTION,
    url: "https://www.tsuginotenavi.jp/company",
    siteName: "つぎの手ナビ",
    type: "website",
    locale: "ja_JP",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: PAGE_TITLE }],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
};

export default function CompanyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <GuideHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8">
              <BackButton
                fallbackHref="/"
                label="← 前のページへ戻る"
                className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
              />
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
                <dd className="text-slate-700">森嶋 聖人</dd>
              </div>

              <div className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr] sm:px-6">
                <dt className="font-semibold text-slate-900">所在地</dt>
                <dd className="text-slate-700">
                  神奈川県横浜市西区浅間町1丁目4番3号ウィザードビル402
                </dd>
              </div>

              <div className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr] sm:px-6">
                <dt className="font-semibold text-slate-900">メールアドレス</dt>
                <dd className="text-slate-700">info@blueadventures.jp</dd>
              </div>

              <div className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_1fr] sm:px-6">
                <dt className="font-semibold text-slate-900">事業内容</dt>
                <dd className="text-slate-700">
                  相続・手続きに関する情報整理支援、
                  相談先候補の中立的な表示サービスの企画・運営
                </dd>
              </div>
            </dl>
          </div>
        </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}