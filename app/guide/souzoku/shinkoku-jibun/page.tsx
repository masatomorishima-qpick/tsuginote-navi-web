import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Banknote, ClipboardList, Landmark, Send } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import JibunShinkokuCheck from '@/components/souzoku/JibunShinkokuCheck';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の申告を自分でする手順（2026-11-14 作成。docs/seisaku-queue.md の T20）。
 * 受ける言葉：相続税 申告 自分で（主）・相続税 申告 手順・相続税 申告 やり方・相続税 申告書 書き方 順番。
 *   上位5件（11/14、WebSearch。Chrome につながらず）：1 税理士法人トゥモローズ（2026/10、判定の図は画像）2 幻冬舎の媒体（1の転載、2021）
 *   3 サライ（税理士法人の取材、2023）4 税理士法人レガシィ（2024/5）5 税理士の紹介会社（2026/1）。
 *   上位が答えている疑問：手順（相続人→財産→評価→分割→申告）・自分でできる場合と頼む場合・10か月の期限・提出先・必要書類・土地の評価の難しさ。
 *   上位に欠けている点：①期限を自分の日付で出す計算がない ②どの表をどの順で作るか（第9表〜第15表→第1表…）がない
 *   ③状況を選ぶと作る表が出る道具がない ④e-Tax で出せる条件と、作成コーナーでは作れないことが書かれていない ⑤印刷用のチェックリストがない。
 * 出口：相続アシスト（申告までまとめて代行。公式 2026-11-12 確認）。
 */
const LP_ID = 'guide-souzoku-shinkoku-jibun';
const PATH = '/guide/souzoku/shinkoku-jibun';
const TITLE = '相続税の申告を自分でする手順｜期限の計算と申告書を作る順（無料チェックリスト）';
const DESCRIPTION = '相続税の申告を自分でする7つの手順を、国税庁の案内に合わせて1枚に。亡くなったことを知った日を入れると10か月の期限が日付で出て、当てはまるものを選ぶと作る申告書の表（第9表〜第15表・第1表など）が作る順に並びます。e-Tax の条件も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const J = DATA.jibun;
const FAQS = [
  { q: '相続税の申告は自分でできますか？', a: 'できます。相続人の確認、遺産の調べと評価、分け方の話し合い、申告書づくりの順に進め、亡くなった人の住所地の税務署に出します（国税庁 No.4202・No.4205）。土地の評価や特例を使うときは表が増えるので、手が回らなければ専門家に頼む方法もあります。' },
  { q: '相続税の申告書はどこでもらえますか？', a: '国税庁のサイトの「相続税の申告書等の様式一覧」から印刷できます。令和8年中に亡くなった人の分は「令和8年分用」を使います。' },
  { q: '相続税の申告は e-Tax でできますか？', a: 'できます。平成31年1月1日以後の相続から使えます。ただし申告書は e-Taxソフトか民間の税務会計ソフトで作り、確定申告書等作成コーナーでは作れません。電子証明書がないときは書面で出します（e-Tax よくある質問）。' },
];
const DASHI_ICONS = [Send, Send, ClipboardList, ClipboardList];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = J.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相続税の申告を自分でする手順', faqs: FAQS, date: J.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  const when = Object.fromEntries(J.jokyo.map((k) => [k.key, k.h]));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-14" path={PATH} eyebrow="相続税の申告"
        title={<>相続税の申告を<br /><span className="text-orange-600">自分でする手順</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{J.kotae}</p>
            <JibunShinkokuCheck lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="表が多くて手が止まったら、申告までまとめて任せる方法もある" />
            <SouzokuDownload icon={ClipboardList} h="相続税の申告の手順チェックリスト" s="期限と目安の日付が自動で出る。作る表に印を付ける" files={SOUZOKU_FILES.jibun} />
          </div>
        }
        partner="souzokuAssist" exitLead="自分で進めるのが難しいと感じたら、申告までまとめて任せる" faqs={FAQS} updated="2026年11月14日"
      >
        <section className={SECTION} aria-labelledby="tejun">
          <h2 id="tejun" className={H2}>相続税の申告の7つの手順</h2>
          <ol className="grid gap-2">
            {J.steps.map((s, i) => (
              <li key={s.key} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] font-black text-white">{i + 1}</span>
                <span className="flex flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-black text-slate-900">{s.h}</span>
                  <span className="text-[13px] text-slate-600">{s.d}</span>
                  {s.href && <Link href={s.href} className="flex items-center gap-1 text-[12px] font-bold text-sky-700 underline underline-offset-2">{s.link}<ArrowRight size={12} aria-hidden="true" /></Link>}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-[13px] text-slate-700">{J.kyujitsu}</p>
          <p className={SRC}>出典：{src(['nta4202', 'nta4205r8', 'nta4152', 'nta4158', 'ntaShikataKisai'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="hyo">
          <h2 id="hyo" className={H2}>申告書の表を作る順番</h2>
          <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[12px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="w-[28px] px-2 py-2 text-left font-bold">順</th><th className="px-2 py-2 text-left font-bold">表</th><th className="w-[38%] px-2 py-2 text-left font-bold">作るとき</th></tr>
              </thead>
              <tbody>
                {J.hyo.map((h, i) => (
                  <tr key={h.no} className="border-t border-slate-100 align-top">
                    <td className="px-2 py-2 font-black text-slate-400">{i + 1}</td>
                    <td className="px-2 py-2"><span className="font-black text-slate-900">{h.no}</span><br /><span className="text-[11px] text-slate-500">{h.h}</span></td>
                    <td className="px-2 py-2 text-slate-700">{h.when === 'always' ? <span className="font-bold text-emerald-700">必ず作る</span> : when[h.when]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">{J.hyoNote}</p>
          <p className="text-[13px] text-slate-700">{J.kasanNote}</p>
          <p className="text-[13px] text-slate-700">{J.yoshiki}</p>
          <p className={SRC}>出典：{src(['ntaShikataKisai', 'ntaYoshikiR08', 'nta4157'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="dasu">
          <h2 id="dasu" className={H2}>申告書の出し方と e-Tax</h2>
          <ul className="grid gap-2">
            {J.dashikata.map((t, i) => {
              const I = DASHI_ICONS[i] ?? Send;
              return (
                <li key={t.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <I size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                  <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{t.h}</span><span className="text-[13px] text-slate-600">{t.d}</span></span>
                </li>
              );
            })}
          </ul>
          <p className="flex items-start gap-2 text-[13px] text-slate-700"><Landmark size={16} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{J.madoguchi}</p>
          <p className={SRC}>出典：{src(['nta4205r8', 'etaxSouzokuSakusei', 'etaxSouzokuFuka', 'ntaSouzokuTetsuzuki'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="nofu">
          <h2 id="nofu" className={H2}>相続税の納め方</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <tbody>
                {J.nofu.map((t, i) => (
                  <tr key={t.h} className={`align-top ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                    <th className="w-[32%] bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700"><span className="flex items-center gap-1.5"><Banknote size={14} className="shrink-0 text-sky-700" aria-hidden="true" />{t.h}</span></th>
                    <td className="px-3 py-2.5 text-slate-800">{t.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={SRC}>出典：{src(['nta4202', 'ntaShikataNofu'])}（{checked} 確認）</p>
        </section>
      </SouzokuArticle>
    </>
  );
}
