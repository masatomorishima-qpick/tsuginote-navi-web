import type { Metadata } from "next";
import { ShisanHeader } from "../ShisanChrome";

export const metadata: Metadata = {
  title: "伴走AIに相談｜つぎの手ナビ 資産づくり（β）",
  description: "あなたの診断結果を知っているAIに、無料で相談できます。売り込みは一切ありません。",
  robots: { index: false, follow: false },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ShisanHeader />
      {children}
    </>
  );
}
