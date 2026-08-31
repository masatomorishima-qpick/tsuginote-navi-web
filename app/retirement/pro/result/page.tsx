/**
 * app/retirement/pro/result/page.tsx — 計算結果のURL
 *
 * **このページに直接来ることが必ずあります**（リロード・共有されたリンク・ブックマーク）。
 * §6-14 の1：そのときは**入力画面を出します。**404やエラー画面にしません。
 * 入力は保存していない（§6-14 の2）ので、結果を復元することはできません。
 *
 * §3-2 Q11・Q12：**このURLは検索に出しません。**
 */

import type { Metadata } from 'next';
import GuideHeader from '@/components/GuideHeader';
import SiteFooter from '@/components/SiteFooter';
import { Breadcrumb, SITE_URL } from '@/components/loan/LoanArticle';
import ProApp from '@/components/retirement/pro/ProApp';
import { tokyoYear } from '@/lib/retirement/pro/now';

const PAGE_PATH = '/retirement/pro';

export const metadata: Metadata = {
  title: '退職金とiDeCoの受け取り方シミュレーション 計算結果｜つぎの手ナビ',
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
};

export const dynamic = 'force-dynamic';

export default function ProResultPage() {
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
        <ProApp genzaiNen={tokyoYear(new Date())} enteredAtResult />
      </main>
      <SiteFooter />
    </div>
  );
}
