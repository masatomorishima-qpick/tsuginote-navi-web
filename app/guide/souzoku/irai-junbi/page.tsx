import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, ClipboardCheck } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import IraiJunbiCheck from '@/components/souzoku/IraiJunbiCheck';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 税理士に相続税の申告を頼む前の準備（面談の持ち物と、家族で決めておくこと）（2026-11-24 作成。docs/seisaku-queue.md の T43）。
 * 受ける言葉：相続税 税理士 依頼 準備（主）・相続税 税理士 依頼 書類・相続税 税理士 面談 持ち物・依頼前 チェックリスト。
 *   上位（11/24、Chrome につながらず WebSearch で顔ぶれ、web-fetch で本文）：
 *   1 税理士への質問サイトの相談（2025/6、約1,000字。提出書類・通帳の年数）2 同じ質問サイトの相談（2022/8、約2,000字。面談・報酬・遡る年数）
 *   3 相続専門の税理士法人の必要書類の解説（2026/3、約9,000字。一覧表・集め方・別の PDF）4 同じ記事の別の住所
 *   5 同じ税理士法人の「税理士の選び方」（約7,000字。面談で聞くこと・依頼の時期・面談前に課税明細書と財産のメモ）。
 *   上位が答えている疑問：頼むときに要る書類・通帳は何年分・申告期限10か月・依頼の時期。
 *   上位に欠けている点：①状況を選ぶと面談の持ち物が一覧になる道具と印刷できる表がない ②家族で先に決めておくことの一覧がない
 *   ③「通帳は何年分」が回答者ごとに違い、国税庁の足し戻す期間（亡くなった日で3年〜7年）に結び付けていない ④面談の日と、あとで取る証明書の区別がない。
 * 出口：相続アシスト（申告をまとめて代行。こちらはサインと面談だけ）。
 */
