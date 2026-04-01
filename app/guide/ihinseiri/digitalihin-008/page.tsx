import type { Metadata } from 'next';
import DigitalIhin008Client from './DigitalIhin008Client';

export const metadata: Metadata = {
  title:
    '故人のスマホを見る方法は？ロック解除を急ぐ前に確認したいこと | つぎの手ナビ',
  description:
    '故人のスマホは、無理にロック解除を急ぐ前に、何を確認したいのかを整理した方が進めやすいことがあります。通信、課金、資産、連絡先の確認目的ごとの考え方をまとめました。',
};

export default function Page() {
  return <DigitalIhin008Client />;
}