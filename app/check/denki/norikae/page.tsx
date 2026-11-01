import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarX, Cable, ClipboardCheck, PhoneOff, TrendingUp, Wrench } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME } from '@/components/loan/LoanArticle';
import DenkiBridgeCta from '@/components/trend/DenkiBridgeCta';
import { DENKI } from '@/lib/trend/denki';

/**
 * トレンド速攻：11月の電気代 値上げ → 関東で電力会社を切り替える（橋型。2026-11-01 新設）。
 * 検索広告（S段：値上げを受けて切り替えたい・大手から移る）の着地。記事は読ませず、改定後の料金差と手順だけ見せて申込へ渡す。
 * オーナー指示：到達→送客 50% 必達。到達30件で判定（記録は docs/trend-ads/denki.md）。
 *
 * 単価の出典（2026-11-01 確認）
 * - 東急でんき＆ガス 従量電灯B（11/1 改定後）：基本料金 30A 1,096.44円・40A 1,461.92円・50A 1,827.40円、電力量料金 〜120kWh 31.39円・120〜300kWh 31.89円・300kWh超 36.14円
 *   https://www.tokyu-ps.co.jp/assets/download/content/notice/2611-tps/2611-tps.pdf
 * - 東京電力エナジーパートナー 従量電灯B（11/1 改定後）：基本料金 30A 1,176.18円・40A 1,568.24円・50A 1,960.30円、電力量料金 29.85円・36.45円・40.54円
 *   https://www.tepco.co.jp/ep/notice/pressrelease/2026/pdf/26x3203.pdf
 * どちらも税込、燃料費調整額・再生可能エネルギー発電促進賦課金を除く。
 * 月額の計算：基本料金＋電力量料金。260kWh・30A：東急 9,328円 / 東京電力 9,861円（差 533円）。450kWh・50A：16,755円 / 18,184円（差 1,429円）。160kWh・30A：6,139円 / 6,216円（差 77円）。120kWh以下は東急の方が高くなる。
 * 掲載条件：東急でんき＆ガスは A8 の「バナーのみ使用可」。文字のボタンは出さない（DenkiBridgeCta）。
 */

const PAGE_PATH = '/check/denki/norikae';
const VERSION = 'bridge-v1-2026-11-01';
const TITLE = '11月から電気代が上がりました。関東なら切り替えで月500円以上の差';
const DESCRIPTION = '2026年11月1日の託送料金改定で大手の基本料金が上がりました。関東のご家庭向けに、改定後の料金を世帯別に比べ、切り替えの手順をまとめています。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  // 広告の着地専用。検索からは /check/denki に来てもらう
  robots: { index: false, follow: true },
};

/** 世帯別の月額（11/1 改定後、税込、燃料費調整額・再エネ賦課金を除く） */
const ROWS = [
  { h: '2〜3人', d: '260kWh・30A', tepco: 9861, tokyu: 9328 },
  { h: '4人以上', d: '450kWh・50A', tepco: 18184, tokyu: 16755 },
  { h: '1人', d: '160kWh・30A', tepco: 6216, tokyu: 6139 },
];
const yen = (n: number) => n.toLocaleString('ja-JP');

function GapChart() {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="大手と切り替え先の月額の差を示す棒グラフ" className="h-auto w-full max-w-[160px]">
      <rect width="200" height="200" rx="28" fill="#fff7ed" />
      <rect x="40" y="48" width="44" height="112" rx="8" fill="#fb923c" />
      <rect x="116" y="72" width="44" height="88" rx="8" fill="#0ea5e9" />
      <path d="M100 40v8M100 56v8" stroke="#9a3412" strokeWidth="3" strokeLinecap="round" />
      <text x="62" y="180" fontSize="13" fontWeight="700" fill="#9a3412" textAnchor="middle">大手</text>
      <text x="138" y="180" fontSize="13" fontWeight="700" fill="#0369a1" textAnchor="middle">切り替え</text>
      <text x="138" y="62" fontSize="14" fontWeight="800" fill="#0369a1" textAnchor="middle">−533円</text>
    </svg>
  );
}

const SECTION = 'flex flex-col gap-4';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';

