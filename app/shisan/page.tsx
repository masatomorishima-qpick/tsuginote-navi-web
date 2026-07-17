import type { Metadata } from "next";
import AssetConciergeMvp from "./AssetConciergeMvp";
import { ShisanHeader, ShisanFooter } from "./ShisanChrome";

// ピボット（2026-07-15）：本ルートを新TOPに移管。/ は /shisan へリダイレクト（middleware）。
// オーガニック解禁のため noindex を解除（canonical は自己参照 /shisan）。GA4 / Clarity は app/layout.tsx を継承。
const SHISAN_TITLE = "つぎの手ナビ 資産づくり（β）";
const SHISAN_DESCRIPTION =
  "資産づくりの質問に答えると、今月の“次の一手”が見えてくる。繰り上げ・投資・借り換え・教育費を、あなたの数字で中立に。";
const SHISAN_URL = "https://www.tsuginotenavi.jp/shisan";

export const metadata: Metadata = {
  title: SHISAN_TITLE,
  description: SHISAN_DESCRIPTION,
  // ピボットでオーガニック解禁：インデックス許可（noindex 解除）。
  robots: { index: true, follow: true },
  // SNS（X・コミュニティ）配布時のプレビューを資産づくり用に上書き。
  // これがないと app/layout.tsx の共通 OG（デジタル資産）が継承され食い違う。
  openGraph: {
    title: SHISAN_TITLE,
    description: SHISAN_DESCRIPTION,
    url: SHISAN_URL,
    siteName: "つぎの手ナビ",
    type: "website",
    locale: "ja_JP",
  },
  // 専用 OG 画像が無いため card は summary（large_image にすると空の画像枠が出る）。
  twitter: {
    card: "summary",
    title: SHISAN_TITLE,
    description: SHISAN_DESCRIPTION,
  },
  alternates: {
    canonical: SHISAN_URL,
  },
};

// ヘッダー・フッターは ShisanChrome.tsx に共有化（追加要件B：チャット・マイページと統一）

export default function Page() {
  return (
    <>
      <ShisanHeader />
      <AssetConciergeMvp />
      <ShisanFooter />
    </>
  );
}
