import type { Metadata } from 'next';
import Link from 'next/link';
import HenshuNote from '@/components/guide/HenshuNote';
import { ArrowRight, Download, FileSpreadsheet, FileText, Info } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import HokenSoudanBox from '@/components/guide/HokenSoudanBox';
import TeinenKenpoKigen from '@/components/guide/TeinenKenpoKigen';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * 定年退職のときの保険の見直しチェックリスト（2026-11-17 作成。docs/seisaku-queue.md の T29）。
 * 受ける言葉：定年退職 保険 見直し（主）・定年後 保険 見直し チェックリスト・退職後 健康保険 任意継続 期限・60代 保険 見直し。
 *   上位5件（11/17、WebSearch で顔ぶれ、web-fetch で本文。Chrome につながらず）：1 メガバンク（更新日なし、出典が2017〜2020年）
 *   2 総合情報サイト（50代のひとり暮らし向けで意図違い）3 お金の媒体（2020、古い数字）4 保険の比較サイト（2026/7）
 *   5 保険の比較サイト（2025/4、表は多いが期限なし）。
 *   上位が答えている疑問：死亡保障を減らしてよいか・医療保障をどうするか・公的制度を前提に考える・老後の生活費。
 *   上位に欠けている点：①退職日から任意継続（20日以内）と国民健康保険（14日以内）の期限を出す道具がない（期限を書いたのは0件）
 *   ②退職後の健康保険3つ（任意継続・国保・家族の扶養）を条件・期限・保険料で並べた表がない ③印刷・エクセルのチェックリストがない
 *   ④任意継続の保険料の上限（標準報酬月額32万円）など今の数字と確認日がない。
 * 出口：保険見直し本舗（レントラックス 7502、新規の無料面談の完了）。
 */