export default function DenkiNorikaePage() {
  const p = DENKI.partners.tokyu;
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <LpHeader />
      <LpViewTracker lpId={DENKI.lpId} version={VERSION} />

      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-12 px-4 pt-4 pb-16">
        <p className="-mb-8 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
          <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
          <span>当サイトは紹介料を受け取っています</span>
          <Link href="/policy" className="text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
        </p>

        {/* 最初の画面：なぜ今（11/1 の値上げ）→ 差 → 申込 */}
        <section className="flex flex-col gap-5">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="flex flex-col gap-3">
              <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-bold text-orange-800 ring-1 ring-orange-200">2026年11月1日から</span>
              <h1 className="text-[32px] font-black leading-[1.15] tracking-tight text-slate-900 min-[380px]:text-[36px]">
                電気代、<br />上がりました
              </h1>
              <p className="text-[17px] font-bold leading-snug text-slate-700">
                関東なら切り替えで<br /><span className="text-[24px] text-sky-700">月533円</span>の差
              </p>
            </div>
            <div className="w-[128px] sm:w-[160px]"><GapChart /></div>
          </div>

          <ul className="grid grid-cols-3 gap-2">
            {[
              { icon: TrendingUp, h: '基本料金 +241円', d: '大手の30Aが11/1から' },
              { icon: CalendarX, h: '補助は12月分から', d: '10・11月使用分は補助なし' },
              { icon: Cable, h: '託送分は戻らない', d: '補助が戻っても値上げ分は残る' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white px-2 py-3 text-center ring-1 ring-slate-200">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-600"><I size={20} aria-hidden="true" /></span>
                <span className="text-[13px] font-black leading-tight text-slate-900">{h}</span>
                <span className="text-[10px] leading-snug text-slate-500">{d}</span>
              </li>
            ))}
          </ul>

          <DenkiBridgeCta position="bridge-top" version={VERSION} />
        </section>

        {/* 改定後の料金差（世帯別3行） */}
        <section className={SECTION} aria-labelledby="hikaku">
          <div className="flex flex-col gap-1.5">
            <h2 id="hikaku" className={H2}>11月改定後の月額</h2>
            <p className="text-[15px] text-slate-600">東京電力の従量電灯Bと比べました。</p>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[14px]">
              <thead className="bg-slate-50 text-[12px] text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left font-bold">世帯</th>
                  <th className="px-2 py-2 text-right font-bold">東京電力</th>
                  <th className="px-2 py-2 text-right font-bold text-sky-800">{p.name}</th>
                  <th className="px-3 py-2 text-right font-bold">差</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.h} className="border-t border-slate-100">
                    <td className="px-3 py-3"><span className="font-black text-slate-900">{r.h}</span><br /><span className="text-[11px] text-slate-500">{r.d}</span></td>
                    <td className="px-2 py-3 text-right tabular-nums text-slate-700">{yen(r.tepco)}円</td>
                    <td className="px-2 py-3 text-right font-bold tabular-nums text-sky-800">{yen(r.tokyu)}円</td>
                    <td className="px-3 py-3 text-right font-black tabular-nums text-orange-600">−{yen(r.tepco - r.tokyu)}円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            2026年11月1日改定後の単価（税込、燃料費調整額・再エネ賦課金を除く）で、基本料金＋電力量料金を計算。出典：各社の公表する料金表。使用量が月120kWh以下だと差は出ません。
          </p>
        </section>

        {/* 切り替えの3手順 */}
        <section className={SECTION} aria-labelledby="tejun">
          <h2 id="tejun" className={H2}>切り替えは3つだけ</h2>
          <ul className="grid grid-cols-3 gap-2.5">
            {[
              { icon: ClipboardCheck, h: '申し込み', d: '公式サイトで5分。検針票があれば早い' },
              { icon: Wrench, h: '工事なし', d: '立ち会いも不要。電線はそのまま' },
              { icon: PhoneOff, h: '解約連絡なし', d: '今の会社への連絡は新しい会社が代行' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700"><I size={22} aria-hidden="true" /></span>
                <span className="text-[15px] font-black text-slate-900">{h}</span>
                <span className="text-[11px] leading-snug text-slate-500">{d}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-2" aria-labelledby="faq">
          <h2 id="faq" className={`${H2} mb-2`}>よくある質問</h2>
          {[
            { q: '今の契約に解約金はかかりますか？', a: '大手電力の従量電灯（標準プラン）は原則かかりません。新電力から移る場合は、今の契約の条件を確かめてください。' },
            { q: '補助が戻るなら、切り替えなくてもいいのでは？', a: '補助は使用量に応じて誰にでも同じ単価で付くので、切り替えても減りません。11月の値上げは基本料金（託送分）で、補助が戻っても残ります。切り替えで変わるのは電力量料金と基本料金の単価です。' },
          ].map((f) => (
            <details key={f.q} className="group rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-bold text-slate-900">
                {f.q}<span aria-hidden="true" className="text-xl text-slate-400 transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </section>

        <DenkiBridgeCta position="bridge-bottom" version={VERSION} />

        <p className="text-[11px] leading-relaxed text-slate-400">
          対象は東京・神奈川・千葉・埼玉・茨城・栃木・群馬（市区町村で一部対象外）。各社の単価・条件は各社の公表内容によります。冬の電気代の目安を計算したい方は<Link href="/check/denki" className="underline underline-offset-2">こちら</Link>。最終更新：2026年11月1日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
