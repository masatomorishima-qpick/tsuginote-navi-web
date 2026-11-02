import type { Metadata } from 'next';
import { SITE_URL, SITE_NAME } from '@/components/loan/LoanArticle';
import { MitsumoriView, PAGE_PATH } from '../MitsumoriView';

/**
 * 給湯器 B の広告用の入口（寿命・替えどきの言葉）。中身は /kyutoki/mitsumori と同じで、最初の画面の見出しだけ替える。
 * 本文が同じなので検索結果には出さず、正規の住所は元のページにする。
 */
export const metadata: Metadata = {
  title: `給湯器の替えどき、交換の総額を10秒で | ${SITE_NAME}`,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <MitsumoriView hero="jumyo" />;
}
