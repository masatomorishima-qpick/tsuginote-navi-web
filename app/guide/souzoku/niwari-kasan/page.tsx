import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Calculator, CircleCheck, CircleX } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import NiwariKasanCalc from '@/components/souzoku/NiwariKasanCalc';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の2割加算の計算（2026-11-17 作成。docs/seisaku-queue.md の T26）。
 * 受ける言葉：相続税 2割加算 計算（主）・孫 2割加算・2割加算 対象者・兄弟 相続税 2割加算。
 *   上位5件（11/17、WebSearch で顔ぶれ、web-fetch で本文。Chrome につながらず）：1 税の専門出版の会員向け事例（回答は非公開）
 *   2 相続専門の税理士法人（2025/2、計算例あり、出典なし）3 相続専門の税理士法人（2026/6、表と計算例あり）
 *   4 不動産会社の解説（2割加算は2文だけ）5 税理士の紹介サイト（2020、計算全体の1段落）。
 *   上位が答えている疑問：対象者（一親等の血族と配偶者以外）・代襲相続人の孫は対象外・孫養子は対象・税額の20%・相続放棄・申告漏れ。
 *   上位に欠けている点：①続柄を選ぶと対象かが分かり、遺産額から加算額まで出す道具がない ②税額控除との順番（加算のあとに配偶者の軽減など）を順に並べたのは0件
 *   ③国税庁の誤りやすい事例（代襲の孫に足す・兄弟に足し忘れる）に触れたのは0件 ④エクセル・印刷用がない ⑤国税庁の確認日がない。
 * 出口：相続アシスト（申告をまとめて代行）。
 */
