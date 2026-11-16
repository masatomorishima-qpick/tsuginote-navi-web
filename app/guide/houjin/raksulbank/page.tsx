import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, Coins, Landmark, Smartphone, Info, ShieldCheck, Gift } from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import LpViewTracker from '@/components/lp/LpViewTracker';
import HenshuNote from '@/components/guide/HenshuNote';
import HoujinExit from '@/components/houjin/HoujinExit';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import { HOUJIN_PARTNERS } from '@/lib/houjin/partners';

/**
 * ラクスルバンクの解説（2026-11-16 作成）。
 * 受ける言葉（キーワードプランナー 2025/11〜2026/10 の月平均）：ラクスルバンク 880（前年比+127%、競合 低）。
 * 上位（11/16、WebSearch「ラクスルバンク 評判 口座開設 審査」）：公式の次は、ニュース（ペイメントナビ・Web担当者Forum）、
 *   GMOあおぞらの特約（PDF）、ネット銀行の比較ブログ。審査・申し込める人・設立直後の注意をまとめた解説はない。
 * 数字と決まりは公式の記載だけ（raksulbank.com・support.raksulbank.com・GMOあおぞらの特約）。2026-11-16 確認。
 * 運営会社は GMOあおぞらネット銀行に直接申し込んで通らなかった。そのことを正直に書く（案1、11/16 オーナー決定）。
 * 出口：ラクスルバンク（A8、申込で成果）。承認されるまで href は空（出口は出ない）。
 */
const LP_ID = 'guide-houjin-raksulbank';
const PATH = '/guide/houjin/raksulbank';
const CHECKED = '2026/11/16';
const TITLE = 'ラクスルバンクとは？審査はGMOあおぞらネット銀行｜手数料・申し込める会社・設立直後の注意';
const DESCRIPTION = 'ラクスルバンクの法人口座は、GMOあおぞらネット銀行のラクスルバンク支店。審査はGMOあおぞらネット銀行が行います。他行あての振込手数料、申し込める会社（個人事業主は不可）、申込の流れ、設立直後の会社が気をつけることを公式の記載で整理。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const S = {
  top: { name: 'ラクスルバンク 公式サイト', url: 'https://raksulbank.com/' },
  faq55: { name: 'ラクスルバンク よくあるご質問「口座開設は誰でも行うことができますか？」', url: 'https://support.raksulbank.com/faq/show/55?site_domain=default' },
  faq33: { name: 'ラクスルバンク よくあるご質問「口座開設の審査にはどれくらいの時間がかかりますか？」', url: 'https://support.raksulbank.com/faq/show/33?site_domain=default' },
  faq54: { name: 'ラクスルバンク よくあるご質問「口座開設の審査基準や、申込が却下される主な理由は何ですか？」', url: 'https://support.raksulbank.com/faq/show/54?site_domain=default' },
  gmo: { name: 'GMOあおぞらネット銀行「ラクスルバンク支店に関する特約」', url: 'https://gmo-aozora.com/provision/pdf/raksul_260816.pdf' },
} as const;
type K = keyof typeof S;

const YOUTEN = [
  { icon: Landmark, h: 'GMOあおぞらネット銀行の口座', s: 'ラクスルバンク支店（専用の支店）' },
  { icon: Coins, h: '他行あての振込 1件119円', s: '税込。GMOあおぞらネット銀行あては無料' },
  { icon: Building2, h: '申し込めるのは法人だけ', s: '個人・個人事業主は申し込めない' },
  { icon: Gift, h: 'ラクスルで使えるポイント2.0%', s: 'デビットカード・ラクスルバンク支払い' },
];

const NAGARE = [
  { h: '本人確認書類と自撮り動画を送る', s: '事業内容を確かめる書類は1点から' },
  { h: '銀行担当者との面談はなし', s: '審査はGMOあおぞらネット銀行' },
  { h: 'アプリにログインして使い始める', s: 'ラクスルのアカウントでログイン' },
];

const FAQS = [
  { q: 'ラクスルバンクに個人事業主は申し込めますか？', a: '申し込めません。申し込めるのは法人（非課税法人を含む）で、ラクスルのアカウント登録も必要です。' },
  { q: 'ラクスルバンクの審査は何日かかりますか？', a: '通常1週間ほどです。平日14時までの申込は、原則としてGMOあおぞらネット銀行がその日のうちに審査します。土日祝日や申込が多いときは、当日に開設できないことがあります。' },
  { q: '審査に落ちた理由は教えてもらえますか？', a: '教えてもらえません。公式のよくある質問で、審査結果の詳細は開示しないとしています。' },
  { q: 'GMOあおぞらネット銀行と何が違いますか？', a: '口座そのものはGMOあおぞらネット銀行のラクスルバンク支店です。ラクスルのアカウントでログインし、ラクスルで使えるポイントがたまる点が違います。代表口座は1法人1口座までです。' },
];

