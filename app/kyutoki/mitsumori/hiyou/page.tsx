import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/components/loan/LoanArticle';
import { MitsumoriView, PAGE_PATH } from '../MitsumoriView';

/**
 * 給湯器 B の広告用の入口（費用・相場の言葉）。中身は /kyutoki/mitsumori と同じで、最初の画面の見出しだけ替える。
 * 本文が同じなので検索結果には出さず、正規の住所は元のページにする。
 */
export const metadata: Metadata = {
  title: `給湯器の交換費用、その見積もりは妥当？ | ${SITE_NAME}`,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <MitsumoriView hero="hiyou" />;
}
