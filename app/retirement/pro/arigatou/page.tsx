/**
 * app/retirement/pro/arigatou/page.tsx — ご購入のあとに Stripe から戻る頁（A-2a-4・senjutsu_20260902ad.md 4番）
 *
 * ★★字は戦術Cowork `senjutsu_20260902u.md` 2番・`senjutsu_20260902y.md`（穴4「ふつう」）の字です。1文字も変えていません。
 *   変えたいときは、消す前に戦術Coworkへ投げてください。
 *
 * ★決め
 *   ・★静的な1枚。表も Stripe も読みません（★webhook より先に着くことがあり、通行証がまだ無いことがあるため）。
 *     ★だから「メールは、ふつう数分以内に届きます」まで。「お支払いが完了しました」とは書きません（確かめていないため）
 *   ・checkout の `success_url` は `?session_id=` を**落として**ここへ来ます（★GA4 の page_view に cs_ を乗せないため）
 *   ・`robots { index:false, follow:false }`／`sitemap.ts` に足さない／`track()` は呼ばない（購入の計測は A-2b で決める）
 *   ・見た目は B-1a（tokushoho）・頁④（kekka）と同じ骨（`GuideHeader`／max-w-4xl／`SiteFooter`）
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import { SITE_URL } from '@/components/loan/LoanArticle';

const PRO_PATH = '/retirement/pro';

export const metadata: Metadata = {
  title: 'ご購入ありがとうございます | つぎの手ナビ',
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}${PRO_PATH}` },
};

const H1 = 'text-[24px] font-bold leading-tight text-slate-900 sm:text-[28px]';
const P = 'mt-6 text-base leading-relaxed text-slate-800';

export default function ArigatouPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <GuideHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className={H1}>ご購入ありがとうございます</h1>
          <p className={P}>お手続きが完了しました。</p>
          <p className={P}>
            ご購入のときにご入力いただいたメールアドレスに、計算結果を開くためのリンクをお送りします。
            <br />
            メールは、ふつう数分以内に届きます。
          </p>
          <p className={P}>
            メールが届かないときは、迷惑メールのフォルダをご確認ください。
            <br />
            それでも見つからないときは、info@blueadventures.jp までご連絡ください。
            <br />
            ご購入のときにご入力いただいたメールアドレスをお知らせいただければ、お調べします。
          </p>
          <p className="mt-8">
            <Link href={PRO_PATH} className="font-medium text-emerald-700 hover:text-emerald-800">
              退職金とiDeCoの受け取り方シミュレーションのページへ
            </Link>
          </p>
          <div className="h-16" aria-hidden="true" />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
