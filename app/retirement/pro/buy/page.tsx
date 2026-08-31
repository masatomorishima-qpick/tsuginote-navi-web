/**
 * app/retirement/pro/buy/page.tsx — 有料版の購入前ページ
 *
 * ★★【これは第1段だけの頁です】★★
 *   有料版が出たら、**この1枚は消します。**
 *   （2026-08-31・戦術Cowork `senjutsu_20260831s.md` 3番）
 *
 * 【なぜ要るか】
 *   `ProApp.tsx` 189行が、購入ボタンでここへ飛ばします。
 *     window.location.href = '/retirement/pro/buy';
 *   この頁が無いと、**19,800円を払おうとした方が404に落ちます。**
 *   ですので、無料版を出す前に、ここで受けます。
 *
 * 【この頁に置かないもの】（同・3番）
 *   ・**メールアドレスの入力欄。**集めません
 *   ・**公開の日。**「まもなく」「近日」も書きません。書くと約束になります
 *   ・そのほか、下の字にないもの
 *
 * 【字】
 *   ★**戦術Coworkが出した字を、そのまま入れています。**
 *     `senjutsu_20260831s.md` 3番「出す字（このまま入れてください）」
 *   ★**1文字も変えないでください。**変えたいときは、消す前に戦術Coworkへ投げてください
 *
 * 【検索に出しません】
 *   `robots: { index: false, follow: false }`。`result/page.tsx` と同じ形です。
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import { Breadcrumb, SITE_URL } from '@/components/loan/LoanArticle';

const PAGE_PATH = '/retirement/pro';

export const metadata: Metadata = {
  title: '退職金とiDeCoの受け取り方シミュレーション 有料版｜つぎの手ナビ',
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
};

export default function ProBuyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Breadcrumb
          crumbs={[
            { name: '退職金・年金', path: '/retirement' },
            { name: '受け取り方シミュレーション', path: PAGE_PATH },
          ]}
        />

        <h1 className="mt-6 text-[24px] font-bold leading-tight text-slate-900 sm:text-[28px]">
          有料版は、まだ公開していません
        </h1>

        <p className="mt-6 text-base leading-relaxed text-slate-800">
          有料版（19,800円・税込）は、いま準備をしています。
          <br />
          公開の日は、まだお伝えできません。
        </p>

        <p className="mt-4 text-base leading-relaxed text-slate-800">
          無料版は、いまお使いいただけます。
          <br />
          あなたの退職金とiDeCo等の受け取り方で、手取りがいくら変わるかをお出しします。
        </p>

        <Link
          href={PAGE_PATH}
          className="mt-8 flex w-full items-center justify-center rounded-xl border-2 border-[#127a63] bg-white px-4 py-3.5 text-[17px] font-bold text-[#127a63]"
        >
          無料版に戻る
        </Link>

        <div className="h-16" aria-hidden="true" />
      </main>
      <SiteFooter />
    </div>
  );
}
