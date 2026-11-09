import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarClock, HeartHandshake, Scale, Users, Wallet } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, NumberedCards, SECTION, SRC, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import SouzokuzeiCalc from '@/components/souzoku/SouzokuzeiCalc';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の計算（かんたん計算つき）（2026-11-10 作成。docs/seisaku-queue.md の S1）。
 * 受ける言葉：相続税 計算（27,100回/月）・相続税 いくらから（40,500）・相続税 基礎控除（49,500）・
 *   相続税 早見表（9,900）・相続税 シミュレーション（4,400）・相続税 計算 シミュレーション（4,400）。
 *   キーワードプランナー 2026-11-10、日本、2025/10〜2026/9 の月平均。
 * 出口：相続アシスト（レントラックス 15468、提携中、13,200円／申込、1クリックの稼ぎ 718円）。
 *   橋：計算で「かかる見込み」になった人 → 申告をまとめて頼む。
 * 数字の元：国税庁 タックスアンサー No.4152・4155・4158・4132・4114・4205、令和6年分 相続税の申告事績の概要。
 */
const LP_ID = 'guide-souzoku-zei-keisan';
const PATH = '/guide/souzoku/souzokuzei-keisan';
const TITLE = '相続税の計算シミュレーション（無料）｜いくらからかかるか、基礎控除と早見表で自動計算';
const DESCRIPTION = '遺産の合計と家族の人数を入れるだけで、相続税がかかるか・納める額の目安が分かる無料の計算。基礎控除（3,000万円＋600万円×相続人の数）、税率の早見表、配偶者の税額の軽減まで、国税庁の手順どおりに計算します。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const Z = DATA.zei;
const FAQS = [
  { q: '相続税がかからなくても、申告が要ることはありますか？', a: '配偶者の税額の軽減を使って税額が0円になるときも、申告書を出す必要があります。また、申告が要るかは小規模宅地の特例を使う前の金額で決まるので、特例で0円になる場合も申告が要ります（国税庁）。' },
  { q: '死亡保険金も遺産に入りますか？', a: '亡くなった人が保険料を払っていた死亡保険金は、相続税の対象になります。ただし相続人が受け取る分は「500万円×法定相続人の数」まで非課税です（国税庁）。' },
  { q: '申告と納税はいつまでですか？', a: `${Z.kigen}です。期限が土曜・日曜・祝日なら、その翌日です（国税庁）。` },
];

const man = (yen: number) => {
  const m = Math.round(yen / 10000);
  if (m >= 10000) { const o = Math.floor(m / 10000); const r = m % 10000; return r ? `${o}億${r.toLocaleString('ja-JP')}万円` : `${o}億円`; }
  return `${m.toLocaleString('ja-JP')}万円`;
};

