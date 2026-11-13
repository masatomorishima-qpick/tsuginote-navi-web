import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ClipboardList, FileStack, IdCard, MapPin } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import KosekiCheck from '@/components/souzoku/KosekiCheck';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続の戸籍の集め方チェックリスト（2026-11-13 作成。docs/seisaku-queue.md の T19）。
 * 受ける言葉：相続 戸籍 集め方（主）・相続 戸籍 チェックリスト・戸籍 広域交付 相続・兄弟 相続 戸籍。
 *   上位5件（11/13、WebSearch。Chrome につながらず）：1 行政書士法人（母の相続に限る、約2,000字、広域交付なし）
 *   2 司法書士法人の名義変更センター（2026/7、約1万字、広域交付・手数料・場合分けあり。道具なし）
 *   3 税理士法人（2026/10、広域交付なし）4 お金の情報媒体（2022 配信、広域交付なし）5 行政書士法人（2026/10、表1つ）。
 *   上位に欠けている点：①相続人と集める人を選ぶと、要る戸籍と広域交付で取れるかが出る道具がない
 *   ②手数料の計算がない ③印刷できるチェックリストがない ④広域交付に触れたのは2件、法定相続情報一覧図の申出先・保存期間まで書いたのは0件。
 * 出口：相続アシスト（公式の記載「戸籍集めから申告まで代行」。2026-11-12 確認）。
 */
