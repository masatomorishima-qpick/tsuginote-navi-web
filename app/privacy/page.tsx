import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import MarketingHeader from "@/components/MarketingHeader";
import BackButton from "@/components/common/BackButton";

export const metadata: Metadata = {
  title: "プライバシーポリシー | つぎの手ナビ",
  description:
    "つぎの手ナビ における情報の取扱い、匿名データの利用目的、Cookie等の利用について記載しています。",
};

export default function PrivacyPage() {
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
            プライバシーポリシー
          </h1>

          <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
            BlueAdventures が運営する「つぎの手ナビ」（以下、「当サイト」といいます。）は、
            当サイトをご利用いただく方の情報の取扱いについて、以下のとおり定めます。
          </p>

          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            当サイトは、(i) 匿名アンケートによる相談先候補の案内機能（以下、「<strong>候補案内機能</strong>」といいます。）
            と、(ii) ログインしてご利用いただくデジタル資産の整理・共有機能（<code>/digital/*</code>。以下、「<strong>デジタル資産機能</strong>」といいます。）
            の2つの機能を提供しています。本ポリシーの第1〜12条は原則として両機能に共通する内容ですが、
            デジタル資産機能についてはログインや暗号化保管・連携などの特性があるため、第13条に個別事項を定めます。
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

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                13. デジタル資産機能における情報の取扱い
              </h2>
              <p className="mt-3">
                <code>/digital/*</code> 配下で提供するデジタル資産機能は、ご本人にログインしていただいたうえで
                ご自身のデジタルサービス（サブスクリプション、SNS、写真保管サービス等）について、
                名称・カテゴリ・ご家族への希望・担当されるご家族のお名前などを記録する機能です。
                本機能に限り、以下の情報を取得・保存します。第1条〜第10条で「取得・保存しない」
                「個人を識別できる情報を保有しない」旨が記載されている箇所は、候補案内機能を前提としており、
                デジタル資産機能については本条が優先します。
              </p>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-1. 取得する情報
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>メールアドレス（メールリンク認証／Google アカウント認証で使用）、Google 認証時のユーザー識別子</li>
                <li>ご自身が登録されたサービス名、カテゴリ、ご希望、担当されるご家族のお名前、メモ、月額目安</li>
                <li>デバイス・パスワード保管情報（暗号化済み。13-2 参照）</li>
                <li>連携情報（連携先・連携先につけた呼称・連携状態）</li>
                <li>ご逝去の確認に関する情報（逝去申請、提出書類、確認・異議申立の記録）</li>
                <li>決済に関する情報（プラン状態、課金数量、決済代行事業者が発行する顧客・サブスクリプション識別子）。<strong>クレジットカード番号は取得・保存しません。</strong></li>
                <li>リマインド設定、操作ログ（ログイン、資産の追加・更新・削除、PDF 出力、PIN の登録・表示など）</li>
              </ul>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-2. パスワード等の暗号化と非参照
              </h3>
              <p className="mt-3">
                デバイス・パスワード保管機能では、入力された情報を
                <strong>お客様の端末内で暗号化したうえで保存します</strong>。
                暗号化鍵はご本人のマスターコードに基づいており、
                <strong>当社は平文のパスワードを参照しません（参照できない設計です）</strong>。
                もしものときは、ご指定の連携先のみが「連携の合言葉」を用いて復号できます。
                なお、登録サービスのユーザーID・口座番号・クレジットカード番号等の入力欄は設けていません。
              </p>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-3. 保管先・安全管理
              </h3>
              <p className="mt-3">
                取得した情報は、Supabase（Supabase Inc. 提供）の東京リージョンのデータベースに保管します。
                Row Level Security（行単位アクセス制御）により、原則としてご本人および権限を持つ連携先以外はデータにアクセスできません。
                デバイス・パスワード等の機密情報は暗号化して保存します。
                逝去確認のために提出された死亡診断書等の書類は、非公開ストレージに保管し、当社の確認担当者のみが閲覧できる設定とし、確認後、一定期間を経て削除します。
              </p>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-4. 連携・ご逝去時の開示の仕組み
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>連携は、ご本人の招待を受けた方が会員登録のうえ承認することで成立します（現在は最大 10 名を目安）。</li>
                <li>ご本人がご存命の間は、連携先に情報は開示されません（生前共有を有効にした場合を除く）。</li>
                <li>連携先からの逝去申請を受け、当社が書類を確認（通常 5 営業日程度を目安）し、14 日間程度の異議申立期間を経たうえで、登録情報を連携先へ開示します。</li>
                <li>本人確認・逝去確認は合理的な範囲で行うものであり、その真正性を保証するものではありません。</li>
              </ul>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-5. 利用目的
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>デジタル資産機能の提供・運営、連携およびご逝去時の開示の実施</li>
                <li>ログイン認証、セッション管理、不正アクセス防止</li>
                <li>ご本人・連携先への通知（招待・承認・トライアル・開示・退会等のメール送信を含む）</li>
                <li>料金の請求・決済処理</li>
                <li>障害対応および品質向上、利用規約違反への対応</li>
              </ul>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-6. 保存期間・退会時の取扱い
              </h3>
              <p className="mt-3">
                ご本人がアカウント削除（退会）の手続をされた場合、登録されたすべての資産情報、デバイス・パスワード保管情報、連携設定、リマインド設定、認証情報は
                <strong>原則として即時削除</strong>します。
              </p>
              <p className="mt-3">
                また、ご本人のご逝去が確認され情報が開示された場合、お預かりした情報は、
                <strong>開示の日から 1 年間（365 日）を経過した後に完全に削除</strong>します。
              </p>
              <p className="mt-3">
                操作履歴（監査ログ）については、障害対応および不正利用防止のため、個人を特定できない形（利用者識別子を切り離した状態）で、
                作成から 90 日を経過したのち自動的に削除されます。
              </p>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-7. 開示・訂正・削除等の請求
              </h3>
              <p className="mt-3">
                デジタル資産機能で保有している情報の開示、訂正、削除等の請求は、次のいずれかの方法で行っていただけます。
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>画面内からの操作（登録内容の編集・削除、設定画面からの退会）</li>
                <li>運営会社ページ記載の連絡先へのご連絡</li>
              </ul>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-8. 外部委託・外国にある第三者への提供
              </h3>
              <p className="mt-3">
                デジタル資産機能で取得した情報を、法令に基づく場合を除き、ご本人の同意なく第三者に提供することはありません。
                機能の運営のため、以下の外部事業者に業務を委託しています。これらの一部は日本国外（米国等）に所在します。
                当社は、各委託先に対し、本ポリシーの利用目的の範囲内で必要な情報のみを提供し、適切な監督を行います。
                本機能をご利用いただくことで、これらの委託先への提供（外国にある第三者への提供を含む）に同意いただいたものとします。
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>Supabase Inc.（データベース・認証基盤。東京リージョンで保管）</li>
                <li>Stripe（決済処理。クレジットカード情報は同社が取扱い、当社は保持しません）</li>
                <li>Resend（通知メールの送信）</li>
                <li>Google（OAuth 認証を選択された場合）、Vercel（ホスティング）</li>
              </ul>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                13-9. 死亡通知に関する書類の取り扱い
              </h3>
              <p className="mt-3">
                連携先の方による死亡通知（逝去申請）の手続にあたり、以下の書類を連携先の方から
                アップロードいただきます。
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>死亡を証明する書類（死亡診断書、住民票（死亡記載あり）、戸籍謄本のいずれか）</li>
                <li>申請者の身分を確認できる書類（運転免許証、マイナンバーカード、健康保険証など）</li>
              </ul>
              <p className="mt-3">
                これらの書類は Supabase の専用のファイル保管領域に保存され、運営の確認担当者のみが、書類確認の本来の目的のために閲覧します。
                アップロード後は、アップロードされた方を含め、サービス画面から書類を再閲覧することはできません。
              </p>
              <p className="mt-3">
                保存期間は、ご本人への情報開示が完了した日から原則として <strong>7 日後</strong>に、書類本体および記録を自動的に削除します。
                申請が却下または取り下げられた場合も同様の取り扱いとします。
              </p>
              <p className="mt-3">
                これらの書類は、以下の目的でのみ利用します。
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>死亡通知の真正性の確認</li>
                <li>虚偽申請が疑われた場合の調査</li>
                <li>法令に基づき提出を求められた場合の対応（捜査機関等からの照会を含みます）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900">
                14. 資産づくり診断（/shisan）における情報の取扱い
              </h2>
              <p className="mt-3">
                資産づくり診断は登録不要でご利用いただけます。入力内容はご利用の端末（ブラウザ）内に保存されるほか、
                サービスの統計・分析・改善のため、<strong>個人を特定しない匿名の形（メールアドレス・氏名等は含みません）で、
                入力された家計の数値および診断の分類・試算結果をサーバーに記録します</strong>。この匿名記録には、
                同一ブラウザでの再診断を識別するための匿名ID（Cookie）を利用します。
                加えて、任意で診断内容の「保存」（メールアドレスの登録）をされた場合に限り、以下の情報を追加で取得・保存します。
                第1条〜第10条で「取得・保存しない」旨が記載されている箇所については、本条が優先します。
              </p>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                14-1. 登録前の匿名記録（登録不要・すべての利用者）
              </h3>
              <p className="mt-3">
                診断の完了時に、個人を特定しない匿名データとして、以下の情報をサーバーに記録します。
                メールアドレス・氏名等の個人を特定できる情報は含めません。
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>匿名ID（Cookie。同一ブラウザでの再診断の識別に使用）</li>
                <li>入力された家計の数値（年齢・収入・資産・生活費・毎月の余力・住宅ローンの有無／残高／金利／残年数・子の年齢／人数・想定リターン・目標額 等）</li>
                <li>診断の分類・試算結果（65歳時点の見込み額、目標に対する割合、分類結果 等）</li>
                <li>診断にかけたおおよその所要時間、再診断か新規かの別</li>
                <li>参照元・流入計測情報（リファラー、utm パラメータ 等）、利用環境情報（ブラウザの種類 等）</li>
              </ul>
              <p className="mt-3">
                匿名IDはCookieに基づくため、Cookieの削除、シークレットモードのご利用、ブラウザ・端末の変更等により別のIDとなり、
                同一の方として継続的に識別されるものではありません。
              </p>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                14-2. 取得する情報（診断内容を「保存」＝メール登録された場合）
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>メールアドレス</li>
                <li>保存時点の診断内容（入力された年齢・収入・資産等の数値、各質問への意思決定の記録、診断の分類結果）</li>
                <li>AI相談をご利用の場合：AIとの会話内容とAIの応答へのフィードバック</li>
                <li>実行申告をご利用の場合：決めた打ち手の実行状況と、任意でご入力いただいた月あたりの改善額（概算）</li>
              </ul>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                14-3. 利用目的
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-6">
                <li>診断結果・意思決定内容の保存機能の提供</li>
                <li>保存完了の通知メール・ログインリンクの送信</li>
                <li>AI相談機能の提供（保存された診断内容をAIの応答生成に利用します）</li>
                <li>AI相談の応答品質の改善（会話内容を運営担当者が確認・分析することがあります）</li>
                <li>実行実態の統計分析（個人を特定しない形での集計・公表を含む）</li>
                <li>見直し時期など、診断に関するご案内の送信</li>
              </ul>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                14-4. 保管先・委託先
              </h3>
              <p className="mt-3">
                取得した情報は、Supabase（Supabase Inc. 提供）の東京リージョンのデータベースに、アクセス制御を施したうえで保管します。
                通知メールの送信は Resend に委託しています。
                AI相談のご利用時は、応答の生成のため、会話内容と診断内容（数値）を Anthropic, PBC（米国）のAPIに送信します。
                <strong>メールアドレスはAIには送信しません。</strong>
                取得した情報を、法令に基づく場合を除き、ご本人の同意なく第三者に提供することはありません。
              </p>

              <h3 className="mt-6 text-base font-semibold text-slate-900">
                14-5. 削除のご請求
              </h3>
              <p className="mt-3">
                登録されたデータ（メールアドレス・診断内容）の削除をご希望の場合は、
                運営会社ページ記載の連絡先（第12条のお問い合わせ窓口）までご連絡ください。ご本人確認のうえ、速やかに削除します。
              </p>
              <p className="mt-3">
                なお、14-1 の登録前の匿名記録は、特定の個人と結びつく情報を含まないため、
                個別の記録を特定してのご請求への対応が難しい場合があります。
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