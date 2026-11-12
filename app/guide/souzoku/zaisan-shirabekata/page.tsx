import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, ClipboardList, Landmark, ScrollText } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import ZaisanShirabeCheck from '@/components/souzoku/ZaisanShirabeCheck';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続財産の調べ方チェックリスト（2026-11-13 作成。docs/seisaku-queue.md の T13）。
 * 受ける言葉：相続財産 調べ方（主）・相続財産 調査 自分で・名寄帳 取り方 相続・残高証明書 相続。
 *   上位5件（11/13、WebSearch。Chrome につながらず）：1・4 弁護士法人（2026/7 更新、約1万字。表2つ・配布物なし）
 *   2 税理士の紹介会社（2026/3、裁判所の財産目録へのリンク）3 行政書士法人（2026/9、表2つ・配布物なし）
 *   5 法律の情報サイト（2026/2、裁判所の財産目録）。
 *   上位に欠けている点：①選ぶと窓口・証明・手数料が一覧になる道具がない ②手数料を書いているのは0件（ほふりは2026/10/1 改定）
 *   ③所有不動産記録証明（2026/2/2〜）に触れたのは1件 ④印刷できるチェックリストがない ⑤期限を自分の日付で出せない。
 * 出口：相続アシスト（戸籍集めから申告まで代行。公式 2026-11-12 確認）。
 */
