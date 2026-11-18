import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Calculator } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import OkureKeisanCalc from '@/components/souzoku/OkureKeisanCalc';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の申告が遅れたときの延滞税・無申告加算税の計算（2026-11-17 作成。docs/seisaku-queue.md の T31）。
 * 受ける言葉：相続税 申告期限 過ぎた（主）・相続税 延滞税 計算・相続税 無申告加算税・相続税 期限後申告。
 *   上位5件（11/17、WebSearch で顔ぶれ、web-fetch で本文。Chrome につながらず）：1 税理士の紹介会社の媒体（2025/11、令和6年の割合。期限の例の日付が1日ずれている）
 *   2 相続専門の税理士法人（2026/2、割合は画像だけ）3 税理士への質問サイトの記事（2020、割合なし）
 *   4 相続専門の税理士法人（2024/5 更新だが2021年の割合のまま）5 相続専門の税理士法人（2026/5、令和8年の割合と表あり）。
 *   上位が答えている疑問：期限・延滞税と無申告加算税・自主申告で軽くなる・特例・延長・延納と物納・時効。
 *   上位に欠けている点：①日付と税額から延滞税と加算税を出す道具がない ②期限後の申告で低い割合が「申告した日から2か月」まで続くことを書いたものがない
 *   ③年をまたぐときに割合を年ごとに分ける計算がない ④1か月以内の自主申告で加算税がかからない条件は1件だけ ⑤端数の切り捨ての決まりと確認日がない。
 * 出口：相続アシスト（申告をまとめて代行）。
 */
