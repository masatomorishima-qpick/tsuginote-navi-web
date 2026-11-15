import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Calculator, CheckCircle2 } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import SoujiKojoCalc from '@/components/souzoku/SoujiKojoCalc';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相次相続控除の計算（2026-11-16 作成。docs/seisaku-queue.md の T27）。
 * 受ける言葉：相次相続控除 計算（主）・相次相続控除 計算例・相次相続控除 要件・10年以内 相続 2回。
 *   上位5件（11/15、WebSearch で顔ぶれ、web-fetch で本文。Chrome につながらず）：1 国税庁 No.4168（式は画像、計算例なし）
 *   2 経済媒体（税理士法人の寄稿の転載、2021）3 税理士の紹介サイト（2018、計算例あり）4 税の専門出版の会員向け事例（回答は非公開）
 *   5 相続専門の税理士法人（2024、計算例あり。割合の上限の扱いは書かれていない）。
 *   上位が答えている疑問：制度の概要・使える人の3つの要件・計算式と記号・相続放棄した人は使えない・計算例。
 *   上位に欠けている点：①日付と金額を入れると年数と控除の額が出る道具がない ②C÷(B−A) が1を超えたら1にする扱いを書いたのは1件だけ
 *   ③前の相続税が配偶者の税額の軽減で0円なら使えない例（国税庁の質疑応答）に触れたのは0件 ④エクセルがない ⑤国税庁の確認日の記載がない。
 * 出口：相続アシスト（申告をまとめて代行）。
 */
