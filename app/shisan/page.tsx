import type { Metadata } from "next";
import AssetConciergeMvp from "./AssetConciergeMvp";
import GuideHeader from "@/components/GuideHeader";
import SiteFooter from "@/components/SiteFooter";

// ピボット（2026-07-15）：本ルートを新TOPに移管。/ は /shisan へリダイレクト（middleware）。
// オーガニック解禁のため noindex を解除（canonical は自己参照 /shisan）。GA4 / Clarity は app/layout.tsx を継承。
/* 2026-07-29：サイト全体の方針（住宅ローンとお金の判断）に合わせ、ベータ版の表記を廃止。
 * title は全角30文字前後・「住宅ローン」を含めるという条件で設定。 */
const SHISAN_TITLE = "家計診断｜老後資金と住宅ローンを自分の数字で試算";
const SHISAN_DESCRIPTION =
  "年齢・収入・資産・住宅ローンを入力すると、65歳時点の見通しと、住宅ローンの借り換えで軽くできる金額の目安が分かります。繰り上げ・投資・教育費も、あなたの数字で中立に試算します。登録不要。";
const SHISAN_URL = "https://www.tsuginotenavi.jp/shisan";
/* OGP画像は /og の動的生成カードを使う（記事と同じ仕組み）。 */
const SHISAN_OG_IMAGE = `https://www.tsuginotenavi.jp/og?title=${encodeURIComponent(SHISAN_TITLE)}`;

export const metadata: Metadata = {
  title: SHISAN_TITLE,
  description: SHISAN_DESCRIPTION,
  // ピボットでオーガニック解禁：インデックス許可（noindex 解除）。
  robots: { index: true, follow: true },
  // SNS配布時のプレビューをこのページ用に上書きする（共通 OG の継承だと食い違うため）。
  openGraph: {
    title: SHISAN_TITLE,
    description: SHISAN_DESCRIPTION,
    url: SHISAN_URL,
    siteName: "つぎの手ナビ",
    type: "website",
    locale: "ja_JP",
    images: [{ url: SHISAN_OG_IMAGE, width: 1200, height: 630, alt: SHISAN_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: SHISAN_TITLE,
    description: SHISAN_DESCRIPTION,
    images: [SHISAN_OG_IMAGE],
  },
  alternates: {
    canonical: SHISAN_URL,
  },
};

// 2026-07-29：ヘッダー・フッターをサイト共通（GuideHeader / SiteFooter）に統一。
// ヘッダーが4種類に分かれていたことが、ベータ版の表記の削除漏れの原因だったため。

export default function Page() {
  return (
    <>
      <GuideHeader />
      <AssetConciergeMvp />
      <SiteFooter />
    </>
  );
}
