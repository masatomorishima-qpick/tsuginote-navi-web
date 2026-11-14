import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, ListChecks } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import ShokiboTakuchiCheck from '@/components/souzoku/ShokiboTakuchiCheck';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 小規模宅地等の特例の必要書類チェックリスト（2026-11-15 作成。docs/seisaku-queue.md の T24）。
 * 受ける言葉：小規模宅地等の特例 必要書類（主）・チェックリスト・添付書類・家なき子 必要書類・老人ホーム 必要書類・小規模宅地 計算。
 *   上位5件（11/15、WebSearch。Chrome につながらず）：1 不動産会社のコラム（2026/5 更新、計算例1つ）2 税理士法人トゥモローズ（2026/8 更新、表なし）
 *   3 税理士法人ともに（2022、平成30年版の資料が元）4 世田谷の相続専門の税理士事務所（令和8年分の資料、表7つ）5 3位の事務所の PDF（2022）。
 *   上位に欠けている点：①形を選ぶと要る書類だけが出る道具がない（4位は表で読む）②減る額の計算がどこにもない（限度面積 330・400㎡の数字があるのは1件）
 *   ③エクセルがない ④令和8年分（R8.7）の国税庁の一覧で確かめた日つきのものが1件だけ。
 * 出口：相続アシスト（申告をまとめて代行）。
 */
const LP_ID = 'guide-souzoku-shokibo-takuchi';
const PATH = '/guide/souzoku/shokibo-takuchi-shorui';
const TITLE = '小規模宅地等の特例の必要書類｜選ぶだけのチェックリストと減額計算（無料・エクセル）';
const DESCRIPTION = '小規模宅地等の特例は、自宅の土地なら330㎡まで80%、事業用は400㎡まで80%、貸している土地は200㎡まで50%を減らせます。配偶者・同居の親族・持ち家のない親族・老人ホーム・事業用・貸付から選ぶと、令和8年分の国税庁の一覧に合わせて要る書類と減る額が出ます。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const D = DATA.shokibo;
const FAQS = [
  { q: '小規模宅地等の特例を受けるのに必要な書類は？', a: '共通して、相続人が分かる戸籍の謄本、遺言書か遺産分割協議書の写し、相続人全員の印鑑証明書、計算の明細書が要ります。持ち家のない親族や老人ホームに入っていた場合などは、住所や施設が分かる書類を足します（国税庁「相続税の申告の際に提出していただく主な書類」R8.7）。' },
  { q: '小規模宅地等の特例は申告しないと使えませんか？', a: 'はい。相続税の申告書に特例を使うことを書き、計算の明細書や遺産分割協議書の写しなど一定の書類を付けて出す必要があります（国税庁 No.4124）。' },
  { q: '遺産分割が終わっていなくても小規模宅地等の特例は使えますか？', a: '最初の申告では、分けていない土地に特例は使えません。申告書に「申告期限後3年以内の分割見込書」を付けて出しておき、申告の期限から3年以内に分ければ使えます。その場合は、分けた日の翌日から4か月以内に更正の請求をします（国税庁 No.4208 質疑応答）。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = D.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '小規模宅地等の特例の必要書類', faqs: FAQS, date: D.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-15" path={PATH} eyebrow="相続税の土地の特例"
        title={<>小規模宅地等の特例の必要書類<br /><span className="text-orange-600">自宅の土地は330㎡まで80%減</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{D.kotae}<span className="text-[11px] text-slate-500">（国税庁 No.4124・提出書類の一覧 R8.7）</span></p>
            <ShokiboTakuchiCheck lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="書類の一覧が出たら、集めるところから申告までまとめて任せられる" />
            <SouzokuDownload icon={ListChecks} h="小規模宅地等の特例のチェックリスト" s="形に ○ を付けると要る書類と減る額が出る" files={SOUZOKU_FILES.shokibo} />
          </div>
        }
        partner="souzokuAssist" exitLead="特例を使うなら申告が要る。書類集めから任せる" faqs={FAQS} updated="2026年11月15日"
      >
        <section className={SECTION} aria-labelledby="hyo">
          <h2 id="hyo" className={H2}>小規模宅地等の特例の限度面積と減額の割合</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-2 py-2 text-left font-bold">土地の使い方</th><th className="whitespace-nowrap px-2 py-2 text-left font-bold">限度面積</th><th className="whitespace-nowrap px-2 py-2 text-left font-bold">減らす割合</th></tr>
              </thead>
              <tbody>
                {D.kubun.map((k) => (
                  <tr key={k.key} className="border-t border-slate-100 align-top">
                    <td className="px-2 py-2.5 font-bold text-slate-900">{k.h}</td>
                    <td className="whitespace-nowrap px-2 py-2.5 font-black text-slate-900">{k.menseki}㎡</td>
                    <td className="whitespace-nowrap px-2 py-2.5 font-black text-orange-700">{k.wari}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">例：{D.rei.note}。</p>
          <ul className="grid gap-1.5 rounded-2xl bg-sky-50 p-3.5 text-[13px] leading-relaxed text-sky-900 ring-1 ring-sky-200">
            {D.heiyou.map((h) => <li key={h}>・{h}</li>)}
          </ul>
          <p className={SRC}>出典：{src(['nta4124'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="shorui">
          <h2 id="shorui" className={H2}>ケース別の添付書類の一覧</h2>
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-black text-slate-900">どの形でも出す書類</p>
            <ul className="grid gap-1.5">
              {D.kyotsu.map((k) => (
                <li key={k.h} className="rounded-xl bg-white p-3 ring-1 ring-slate-200"><span className="block text-[14px] font-bold text-slate-900">{k.h}</span>{k.d && <span className="text-[12px] text-slate-600">{k.d}</span>}</li>
              ))}
            </ul>
          </div>
          {D.jokyo.filter((j) => j.items.length > 0).map((j) => (
            <div key={j.key} className="flex flex-col gap-2">
              <p className="text-[14px] font-black text-slate-900">{j.h}：足す書類</p>
              <ul className="grid gap-1.5">
                {j.items.map((it) => (
                  <li key={it.h} className="rounded-xl bg-white p-3 ring-1 ring-slate-200"><span className="block text-[14px] font-bold text-slate-900">{it.h}</span>{it.d && <span className="text-[12px] text-slate-600">{it.d}</span>}</li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-[13px] text-slate-700">配偶者が自宅の土地を受け継ぐときは、どの形でも出す書類だけです。老人ホームの書類は、受け継ぐ人の形の書類と一緒に出します。</p>
          <p className={SRC}>出典：{src(['ntaShoruiIchiran', 'nta4124'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="yoken">
          <h2 id="yoken" className={H2}>受け継ぐ人ごとの要件</h2>
          <ul className="grid gap-2">
            {D.jokyo.map((j) => (
              <li key={j.key} className="flex flex-col rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="text-[15px] font-black text-slate-900">{j.h}</span>
                <span className="text-[13px] text-slate-600">{j.yoken}</span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['nta4124'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsumazuki">
          <h2 id="tsumazuki" className={H2}>使えなくなる落とし穴</h2>
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
              { h: '相続人が分かる戸籍を集める', s: '要る戸籍と、最寄りの窓口で取れるか', href: '/guide/souzoku/koseki-atsumekata' },
              { h: '分け方を決めて協議書にする', s: '期限までに分けるのが特例の条件', href: '/guide/souzoku/isan-bunkatsu-kyogisho' },
              { h: 'ほかの申告の書類もそろえる', s: '状況を選ぶと一覧に', href: '/guide/souzoku/shinkoku-shorui-checklist' },
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