const LP_ID = 'guide-souzoku-niwari-kasan';
const PATH = '/guide/souzoku/niwari-kasan';
const TITLE = '相続税の2割加算の対象者と計算｜孫・兄弟・甥姪は対象か判定して加算額を自動計算（無料）';
const DESCRIPTION = '相続税の2割加算の対象者は、配偶者・子・父母以外（兄弟姉妹・甥姪・孫養子・遺贈を受けた孫など）。その人の相続税額に20%を足します。続柄を選ぶと対象か分かり、遺産額と相続人から加算額まで出ます。代襲相続人の孫は対象外、孫養子は対象。国税庁の誤りやすい例も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const D = DATA.niwari;
const FAQS = [
  { q: '相続税の2割加算の対象者は誰ですか？', a: '亡くなった人の配偶者と、子・父母（一親等の血族）以外の人です。兄弟姉妹、甥・姪、相続人でない孫、子の配偶者などが対象です。親の代わりに相続人になった孫（代襲相続人）は対象外です（国税庁 No.4157）。' },
  { q: '孫養子は2割加算の対象ですか？', a: '対象です。養子は一親等の血族なので本来は足しませんが、孫を養子にしたときは、孫の親（亡くなった人の子）が先に亡くなって代わりに相続人になっている場合を除き、2割を足します（国税庁 No.4157）。' },
  { q: '2割加算は配偶者の税額軽減の前ですか、後ですか？', a: '前です。各人の相続税額に2割を足してから、贈与税額控除・配偶者の税額の軽減・未成年者控除・障害者控除・相次相続控除などを引きます（国税庁 No.4152）。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = D.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相続税の2割加算の計算', faqs: FAQS, date: D.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  const man = (n: number) => `${(n / 10000).toLocaleString('ja-JP')}万円`;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v2-2026-11-22" path={PATH} eyebrow="相続税の計算"
        title={<>相続税の2割加算の計算<br /><span className="text-orange-600">配偶者・子・父母以外は税額に20%を足す</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{D.kotae}<span className="text-[11px] text-slate-500">（国税庁 No.4157）</span></p>
            <NiwariKasanCalc lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="兄弟姉妹や、代襲相続人でない孫が受け取る申告は、第4表の計算も要る。まとめて任せられる" />
            <SouzokuDownload icon={Calculator} h="2割加算の計算表" s="続柄を選ぶと対象かを表示し、加算額を自動で計算" files={SOUZOKU_FILES.niwari} />
          </div>
        }
        partner="souzokuAssist" exitLead="2割加算も含めて、相続税の申告をまとめて任せる" faqs={FAQS} updated="2026年11月17日"
      >
        <section className={SECTION} aria-labelledby="taisho">
          <h2 id="taisho" className={H2}>2割加算の対象者の早見表</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-3 py-2 text-left font-bold">受け取る人</th><th className="w-[30%] px-2 py-2 text-left font-bold">2割加算</th></tr>
              </thead>
              <tbody>
                {D.hantei.map((x) => (
                  <tr key={x.h} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2.5"><span className="font-bold text-slate-900">{x.h}</span></td>
                    <td className="px-2 py-2.5">
                      {x.kasan
                        ? <span className="flex items-center gap-1 font-black text-orange-700"><CircleCheck size={16} aria-hidden="true" />足す</span>
                        : <span className="flex items-center gap-1 font-black text-emerald-700"><CircleX size={16} aria-hidden="true" />足さない</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">目印は「配偶者か、一親等の血族（子・父母）か」。孫は二親等なので、代襲相続人でなければ足します。</p>
          <p className={SRC}>出典：{src(['nta4157', 'nta4152r8'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="keisan">
          <h2 id="keisan" className={H2}>2割加算の計算方法と順番</h2>
          <p className="rounded-2xl bg-white p-3.5 text-center text-[15px] font-black text-slate-900 ring-1 ring-slate-200">加算額 ＝ {D.shiki}</p>
          <ol className="grid gap-1.5">
            {D.junban.map((t, i) => (
              <li key={t} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] ring-1 ${i === 1 ? 'bg-orange-50 font-black text-orange-900 ring-orange-200' : 'bg-white font-bold text-slate-800 ring-slate-200'}`}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[12px] font-black text-white">{i + 1}</span>{t}
              </li>
            ))}
          </ol>
          <p className={SRC}>出典：{src(['nta4157', 'nta4152r8'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="rei">
          <h2 id="rei" className={H2}>兄弟が相続したときの計算例</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <tbody>
                {[
                  ['正味の遺産額', '1億円'],
                  ['相続人', D.rei.heirs],
                  ['基礎控除', '3,000万円＋600万円×2人＝4,200万円'],
                  ['相続税の総額', '837万5,000円'],
                  ['兄が受け取る額', `${man(D.rei.kyodaiShutoku)}（40%）`],
                  ['兄の相続税額', '837万5,000円×40%＝335万円'],
                  ['2割加算', '335万円×0.2＝67万円'],
                  ['兄の相続税（加算の後）', '402万円'],
                ].map(([h, v], i) => (
                  <tr key={h} className={i > 0 ? 'border-t border-slate-100' : ''}>
                    <th className="w-[40%] bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700">{h}</th>
                    <td className={`px-3 py-2.5 font-black ${i === 7 ? 'text-orange-700' : 'text-slate-900'}`}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">相続税の総額は、配偶者の法定相続分4分の3（4,350万円）に20%−200万円で670万円、兄の4分の1（1,450万円）に15%−50万円で167万5,000円、合わせて837万5,000円。配偶者は、配偶者の税額の軽減を受けられます。</p>
          <p className={SRC}>出典：{src(['nta4152r8', 'nta4155', 'nta4157'])}の計算の手順と税率で、つぎの手ナビが計算（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsumazuki">
          <h2 id="tsumazuki" className={H2}>2割加算の間違えやすい所</h2>
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
              { h: '誰が法定相続人かを確かめる', s: '代襲相続人になる孫・甥姪も分かる', href: '/guide/souzoku/houtei-souzokubun' },
              { h: '相続税の総額の目安を出す', s: '2割加算の前の税額のもと', href: '/guide/souzoku/souzokuzei-keisan' },
              { h: '孫が保険金を受け取ったら', s: '死亡保険金の非課税は相続人だけ', href: '/guide/souzoku/shibou-hokenkin-hikazei' },
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
