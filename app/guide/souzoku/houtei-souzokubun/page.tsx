import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Calculator } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import HouteiSouzokubunCalc from '@/components/souzoku/HouteiSouzokubunCalc';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 法定相続分の計算（2026-11-12 作成。docs/seisaku-queue.md の T8）。
 * 受ける言葉：法定相続分 計算（主）・相続 割合・法定相続分 計算 兄弟・法定相続分 計算 エクセル。
 *   上位5件（11/12、Chrome で Google）：1 大手税理士法人（約1.3万字・表5、例は文と図だけ）2 弁護士の紹介サイト（2026/6、計算の道具は別ページ）
 *   3 国税庁 No.4132（割合の文だけ）4 新聞社の相続の媒体（約1万字・図解）5 小さな手続き代行の事務所（約5,500字・表2）。
 *   上位に欠けている点：①家族の形を選ぶと、誰が何分のいくつ・いくらかが一度に出る道具（代襲・片方だけ同じ兄弟姉妹・遺留分まで）がない
 *   ②エクセルがない ③民法の条文と国税庁の確認日つきの出典がない。
 * 出口：相続アシスト（申告から登記までまとめて代行）。
 */
const LP_ID = 'guide-souzoku-houtei-souzokubun';
const PATH = '/guide/souzoku/houtei-souzokubun';
const TITLE = '法定相続分の計算｜家族を選ぶだけで誰がいくらか自動計算（無料・エクセル）';
const DESCRIPTION = '法定相続分は配偶者と子なら配偶者2分の1・子全員で2分の1、配偶者と親なら3分の2と3分の1、配偶者と兄弟姉妹なら4分の3と4分の1。家族の形と遺産の額を入れると、孫・おい・めいの代襲や遺留分も含めて、誰がいくらかが出ます。無料のエクセル付き。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const D = DATA.houtei;
const FAQS = [
  { q: '法定相続人の相続分はどうやって計算しますか？', a: 'まず配偶者の分（子がいれば2分の1、親なら3分の2、兄弟姉妹なら4分の3）を決め、残りを同じ立場の人の人数で等しく分けます。父母の片方だけが同じ兄弟姉妹は、両方同じ兄弟姉妹の2分の1です（民法第900条）。' },
  { q: '親のみが相続人になるのは、法定相続分はどのくらいですか？', a: '配偶者もいなければ、親がすべてを受け継ぎ、父母2人なら2分の1ずつです。配偶者がいれば、配偶者3分の2・親3分の1になります（国税庁 No.4132）。' },
  { q: '法定相続分どおりに分けないといけませんか？', a: 'いいえ。相続人全員の話し合い（遺産分割協議）で、違う割合に決められます。法定相続分は、話し合いがまとまらないときの目安です（国税庁 No.4132）。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = D.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '法定相続分の計算', faqs: FAQS, date: D.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-12" path={PATH} eyebrow="相続の割合"
        title={<>法定相続分の<br /><span className="text-orange-600">計算</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{D.kotae}<span className="text-[11px] text-slate-500">（国税庁 No.4132・民法第900条）</span></p>
            <HouteiSouzokubunCalc lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="割合が分かったら、相続税の申告や家の名義変更はまとめて任せられる" />
            <SouzokuDownload icon={Calculator} h="法定相続分の計算表" s="人数と遺産の額を入れると自動で計算" files={SOUZOKU_FILES.houtei} />
          </div>
        }
        partner="souzokuAssist" exitLead="分け方が決まったら、申告から登記までまとめて任せる" faqs={FAQS} updated="2026年11月12日"
      >
        <section className={SECTION} aria-labelledby="hyo">
          <h2 id="hyo" className={H2}>法定相続分と遺留分の早見表</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-2 py-2 text-left font-bold">相続人</th><th className="whitespace-nowrap px-2 py-2 text-left font-bold">配偶者</th><th className="px-2 py-2 text-left font-bold">ほかの相続人</th><th className="px-2 py-2 text-left font-bold">遺留分</th></tr>
              </thead>
              <tbody>
                {D.pattern.map((p) => (
                  <tr key={p.h} className="border-t border-slate-100 align-top">
                    <td className="px-2 py-2.5 font-black text-slate-900">{p.h}</td>
                    <td className="whitespace-nowrap px-2 py-2.5 font-bold text-orange-700">{p.haigusha}</td>
                    <td className="px-2 py-2.5 text-slate-800">{p.hoka}</td>
                    <td className="px-2 py-2.5 text-[12px] text-slate-600">{p.iryu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">例：{D.rei.note}。</p>
          <p className="rounded-2xl bg-sky-50 p-3.5 text-[13px] leading-relaxed text-sky-900 ring-1 ring-sky-200">{D.iryu}</p>
          <p className={SRC}>出典：{src(['nta4132', 'minpo900', 'minpo1042'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="junni">
          <h2 id="junni" className={H2}>法定相続人の順位</h2>
          <ol className="grid gap-2">
            {D.junni.map((j, i) => (
              <li key={j.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className={`flex h-7 shrink-0 items-center justify-center rounded-full px-2 text-[12px] font-black text-white ${i === 0 ? 'bg-orange-600' : 'bg-sky-700'}`}>{i === 0 ? '常に' : i}</span>
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{j.h}</span><span className="text-[13px] text-slate-600">{j.d}</span></span>
              </li>
            ))}
          </ol>
          <p className="text-[13px] text-slate-700">上の順位の人が1人でもいれば、下の順位の人は相続人になりません。</p>
          <p className={SRC}>出典：{src(['nta4132', 'minpo900'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsumazuki">
          <h2 id="tsumazuki" className={H2}>計算で間違えやすい所</h2>
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
              { h: '相続人を戸籍で確かめ、図にする', s: '相続関係説明図のひな形', href: '/guide/souzoku/souzoku-kankei-setsumeizu' },
              { h: '分け方を決めて協議書にする', s: '遺産分割協議書のひな形', href: '/guide/souzoku/isan-bunkatsu-kyogisho' },
              { h: '相続税がかかるか計算する', s: '基礎控除は相続人の数で決まる', href: '/guide/souzoku/souzokuzei-keisan' },
              { h: '家や土地の名義を変える', s: '相続登記の必要書類', href: '/guide/souzoku/touki-shorui' },
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
