import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CalendarDays, Users } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import KigenIraiCalc from '@/components/souzoku/KigenIraiCalc';
import { iraiList } from '@/lib/souzoku/kigen';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の申告期限の計算と、税理士に頼む目安の日（2026-11-23 作成。docs/seisaku-queue.md の T42）。
 * 受ける言葉：相続税 申告期限 計算（主）・相続税 申告期限 土日・相続税 税理士 いつまでに 依頼・相続税 税理士 依頼 時期。
 *   上位（11/23、WebSearch で顔ぶれ、web-fetch で本文。Chrome につながらず）：
 *   「申告期限 計算 土日」1 税理士への質問サイトの記事（2020、例2件・道具なし）2 相続専門の税理士法人（2026/6 更新、2万字・特殊な例11・「3か月前までに依頼」）
 *   3 国税庁の手引（令和8年分）4 相続専門の税理士法人の辞典（2018、相続人ごとの期限・土日の例）5 国税庁 No.4205。
 *   「税理士 いつまでに 依頼」1 大手税理士法人の解説（2026/11 更新、依頼の目安の数字なし）2 同じ法人のコラム（2022、事例だけ）3〜 質問サイトの相談。
 *   上位が答えている疑問：10か月の数え方・土日祝の繰り下げ・相続人ごとの期限・間に合わないとき（未分割・期限後）・早めに相談。
 *   上位に欠けている点：①自分の日付で期限と頼む目安の日を出す道具がない ②頼む目安を日付で示したものがない（「3か月前」は1件だけ）
 *   ③月末・2月・年末年始の例がない ④国税庁の例と出典へのリンクがない（質問サイト・辞典）。
 * 出口：相続アシスト（申告をまとめて代行）。
 */
