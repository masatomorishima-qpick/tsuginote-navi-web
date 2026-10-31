import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Bath, Building2, CalendarClock, CalendarCheck, CircleCheck, ClipboardCheck, Clock, CreditCard, Factory, Flame, Gauge, HardHat, Handshake, Home, Hourglass, Leaf, MapPin,
  PackageX, PhoneOff, Scale, ShieldCheck, Stethoscope, Tag, Users, Wrench,
} from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import LpViewTracker from '@/components/lp/LpViewTracker';
import PartnerLink from '@/components/kyutoki/PartnerLink';

/**
 * ガス給湯器の交換費用（記事型の着地ページ。2026-10-31 新設）。
 *
 * 役割：検索広告の「費用を知りたい・交換を決めた」層（給湯器 交換 費用／相場／24号 交換 費用 など）の着地。
 *   広告で約束した「費用の目安」を最初の画面で見せ、そのまま見積もり（GAS-Q／お湯が出ない.com）へつなぐ。
 *   診断ページ（/kyutoki/oyu-ga-denai）と半々で比べる（docs/kyutoki-pdca.md 4c）。
 *   検索からの自然流入も狙うので、本文はサーバー側で出力し、よくある質問は構造化データにも入れる。
 *
 * v2（2026-10-31）：検索広告をテールワード（住まい・メーカー・エコジョーズ・見積もりが高い など）で組み直したので、
 *   それぞれの言葉の答えになる節を足した（#sumai #maker #takai）。広告の行き先はこの節に直接つなぐ。
 * v3（2026-10-31）：紹介先を使う理由（大義名分）を3段で入れた。
 *   なぜ今（10年で部品の供給が終わる→壊れると直せない→お湯なしで待つ）、なぜこの会社（現地調査でその日に金額が決まる・
 *   後払い・補助金の申請代行）、なぜここ経由（見積もりの持ち物メモ）。ボタンは成果地点（面談＝現地調査）に合わせて
 *   「無料の現地調査を頼む」に。2社の並びは GAS-Q を主役に、お湯が出ない.com は修理の可能性を残したい人向けに下へ。
 *   GAS-Q の記載は公式サイト gas-q.jp/ad/kyutou（2026-10-31 確認）：税込88,000円〜（一部機種を除く）、見積もり無料・
 *   現地調査費用なし、在庫があればその場で工事日を決定、工事後の後払い・クレジットカード可、本体保証10年・工事保証10年、
 *   補助金申請の代行（無料）、年中無休 9〜20時、対応地域は東京・神奈川・千葉・埼玉。
 *
 * 数字の出典（2026-10-30 確認）：
 *   費用 … 東京ガス「給湯器交換」の販売価格（工事費込み・税込）と、同社の「選び方」ページの相場
 *     置き場所の差：16号オート高効率 リンナイ 壁掛 191,510／PS 194,898、ノーリツ 壁掛 193,011／PS 193,011／据置 197,138、
 *       細身（スリム）はリンナイ 236,280、ノーリツ 228,755（標準より約3.6〜4.5万円高い。PSアルコーブの細身 241,370）
 *     メーカーの差：16号オート高効率 壁掛 リンナイ 191,510／ノーリツ 193,011、24号暖房付き高効率 壁掛 290,158／295,253
 *     エコジョーズの差：16号オート 壁掛 リンナイ 163,691→191,510、ノーリツ 173,331→193,011、給湯専用 102,080→122,320／91,426→118,068
 *   寿命 … ノーリツ・リンナイ・パロマの公式（標準使用期間10年）、ノーリツ（修理部品の保有期間 7〜10年）
 *   点検商法 … 国民生活センター 2024-02-21 発表
 *   紹介先 … 各社の公式サイトの記載（GAS-Q：gas-q.jp/ad/kyutou、お湯が出ない.com：oyu-denai.com）
 */

const LP_ID = 'kyutoki-kokan-hiyou';
const VERSION = 'v3-2026-10-31';
const PAGE_PATH = '/kyutoki/kokan-hiyou';
const TITLE = 'ガス給湯器の交換費用の目安｜種類・号数別と見積もりの確かめ方';
const DESCRIPTION =
  'ガス給湯器の交換費用の目安を、給湯専用・ふろ給湯器・暖房付きの種類別に図で紹介。マンションと戸建て、メーカーやエコジョーズで変わる金額、見積もりが高いと感じたときの確かめ方もまとめました。';
