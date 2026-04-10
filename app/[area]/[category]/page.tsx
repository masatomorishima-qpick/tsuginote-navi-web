import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getAreaName,
  getCategoryName,
  isValidArea,
  isValidCategory,
} from "@/lib/config/site";

type Props = {
  params: Promise<{ area: string; category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { area, category } = await params;

  if (!isValidArea(area) || !isValidCategory(category)) {
    return {
      title: "ページが見つかりません",
    };
  }

  const areaName = getAreaName(area);
  const categoryName = getCategoryName(category);

  return {
    title: `${areaName}で${categoryName}の相談先を探す前に｜つぎの手ナビ`,
    description: `${areaName}で${categoryName}の相談先を探したい方へ。条件に合う候補を整理して確認できます。推薦ではなく、比較と直接連絡を支援します。`,
  };
}

export default async function CategoryLpPage({ params }: Props) {
  const { area, category } = await params;

  if (!isValidArea(area) || !isValidCategory(category)) {
    notFound();
  }

  const areaName = getAreaName(area);
  const categoryName = getCategoryName(category);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">
        {areaName}で{categoryName}の相談先を探す前に、条件に合う候補を整理する
      </h1>

      <p className="mt-4 text-slate-700">
        つぎの手ナビは、回答内容をもとに条件に合う候補を表示します。
        推薦や紹介ではなく、比較と直接連絡のための整理を支援します。
      </p>

      <div className="mt-8">
        <Link
          href={`/${area}/${category}/start`}
          className="inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-white"
        >
          条件に合う候補を見る
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border p-4 text-sm text-slate-600">
        当サイトは候補表示までを行い、最終的な問い合わせ先の判断はご本人に行っていただきます。
      </div>
    </main>
  );
}