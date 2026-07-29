import type { Metadata } from "next";
import { Noto_Sans_JP, Geist } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import ClarityScript from "@/components/ClarityScript";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

/**
 * 日本語フォント：Noto Sans JP
 * Figma 提案に合わせて、見出しから本文まで一貫して読みやすい和文に。
 */
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
  preload: true,
  fallback: ["Hiragino Sans", "Yu Gothic", "system-ui", "sans-serif"],
});

const SITE_URL = "https://www.tsuginotenavi.jp";

/**
 * サイト共通の構造化データ（GEO/AI検索向け）。
 * Organization と WebSite を全ページに出し、ブランドを「エンティティ」として
 * 検索エンジン・AI検索（ChatGPT/Gemini/AI Overviews 等）に認識させる。
 */
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      // 2026-07-29：サイト名から「デジタル資産」を外した。住宅ローン・資産づくりの
      // 記事も扱っており、デジタル資産に特化したサービスではなくなっているため。
      name: "つぎの手ナビ",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      // 2026-07-29：image を削除。組織情報としては logo があれば足り、image は冗長。
      // 記事ページでは Article の image と並んで出力されるため、
      // 「記事の代表画像が logo.png になっている」と誤読される原因になっていた。
      email: "info@blueadventures.jp",
      description:
        "住宅ローン・資産づくり・お金の管理について、あなたが入力した数字にもとづく試算と、中立的な情報を提供するサイト。特定の金融商品・金融機関の推奨は行いません。運営：BlueAdventures。",
      sameAs: ["https://blueadventures.jp/"],
      parentOrganization: {
        "@type": "Organization",
        name: "BlueAdventures",
        url: "https://blueadventures.jp/",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "つぎの手ナビ",
      inLanguage: "ja",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tsuginotenavi.jp"),
  // 2026-07-29：サイト全体の既定を、デジタル資産に特化しない表現に変更。
  // 各ページが metadata を上書きするので、ここは上書きしないページの受け皿になる。
  title: "つぎの手ナビ｜住宅ローンとお金の判断を、あなたの数字で",
  description:
    "住宅ローンの借り換えや変動と固定の比較、資産づくりの見通しを、あなたが入力した数字で試算できます。特定の金融商品・金融機関の推奨は行いません。",
  openGraph: {
    siteName: "つぎの手ナビ",
    type: "website",
    locale: "ja_JP",
    title: "つぎの手ナビ｜住宅ローンとお金の判断を、あなたの数字で",
    description:
      "住宅ローンの借り換えや変動と固定の比較、資産づくりの見通しを、あなたが入力した数字で試算できます。特定の金融商品・金融機関の推奨は行いません。",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={cn("font-sans", geist.variable)}>
      <body className="bg-white font-sans text-slate-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {children}
        <ClarityScript />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
    </html>
  );
}
