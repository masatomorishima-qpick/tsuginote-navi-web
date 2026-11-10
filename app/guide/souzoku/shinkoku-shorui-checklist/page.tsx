import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarClock, ClipboardList, FolderOpen } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import ShinkokuShoruiCheck from '@/components/souzoku/ShinkokuShoruiCheck';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の申告の必要書類チェックリスト（2026-11-11 作成。docs/seisaku-queue.md の T4）。
 * 受ける言葉：相続税 申告 必要書類（主）・相続税 申告 必要書類 チェックリスト・相続税 申告 添付書類。
 *   上位5件（11/11、WebSearch）：1 弁護士法人（約1万字・表）2 税理士法人の PDF（2021年・7年加算なし）
 *   3 税理士法人の PDF（2019年）4・5 大手税理士法人（同じ記事、約1.5万字）。国税庁は上位5件にいない。
 *   上位に欠けている点：①エクセルがない ②状況を選んで要る書類だけにする道具がない ③財産ごとにどの表に書くかが一覧にない
 *   ④国税庁の最新の一覧（R8.7）に合わせた確認日がない。
 * 出口：相続アシスト（戸籍集めから申告まで代行）。
 * 書類の元：国税庁「相続税の申告の際に提出していただく主な書類」（R8.7）、「相続税の申告書等の様式一覧（令和8年分用）」。
 */
const LP_ID = 'guide-souzoku-shinkoku-shorui';
const PATH = '/guide/souzoku/shinkoku-shorui-checklist';
const TITLE = '相続税の申告の必要書類チェックリスト｜状況を選ぶだけで一覧に（無料・エクセル）';
const DESCRIPTION = '相続税の申告で出す書類を、国税庁の一覧（R8.7）に合わせて1枚にした無料のチェックリスト（エクセル・PDF）。配偶者の軽減・自宅の土地の特例など、当てはまるものを選ぶと要る書類だけが出ます。財産ごとに書く表も分かります。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const D = DATA.shorui;
const FAQS = [
  { q: '戸籍は、いつ取ったものが使えますか？', a: '国税庁の一覧では、亡くなってから10日を過ぎて作られた戸籍の謄本とされています。法務局で交付される図の形の「法定相続情報一覧図」の写しでも構いません（実子・養子の別が分かるもの）。' },
  { q: 'マイナンバーの書類は、何を出しますか？', a: '番号の確認（マイナンバーカードの裏など）と、本人の確認（カードの表・運転免許証など）の2つです。カードは表と裏の両方の写しが要ります（国税庁）。' },
  { q: '申告の期限はいつですか？', a: `${DATA.zei.kigen}です（国税庁）。書類集めには時間がかかるので、早めにそろえ始めるのが安心です。` },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = D.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相続税の申告の必要書類', faqs: FAQS, date: D.checkedAt });
  const src = (keys: string[]) => keys.map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-11" path={PATH} eyebrow="相続税の申告"
        title={<>相続税の申告<br /><span className="text-orange-600">必要書類チェックリスト</span></>}
        download={
          <div className="flex flex-col gap-3">
            <ShinkokuShoruiCheck lpId={LP_ID} />
            <SouzokuDownload icon={ClipboardList} h="必要書類チェックリスト" s="印刷して、そろえたら印を付ける" files={SOUZOKU_FILES.shinkoku} />
          </div>
        }
        partner="souzokuAssist" exitLead="書類集めから申告まで、まとめて任せる" faqs={FAQS} updated="2026年11月11日"
      >
        <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="書類集めが大変なら、まとめて任せる" />

        <section className={SECTION} aria-labelledby="kyotsu">
          <h2 id="kyotsu" className={H2}>誰でも出す書類</h2>
          <ol className="grid gap-2">
            {D.kyotsu.map((k, i) => (
              <li key={k.key} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] font-black text-white">{i + 1}</span>
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{k.h}</span><span className="text-[12px] text-slate-600">{k.d}</span></span>
              </li>
            ))}
          </ol>
          <p className={SRC}>出典：{src(['ntaShoruiIchiran'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tokurei">
          <h2 id="tokurei" className={H2}>特例を使うときに足す書類</h2>
          <div className="grid gap-2">
            {D.jokyo.map((j) => (
              <div key={j.key} className={`flex flex-col gap-1.5 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 ${'sub' in j && j.sub ? 'ml-4' : ''}`}>
                <p className="text-[14px] font-black text-slate-900">{j.h.replace('└ ', '')}</p>
                <ul className="flex flex-col gap-1">
                  {j.items.map((it) => (
                    <li key={it.h} className="text-[13px] text-slate-700">・{it.h}{it.d && <span className="text-[11px] text-slate-500">（{it.d}）</span>}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className={SRC}>{D.note} 出典：{src(['ntaShoruiIchiran'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="hyo">
          <h2 id="hyo" className={H2}>財産ごとに書く申告書の表</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[12px] text-slate-600">
                <tr><th className="px-3 py-2 text-left font-bold">財産・特例</th><th className="px-3 py-2 text-left font-bold">書く表</th></tr>
              </thead>
              <tbody>
                {D.hyo.map((h) => (
                  <tr key={h.hyo} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2.5 font-black text-slate-900">{h.zaisan}</td>
                    <td className="px-3 py-2.5 text-slate-800"><span className="font-bold">{h.hyo}</span><br /><span className="text-[11px] text-slate-500">{h.name}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
            <FolderOpen size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
            <span className="flex flex-col gap-1"><span className="text-[14px] font-black text-slate-900">金額を書くときに手元に置くもの（例）</span>
              <span className="text-[13px] text-slate-600">{D.tegoto.join('・')}</span></span>
          </div>
          <p className={SRC}>出典：{src(['ntaYoshikiR08'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="junban">
          <h2 id="junban" className={H2}>そろえる順番</h2>
          <ol className="grid gap-2">
            {[
              { h: '相続人を確かめる', s: '戸籍を集め、関係を図にする', href: '/guide/souzoku/souzoku-kankei-setsumeizu' },
              { h: '財産と借金を書き出す', s: '財産目録で、表ごとに分ける', href: '/guide/souzoku/zaisan-mokuroku' },
              { h: '相続税がかかるか計算する', s: '基礎控除を超えるか', href: '/guide/souzoku/souzokuzei-keisan' },
              { h: '分け方を決めて協議書にする', s: '特例を使うなら印鑑証明書も', href: '/guide/souzoku/isan-bunkatsu-kyogisho' },
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
          <p className="flex items-center gap-2 rounded-2xl bg-orange-50 p-3.5 text-[14px] font-bold text-orange-800 ring-1 ring-orange-200">
            <CalendarClock size={20} className="shrink-0" aria-hidden="true" />申告の期限：{DATA.zei.kigen}
          </p>
          <p className={SRC}>出典：{src(['nta4205'])}</p>
        </section>
      </SouzokuArticle>
    </>
  );
}