const LP_ID = 'guide-souzoku-koseki-atsumekata';
const PATH = '/guide/souzoku/koseki-atsumekata';
const TITLE = '相続の戸籍の集め方チェックリスト｜要る戸籍・広域交付・手数料が分かる';
const DESCRIPTION = '相続の戸籍の集め方を1枚に。相続人（子・親・兄弟姉妹）と集める人を選ぶと、要る戸籍と、広域交付で最寄りの窓口で取れるかが出ます。手数料（横浜市の例：450円・750円）も通数から計算。無料のエクセル・PDF付き。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const K = DATA.koseki;
const FAQS = [
  { q: '相続で必要な戸籍はどこまで？', a: '亡くなった人の出生から死亡までの戸籍（除籍・改製原戸籍を含む）と、相続人全員の今の戸籍です。親や兄弟姉妹が相続人のときは、亡くなった子がいればその子の出生から死亡までの戸籍も、兄弟姉妹が相続人なら親の死亡が分かる戸籍も要ります（全国銀行協会・裁判所）。' },
  { q: '戸籍の広域交付で兄弟の戸籍は取れますか？', a: '取れません。広域交付で請求できるのは、本人・配偶者・父母や祖父母・子や孫の戸籍です。兄弟姉妹の戸籍は本籍地の市区町村に請求します（法務省）。' },
  { q: '相続の戸籍集めにかかる費用は？', a: '横浜市では、今の戸籍が1通450円、除籍と改製原戸籍が1通750円です。法定相続情報一覧図の写しは、法務局で無料で交付されます（横浜市・法務局）。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = K.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相続の戸籍の集め方', faqs: FAQS, date: K.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  const cols = K.patterns;
  const need = (when: string, p: string) => when === 'all' || (p === 'ko' ? when === 'ko+shibouko' : p === 'oya' ? when === 'oyakyoudai+shibouko' || when === 'oya+shibouoya' : when !== 'ko+shibouko' && when !== 'oya+shibouoya');
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-13" path={PATH} eyebrow="相続の戸籍集め"
        title={<>相続の戸籍の<br /><span className="text-orange-600">集め方チェックリスト</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{K.kotae}</p>
            <KosekiCheck lpId={LP_ID} />
            <p className="rounded-xl bg-white p-3 text-[13px] leading-relaxed text-slate-700 ring-1 ring-slate-200">
              戸籍がそろったら、自分で書いた一覧図と戸籍の束を法務局に出すと、法定相続情報一覧図の写しを無料で交付してもらえます。登記や銀行の手続きで戸籍の束の代わりに使えます（使えるかは出す先で確かめる）。
            </p>
            <p className="rounded-xl bg-white p-3 text-[13px] leading-relaxed text-slate-700 ring-1 ring-slate-200">
              財産から借金や葬式の費用を差し引いた額が、基礎控除（3,000万円＋600万円×法定相続人の数）を超えそうなら、相続税の申告が要ります。
              <Link href="/guide/souzoku/souzokuzei-keisan" className="ml-1 font-bold text-sky-800 underline underline-offset-2">相続税の計算</Link>
            </p>
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="相続税の申告も要るなら、戸籍集めから申告までまとめて任せられる" />
            <SouzokuDownload icon={ClipboardList} h="相続の戸籍の集め方チェックリスト" s="通数と手数料を書き込める。印刷して印を付ける" files={SOUZOKU_FILES.koseki} />
          </div>
        }
        partner="souzokuAssist" exitLead="相続税の申告も要るなら、戸籍集めから申告までまとめて任せる" faqs={FAQS} updated="2026年11月13日"
      >
        <section className={SECTION} aria-labelledby="ichiran">
          <h2 id="ichiran" className={H2}>相続人ごとの必要な戸籍</h2>
          <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[12px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr>
                  <th className="px-2 py-2 text-left font-bold">戸籍</th>
                  {cols.map((c) => <th key={c.key} className="w-[52px] px-1 py-2 text-center font-bold">{c.key === 'ko' ? '子' : c.key === 'oya' ? '親・祖父母' : '兄弟姉妹'}</th>)}
                </tr>
              </thead>
              <tbody>
                {K.items.map((it) => (
                  <tr key={it.key} className="border-t border-slate-100 align-top">
                    <td className="px-2 py-2"><span className="font-black text-slate-900">{it.h}</span><br /><span className="text-[11px] text-slate-500">{it.d}</span></td>
                    {cols.map((c) => <td key={c.key} className="px-1 py-2 text-center text-[15px] font-black text-emerald-700">{need(it.when, c.key) ? '○' : <span className="text-slate-300">－</span>}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">{K.chuui}</p>
          <p className={SRC}>出典：{src(['zenginSouzoku', 'courtHouki', 'houmuToukiShorui'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="kouiki">
          <h2 id="kouiki" className={H2}>戸籍の広域交付（2024年3月1日から）</h2>
          <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
            <MapPin size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
            <span className="flex flex-col gap-0.5"><span className="text-[15px] font-black text-slate-900">本籍地でない市区町村の窓口でも請求できる</span><span className="text-[13px] text-slate-700">対象：{K.kouikiWho}</span></span>
          </div>
          <ul className="grid gap-1.5">
            {K.kouikiRules.map((t) => (
              <li key={t} className="flex items-start gap-2 text-[13px] text-slate-700"><IdCard size={16} className="mt-0.5 shrink-0 text-slate-500" aria-hidden="true" />{t}</li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['mojKouiki', 'yokohamaKouiki'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="hiyou">
          <h2 id="hiyou" className={H2}>戸籍の手数料と郵送での請求</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <tbody>
                <tr className="align-top"><th className="w-[46%] bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700">戸籍全部事項証明書（戸籍謄本）</th><td className="px-3 py-2.5 font-black text-slate-900">1通 {K.tesuryo.koseki}円</td></tr>
                <tr className="border-t border-slate-100 align-top"><th className="bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700">除籍全部事項証明書・改製原戸籍謄本</th><td className="px-3 py-2.5 font-black text-slate-900">1通 {K.tesuryo.joseki}円</td></tr>
                <tr className="border-t border-slate-100 align-top"><th className="bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-700">郵送で請求するとき</th><td className="px-3 py-2.5 text-slate-800">手数料と同じ額の定額小為替か普通為替（現金書留も可）と、切手を貼った返信用封筒を入れる</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-[13px] text-slate-700">金額は横浜市の例です。請求先の市区町村で確かめてください。</p>
          <p className={SRC}>出典：{src(['yokohamaKouiki', 'yokohamaYuso'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="ichiranzu">
          <h2 id="ichiranzu" className={H2}>法定相続情報一覧図の写し</h2>
          <ul className="grid gap-2">
            {K.ichiranzu.map((t) => (
              <li key={t} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <FileStack size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                <span className="text-[13px] text-slate-800">{t}</span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['houmuJouhou', 'houmuJouhouTetsuzuki', 'ntaShoruiIchiran', 'mizuhoZandaka'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>戸籍を集めたあとの順番</h2>
          <ol className="grid gap-2">
            {[
              { h: '誰がいくら受け継ぐか', s: '法定相続分の計算', href: '/guide/souzoku/houtei-souzokubun' },
              { h: '相続関係説明図を作る', s: 'エクセル・PDF', href: '/guide/souzoku/souzoku-kankei-setsumeizu' },
              { h: '財産を調べる', s: '相続財産の調べ方チェックリスト', href: '/guide/souzoku/zaisan-shirabekata' },
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