const LP_ID = 'guide-souzoku-zaisan-shirabekata';
const PATH = '/guide/souzoku/zaisan-shirabekata';
const TITLE = '相続財産の調べ方チェックリスト｜財産ごとの窓口・手数料・期限が分かる';
const DESCRIPTION = '相続財産の調べ方を、預貯金・不動産・株・生命保険・借金の5つに分けて1枚に。手がかりのある財産を選ぶと、調べる窓口・取る証明・手数料が一覧になります。所有不動産記録証明（2026年2月から）、ほふりの新しい手数料にも対応。無料のエクセル・PDF付き。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const Z = DATA.shirabe;
const FAQS = [
  { q: '亡くなった人の銀行口座を調べる方法は？', a: '通帳やキャッシュカード、郵便物で銀行の見当を付け、その銀行に亡くなった日の残高証明書を請求します。亡くなった人が口座にマイナンバーを登録していれば、どこか1つの金融機関で口座の所在を照会できます（デジタル庁）。' },
  { q: '亡くなった人の不動産を全部調べる方法は？', a: '法務局の所有不動産記録証明書で、亡くなった人の名義の不動産を全国から一覧にできます（2026年2月2日から。書面の請求で1,600円）。市区町村の名寄帳では、その市区町村の中の分が分かります（法務省・横浜市）。' },
  { q: '亡くなった人の借金を調べるには？', a: '信用情報機関に開示を請求します。全国銀行個人信用情報センターは2,403円、CICは1,650円で、どちらも法定相続人が郵送で申し込めます。借金が多いときの相続放棄は、知った時から3か月以内です（全国銀行協会・CIC・裁判所）。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = Z.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相続財産の調べ方', faqs: FAQS, date: Z.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  const allSrc = Z.items.flatMap((it) => it.rows.flatMap((r) => r.src));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-13" path={PATH} eyebrow="相続財産の調査"
        title={<>相続財産の<br /><span className="text-orange-600">調べ方チェックリスト</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{Z.kotae}</p>
            <ZaisanShirabeCheck lpId={LP_ID} />
            <p className="rounded-xl bg-white p-3 text-[13px] leading-relaxed text-slate-700 ring-1 ring-slate-200">
              調べた財産の合計が基礎控除（3,000万円＋600万円×法定相続人の数）を超えそうなら、相続税の申告が要ります。
              <Link href="/guide/souzoku/souzokuzei-keisan" className="ml-1 font-bold text-sky-800 underline underline-offset-2">相続税の計算</Link>
            </p>
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="申告が要りそうなら、戸籍集めから相続税の申告までまとめて任せられる" />
            <SouzokuDownload icon={ClipboardList} h="相続財産の調べ方チェックリスト" s="窓口・持ち物・手数料つき。印刷して印を付ける" files={SOUZOKU_FILES.shirabe} />
          </div>
        }
        partner="souzokuAssist" exitLead="財産がそろったら、相続税の申告まで任せる" faqs={FAQS} updated="2026年11月13日"
      >
        <section className={SECTION} aria-labelledby="ichiran">
          <h2 id="ichiran" className={H2}>財産ごとの調べ先と手数料</h2>
          <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[12px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-2 py-2 text-left font-bold">財産</th><th className="px-2 py-2 text-left font-bold">窓口と分かること</th><th className="w-[30%] px-2 py-2 text-left font-bold">手数料</th></tr>
              </thead>
              <tbody>
                {Z.items.flatMap((it) => it.rows.map((r, j) => (
                  <tr key={`${it.key}-${j}`} className="border-t border-slate-100 align-top">
                    {j === 0 && <td rowSpan={it.rows.length} className="px-2 py-2 font-black text-slate-900">{it.h}</td>}
                    <td className="px-2 py-2"><span className="font-bold text-sky-800">{r.saki}</span><br /><span className="text-slate-700">{r.shomei}</span></td>
                    <td className="px-2 py-2 text-slate-700">{r.hiyou}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
          <p className={SRC}>出典：{src(allSrc)}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="fudosan">
          <h2 id="fudosan" className={H2}>不動産の調べ方：名寄帳と所有不動産記録証明</h2>
          <ul className="grid gap-2">
            {[
              { I: Landmark, h: '所有不動産記録証明書（法務局）', d: '全国の不動産を一覧に。どこの法務局でも、郵送・オンラインでも請求できる', n: Z.shoyuNote },
              { I: Building2, h: '名寄帳（市区町村）', d: '不動産のある市区町村ごとに請求。評価額も分かる', n: Z.nayoseNote },
            ].map(({ I, h, d, n }) => (
              <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <I size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col gap-0.5"><span className="text-[15px] font-black text-slate-900">{h}</span><span className="text-[13px] text-slate-700">{d}</span><span className="text-[12px] text-slate-500">{n}</span></span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['mojShoyu', 'yokohamaNayose'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="kabu">
          <h2 id="kabu" className={H2}>株・生命保険・借金の調べ方</h2>
          <ul className="grid gap-2">
            {[
              { h: '株・投資信託', d: Z.hofuriNote },
              { h: '生命保険', d: '生命保険協会の照会で分かるのは、契約があるかどうかだけです。見つかったら、その保険会社に連絡します。' },
              { h: '借金・カード', d: '全国銀行個人信用情報センター・CIC・JICC の3つとも、法定相続人が開示を申し込めます。借金が多いと分かったら、相続放棄の期限（3か月）に気を付けます。' },
            ].map((f) => (
              <li key={f.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <ScrollText size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="flex flex-col gap-0.5"><span className="text-[15px] font-black text-slate-900">{f.h}</span><span className="text-[13px] text-slate-700">{f.d}</span></span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['jasdecKaiji', 'seihoShokai', 'kscSouzoku', 'cicYuso', 'jiccSouzoku', 'courtHouki'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>調べたあとの順番</h2>
          <ol className="grid gap-2">
            {[
              { h: '財産目録に書き出す', s: 'エクセル・PDF。合計は自動', href: '/guide/souzoku/zaisan-mokuroku' },
              { h: '相続税がかかるか確かめる', s: '基礎控除と税額の目安', href: '/guide/souzoku/souzokuzei-keisan' },
              { h: '誰がいくら受け継ぐか', s: '法定相続分の計算', href: '/guide/souzoku/houtei-souzokubun' },
              { h: '期限を日付で確かめる', s: '相続の手続きチェックリスト', href: '/guide/souzoku/tetsuzuki-checklist' },
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
