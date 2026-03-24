import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

export default function PrivacyPage() {
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
            プライバシーポリシー
          </h1>

          <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
            つぎの手ナビ（以下、「当サイト」といいます。）は、当サイトをご利用いただく方の個人情報を適切に取り扱うため、
            以下のとおりプライバシーポリシーを定めます。
          </p>

          <div className="mt-10 space-y-10 text-sm leading-7 text-slate-700 sm:text-base">
            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                1. 取得する情報
              </h2>
              <p className="mt-3">
                当サイトでは、お問い合わせやサービス利用時に、氏名、メールアドレス、電話番号、都道府県、相談内容その他入力フォームに記載された情報を取得することがあります。
                また、アクセス解析や広告計測のため、Cookie、IPアドレス、閲覧ページ、参照元、広告識別情報等を取得する場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                2. 利用目的
              </h2>
              <p className="mt-3">
                取得した情報は、以下の目的で利用します。
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>お問い合わせへの対応</li>
                <li>ご相談内容に応じた案内や情報提供</li>
                <li>提携先専門家・事業者への取次ぎまたは紹介</li>
                <li>サービス改善、利便性向上、導線最適化のための分析</li>
                <li>広告配信、効果測定、不正利用防止</li>
                <li>利用規約違反への対応</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                3. 個人情報の第三者提供
              </h2>
              <p className="mt-3">
                当サイトは、法令に基づく場合を除き、ご本人の同意なく個人情報を第三者へ提供しません。
                ただし、ご本人が相談申込等を行い、提携先専門家・事業者への紹介や取次ぎを希望した場合には、
                対応に必要な範囲で情報を提供することがあります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                4. 外部サービスの利用
              </h2>
              <p className="mt-3">
                当サイトでは、アクセス解析、広告計測、フォーム運用、サイト運営のために外部サービスを利用する場合があります。
                これらの外部サービス提供者が、それぞれのプライバシーポリシーに基づき情報を取り扱うことがあります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                5. Cookie等の利用
              </h2>
              <p className="mt-3">
                当サイトでは、利便性向上や利用状況分析、広告効果測定のためにCookie等を利用する場合があります。
                ご利用のブラウザ設定によりCookieを無効化することも可能ですが、一部機能が正しく動作しない場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                6. 安全管理
              </h2>
              <p className="mt-3">
                当サイトは、個人情報への不正アクセス、漏えい、滅失、改ざん等を防止するため、合理的な範囲で安全管理措置を講じます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                7. 開示・訂正・削除等
              </h2>
              <p className="mt-3">
                ご本人から自己の個人情報について、開示、訂正、利用停止、削除等の請求があった場合には、法令に従い適切に対応します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                8. 改定
              </h2>
              <p className="mt-3">
                本ポリシーは、法令改正やサービス内容の変更に応じて、予告なく改定することがあります。
                改定後の内容は、本ページに掲載した時点から効力を生じます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                9. お問い合わせ窓口
              </h2>
              <p className="mt-3">
                個人情報の取扱いに関するお問い合わせは、運営会社ページ記載の連絡先までご連絡ください。
              </p>
            </section>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}