const LP_ID = 'guide-souzoku-souji-kojo';
const PATH = '/guide/souzoku/souji-souzoku-kojo';
const TITLE = '相次相続控除の計算｜日付と金額で自動計算・国税庁の例で確認（無料・エクセル）';
const DESCRIPTION = '相次相続控除は、10年以内に続いた相続で、今回亡くなった人が前に納めた相続税を1年10%ずつ減らして今回の相続税から引く制度。前と今回の相続の日と4つの金額を入れると、年数・割合・控除の額が出ます。国税庁の例（300万円）で答え合わせ済み。無料のエクセル付き。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const D = DATA.souji;
const FAQS = [
  { q: '相次相続控除とは何ですか？', a: '10年以内に2回続けて相続があったとき、今回亡くなった人が前の相続で納めた相続税のうち、1年につき10%ずつ減らした額を、今回の相続税から引く制度です（国税庁 No.4168）。' },
  { q: '相次相続控除の計算方法は？', a: 'A×C÷(B−A)×D÷C×(10−E)÷10 で計算します。Aは前の相続税、Bは前に受け取った純資産、Cは今回の全員の純資産、Dはその人の純資産、Eは前の相続からの年数（1年未満は切り捨て）です。C÷(B−A) が1を超えるときは1にします（国税庁 No.4168）。' },
  { q: '相続放棄をした人も相次相続控除を使えますか？', a: '使えません。この控除は相続人に限られ、相続を放棄した人と相続権を失った人は、遺贈で財産を受け取っても使えません（国税庁 No.4168）。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = D.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相次相続控除の計算', faqs: FAQS, date: D.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-16" path={PATH} eyebrow="相続税の控除"
        title={<>相次相続控除の計算<br /><span className="text-orange-600">前の相続税を1年10%ずつ減らして引く</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{D.kotae}<span className="text-[11px] text-slate-500">（国税庁 No.4168）</span></p>
            <SoujiKojoCalc lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="2回目の相続の申告は、前の申告書の数字も要る。まとめて任せられる" />
            <SouzokuDownload icon={Calculator} h="相次相続控除の計算表" s="日付と金額を入れると相続人ごとに自動で計算" files={SOUZOKU_FILES.souji} />
          </div>
        }
        partner="souzokuAssist" exitLead="相次相続控除も含めて、相続税の申告をまとめて任せる" faqs={FAQS} updated="2026年11月16日"
      >
        <section className={SECTION} aria-labelledby="shiki">
          <h2 id="shiki" className={H2}>相次相続控除の計算式と記号</h2>
          <p className="rounded-2xl bg-white p-3.5 text-center text-[15px] font-black text-slate-900 ring-1 ring-slate-200">A × C÷(B−A) × D÷C × (10−E)÷10</p>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <tbody>
                {D.kigou.map((x, i) => (
                  <tr key={x.k} className={`align-top ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                    <th className="w-[12%] bg-slate-50 px-3 py-2.5 text-center text-[16px] font-black text-sky-700">{x.k}</th>
                    <td className="px-3 py-2.5"><span className="font-bold text-slate-900">{x.h}</span><span className="block text-[12px] text-slate-600">{x.d}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">C÷(B−A) が1（100/100）を超えるときは、1にして計算します。</p>
          <p className={SRC}>出典：{src(['nta4168', 'nta4168qa'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="rei">
          <h2 id="rei" className={H2}>相次相続控除の計算例</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <tbody>
                {[
                  ['A 前の相続税', '1,000万円'],
                  ['B 前に受け取った純資産', '1億5,000万円'],
                  ['C 今回の全員の純資産', '1億8,000万円'],
                  ['D 今回のあなたの純資産', '9,000万円'],
                  ['E 年数', '4年6か月 → 4年'],
                  ['控除の額', '300万円'],
                ].map(([h, v], i) => (
                  <tr key={h} className={i > 0 ? 'border-t border-slate-100' : ''}>
                    <th className="w-[55%] bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700">{h}</th>
                    <td className={`px-3 py-2.5 font-black ${i === 5 ? 'text-orange-700' : 'text-slate-900'}`}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">{D.rei.note}。</p>
          <p className={SRC}>出典：{src(['nta4168qa'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="hayami">
          <h2 id="hayami" className={H2}>年数ごとの残る割合</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-2 py-2 text-left font-bold">前の相続からの年数（E）</th><th className="px-2 py-2 text-left font-bold">前の相続税のうち残る割合</th></tr>
              </thead>
              <tbody>
                {D.hayami.map((e) => (
                  <tr key={e} className="border-t border-slate-100">
                    <td className="px-2 py-2 font-black text-slate-900">{e === 0 ? '1年未満' : `${e}年以上${e + 1}年未満`}</td>
                    <td className="px-2 py-2 font-black text-orange-700">{(10 - e) * 10}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">10年以上たっていると使えません。実際の控除の額は、この割合に、C÷(B−A) と D÷C をかけた額です。</p>
          <p className={SRC}>出典：{src(['nta4168'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="yoken">
          <h2 id="yoken" className={H2}>相次相続控除を使える人の要件</h2>
          <ul className="grid gap-2">
            {D.yoken.map((t) => (
              <li key={t.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{t.h}</span><span className="text-[13px] text-slate-600">{t.d}</span></span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(D.yoken.map((t) => t.src))}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsumazuki">
          <h2 id="tsumazuki" className={H2}>間違えやすい所</h2>
          <ul className="grid gap-2">
            {D.tsumazuki.map((t) => (
              <li key={t.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{t.h}</span><span className="text-[13px] text-slate-600">{t.d}</span></span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(D.tsumazuki.map((t) => t.src))}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>次にすること</h2>
          <ol className="grid gap-2">
            {[
              { h: '今回の相続税の目安を出す', s: '控除は税額から引く。まず税額を', href: '/guide/souzoku/souzokuzei-keisan' },
              { h: '誰が法定相続人かを確かめる', s: '相続人でないと控除は使えない', href: '/guide/souzoku/houtei-souzokubun' },
              { h: '申告の必要書類をそろえる', s: '状況を選ぶと一覧に', href: '/guide/souzoku/shinkoku-shorui-checklist' },
              { h: '申告の手順と期限を確かめる', s: '亡くなったことを知った日の翌日から10か月', href: '/guide/souzoku/shinkoku-jibun' },
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
