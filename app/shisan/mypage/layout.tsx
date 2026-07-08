import type { Metadata } from "next";
import { ShisanHeader, ShisanFooter } from "../ShisanChrome";

export const metadata: Metadata = {
  title: "マイページ｜つぎの手ナビ 資産づくり（β）",
  description: "あなたの診断結果と決めた一手、実行状況。伴走AIへの相談もこちらから。",
  robots: { index: false, follow: false },
};

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ShisanHeader />
      {children}
      <ShisanFooter />
    </>
  );
}
