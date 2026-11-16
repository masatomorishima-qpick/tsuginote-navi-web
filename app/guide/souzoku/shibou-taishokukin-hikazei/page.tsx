import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Calculator, CheckCircle2 } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import TaishokukinHikazeiCalc from '@/components/souzoku/TaishokukinHikazeiCalc';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 死亡退職金の非課税の計算（2026-11-17 作成。docs/seisaku-queue.md の T30）。
 * 受ける言葉：死亡退職金 非課税 計算（主）・死亡退職金 相続税・死亡退職金 相続放棄・弔慰金 相続税。
 *   上位5件（11/17、WebSearch で顔ぶれ、web-fetch で本文。Chrome につながらず）：1 弁護士法人（2021、計算例あり）
 *   2 相続専門の税理士法人（2025/6、按分の例あり、国税庁へのリンクなし）3 経済媒体（税理士法人の記事の転載、2024、計算例なし）
 *   4 税の専門出版の会員向け事例（回答は非公開）5 生命保険文化センター（短い説明、計算例なし）。
 *   上位が答えている疑問：3年以内の支給の確定・500万円×法定相続人の数・相続放棄した人の扱い・弔慰金の範囲。
 *   上位に欠けている点：①受け取った人ごとの非課税と課税の額を出す道具がない ②弔慰金の多すぎる分を退職金に足す計算がない
 *   ③死亡保険金と別の枠であることを示したのは1件だけ ④エクセル・印刷用がない ⑤国税庁の例（放棄した長女の分）で答え合わせしたものがない。
 * 出口：相続アシスト（申告をまとめて代行）。
 */
const LP_ID = 'guide-souzoku-taishokukin';
const PATH = '/guide/souzoku/shibou-taishokukin-hikazei';
const TITLE = '死亡退職金の非課税の計算｜受け取った人ごとに自動計算・弔慰金も（無料・エクセル）';
const DESCRIPTION = '死亡退職金の相続税の非課税は「500万円×法定相続人の数」で、死亡保険金とは別の枠。受け取った人ごとの非課税と課税の額、弔慰金のうち退職金に足す額を計算できます。相続を放棄した人の扱いは国税庁の例で答え合わせ済み。無料のエクセル付き。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const D = DATA.taishoku;
const FAQS = [
  { q: '死亡退職金の非課税枠はいくらですか？', a: '「500万円×法定相続人の数」です。相続人が受け取った死亡退職金の合計がこの額以下なら、相続税はかかりません（国税庁 No.4117）。死亡保険金の非課税とは別の枠です。' },
  { q: '相続放棄をしても死亡退職金は受け取れますか？', a: '退職金の規程で受取人とされていれば受け取れますが、非課税は使えず、受け取った全額が相続税の対象になります。法定相続人の数には、放棄した人も数えます（国税庁 No.4117）。' },
  { q: '弔慰金にも相続税はかかりますか？', a: 'ふつうはかかりません。ただ、仕事中の死亡なら死亡したときの普通給与の3年分、仕事中でない死亡なら半年分を超える部分は、退職手当金等として相続税の対象になります（国税庁 No.4120）。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = D.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '死亡退職金の非課税の計算', faqs: FAQS, date: D.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  const man = (n: number) => (n === 0 ? '0円' : `${(n / 10000).toLocaleString('ja-JP')}万円`);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-17" path={PATH} eyebrow="相続税の非課税"
        title={<>死亡退職金の非課税の計算<br /><span className="text-orange-600">500万円×法定相続人の数</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{D.kotae}<span className="text-[11px] text-slate-500">（国税庁 No.4117・No.4108）</span></p>
            <TaishokukinHikazeiCalc lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="死亡退職金を足して基礎控除を超えたら申告が要る。まとめて任せられる" />
            <SouzokuDownload icon={Calculator} h="死亡退職金の非課税の計算表" s="受け取った人ごとの非課税と、弔慰金の多すぎる分を自動で計算" files={SOUZOKU_FILES.taishoku} />
          </div>
        }
        partner="souzokuAssist" exitLead="死亡退職金も含めて、相続税の申告をまとめて任せる" faqs={FAQS} updated="2026年11月17日"
      >
        <section className={SECTION} aria-labelledby="kimari">
          <h2 id="kimari" className={H2}>死亡退職金の相続税の決まり</h2>
          <ul className="grid gap-2">
            {D.rules.map((t) => (
              <li key={t.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{t.h}</span><span className="text-[13px] text-slate-600">{t.d}</span></span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-3.5 text-[13px] font-bold text-slate-800 ring-1 ring-slate-200">{D.anbun}</p>
          <p className={SRC}>出典：{src(D.rules.map((t) => t.src))}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="rei">
          <h2 id="rei" className={H2}>死亡退職金の非課税の計算例</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-2 py-2 text-left font-bold">受け取った人</th><th className="px-2 py-2 text-right font-bold">退職金</th><th className="px-2 py-2 text-right font-bold">非課税</th><th className="px-2 py-2 text-right font-bold">相続税の対象</th></tr>
              </thead>
              <tbody>
                {D.rei.rows.map(([n, k, h, z]) => (
                  <tr key={String(n)} className="border-t border-slate-100">
                    <td className="px-2 py-2.5 font-bold text-slate-900">{n}</td>
                    <td className="px-2 py-2.5 text-right text-slate-800">{man(Number(k))}</td>
                    <td className="px-2 py-2.5 text-right font-black text-emerald-700">{man(Number(h))}</td>
                    <td className="px-2 py-2.5 text-right font-black text-orange-700">{man(Number(z))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">非課税の限度額は500万円×3人＝{man(D.rei.gendo)}。相続を放棄した長女も人数に数えますが、長女が受け取った分には非課税が使えません。配偶者と長男の合計3,000万円の割合で分けて、2,000万円分の配偶者に1,000万円、1,000万円分の長男に500万円です。</p>
          <p className={SRC}>出典：{src(['nta4117'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="choui">
          <h2 id="choui" className={H2}>弔慰金の非課税の範囲</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <tbody>
                {D.choui.map((x, i) => (
                  <tr key={x.h} className={i > 0 ? 'border-t border-slate-100' : ''}>
                    <th className="w-[45%] bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700">{x.h}</th>
                    <td className="px-3 py-2.5 font-black text-slate-900">{x.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">{D.chouiNote}</p>
          <p className={SRC}>出典：{src(['nta4120'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsumazuki">
          <h2 id="tsumazuki" className={H2}>死亡退職金の間違えやすい所</h2>
          <ul className="grid gap-2">
            {D.tsumazuki.map((t) => (
              <li key={t.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{t.h}</span><span className="text-[13px] text-slate-600">{t.d}</span></span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-slate-700">{D.shinkoku}。</p>
          <p className={SRC}>出典：{src([...D.tsumazuki.map((t) => t.src), 'nta4117'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>次にすること</h2>
          <ol className="grid gap-2">
            {[
              { h: '死亡保険金の非課税も計算する', s: '同じ500万円×人数の別の枠', href: '/guide/souzoku/shibou-hokenkin-hikazei' },
              { h: '相続税がかかるかの目安を出す', s: '相続税の対象の額を遺産に足して', href: '/guide/souzoku/souzokuzei-keisan' },
              { h: '誰が法定相続人かを確かめる', s: '非課税の人数のもと', href: '/guide/souzoku/houtei-souzokubun' },
              { h: '申告の必要書類をそろえる', s: '「死亡退職金を受け取った」を選ぶと要る書類が出る', href: '/guide/souzoku/shinkoku-shorui-checklist' },
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
