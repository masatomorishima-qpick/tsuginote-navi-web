import Link from 'next/link';
import { PenLine } from 'lucide-react';

/**
 * ページの下に出す「編集」の表示（2026-11-11。税・保険・相続のページで、誰がどう作ったかを示すため）。
 * オーナーの指示で、個人の名前は出さない（編集部と運営会社だけ）。リンク先は中立性ポリシーの「6. 編集と誤りの連絡」。
 */
export default function HenshuNote() {
  return (
    <aside className="flex items-start gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-slate-200" aria-label="このページの編集">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><PenLine size={18} aria-hidden="true" /></span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[11px] text-slate-500">このページの編集</span>
        <span className="text-[14px] font-black text-slate-900">つぎの手ナビ 編集部</span>
        <span className="text-[12px] leading-relaxed text-slate-600">運営：BlueAdventures合同会社。金額や期限は国税庁・法務省などの公式の情報で確かめ、確認日を書いています。</span>
        <Link href="/policy#ayamari" className="text-[12px] text-sky-800 underline underline-offset-2">作り方と誤りの連絡先</Link>
      </span>
    </aside>
  );
}
