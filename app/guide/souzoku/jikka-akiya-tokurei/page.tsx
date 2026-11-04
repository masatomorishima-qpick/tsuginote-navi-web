import type { Metadata } from 'next';
import { CalendarClock, ClipboardCheck, Hammer, Landmark } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続した実家を売るときの3,000万円控除（被相続人の居住用財産〔空き家〕の特例）のチェック表（2026-11-05 新設）。
 * 受ける言葉：空き家 3000万円控除（880）・相続 不動産 売却 税金（1,600）・実家 処分（390）・相続 空き家 特例（320）ほか。
 * 出口：空き家買取本舗（レントラックス 15882、提携中、リンク発行まではボタンは出ない）。ラクウル（13857）の承認後に比べて入れ替え。
 *   ラクウルの却下条件「相見積もりを推奨する文言」に合わせ、このページでは相見積もりをすすめない。
 * 条件の元：国税庁（確定申告の手引き）・広島市（確認書の交付）・富山市（リーフレット）。
 */
const LP_ID = 'guide-souzoku-akiya';
const PATH = '/guide/souzoku/jikka-akiya-tokurei';
const TITLE = '相続した実家を売るときの3,000万円控除｜使えるか8つのチェック表【無料・エクセル】';
const DESCRIPTION = '亡くなった親が一人で住んでいた家を売るときの「空き家の3,000万円控除」。使えるかを8つの条件で確かめる無料のチェック表（エクセル・PDF）。売る期限の自動計算、相続人3人以上で2,000万円になる点、市区町村の確認書まで。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQS = [
  { q: 'マンションでも使えますか？', a: '使えません。区分所有の建物（マンションなど）は対象外です。一戸建ての家とその土地が対象です（富山市のリーフレット）。' },
  { q: '古い家のまま売ってもいいですか？', a: '家付きで売るなら、売る時点で今の耐震の基準に合っている必要があります。2024年1月1日以後に売った場合は、売った翌年の2月15日までに耐震の工事か取り壊しをすれば対象になります。買主が取り壊すときは、そのことを決めた特約が要ります（広島市）。' },
  { q: '兄弟3人で相続しました。', a: '2024年1月1日以後に売った場合、家を相続した人が3人以上なら、控除は1人2,000万円になります（国税庁）。' },
  { q: '確認書はどこでもらいますか？', a: '家のある市区町村の担当の課で「被相続人居住用家屋等確認書」を申請します。交付まで数日かかり、確定申告の前は混みます（広島市の例）。' },
];

export default function Page() {
  const S = DATA.sources;
  const A2 = DATA.akiya;
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相続した実家の3,000万円控除', faqs: FAQS, date: '2026-11-05' });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-05" path={PATH} eyebrow="相続した実家"
        title={<>実家を売るときの<br />3,000万円控除</>}
        download={<SouzokuDownload icon={ClipboardCheck} h="使えるかのチェック表" s="8つの条件と、売る期限の自動計算" files={SOUZOKU_FILES.akiya} />}
        partner="akiyaHonpo" exitLead="古い家のままでも、まず買い取り額を聞く" faqs={FAQS} updated="2026年11月5日"
      >
        <section className={SECTION} aria-labelledby="gaku">
          <h2 id="gaku" className={H2}>控除の額</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-slate-200">
              <span className="text-[12px] text-slate-500">相続人が1〜2人</span>
              <span className="text-[24px] font-black text-orange-600">3,000万円</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-slate-200">
              <span className="text-[12px] text-slate-500">3人以上（1人あたり）</span>
              <span className="text-[24px] font-black text-orange-600">2,000万円</span>
            </div>
          </div>
          <p className="text-[13px] text-slate-600">売って得た利益（譲渡所得）から引ける額です。3人以上で2,000万円になるのは、2024年1月1日以後に売った場合。</p>
        </section>

        <section className={SECTION} aria-labelledby="joken">
          <h2 id="joken" className={H2}>8つの条件</h2>
          <ol className="grid gap-2">
            {A2.check.map((c, i) => (
              <li key={c.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[14px] font-bold text-white">{i + 1}</span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-black leading-snug text-slate-900">{c.h}</span>
                  <span className="text-[12px] leading-relaxed text-slate-600">{c.d}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className={SRC}>
            出典：<a href={S.ntaAkiya.url} target="_blank" rel="noopener noreferrer" className={A}>{S.ntaAkiya.name}</a>・
            <a href={S.hiroshima.url} target="_blank" rel="noopener noreferrer" className={A}>{S.hiroshima.name}</a>・
            <a href={S.toyama.url} target="_blank" rel="noopener noreferrer" className={A}>{S.toyama.name}</a>（{DATA.checkedAt.split('-').join('/')} 確認）
          </p>
        </section>

        <section className={SECTION} aria-labelledby="furui">
          <h2 id="furui" className={H2}>古い家は、耐震か取り壊し</h2>
          <div className="grid grid-cols-2 gap-2">
            {[{ icon: Hammer, h: '取り壊して土地で売る', d: '売った翌年2月15日までに買主が取り壊しても対象（特約が要る）' }, { icon: CalendarClock, h: '売る期限', d: '相続から3年たつ年の12月31日（2027年12月31日まで）' }].map(({ icon: I, h, d }) => (
              <div key={h} className="flex flex-col gap-1.5 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <I size={20} className="text-sky-700" aria-hidden="true" />
                <span className="text-[14px] font-black text-slate-900">{h}</span>
                <span className="text-[12px] leading-snug text-slate-600">{d}</span>
              </div>
            ))}
          </div>
          <SouzokuExit lpId={LP_ID} partner="akiyaHonpo" position="furui" lead="古い家のままでも、まず買い取り額を聞く" />
        </section>

        <section className={SECTION} aria-labelledby="tetsuzuki">
          <h2 id="tetsuzuki" className={H2}>使えそうなら</h2>
          <ol className="grid gap-2">
            {A2.steps.map((t, i) => (
              <li key={t} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 text-[14px] text-slate-800 ring-1 ring-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[13px] font-bold text-sky-700">{i + 1}</span>{t}
              </li>
            ))}
          </ol>
          <p className="flex items-center gap-2 text-[13px] text-slate-600"><Landmark size={16} className="shrink-0 text-slate-500" aria-hidden="true" />確認書が出ても、特例の対象にならないことがあります。最後は税務署で確かめてください。</p>
        </section>
      </SouzokuArticle>
    </>
  );
}
