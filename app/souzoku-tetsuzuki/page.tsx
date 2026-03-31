import type { Metadata } from "next";
import SouzokuTetsuzukiClient from "./SouzokuTetsuzukiClient";

export const metadata: Metadata = {
  title: "相続手続きの流れと期限一覧｜必要書類・相談先を順番に整理",
  description:
    "相続手続きについて、相続人の確認、財産と負債の把握、相続放棄の検討、名義変更、相続税や相続登記の期限、必要書類、相談先を順番に整理しています。",
};

export default function SouzokuTetsuzukiPage() {
  return <SouzokuTetsuzukiClient />;
}