const DATE_MODIFIED = '2026-10-31';

const TG_HOWTO = 'https://home.tokyo-gas.co.jp/housing/exchange/waterheater/how-to-choose.html';
const TG_LIST = 'https://home.tokyo-gas.co.jp/replacement/waterheater/rinnai';
const TG_NORITZ = 'https://home.tokyo-gas.co.jp/replacement/waterheater/noritz';
const TG_KOJI = 'https://home.tokyo-gas.co.jp/housing/exchange/waterheater/construction.html';
const KOKUSEN = 'https://www.kokusen.go.jp/news/data/n-20240221_1.html';
const NORITZ_LIFE = 'https://faq.noritz.co.jp/%E7%B5%A6%E6%B9%AF%E6%A9%9F%E5%99%A8%E3%81%AE%E8%80%90%E7%94%A8%E5%B9%B4%E6%95%B0-64ba5c5c1ec10c001ca546e4';
const NORITZ_888 = 'https://www.noritz.co.jp/info/houtei/tenken.html';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: SITE_NAME,
    type: 'article',
    locale: 'ja_JP',
    images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

/** 種類別の費用の目安（東京ガスの相場と販売価格。工事費込み・税込、万円） */
const PRICE = [
  { icon: Flame, h: '給湯専用', s: 'お湯を出すだけ', min: 10, max: 15, label: '15万円以下', ex: '16号で約10.2万〜12.2万円' },
  { icon: Bath, h: 'ふろ給湯器', s: 'お湯はり・追いだき', min: 15, max: 20, label: '15〜20万円', ex: '24号フルオートのエコジョーズで約22.7万円' },
  { icon: Gauge, h: '暖房付き', s: '床暖房などにも使う', min: 30, max: 35, label: '30〜35万円', ex: '24号オートで約29.0万円' },
];
const SCALE_MAX = 36;

const FAQS = [
  {
    q: 'ガス給湯器の交換費用はいくらくらいですか？',
    a: '工事費込みで、給湯専用は15万円以下、ふろ給湯器は15〜20万円程度、暖房付きは30〜35万円程度が目安です（東京ガスの公表している相場）。号数が大きいほど、またエコジョーズ（高効率タイプ）ほど高くなります。',
  },
  {
    q: '工事費はどのくらいかかりますか？',
    a: '東京ガスの基本工事費は、給湯専用で4万700円〜4万5,100円、ふろ給湯器で4万9,500円〜5万3,900円、暖房付きで6万4,900円〜6万9,300円です（税込）。据え置き台の設置や配管の変更があると別にかかります。',
  },
  {
    q: '何年くらいで交換するものですか？',
    a: 'メーカー各社は、使い始めて10年を目安にしています。修理部品の保有期間は7〜10年のことが多く、10年を超えると部品がなくて直せない場合があります。',
  },
  {
    q: 'リモコンに「888」と出ました。壊れたのですか？',
    a: '故障ではありません。使い始めて10年ほどたったことを知らせる「点検時期のお知らせ」で、そのまま使えます。気になる場合はメーカーの点検（有料）を受けてください。',
  },
  {
    q: '見積もりの前に、何を調べておけばいいですか？',
    a: '本体の側面や前面のラベルにある「号数」（16・20・24など）と、今の機能（お湯はりだけか、追いだきもできるか、暖房付きか）です。写真を撮っておくと話が早く進みます。',
  },
  {
    q: 'マンションだと交換費用は高くなりますか？',
    a: '玄関横の扉の中（パイプシャフト）に置く型でも、同じ機能なら壁に掛ける型との差は数千円ほどです（東京ガスの販売価格）。細身の型が必要な場所だと約4万円高くなります。管理組合への工事の申請が要ることもあります。',
  },
  {
    q: 'メーカーで値段は変わりますか？',
    a: '同じ号数・同じ機能なら、リンナイとノーリツの差は数千円ほどです（東京ガスの販売価格）。メーカーより、号数と機能をそろえて比べるほうが大事です。',
  },
  {
    q: '現地調査を頼んだあと、断ってもいいですか？',
    a: 'はい。GAS-Qは見積もりと現地調査を無料と公表しており、見積もりを見てから頼まなくても費用はかかりません。自分から頼む現地調査は、飛び込みの「点検します」の訪問とは別のものです。',
  },
  {
    q: '賃貸に住んでいます。自分で頼んでいいですか？',
    a: '先に管理会社か大家さんに連絡してください。給湯器は建物の設備なので、手配と費用は契約で決まっていることが多いです。',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      '@id': `${SITE_URL}${PAGE_PATH}#article`,
      headline: TITLE,
      description: DESCRIPTION,
      inLanguage: 'ja',
      dateModified: `${DATE_MODIFIED}T09:00:00+09:00`,
      datePublished: '2026-10-31T09:00:00+09:00',
      mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'ガス給湯器の交換費用', item: `${SITE_URL}${PAGE_PATH}` },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ],
};

