import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import MarketingHeader from "@/components/MarketingHeader";
import BackButton from "@/components/common/BackButton";

export const metadata: Metadata = {
  title: "利用規約 | つぎの手ナビ 2nd",
  description:
    "つぎの手ナビ 2nd の利用規約です。中立的な候補表示、連絡方法、免責、禁止事項などを記載しています。",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <MarketingHeader />
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
            利用規約
          </h1>

          <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
            この利用規約（以下、「本規約」といいます。）は、BlueAdventures
            が運営する「つぎの手ナビ 2nd」（以下、「当サイト」といいます。）の利用条件を定めるものです。
            当サイトをご利用になる方は、本規約に同意したものとみなします。
          </p>

          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            当サイトは、(i) 匿名アンケートによる相談先候補の案内機能（以下、「<strong>候補案内機能</strong>」といいます。）
            と、(ii) ログインしてご利用いただくデジタル資産の整理・共有機能（<code>/digital/*</code>。以下、「<strong>デジタル資産機能</strong>」といいます。）
            の2つの機能を提供しています。第1条〜第12条は両機能に共通する内容ですが、デジタル資産機能の特性（ログインや家族共有など）に関する個別事項については、第13条に定めます。
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

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                13. デジタル資産機能に関する特則
              </h2>
              <p className="mt-3">
                本条は、デジタル資産機能に限り適用される特則です。本条と前各条で異なる内容が定められている場合、
                デジタル資産機能に関しては本条が優先します。
              </p>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-1. 機能の内容
              </h3>
              <p className="mt-3">
                デジタル資産機能は、ご本人にログインしていただいたうえで、ご利用中のデジタルサービスについて
                <strong>「サービス名」「カテゴリ」「もしものときのご希望」「担当されるご家族のお名前」「メモ（任意）」</strong>
                を記録し、もしものときに大切な方へ引き継ぐための機能です。あわせて、ご希望により、スマホ・パソコン等のパスワードを暗号化して保管し、PDF として出力する機能をご利用いただけます。
                引き継ぎは、(1) 生前にご本人が PDF や連携を通じて共有する方法と、(2) ご本人のご逝去を当社が確認した後にご指定の連携先へ開示する方法があります。
                登録サービスのユーザーID・口座番号・クレジットカード番号等の入力欄は設けていません。
              </p>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-2. パスワード等の取扱い（暗号化保管）
              </h3>
              <p className="mt-3">
                パスワード保管機能では、入力された情報を
                <strong>お客様の端末内で暗号化したうえで保存します</strong>。
                暗号化はご本人が設定するマスターコード（合言葉）に基づいており、
                <strong>当社は平文のパスワードを参照しません（参照できない設計です）</strong>。
                マスターコードを失念された場合、保管されたパスワードを復元することはできません（再設定が必要です）。
              </p>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-3. 連携とアカウント
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>アカウントの取得には、メールリンク認証または Google アカウントでのログインが必要です。アカウントの管理は、ご本人の責任において行ってください。</li>
                <li>ご本人は、メールアドレスを指定して大切な方を連携先として招待できます。連携は、招待された方が会員登録のうえ承認することで成立します（連携先は現在、最大 10 名までを目安としています）。</li>
                <li>連携先の方には、ご本人がご存命の間は情報は開示されません（ご本人が生前共有を有効にした場合を除く）。</li>
                <li>ご本人・連携先のいずれからも、連携はいつでも解除できます。</li>
              </ul>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-4. 料金・お支払い
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>連携機能は、連携 1 名あたり月額 110 円（税込）の有料機能です。最初の招待から 30 日間は無料でご利用いただけます。</li>
                <li>お支払いは決済代行事業者（Stripe）を通じて行われ、<strong>クレジットカード情報は当社のサーバーに保存されません</strong>。</li>
                <li>無料期間の終了までにお支払い手続（カード登録）がない場合、連携機能は休止し、自動的に無料プランへ切り替わります。登録されたデジタル資産情報は引き続き保持され、後日カードを登録することで再開できます。</li>
              </ul>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-5. 禁止事項（デジタル資産機能に固有の事項）
              </h3>
              <p className="mt-3">前各条の禁止事項に加え、デジタル資産機能のご利用にあたっては、以下の行為も禁止します。</p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>他人の認証情報・金融情報を、本人の同意なく登録・保管する行為。</li>
                <li>他人に成りすましてアカウントを取得し、または連携・逝去申請を行う行為。</li>
                <li>虚偽の逝去申請を行う行為。</li>
                <li>本機能を用いて、第三者の権利を侵害する情報を保存・共有する行為。</li>
              </ul>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-6. データの削除（退会時・ご逝去後）
              </h3>
              <p className="mt-3">
                ご本人は、設定画面から退会手続（アカウント削除）を行うことができます。
                退会手続が完了した時点で、登録されたデジタル資産、デバイス・パスワード保管情報、連携設定、リマインド設定、および認証データベース上のアカウント情報は
                <strong>原則として即時削除</strong>されます。
              </p>
              <p className="mt-3">
                また、ご本人のご逝去が確認され情報が開示された場合、当社は、ご遺族・連携先の方が必要な情報をご活用いただくための期間として、
                <strong>開示の日から 1 年間（365 日）を経過した後に、当該ご本人に関して登録されたすべての情報を完全に削除します</strong>。
                削除後の復元はいたしかねますので、必要に応じて事前に PDF 出力等により控えをご保管ください。
              </p>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-7. 免責
              </h3>
              <p className="mt-3">
                運営会社は、デジタル資産機能の利用または利用不能により生じた損害（登録漏れがあったこと、PDF の印刷内容が想定と異なったこと等を含みます）について、
                故意または重過失がある場合を除き責任を負いません。
                本機能は、ご本人ご自身による整理・引き継ぎを補助するツールであり、専門家による相続手続の代理や法的助言を行うものではありません。
              </p>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-8. 死亡通知（逝去申請）に関する禁止事項
              </h3>
              <p className="mt-3">
                デジタル資産機能における死亡通知（逝去申請）の手続にあたっては、
                前各条の禁止事項に加えて、以下を禁止します。
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>虚偽の死亡日、身分、続柄その他の事実を記載した申請を行う行為</li>
                <li>偽造または変造された書類（死亡を証明する書類、申請者の身分証）を提出する行為</li>
                <li>他人に成りすまして死亡通知を行う行為</li>
              </ul>
              <p className="mt-3">
                これらの行為は、<strong>刑法第 159 条（私文書偽造罪）、第 161 条（偽造私文書等行使罪）、第 246 条（詐欺罪）</strong>
                等に該当する可能性があります。発覚した場合、運営会社は刑事告訴を行うことがあります。
              </p>
              <p className="mt-3">
                運営会社は、虚偽の死亡通知が行われたと判断される場合、以下の措置を講じることがあります。
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>申請の即時無効化</li>
                <li>アカウントの利用停止</li>
                <li>該当書類および申請内容の保管と、捜査機関等からの照会への対応</li>
                <li>民事・刑事上の責任追及（刑事告訴を含む）</li>
              </ul>
              <p className="mt-3">
                アップロードされた書類の取り扱い（保管期間・保管場所・利用目的）については、
                当社プライバシーポリシー第 13 条をご参照ください。
              </p>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-9. 死亡通知の確認期間
              </h3>
              <p className="mt-3">
                運営会社は、連携先の方から死亡通知を受け付けた後、原則として
                <strong>5 営業日以内</strong>にご提出書類の確認を実施します。
              </p>
              <p className="mt-3">
                書類確認の完了後、ご本人のメールアドレス宛に「異議申立期間」（14 日間）に関するご案内を送信します。
                ご本人からの異議申立がなく、この待機期間が経過した場合に、登録情報を連携先全員に開示します。
                書類不備や虚偽が疑われた場合は、運営会社の判断により申請を却下することがあります。
              </p>
              <p className="mt-3">
                本人確認・逝去確認は、提出書類等に基づき合理的な範囲で行うものであり、その正確性・真正性を保証するものではありません。
                運営会社は、申請者による虚偽申請、書類の偽造、または連携先ご本人の故意・過失に起因する誤った開示について、
                運営会社に故意または重過失がある場合を除き責任を負いません。
              </p>
            </section>
          </div>
        </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}