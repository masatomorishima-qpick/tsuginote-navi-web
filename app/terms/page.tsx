import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import BackButton from "@/components/common/BackButton";

export const metadata: Metadata = {
  title: "利用規約 | つぎの手ナビ 2nd",
  description:
    "つぎの手ナビ 2nd の利用規約です。中立的な候補表示、連絡方法、免責、禁止事項などを記載しています。",
};

export default function TermsPage() {
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
            利用規約
          </h1>

          <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
            この利用規約（以下、「本規約」といいます。）は、BlueAdventures
            が運営する「つぎの手ナビ 2nd」（以下、「当サイト」といいます。）の利用条件を定めるものです。
            当サイトをご利用になる方は、本規約に同意したものとみなします。
          </p>

          <div className="mt-10 space-y-10 text-sm leading-7 text-slate-700 sm:text-base">
            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                1. 当サイトの内容
              </h2>
              <p className="mt-3">
                当サイトは、利用者によるアンケート回答その他の客観条件に基づき、
                相談先候補を中立的に表示するWebサービスです。
              </p>
              <p className="mt-3">
                当サイトは、特定の事務所その他の事業者を推薦、紹介、あっせんするものではありません。
                また、法律相談、税務相談その他の専門的判断そのものを直接提供するものでもありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                2. 表示ルール
              </h2>
              <p className="mt-3">
                当サイトにおける表示内容および表示順は、利用者の回答内容、掲載側が登録した対応条件、
                当サイト所定の中立的な表示ルール等に基づいて決定されます。
              </p>
              <p className="mt-3">
                掲載料の多寡によって表示順が変わることはありません。
                また、同一条件内ではランダム表示となる場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                3. 連絡方法
              </h2>
              <p className="mt-3">
                利用者は、表示された候補の中から、自らの判断で連絡先を選択するものとします。
                連絡は、利用者自身の端末上で、メールアプリ、電話、LINEその他の手段により直接行うものとします。
              </p>
              <p className="mt-3">
                当サイト運営者は、利用者に代わって問い合わせを送信すること、
                複数の掲載先へ一括配信すること、自動送信を行うこと、その他これに類する行為を行いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                4. 個人情報の取得・保存
              </h2>
              <p className="mt-3">
                当サイトは、アンケートにおいて、氏名、メールアドレス、電話番号その他の個人を特定できる情報を取得・保存しません。
                また、自由記述欄は設けておらず、個人情報の入力を前提としていません。
              </p>
              <p className="mt-3">
                当サイトが保存する情報は、セッションID、回答内容、閲覧履歴その他の個人を特定できない匿名データに限られ、
                サービス改善、表示ロジックの調整、利用状況の分析、不正防止等の目的で利用されます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                5. 自己判断・自己責任
              </h2>
              <p className="mt-3">
                当サイトに表示される情報は、利用者が相談先候補を比較検討するための参考情報です。
                最終的な連絡先の選択、問い合わせの実施、相談、委任契約その他の判断は、利用者自身の責任で行うものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                6. 保証の否認
              </h2>
              <p className="mt-3">
                当サイトは、掲載情報の正確性、完全性、最新性、有用性、特定目的への適合性その他一切の事項について保証するものではありません。
              </p>
              <p className="mt-3">
                また、当サイトは、問い合わせ件数、返信の有無、面談化、受任、契約成立、相談結果その他の成果を保証しません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                7. 免責
              </h2>
              <p className="mt-3">
                利用者は、自らの責任において当サイトを利用するものとします。
                当サイトの利用または利用不能により何らかの損害や不利益が生じた場合でも、
                当サイト運営者は故意または重過失がある場合を除き責任を負いません。
              </p>
              <p className="mt-3">
                また、利用者と掲載事務所その他第三者との間で生じた問い合わせ、相談、受任、契約、紛争その他一切の事項について、
                当サイト運営者は責任を負いません。
              </p>
              <p className="mt-3">
                当サイトからリンクされた外部サイト、外部サービスまたは掲載先が提供する情報・サービスについても、
                当サイト運営者は責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                8. 禁止事項
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>法令または公序良俗に反する行為</li>
                <li>虚偽情報の入力</li>
                <li>当サイトまたは第三者の権利利益を侵害する行為</li>
                <li>サーバーやネットワークに過度の負荷を与える行為</li>
                <li>不正アクセス、スクレイピング、リバースエンジニアリング等の行為</li>
                <li>当サイトの運営を妨害する行為</li>
                <li>その他、当サイト運営者が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                9. 知的財産権
              </h2>
              <p className="mt-3">
                当サイトに掲載される文章、画像、ロゴ、デザインその他一切のコンテンツに関する権利は、
                当サイト運営者または正当な権利者に帰属します。
                無断での複製、転載、改変等を禁止します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                10. サービスの変更・停止
              </h2>
              <p className="mt-3">
                当サイトは、システム保守、障害対応、サービス改善その他の理由により、
                事前の予告なく内容の変更、停止または終了を行うことがあります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                11. 規約の変更
              </h2>
              <p className="mt-3">
                当サイトは、必要に応じて本規約を改定できるものとします。
                改定後の利用規約は、本ページに掲載した時点で効力を生じます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                12. 準拠法・管轄
              </h2>
              <p className="mt-3">
                本規約は日本法に準拠します。
                当サイトに関して生じた紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </section>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}