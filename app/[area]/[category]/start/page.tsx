import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import {
  getAreaName,
  getCategoryName,
  isValidArea,
  isValidCategory,
} from "@/lib/config/site";
import SurveyWizard from "@/components/survey/SurveyWizard";
import SiteFooter from "@/components/SiteFooter";

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
    title: `${areaName}で${categoryName}の候補を整理する｜つぎの手ナビ`,
    description: `${areaName}で${categoryName}の相談先を探したい方向けに、6つの選択式で状況を整理し、条件に合う候補を表示します。氏名・メール・電話番号の入力は不要で、一括送信もありません。`,
  };
}

export default async function SurveyStartPage({ params }: Props) {
  const { area, category } = await params;

  if (!isValidArea(area) || !isValidCategory(category)) {
    notFound();
  }

  const areaName = getAreaName(area);
  const categoryName = getCategoryName(category);

  return (
    <main className="min-h-screen bg-slate-50 text-[#111827]">
      <header className="sticky top-0 z-30 h-16 border-b border-slate-200/90 bg-white/95 backdrop-blur sm:h-[72px]">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <div
            className="inline-flex items-center"
            aria-label="つぎの手ナビ"
          >
            <Image
              src="/images/tsuginote-logo.png"
              alt="つぎの手ナビ"
              width={170}
              height={38}
              priority
              className="h-auto w-[150px] sm:w-[170px]"
            />
          </div>

          <p className="hidden text-sm font-medium text-slate-600 sm:block">
            条件に合う候補を確認
          </p>
        </div>
      </header>

      <section className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-6 sm:py-5">
        <SurveyWizard
          area={area}
          category={category}
          areaName={areaName}
          categoryName={categoryName}
        />
      </section>

      <SiteFooter />
    </main>
  );
}