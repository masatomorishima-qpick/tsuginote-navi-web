import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Ban, Info, Layers, Mail, Paperclip, Stamp } from 'lucide-react';
import { SITE_URL, SITE_NAME, ogImageUrl } from '@/components/loan/LoanArticle';
import SouzokuArticle, { A, H2, SECTION, SOUZOKU_FILES, SRC, SouzokuDownload, jsonLdFor } from '@/components/souzoku/SouzokuArticle';
import SouzokuExit from '@/components/souzoku/SouzokuExit';
import TojikataCheck from '@/components/souzoku/TojikataCheck';
import DATA from '@/lib/souzoku/haifu-data.json';

/**
 * 相続税の申告書の綴じ方と提出の順番（2026-11-19 作成。docs/seisaku-queue.md の T41）。
 * 受ける言葉：相続税申告書 添付書類 綴じ方（主）・相続税申告書 提出先・相続税電子申告 添付書類・相続税申告 添付書類 通帳。
 *   上位5件（11/19、WebSearch。Chrome につながらず）：1 大手税理士法人（チェスター）2 税理士法人の相続ガイド（ht-tax）
 *   3 国税庁の古い手引き（平成30年改正の PDF）4 税理士法人のチェックリストの PDF（2019年）5 法律事務所（デイライト）。ほかに税理士ドットコム。
 *   上位が答えている疑問：綴じる順番・提出先・郵送でよいか・何を付けるか。
 *   上位に欠けている点：①国税庁に綴じる順番の決まりがないこと（上位は決まりのように書く）②のりづけしない・クリップで留める（国税庁の一覧の注記）
 *   ③通帳の写し・残高証明書は原則出さなくてよい（e-Tax の添付書類の一覧の「その他」）④控えに受付の印が押されない（令和7年1月から）
 *   ⑤郵便は「信書」で、通信日付印の日が提出日 ⑥出し方を選ぶと並べる順と期限が出る道具・印刷できる表。
 * 出口：相続アシスト（書類集めから申告まで代行）。
 */
const LP_ID = 'guide-souzoku-tojikata';
const PATH = '/guide/souzoku/shinkoku-tojikata';
const TITLE = '相続税申告書の綴じ方と提出の順番｜添付書類の並べ方チェック表（無料）';
const DESCRIPTION = '相続税の申告書と添付書類の綴じ方・並べる順番・提出先を1枚にした無料のチェック表（エクセル・PDF）。のりづけしない・クリップで留める、郵送は信書で通信日付印の日が提出日、通帳の写しは原則不要、控えに受付印が押されない点まで国税庁の案内で確かめました。';

export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `${SITE_URL}${PATH}`, siteName: SITE_NAME, type: 'article', locale: 'ja_JP', images: [{ url: ogImageUrl(TITLE), width: 1200, height: 630, alt: TITLE }] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [ogImageUrl(TITLE)] },
};

const T = DATA.tojikata;
const FAQS = [
  { q: '相続税の申告書はどこに提出しますか？', a: '亡くなった人の住所地を所轄する税務署です。相続人の住所地の税務署ではありません。期限は、亡くなったことを知った日の翌日から10か月以内です（国税庁）。' },
  { q: '相続税の申告書は郵送できますか？', a: 'できます。申告書は「信書」なので、郵便物か信書便物で送ります。ゆうパックや宅配便などの荷物扱いでは送れません。郵便・信書便なら、通信日付印の日に出したものとみなされます（国税庁）。' },
  { q: '相続税の申告に通帳のコピーは必要ですか？', a: '原則、出す必要はありません。国税庁の一覧では、預貯金通帳の写しや残高証明書の写しは「イメージデータ・書面ともに、原則、提出していただく必要はありません」とされています。申告書を作る資料として手元に残します。' },
];

const WAY_ICON = { jisan: Stamp, yuso: Mail, etax: Layers } as const;

