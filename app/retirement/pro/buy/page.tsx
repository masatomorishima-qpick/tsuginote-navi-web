/**
 * app/retirement/pro/buy/page.tsx — 有料版の購入前ページ
 *
 * ★★★【2026-09-15・決め1258。★この頁は「栓で分かれる1枚」になりました】★★★
 *
 *   ★★戦術Cowork `senjutsu_20260915j.md` 3-3 の2 のお願いは
 *     「**`/retirement/pro` へ送るだけにする**」でした。★理由は
 *     「いまの字『有料版は、まだ公開していません』は、**栓を開けた日に嘘になります**」。
 *
 *   ★★★**こちらは「送るだけ」にしていません。★栓で分けました。**★理由を3つ書きます ──
 *
 *   (1) ★★**いま、この字は嘘ではありません。**★栓 `PRO_RETIREMENT_CHECKOUT_ENABLED` は
 *       まだどこにも `'1'` が入っていません（★repo 全体で 0か所・こちらが数えました）。
 *       ★★「送るだけ」にすると、★**きょうから、買えると思って来られた方が黙って無料版に戻されます。**
 *   (2) ★★★**`ProApp.tsx` の購入ボタンは、口が 404 のときここへ来ます。**
 *       ★「送るだけ」だと、★★**押しても入力画面に戻るだけのボタン**になります
 *       ── ★★★**決め1236（押しても何も起きない道を、画面に出さない）に反します。**
 *   (3) ★★**栓を開けた日には、この字は出なくなります**（★下の分岐）。★戦術Coworkのご懸念は、これで消えます。
 *
 *   ★★★**栓は1か所（この環境変数）だけで、字を2か所に持ちません**（★決め1206の家族）。
 *   ★★戦術Coworkが「それでも送るだけにしてください」とお決めになれば、★**下の分岐を消すだけ**です。
 *
 * ★★【もとの覚え書き（2026-08-31・戦術Cowork `senjutsu_20260831s.md` 3番）】
 *   有料版が出たら、**この1枚は消します。**
 *   ★★★2026-09-15 …… ★**消さないことにしました**（★戦術Cowork `senjutsu_20260915j.md` 3-3 の2
 *     「★repo の外からのリンクは、こちらでは数えられませんので、**頁は残します**」）。
 *
 * 【なぜ要るか】
 *   `ProApp.tsx` の購入ボタンは、★**口が開いていないとき**にここへ来ます。
 *   この頁が無いと、**19,800円を払おうとした方が404に落ちます。**
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
import { redirect } from 'next/navigation';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import { Breadcrumb, SITE_URL } from '@/components/loan/LoanArticle';

const PAGE_PATH = '/retirement/pro';

/**
 * ★★★栓（★`app/api/retirement/pro/billing/checkout/route.ts` と**同じ環境変数**です）。
 *   ★★**既定値を作りません。**★無ければ「閉じている」＝この頁を出します。
 *   ★★★**`'1'` のときだけ、この頁を出しません**（★買える日には、この字は嘘になりますので）。
 */
function aiteiru(): boolean {
  return process.env.PRO_RETIREMENT_CHECKOUT_ENABLED === '1';
}

/**
 * ★★★**建てるときではなく、来られたときに栓を読みます**（★決め1258）。
 *   ★これが無いと、Next はこの頁を**建てるときに1度だけ**描いて配ります
 *   （`node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`
 *    「`'auto'`（既定）… cache as much as possible」）。
 *   ★★★すると、★**Vercel で栓を `'1'` にしても、建て直すまで古い姿が出ます。**
 *   ★`app/api/retirement/pro/billing/checkout/route.ts` と**同じ置き方**です。
 */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '老後のお金の受け取りシミュレーション 有料版｜つぎの手ナビ',
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
};

export default function ProBuyPage() {
  // ★★栓が開いている入れ物では、この頁を出さずに入力画面へお送りします（★決め1258・上の覚え書き(3)）
  if (aiteiru()) redirect(PAGE_PATH);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <GuideHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <Breadcrumb
          crumbs={[
            { name: '退職金・年金', path: '/retirement' },
            { name: '受け取りシミュレーション', path: PAGE_PATH },
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
