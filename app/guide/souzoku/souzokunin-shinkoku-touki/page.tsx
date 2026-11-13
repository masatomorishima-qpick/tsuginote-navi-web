import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ClipboardList, Gavel, Landmark, Mail, Monitor, PenLine } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import ShinkokuToukiCheck from '@/components/souzoku/ShinkokuToukiCheck';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続人申告登記の必要書類とやり方（2026-11-14 作成。docs/seisaku-queue.md の T22）。
 * 受ける言葉：相続人申告登記 必要書類（主）・相続人申告登記 やり方・相続人申告登記 自分で・相続人申告登記 期限。
 *   上位5件（11/14、WebSearch。Chrome につながらず）：1 司法書士法人（2026/8、記入見本は文字だけ）2 弁護士法人（2026/2）
 *   3 行政書士法人（2026/9、条文が詳しい）4 大手税理士法人（相続登記の申請書の記事で、相続人申告登記には触れない）5 サライ（相続登記の記事で、触れない）。
 *   上位が答えている疑問：相続登記との違い・3年の期限と過料・戸籍と住民票・提出先・登録免許税がかからない・単独でできるが効果は本人だけ。
 *   上位に欠けている点：①続柄を選ぶと要る戸籍が出る道具がない ②期限（3年・2027/3/31・遺産分割から3年）を自分の日付で出す計算がない
 *   ③申出書に書く項目の下書き表（エクセル・PDF）がない ④住民票を省略できる条件と郵送の書き方（書留・封筒の表書き）が1か所にない。
 * 出口：相続アシスト（税理士・弁護士・司法書士が連携し、戸籍集めから申告まで。公式 2026-11-12 確認）。
 */
