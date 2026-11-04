import type { Metadata } from 'next';
import { ArrowDown, FileStack, Network } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, NumberedCards, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続関係説明図のひな形（2026-11-05 新設）。
 * 受ける言葉：相続関係説明図 テンプレート（1,000回/月、前年比+48%）・書き方・エクセル。
 * 出口：いい相続（申請中。承認までボタンは出ない）。文言の元：法務局の記載例。
 */
const LP_ID = 'guide-souzoku-setsumeizu';
const PATH = '/guide/souzoku/souzoku-kankei-setsumeizu';
const TITLE = '相続関係説明図のひな形（無料）｜書き方と、戸籍の原本を返してもらう使い方【エクセル・PDF】';
const DESCRIPTION = '相続関係説明図の無料のひな形（エクセル・PDF、登録不要）。法務局の記載例と同じ欄で、亡くなった人と相続人の書き方、「（分割）」の書き方、戸籍の原本を返してもらう使い方まで。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQS = [
  { q: '相続関係説明図は何に使いますか？', a: '相続登記の申請で出すと、添付した戸籍の原本を、登記の調べが終わったあとに返してもらえます（原本還付。法務局の記載例）。相続人のつながりを1枚で見せる書類です。' },
  { q: '法定相続情報一覧図とは違いますか？', a: '別のものです。法定相続情報一覧図は法務局に申し出て、写しを交付してもらうものです。写しがあれば、相続登記で戸籍の代わりに出せます。' },
  { q: '「（分割）」とは何ですか？', a: '遺産分割の話し合いで、その不動産を受け継がなかった相続人の名前の横に書く言葉です（法務局の記載例）。' },
];

export default function Page() {
  const S = DATA.sources;
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相続関係説明図のひな形', faqs: FAQS, date: '2026-11-05' });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-05" path={PATH} eyebrow="相続の手続き"
        title={<>相続関係説明図<br />のひな形</>}
        download={<SouzokuDownload icon={Network} h="相続関係説明図のひな形" s="配偶者と子3人まで。行を足して使える" files={SOUZOKU_FILES.setsumeizu} />}
        partner="iisouzoku" exitLead="戸籍集めや登記に迷ったら、相続の専門家に無料で相談" faqs={FAQS} updated="2026年11月5日"
      >
        <section className={SECTION} aria-labelledby="zu">
          <h2 id="zu" className={H2}>図の形</h2>
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="rounded-xl border-2 border-slate-700 px-3 py-2 text-center text-[13px] font-bold">亡くなった人<span className="block text-[11px] font-normal text-slate-500">最後の住所・亡くなった日</span></div>
              <span className="text-[18px] font-black text-slate-500">＝</span>
              <div className="rounded-xl border-2 border-slate-400 px-3 py-2 text-center text-[13px] font-bold">配偶者<span className="block text-[11px] font-normal text-slate-500">住所・生年月日</span></div>
            </div>
            <ArrowDown size={18} className="text-slate-400" aria-hidden="true" />
            <div className="grid w-full grid-cols-2 gap-2">
              <div className="rounded-xl border-2 border-slate-400 px-3 py-2 text-center text-[13px] font-bold">子<span className="block text-[11px] font-normal text-slate-500">住所・生年月日</span></div>
              <div className="rounded-xl border-2 border-dashed border-slate-400 px-3 py-2 text-center text-[13px] font-bold">子（分割）<span className="block text-[11px] font-normal text-slate-500">受け継がない人</span></div>
            </div>
          </div>
        </section>

        <section className={SECTION} aria-labelledby="kaku">
          <h2 id="kaku" className={H2}>書く4つのこと</h2>
          <NumberedCards items={DATA.setsumeizu.points} />
        </section>

        <section className={SECTION} aria-labelledby="genpon">
          <h2 id="genpon" className={H2}>戸籍の原本を返してもらう</h2>
          <ul className="flex flex-col gap-2">
            {DATA.setsumeizu.notes.map((t) => (
              <li key={t} className="flex items-start gap-2 rounded-2xl bg-white p-4 text-[14px] text-slate-700 ring-1 ring-slate-200"><FileStack size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{t}</li>
            ))}
          </ul>
          <p className={SRC}>出典：<a href={S.houmuKisai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.houmuKisai.name}</a>（{DATA.checkedAt.split('-').join('/')} 確認）</p>
        </section>
      </SouzokuArticle>
    </>
  );
}
