import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ClipboardList, Gavel, Landmark } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import ToukiShoruiCheck from '@/components/souzoku/ToukiShoruiCheck';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続登記の必要書類チェックリスト（2026-11-12 作成。docs/seisaku-queue.md の T11）。
 * 受ける言葉：相続登記 必要書類（主）・相続登記 必要書類 自分で・相続登記 必要書類 期限・相続登記 費用。
 *   上位5件（11/12、Chrome で Google）：1 法務局の PDF（分け方ごとの書類と入手先の表）2 名義変更の手続き代行サイト（2026/10、表2・ひな形1）
 *   3 日本司法書士会連合会の相談サイト（義務化・罰則・費用）4 新聞社の相続の媒体（2025/11、表3）5 不動産会社のブログ（2025/7）。
 *   上位に欠けている点：①分け方を選ぶと要る書類だけになる道具がない ②期限（3年・2027年3月31日）を自分の日付で出す計算がない
 *   ③登録免許税を価格から出す計算（免税の100万円以下の土地も）がない ④印刷用のチェックリスト（エクセル・PDF）がない。
 * 出口：相続アシスト（税理士と司法書士が連携し、申告から登記までまとめて代行。公式 2026-11-12 確認）。
 */
const LP_ID = 'guide-souzoku-touki-shorui';
const PATH = '/guide/souzoku/touki-shorui';
const TITLE = '相続登記の必要書類チェックリスト｜分け方を選ぶだけ・期限と登録免許税も計算';
const DESCRIPTION = '相続登記の必要書類を、法務局の一覧に合わせて1枚にした無料のチェックリスト（エクセル・PDF）。遺産分割・法定相続分・遺言から選ぶと要る書類と取る場所が出ます。期限（3年以内）と登録免許税（1,000分の4）も自動で計算。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const T = DATA.touki;
const FAQS = [
  { q: '相続登記は自分でできますか？', a: 'できます。登記申請書は新しく持ち主になる相続人が作り、不動産のある地域の法務局に出します。代わりの人に頼むときだけ委任状が要ります（法務局の必要書類の一覧）。' },
  { q: '相続登記で相続人が必要な書類は何ですか？', a: '相続人の戸籍謄本（亡くなった日より後に発行されたもの）、新しく持ち主になる人の住民票です。遺産分割で決めたなら、相続人全員の印鑑証明書も要ります（法務局）。' },
  { q: '相続登記を自分でやると、費用はいくらぐらいかかりますか？', a: '主な費用は登録免許税で、固定資産の価格の1,000分の4です。2027年3月31日までは、価格が100万円以下の土地にはかかりません（国税庁 No.7191。申請書の書き方は法務局の案内で確認）。ほかに戸籍などの交付の手数料がかかります。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = T.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相続登記の必要書類', faqs: FAQS, date: T.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  const cols = T.cases;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-12" path={PATH} eyebrow="相続登記（不動産の名義変更）"
        title={<>相続登記の<br /><span className="text-orange-600">必要書類チェックリスト</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{T.kotae}</p>
            <ToukiShoruiCheck lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="相続税の申告もあるなら、戸籍集めから申告・登記までまとめて任せられる" />
            <SouzokuDownload icon={ClipboardList} h="相続登記の必要書類チェックリスト" s="印刷して、そろえたら印を付ける" files={SOUZOKU_FILES.touki} />
          </div>
        }
        partner="souzokuAssist" exitLead="相続税の申告もあるなら、申告から登記までまとめて任せる" faqs={FAQS} updated="2026年11月12日"
      >
        <section className={SECTION} aria-labelledby="ichiran">
          <h2 id="ichiran" className={H2}>分け方ごとの必要書類一覧</h2>
          <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[12px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr>
                  <th className="px-2 py-2 text-left font-bold">書類（取る所）</th>
                  {cols.map((k) => <th key={k.key} className="w-[52px] px-1 py-2 text-center font-bold">{k.key === 'bunkatsu' ? '遺産分割' : k.key === 'houtei' ? '法定相続分' : '遺言'}</th>)}
                </tr>
              </thead>
              <tbody>
                {T.items.map((it) => (
                  <tr key={it.key} className="border-t border-slate-100 align-top">
                    <td className="px-2 py-2"><span className="font-black text-slate-900">{it.h}</span><br /><span className="text-[11px] text-slate-500">{it.saki}</span></td>
                    {cols.map((k) => <td key={k.key} className="px-1 py-2 text-center text-[15px] font-black text-emerald-700">{it.cases.includes(k.key) ? '○' : <span className="text-slate-300">－</span>}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">{T.shoruiNote}</p>
          <p className={SRC}>出典：{src(['houmuToukiShorui'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="kigen">
          <h2 id="kigen" className={H2}>相続登記の期限と過料</h2>
          <ul className="grid gap-2">
            {[
              { I: Landmark, h: T.kigen, d: '2024年4月1日から義務になりました' },
              { I: Landmark, h: '2024年4月1日より前の相続', d: T.kigenOldNote },
              { I: Gavel, h: '期限を過ぎると', d: T.karyo },
            ].map(({ I, h, d }) => (
              <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <I size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{h}</span><span className="text-[13px] text-slate-600">{d}</span></span>
              </li>
            ))}
          </ul>
          <Link href="/guide/souzoku/souzokunin-shinkoku-touki" className="flex items-center gap-2 text-[13px] font-bold text-sky-700 underline underline-offset-2">分け方が3年以内にまとまらないときの相続人申告登記<ArrowRight size={14} aria-hidden="true" /></Link>
          <p className={SRC}>出典：{src(['mojTouki'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="zei">
          <h2 id="zei" className={H2}>登録免許税の計算</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <tbody>
                <tr className="align-top"><th className="w-[34%] bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700">税率</th><td className="px-3 py-2.5 font-black text-slate-900">価格の1,000分の4（相続）</td></tr>
                <tr className="border-t border-slate-100 align-top"><th className="bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700">価格</th><td className="px-3 py-2.5 text-slate-800">{T.kakaku}</td></tr>
                <tr className="border-t border-slate-100 align-top"><th className="bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700">端数</th><td className="px-3 py-2.5 text-slate-800">{T.hasu}</td></tr>
                <tr className="border-t border-slate-100 align-top"><th className="bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700">免税</th><td className="px-3 py-2.5 text-slate-800">{T.menzeiNote}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">例：土地の価格 5,125,300円 → 課税価格 5,125,000円 × 1,000分の4 ＝ 20,500円。</p>
          <p className={SRC}>出典：{src(['nta7191', 'houmuToumenzei'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>書類を作る順番</h2>
          <ol className="grid gap-2">
            {[
              { h: '誰が相続人かと割合を確かめる', s: '法定相続分の計算', href: '/guide/souzoku/houtei-souzokubun' },
              { h: '相続関係説明図を作る', s: '戸籍の原本を返してもらうときに', href: '/guide/souzoku/souzoku-kankei-setsumeizu' },
              { h: '遺産分割協議書を作る', s: '法務局の記載例の形のひな形', href: '/guide/souzoku/isan-bunkatsu-kyogisho' },
              { h: 'ほかの手続きの期限も確かめる', s: '相続税の申告は10か月以内', href: '/guide/souzoku/tetsuzuki-checklist' },
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