const LP_ID = 'guide-souzoku-shinkoku-touki';
const PATH = '/guide/souzoku/souzokunin-shinkoku-touki';
const TITLE = '相続人申告登記の必要書類とやり方｜続柄を選ぶと書類が出る・期限も計算';
const DESCRIPTION = '相続人申告登記の必要書類を、法務省の案内に合わせて1枚にした無料のチェックリスト（エクセル・PDF）。配偶者・子・親・兄弟姉妹から選ぶと要る戸籍が出て、期限（3年以内）も日付で分かります。申出書に書く項目と、相続登記との違いの表も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const T = DATA.shinkokuTouki;
const FAQS = [
  { q: '相続人申告登記は自分でできますか？', a: 'できます。申出書は法務省の様式で作れ、押印は要りません。不動産の所在地の法務局に持って行くか書留で送るほか、ウェブの「かんたん登記・供託申請」でも出せます（法務省）。' },
  { q: '相続人申告登記をすれば、相続登記はしなくてよいですか？', a: 'いいえ。相続人申告登記で果たせるのは、申し出た人の3年以内の義務だけです。遺産分割がまとまったら、その日から3年以内に相続登記が要り、売るときや担保にするときも相続登記が要ります（法務省）。' },
  { q: '相続人申告登記の費用はいくらですか？', a: '登録免許税はかかりません（法務省）。かかるのは戸籍や住民票の交付の手数料と、郵送するときの書留の料金です。' },
];
const DASHI_ICONS = [Landmark, Mail, Monitor];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = T.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相続人申告登記の必要書類', faqs: FAQS, date: T.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-14" path={PATH} eyebrow="相続人申告登記（相続登記の義務を果たす簡単な方法）"
        title={<>相続人申告登記の<br /><span className="text-orange-600">必要書類とやり方</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{T.kotae}</p>
            <ShinkokuToukiCheck lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="相続税もかかりそうなら、戸籍集めから申告までまとめて任せられる" />
            <SouzokuDownload icon={ClipboardList} h="相続人申告登記のチェックリスト" s="書類の一覧と、申出書に書く項目の下書き" files={SOUZOKU_FILES.shinkokuTouki} />
          </div>
        }
        partner="souzokuAssist" exitLead="相続税もかかりそうなら、戸籍集めから申告までまとめて任せる" faqs={FAQS} updated="2026年11月14日"
      >
        <section className={SECTION} aria-labelledby="koseki">
          <h2 id="koseki" className={H2}>続柄ごとに要る戸籍</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <tbody>
                {T.zokugara.map((z, i) => (
                  <tr key={z.key} className={`align-top ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                    <th className="w-[30%] bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700">{z.h}</th>
                    <td className="px-3 py-2.5 text-slate-800"><ul className="flex flex-col gap-1">{z.koseki.map((k) => <li key={k}>・{k}</li>)}</ul></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">{T.kosekiNote}{T.kawari}</p>
          <Link href="/guide/souzoku/koseki-atsumekata" className="flex items-center gap-2 text-[13px] font-bold text-sky-700 underline underline-offset-2">戸籍の集め方と手数料の計算<ArrowRight size={14} aria-hidden="true" /></Link>
          <p className={SRC}>出典：{src(['mojShinkoku', 'mojShinkokuAnnai'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="kisai">
          <h2 id="kisai" className={H2}>申出書に書くこと</h2>
          <ol className="grid gap-2">
            {T.kisai.map((k, i) => (
              <li key={k.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-50 text-[13px] font-black text-sky-700">{i + 1}</span>
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{k.h}</span><span className="text-[13px] text-slate-600">{k.d}</span></span>
              </li>
            ))}
          </ol>
          <p className="flex items-start gap-2 text-[13px] text-slate-700"><PenLine size={16} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />相続人が何人かいるときは、連名で1枚の申出書にまとめられます。ほかの相続人の分を代わりに申し出ることもできます。</p>
          <p className={SRC}>出典：{src(['mojShinkokuKisai', 'mojShinkoku', 'mojGimuQA'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="dasu">
          <h2 id="dasu" className={H2}>出し方は3つ</h2>
          <ul className="grid gap-2">
            {T.dashikata.map((t, i) => {
              const I = DASHI_ICONS[i] ?? Landmark;
              return (
                <li key={t.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <I size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                  <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{t.h}</span><span className="text-[13px] text-slate-600">{t.d}</span></span>
                </li>
              );
            })}
          </ul>
          <p className="text-[13px] text-slate-700">{T.kiroku}</p>
          <p className={SRC}>出典：{src(['mojShinkoku', 'mojShinkokuAnnai'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="chigai">
          <h2 id="chigai" className={H2}>相続登記との違い</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[12px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="w-[24%] px-2 py-2 text-left font-bold"></th><th className="px-2 py-2 text-left font-bold">相続人申告登記</th><th className="px-2 py-2 text-left font-bold">相続登記</th></tr>
              </thead>
              <tbody>
                {T.hikaku.map((r) => (
                  <tr key={r.h} className="border-t border-slate-100 align-top">
                    <th className="bg-slate-50 px-2 py-2 text-left font-bold text-slate-700">{r.h}</th>
                    <td className="px-2 py-2 font-bold text-slate-900">{r.a}</td>
                    <td className="px-2 py-2 text-slate-700">{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/guide/souzoku/touki-shorui" className="flex items-center gap-2 text-[13px] font-bold text-sky-700 underline underline-offset-2">相続登記の必要書類と登録免許税の計算<ArrowRight size={14} aria-hidden="true" /></Link>
          <p className={SRC}>出典：{src(['mojShinkoku', 'mojGimuQA', 'nta7191'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="kigen">
          <h2 id="kigen" className={H2}>期限と過料</h2>
          <ul className="grid gap-2">
            {[
              { I: Landmark, h: T.kigen, d: T.kigenOldNote },
              { I: Landmark, h: '遺産分割がまとまったら', d: T.bunkatsu },
              { I: Gavel, h: '期限を過ぎると', d: T.karyo },
            ].map(({ I, h, d }) => (
              <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <I size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{h}</span><span className="text-[13px] text-slate-600">{d}</span></span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['mojTouki', 'mojGimuQA'])}（{checked} 確認）</p>
        </section>
      </SouzokuArticle>
    </>
  );
}