export default function Page() {
  const S = DATA.sources as Record<string, { name: string; url: string }>;
  const checked = T.checkedAt.split('-').join('/');
  const jsonLd = jsonLdFor({ url: `${SITE_URL}${PATH}`, title: TITLE, description: DESCRIPTION, crumb: '相続税申告書の綴じ方と提出', faqs: FAQS, date: T.checkedAt });
  const src = (keys: string[]) => [...new Set(keys)].map((k, i) => (
    <span key={k}>{i > 0 && '・'}<a href={S[k].url} target="_blank" rel="noopener noreferrer" className={A}>{S[k].name}</a></span>
  ));
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SouzokuArticle
        lpId={LP_ID} version="v1-2026-11-19" path={PATH} eyebrow="相続税の申告"
        title={<>相続税申告書の綴じ方<br /><span className="text-orange-600">添付書類の並べ方と提出の順番</span></>}
        download={
          <div className="flex flex-col gap-3">
            <p className="text-[15px] leading-relaxed text-slate-800">{T.kotae}<span className="text-[11px] text-slate-500">（国税庁 No.4205・相続税の申告の際に提出していただく主な書類・申告書の税務署への送付について・収受日付印の押なつについて）</span></p>
            <TojikataCheck lpId={LP_ID} />
            <SouzokuExit lpId={LP_ID} partner="souzokuAssist" position="hero" lead="並べる書類がそろわない・申告書づくりが重いなら、書類の準備から提出までまとめて任せる" />
            <SouzokuDownload icon={Layers} h="綴じ方と提出のチェック表" s="印刷して、重ねたら印を付ける" files={SOUZOKU_FILES.tojikata} />
          </div>
        }
        partner="souzokuAssist" exitLead="書類の準備から提出まで、まとめて任せる" faqs={FAQS} updated="2026年11月19日"
      >
        <section className={SECTION} aria-labelledby="junban">
          <h2 id="junban" className={H2}>相続税申告書と添付書類の綴じ方（並べる順番）</h2>
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
            <table className="w-full text-[13px]">
              <thead className="bg-slate-50 text-[12px] text-slate-600">
                <tr><th className="w-10 px-3 py-2 text-left font-bold">順</th><th className="px-3 py-2 text-left font-bold">書類</th><th className="w-[30%] px-3 py-2 text-left font-bold">入れるとき</th></tr>
              </thead>
              <tbody>
                {T.junban.map((j, i) => (
                  <tr key={j.key} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2.5 font-black text-sky-700">{i + 1}</td>
                    <td className="px-3 py-2.5"><span className="font-black text-slate-900">{j.h}</span><br /><span className="text-[11px] text-slate-500">{j.d}</span></td>
                    <td className="px-3 py-2.5 text-[12px] text-slate-700">{j.when === 'always' ? 'いつも' : j.when === 'shomen' ? '紙で出すとき' : '特例を使うとき'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="flex items-start gap-2 rounded-2xl bg-white p-3.5 text-[13px] text-slate-700 ring-1 ring-slate-200"><Info size={18} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />{T.junbanNote}</p>
          <p className={SRC}>出典：{src(['ntaYoshikiR08', 'ntaShoruiIchiran'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tome">
          <h2 id="tome" className={H2}>留め方と控え</h2>
          <ul className="grid gap-2">
            {[...T.tome, ...T.hikae].map((t, i) => {
              const I = i < 2 ? Paperclip : Stamp;
              return (
                <li key={t.h} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <I size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                  <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{t.h}</span><span className="text-[13px] text-slate-600">{t.d}</span></span>
                </li>
              );
            })}
          </ul>
          <p className={SRC}>出典：{src(['ntaShoruiIchiran', 'ntaOnatsu'])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="fuyo">
          <h2 id="fuyo" className={H2}>添付しなくてよい書類（通帳の写しなど）</h2>
          <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="flex items-start gap-2 text-[15px] font-black text-slate-900"><Ban size={20} className="mt-0.5 shrink-0 text-orange-600" aria-hidden="true" />{T.fuyo.h}</p>
            <p className="text-[13px] text-slate-600">{T.fuyo.d}</p>
            <ul className="grid gap-1 text-[13px] text-slate-800">
              {T.fuyo.items.map((t) => <li key={t}>・{t}</li>)}
            </ul>
          </div>
          <p className={SRC}>出典：{src([T.fuyo.src])}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="teishutsu">
          <h2 id="teishutsu" className={H2}>相続税申告書の提出先と出し方</h2>
          <div className="grid gap-2">
            {T.dashikata.map((d) => {
              const I = WAY_ICON[d.key as keyof typeof WAY_ICON];
              return (
                <div key={d.key} className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
                  <I size={20} className="mt-0.5 shrink-0 text-sky-700" aria-hidden="true" />
                  <span className="flex flex-col"><span className="text-[15px] font-black text-slate-900">{d.h}</span><span className="text-[13px] text-slate-600">{d.d}</span></span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-1.5 rounded-2xl bg-sky-50 p-3.5 ring-1 ring-sky-100">
            <p className="text-[14px] font-black text-slate-900">e-Tax の添付書類</p>
            <ul className="grid gap-1 text-[13px] text-slate-700">
              {T.etax.map((t) => <li key={t}>・{t}</li>)}
            </ul>
          </div>
          <p className={SRC}>出典：{src(T.dashikata.flatMap((d) => d.src).concat(['etaxHikariSouzoku']))}（{checked} 確認）</p>
        </section>

        <section className={SECTION} aria-labelledby="tsugi">
          <h2 id="tsugi" className={H2}>提出の前に確かめる表</h2>
          <ol className="grid gap-2">
            {[
              { h: '相続税の申告の必要書類', s: '状況を選ぶと要る書類だけが出る', href: '/guide/souzoku/shinkoku-shorui-checklist' },
              { h: '相続税の申告を自分でする手順', s: '表を作る順番と期限', href: '/guide/souzoku/shinkoku-jibun' },
              { h: '申告期限を過ぎたときの延滞税', s: '間に合わないときの計算', href: '/guide/souzoku/shinkoku-okure' },
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