/** ヒーローの図：給湯器と値札 */
function HeroIllustration() {
  return (
    <svg viewBox="0 0 220 200" role="img" aria-label="給湯器と値札のイラスト" className="h-auto w-full max-w-[220px]">
      <rect x="0" y="0" width="220" height="200" rx="28" fill="#e0f2fe" />
      <path d="M0 150h220" stroke="#bae6fd" strokeWidth="2" />
      <rect x="40" y="26" width="92" height="118" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="52" y="40" width="68" height="30" rx="6" fill="#1c2a22" />
      <text x="86" y="61" textAnchor="middle" fontSize="16" fill="#b9f5c8" fontFamily="monospace">42℃</text>
      {[86, 96, 106, 116].map((y) => (
        <rect key={y} x="56" y={y} width="60" height="4" rx="2" fill="#e2e8f0" />
      ))}
      <path d="M60 144v26M78 144v26M94 144v26M112 144v26" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
      <g transform="translate(140 64) rotate(12)">
        <path d="M0 10 L14 0 H66 a6 6 0 0 1 6 6 V50 a6 6 0 0 1 -6 6 H14 L0 46 Z" fill="#ea580c" />
        <circle cx="12" cy="28" r="4" fill="#ffffff" />
        <text x="44" y="35" textAnchor="middle" fontSize="18" fontWeight="800" fill="#ffffff">¥</text>
      </g>
    </svg>
  );
}

const SECTION = 'flex flex-col gap-5';
const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SRC = 'text-[11px] leading-relaxed text-slate-500';

