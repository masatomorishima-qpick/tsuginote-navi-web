import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import TetsuzukiKigen from '@/components/souzoku/TetsuzukiKigen';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続の手続きチェックリスト（期限つき）（2026-11-10 作成。docs/seisaku-queue.md の T1）。
 * 受ける言葉：相続 手続き チェックリスト・死亡後 手続き 一覧表・亡くなったら 手続き 一覧・相続 手続き 期限 一覧。
 *   上位（11/10）は小さな法律・税理士事務所が中心で、ひな形の配布サイトと同じく崩せる見込み。相続のひな形の4ページとつなぐ。
 * 出口：相続アシスト（戸籍集めから申告まで代行。こちらはサインと面談だけ）。
 * 期限の元：法務省（死亡届・相続登記）、日本年金機構（年金の死亡届・未支給年金）、裁判所（相続放棄）、国税庁（準確定申告・相続税）。
 */
const LP_ID = 'guide-souzoku-tetsuzuki';
const PATH = '/guide/souzoku/tetsuzuki-checklist';
const TITLE = '相続の手続きチェックリスト（無料・エクセル）｜亡くなった後の期限を日付で一覧に';
const DESCRIPTION = '家族が亡くなった後の相続の手続きを、期限の早い順に一覧にした無料のチェックリスト（エクセル・PDF）。亡くなった日を入れると、相続放棄（3か月）・準確定申告（4か月）・相続税（10か月）・相続登記（3年）の期限の目安が日付で出ます。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const T = DATA.tetsuzuki;
const FAQS = [
  { q: '年金の死亡届は、必ず出しますか？', a: '日本年金機構にマイナンバーが登録されている人は、原則として出さなくてよくなっています。ただし、まだ受け取っていない年金（未支給年金）を受け取るための届け出は必要です（日本年金機構）。' },
  { q: '相続登記をしないとどうなりますか？', a: '2024年4月から義務になり、不動産を相続で取得したと知った日から3年以内に申請が必要です。正当な理由なく怠ると、10万円以下の過料の対象になります（法務省）。' },
  { q: '手続きが多くて、自分では手が回りません。', a: '戸籍集め・財産の調べ・相続税の申告・登記を、まとめて専門家に頼めるところがあります。期限の近いもの（相続放棄の3か月、相続税の10か月）から、早めに相談するのが安心です。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = T.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相続の手続きチェックリスト', faqs: FAQS, date: T.checkedAt });
  const keys = [...new Set(T.items.map((i) => i.src))];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v2-2026-11-13" path={PATH} eyebrow="相続の手続き"
        title={<>相続の手続き<br /><span className="text-orange-600">期限の一覧</span></>}
        download={
          <div className="flex flex-col gap-3">
            <TetsuzukiKigen lpId={LP_ID} />
            <SouzokuDownload icon={ClipboardList} h="手続きチェックリスト" s="期限の日付を自動で。印刷してチェック" files={SOUZOKU_FILES.tetsuzuki} />
          </div>
        }
        partner="souzokuAssist" exitLead="手続きをまとめて任せる" faqs={FAQS} updated="2026年11月10日"
      >
        <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="期限に間に合わせたいなら、まとめて任せる" />

        <section className={SECTION} aria-labelledby="kigen">
          <h2 id="kigen" className={H2}>期限のある手続き</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[12px] text-slate-600">
                <tr><th className="px-3 py-2 text-left font-bold">手続き</th><th className="px-3 py-2 text-left font-bold">期限</th></tr>
              </thead>
              <tbody>
                {T.items.map((it) => (
                  <tr key={it.key} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2.5"><span className="font-black text-slate-900">{it.h}</span><br /><span className="text-[11px] text-slate-500">{it.saki}</span></td>
                    <td className="px-3 py-2.5 text-slate-800">{it.kigen}<br /><span className="text-[11px] text-slate-500">{it.memo}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={SRC}>
            出典：{keys.map((k, i) => <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>)}（{checked} 確認）
          </p>
        </section>

        <section className={SECTION} aria-labelledby="junbi">
          <h2 id="junbi" className={H2}>期限の前にしておくこと</h2>
          <ol className="grid gap-2">
            {T.junbi.map((j, i) => (
              <li key={j.h}>
                {j.href ? (
                  <Link href={j.href} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200 hover:ring-slate-300">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] font-black text-white">{i + 1}</span>
                    <span className="flex-1 text-[14px] font-bold text-slate-900">{j.h}</span>
                    <span className="flex items-center gap-1 text-[12px] font-bold text-sky-700">{j.href.includes('keisan') ? '計算' : j.href.includes('checklist') ? 'チェック' : 'ひな形'}<ArrowRight size={14} aria-hidden="true" /></span>
                  </Link>
                ) : (
                  <span className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] font-black text-white">{i + 1}</span>
                    <span className="flex-1 text-[14px] font-bold text-slate-900">{j.h}</span>
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      </SouzokuArticle>
    </>
  );
}
