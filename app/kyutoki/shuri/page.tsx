import type { Metadata } from 'next';
import { Snowflake } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import ShuriChoice from '@/components/kyutoki/ShuriChoice';
import { SITE_URL, SITE_NAME } from '@/components/loan/LoanArticle';

/**
 * 給湯器・エコキュートの修理の見積もり（トレンド速攻の待ち伏せの受け皿。2026-11-04 新設）。
 *
 * 役割：寒波・大雪のときに「給湯器 修理 依頼」「お湯が出ない 修理 業者」「エコキュート 修理 即日」など、
 *   修理を頼みたい人の検索を受ける。診断をはさまず、種類を選んだらすぐ見積もりへ。
 * 理由：お湯が出ない診断（/kyutoki/oyu-ga-denai）は広告到達40・診断開始16・結果8で紹介先クリック0。
 *   工事会社の広告は「最短30分で駆けつけ」と直接つながっており、一歩多いページは選ばれなかった。
 * 出口：お湯が出ない.com（A8 の1クリックの報酬実績 858.52円、東京・神奈川）、
 *   きゅっと（767.61円、1都3県・愛知・静岡）。どちらも修理の見積もりで成果（docs/trend-ads/programs.md 2026-11-04）。
 *   紹介先の売り文句は lib/kyutoki/diagnosis.ts の PARTNERS.points（確認済みの記載）だけを使う。
 */

const LP_ID = 'kyutoki-shuri';
const VERSION = 'v1-2026-11-04';
const PAGE_PATH = '/kyutoki/shuri';
const TITLE = '給湯器・エコキュートの修理｜お湯が出ないときの無料見積もり';
const DESCRIPTION = 'お湯が出ないときに、給湯器・エコキュートの修理の見積もりを無料で頼めます。種類を選ぶだけです。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  robots: { index: false, follow: true },
};

export default function KyutokiShuriPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />

      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-5 px-4 pt-4 pb-16">
        <p className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
          <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
          当サイトは紹介料を受け取っています<span className="whitespace-nowrap">（修理は行いません）</span>
        </p>

        <section className="flex flex-col gap-1" aria-labelledby="shuri">
          <h1 id="shuri" className="text-[34px] font-black leading-[1.15] tracking-tight text-slate-900">
            お湯が出ない？
          </h1>
          <p className="text-[18px] font-bold leading-snug text-slate-700">
            修理の見積もりは<span className="text-orange-600">無料</span>
          </p>
        </section>

        <ShuriChoice lpId={LP_ID} />

        <p className="flex items-start gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-[13px] leading-relaxed text-sky-900">
          <Snowflake size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>凍結が原因なら、気温が上がると直ることがあります。</span>
        </p>
      </main>

      <LpFooter />
    </div>
  );
}
