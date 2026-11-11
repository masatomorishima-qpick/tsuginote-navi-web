import type { Metadata } from "next";
import Link from "next/link";
import BackButton from "@/components/common/BackButton";
import SiteFooter from "@/components/SiteFooter";
import GuideHeader from "@/components/GuideHeader";

/* 2026-07-30 新設：中立性ポリシー（広告掲載と運営の方針）。
 * ASP経由の広告リンクを掲載する前に、収益のしくみと「広告が結論を変えない」ための
 * ルールをあらかじめ公開する（後付けの公開は信頼を毀損するため、掲載開始前に制定する）。
 *
 * 実装方針：
 * - 本文は開発指示書の確定稿を一字一句そのまま掲載する（要約・追記をしない約束。
 *   確定稿の半角括弧・半角コロンもそのまま維持している）
 * - レイアウトは既存静的ページ（/privacy・/terms・/company）を踏襲し、新デザインを作らない
 * - サーバーコンポーネントのみで構成し、全文をサーバー出力のHTMLに含める
 *   （JS非実行でも読める。/shisan がJS依存でほぼ空に見えていた反省を引き継ぐ）
 * - 構造化データ（Articleスキーマ等）は付けない（記事ではないため）
 * - metadata は /company の慣例（canonical あり＋OGP一式）に合わせる（2026-07-30 masato回答）
 */
const PAGE_TITLE = "中立性ポリシー(紹介料と運営の方針)";
const PAGE_DESCRIPTION =
  "つぎの手ナビの収益のしくみ（紹介料を受け取るリンクと、給湯器の見積もりの取り次ぎ）をすべて開示し、紹介料が記事の結論や診断の結果に影響しないために自らに課すルールを公開するものです。";
const OG_IMAGE = `https://www.tsuginotenavi.jp/og?title=${encodeURIComponent(`${PAGE_TITLE} | つぎの手ナビ`)}`;

export const metadata: Metadata = {
  title: `${PAGE_TITLE} | つぎの手ナビ`,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "https://www.tsuginotenavi.jp/policy" },
  openGraph: {
    title: `${PAGE_TITLE} | つぎの手ナビ`,
    description: PAGE_DESCRIPTION,
    url: "https://www.tsuginotenavi.jp/policy",
    siteName: "つぎの手ナビ",
    type: "website",
    locale: "ja_JP",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: PAGE_TITLE }],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
};

