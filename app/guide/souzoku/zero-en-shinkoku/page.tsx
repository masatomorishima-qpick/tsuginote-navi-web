import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CircleCheck, CircleX, ListChecks } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import ZeroShinkokuCheck from '@/components/souzoku/ZeroShinkokuCheck';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の0円申告（2026-11-17 作成。docs/seisaku-queue.md の T39）。
 * 受ける言葉：相続税 0円申告 書き方（主）・相続税 申告 税額0・小規模宅地 申告しないと・配偶者 相続税 申告 必要。
 *   上位5件（11/17、WebSearch で顔ぶれ、web-fetch で本文。Chrome につながらず）：1 税理士への質問サイト（2017、残高0円の口座の話で意図違い）
 *   2 弁護士の情報媒体（2026/2、書く順の表あり。記載例は平成30年度版）3 税理士の紹介会社の媒体（2025/6、配偶者だけの相続。出典なし）
 *   4 大手税理士法人の媒体（2025/8、申告書全体の書き方）5 相続専門の税理士法人（申告書全体の記入例。令和7年分用）。
 *   上位が答えている疑問：特例を使えば0円でも申告が要る・期限10か月・必要書類・書く順。
 *   上位に欠けている点：①入れると申告が要るか・0円申告かが分かる道具がない ②0円申告に要る表だけを並べたものがない
 *   ③期限を日付で出すものがない ④国税庁の判定コーナーが「不要」と誤って出る例に触れたものがない ⑤配布物がない。
 * 出口：相続アシスト（申告をまとめて代行）。
 */