const LP_ID = 'guide-hoken-teinen';
const VERSION = 'v1-2026-11-17';
const PAGE_PATH = '/guide/shisan-kanri/hoken-minaoshi-teinen';
const TITLE = '定年退職の保険の見直しチェックリスト｜健康保険の期限も計算（無料・エクセル）';
const DESCRIPTION = '定年退職のときの保険の見直しで確かめる8つの点を1枚にした無料のチェックリスト。退職日を入れると、任意継続（20日以内）と国民健康保険（14日以内）の手続きの期限が出ます。退職後の健康保険3つの比べ方、更新・医療費の上限も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const P = DATA.teinen;
const POINTS_BOX = ['相談は無料', 'このチェックリストと保険証券を見せると、話を進めやすい', '夫婦の保険をまとめて、専門の相談員と確かめる'];
const FAQS = [
  { q: '定年後も生命保険は必要ですか？', a: '家族の暮らししだいです。必要な保障の額の目安は「遺族の支出の見込み − 遺族の収入の見込み」で、遺族年金や貯蓄は収入の見込みに入ります。子どもが独立していれば、支出の見込みは小さくなります（生命保険文化センター）。' },
  { q: '定年退職後の健康保険はどうすればいいですか？', a: '任意継続・国民健康保険・家族の被扶養者の3つから選びます。任意継続は退職日の翌日から20日以内に申し出て最長2年、国民健康保険は14日以内に市区町村へ届け出ます（協会けんぽ・名古屋市・神戸市）。' },
  { q: '任意継続の保険料はいくらですか？', a: '退職時の標準報酬月額に都道府県の保険料率をかけた額で、会社の負担分もなくなるため在職中のおよそ2倍です。標準報酬月額が32万円を超える人は32万円で計算します（協会けんぽ）。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: { '@type': 'Organization', name: 'つぎの手ナビ 編集部', url: 'https://www.tsuginotenavi.jp/policy#ayamari' }, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', datePublished: '2026-11-17T09:00:00+09:00', dateModified: '2026-11-17T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '保険・お金の管理', item: `${SITE_URL}/guide/shisan-kanri` },
      { '@type': 'ListItem', position: 3, name: '定年退職のときの保険の見直し', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const FILES = [
  { label: 'エクセル', href: '/downloads/hoken-minaoshi-teinen.xlsx', icon: FileSpreadsheet },
  { label: 'PDF', href: '/downloads/hoken-minaoshi-teinen.pdf', icon: FileText },
];
const FLOW = [
  { h: '保険の一覧表', s: '夫婦の保険を1枚に書き出す', href: '/guide/shisan-kanri/hoken-ichiran-excel' },
  { h: '保険証券の見方', s: '更新の年と払い込む年齢を確かめる', href: '/guide/shisan-kanri/hoken-shoken-mikata' },
  { h: '保険の比較表', s: '見直し案と払う総額を比べる', href: '/guide/shisan-kanri/hoken-hikaku-excel' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = P.checkedAt.split('-').join('/');
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  const groups = [...new Set(P.check.map((c) => c.g))];
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-16">
        <p className="-mb-10 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
          <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
          <span>当サイトは紹介料を受け取っています</span>
          <Link href="/policy" className="text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
        </p>
        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">保険の見直し・定年退職</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">定年退職の保険の<br />見直しチェックリスト<br /><span className="text-[20px] text-orange-600">健康保険の期限と8つの点</span></h1>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-800">{P.kotae}<span className="text-[11px] text-slate-500">（協会けんぽ・名古屋市・神戸市・生命保険文化センター・厚生労働省）</span></p>
          <TeinenKenpoKigen lpId={LP_ID} />
          <HokenSoudanBox lpId={LP_ID} position="hero" lead="健康保険の期限が分かったら、生命保険と医療保険を無料で見直し相談" points={POINTS_BOX} />
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-white p-4">
            <p className="text-[15px] font-black text-slate-900">印刷して使うチェックリスト<span className="ml-1.5 text-[12px] font-bold text-sky-700">無料</span></p>
            <div className="flex gap-2">
              {FILES.map(({ label, href, icon: FI }) => (
                <a key={href} href={href} download className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-3 text-[15px] font-bold text-white hover:bg-sky-800">
                  <FI size={18} aria-hidden="true" />{label}<Download size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">登録やメールアドレスの入力は要りません。エクセルは退職日を入れると期限が出ます</p>
          </div>
        </section>

        <section className={SECTION} aria-labelledby="kenpo">
          <h2 id="kenpo" className={H2}>定年退職後の健康保険3つ</h2>
          <div className="grid gap-2">
            {P.kenpo.map((k) => (
              <div key={k.h} className="flex flex-col gap-1.5 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <p className="text-[16px] font-black text-slate-900">{k.h}</p>
                <table className="w-full text-[13px]">
                  <tbody>
                    {[['入れる人', k.jouken], ['期限', k.kigen], ['期間', k.kikan], ['保険料', k.hokenryo]].map(([h, v]) => (
                      <tr key={h} className="border-t border-slate-100 align-top">
                        <th className="w-[22%] py-1.5 pr-2 text-left text-[12px] font-bold text-slate-500">{h}</th>
                        <td className="py-1.5 text-slate-800">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
          <ul className="grid gap-2">
            {P.ninkeiNote.map((t) => (
              <li key={t} className="flex items-start gap-2.5 rounded-2xl bg-white p-3.5 text-[14px] text-slate-800 ring-1 ring-slate-200">
                <Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{t}
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['kyoukaiNinkei', 'kyoukaiNinkeiFaq', 'kyoukaiNinkeiFaq3', 'nagoyaKokuho', 'kobeKokuho'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="check">
          <h2 id="check" className={H2}>定年退職で保険の見直しに確かめる8つの点</h2>
          {groups.map((g) => (
            <div key={g} className="flex flex-col gap-2">
              <p className="text-[13px] font-black text-sky-800">{g}</p>
              <ul className="grid gap-2">
                {P.check.filter((c) => c.g === g).map((c) => (
                  <li key={c.key} className="flex flex-col rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                    <span className="text-[15px] font-black text-slate-900">{c.h}</span>
                    <span className="text-[13px] text-slate-600">{c.d}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className={SRC}>出典：{src(P.check.map((c) => c.src))}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="junban">
          <h2 id="junban" className={H2}>次に使う表</h2>
          <ol className="grid gap-2">
            {FLOW.map((f, i) => (
              <li key={f.h}>
                <Link href={f.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] font-black text-white">{i + 1}</span>
                  <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">{f.h}</span><span className="text-[12px] text-slate-600">{f.s}</span></span>
                  <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
          <Link href="/guide/shisan-kanri/hoken-minaoshi-checklist" className="flex items-center gap-2 text-[13px] font-bold text-sky-700 underline underline-offset-2">ほかの節目もまとめた生命保険の見直しチェックリスト<ArrowRight size={14} aria-hidden="true" /></Link>
        </section>

        <HokenSoudanBox lpId={LP_ID} position="bottom" lead="チェックが済んだら、夫婦で無料の見直し相談" points={POINTS_BOX} beacon />

        <section className="flex flex-col gap-2" aria-labelledby="faq">
          <h2 id="faq" className={`${H2} mb-2`}>よくある質問</h2>
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-bold text-slate-900">
                {f.q}
                <span aria-hidden="true" className="text-xl text-slate-400 transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </section>
        <HenshuNote />
        <p className="text-[11px] leading-relaxed text-slate-400">チェックリストと期限は見直しの前に確かめるための目安です。健康保険の期限と保険料は協会けんぽ・市区町村で、保障の中身は保険会社の書面で確かめてください。最終更新：2026年11月17日</p>
      </main>
      <LpFooter />
    </div>
  );
}
