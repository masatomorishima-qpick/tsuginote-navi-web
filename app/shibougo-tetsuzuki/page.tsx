import type { Metadata } from "next";
import ShibougoTetsuzukiClient from "./ShibougoTetsuzukiClient";

export const metadata: Metadata = {
  title:
    "家族が亡くなった後の手続き一覧｜死亡後にやることを順番と期限で整理",
  description:
    "家族が亡くなった後に必要な手続きについて、今日やること、7日以内の届出、年金・保険・名義確認、遺言書の注意点、相続手続きにつながる確認事項を順番に整理しています。",
};

export default function ShibougoTetsuzukiPage() {
  return <ShibougoTetsuzukiClient />;
}