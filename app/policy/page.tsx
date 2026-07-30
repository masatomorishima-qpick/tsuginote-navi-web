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
const PAGE_TITLE = "中立性ポリシー(広告掲載と運営の方針)";
const PAGE_DESCRIPTION =
  "つぎの手ナビが広告（アフィリエイト）を掲載するにあたり、収益のしくみをすべて開示し、広告が試算結果や記事の結論に影響しないために自らに課すルールを、掲載開始前に公開するものです。";
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
              中立性ポリシー(広告掲載と運営の方針)
            </h1>

            {/* 制定日は「公開作業を行った日（日本時間）」＝2026-07-30（masato回答Q3。
                push が後日になる場合は日付を差し替える運用）。 */}
            <p className="mt-6 text-sm leading-7 text-slate-600 sm:text-base">
              制定日:2026年7月30日
              <br />
              運営:Blue Adventures(つぎの手ナビ)
            </p>

            <div className="mt-10 space-y-10 text-sm leading-7 text-slate-700 sm:text-base">
              <section>
                <h2 className="text-xl font-semibold text-slate-900">このページについて</h2>
                <p className="mt-3">
                  つぎの手ナビは、住宅ローンとお金の判断を「あなたの数字」で試算するサイトです。
                </p>
                <p className="mt-3">
                  当サイトは今後、広告を掲載して収益を得ます。お金に関する情報サイトが広告で収益を得るとき、いちばん問われるのは「広告のために結論を曲げていないか」です。このページは、当サイトが結論を曲げないために自分に課しているルールを、広告を貼る前にあらかじめ公開するものです。
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
                  <li>あなたが入力した数字にもとづく試算の表示</li>
                  <li>制度・金利・費用に関する情報の提供(出典つき)</li>
                </ul>
                <p className="mt-3">
                  <strong>しないこと</strong>
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>特定の金融機関・金融商品への申込みをすすめること</li>
                  <li>保険・投資商品・住宅ローンの販売や仲介</li>
                  <li>
                    個別の事情に対する助言(当サイトの試算は情報提供であり、金融商品取引法上の投資助言や、保険・ローンの募集・媒介ではありません)
                  </li>
                </ul>
                <p className="mt-3">
                  当サイトは金融商品を販売していません。販売による手数料も受け取っていません。つまり「この商品を選ばせたい」という理由が、当サイトの収益構造の中にありません。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900">
                  2. 収益のしくみ(すべて開示します)
                </h2>
                <p className="mt-3">当サイトの収益源は、次のものに限ります。</p>
                <p className="mt-3">
                  <strong>広告リンク(アフィリエイト)</strong>
                  <br />
                  記事やツールの中に、外部サービス(例:住宅ローンの比較サービス)へのリンクを置くことがあります。あなたがそのリンクから申し込むと、当サイトはリンク先の事業者から報酬を受け取ります。
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>報酬が発生するリンクには、必ず「PR」または「広告」と表示します</li>
                  <li>リンクを踏むかどうか、申し込むかどうかは、あなたがリンク先で判断します</li>
                  <li>
                    <strong>あなたの入力データや個人情報が、リンク先に渡ることはありません</strong>
                  </li>
                </ul>
                <p className="mt-3">
                  上記以外の収益(たとえば有料サービス)を始める場合は、開始前にこのページを更新して開示します。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900">
                  3. 収益が結論を変えないためのルール
                </h2>
                <p className="mt-3">当サイトは、次のルールを自分に課しています。</p>
                <ol className="mt-3 list-decimal space-y-2 pl-6">
                  <li>
                    <strong>試算結果は、計算だけが決めます。</strong>{" "}
                    借り換えで損をする条件なら「損をする」と表示します。広告の有無は結果に影響しません。
                  </li>
                  <li>
                    <strong>メリットだけの記事は書きません。</strong>{" "}
                    行動をすすめる可能性のある記事には「やらない方がいい人」「動かなくていい人」を、仕組みを解説する記事には「損になる条件」を必ず書きます。
                  </li>
                  <li>
                    <strong>特定の金融機関・金融商品を「おすすめ」しません。</strong>{" "}
                    銀行名を出すときは、公式資料で確認できた事実(金利・ルールの有無など)だけを書きます。
                  </li>
                  <li>
                    <strong>広告主は、記事の内容・試算の結果・掲載順に関与できません。</strong>{" "}
                    内容の修正依頼が広告掲載の条件になる場合、その広告は掲載しません。
                  </li>
                  <li>
                    <strong>広告掲載の有無で、記事の結論を変えません。</strong>{" "}
                    広告が外れても結論は同じです。
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900">4. あなたのデータの扱い</h2>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>診断で入力された数字は、サービス改善のための統計にのみ使います</li>
                  <li>
                    <strong>入力データ・個人情報を第三者に販売しません。</strong>{" "}
                    ご本人の明示的な同意なく第三者に提供することもありません
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

              <section>
                <h2 className="text-xl font-semibold text-slate-900">5. 計算と情報の根拠</h2>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>試算の前提(金利・費用・税率など)は、記事とツールの中ですべて開示します</li>
                  <li>
                    制度・税率・金利は、一次資料(国税庁・住宅金融支援機構・日本銀行・各金融機関の公式資料)で確認したものだけを記載し、出典を明記します
                  </li>
                  <li>各ページに最終更新日を表示します</li>
                  <li>
                    試算は将来の結果を保証するものではありません。最終的な判断はご自身で、必要に応じて専門家に相談のうえ行ってください
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900">6. 誤りの訂正</h2>
                <p className="mt-3">
                  記載内容の誤りにお気づきの場合は、
                  <Link href="/company" className="text-blue-700 hover:underline">
                    お問い合わせ
                  </Link>
                  からご連絡ください。確認のうえ訂正し、重要な訂正は更新日とあわせて明示します。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-900">改定履歴</h2>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>2026年7月30日 制定</li>
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
