import type { Metadata } from 'next';
import Link from 'next/link';
import HenshuNote from '@/components/guide/HenshuNote';
import { ArrowRight, Download, FileSpreadsheet, FileText } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import HokenSoudanBox from '@/components/guide/HokenSoudanBox';
import GanMinaoshiCheck from '@/components/guide/GanMinaoshiCheck';
import DATA from '@/lib/hoken/haifu-data.json';

/**
 * がん保険の見直しチェックリスト（2026-11-21 作成。docs/seisaku-queue.md の T37）。
 * 受ける言葉：がん保険 見直し チェックリスト（主）・がん保険 見直し ポイント・がん保険 乗り換え 注意。
 *   上位5件（11/21、WebSearch。Chrome につながらず）：1 オカネコ（保険比較サイト、2025/4）2 マネーキャリア（相談サービスの記事）
 *   3 マネーフォワードの媒体（2022）4 週刊女性PRIME（2023）5 価格.com 保険（生命保険全般、2026/9）。
 *   上位が答えている疑問：見直しは必要か・いつ見直すか／通院中心への変化／乗り換えの待ち期間と保障の空白／告知で入れないこと／
 *   年齢で保険料が上がる／上皮内新生物／診断給付金の回数。
 *   上位に欠けている点：①印刷できるチェックリスト（5件とも箇条書きだけ）②証券を見て答えると確かめる点が出る道具
 *   ③待ち期間の終わりの目安を契約日から出す計算 ④生命保険文化センター・厚生労働省の一次情報と確認日（5件とも生命保険文化センターの出典なし）
 *   ⑤先進医療の技術料の平均額の表。
 * 出口：保険見直し本舗（レントラックス 7502、新規の無料面談の完了）。
 */
