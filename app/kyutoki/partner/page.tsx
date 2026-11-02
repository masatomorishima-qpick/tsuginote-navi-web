import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, Ban, Building2, CalendarCheck, Camera, CircleCheck, ClipboardList, Clock, Gauge, Hand,
  House, Mail, MapPin, Megaphone, Receipt, ShieldCheck, SlidersHorizontal, Users, Wallet,
} from 'lucide-react';
import LpHeader from '@/components/lp/LpHeader';
import LpFooter from '@/components/lp/LpFooter';
import { SITE_NAME } from '@/components/loan/LoanArticle';

/**
 * 給湯器 B：協力会社（工事会社）向けの説明ページ（2026-11-02 新設）。
 *
 * 声かけのメールに付けて送る。工事会社が気にすること（件数・質・費用・手間・信頼・縛り）に、
 * 1画面1つずつ答える。検索結果には出さない（noindex）。
 * 数字の出典：docs/kyutoki-b/page-design.md・yakusoku.md（枝 docs/listing-rules）。
 *   手数料の比べ方は、成約額に応じた手数料が約20%の一覧型サイト（15万円の交換で約3万円）と比べている。
 */

export const metadata: Metadata = {
  title: `協力会社のご案内（給湯器の交換） | ${SITE_NAME}`,
  description: '給湯器の交換を考えている方の現地調査を、条件・写真・日程をそろえてご紹介します。紹介料は現地調査が済んだ分だけ1件5,000円、最初の1か月は無料です。',
  robots: { index: false, follow: false },
};

const CONTACT = 'masato.morishima@blueadventures.jp';
const MAILTO = `mailto:${CONTACT}?subject=${encodeURIComponent('協力会社の件（会社名：　）')}&body=${encodeURIComponent('対応できる地域：\n月に受けられる件数の目安：\nご質問：\n')}`;

const H2 = 'text-[22px] font-black leading-snug text-slate-900';
const SECTION = 'flex flex-col gap-5';

function Cta({ label = '話を聞いてみる' }: { label?: string }) {
  return (
    <a href={MAILTO} className="flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-5 text-lg font-bold text-white shadow-[0_8px_20px_-10px_rgba(234,88,12,.8)] transition hover:bg-orange-700">
      <Mail size={20} aria-hidden="true" />{label}<ArrowRight size={20} aria-hidden="true" />
    </a>
  );
}

