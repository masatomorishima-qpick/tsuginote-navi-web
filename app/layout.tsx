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
  // ★計測（GA4・Microsoft Clarity）は、Preview と development では読み込みません。
  // ★VERCEL_ENV は Vercel が入れる値で、本番は 'production'、Preview は 'preview' です
  //   （Vercel「System environment variables」── build と runtime の両方で使えます）。
  // ★この本はサーバ側の本なので、NEXT_PUBLIC_ が付かない環境変数も読めます
  //   （Next.js 16.2.7 の説明書 01-app/02-guides/environment-variables.md）。
  //
  // ★★★【2026-09-16・決め1287 ── 戦術Cowork `senjutsu_20260916e.md` 2節】
  //   ★★**倒れる向きを、逆にしました。**
  //   ★前 …… `VERCEL_ENV === "production"` のときだけ読む。
  //     ★★★**`VERCEL_ENV` が無いと、計測が止まりました。**
  //     ★★`app/layout.tsx` はサイト全体の本ですので、★**`/shisan`（テストA）の計測も、同じ日に止まります。**
  //     ★★★止めには「`/shisan` とテストAの計測に影響を与えない」と在ります ── ★**この形は、それに反します。**
  //   ★いま …… **`preview` と `development` のときだけ読まない**。
  //     ・`production` … 読む（★いままでと同じ）
  //     ・`preview`    … 読まない（★狙いどおり）
  //     ・`development`… 読まない
  //     ・★★**無い**  … ★★★**読む**（★`main` のいまの姿と同じ。★★しかも下の「調べの印」が `(なし)` と出ます）
  //   ★★★**気づいたときには止まっている → 気づくが、止まらない。**
  //
  //   ★★「無いときに読むと、Preview でも計測を汚すのでは」…… ★★**汚します。★ですがそれは `main` のいまの姿です。**
  //     ★System Environment Variables は品物ごとの入／切ですので、★切なら Preview も本番も同じく無くなります。
  //     ★★つまり「切のときは、いまと同じ姿に戻るだけ」で、★**新しく悪くなる道がありません。**
  const keisokuWoYomu =
    process.env.VERCEL_ENV !== "preview" && process.env.VERCEL_ENV !== "development";
  // ★★「調べの印」を出すかどうかは、**別の値**です（★下の覚え書き）。
  //   ★★★計測の条件と同じ値にすると、★**`VERCEL_ENV` が無いときに印が出なくなります** ── ★それでは気づけません。
  const honban = process.env.VERCEL_ENV === "production";

  return (
    <html lang="ja" className={cn("font-sans", geist.variable)}>
      <body className="bg-white font-sans text-slate-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {children}
        {/*
          ★★調べの印 …… VERCEL_ENV の値そのものを、頁の中に1行だけ出します。
          ★なぜ要るか（★戦術Cowork senjutsu_20260907k.md）……
            「Preview でタグが来ないこと」だけでは、★★2つを見分けられません ──
            ①Vercel が VERCEL_ENV を出している（正しい）②出していない（★本番の計測が止まる）。
            ★どちらも Preview では同じ「タグが来ない」になります。
          ★この印は `VERCEL_ENV !== "production"` のときだけ出ます。ですので ──
            ・Preview で `preview` と出れば …… ①（正しい）
            ・Preview で `(なし)` と出れば …… ②（★Vercel の設定が要ります）
            ・★★本番でこの印が出ていたら …… ②（★Vercel が `VERCEL_ENV` を出していません）
          ★★★本番が正しいときは、この印は出ません。★本番の姿は1バイトも変わりません。
          ★★★【2026-09-16・決め1287】★**②のときも、計測は止まりません**（★上の `keisokuWoYomu`）。
            ★★止まるのは「Preview でも計測が動いてしまう」ことだけです。★★**それでも、直す所は Vercel の設定です。**
          ★利用者には見えません（`<meta>` です）。★値は production／preview／development だけで、
            鍵でも住所でもありません。
          ★★消す日 …… ★**本番に出したあと、本番の頁で GA4 と Clarity のタグが
            読み込まれていることを確かめた日**に消します（★「本番化の日」ではありません ──
            ★★本番化のその日が、この印がいちばん要る日です）。
        */}
        {honban ? null : (
          <meta name="keisoku-shirabe" content={process.env.VERCEL_ENV || "(なし)"} />
        )}
        {keisokuWoYomu ? <ClarityScript /> : null}
      </body>
      {keisokuWoYomu ? (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      ) : null}
    </html>
  );
}