const LP_ID = 'guide-souzoku-shinkoku-kigen-irai';
const PATH = '/guide/souzoku/shinkoku-kigen-irai';
const TITLE = '相続税の申告期限の計算｜土日祝の繰り下げと税理士に頼む目安日（無料）';
const DESCRIPTION = '相続税の申告期限は、亡くなったことを知った日の翌日から10か月以内（1月6日なら11月6日）。土日・祝日なら休みの明けた日です。日付を入れると、期限と残りの日数、税理士に頼む目安の日（4か月後・期限の3か月前・1か月前）が出ます。エクセルも無料。'

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const K = DATA.kigenIrai;
const FAQS = [
  { q: '相続税の申告期限はいつまでですか？', a: '亡くなったことを知った日（ふつうは亡くなった日）の翌日から10か月以内です。例えば1月6日に亡くなったら、その年の11月6日が期限です。納税の期限も同じ日です（国税庁 No.4205）。' },
  { q: '相続税の申告期限が土日の場合はどうなりますか？', a: '期限が土曜日・日曜日・祝日などに当たるときは、その翌日が期限になります。国税庁の手引では、令和8年6月10日に亡くなった場合、10か月後の令和9年4月10日が土曜日のため、4月12日（月）が期限です。' },
  { q: '相続税の申告は税理士にいつまでに頼めばいいですか？', a: '決まりはありませんが、つぎの手ナビは遅くとも期限の3か月前（知った日の7か月後）までを目安にしています。遺産の評価・分け方の話し合い・申告書づくりに時間を残すためです。準確定申告の期限（4か月後）のころまでに頼むと、さらに余裕があります。' },
];

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = K.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相続税の申告期限の計算', faqs: FAQS, date: K.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  // 頼む目安の表の例：令和8年6月9日に亡くなった場合（国税庁の手引の例の日付）。
  const reiDay = new Date(2026, 5, 9);
  const W = ['日', '月', '火', '水', '木', '金', '土'];
  const md = (d: Date) => `令和${d.getFullYear() - 2018}年${d.getMonth() + 1}月${d.getDate()}日（${W[d.getDay()]}）`;
  const rei = iraiList(reiDay);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-23" path={PATH} eyebrow="相続税の申告"
        title={<>相続税の申告期限の計算<br /><span className="text-orange-600">土日祝の繰り下げと、税理士に頼む目安の日</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{K.kotae}<span className="text-[11px] text-slate-500">（国税庁 No.4205・相続税の申告のしかた）</span></p>
            <KigenIraiCalc lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="戸籍集めから申告まで、まとめて任せられる" />
            <SouzokuDownload icon={CalendarDays} h="相続税の申告期限と頼む目安の計算表" s="知った日を入れると、期限・残りの日数・頼む目安の日が出る。相続人ごとの期限も" files={SOUZOKU_FILES.kigenIrai} />
          </div>
        }
        partner="souzokuAssist" exitLead="評価から申告書づくりまで、まとめて任せられる" faqs={FAQS} updated="2026年11月23日"
      >
        <section className={SECTION} aria-labelledby="kazoekata">
          <h2 id="kazoekata" className={H2}>相続税の申告期限の数え方</h2>
          <ul className="grid gap-2">
            {K.kazoekata.map((k, i) => (
              <li key={k.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700 text-[13px] font-black text-white">{i + 1}</span>
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{k.h}</span><span className="text-[13px] text-slate-600">{k.d}</span></span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src(['nta4205r8', 'ntaShikata03', 'tsusokuHo10'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="rei">
          <h2 id="rei" className={H2}>亡くなった日と申告期限の例（土日・月末）</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[11px] text-slate-600">
                <tr><th className="px-3 py-2 text-left font-bold">亡くなった日</th><th className="px-3 py-2 text-left font-bold">申告期限</th></tr>
              </thead>
              <tbody>
                {K.rei.map((r) => (
                  <tr key={r.h} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2.5 font-bold text-slate-900">{r.h}</td>
                    <td className="px-3 py-2.5"><span className="block font-black text-orange-700">{r.k}</span><span className="block text-[11px] text-slate-500">{r.memo}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-slate-600">{K.nenmatsu}</p>
          <p className={SRC}>出典：{src(['nta4205r8', 'ntaShikata03', 'tsusokuHo10', 'caoShukujitsu'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="hito">
          <h2 id="hito" className={H2}>相続人ごとに違う申告期限</h2>
          <div className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
            <Users size={22} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
            <p className="text-[13px] text-slate-700">{K.hito}上の道具の「別の日に知った相続人を足す」で、人ごとの期限を出せます。</p>
          </div>
          <p className="text-[13px] text-slate-700">{K.teishutsu}</p>
          <p className={SRC}>出典：{src(['nta4205r8', 'ntaShikata03'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="irai">
          <h2 id="irai" className={H2}>税理士に頼む時期の目安</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <p className="bg-slate-50 px-3 py-2 text-[12px] font-bold text-slate-700">例：令和8年6月9日（火）に亡くなった場合</p>
            <table className="w-full text-[13px]">
              <tbody>
                {rei.map((x) => (
                  <tr key={x.key} className={`border-t border-slate-100 ${x.kind === 'irai' ? 'bg-sky-50/60' : ''}`}>
                    <th className={`w-[46%] px-3 py-2.5 text-left font-bold ${x.kind === 'irai' ? 'text-sky-800' : x.kind === 'kigen' ? 'text-orange-800' : 'text-slate-700'}`}>{x.h}</th>
                    <td className="px-3 py-2.5 font-black text-slate-900">{md(x.d)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="grid gap-2">
            {K.irai.map((r) => (
              <li key={r.key} className="flex flex-col gap-0.5 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <span className="text-[15px] font-black text-sky-800">{r.h}<span className="ml-1.5 text-[12px] text-slate-500">知った日の{r.ato}か月後</span></span>
                <span className="text-[13px] text-slate-600">{r.d}</span>
              </li>
            ))}
          </ul>
          <p className="text-[12px] text-slate-600">{K.iraiNote}</p>
          <p className={SRC}>期限の出典（頼む目安の日の出典ではありません）：{src(['nta4205r8', 'nta2022', 'courtHouki', 'nta4202'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="maniawanai">
          <h2 id="maniawanai" className={H2}>申告期限に間に合わないとき</h2>
          <ul className="grid gap-2">
            {K.maniawanai.map((t) => (
              <li key={t.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />
                <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{t.h}</span><span className="text-[13px] text-slate-600">{t.d}</span></span>
              </li>
            ))}
          </ul>
          <p className={SRC}>出典：{src([...K.maniawanai.map((t) => t.src), 'nta9205'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>次にすること</h2>
          <ol className="grid gap-2">
            {[
              { h: '相続税がかかるかの目安を出す', s: '基礎控除を超えるかと税額', href: '/guide/souzoku/souzokuzei-keisan' },
              { h: '頼む前の準備と面談の持ち物', s: '状況を選ぶと一覧に。家族で決めること', href: '/guide/souzoku/irai-junbi' },
              { h: '申告書に付ける書類の一覧', s: '状況を選ぶと一覧に', href: '/guide/souzoku/shinkoku-shorui-checklist' },
              { h: '自分で申告するときの手順', s: '作る表と目安の日', href: '/guide/souzoku/shinkoku-jibun' },
              { h: '期限を過ぎたときの延滞税', s: '日付と税額で計算', href: '/guide/souzoku/shinkoku-okure' },
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
