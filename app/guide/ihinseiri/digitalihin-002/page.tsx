import type { Metadata } from 'next';
import DigitalIhin002Client from './DigitalIhin002Client';

export const metadata: Metadata = {
  title:
    '親のネット銀行がわからないときは？相続で口座不明・通帳なしの対応を整理 | つぎの手ナビ',
  description:
    '親のネット銀行がわからないときは、通帳がなくても郵便物、メール、引き落とし履歴、スマホやパソコンから手がかりを集められることがあります。相続で最初に確認したいことを整理します。',
};

export default function Page() {
  return <DigitalIhin002Client />;
}