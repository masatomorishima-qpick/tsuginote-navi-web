import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";

export default function TermsPage() {
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
            利用規約
          </h1>

          <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
            この利用規約（以下、「本規約」といいます。）は、つぎの手ナビ（以下、「当サイト」といいます。）の利用条件を定めるものです。
            当サイトをご利用になる方は、本規約に同意したものとみなします。
          </p>

          <div className="mt-10 space-y-10 text-sm leading-7 text-slate-700 sm:text-base">
            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                1. 当サイトの内容
              </h2>
              <p className="mt-3">
                当サイトは、相続放棄、相続手続き、死亡後手続きその他関連テーマについて、
                一般的な情報整理および相談先案内を提供するサービスです。
                当サイトは、法律相談、税務相談、個別事案に対する専門的判断を直接提供するものではありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                2. 自己責任原則
              </h2>
              <p className="mt-3">
                利用者は、自らの責任において当サイトを利用するものとします。
                当サイト上の情報を参考にした結果、何らかの損害や不利益が生じた場合でも、
                当サイト運営者は故意または重過失がある場合を除き責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                3. 専門家・提携先の案内について
              </h2>
              <p className="mt-3">
                当サイトは、必要に応じて提携先専門家・事業者の案内や取次ぎを行う場合があります。
                実際の契約、相談、依頼の可否、費用、条件等は、利用者と提携先との間で直接確認・判断していただくものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                4. 禁止事項
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>法令または公序良俗に反する行為</li>
                <li>虚偽情報の入力</li>
                <li>当サイトまたは第三者の権利利益を侵害する行為</li>
                <li>サーバーやネットワークに過度の負荷を与える行為</li>
                <li>不正アクセス、スクレイピング、リバースエンジニアリング等の行為</li>
                <li>当サイト運営を妨害する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                5. 知的財産権
              </h2>
              <p className="mt-3">
                当サイトに掲載される文章、画像、ロゴ、デザインその他一切のコンテンツに関する権利は、
                当サイト運営者または正当な権利者に帰属します。無断での複製、転載、改変等を禁止します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                6. サービスの変更・停止
              </h2>
              <p className="mt-3">
                当サイトは、システム保守、障害対応、サービス改善その他の理由により、
                事前の予告なく内容の変更、停止または終了を行うことがあります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                7. 免責
              </h2>
              <p className="mt-3">
                当サイトは、掲載情報の正確性、完全性、最新性、有用性等について保証するものではありません。
                また、当サイトからリンクされた外部サイトの内容についても責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                8. 規約の変更
              </h2>
              <p className="mt-3">
                当サイトは、必要に応じて本規約を改定できるものとします。
                改定後の利用規約は、本ページに掲載した時点で効力を生じます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                9. 準拠法・管轄
              </h2>
              <p className="mt-3">
                本規約は日本法に準拠します。
                当サイトに関して生じた紛争については、当サイト運営者所在地を管轄する裁判所を第一審の専属的合意管轄とします。
              </p>
            </section>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}