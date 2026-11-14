import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Calculator, CheckCircle2 } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import MiseinenKojoCalc from '@/components/souzoku/MiseinenKojoCalc';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の未成年者控除・障害者控除の計算（2026-11-15 作成。docs/seisaku-queue.md の T25）。
 * 受ける言葉：相続税 未成年者控除 計算（主）・障害者控除 計算・未成年者控除 扶養義務者・18歳。
 *   上位5件（11/15、WebSearch。Chrome につながらず）：1 VSG相続税理士法人（2026/10 更新）2 税理士法人チェスター（2026/3）
 *   3 ランドマーク税理士法人の相談サイト（2025/4、一次情報の引用なし）4 アトム相続税理士法人（2026/9、早見表あり）5 税理士法人の情報サイト（読めず）。
 *   上位に欠けている点：①生年月日と亡くなった日を入れると年数と控除の額が出る道具がない ②本人で引き切れない分（扶養義務者から引く分）を出す道具がない
 *   ③未成年者控除と障害者控除を1つで計算できない ④エクセルがない ⑤国税庁の確認日の記載が0件。
 * 出口：相続アシスト（申告をまとめて代行）。
 */
const LP_ID = 'guide-souzoku-miseinen-kojo';
const PATH = '/guide/souzoku/miseinen-shougaisha-kojo';
const TITLE = '相続税の未成年者控除・障害者控除の計算｜生年月日で自動計算（無料・エクセル）';
const DESCRIPTION = '相続税の未成年者控除は10万円×18歳になるまでの年数、障害者控除は10万円（特別障害者は20万円）×85歳になるまでの年数。生年月日と亡くなった日を入れると、年数と控除の額、本人で引き切れず扶養義務者から引く額が出ます。無料のエクセル付き。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const D = DATA.miseinen;
const FAQS = [
  { q: '相続税の未成年者控除はいくらですか？', a: '18歳になるまでの年数1年につき10万円です。年数に1年未満の端数があれば切り上げます。たとえば15歳9か月なら3年で30万円、0歳なら18年で180万円です（国税庁 No.4164）。' },
  { q: '未成年者控除が引ききれない場合はどうなりますか？', a: '本人の相続税より控除の額が大きくて引き切れない分は、その人の扶養義務者（配偶者・親や祖父母などの直系血族・兄弟姉妹など）の相続税から引けます（国税庁 No.4164）。' },
  { q: '相続税の障害者控除はいくらですか？', a: '85歳になるまでの年数1年につき、一般障害者は10万円、特別障害者は20万円です。年数の1年未満は切り上げます。引き切れない分は扶養義務者の相続税から引けます（国税庁 No.4167）。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = D.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '未成年者控除・障害者控除の計算', faqs: FAQS, date: D.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-15" path={PATH} eyebrow="相続税の控除"
        title={<>相続税の未成年者控除・<br className="sm:hidden" />障害者控除の計算<br /><span className="text-orange-600">1年10万円×18歳までの年数</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{D.kotae}<span className="text-[11px] text-slate-500">（国税庁 No.4164・No.4167）</span></p>
            <MiseinenKojoCalc lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="控除の額が出たら、相続税の申告はまとめて任せられる" />
            <SouzokuDownload icon={Calculator} h="未成年者控除・障害者控除の計算表" s="生年月日と亡くなった日を入れると自動で計算" files={SOUZOKU_FILES.miseinen} />
          </div>
        }
        partner="souzokuAssist" exitLead="子どもの分も含めて、相続税の申告をまとめて任せる" faqs={FAQS} updated="2026年11月15日"
      >
        <section className={SECTION} aria-labelledby="hayami">
          <h2 id="hayami" className={H2}>未成年者控除の早見表</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-2 py-2 text-left font-bold">亡くなった日の満年齢</th><th className="px-2 py-2 text-left font-bold">18歳までの年数</th><th className="px-2 py-2 text-left font-bold">控除の額</th></tr>
              </thead>
              <tbody>
                {D.hayami.map((a) => (
                  <tr key={a} className="border-t border-slate-100">
                    <td className="px-2 py-2.5 font-black text-slate-900">{a}歳</td>
                    <td className="px-2 py-2.5 text-slate-800">{18 - a}年</td>
                    <td className="px-2 py-2.5 font-black text-orange-700">{(18 - a) * 10}万円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">例：{D.rei.note}。</p>
          <p className="text-[13px] text-slate-700">障害者控除は「85−満年齢」の年数に、一般障害者は10万円、特別障害者は20万円をかけます。例：60歳の一般障害者なら25年で250万円、特別障害者なら500万円。</p>
          <p className={SRC}>出典：{src(['nta4164', 'nta4167'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="yoken">
          <h2 id="yoken" className={H2}>未成年者控除・障害者控除を使える人の要件</h2>
          <ul className="grid gap-2">
            {D.yoken.map((t) => (
              <li key={t.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{t.h}</span><span className="text-[13px] text-slate-600">{t.d}</span></span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['nta4164', 'nta4167'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="fuyou">
          <h2 id="fuyou" className={H2}>引き切れない分は扶養義務者から</h2>
          <p className="rounded-2xl bg-sky-50 p-3.5 text-[13px] leading-relaxed text-sky-900 ring-1 ring-sky-200">{D.fuyou}。</p>
          <p className="text-[13px] text-slate-700">例：10歳の子の未成年者控除は80万円。子の相続税が30万円なら、子の分から30万円を引いて0円にし、残りの50万円を親など扶養義務者の相続税から引きます。</p>
          <p className="text-[13px] text-slate-700">{D.zenkai}。</p>
          <p className={SRC}>出典：{src(['nta4164', 'nta4167'])}（{checked} 確認）</p>
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
              { h: '相続税がかかるか計算する', s: '控除は税額から引く。まず税額の目安を', href: '/guide/souzoku/souzokuzei-keisan' },
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
