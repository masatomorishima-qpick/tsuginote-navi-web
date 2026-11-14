import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Calculator, CheckCircle2 } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import SeizenKasanCalc from '@/components/souzoku/SeizenKasanCalc';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 生前贈与加算（7年）の計算（2026-11-15 作成。docs/seisaku-queue.md の T23）。
 * 受ける言葉：生前贈与加算 7年 計算（主）・相続開始前贈与 加算・生前贈与 7年 いつから・100万円 控除。
 *   上位5件（11/15、WebSearch。Chrome につながらず）：1 税理士法人レガシィ（2026/10 更新、税額の計算例）2 税理士法人チェスター（2026/9）
 *   3 税理士法人AOIみらい（2026/11 更新）4 山田＆パートナーズ（2023 の改正速報、更新日なし）5 個人の note（2026/7）。
 *   7位 情報媒体（亡くなる年別の表）、8位 札幌の会計事務所（3項目を入れる計算の道具）。
 *   上位に欠けている点：①亡くなった日と贈与の日・額を入れると、期間の内外・3年以内かを自動で分けて足し戻す額が出る道具がない
 *   （8位の道具は合計を自分で振り分ける）②期間の始まりを「日」で示すものがない ③エクセルがない ④国税庁の確認日つきの出典が少ない。
 * 出口：相続アシスト（申告をまとめて代行）。
 */
const LP_ID = 'guide-souzoku-seizen-kasan';
const PATH = '/guide/souzoku/seizen-zouyo-kasan';
const TITLE = '生前贈与加算の計算｜7年はいつから？足す額を自動計算（無料・エクセル）';
const DESCRIPTION = '生前贈与加算は、2026年12月31日までに亡くなれば3年以内、2027〜2030年は2024年1月1日以後、2031年から7年以内の贈与を足し戻します。亡くなった日と贈与の日・額を入れると、100万円の控除も入れた足す額が出ます。無料のエクセル付き。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const D = DATA.seizen;
const FAQS = [
  { q: '生前贈与の7年ルールはいつから適用されますか？', a: '2024年（令和6年）1月1日以後の贈与から対象です。足す期間が実際に3年より長くなるのは2027年1月1日以後に亡くなった場合で、7年すべてになるのは2031年1月1日以後に亡くなった場合です（国税庁 No.4161）。' },
  { q: '年110万円以下の贈与も相続財産に加算されますか？', a: 'はい。足す期間の中の贈与なら、贈与税がかからなかった年110万円以下の分も足します。ただし、相続や遺贈で財産を受け取らない人への贈与は足しません（国税庁 No.4161）。' },
  { q: '100万円の控除は毎年使えますか？', a: 'いいえ。亡くなる前3年以内より前に受け取った分の合計から、総額で100万円まで引けます。2027年1月2日以後に亡くなった場合に使えます（国税庁 No.4161）。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = D.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '生前贈与加算の計算', faqs: FAQS, date: D.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-15" path={PATH} eyebrow="相続税と生前の贈与"
        title={<>生前贈与加算の計算<br /><span className="text-orange-600">7年は2031年から</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{D.kotae}<span className="text-[11px] text-slate-500">（国税庁 No.4161）</span></p>
            <SeizenKasanCalc lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="足す額が出たら、相続税の申告はまとめて任せられる" />
            <SouzokuDownload icon={Calculator} h="生前贈与加算の計算表" s="亡くなった日と贈与を入れると自動で振り分け" files={SOUZOKU_FILES.seizen} />
          </div>
        }
        partner="souzokuAssist" exitLead="贈与の記録がそろったら、申告はまとめて任せる" faqs={FAQS} updated="2026年11月15日"
      >
        <section className={SECTION} aria-labelledby="kikan">
          <h2 id="kikan" className={H2}>亡くなった日ごとの加算の期間（3年から7年へ）</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-2 py-2 text-left font-bold">亡くなった日</th><th className="px-2 py-2 text-left font-bold">足す贈与の期間</th><th className="px-2 py-2 text-left font-bold">100万円の控除</th></tr>
              </thead>
              <tbody>
                {D.kikan.map((k) => (
                  <tr key={k.h} className="border-t border-slate-100 align-top">
                    <td className="px-2 py-2.5 font-black text-slate-900">{k.h}</td>
                    <td className="px-2 py-2.5 font-bold text-orange-700">{k.kikan}</td>
                    <td className="px-2 py-2.5 text-[12px] text-slate-600">{k.hyaku}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="rounded-2xl bg-sky-50 p-3.5 text-[13px] leading-relaxed text-sky-900 ring-1 ring-sky-200">{D.hyaku}。100万円は、贈与を受けた人ごとの合計から引きます。</p>
          <p className="text-[12px] leading-relaxed text-slate-600">{D.kazoe}。</p>
          <p className={SRC}>出典：{src(['nta4161'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="rei">
          <h2 id="rei" className={H2}>計算の例</h2>
          <p className="text-[13px] text-slate-700">{D.reiGifts}。</p>
          <ul className="grid gap-2">
            {D.rei.map((r) => (
              <li key={r.shibou} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="text-[14px] font-bold text-slate-800">{r.note}</span>
                <span className="shrink-0 text-[16px] font-black text-orange-700">{(r.kasan / 10000).toLocaleString('ja-JP')}万円</span>
              </li>
            ))}
          </ul>
          <p className="text-[12px] leading-relaxed text-slate-600">2026年は3年以内の2年前・1年前の分だけ。2028年は2024年1月1日より前の分を除き、4年前の200万円から100万円を引く。2031年は3年以内の300万円と、それより前の500万円から100万円を引いた400万円。</p>
          <p className={SRC}>出典：{src(['nta4161'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="kimari">
          <h2 id="kimari" className={H2}>加算する人・しない贈与</h2>
          <ul className="grid gap-2">
            {D.rules.map((t) => (
              <li key={t.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{t.h}</span><span className="text-[13px] text-slate-600">{t.d}</span></span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-slate-700">{D.seisan}。</p>
          <p className={SRC}>出典：{src(['nta4161', 'nta4103'])}（{checked} 確認）</p>
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
              { h: '贈与の記録を集める', s: '通帳・贈与税の申告書の控えを、亡くなった人の財産と一緒に', href: '/guide/souzoku/zaisan-shirabekata' },
              { h: '足した額で相続税を計算する', s: '基礎控除を超えるかの目安', href: '/guide/souzoku/souzokuzei-keisan' },
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