export default function Page() {
  const S = DATA.sources;
  const checked = Z.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相続税の計算', faqs: FAQS, date: Z.checkedAt });
  const rows = Z.hayami.map((h, i) => {
    const from = i === 0 ? 0 : (Z.hayami[i - 1].upto ?? 0);
    return { range: h.upto === null ? `${man(from)}超` : from === 0 ? `${man(h.upto)}以下` : `${man(from)}超〜${man(h.upto)}`, rate: `${Math.round(h.rate * 100)}%`, kojo: h.kojo ? man(h.kojo) : '－' };
  });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-10" path={PATH} eyebrow="相続税"
        title={<>相続税は<br /><span className="text-orange-600">いくらからかかる？</span></>}
        download={<SouzokuzeiCalc lpId={LP_ID} />}
        partner="souzokuAssist" exitLead="相続税がかかりそうなら、申告をまとめて頼む" faqs={FAQS} updated="2026年11月10日"
      >
        <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="かかる見込みなら、申告をまとめて頼む" />

        <section className={SECTION} aria-labelledby="kiso">
          <h2 id="kiso" className={H2}>基礎控除の早見</h2>
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-white p-4 text-center ring-1 ring-slate-200">
            <p className="text-[13px] font-bold text-slate-600">基礎控除</p>
            <p className="text-[20px] font-black text-slate-900">{man(Z.kiso.base)}＋{man(Z.kiso.per)}×相続人の数</p>
            <p className="text-[12px] text-slate-500">遺産の合計がこれ以下なら、申告も納税も要らない</p>
          </div>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <li key={n} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-3 text-center ring-1 ring-slate-200">
                <span className="flex items-center gap-1 text-[12px] text-slate-500"><Users size={13} aria-hidden="true" />{n}人</span>
                <span className="text-[16px] font-black text-slate-900">{man(Z.kiso.base + Z.kiso.per * n)}</span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-slate-600">相続人の数は、相続を放棄した人も入れて数えます。養子は、実の子がいれば1人まで、いなければ2人までです。</p>
          <p className={SRC}>出典：<a href={S.nta4152.url} target="_blank" rel="noopener noreferrer" className={A}>{S.nta4152.name}</a>・<a href={S.nta4205.url} target="_blank" rel="noopener noreferrer" className={A}>{S.nta4205.name}</a>（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="wariai">
          <h2 id="wariai" className={H2}>相続税がかかった人の割合</h2>
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <span className="text-[40px] font-black leading-none text-orange-600">{Z.kazeiWariai.pct}%</span>
            <span className="text-[14px] text-slate-700">亡くなった人のうち、相続税の申告が出された人の割合（{Z.kazeiWariai.year}）。<span className="font-bold">およそ10人に1人</span></span>
          </div>
          <p className={SRC}>出典：<a href={S.ntaJiseki.url} target="_blank" rel="noopener noreferrer" className={A}>{S.ntaJiseki.name}</a>（亡くなった人 {Z.kazeiWariai.shibou.toLocaleString('ja-JP')}人、申告 {Z.kazeiWariai.shinkoku.toLocaleString('ja-JP')}人）</p>
        </section>

        <section className={SECTION} aria-labelledby="tejun">
          <h2 id="tejun" className={H2}>計算の4つの手順</h2>
          <NumberedCards items={[
            { h: '遺産の合計を出す', d: '財産から借金と葬式の費用を引き、亡くなる前の3年以内にもらった贈与を足す（亡くなったのが2026年までの場合）', icon: Wallet },
            { h: '基礎控除を引く', d: '残りが「課税される遺産」。0以下なら相続税はかからない', icon: Scale },
            { h: '法定相続分で分けて、税率を当てる', d: '分けた額ごとに下の早見表で計算し、合計が「相続税の総額」', icon: Users },
            { h: '実際の取り分で割り振る', d: '配偶者は軽減あり。兄弟姉妹などは2割増し', icon: HeartHandshake },
          ]} />
          <p className="text-[13px] text-slate-600">{Z.rei.note}。</p>
          <p className={SRC}>出典：<a href={S.nta4152.url} target="_blank" rel="noopener noreferrer" className={A}>{S.nta4152.name}</a>・<a href={S.nta4155.url} target="_blank" rel="noopener noreferrer" className={A}>{S.nta4155.name}</a></p>
        </section>

        <section className={SECTION} aria-labelledby="hayami">
          <h2 id="hayami" className={H2}>税率の早見表</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[12px] text-slate-600">
                <tr><th className="px-3 py-2 text-left font-bold">分けた1人分の額</th><th className="px-2 py-2 text-right font-bold">税率</th><th className="px-3 py-2 text-right font-bold">引く額</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.range} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-800">{r.range}</td>
                    <td className="px-2 py-2 text-right font-black text-slate-900">{r.rate}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{r.kojo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={SRC}>出典：<a href={S.nta4155.url} target="_blank" rel="noopener noreferrer" className={A}>{S.nta4155.name}</a>（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="haigusha">
          <h2 id="haigusha" className={H2}>配偶者の税額の軽減</h2>
          <p className="rounded-2xl bg-sky-50 p-4 text-[15px] font-bold text-slate-900 ring-1 ring-sky-200">配偶者が受け取る遺産が「{man(Z.haigushaKeigen)}」か「法定相続分」の多いほうまでなら、配偶者に相続税はかからない</p>
          <ul className="flex flex-col gap-1.5 text-[13px] text-slate-700">
            <li>・申告の期限までに遺産を分けていないと使えない（3年以内に分ける見込みを出せば後から使える）</li>
            <li>・使うには申告書を出す。税額が0円でも申告が要る</li>
          </ul>
          <p className={SRC}>出典：<a href={S.nta4158.url} target="_blank" rel="noopener noreferrer" className={A}>{S.nta4158.name}</a>・<a href={S.nta4132.url} target="_blank" rel="noopener noreferrer" className={A}>{S.nta4132.name}</a></p>
        </section>

        <section className={SECTION} aria-labelledby="kigen">
          <h2 id="kigen" className={H2}>申告の期限</h2>
          <p className="flex items-start gap-3 rounded-2xl bg-white p-4 text-[15px] font-bold text-slate-900 ring-1 ring-slate-200">
            <CalendarClock size={22} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{Z.kigen}
          </p>
          <p className="text-[14px] text-slate-700">遺産を書き出すときは、無料の<Link href="/guide/souzoku/zaisan-mokuroku" className={`${A} text-sky-800`}>財産目録のテンプレート</Link>が使えます。</p>
          <p className={SRC}>出典：<a href={S.nta4205.url} target="_blank" rel="noopener noreferrer" className={A}>{S.nta4205.name}</a></p>
        </section>
      </SouzokuArticle>
    </>
  );
}