const LP_ID = 'guide-souzoku-irai-junbi';
const PATH = '/guide/souzoku/irai-junbi';
const TITLE = '相続税を税理士に依頼する前の準備｜面談の持ち物チェックリスト（無料）';
const DESCRIPTION = '税理士に相続税の申告を頼む前にそろえるのは、相続人が分かるもの・遺言書・財産と借金の手がかり・亡くなる前の贈与のメモ。当てはまるものを選ぶと面談の日に持っていく物が一覧になり、印刷できます。家族で決めておくこと7つと、通帳を見返す期間も。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const J = DATA.iraiJunbi;
const Z = DATA.seizen; // 期間の表は生前贈与加算のページと同じ元（国税庁 No.4161）
const FAQS = [
  { q: '相続税の申告を税理士に依頼するときに必要な書類は？', a: '最初の面談には、相続人が分かるもの（戸籍か家族の関係のメモ）、遺言書があればその写し、財産と借金の手がかり（通帳・固定資産税の納税通知書・証券会社や保険会社からの郵便物・借金の残高が分かるもの・葬式の領収書）、亡くなる前の贈与のメモを持っていきます。残高証明書などの証明書は、面談で何が要るかを確かめてから取ります。' },
  { q: '相続税の申告で通帳は何年分必要ですか？', a: '国税庁が通帳の年数を決めているわけではありません。つぎの手ナビは、少なくとも亡くなる前の贈与を相続財産に足す期間の分を目安にしています。その期間は、2026年12月31日までに亡くなったら3年以内、2027年〜2030年に亡くなったら2024年1月1日から、2031年1月1日以後は7年以内です（国税庁 No.4161）。それより前の分を税理士から求められることもあります。' },
  { q: '相続税の申告は税理士にいつまでに依頼すればいいですか？', a: '決まりはありませんが、申告と納税の期限が亡くなったことを知った日の翌日から10か月以内なので、つぎの手ナビは遅くとも期限の3か月前（知った日の7か月後）までを目安にしています。自分の日付での目安の日は「相続税の申告期限の計算」のページで出せます。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = J.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '税理士に依頼する前の準備', faqs: FAQS, date: J.checkedAt });
  const src = (keys: string[]) => [...new Set(keys.filter(Boolean))].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-24" path={PATH} eyebrow="相続税の申告"
        title={<>相続税を税理士に依頼する前の準備<br /><span className="text-orange-600">面談の日の持ち物と、家族で決めておくこと</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{J.kotae}<span className="text-[11px] text-slate-500">（{J.kotaeSrc}）</span></p>
            <IraiJunbiCheck lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="申告をまとめて頼む先の一つ" />
            <SouzokuDownload icon={ClipboardCheck} h="税理士に頼む前の準備チェックリスト" s="面談の持ち物・あとで取る証明書・家族で決めること7つに印を付ける" files={SOUZOKU_FILES.iraiJunbi} />
          </div>
        }
        partner="souzokuAssist" exitLead="戸籍集めから申告まで、まとめて頼める" faqs={FAQS} updated="2026年11月24日"
      >
        <section className={SECTION} aria-labelledby="motsu">
          <h2 id="motsu" className={H2}>相続税の申告を頼む準備と面談の持ち物</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-3 py-2 text-left font-bold">当てはまるとき</th><th className="px-3 py-2 text-left font-bold">面談の日に持っていく物</th></tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100 align-top">
                  <td className="px-3 py-2.5 font-bold text-slate-900">だれでも</td>
                  <td className="px-3 py-2.5 text-slate-700">{J.kyotsu.map((k) => k.h).join('・')}</td>
                </tr>
                {J.jokyo.map((j) => (
                  <tr key={j.key} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2.5 font-bold text-slate-900">{j.h}</td>
                    <td className="px-3 py-2.5 text-slate-700">{j.motsu.length ? j.motsu.map((m) => m.h).join('・') : 'なし（面談のあとに印鑑証明書）'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-slate-600">{J.note}</p>
          <p className={SRC}>出典：{src(['nta4202', 'ntaShoruiIchiran', ...J.kyotsu.map((k) => k.src), ...J.jokyo.flatMap((j) => j.src)])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="kimeru">
          <h2 id="kimeru" className={H2}>依頼の前に家族で決めておくこと</h2>
          <ol className="grid gap-2">
            {J.kimeru.map((k, i) => (
              <li key={k.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] font-black text-white">{i + 1}</span>
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{k.h}</span><span className="text-[13px] text-slate-600">{k.d}</span></span>
              </li>
            ))}
          </ol>
          <p className={SRC}>出典：{src(J.kimeru.map((k) => k.src))}（{checked} 確認）。窓口と費用の出し方は、つぎの手ナビの目安です。</p>
        </section>

        <section className={SECTION} aria-labelledby="tsuchou">
          <h2 id="tsuchou" className={H2}>通帳は何年分か（相続財産に足す贈与の期間）</h2>
          <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
            <BookOpen size={22} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
            <p className="text-[13px] text-slate-700">{J.tsuchou}</p>
          </div>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-3 py-2 text-left font-bold">亡くなった日</th><th className="px-3 py-2 text-left font-bold">相続財産に足す贈与の期間</th></tr>
              </thead>
              <tbody>
                {Z.kikan.map((k) => (
                  <tr key={k.h} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2.5 font-bold text-slate-900">{k.h}</td>
                    <td className="px-3 py-2.5 text-slate-700">{k.kikan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-slate-600">{J.kikanNote}くわしい計算は<Link href="/guide/souzoku/seizen-zouyo-kasan" className={A}>生前贈与の加算の計算</Link>で。</p>
          <p className={SRC}>出典：{src(['nta4161'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>次にすること</h2>
          <ol className="grid gap-2">
            {[
              { h: '税理士に頼む目安の日を出す', s: '申告期限と、遅くとも頼みたい日', href: '/guide/souzoku/shinkoku-kigen-irai' },
              { h: '相続税がかかるかの目安を出す', s: '基礎控除を超えるかと税額', href: '/guide/souzoku/souzokuzei-keisan' },
              { h: '財産の手がかりがないときの調べ方', s: '銀行・不動産・株・保険・借金の窓口', href: '/guide/souzoku/zaisan-shirabekata' },
              { h: '申告書に付ける書類の一覧', s: '状況を選ぶと一覧に', href: '/guide/souzoku/shinkoku-shorui-checklist' },
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
