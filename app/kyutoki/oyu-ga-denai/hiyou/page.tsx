import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/components/loan/LoanArticle';
import OyuGaDenaiView, { PAGE_PATH } from '../OyuGaDenaiView';

/**
 * 診断ページの広告用の入口（交換費用で検索した人向け）。
 * 中身は /kyutoki/oyu-ga-denai と同じで、最初の画面の見出しだけを替える。
 * 本文が同じなので検索結果には出さず、正規の住所は元のページにする。
 */
export const metadata: Metadata = {
  title: `給湯器の交換前の30秒診断｜修理か交換か | ${SITE_NAME}`,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <OyuGaDenaiView hero="hiyou" />;
}
