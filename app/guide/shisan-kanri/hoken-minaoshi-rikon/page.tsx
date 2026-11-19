import type { Metadata } from 'next';
import Link from 'next/link';
import HenshuNote from '@/components/guide/HenshuNote';
import { ArrowRight, Download, FileSpreadsheet, FileText, Info } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import HokenSoudanBox from '@/components/guide/HokenSoudanBox';
import RikonHoshoCalc from '@/components/guide/RikonHoshoCalc';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * 離婚したときの保険の見直し（2026-11-20 作成。docs/seisaku-queue.md の T35）。
 * 受ける言葉：離婚 生命保険 見直し（主）・離婚 保険 受取人・離婚後 死亡保障・シングルマザー 生命保険 必要額。
 *   上位5件（11/20、WebSearch。Chrome につながらず）：1 All About（再婚の記事）2 ファイナンシャルフィールド（2025更新）
 *   3 マネーフォワードの媒体（2020）4 Oggi（2019）5 お金の健康診断（保険比較サイト、2025）。
 *   上位が答えている疑問：受取人を変えるか・解約か継続か・子の有無で保障を増減するか・健康状態で入り直せないこと。
 *   上位に欠けている点：①子に生計を同じくする父または母がいると子に遺族基礎年金が支給されない（日本年金機構）ことと、
 *   2028年4月の見直し（厚生労働省）、それを入れた必要額の計算 ②年金分割の請求期限（令和8年4月から5年）③一次情報の出典と確認日 ④印刷できるチェックリスト。
 * 出口：保険見直し本舗（レントラックス 7502、新規の無料面談の完了）。
 */