const LP_ID = 'guide-souzoku-shinkoku-okure';
const PATH = '/guide/souzoku/shinkoku-okure';
const TITLE = '相続税の申告期限を過ぎたら｜延滞税と無申告加算税を日付で自動計算（無料）';
const DESCRIPTION = '相続税の申告期限（知った日の翌日から10か月）を過ぎると延滞税と無申告加算税がかかります。知った日・申告する日・税額を入れると、令和8年の割合（年2.8%・9.1%）で延滞税を、調査の前か後かで加算税（5〜30%）を計算します。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const O = DATA.okure;
const FAQS = [
  { q: '相続税の申告期限を過ぎたらどうなりますか？', a: '本来の相続税に加えて、延滞税と無申告加算税がかかります。延滞税は期限の翌日から納めた日までの日数で計算し、令和8年は年2.8%（2か月を過ぎた分は年9.1%）。無申告加算税は、税務署の調査の通知の前に自分から申告すれば5%です（国税庁 No.9205・No.2024）。' },
  { q: '相続税の延滞税はどうやって計算しますか？', a: 'もとの税額（1万円未満は切り捨て）×割合×日数÷365 です。割合は年ごとに変わり、納期限の翌日から2か月までは低い割合、その後は高い割合を使います。合計の100円未満は切り捨て、1,000円未満なら納めなくてよい決まりです（国税庁「延滞税の計算方法」・国税通則法）。' },
  { q: '相続税の無申告加算税はいくらですか？', a: '税務署の調査の通知の前に自分から申告すれば、納める税額の5%です。通知の後に申告すると10%（50万円を超える部分は15%、300万円を超える部分は25%）、調査で指摘された後は15%（20%、30%）です。300万円の区分は、令和6年1月1日以後に申告の期限が来る分からです（国税庁 No.2024）。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = O.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相続税の申告が遅れたとき', faqs: FAQS, date: O.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  const yen = (n: number) => `${n.toLocaleString('ja-JP')}円`;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-17" path={PATH} eyebrow="相続税の申告"
        title={<>相続税の申告期限を<br />過ぎたら<br /><span className="text-orange-600">延滞税と無申告加算税を日付で計算</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{O.kotae}<span className="text-[11px] text-slate-500">（国税庁 No.9205・No.2024・延滞税の割合）</span></p>
            <OkureKeisanCalc lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="延滞税は1日ごとに増える。申告書づくりをまとめて任せられる" />
            <SouzokuDownload icon={Calculator} h="延滞税と無申告加算税の計算表" s="日付と税額を入れると、年ごとの割合で自動で計算" files={SOUZOKU_FILES.okure} />
          </div>
        }
        partner="souzokuAssist" exitLead="期限を過ぎた申告も、まとめて任せられる" faqs={FAQS} updated="2026年11月17日"
      >
        <section className={SECTION} aria-labelledby="entai">
          <h2 id="entai" className={H2}>相続税の延滞税の割合（年ごと）</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-3 py-2 text-left font-bold">年</th><th className="px-2 py-2 text-right font-bold">納期限の翌日から2か月まで</th><th className="px-3 py-2 text-right font-bold">2か月の後</th></tr>
              </thead>
              <tbody>
                {[...O.wariai].reverse().map((w) => (
                  <tr key={w.y} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 font-bold text-slate-900">{w.y}年（令和{w.y - 2018}年）</td>
                    <td className="px-2 py-2.5 text-right font-black text-slate-900">年{w.lo}%</td>
                    <td className="px-3 py-2.5 text-right font-black text-orange-700">年{w.hi}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">「納期限」は、期限内に申告して納めるのだけ遅れたときは申告の期限。<b>期限を過ぎてから申告したときは、申告書を出した日</b>です。申告した日に納めれば、期限の翌日から納めた日まで低い割合で済みます。</p>
          <p className="text-[12px] text-slate-600">{O.wariaiNote}</p>
          <p className={SRC}>出典：{src(['ntaEntaiWariai', 'ntaEntaiKeisan', 'nta9205'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="keisan">
          <h2 id="keisan" className={H2}>延滞税の計算方法と計算例</h2>
          <p className="rounded-2xl bg-white p-3.5 text-center text-[15px] font-black text-slate-900 ring-1 ring-slate-200">延滞税 ＝ もとの税額 × 割合 × 日数 ÷ 365</p>
          <p className="text-[13px] text-slate-700">{O.nissu}{O.hasu}</p>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <p className="bg-slate-50 px-3 py-2 text-[12px] font-bold text-slate-700">例：{O.rei.h}</p>
            <table className="w-full text-[13px]">
              <tbody>
                {[
                  ['申告の期限', '2021年3月15日'],
                  ['2か月までの61日', `1,000万円×2.5%×61日÷365＝${yen(O.rei.lo)}`],
                  ['2か月の後の29日', `1,000万円×8.8%×29日÷365＝${yen(O.rei.hi)}`],
                  ['延滞税（100円未満切り捨て）', yen(O.rei.total)],
                ].map(([h, v], i) => (
                  <tr key={h} className={i > 0 ? 'border-t border-slate-100' : ''}>
                    <th className="w-[38%] bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700">{h}</th>
                    <td className={`px-3 py-2.5 font-black ${i === 3 ? 'text-orange-700' : 'text-slate-900'}`}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={SRC}>出典：{src(['ntaEntaiKeisan', 'ntaEntaiWariai', 'tsusokuHo'])}の割合と端数の決まりで、つぎの手ナビが計算（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="kasan">
          <h2 id="kasan" className={H2}>無申告加算税の割合</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-3 py-2 text-left font-bold">申告した時</th><th className="px-1 py-2 text-right font-bold">50万円まで</th><th className="px-1 py-2 text-right font-bold">300万円まで</th><th className="px-2 py-2 text-right font-bold">300万円超</th></tr>
              </thead>
              <tbody>
                {O.kasan.map((k) => (
                  <tr key={k.key} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2.5 font-bold text-slate-900">{k.h}</td>
                    {k.rates.length === 1
                      ? <td colSpan={3} className="px-2 py-2.5 text-center font-black text-emerald-700">{k.rates[0].r}%</td>
                      : k.rates.map((r) => <td key={String(r.upto)} className="px-1 py-2.5 text-right font-black text-orange-700">{r.r}%</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-slate-600">{O.kasanNote}</p>
          <div className="rounded-2xl bg-emerald-50 p-3.5 ring-1 ring-emerald-200">
            <p className="text-[15px] font-black text-emerald-900">{O.menjo.h}</p>
            <p className="text-[13px] text-emerald-900">{O.menjo.d}</p>
          </div>
          <p className={SRC}>出典：{src(['nta2024', 'tsusokuHo'])}（{checked} 確認。加算税の割合は国税通則法の決まりで、相続税にも同じく使われます）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsumazuki">
          <h2 id="tsumazuki" className={H2}>期限を過ぎた申告で損をしやすい所</h2>
          <ul className="grid gap-2">
            {O.tsumazuki.map((t) => (
              <li key={t.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{t.h}</span><span className="text-[13px] text-slate-600">{t.d}</span></span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(O.tsumazuki.map((t) => t.src))}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="maniawanai">
          <h2 id="maniawanai" className={H2}>期限に間に合わない・一度に納められないとき</h2>
          <ul className="grid gap-2">
            {[
              { h: '分け方が決まらない', d: DATA.jibun.steps.find((s) => s.key === 'bunkatsu')!.d },
              ...DATA.jibun.nofu.filter((t) => t.h === '延納・物納'),
            ].map((t) => (
              <li key={t.h} className="flex flex-col gap-0.5 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="text-[15px] font-black text-slate-900">{t.h}</span>
                <span className="text-[13px] text-slate-600">{t.d}</span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['nta4202', 'ntaShikataNofu'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>次にすること</h2>
          <ol className="grid gap-2">
            {[
              { h: '相続税がいくらかの目安を出す', s: '延滞税のもとになる税額', href: '/guide/souzoku/souzokuzei-keisan' },
              { h: '特例で0円になる人か確かめる', s: '0円でも申告が要るかの判定', href: '/guide/souzoku/zero-en-shinkoku' },
              { h: '申告書を作る順を確かめる', s: '第9表から第1表まで', href: '/guide/souzoku/shinkoku-jibun' },
              { h: '要る書類をそろえる', s: '状況を選ぶと一覧に', href: '/guide/souzoku/shinkoku-shorui-checklist' },
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