function src(keys: K[]) {
  return keys.map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{S[k].name}</a></span>
  ));
}

const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Article', author: { '@type': 'Organization', name: 'つぎの手ナビ 編集部', url: 'https://www.tsuginotenavi.jp/policy#ayamari' }, publisher: { '@id': 'https://www.tsuginotenavi.jp/#organization' }, headline: TITLE, description: DESCRIPTION, inLanguage: 'ja', datePublished: '2026-11-16T19:00:00+09:00', dateModified: '2026-11-16T19:00:00+09:00', mainEntityOfPage: `${SITE_URL}${PATH}`, about: { '@type': 'Service', name: 'ラクスルバンク', provider: { '@type': 'Organization', name: 'ラクスルバンク株式会社' } }, mentions: [{ '@type': 'BankOrCreditUnion', name: 'GMOあおぞらネット銀行' }] },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: '法人成り', item: `${SITE_URL}/guide/houjin` },
      { '@type': 'ListItem', position: 3, name: 'ラクスルバンク', item: `${SITE_URL}${PATH}` },
    ] },
    { '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
};

export default function Page() {
  const hasExit = !!HOUJIN_PARTNERS.raksulBank.href;
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version="v1-2026-11-16" />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-16">
        {hasExit && (
          <p className="-mb-10 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
            <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
            <span>当サイトは紹介料を受け取っています</span>
            <Link href="/policy" className="text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
          </p>
        )}
        <nav aria-label="現在の位置" className="-mb-10 text-[12px] text-slate-500">
          <Link href="/" className="underline underline-offset-2">ホーム</Link><span className="mx-1.5">/</span>
          <Link href="/guide/houjin" className="underline underline-offset-2">法人成り</Link><span className="mx-1.5">/</span>
          <span>ラクスルバンク</span>
        </nav>

        <section className="flex flex-col gap-5" aria-labelledby="top">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-bold text-sky-700">法人口座</p>
            <h1 id="top" className="text-[28px] font-black leading-tight text-slate-900">ラクスルバンク<br /><span className="text-[22px] text-orange-600">審査と手数料、申し込む前に</span></h1>
          </div>
          <ul className="grid grid-cols-2 gap-2">
            {YOUTEN.map(({ icon: I, h, s }) => (
              <li key={h} className="flex flex-col gap-1.5 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <I size={20} className="text-sky-700" aria-hidden="true" />
                <span className="text-[14px] font-black leading-snug text-slate-900">{h}</span>
                <span className="text-[11px] text-slate-600">{s}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-slate-800 ring-1 ring-slate-200">
            <span className="mb-1 block text-[12px] font-black text-sky-700">結論</span>
            ラクスルバンクの法人口座は、GMOあおぞらネット銀行のラクスルバンク支店です。審査もGMOあおぞらネット銀行が行います。振込の多い会社の、支払い用の口座に向いています。
          </p>
          <p className={SRC}>出典：{src(['top', 'faq55', 'gmo'])}（{CHECKED} 確認）</p>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="shinsa">
          <h2 id="shinsa" className={H2}>ラクスルバンクの審査</h2>
          <ul className="grid gap-2">
            {[
              { h: '審査はGMOあおぞらネット銀行', d: '平日14時までの申込は、原則としてその日のうちに審査します。' },
              { h: 'ふだんは1週間ほど', d: '土日祝日や申込が多いときは、当日に開設できないことがあります。' },
              { h: '落ちた理由は教えてもらえない', d: '審査結果の詳細は開示しない、としています。' },
            ].map((c) => (
              <li key={c.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col gap-0.5"><span className="text-[15px] font-black text-slate-900">{c.h}</span><span className="text-[13px] leading-relaxed text-slate-600">{c.d}</span></span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['faq33', 'faq54'])}（{CHECKED} 確認）</p>
          <Link href="/guide/houjin/kouza-hitsuyou-shorui" className="flex items-center gap-1 text-[13px] font-bold text-sky-800 underline underline-offset-2">法人口座の必要書類：銀行4つの比較<ArrowRight size={14} aria-hidden="true" /></Link>
          <Link href="/guide/houjin/kouza-kaisetsu-kikan" className="flex items-center gap-1 text-[13px] font-bold text-sky-800 underline underline-offset-2">法人口座の開設期間：銀行ごとの日数と実例<ArrowRight size={14} aria-hidden="true" /></Link>
          <div className="flex flex-col gap-2 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <p className="flex items-center gap-2 text-[15px] font-black text-amber-900"><Info size={18} aria-hidden="true" />運営会社の実例</p>
            <p className="text-[13px] leading-relaxed text-amber-950">設立直後・本店がバーチャルオフィスの時点で、GMOあおぞらネット銀行に直接申し込み、通りませんでした。ラクスルバンクには申し込んでいません。同じ審査かどうかは公表されていないため、分かりません。</p>
            <Link href="/guide/houjin/kouza-tsukurenai" className="flex items-center gap-1 text-[13px] font-bold text-sky-800 underline underline-offset-2">3行に申し込んだ結果と日付<ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="nagare">
          <h2 id="nagare" className={H2}>ラクスルバンクの申込の流れ</h2>
          <ol className="flex flex-col">
            {NAGARE.map((n, i) => (
              <li key={n.h} className="flex gap-3">
                <span className="flex flex-col items-center">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[14px] font-black text-white">{i + 1}</span>
                  {i < NAGARE.length - 1 && <span className="w-0.5 flex-1 bg-sky-200" />}
                </span>
                <span className="flex flex-col pb-5 pt-1">
                  <span className="text-[15px] font-black text-slate-900">{n.h}</span>
                  <span className="text-[13px] text-slate-600">{n.s}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="flex items-start gap-2 text-[13px] text-slate-700"><Smartphone size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />最短当日の開設は、取引責任者と代表者が同じ人のときです。</p>
          <p className={SRC}>出典：{src(['top', 'faq55'])}（{CHECKED} 確認）</p>
        </section>

        <section className="flex flex-col gap-5" aria-labelledby="muki">
          <h2 id="muki" className={H2}>向いている会社・申し込めない人</h2>
          <div className="grid gap-2">
            <div className="flex flex-col gap-1.5 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
              <p className="text-[15px] font-black text-emerald-900">向いている</p>
              <ul className="flex flex-col gap-1 text-[13px] leading-relaxed text-emerald-950">
                <li>・他の銀行あての振込が多い会社</li>
                <li>・今の銀行はそのままで、支払い用の口座を足したい会社</li>
                <li>・ラクスルで印刷や広告を頼む会社</li>
              </ul>
            </div>
            <div className="flex flex-col gap-1.5 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <p className="text-[15px] font-black text-slate-900">申し込めない</p>
              <ul className="flex flex-col gap-1 text-[13px] leading-relaxed text-slate-700">
                <li>・個人・個人事業主（会社にしてから）</li>
                <li>・日本国外に住んでいる人、住む予定の人</li>
                <li>・すでにラクスルバンク支店の代表口座がある会社（1法人1口座）</li>
              </ul>
            </div>
          </div>
          <p className={SRC}>出典：{src(['top', 'faq55', 'gmo'])}（{CHECKED} 確認）</p>
        </section>

        {hasExit && (
          <section className="flex flex-col gap-5" aria-labelledby="exit">
            <h2 id="exit" className="sr-only">申込先</h2>
            <HoujinExit
              lpId={LP_ID} partner="raksulBank" position="bottom" lead="支払い用の法人口座を足すなら"
              note="審査はGMOあおぞらネット銀行です。私たちは設立直後に、GMOあおぞらネット銀行に直接申し込んで通りませんでした。それを知ったうえで、申込先の一つとして載せています。"
            />
          </section>
        )}

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
          <p className={SRC}>出典：{src(['faq55', 'faq33', 'faq54', 'gmo'])}（{CHECKED} 確認）</p>
        </section>

        <Link href="/guide/houjin" className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
          <span className="flex flex-1 flex-col"><span className="text-[15px] font-black text-slate-900">法人成りのページ一覧</span><span className="text-[12px] text-slate-600">設立から口座まで、つまずいた所</span></span>
          <ArrowRight size={18} className="text-sky-700" aria-hidden="true" />
        </Link>

        <HenshuNote />
        <p className="text-[11px] leading-relaxed text-slate-400">
          手数料・申込の条件はラクスルバンクとGMOあおぞらネット銀行の公式の記載（2026年11月16日 確認）です。変わることがあるため、申し込む前に公式で確かめてください。最終更新：2026年11月16日
        </p>
      </main>
      <LpFooter />
    </div>
  );
}