export default function PolicyPage() {
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
              中立性ポリシー(紹介料と運営の方針)
            </h1>

            {/* 制定日は「公開作業を行った日（日本時間）」＝2026-07-30（masato回答Q3。
                push が後日になる場合は日付を差し替える運用）。 */}
            <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
              制定日:2026年7月30日(最終改定:2026年11月4日)
              <br />
              運営:Blue Adventures(つぎの手ナビ)
            </p>

            <div className="mt-10 space-y-10 text-sm leading-7 text-slate-700 sm:text-base">
              <section>
                <h2 className="text-xl font-semibold text-slate-900">このページについて</h2>
                <p className="mt-3">
                  つぎの手ナビは、暮らしで迷ったときに、次にやることが分かるところまでまとめるサイトです。給湯器の交換、パスワードや保険の整理、相続ともしもの備えを扱います。
                </p>
                <p className="mt-3">
                  当サイトは、紹介料で収益を得ています。紹介料で収益を得る情報サイトにいちばん問われるのは「紹介料のために結論を曲げていないか」です。このページは、当サイトが結論を曲げないために自分に課しているルールを公開するものです。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900">
                  1. 当サイトがすること・しないこと
                </h2>
                <p className="mt-3">
                  <strong>すること</strong>
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>費用・寿命・制度などの目安を、出典つきでお伝えすること</li>
                  <li>あなたが入力した条件にもとづく診断の結果を表示すること</li>
                  <li>あなたが希望した場合に、見積もりの取り次ぎを行うこと（給湯器）</li>
                </ul>
                <p className="mt-3">
                  <strong>しないこと</strong>
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>保険・投資商品・ローンなど、金融商品の販売や仲介</li>
                  <li>工事そのものの請負や、工事代金の受け取り</li>
                  <li>法律・税金などの個別の相談への回答</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900">
                  2. 収益のしくみ(すべて開示します)
                </h2>
                <p className="mt-3">当サイトの収益源は、次の2つに限ります。</p>
                <p className="mt-3">
                  <strong>紹介料を受け取るリンク(アフィリエイト)</strong>
                  <br />
                  記事や診断の中に、外部の事業者(例:給湯器の交換の会社)へのリンクを置くことがあります。あなたがそのリンクから申し込むと、当サイトはリンク先の事業者から紹介料を受け取ります。
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>紹介料が発生するリンクには、必ず「PR」または「広告」と表示します</li>
                  <li>リンクを押すかどうか、申し込むかどうかは、あなたがリンク先で判断します</li>
                  <li>
                    <strong>リンクを押しただけで、あなたの入力データや個人情報がリンク先に渡ることはありません</strong>
                  </li>
                </ul>
                <p className="mt-3">
                  <strong>見積もりの取り次ぎ(給湯器)</strong>
                  <br />
                  あなたが希望し、同意した場合に限り、ご入力いただいた条件を提携する工事会社に渡します。現地調査が済んだとき、当サイトは工事会社から紹介料を受け取ります。<strong>あなたが当サイトに払うお金はありません。</strong>
                </p>
                <p className="mt-3">
                  上記以外の収益を始める場合は、開始前にこのページを更新して開示します。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900">
                  3. 収益が結論を変えないためのルール
                </h2>
                <p className="mt-3">当サイトは、次のルールを自分に課しています。</p>
                <ol className="mt-3 list-decimal space-y-2 pl-6">
                  <li>
                    <strong>診断の結果は、決めた基準だけで出します。</strong>{" "}
                    たとえば給湯器の診断で、修理で足りる条件なら「替えなくて大丈夫」と表示します。紹介料の有無は結果に影響しません。
                  </li>
                  <li>
                    <strong>よい面だけの記事は書きません。</strong>{" "}
                    費用が高くなる条件や、急いで動かなくてよい人についても書きます。
                  </li>
                  <li>
                    <strong>紹介料を払う事業者は、記事の内容・診断の結果・掲載順に関与できません。</strong>{" "}
                    内容の修正が掲載の条件になる場合、その事業者は掲載しません。
                  </li>
                  <li>
                    <strong>紹介料の有無で、記事の結論を変えません。</strong>{" "}
                    紹介先が外れても結論は同じです。
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900">4. あなたのデータの扱い</h2>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>診断で入力された内容は、サービス改善のための統計に使います</li>
                  <li>
                    <strong>入力データ・個人情報を第三者に販売しません。</strong>{" "}
                    見積もりの取り次ぎを除き、ご本人の明示的な同意なく第三者に提供することもありません。取り次ぎでも、同意をいただいた範囲だけを渡します
                  </li>
                  <li>
                    詳細は
                    <Link href="/privacy" className="text-blue-700 hover:underline">
                      プライバシーポリシー
                    </Link>
                    をご覧ください
                  </li>
                </ul>
              </section>

              <section id="konkyo">
                <h2 className="text-xl font-semibold text-slate-900">5. 情報の根拠</h2>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>金額・寿命・制度は、公式の発表、メーカーの公表、大手事業者の販売価格など、一次資料で確認したものだけを書き、出典を明記します</li>
                  <li>各ページに最終更新日を表示します</li>
                  <li>
                    目安は将来の結果を保証するものではありません。最終的な判断はご自身で、必要に応じて専門家に相談のうえ行ってください
                  </li>
                </ul>
              </section>

              <section id="ayamari">
                <h2 className="text-xl font-semibold text-slate-900">6. 編集と誤りの連絡</h2>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>記事は、つぎの手ナビ 編集部（運営：BlueAdventures合同会社）が作っています</li>
                  <li>税・保険・相続の金額や期限は、国税庁・法務省・裁判所・日本年金機構・生命保険文化センターなどの公式の情報で確かめ、確認した日をページに書きます。制度が変わったら直します</li>
                  <li>計算の道具とエクセルの式は、公式の計算例と同じ答えになるかを確かめてから出します</li>
                  <li>誤りに気づいたら、support@tsuginotenavi.jp にお知らせください。確かめて直し、ページの最終更新日を改めます</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900">改定履歴</h2>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>2026年7月30日 制定</li>
                  <li>2026年11月4日 改定(扱う分野を暮らし全般に広げたことと、給湯器の見積もりの取り次ぎによる収益を開示)</li>
                  <li>2026年11月11日 改定(編集の体制と、誤りの連絡先を追加)</li>
                </ul>
              </section>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
