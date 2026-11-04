import type { Metadata } from 'next';
import { Banknote, Calculator, CalendarClock, Home, LineChart, ReceiptText } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 財産目録のテンプレート（2026-11-05 新設）。
 * 受ける言葉：財産目録 テンプレート（590回/月）・財産目録 エクセル（390回/月）・書き方・相続。
 * 出口：相続アシスト（レントラックス 15468、提携中。リンク発行まではボタンは出ない）。
 *   橋：財産の合計が基礎控除（3,000万円＋600万円×法定相続人の数）を超えたら申告が要る → 申告をまとめて頼む。
 * 欄の元：松山家庭裁判所「遺産分割申立書」の遺産目録。基礎控除と期限：国税庁「相続税の申告のしかた」。
 */
const LP_ID = 'guide-souzoku-mokuroku';
const PATH = '/guide/souzoku/zaisan-mokuroku';
const TITLE = '財産目録のテンプレート（無料・エクセル）｜相続税の申告が要るかも自動で判定';
const DESCRIPTION = '相続の財産目録の無料テンプレート（エクセル・PDF、登録不要）。裁判所の遺産目録と同じ欄で、不動産・預貯金・株式を書き出すと合計を自動計算。基礎控除を超えるか（相続税の申告が要るか）の目安も出ます。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const FAQS = [
  { q: '不動産の金額は何で書きますか？', a: '目録には、固定資産税の評価額（毎年届く納税通知書や評価証明書に書いてある額）を書きます。相続税を計算するときの土地の評価（路線価など）とは違うので、判定は目安です。' },
  { q: '借金も書きますか？', a: '裁判所の遺産目録には借金の欄はありませんが、相続するか（相続放棄をするか）を決めるために、別に書き出しておくと役に立ちます。ひな形には借金の欄も付けています。' },
  { q: '相続税の申告はいつまでですか？', a: '亡くなったことを知った日（ふつうは亡くなった日）の翌日から10か月目の日までです（国税庁）。期限を過ぎると、加算税や延滞税がかかることがあります。' },
];

export default function Page() {
  const S = DATA.sources;
  const K = DATA.mokuroku.kiso;
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '財産目録のテンプレート', faqs: FAQS, date: '2026-11-05' });
  const man = (v: number) => `${(v / 10000).toLocaleString('ja-JP')}万円`;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-05" path={PATH} eyebrow="相続の手続き"
        title={<>財産目録の<br />テンプレート</>}
        download={<SouzokuDownload icon={ReceiptText} h="財産目録" s="合計と、申告が要るかの目安を自動で" files={SOUZOKU_FILES.mokuroku} />}
        partner="souzokuAssist" exitLead="申告が要りそうなら、相続税の申告をまとめて頼む" faqs={FAQS} updated="2026年11月5日"
      >
        <section className={SECTION} aria-labelledby="ran">
          <h2 id="ran" className={H2}>書き出す3つの表</h2>
          <ul className="grid gap-2.5">
            {[
              { icon: Home, h: '不動産', d: DATA.mokuroku.fudosan.slice(1, 7).join('・') },
              { icon: Banknote, h: '預貯金・現金など', d: DATA.mokuroku.yokin.slice(1, 5).join('・') },
              { icon: LineChart, h: '株式など', d: DATA.mokuroku.kabu.slice(1, 5).join('・') },
            ].map(({ icon: I, h, d }) => (
              <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><I size={20} aria-hidden="true" /></span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-black text-slate-900">{h}</span>
                  <span className="text-[12px] leading-relaxed text-slate-600">{d}</span>
                </span>
              </li>
            ))}
          </ul>
          <ul className="flex flex-col gap-1.5 text-[13px] text-slate-700">{DATA.mokuroku.notes.map((t) => <li key={t}>・{t}</li>)}</ul>
          <p className={SRC}>欄の元：<a href={S.courtMokuroku.url} target="_blank" rel="noopener noreferrer" className={A}>{S.courtMokuroku.name}</a></p>
        </section>

        <section className={SECTION} aria-labelledby="kiso">
          <h2 id="kiso" className={H2}>相続税の申告が要るか</h2>
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-white p-4 text-center ring-1 ring-slate-200">
            <Calculator size={22} className="text-sky-700" aria-hidden="true" />
            <p className="text-[13px] font-bold text-slate-600">基礎控除</p>
            <p className="text-[20px] font-black text-slate-900">{man(K.base)}＋{man(K.per)}×相続人の数</p>
            <p className="text-[12px] text-slate-500">財産の合計がこれを超えたら、申告が要る</p>
          </div>
          <ul className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((n) => (
              <li key={n} className="flex flex-col items-center gap-0.5 rounded-2xl bg-white px-2 py-3 text-center ring-1 ring-slate-200">
                <span className="text-[12px] text-slate-500">相続人{n}人</span>
                <span className="text-[16px] font-black text-orange-600">{man(K.base + K.per * n)}</span>
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-[14px] text-slate-800 ring-1 ring-sky-200">
            <CalendarClock size={18} className="shrink-0 text-sky-700" aria-hidden="true" />期限は、亡くなったことを知った日の翌日から10か月
          </p>
          <p className={SRC}>出典：<a href={S.ntaShikata.url} target="_blank" rel="noopener noreferrer" className={A}>{S.ntaShikata.name}</a>（{DATA.checkedAt.split('-').join('/')} 確認）。特例を使って基礎控除以下になる場合も、申告が要ることがあります。</p>
          <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="kiso" lead="申告が要りそうなら、相続税の申告をまとめて頼む" />
        </section>
      </SouzokuArticle>
    </>
  );
}
