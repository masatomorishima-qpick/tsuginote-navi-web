import type { Metadata } from 'next';
import DigitalIhin007Client from './DigitalIhin007Client';

export const metadata: Metadata = {
  title:
    '親のスマホは売れる？初期化できないときに売却前に確認したいこと | つぎの手ナビ',
  description:
    '親のスマホは状態によっては売れることもありますが、初期化できないなら急いで売らない方が安心です。売る・保管する・処分するの比較と、売却前に確認したいことを整理します。',
};

export default function Page() {
  return <DigitalIhin007Client />;
}