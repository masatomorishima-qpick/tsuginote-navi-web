import type { Metadata } from 'next';
import DigitalIhin002Client from './DigitalIhin002Client';

export const metadata: Metadata = {
  title:
    '親のネット銀行がわからないときの相続対応について|つぎの手ナビ',
  description:
    '親のネット銀行や証券口座がわからないときに、最初に確認したいことを整理しました。通帳が少ない、スマホやアプリ中心で管理していた場合に、何を手がかりに確認し、どこまで自力で進めるべきかをわかりやすく解説します。',
};

export default function Page() {
  return <DigitalIhin002Client />;
}