const LP_ID = 'guide-hoken-rikon';
const VERSION = 'v1-2026-11-20';
const PAGE_PATH = '/guide/shisan-kanri/hoken-minaoshi-rikon';
const TITLE = '離婚したら生命保険の見直し｜受取人と必要な死亡保障を計算（無料チェックリスト）';
const DESCRIPTION = '離婚したときの生命保険の見直しで確かめる8つの点を1枚にした無料のチェックリスト（エクセル・PDF）。受取人の変え方、元配偶者が子と暮らすと子に遺族基礎年金が出ない決まり（2028年4月に見直し予定）、子の生年月日から必要な死亡保障を出す計算も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const P = DATA.rikon;
const POINTS_BOX = ['相談は無料', 'このチェックリストと保険証券を見せると、話を進めやすい', '保障の額と続け方を、専門の相談員と確かめる'];
const FAQS = [
  { q: '離婚したら生命保険の受取人はどうなりますか？', a: '受取人は、原則として契約者が保険会社に届け出て変えます。保険期間中なら変えられ、被保険者の同意が要ります。亡くなったあとは変えられません。変更の知らせが保険会社に届く前に元の受取人に支払われると、あとから請求しても支払われないので、離婚したら早めに届け出ます（生命保険文化センター）。' },
  { q: '離婚したら生命保険は解約したほうがいいですか？', a: '解約は、新しい保障が決まってからにします。解約した保険は元に戻せず、年齢が上がって保険料が割高になることや、健康状態によって新しく入れないことがあります。受取人を変えて続ける、保障の額を減らす、といった方法もあります（生命保険文化センター）。' },
  { q: '離婚後に親が亡くなったら、子どもは遺族年金をもらえますか？', a: 'いまの決まりでは、元配偶者が子を引き取って一緒に暮らすと、子に遺族基礎年金は支給されません（日本年金機構）。祖父母などが育てるなら、子が18歳になった年度の3月31日まで受け取れます。2028年4月からは、父または母と一緒に暮らしていても子が受け取れるように見直される予定です（厚生労働省）。会社員・公務員だった親なら、子に遺族厚生年金が出ることもあります。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: { '@type': 'Organization', name: 'つぎの手ナビ 編集部', url: 'https://www.tsuginotenavi.jp/policy#ayamari' }, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', datePublished: '2026-11-20T09:00:00+09:00', dateModified: '2026-11-20T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '保険・お金の管理', item: `${SITE_URL}/guide/shisan-kanri` },
      { '@type': 'ListItem', position: 3, name: '離婚したときの保険の見直し', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const FILES = [
  { label: 'エクセル', href: '/downloads/hoken-minaoshi-rikon.xlsx', icon: FileSpreadsheet },
  { label: 'PDF', href: '/downloads/hoken-minaoshi-rikon.pdf', icon: FileText },
];
const FLOW = [
  { h: '保険の一覧表', s: '自分の保険を1枚に書き出す', href: '/guide/shisan-kanri/hoken-ichiran-excel' },
  { h: '保険証券の見方', s: '受取人と契約者を確かめる', href: '/guide/shisan-kanri/hoken-shoken-mikata' },
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
            <p className="text-[13px] font-bold text-sky-700">保険の見直し・離婚</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">離婚したら<br />生命保険の見直し<br />チェックリスト<br /><span className="text-[20px] text-orange-600">受取人と必要な死亡保障</span></h1>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-800">{P.kotae}<span className="text-[11px] text-slate-500">（生命保険文化センター・日本年金機構）</span></p>
          <RikonHoshoCalc lpId={LP_ID} />
          <HokenSoudanBox lpId={LP_ID} position="hero" lead="必要な額が出たら、保障の額と続け方を無料で相談" points={POINTS_BOX} />
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-white p-4">
            <p className="text-[15px] font-black text-slate-900">印刷して使うチェックリスト<span className="ml-1.5 text-[12px] font-bold text-sky-700">無料</span></p>
            <div className="flex gap-2">
              {FILES.map(({ label, href, icon: FI }) => (
                <a key={href} href={href} download className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-3 text-[15px] font-bold text-white hover:bg-sky-800">
                  <FI size={18} aria-hidden="true" />{label}<Download size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">登録やメールアドレスの入力は要りません。エクセルは子の生年月日と生活費を入れると、必要な死亡保障の目安が出ます</p>
          </div>
        </section>

        <section className={SECTION} aria-labelledby="uketori">
          <h2 id="uketori" className={H2}>離婚したときの生命保険の受取人</h2>
          <ol className="grid gap-2">
            {[
              { h: '保険証券で受取人を見る', d: '元配偶者のままになっていないか。夫婦で入った保険は、契約者も確かめる' },
              { h: '契約者が保険会社に届け出る', d: '受取人を変えられるのは、原則として契約者。保険期間中なら変えられ、被保険者の同意が要る。亡くなったあとは変えられない' },
              { h: '保険会社に知らせが届くまで', d: '知らせが届く前に元の受取人に支払われると、あとから新しい受取人が請求しても支払われない。早めに届け出る' },
            ].map((x, i) => (
              <li key={x.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] font-black text-white">{i + 1}</span>
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{x.h}</span><span className="text-[13px] text-slate-600">{x.d}</span></span>
              </li>
            ))}
          </ol>
          <p className={SRC}>出典：{src(['jiliShohenkou'])}（{checked} 確認）。手続きの扱いは保険会社によって違います</p>
        </section>

        <section className={SECTION} aria-labelledby="izoku">
          <h2 id="izoku" className={H2}>離婚後の子どもの遺族年金</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[12px] text-slate-600"><tr><th className="px-3 py-2 text-left font-bold">自分が亡くなったあと、子を育てるのは</th><th className="w-[42%] px-3 py-2 text-left font-bold">子の遺族基礎年金</th></tr></thead>
              <tbody>
                <tr className="border-t border-slate-100 align-top"><td className="px-3 py-2.5 text-slate-800">元配偶者（子の父または母）。引き取って一緒に暮らす</td><td className="px-3 py-2.5 font-black text-orange-700">いまは支給されない<span className="block text-[12px] font-bold text-slate-700">2028年4月から子に出る予定</span></td></tr>
                <tr className="border-t border-slate-100 align-top"><td className="px-3 py-2.5 text-slate-800">祖父母など、子の父母でない人</td><td className="px-3 py-2.5 font-black text-slate-900">子に出る（要件を満たすとき。{P.izoku.nendo} 子1人で年{P.izoku.base.toLocaleString('ja-JP')}円）</td></tr>
              </tbody>
            </table>
          </div>
          <ul className="grid gap-2">
            {P.izokuNote.map((t) => (
              <li key={t} className="flex items-start gap-2.5 rounded-2xl bg-white p-3.5 text-[14px] text-slate-800 ring-1 ring-slate-200">
                <Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{t}
              </li>
            ))}
          </ul>
          <p className="text-[14px] text-slate-800">{P.hitsuyo}</p>
          <p className={SRC}>出典：{src(['nenkinIzokuKisoR8', 'mhlwKaiseiGaiyo', 'jiliIzokuMinaoshi', 'jiliHitsuyo'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="check">
          <h2 id="check" className={H2}>離婚したときの生命保険の見直しで確かめる8つの点</h2>
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

        <HokenSoudanBox lpId={LP_ID} position="bottom" lead="チェックが済んだら、ひとりで抱えずに無料の見直し相談" points={POINTS_BOX} beacon />

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
        <p className="text-[11px] leading-relaxed text-slate-400">チェックリストと計算は見直しの前に確かめるための目安です。遺族年金と年金分割は年金事務所で、受取人と保障の中身は保険会社で確かめてください。最終更新：2026年11月20日</p>
      </main>
      <LpFooter />
    </div>
  );
}
