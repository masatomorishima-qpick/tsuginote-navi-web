import type { Metadata } from 'next';
import DigitalIhin003Client from './DigitalIhin003Client';

export const metadata: Metadata = {
  title:
    '亡くなった人のサブスクを解約できないときは？継続課金が不安なときに確認したいこと',
  description:
    '亡くなった人のサブスクや継続課金を解約できないときに、最初に確認したいことを整理しました。スマホが開けない、何の請求かわからない、放置が不安な場合に、確認の順番と相談先をわかりやすく解説します。',
};

export default function Page() {
  return <DigitalIhin003Client />;
}