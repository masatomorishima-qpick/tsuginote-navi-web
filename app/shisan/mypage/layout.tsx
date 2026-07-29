import type { Metadata } from "next";
import GuideHeader from "@/components/GuideHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "マイページ｜つぎの手ナビ",
  description: "あなたの診断結果と決めた一手、実行状況。伴走AIへの相談もこちらから。",
  robots: { index: false, follow: false },
};

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GuideHeader />
      {children}
      <SiteFooter />
    </>
  );
}
