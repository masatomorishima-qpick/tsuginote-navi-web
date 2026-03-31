import type { Metadata } from 'next';
import DigitalIhin004Client from './DigitalIhin004Client';

export const metadata: Metadata = {
  title: '遺品のパソコンの捨て方と安全に処分する進め方|つぎの手ナビ',
  description:
    '遺品のパソコンをどう捨てればいいか悩む方へ。処分前に確認したいデータや契約、やってはいけないこと、実家全体の片付けも踏まえた進め方をわかりやすく整理します。',
};

export default function Page() {
  return <DigitalIhin004Client />;
}