export default function PartnerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa]">
      <LpHeader />
      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col gap-14 px-4 pt-6 pb-16">

        {/* 最初の画面：何をくれるか・いくらか・損しないか */}
        <section className="flex flex-col gap-5">
          <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-800 ring-1 ring-sky-200">工事会社さま向け</span>
          <h1 className="text-[32px] font-black leading-[1.15] tracking-tight text-slate-900">
            <span className="whitespace-nowrap">給湯器交換の</span><br /><span className="whitespace-nowrap">現地調査のご紹介</span>
          </h1>
          <p className="text-[17px] font-bold leading-snug text-slate-700">条件・写真・日程を<span className="text-orange-600">そろえて</span>お渡し</p>
          <ul className="grid grid-cols-3 gap-2">
            {[
              { k: '紹介料', v: '5,000円', s: '現地調査が済んだ分だけ' },
              { k: '最初の1か月', v: '0円', s: '前払い・月額なし' },
              { k: '1つの地域に', v: '2社まで', s: '先着でご相談' },
            ].map(({ k, v, s }) => (
              <li key={k} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-1.5 py-3 text-center ring-1 ring-slate-200">
                <span className="text-[11px] font-bold text-slate-500">{k}</span>
                <span className="text-[22px] font-black leading-tight text-orange-600">{v}</span>
                <span className="text-[10.5px] leading-tight text-slate-500">{s}</span>
              </li>
            ))}
          </ul>
          <Cta />
          <p className="text-center text-[12px] text-slate-500">返信は、このボタンからメール1通で大丈夫です</p>
        </section>

        {/* お渡しするもの：見本 */}
        <section className={SECTION} aria-labelledby="mihon">
          <div className="flex flex-col gap-1.5">
            <h2 id="mihon" className={H2}>お渡しするもの</h2>
            <p className="text-[14px] text-slate-600">打診のメールの見本です</p>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <div className="flex items-center justify-between text-[12px] font-bold text-slate-500">
              <span>受付番号 1024</span><span className="rounded bg-sky-50 px-2 py-0.5 text-sky-800">見本</span>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[14px]">
              {[
                { i: MapPin, k: '地域', v: '横浜市港北区' },
                { i: House, k: '住まい', v: '戸建て・持ち家' },
                { i: Gauge, k: '給湯器', v: 'ガス・追いだき付き・24号' },
                { i: Clock, k: '使用年数', v: '12年（ラベルで確認）' },
                { i: CalendarCheck, k: '時期', v: '1か月以内' },
                { i: Users, k: '来てほしい日', v: '土日の午前' },
              ].map(({ i: I, k, v }) => (
                <div key={k} className="contents">
                  <dt className="flex items-center gap-1.5 text-slate-500"><I size={15} aria-hidden="true" />{k}</dt>
                  <dd className="font-bold text-slate-800">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="grid grid-cols-2 gap-2">
              {['本体の正面', '型番・製造年のラベル'].map((t) => (
                <div key={t} className="flex h-20 flex-col items-center justify-center gap-1 rounded-xl bg-slate-100 text-[11px] text-slate-500">
                  <Camera size={20} aria-hidden="true" />{t}
                </div>
              ))}
            </div>
            <p className="rounded-xl bg-orange-50 px-3 py-2 text-[12px] text-orange-900">お名前・ご住所・お電話は、日程が決まってからお送りします</p>
          </div>
        </section>

        {/* 来るお客さま */}
        <section className={SECTION} aria-labelledby="kyaku">
          <h2 id="kyaku" className={H2}>ご紹介するお客さま</h2>
          <ul className="grid grid-cols-2 gap-3">
            {[
              { i: CircleCheck, h: '交換を決めた方', d: '「見積もり」「交換」で検索した方' },
              { i: House, h: '持ち家の方', d: '賃貸の方はご紹介しません' },
              { i: Receipt, h: '総額を知っている方', d: '本体込みの目安を見たうえで依頼' },
              { i: MapPin, h: '1都3県のガス給湯器', d: 'エコキュート・灯油は対象外' },
            ].map(({ i: I, h, d }) => (
              <li key={h} className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={22} aria-hidden="true" /></span>
                <span className="text-[15px] font-black text-slate-900">{h}</span>
                <span className="text-[12px] leading-snug text-slate-600">{d}</span>
              </li>
            ))}
          </ul>
          <Link href="/kyutoki/mitsumori" className="flex items-center justify-center gap-1.5 rounded-2xl border-2 border-slate-200 bg-white py-3.5 text-[15px] font-bold text-sky-800 hover:border-sky-500">
            お客さまが見るページ<ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>

        {/* 流れ */}
        <section className={SECTION} aria-labelledby="nagare">
          <h2 id="nagare" className={H2}>1件の流れ</h2>
          <ol className="grid gap-3">
            {[
              { i: Mail, h: '打診のメール', d: '条件と写真を見て、受けるかを判断' },
              { i: CalendarCheck, h: '候補日を3つ返信', d: '24時間以内に。日程は当社が調整' },
              { i: ClipboardList, h: '日程確定', d: 'お名前・ご住所・お電話をお送りします' },
              { i: House, h: '現地調査', d: '前日に当社からお客さまへ念押し' },
              { i: Receipt, h: '月末にご請求', d: '済んだ分だけ。メールで1通' },
            ].map(({ i: I, h, d }, n) => (
              <li key={h} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-700">
                  <I size={22} aria-hidden="true" />
                  <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[11px] font-bold text-white">{n + 1}</span>
                </span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-black text-slate-900">{h}</span>
                  <span className="text-[13px] text-slate-500">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* 費用の比べ方 */}
        <section className={SECTION} aria-labelledby="hiyou">
          <div className="flex flex-col gap-1.5">
            <h2 id="hiyou" className={H2}>費用の比べ方</h2>
            <p className="text-[14px] text-slate-600">15万円の交換1件を取るのにかかる額</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white p-4 text-center ring-1 ring-slate-200">
              <span className="text-[12px] font-bold text-slate-500">成約額の約20%の<br />一覧型サイト</span>
              <span className="text-[26px] font-black text-slate-700">約3万円</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-orange-50 p-4 text-center ring-2 ring-orange-300">
              <span className="text-[12px] font-bold text-orange-800">当社<br />（成約3件に1件の場合）</span>
              <span className="text-[26px] font-black text-orange-600">約1.5万円</span>
            </div>
          </div>
          <p className="text-[12px] leading-relaxed text-slate-500">当社は現地調査1件5,000円。3件に1件が成約なら、成約1件あたり1.5万円です。最初の1か月は0円なので、実際の成約率を見てから続けるかを決められます。</p>
        </section>

        {/* 損をしない約束 */}
        <section className={SECTION} aria-labelledby="yakusoku">
          <h2 id="yakusoku" className={H2}>お約束</h2>
          <ul className="grid grid-cols-2 gap-3">
            {[
              { i: Wallet, h: '前払い・月額なし', d: '登録料もかかりません' },
              { i: Ban, h: 'キャンセルは0円', d: '無断・お客さまの都合とも' },
              { i: Hand, h: '断ってもよい', d: '合わない相談は請求なし' },
              { i: SlidersHorizontal, h: '地域と件数を指定', d: '受けられる分だけ' },
              { i: ShieldCheck, h: 'しばりなし', d: 'メール1通でいつでも終了' },
              { i: Megaphone, h: '集客は当社', d: '広告費は当社の負担' },
            ].map(({ i: I, h, d }) => (
              <li key={h} className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><I size={22} aria-hidden="true" /></span>
                <span className="text-[15px] font-black text-slate-900">{h}</span>
                <span className="text-[12px] leading-snug text-slate-600">{d}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* よくある質問 */}
        <section className="flex flex-col gap-2" aria-labelledby="faq">
          <h2 id="faq" className={`${H2} mb-2`}>よくある質問</h2>
          {[
            { q: '成約しなくても払うのですか？', a: 'はい、現地調査が済んだ分だけです。その代わり、条件と写真がそろい、日程も決まった方だけをお渡しします。最初の1か月は0円なので、実際の成約率を見てからご判断ください。' },
            { q: 'なぜ2社に紹介するのですか？', a: '複数の見積もりを比べたい方が依頼してくるためです。3社以上には紹介しません。お客さまにも、2社から届くことをお伝えしています。' },
            { q: '月に何件くらい来ますか？', a: '1社あたり月6件前後からを見込んでいます（広告の実績からの見込みで、約束ではありません）。受けられる件数の上限を決めていただければ、それ以上はお送りしません。' },
            { q: '請求書と支払いは？', a: '月末締めで、翌月10日までにメールで請求書をお送りします。翌月末までにお振り込みください。当社は適格請求書発行事業者ではありません（金額は税込5,000円）。' },
            { q: 'ほかの紹介サービスと一緒に使えますか？', a: 'はい。当社だけにしていただく必要はありません。' },
            { q: 'お客さまの情報の扱いは？', a: 'お客さまの同意を得たうえでお渡しします。見積もりと工事のご提案だけにお使いください。' },
          ].map((f) => (
            <details key={f.q} className="group rounded-2xl bg-white px-4 py-4 ring-1 ring-slate-200">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-bold text-slate-900">
                {f.q}
                <span aria-hidden="true" className="text-xl text-slate-400 transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </section>

        {/* 運営会社 */}
        <section className={SECTION} aria-labelledby="kaisha">
          <h2 id="kaisha" className={H2}>運営会社</h2>
          <div className="flex items-start gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"><Building2 size={22} aria-hidden="true" /></span>
            <dl className="grid gap-1 text-[14px] text-slate-700">
              <dt className="sr-only">会社名</dt><dd className="font-black text-slate-900">BlueAdventures合同会社</dd>
              <dt className="sr-only">代表</dt><dd>代表社員　森嶋 聖人</dd>
              <dt className="sr-only">所在地</dt><dd>横浜市西区浅間町1-4-3</dd>
              <dt className="sr-only">連絡先</dt><dd className="break-all">{CONTACT}</dd>
              <dt className="sr-only">事業</dt><dd className="text-[12px] text-slate-500">住まいとお金の情報サイト「つぎの手ナビ」の運営。広告運用の経験10年以上</dd>
            </dl>
          </div>
          <Cta />
        </section>
      </main>
      <LpFooter />
    </div>
  );
}