const LP_ID = 'guide-souzoku-zero-en-shinkoku';
const PATH = '/guide/souzoku/zero-en-shinkoku';
const TITLE = '相続税の0円申告の書き方｜要るかの判定と作る表・書類の一覧（無料）';
const DESCRIPTION = '配偶者の税額の軽減や小規模宅地等の特例で相続税が0円になっても、特例を使う前の遺産が基礎控除を超えるなら申告が要ります。遺産額と相続人の数を入れると要るかを判定し、作る表・付ける書類・期限の日付まで出します。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const Z = DATA.zero;
const FAQS = [
  { q: '相続税が0円でも申告は必要ですか？', a: '特例を使って0円になるなら必要です。配偶者の税額の軽減と小規模宅地等の特例は、申告書に書いて出すことが使う条件です。特例を使う前の遺産の額が基礎控除（3,000万円＋600万円×法定相続人の数）以下なら、申告も納税も要りません（国税庁 No.4124・No.4158・No.4205）。' },
  { q: '0円申告をしないとどうなりますか？', a: '特例は申告書に書いて出すことが使う条件なので、出さないままでは特例が使えません。期限までに申告しないと、加算税や延滞税がかかる場合があります（国税庁 No.4124・No.4205）。期限を過ぎていたら、気づいた時点ですぐ申告します。納める税額が0円なら、延滞税と無申告加算税も0円です（どちらも納める税額をもとに計算するため）。' },
  { q: '配偶者だけが相続するときも申告は必要ですか？', a: '遺産が基礎控除を超えるなら必要です。配偶者の税額の軽減で0円になっても、軽減の明細を書いた申告書に、戸籍謄本や遺言書・遺産分割協議書の写しなどを付けて出します（国税庁 No.4158）。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = Z.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相続税の0円申告', faqs: FAQS, date: Z.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-17" path={PATH} eyebrow="相続税の申告"
        title={<>相続税の0円申告の書き方<br /><span className="text-orange-600">特例で0円でも、基礎控除を超えたら申告</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{Z.kotae}<span className="text-[11px] text-slate-500">（国税庁 No.4124・No.4158・No.4205）</span></p>
            <ZeroShinkokuCheck lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="0円でも、土地の評価と特例の表づくりは手間がかかる。申告をまとめて任せられる" />
            <SouzokuDownload icon={ListChecks} h="0円申告のチェックリスト" s="判定・期限の日付・作る表と書類に「○」を付けて使う" files={SOUZOKU_FILES.zero} />
          </div>
        }
        partner="souzokuAssist" exitLead="0円申告も含めて、相続税の申告をまとめて任せる" faqs={FAQS} updated="2026年11月17日"
      >
        <section className={SECTION} aria-labelledby="iru">
          <h2 id="iru" className={H2}>0円申告が要る人・要らない人</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-3 py-2 text-left font-bold">特例を使う前の遺産の額</th><th className="w-[38%] px-2 py-2 text-left font-bold">申告</th></tr>
              </thead>
              <tbody>
                {Z.hantei.map((x) => (
                  <tr key={x.key} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2.5 text-slate-800">{x.d}</td>
                    <td className="px-2 py-2.5">
                      {x.key === 'fuyo'
                        ? <span className="flex items-center gap-1 font-black text-emerald-700"><CircleX size={16} aria-hidden="true" />{x.h}</span>
                        : <span className="flex items-center gap-1 font-black text-orange-700"><CircleCheck size={16} aria-hidden="true" />{x.h}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">基礎控除は 3,000万円＋600万円×法定相続人の数。相続人が配偶者と子2人なら4,800万円です。</p>
          <p className={SRC}>出典：{src(['nta4102r8', 'nta4205r8', 'nta4124', 'nta4158r8'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tokurei">
          <h2 id="tokurei" className={H2}>税額が0円になる2つの特例</h2>
          <ul className="grid gap-2">
            {Z.tokurei.map((t) => (
              <li key={t.key} className="flex flex-col gap-0.5 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="text-[15px] font-black text-slate-900">{t.h}</span>
                <span className="text-[13px] text-slate-600">{t.s}</span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-slate-700">どちらも、期限までに分け方が決まっている財産が対象です。決まらないときは「申告期限後3年以内の分割見込書」を付けて申告し、3年以内に分ければ、分けた日の翌日から4か月以内の更正の請求で使えます。</p>
          <p className={SRC}>出典：{src(['nta4158r8', 'nta4124'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="hyo">
          <h2 id="hyo" className={H2}>0円申告で作る申告書の表</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="w-8 px-2 py-2 text-left font-bold">順</th><th className="px-2 py-2 text-left font-bold">表</th><th className="w-[30%] px-2 py-2 text-left font-bold">作るとき</th></tr>
              </thead>
              <tbody>
                {Z.hyo.map((x, i) => (
                  <tr key={x.no} className="border-t border-slate-100 align-top">
                    <td className="px-2 py-2.5 font-black text-slate-400">{i + 1}</td>
                    <td className="px-2 py-2.5"><span className="font-bold text-slate-900">{x.no}</span><span className="block text-[11px] text-slate-500">{x.h}</span></td>
                    <td className="px-2 py-2.5 text-[12px] text-slate-700">{x.when === 'always' ? '必ず' : x.when === 'takuchi' ? '小規模宅地等の特例' : x.when === 'haigusha' ? '配偶者の税額の軽減' : '借金・葬式費用'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">第1表の「納付すべき税額」が0円になります。{Z.hyoNote}</p>
          <p className={SRC}>出典：{src(['ntaShikataKisai', 'ntaShoruiIchiran', 'ntaYoshikiR08'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsumazuki">
          <h2 id="tsumazuki" className={H2}>0円申告で間違えやすい所</h2>
          <ul className="grid gap-2">
            {Z.tsumazuki.map((t) => (
              <li key={t.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{t.h}</span><span className="text-[13px] text-slate-600">{t.d}</span></span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(Z.tsumazuki.map((t) => t.src))}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>次にすること</h2>
          <ol className="grid gap-2">
            {[
              { h: '相続税がかかるかの目安を出す', s: '基礎控除と相続税の総額', href: '/guide/souzoku/souzokuzei-keisan' },
              { h: '小規模宅地等の特例の書類をそろえる', s: '受け継ぐ人の形で要る書類と減る額', href: '/guide/souzoku/shokibo-takuchi-shorui' },
              { h: '申告の手順と表を作る順を確かめる', s: '第9表から第1表まで', href: '/guide/souzoku/shinkoku-jibun' },
              { h: '期限を過ぎていたら', s: '延滞税と無申告加算税を日付で計算', href: '/guide/souzoku/shinkoku-okure' },
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
