import type { Metadata } from "next";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{
    area: string;
    category: string;
  }>;
};

export const metadata: Metadata = {
  title: "営業用デモ | つぎの手ナビ",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DemoCategoryPage({ params }: PageProps) {
  const { area, category } = await params;
  redirect(`/demo/${area}/${category}/results`);
}