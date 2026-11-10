import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calculator, Info } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import HokenkinHikazeiCalc from '@/components/souzoku/HokenkinHikazeiCalc';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 死亡保険金の相続税の非課税の計算（2026-11-11 作成。docs/seisaku-queue.md の T7）。
 * 受ける言葉：死亡保険金 相続税 非課税（主）・生命保険 非課税枠 計算・死亡保険金 非課税 複数 受取人。
 *   上位5件（11/11、WebSearch）：1 総合情報サイト（約6,000字。基礎控除の式に誤り）2 大手税理士法人（2017年、約2,000字）
 *   3 出版社の媒体（2021年、2と同じ執筆元）4 税理士の紹介サイト（約8,000字。計算例に不整合）5 弁護士法人（約9,000字）。
 *   国税庁・保険会社は上位5件にいない。
 *   上位に欠けている点：①入れると非課税と課税の額が出る計算がない ②受取人ごとの按分を計算する道具がない
 *   ③確認表（エクセル・PDF）がない ④確認日つきの出典がない。
 * 出口：相続アシスト（申告をまとめて代行）。
 * 数字の元：国税庁 No.4114・No.1750・No.4108（令和8年4月1日現在法令等）。
 */
const LP_ID = 'guide-souzoku-hokenkin-hikazei';
const PATH = '/guide/souzoku/shibou-hokenkin-hikazei';
const TITLE = '死亡保険金の相続税の非課税｜受取人ごとの額を自動計算（500万円×相続人の数）';
const DESCRIPTION = '死亡保険金の相続税の非課税は「500万円×法定相続人の数」。相続人の人数と受け取った金額を入れると、受取人ごとの非課税の額と相続税の対象になる額が出ます。養子・相続放棄の数え方、税の種類の見分け方も。無料のエクセル付き。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const H = DATA.hikazei;
const man = (n: number) => `${(n / 10000).toLocaleString('ja-JP')}万円`;
const FAQS = [
  { q: '相続を放棄した人は、非課税を使えますか？', a: '使えません。ただし、非課税の限度額を出す「法定相続人の数」には、放棄がなかったものとして数えます（国税庁 No.4114）。' },
  { q: '孫が受取人のときは？', a: '孫が相続人でなければ、受け取った保険金に非課税は使えません。相続人以外の人が受け取った死亡保険金には、非課税の適用がないためです（国税庁 No.4114）。' },
  { q: '死亡退職金にも非課税はありますか？', a: '死亡保険金とは別に、死亡退職金にも「500万円×法定相続人の数」の非課税があります（国税庁 No.4108）。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = H.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '死亡保険金の非課税の計算', faqs: FAQS, date: H.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  const R = H.rei;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-11" path={PATH} eyebrow="死亡保険金と相続税"
        title={<>死亡保険金の<br /><span className="text-orange-600">非課税の計算</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="rounded-2xl bg-white p-4 text-center ring-1 ring-slate-200">
              <span className="block text-[12px] font-bold text-slate-500">非課税の限度額</span>
              <span className="text-[22px] font-black text-slate-900">{H.shiki}</span>
            </p>
            <HokenkinHikazeiCalc lpId={LP_ID} />
            <SouzokuDownload icon={Calculator} h="非課税の計算表" s="人数と金額を入れると自動で計算" files={SOUZOKU_FILES.hikazei} />
          </div>
        }
        partner="souzokuAssist" exitLead="保険金を含めた相続税の申告を任せる" faqs={FAQS} updated="2026年11月11日"
      >
        <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="非課税を超えたら、申告をまとめて任せる" />

        <section className={SECTION} aria-labelledby="rules">
          <h2 id="rules" className={H2}>非課税のきまり</h2>
          <ul className="grid gap-2">
            {H.rules.map((r) => (
              <li key={r.h} className="flex flex-col gap-0.5 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="text-[15px] font-black text-slate-900">{r.h}</span>
                <span className="text-[13px] text-slate-600">{r.d}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-sky-50 p-3.5 text-[13px] font-bold leading-relaxed text-sky-900 ring-1 ring-sky-200">{H.anbun}</p>
          <p className={SRC}>出典：{src(H.rules.map((r) => r.src))}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="rei">
          <h2 id="rei" className={H2}>受取人が2人のときの計算例</h2>
          <p className="text-[13px] text-slate-600">{R.note}</p>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[12px] text-slate-600">
                <tr><th className="px-3 py-2 text-left font-bold">受取人</th><th className="px-2 py-2 text-right font-bold">受け取った額</th><th className="px-2 py-2 text-right font-bold">非課税</th><th className="px-3 py-2 text-right font-bold">対象</th></tr>
              </thead>
              <tbody>
                {R.uketori.map((u, i) => (
                  <tr key={u.h} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 font-black text-slate-900">{u.h}</td>
                    <td className="px-2 py-2.5 text-right">{man(u.kingaku)}</td>
                    <td className="px-2 py-2.5 text-right text-emerald-700">{man(R.hikazei[i])}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-orange-700">{man(R.kazei[i])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-slate-600">限度額 {man(H.per * R.ninzu)}（500万円×{R.ninzu}人）を、3,000万円と1,000万円の割合（3対1）で分けます。</p>
        </section>

        <section className={SECTION} aria-labelledby="zei">
          <h2 id="zei" className={H2}>相続税になる保険金の見分け方</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-2 py-2 text-left font-bold">亡くなった人</th><th className="px-2 py-2 text-left font-bold">保険料を払った人</th><th className="px-2 py-2 text-left font-bold">受取人</th><th className="px-2 py-2 text-left font-bold">税</th></tr>
              </thead>
              <tbody>
                {H.zeimoku.map((z) => (
                  <tr key={z.zei} className={`border-t border-slate-100 ${z.zei === '相続税' ? 'bg-orange-50/60' : ''}`}>
                    <td className="px-2 py-2.5">{z.hihoken}</td><td className="px-2 py-2.5">{z.futan}</td><td className="px-2 py-2.5">{z.uketori}</td>
                    <td className="px-2 py-2.5"><span className="font-black text-slate-900">{z.zei}</span><br /><span className="text-[11px] text-slate-500">{z.memo}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="flex items-start gap-2 text-[13px] text-slate-700"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{H.shinkoku}</p>
          <p className={SRC}>出典：{src(['nta1750', 'nta4114'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>次にすること</h2>
          <ol className="grid gap-2">
            {[
              { h: '相続税がかかるか計算する', s: '対象になった額を遺産に足す', href: '/guide/souzoku/souzokuzei-keisan' },
              { h: '申告の必要書類をそろえる', s: '状況を選ぶと要る書類が分かる', href: '/guide/souzoku/shinkoku-shorui-checklist' },
              { h: '保険証券で受取人を確かめる', s: '契約者・被保険者・受取人の見方', href: '/guide/shisan-kanri/hoken-shoken-mikata' },
            ].map((f, i) => (
              <li key={f.h}>
                <Link href={f.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] font-black text-white">{i + 1}</span>
                  <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{f.h}</span><span className="text-[12px] text-slate-600">{f.s}</span></span>
                  <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </SouzokuArticle>
    </>
  );
}