export default function KokanHiyouPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LpHeader />
      <LpViewTracker lpId={LP_ID} version={VERSION} />

      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-4 pb-32 sm:pb-16">
        {/* 広告であることの表示（ASP の条件：最初の画面に置く） */}
        <p className="-mb-10 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
          <span className="rounded border border-slate-300 px-1.5 tracking-widest">PR</span>
          <span>当サイトは紹介料を受け取っています<span className="whitespace-nowrap">（工事は行いません）</span></span>
          <Link href="/policy" className="text-sky-800 underline underline-offset-2">中立性ポリシー</Link>
        </p>

        {/* 最初の画面：広告で約束した「費用の目安」と見積もりの入口 */}
        <section className="flex flex-col gap-5">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="flex flex-col gap-3">
              <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-800 ring-1 ring-sky-200">給湯器の交換</span>
              <h1 className="text-[32px] font-black leading-[1.15] tracking-tight text-slate-900 min-[380px]:text-[36px]">
                <span className="whitespace-nowrap">ガス給湯器の</span><br /><span className="whitespace-nowrap">交換費用</span>
              </h1>
              <p className="text-[17px] font-bold leading-snug text-slate-700">
                ふろ給湯器なら<br /><span className="text-[24px] text-orange-600">15〜20万円</span>が目安
              </p>
            </div>
            <div className="w-[128px] sm:w-[176px]">
              <HeroIllustration />
            </div>
          </div>

          {/* v3：なぜ今か。10年で部品の供給が終わる → 壊れると直せない → お湯なしで待つ */}
          <ul className="grid grid-cols-3 gap-2">
            {[
              { icon: PackageX, h: '部品は10年まで', d: '修理部品の保有は7〜10年' },
              { icon: Wrench, h: '壊れたら直せない', d: '部品がなければ交換だけ' },
              { icon: Hourglass, h: 'お湯なしで待つ', d: '壊れてから探すと日数がかかる' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white px-2 py-3 text-center ring-1 ring-slate-200">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-600"><I size={20} aria-hidden="true" /></span>
                <span className="text-[13px] font-black leading-tight text-slate-900">{h}</span>
                <span className="text-[10px] leading-snug text-slate-500">{d}</span>
              </li>
            ))}
          </ul>

          {/* v3：なぜこの会社か。GAS-Q の公式の記載だけ（冒頭の注釈に出典） */}
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-4">
            <ul className="grid grid-cols-2 gap-2">
              {[
                { icon: CalendarCheck, t: '現地調査で金額が決まる' },
                { icon: CreditCard, t: '工事後の後払い可' },
                { icon: ShieldCheck, t: '本体・工事とも10年保証' },
                { icon: MapPin, t: '1都3県に対応' },
              ].map(({ icon: I, t }) => (
                <li key={t} className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-[12px] font-bold leading-tight text-slate-700 ring-1 ring-orange-200">
                  <I size={16} className="shrink-0 text-orange-600" aria-hidden="true" />{t}
                </li>
              ))}
            </ul>
            <PartnerLink lpId={LP_ID} partner="gasq" position="hero" label="無料の現地調査を頼む" note="断っても費用はかかりません。GAS-Q（ガスキュー）のサイトに移動します" beacon />
          </div>
          <p className={SRC}>費用の目安は工事費込み・税込。東京ガスの公表している相場です（2026年10月確認）。会社の記載は GAS-Q の公式サイトによります。</p>
        </section>

        {/* 種類別の目安：横の帯で見せる */}
        <section className={SECTION} aria-labelledby="meyasu">
          <div className="flex flex-col gap-1.5">
            <h2 id="meyasu" className={H2}>種類別の費用の目安</h2>
            <p className="text-[15px] text-slate-600">いちばん効くのは「種類」です。</p>
          </div>
          <ul className="grid gap-3">
            {PRICE.map(({ icon: I, h, s, min, max, label, ex }) => (
              <li key={h} className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={22} aria-hidden="true" /></span>
                  <span className="flex flex-1 flex-col">
                    <span className="text-[16px] font-black text-slate-900">{h}</span>
                    <span className="text-[12px] text-slate-500">{s}</span>
                  </span>
                  <span className="text-[18px] font-black text-orange-600">{label}</span>
                </div>
                <div className="relative h-3 rounded-full bg-slate-100" aria-hidden="true">
                  <span
                    className="absolute inset-y-0 rounded-full bg-orange-500"
                    style={{ left: `${(min / SCALE_MAX) * 100}%`, width: `${((max - min) / SCALE_MAX) * 100}%` }}
                  />
                </div>
                <span className="text-[12px] text-slate-500">例：{ex}</span>
              </li>
            ))}
          </ul>
          <p className={SRC}>
            出典：<a href={TG_HOWTO} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">東京ガス「給湯器の選び方」</a>の相場、
            <a href={TG_LIST} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">東京ガスの販売価格</a>（工事費込み・税込、2026年10月確認）。同じ号数で替える場合。
          </p>
        </section>

        {/* 値段が変わる3つ */}
        <section className={SECTION} aria-labelledby="kawaru">
          <h2 id="kawaru" className={H2}>値段が変わる3つ</h2>
          <ul className="grid grid-cols-3 gap-2.5">
            {[
              { icon: Bath, h: '機能', d: '給湯だけ／オート／フルオート' },
              { icon: Gauge, h: '号数', d: '16・20・24号。大きいほど高い' },
              { icon: Leaf, h: 'エコジョーズ', d: 'ガス代は減るが本体は高め' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700"><I size={22} aria-hidden="true" /></span>
                <span className="text-[15px] font-black text-slate-900">{h}</span>
                <span className="text-[11px] leading-snug text-slate-500">{d}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <HardHat size={22} className="shrink-0 text-slate-500" aria-hidden="true" />
            <p className="text-[14px] text-slate-700">基本工事費だけで<b className="whitespace-nowrap">約4〜7万円</b>。台や配管の変更は別料金</p>
          </div>
          <p className={SRC}>
            出典：<a href={TG_KOJI} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">東京ガス「工事について」</a>（基本工事費 税込40,700〜69,300円）
          </p>
        </section>

        {/* マンションと戸建て（広告「住まい」の行き先） */}
        <section className={SECTION} aria-labelledby="sumai">
          <div className="flex flex-col gap-1.5">
            <h2 id="sumai" className={H2}>マンションと戸建て</h2>
            <p className="text-[15px] text-slate-600">差が出るのは「置き場所」です。</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                icon: Building2, h: 'マンション', rows: [
                  { k: '扉の中に置く型', v: '＋0〜3千円' },
                  { k: '細身の型', v: '＋約4万円' },
                ], d: '管理組合への申請が要ることも',
              },
              {
                icon: Home, h: '戸建て', rows: [
                  { k: '壁に掛ける型', v: '基本の値段' },
                  { k: '床に置く型', v: '＋約4千円' },
                ], d: '暖房付きの細身の台は＋約4〜6万円',
              },
            ].map(({ icon: I, h, rows, d }) => (
              <div key={h} className="flex flex-col gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                  <span className="text-[16px] font-black text-slate-900">{h}</span>
                </span>
                <ul className="flex flex-col gap-2">
                  {rows.map(({ k, v }) => (
                    <li key={k} className="flex flex-col">
                      <span className="text-[11px] text-slate-500">{k}</span>
                      <span className="text-[16px] font-black text-orange-600">{v}</span>
                    </li>
                  ))}
                </ul>
                <span className="text-[11px] leading-snug text-slate-500">{d}</span>
              </div>
            ))}
          </div>
          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-[14px] text-slate-700">今と<b>同じ置き場所・同じ形</b>なら工事が簡単</p>
          <p className={SRC}>
            同じ16号オートで比べた差。出典：<a href={TG_LIST} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">東京ガスの販売価格（リンナイ）</a>・
            <a href={TG_NORITZ} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">（ノーリツ）</a>（工事費込み・税込、2026年10月確認）
          </p>
        </section>

        {/* メーカーとエコジョーズ（広告「メーカー」「種類」の行き先） */}
        <section className={SECTION} aria-labelledby="maker">
          <h2 id="maker" className={H2}>メーカーとエコジョーズ</h2>
          <ul className="grid grid-cols-2 gap-2.5">
            {[
              { icon: Factory, h: 'メーカーの差', v: '数千円', d: 'リンナイとノーリツ、同じ号数・機能で' },
              { icon: Leaf, h: 'エコジョーズ', v: '＋2〜3万円', d: '従来の型より。そのぶんガス代が減る' },
            ].map(({ icon: I, h, v, d }) => (
              <li key={h} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700"><I size={22} aria-hidden="true" /></span>
                <span className="text-[13px] font-bold text-slate-700">{h}</span>
                <span className="text-[22px] font-black text-orange-600">{v}</span>
                <span className="text-[11px] leading-snug text-slate-500">{d}</span>
              </li>
            ))}
          </ul>
          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-[14px] text-slate-700">メーカーより、<b>号数と機能をそろえて</b>比べるのが近道です</p>
          <p className={SRC}>
            例：16号オートのエコジョーズ リンナイ191,510円・ノーリツ193,011円。従来の型はリンナイ163,691円・ノーリツ173,331円。
            出典：<a href={TG_LIST} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">東京ガスの販売価格（リンナイ）</a>・
            <a href={TG_NORITZ} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">（ノーリツ）</a>（工事費込み・税込、2026年10月確認）
          </p>
        </section>

        {/* 見積もりが高いと感じたら（広告「見積もり」の行き先） */}
        <section className={SECTION} aria-labelledby="takai">
          <div className="flex flex-col gap-1.5">
            <h2 id="takai" className={H2}>見積もりが高いと感じたら</h2>
            <p className="text-[15px] text-slate-600">この3つを見比べます。</p>
          </div>
          <ul className="grid grid-cols-3 gap-2.5">
            {[
              { icon: Tag, h: '本体', d: '号数・機能は今と同じか' },
              { icon: HardHat, h: '工事費', d: '取り外しと処分は込みか' },
              { icon: Wrench, h: '追加の費用', d: '台・配管・リモコン' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700"><I size={22} aria-hidden="true" /></span>
                <span className="text-[15px] font-black text-slate-900">{h}</span>
                <span className="text-[11px] leading-snug text-slate-500">{d}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 rounded-2xl border-2 border-orange-200 bg-orange-50/60 p-4">
            <p className="flex items-center gap-2 text-[15px] font-bold text-slate-800">
              <ClipboardCheck size={20} className="shrink-0 text-orange-600" aria-hidden="true" />もう1社の見積もりと並べると、高いかどうかが分かります
            </p>
            <PartnerLink lpId={LP_ID} partner="gasq" position="takai" label="無料の現地調査を頼む" note="断っても費用はかかりません。GAS-Q（ガスキュー）のサイトに移動します" />
          </div>
        </section>

        {/* v3：見積もりの持ち物メモ（なぜここ経由か：ページで整理した3つを持って行くと現地調査が早い） */}
        <section className={SECTION} aria-labelledby="memo">
          <div className="flex flex-col gap-1.5">
            <h2 id="memo" className={H2}>現地調査の前に3つ</h2>
            <p className="text-[15px] text-slate-600">本体のラベルを写真に撮れば足ります。</p>
          </div>
          <ul className="grid grid-cols-3 gap-2.5">
            {[
              { icon: Bath, h: '機能', d: '給湯だけ／オート／フルオート' },
              { icon: Gauge, h: '号数', d: 'ラベルの16・20・24' },
              { icon: CalendarClock, h: '製造年', d: 'ラベルの年。10年超なら交換' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700"><I size={22} aria-hidden="true" /></span>
                <span className="text-[15px] font-black text-slate-900">{h}</span>
                <span className="text-[11px] leading-snug text-slate-500">{d}</span>
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-[14px] text-slate-700">
            <CircleCheck size={22} className="shrink-0 text-emerald-600" aria-hidden="true" />この3つを伝えると、見積もりの話が早く進みます
          </p>
        </section>

        {/* 見積もりを頼める会社（v3：交換は GAS-Q を主役に。修理の可能性を残したい人はお湯が出ない.com） */}
        <section className={SECTION} aria-labelledby="hikaku">
          <div className="flex flex-col gap-1.5">
            <h2 id="hikaku" className={H2}>見積もりを頼める会社</h2>
            <p className="text-[15px] text-slate-600">交換と決めているなら、まず1社で十分です。</p>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-2 ring-orange-300">
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex flex-col">
                <span className="text-[18px] font-black leading-tight text-slate-900">GAS-Q</span>
                <span className="text-[11px] text-slate-500">ガス給湯器の交換専門</span>
              </span>
              <span className="text-[15px] font-black text-orange-600">交換 8.8万円〜</span>
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
              {[
                { icon: CalendarCheck, t: '現地調査・見積もり無料' },
                { icon: CreditCard, t: '工事後の後払い・カード可' },
                { icon: ShieldCheck, t: '本体・工事10年保証' },
                { icon: Handshake, t: '補助金の申請を無料で代行' },
                { icon: Clock, t: '年中無休 9〜20時' },
                { icon: MapPin, t: '東京・神奈川・千葉・埼玉' },
              ].map(({ icon: I, t }) => (
                <li key={t} className="flex items-start gap-1.5 text-[12px] leading-snug text-slate-700">
                  <I size={14} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{t}
                </li>
              ))}
            </ul>
            <PartnerLink lpId={LP_ID} partner="gasq" position="table" label="無料の現地調査を頼む" note="断っても費用はかかりません" />
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
            <span className="flex flex-1 flex-col">
              <span className="text-[14px] font-black leading-tight text-slate-900">お湯が出ない.com</span>
              <span className="text-[11px] text-slate-500">修理の可能性も残したいなら。修理2.2万円〜・東京・神奈川</span>
            </span>
            <div className="w-[120px] shrink-0">
              <PartnerLink lpId={LP_ID} partner="oyu" position="table" label="見積もり" variant="secondary" beacon />
            </div>
          </div>
          <p className={SRC}>
            各社の公式サイトの記載です（2026年10月確認）。GAS-Qの「8.8万円〜」は一部の機種を除く価格で、料金の内訳は本体・基本工事・取り外し・リモコンと公表しています。補助金は対象の制度と機種によります。
          </p>
        </section>

        {/* 交換の目安 */}
        <section className={SECTION} aria-labelledby="jiki">
          <h2 id="jiki" className={H2}>替えどきは10年</h2>
          <ul className="grid grid-cols-2 gap-2.5">
            {[
              { icon: CalendarClock, h: '使用10年', d: 'メーカー各社の目安' },
              { icon: Wrench, h: '部品は7〜10年', d: 'それ以降は直せないことも' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600"><I size={22} aria-hidden="true" /></span>
                <span className="text-[16px] font-black text-slate-900">{h}</span>
                <span className="text-[12px] text-slate-500">{d}</span>
              </li>
            ))}
          </ul>
          <Link href="/kyutoki/oyu-ga-denai" className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white px-5 text-[15px] font-bold text-sky-800 ring-1 ring-sky-200 hover:bg-sky-50">
            <Stethoscope size={18} aria-hidden="true" />修理か交換か迷うなら30秒診断
          </Link>
          <p className={SRC}>
            出典：<a href={NORITZ_LIFE} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">ノーリツ「給湯機器の耐用年数」</a>、リンナイ・パロマの公式資料（標準使用期間10年）
          </p>
        </section>

        {/* 点検商法 */}
        <section className={SECTION} aria-labelledby="chui">
          <div className="flex flex-col gap-1.5">
            <h2 id="chui" className={H2}>「点検します」の電話に注意</h2>
            <p className="text-[15px] text-slate-600">自分から頼む現地調査とは別物です。向こうから来る「点検」の相談が急増しています。</p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-red-50 p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"><Users size={24} aria-hidden="true" /></span>
            <p className="text-[14px] leading-snug text-red-900">
              相談は<b className="text-[18px]">1,099件</b>（2023年度・12月末まで）。<br />前の年の同じ時期の<b>約3倍</b>
            </p>
          </div>
          <ul className="grid grid-cols-3 gap-2.5">
            {[
              { icon: PhoneOff, h: 'すぐ契約しない' },
              { icon: Handshake, h: 'ガス会社に相談' },
              { icon: Scale, h: '2社以上で比べる' },
            ].map(({ icon: I, h }) => (
              <li key={h} className="flex flex-col items-center gap-2 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-slate-200">
                <I size={22} className="text-sky-700" aria-hidden="true" />
                <span className="text-[12px] font-bold leading-snug text-slate-800">{h}</span>
              </li>
            ))}
          </ul>
          <p className={SRC}>
            出典：<a href={KOKUSEN} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">国民生活センター「給湯器の点検にご注意ください」</a>（2024年2月21日）
          </p>
        </section>

        {/* このページについて */}
        <section className={SECTION} aria-labelledby="about">
          <h2 id="about" className={H2}>このページについて</h2>
          <ul className="grid gap-3">
            {[
              { icon: HardHat, h: '工事を行わない第三者のサイト', d: '修理や交換の業者ではありません' },
              { icon: Handshake, h: '紹介料を受け取っています', d: '費用の目安は公的・公式の情報だけで書いています' },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"><I size={22} aria-hidden="true" /></span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-black text-slate-900">{h}</span>
                  <span className="text-[13px] text-slate-500">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

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
          <p className={`${SRC} mt-1`}>
            888の表示：<a href={NORITZ_888} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">ノーリツ「点検時期のお知らせ」</a>。リンナイ・パロマも同じ扱いです。
          </p>
        </section>

        <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
          <p className="text-center text-[16px] font-black text-slate-900">壊れる前なら、工事日を選べる</p>
          <PartnerLink lpId={LP_ID} partner="gasq" position="bottom" label="無料の現地調査を頼む" note="断っても費用はかかりません。GAS-Q（ガスキュー）のサイトに移動します" />
        </section>

        <p className="text-[11px] leading-relaxed text-slate-400">
          費用は一般的な目安で、設置場所や配管の状態で変わります。各社の価格・保証・受付時間は各社の公表内容によります。最終更新：2026年10月31日
        </p>
      </main>

      {/* スマホの画面下に固定する見積もりボタン */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] backdrop-blur sm:hidden">
        <PartnerLink lpId={LP_ID} partner="gasq" position="sticky" label="無料の現地調査を頼む" />
      </div>
      <LpFooter />
    </div>
  );
}
