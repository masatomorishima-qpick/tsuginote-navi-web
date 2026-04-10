import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import BackButton from "@/components/common/BackButton";

export const metadata: Metadata = {
  title: "プライバシーポリシー | つぎの手ナビ 2nd",
  description:
    "つぎの手ナビ 2nd における情報の取扱い、匿名データの利用目的、Cookie等の利用について記載しています。",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <BackButton
              fallbackHref="/tokyo/souzoku-houki/start"
              label="← 前のページへ戻る"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            プライバシーポリシー
          </h1>

          <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
            BlueAdventures が運営する「つぎの手ナビ 2nd」（以下、「当サイト」といいます。）は、
            当サイトをご利用いただく方の情報の取扱いについて、以下のとおり定めます。
          </p>

          <div className="mt-10 space-y-10 text-sm leading-7 text-slate-700 sm:text-base">
            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                1. 取得・保存しない情報
              </h2>
              <p className="mt-3">
                当サイトでは、アンケート回答にあたり、氏名、メールアドレス、電話番号その他の個人を特定できる情報を取得・保存しません。
              </p>
              <p className="mt-3">
                また、自由記述欄は設けておらず、個人情報の入力を前提とした設計にはしていません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                2. 取得する情報
              </h2>
              <p className="mt-3">
                当サイトでは、個人を特定できない匿名データとして、以下の情報を取得する場合があります。
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>セッションID</li>
                <li>アンケート回答内容</li>
                <li>閲覧ページ、操作履歴、利用日時</li>
                <li>Cookie、ローカルストレージその他の識別子</li>
                <li>IPアドレス、ブラウザ情報、端末情報</li>
                <li>参照元、広告計測に関する情報</li>
              </ul>
              <p className="mt-3">
                これらは、単独では特定の個人を識別することを目的とするものではありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                3. 利用目的
              </h2>
              <p className="mt-3">
                取得した匿名データは、以下の目的で利用します。
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>当サイトの提供および運営</li>
                <li>表示ロジックの調整および改善</li>
                <li>UI/UXの改善</li>
                <li>利用状況の分析</li>
                <li>広告効果の測定</li>
                <li>不正利用の防止</li>
                <li>障害対応および品質向上</li>
                <li>利用規約違反への対応</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                4. 連絡方法と情報の流れ
              </h2>
              <p className="mt-3">
                当サイトでは、運営者が利用者に代わって問い合わせを送信すること、一括配信を行うこと、自動送信を行うことはありません。
              </p>
              <p className="mt-3">
                掲載先への連絡は、利用者自身が自らの端末上で、メールアプリ、電話、LINEその他の方法により直接行うものです。
              </p>
              <p className="mt-3">
                そのため、当サイトは、利用者が掲載先へ直接送信した氏名、メールアドレス、電話番号その他の情報を、
                当サイトのデータベース上で取得・保存するものではありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                5. 第三者提供
              </h2>
              <p className="mt-3">
                当サイトは、法令に基づく場合を除き、取得した情報を、個人を識別できる形で第三者に提供しません。
              </p>
              <p className="mt-3">
                なお、当サイトは、利用者に代わって掲載先へ個人情報を送信する仕組みを採用していません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                6. 外部サービスの利用
              </h2>
              <p className="mt-3">
                当サイトでは、アクセス解析、利用状況把握、広告効果測定等のために外部サービスを利用する場合があります。
                これらの外部サービスにおいては、各事業者の定めるプライバシーポリシーに基づき情報が取り扱われる場合があります。
              </p>
              <p className="mt-3">
                例として、Google Analytics、Microsoft Clarity 等を利用する場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                7. Cookie等の利用
              </h2>
              <p className="mt-3">
                当サイトでは、利便性向上、利用状況分析、広告効果測定、不正利用防止等のためにCookie等を利用する場合があります。
              </p>
              <p className="mt-3">
                ご利用のブラウザ設定によりCookieを無効化することも可能ですが、その場合、一部機能が正しく動作しないことがあります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                8. 安全管理
              </h2>
              <p className="mt-3">
                当サイトは、取得した匿名データについて、不正アクセス、漏えい、滅失、改ざん等を防止するため、
                合理的な範囲で安全管理措置を講じます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                9. 保存期間
              </h2>
              <p className="mt-3">
                当サイトは、匿名データ、利用ログ、広告計測情報その他の運営上必要な情報を、
                サービス改善、分析、不正利用防止その他必要な目的の範囲で保存する場合があります。
              </p>
              <p className="mt-3">
                一方で、氏名、メールアドレス、電話番号その他個人を特定できる情報については、
                当サイトのサービス設計上、取得・保存を行いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                10. 開示・訂正・削除等
              </h2>
              <p className="mt-3">
                当サイトでは、原則として個人を識別できる情報を保有していないため、
                個人情報保護法上の開示、訂正、利用停止、削除等の対象となる情報を保有しない場合があります。
              </p>
              <p className="mt-3">
                ただし、法令上対応が必要な場合には、法令に従い適切に対応します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                11. 改定
              </h2>
              <p className="mt-3">
                本ポリシーは、法令改正やサービス内容の変更に応じて、予告なく改定することがあります。
                改定後の内容は、本ページに掲載した時点から効力を生じます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                12. お問い合わせ窓口
              </h2>
              <p className="mt-3">
                情報の取扱いに関するお問い合わせは、運営会社ページ記載の連絡先までご連絡ください。
              </p>
            </section>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}