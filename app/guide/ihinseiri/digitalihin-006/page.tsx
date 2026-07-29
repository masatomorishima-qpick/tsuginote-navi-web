import type { Metadata } from 'next';
import DigitalIhin006Client from './DigitalIhin006Client';

export const metadata: Metadata = {
  title: '亡くなった親のスマホはどう処分する？データ消去できないときの考え方 | つぎの手ナビ',
  description:
    '亡くなった親のスマホを処分したいが、パスワードがわからずデータ消去できない方へ。すぐ捨てないほうがよい理由、先に確認したいこと、処分・保管・相談の考え方をわかりやすく整理します。',
};

export default function Page() {
  return <DigitalIhin006Client />;
}