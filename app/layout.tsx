import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import ClarityScript from "@/components/ClarityScript";

export const metadata: Metadata = {
  title: "つぎの手ナビ｜相続・手続き・相談先の案内",
  description:
    "つぎの手ナビは、ご家族が亡くなった後の相続・手続き・相談先の案内を行うサービスです。相続放棄、相続手続き、死亡後手続きの次の一手を整理できます。",
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
    <html lang="ja">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
<ClarityScript />
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
    </html>
  );
}