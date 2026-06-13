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
      name: "つぎの手ナビ デジタル資産",
      alternateName: "つぎの手ナビ",
      url: SITE_URL,
      email: "info@blueadventures.jp",
      description:
        "デジタル資産やパスワードの「在りか」を、生きている間は誰にも見せず、もしものとき（入院・事故・死亡など）だけ、指定した大切な人へ届ける準備ができるサービス。資産の登録・PDF出力・定期リマインドは無料。運営：BlueAdventures。",
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
      name: "つぎの手ナビ デジタル資産",
      inLanguage: "ja",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tsuginotenavi.jp"),
  title: "つぎの手ナビ デジタル資産｜大切な方へのデジタル引き継ぎ",
  description:
    "スマホ・パソコン のパスワードや、ご利用中のサブスク・SNS を大切な方に引き継ぐ準備ができるサービスです。30 日間無料、クレジットカード登録不要。",
  openGraph: {
    siteName: "つぎの手ナビ",
    type: "website",
    locale: "ja_JP",
    title: "つぎの手ナビ デジタル資産｜大切な方へのデジタル引き継ぎ",
    description:
      "スマホ・パソコン のパスワードや、ご利用中のサブスク・SNS を大切な方に引き継ぐ準備ができるサービスです。30 日間無料、クレジットカード登録不要。",
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
