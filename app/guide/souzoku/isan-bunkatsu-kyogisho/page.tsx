import type { Metadata } from 'next';
import { BadgeCheck, FileSignature, Stamp, Users } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, NumberedCards, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 遺産分割協議書のひな形（2026-11-05 新設）。docs/haifu-plan.md の「相続の書類のひな形」。
 * 受ける言葉：遺産分割協議書 テンプレート（1,900回/月）・書き方・ひな形・ワード。
 * 出口：いい相続（レントラックス 14647、申請中。承認までボタンは出ない）。
 * 文言の元：法務局「登記申請書の記載例（相続による所有権移転登記・遺産分割）」。ひな形は scripts/souzoku/make_souzoku.py。
 */
const LP_ID = 'guide-souzoku-kyogisho';
const PATH = '/guide/souzoku/isan-bunkatsu-kyogisho';
const TITLE = '遺産分割協議書のひな形（無料）｜書き方は法務局の記載例のとおり【ワード・PDF】';
const DESCRIPTION = '遺産分割協議書の無料のひな形（ワード・PDF、登録不要）。法務局の相続登記の記載例と同じ形で、書く6つのこと、不動産の書き方、署名と実印、印鑑証明書まで。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQS = [
  { q: '手書きでもいいですか？', a: '手書きでもパソコンで作ってもかまいません。ただし、相続人の住所と氏名は本人が書き、実印を押します。' },
  { q: '印鑑証明書は何通いりますか？', a: '相続登記では、協議書に押した実印の印鑑証明書を相続人ごとに1通付けます。作ってから3か月以内のものでなくてもよいとされています（法務局の記載例）。銀行など、ほかの手続きでは期限があることがあります。' },
  { q: '不動産を受け継がない人のことも書きますか？', a: '受け継がない相続人がいても、そのことを書く必要はありません（法務局の記載例）。だれが何を受け継ぐかを書きます。' },
  { q: '相続人の一人が話し合いに来られません。', a: '遺産分割協議は相続人全員で行い、全員が署名と押印をします。集まれなくても、同じ内容の協議書を郵送で回して署名してもらう方法があります。' },
];

export default function Page() {
  const S = DATA.sources;
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '遺産分割協議書のひな形', faqs: FAQS, date: '2026-11-05' });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-05" path={PATH} eyebrow="相続の手続き"
        title={<>遺産分割協議書<br />のひな形</>}
        download={<SouzokuDownload icon={FileSignature} h="遺産分割協議書のひな形" s="法務局の記載例と同じ形" files={SOUZOKU_FILES.kyogisho} />}
        partner="iisouzoku" exitLead="書き方に迷ったら、相続の専門家に無料で相談" faqs={FAQS} updated="2026年11月5日"
      >
        <section className={SECTION} aria-labelledby="kaku">
          <h2 id="kaku" className={H2}>書く6つのこと</h2>
          <NumberedCards items={DATA.kyogisho.points} />
        </section>

        <section className={SECTION} aria-labelledby="fudosan">
          <h2 id="fudosan" className={H2}>不動産は登記のとおり</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { h: '土地', d: ['所在', '地番', '地目', '地積'] },
              { h: '建物', d: ['所在', '家屋番号', '種類', '構造', '床面積'] },
            ].map((b) => (
              <div key={b.h} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-[16px] font-black text-slate-900">{b.h}</p>
                <ul className="mt-2 flex flex-col gap-1 text-[14px] text-slate-700">{b.d.map((t) => <li key={t}>・{t}</li>)}</ul>
              </div>
            ))}
          </div>
          <p className="text-[14px] text-slate-700">登記事項証明書（法務局で取れる）に書いてあるとおりに写します。住所の書き方と違うことがあるので注意します。</p>
        </section>

        <section className={SECTION} aria-labelledby="inkan">
          <h2 id="inkan" className={H2}>署名と実印</h2>
          <ul className="grid grid-cols-3 gap-2">
            {[{ icon: Users, h: '全員', d: '相続人の全員' }, { icon: FileSignature, h: '自分で書く', d: '住所と氏名' }, { icon: Stamp, h: '実印', d: '印鑑証明書を1通' }].map(({ icon: I, h, d }) => (
              <li key={h} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white px-2 py-4 text-center ring-1 ring-slate-200">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="text-[14px] font-black text-slate-900">{h}</span>
                <span className="text-[11px] text-slate-500">{d}</span>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-2">
            {DATA.kyogisho.notes.map((t) => (
              <li key={t} className="flex items-start gap-2 text-[14px] text-slate-700"><BadgeCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />{t}</li>
            ))}
          </ul>
          <p className={SRC}>出典：<a href={S.houmuKisai.url} target="_blank" rel="noopener noreferrer" className={A}>{S.houmuKisai.name}</a>（{DATA.checkedAt.split('-').join('/')} 確認）</p>
        </section>
      </SouzokuArticle>
    </>
  );
}
