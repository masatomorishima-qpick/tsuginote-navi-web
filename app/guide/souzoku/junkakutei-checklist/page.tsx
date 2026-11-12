import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ClipboardList, FolderOpen, Info, Users } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import JunkakuteiCheck from '@/components/souzoku/JunkakuteiCheck';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 準確定申告の必要書類チェックリスト（2026-11-12 作成。docs/seisaku-queue.md の T12）。
 * 受ける言葉：準確定申告 必要書類（主）・準確定申告 やり方・準確定申告 期限・準確定申告 付表。
 *   上位5件（11/12、Chrome で Google）：1 国税庁 No.2022 2 税理士法人の相談窓口（約8,000字・表1、日付なし）
 *   3 税理士法人（約5,500字・表が多い、2025/7 更新）4 メガバンクの相続の案内（2025/10）5 弁護士事務所の質問と回答（2019年）。
 *   上位に欠けている点：①知った日を入れると期限の日付が出る計算がない ②当てはまるものを選ぶと出す書類だけになる道具がない
 *   ③国税庁の作成コーナーでは準確定申告書を作れないこと（e-Tax ソフトなど）を書いた所がない ④印刷用のチェックリストがない。
 * 出口：相続アシスト（相続税の申告の代行。準確定申告も必要に応じて提案、公式 2026-11-12 確認）。
 */
const LP_ID = 'guide-souzoku-junkakutei';
const PATH = '/guide/souzoku/junkakutei-checklist';
const TITLE = '準確定申告の必要書類チェックリスト｜期限の日付も自動で出る（無料・エクセル）';
const DESCRIPTION = '準確定申告は、相続を知った日の翌日から4か月以内。亡くなったことを知った日を入れると期限の日付が、医療費・保険料・事業など当てはまるものを選ぶと出す書類だけが出ます。付表・委任状・源泉徴収票の扱いも国税庁の資料で確認。無料のエクセル・PDF付き。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const J = DATA.junkakutei;
const FAQS = [
  { q: '亡くなった人の準確定申告はどうすればいいですか？', a: '相続人が、1月1日から亡くなった日までの所得と税額を計算し、準確定申告書に付表を付けて、亡くなった時の納税地（ふつうは住所地）の税務署に出します。期限は相続を知った日の翌日から4か月以内です（国税庁 No.2022）。' },
  { q: '準確定申告は自分でできますか？', a: 'できます。ただし国税庁の「確定申告書等作成コーナー」では準確定申告書は作れないため、e-Tax ソフトなどを使うか、書面で作ります（国税庁）。' },
  { q: '年金だけの人も、準確定申告が要りますか？', a: `${J.nenkin}（国税庁 No.1600）` },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = J.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '準確定申告の必要書類', faqs: FAQS, date: J.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-12" path={PATH} eyebrow="亡くなった人の所得税"
        title={<>準確定申告の<br /><span className="text-orange-600">必要書類チェックリスト</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{J.kotae}<span className="text-[11px] text-slate-500">（国税庁 No.2022）</span></p>
            <JunkakuteiCheck lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="遺産が基礎控除を超えるなら、次は相続税の申告（10か月以内）。まとめて任せられる" />
            <SouzokuDownload icon={ClipboardList} h="準確定申告の必要書類チェックリスト" s="印刷して、そろえたら印を付ける" files={SOUZOKU_FILES.junkakutei} />
          </div>
        }
        partner="souzokuAssist" exitLead="相続税の申告も要るなら、まとめて任せる" faqs={FAQS} updated="2026年11月12日"
      >
        <section className={SECTION} aria-labelledby="kihon">
          <h2 id="kihon" className={H2}>誰でも出す書類</h2>
          <ol className="grid gap-2">
            {J.kihon.map((k, i) => (
              <li key={k.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] font-black text-white">{i + 1}</span>
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{k.h}</span><span className="text-[12px] text-slate-600">{k.d}</span></span>
              </li>
            ))}
          </ol>
          <p className={SRC}>出典：{src(J.kihon.map((k) => k.src))}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="jokyo">
          <h2 id="jokyo" className={H2}>控除や所得によって足す書類</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[12px] text-slate-600">
                <tr><th className="px-3 py-2 text-left font-bold">当てはまるとき</th><th className="px-3 py-2 text-left font-bold">足す書類</th></tr>
              </thead>
              <tbody>
                {J.jokyo.map((j) => (
                  <tr key={j.key} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2.5 font-black text-slate-900">{j.h}</td>
                    <td className="px-3 py-2.5 text-slate-800">{j.items.map((it) => <span key={it.h} className="block"><span className="font-bold">{it.h}</span><br /><span className="text-[11px] text-slate-500">{it.d}</span></span>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
            <FolderOpen size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
            <span className="flex flex-col gap-1"><span className="text-[14px] font-black text-slate-900">書くときに手元に置くもの（例）</span>
              <span className="text-[13px] text-slate-600">{J.tegoto.join('・')}</span></span>
          </div>
          <p className={SRC}>出典：{src([...J.jokyo.map((j) => j.src), 'ntaGensenFuyo'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsumazuki">
          <h2 id="tsumazuki" className={H2}>準確定申告でつまずきやすい所</h2>
          <ul className="grid gap-2">
            {[
              { I: Users, h: '相続人が2人以上いるとき', d: J.fukusu, s: 'nta2022' },
              { I: Info, h: '作成コーナーでは作れない', d: J.sakusei, s: 'ntaJunkakuEtax' },
              { I: Info, h: '源泉徴収票は付けなくてよい', d: J.gensen, s: 'ntaGensenFuyo' },
              { I: Info, h: '前の年の申告もまだなら', d: '1月1日から確定申告の期限（ふつう3月15日）までに、前の年の確定申告をしないまま亡くなったときは、前の年の分も同じ4か月以内に申告します。', s: 'nta2022' },
            ].map(({ I, h, d }) => (
              <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <I size={20} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{h}</span><span className="text-[13px] text-slate-600">{d}</span></span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['nta2022', 'ntaJunkakuEtax', 'ntaGensenFuyo'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>準確定申告の後の手続き</h2>
          <ol className="grid gap-2">
            {[
              { h: 'ほかの手続きの期限を日付で見る', s: '相続放棄3か月・相続税10か月', href: '/guide/souzoku/tetsuzuki-checklist' },
              { h: '相続税がかかるか計算する', s: '基礎控除を超えるか', href: '/guide/souzoku/souzokuzei-keisan' },
              { h: '相続税の申告の必要書類をそろえる', s: '状況を選ぶと一覧に', href: '/guide/souzoku/shinkoku-shorui-checklist' },
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
