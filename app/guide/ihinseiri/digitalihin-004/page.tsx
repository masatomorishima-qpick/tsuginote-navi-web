import type { Metadata } from 'next';
import DigitalIhin004Client from './DigitalIhin004Client';

export const metadata: Metadata = {
  title:
    '遺品のパソコンはどう捨てる？安全な処分方法とやってはいけないこと | つぎの手ナビ',
  description:
    '遺品のパソコンは、すぐに捨てたり初期化したりする前に、確認すべき情報が残っていないか整理することが大切です。安全な処分方法、データ消去の考え方、やってはいけないことをまとめました。',
};

export default function Page() {
  return <DigitalIhin004Client />;
}