const LP_ID = 'guide-hoken-gan';
const VERSION = 'v1-2026-11-21';
const PAGE_PATH = '/guide/shisan-kanri/hoken-minaoshi-gan';
const TITLE = 'がん保険の見直しチェックリスト｜証券・約款で確かめる10の点（無料・エクセル/PDF）';
const DESCRIPTION = 'がん保険の見直しで確かめる10の点をまとめた無料のチェックリスト（エクセル・PDF）。証券・約款を見て6つの問いに答えると見直す点が出ます。診断給付金の回数、通院・抗がん剤、先進医療の費用、乗り換えの待ち期間（一般に90日）の目安の計算も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PAGE_PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const P = DATA.gan;
const POINTS_BOX = ['相談は無料', 'このチェックリストと保険証券を見せると、話を進めやすい', '続けるか、足すか、乗り換えるかを専門の相談員と確かめる'];
const FAQS = [
  { q: 'がん保険は見直したほうがいいですか？', a: '入ってから年数がたったがん保険は、保険証券で中身を確かめる価値があります。診断給付金は1回だけのものと複数回受け取れるものがあり、通院の給付金は、がんで入院し退院後に通院したときが対象と説明されています（生命保険文化センター）。令和5年9月に退院した人のがんの平均在院日数は14.4日（厚生労働省 患者調査）で、入院の日数だけでなく通院や抗がん剤治療の保障を確かめます。' },
  { q: 'がん保険を乗り換えるときの注意点は？', a: '新しいがん保険には、一般的に契約から90日の待ち期間があり、その間にがんと診断されても保障されません（生命保険文化センター）。また、解約した保険は元に戻せず、年齢が上がって保険料が割高になることや、健康状態によって新しく入れないことがあります。古い契約の解約は新しい契約が成立してからにし、がん保険は待ち期間が明けて新しい契約の保障が始まる日を過ぎてからが安心です。' },
  { q: '先進医療の保障は必要ですか？', a: '先進医療の技術料は公的医療保険の対象外で、全額自己負担です。技術料の1件あたりの平均は、陽子線治療が約278万円、重粒子線治療が約319万円です（生命保険文化センター。令和7年6月30日時点）。いまの契約に先進医療の保障があるかを、保険証券で確かめます。' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: { '@type': 'Organization', name: 'つぎの手ナビ 編集部', url: 'https://www.tsuginotenavi.jp/policy#ayamari' }, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', datePublished: '2026-11-21T09:00:00+09:00', dateModified: '2026-11-21T09:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PAGE_PATH}` },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '保険・お金の管理', item: `${SITE_URL}/guide/shisan-kanri` },
      { '@type': 'ListItem', position: 3, name: 'がん保険の見直しチェックリスト', item: `${SITE_URL}${PAGE_PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';
const A = 'underline underline-offset-2';
const FILES = [
  { label: 'エクセル', href: '/downloads/hoken-minaoshi-gan.xlsx', icon: FileSpreadsheet },
  { label: 'PDF', href: '/downloads/hoken-minaoshi-gan.pdf', icon: FileText },
];
const NORIKAE = [
  { h: '新しい契約を申し込む', d: '告知（健康状態の申告）をして、新しい契約が成立するのを待つ。健康状態によっては入れないことがある' },
  { h: '待ち期間が終わるのを待つ', d: '一般的に契約から90日は、がんと診断されても保障の対象にならない。古い契約はこの間も続ける' },
  { h: '古い契約を解約する', d: '新しい契約の保障が始まる日を保険証券で確かめてから。解約した保険は元に戻せない' },
];
const FLOW = [
  { h: '保険証券の見方', s: '診断給付金・特約の欄を読む', href: '/guide/shisan-kanri/hoken-shoken-mikata' },
  { h: '保険の一覧表', s: '入っている保険を1枚に書き出す', href: '/guide/shisan-kanri/hoken-ichiran-excel' },
  { h: '保険の比較表', s: 'いまの保険と見直し案の総額を並べる', href: '/guide/shisan-kanri/hoken-hikaku-excel' },
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
            <p className="text-[13px] font-bold text-sky-700">保険の見直し・がん保険</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">がん保険の<br />見直しチェックリスト<br /><span className="text-[20px] text-orange-600">証券・約款で確かめる10の点</span></h1>
          </div>
          <p className="text-[15px] leading-relaxed text-slate-800">{P.kotae}<span className="text-[11px] text-slate-500">（生命保険文化センター）</span></p>
          <GanMinaoshiCheck lpId={LP_ID} />
          <HokenSoudanBox lpId={LP_ID} position="hero" lead="見直す点が出たら、続けるか乗り換えるかを無料で相談" points={POINTS_BOX} />
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-white p-4">
            <p className="text-[15px] font-black text-slate-900">印刷して使うチェックリスト<span className="ml-1.5 text-[12px] font-bold text-sky-700">無料</span></p>
            <div className="flex gap-2">
              {FILES.map(({ label, href, icon: FI }) => (
                <a key={href} href={href} download className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-3 text-[15px] font-bold text-white hover:bg-sky-800">
                  <FI size={18} aria-hidden="true" />{label}<Download size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">登録やメールアドレスの入力は要りません。エクセルは新しい契約の契約日を入れると、保障が始まる日の目安が出ます</p>
          </div>
        </section>

        <section className={SECTION} aria-labelledby="check">
          <h2 id="check" className={H2}>がん保険の見直しで確かめる10の点</h2>
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
          <p className={SRC}>出典：{src([...P.check.map((c) => c.src), 'jiliSenshin'])}（{checked} 確認）。保障の名前と条件は保険会社・商品によって違います</p>
        </section>

        <section className={SECTION} aria-labelledby="senshin">
          <h2 id="senshin" className={H2}>先進医療の費用と、がんの入院日数</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[12px] text-slate-600"><tr><th className="px-3 py-2 text-left font-bold">先進医療</th><th className="px-3 py-2 text-right font-bold">技術料の平均</th><th className="px-3 py-2 text-right font-bold">平均入院</th></tr></thead>
              <tbody>
                {P.senshin.map((x) => (
                  <tr key={x.h} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 text-slate-800">{x.h}</td>
                    <td className="px-3 py-2.5 text-right font-black text-orange-700">{x.yen.toLocaleString('ja-JP')}円</td>
                    <td className="px-3 py-2.5 text-right text-slate-700">{x.days.toFixed(1)}日</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-slate-600">{P.senshinNote}。技術料は全額自己負担で、診察・検査・投薬・入院料など通常の治療と共通する部分には公的医療保険が使えます。</p>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="shrink-0 text-[32px] font-black leading-none text-sky-800">{P.zaiin.days}<span className="text-[15px]">日</span></p>
            <p className="text-[13px] text-slate-700">{P.zaiin.note}。入院の日数だけでなく、通院や抗がん剤治療の保障を確かめます</p>
          </div>
          <p className={SRC}>出典：{src(['jiliSenshin', 'mhlwSenshin', 'mhlwKanjaHeikin'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="norikae">
          <h2 id="norikae" className={H2}>がん保険の乗り換えの順番</h2>
          <ol className="grid gap-2">
            {NORIKAE.map((x, i) => (
              <li key={x.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] font-black text-white">{i + 1}</span>
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{x.h}</span><span className="text-[13px] text-slate-600">{x.d}</span></span>
              </li>
            ))}
          </ol>
          <p className={SRC}>出典：{src(['jiliGan', 'jiliMinaoshi'])}（{checked} 確認）。いまの契約に特約を足せるかは、保険会社に確かめます</p>
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
          <Link href="/guide/shisan-kanri/hoken-minaoshi-checklist" className="flex items-center gap-2 text-[13px] font-bold text-sky-700 underline underline-offset-2">死亡保障・医療保険もまとめた生命保険の見直しチェックリスト<ArrowRight size={14} aria-hidden="true" /></Link>
        </section>

        <HokenSoudanBox lpId={LP_ID} position="bottom" lead="チェックが済んだら、証券を持って無料の見直し相談" points={POINTS_BOX} beacon />

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
        <p className="text-[11px] leading-relaxed text-slate-400">チェックリストと計算は見直しの前に確かめるための目安です。保障の中身と待ち期間は、保険証券・約款と保険会社で確かめてください。最終更新：2026年11月21日</p>
      </main>
      <LpFooter />
    </div>
  );
}
