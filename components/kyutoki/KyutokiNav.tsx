import Link from 'next/link';
import { Flame } from 'lucide-react';
import { KYUTOKI_GROUPS } from '@/lib/kyutoki/pages';

/**
 * 給湯器のページの下に置く「給湯器のページ一覧」（2026-11-13）。
 * 給湯器のページどうしが2〜4本しかつながっておらず、15ページがトップから辿れなかったため、
 * どのページからも全ページへ1回で行けるようにする。紹介先のリンクは置かない（出口は各ページに1つのまま）。
 */
export default function KyutokiNav({ current }: { current: string }) {
  return (
    <nav aria-label="給湯器のページ一覧" className="flex flex-col gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-[16px] font-black text-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600"><Flame size={16} aria-hidden="true" /></span>
          給湯器のページ一覧
        </p>
        <Link href="/kyutoki" className="text-[12px] font-bold text-sky-700 underline underline-offset-2">すべて見る</Link>
      </div>
      {KYUTOKI_GROUPS.map((g) => (
        <div key={g.h} className="flex flex-col gap-1.5">
          <p className="text-[12px] font-bold text-slate-500">{g.h}</p>
          <ul className="flex flex-wrap gap-1.5">
            {g.items.map((it) => (
              <li key={it.href}>
                {it.href === current ? (
                  <span aria-current="page" className="inline-block rounded-full bg-slate-100 px-3 py-1.5 text-[13px] font-bold text-slate-400">{it.t}</span>
                ) : (
                  <Link href={it.href} className="inline-block rounded-full bg-white px-3 py-1.5 text-[13px] font-bold text-slate-800 ring-1 ring-slate-200 hover:ring-slate-300">{it.t}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
