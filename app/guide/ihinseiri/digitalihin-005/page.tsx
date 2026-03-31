import type { Metadata } from 'next';
import DigitalIhin005Client from './DigitalIhin005Client';

export const metadata: Metadata = {
  title: '親が亡くなった後のスマホ解約の流れと解約前に確認したいこと | つぎの手ナビ',
  description:
    '親が亡くなった後のスマホ解約で困った方へ。承継か解約かの考え方、解約前に確認したい契約や資産の手がかり、実家全体の片付けも踏まえた進め方をわかりやすく整理します。',
};

export default function Page() {
  return <DigitalIhin005Client />;
}