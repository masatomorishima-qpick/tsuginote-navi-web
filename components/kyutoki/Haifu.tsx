import Link from 'next/link';
import { ClipboardCheck, Download, FileSpreadsheet, FileText, Gauge, Receipt } from 'lucide-react';

/**
 * 給湯器の配布物（無料の表）と、B の受け皿（/kyutoki/mitsumori）への入口。2026-11-04 新設。
 *
 * 配布物の中身は lib/kyutoki/haifu-data.json が唯一の元。ファイルは scripts/kyutoki/make_haifu.py で作る。
 * 検索で上がっている型（保険の一覧表のエクセル）に合わせ、ページの上の方にダウンロードを置く（docs/kyutoki-seo/plan.md）。
 * 押されたかは LpViewTracker の lp_internal_click（同じサイトへのリンク）で取れる。
 */

export const HAIFU = {
  hiyou: {
    icon: Receipt,
    h: '費用の目安表',
    s: '種類・号数・置き場所ごとの総額',
    page: '/kyutoki/kokan-hiyou',
    files: [
      { label: 'エクセル', href: '/downloads/kyutoki-hiyou-meyasu.xlsx', icon: FileSpreadsheet },
      { label: 'PDF', href: '/downloads/kyutoki-hiyou-meyasu.pdf', icon: FileText },
    ],
  },
  check: {
    icon: ClipboardCheck,
    h: '見積もりの見方チェック表',
    s: '見積書で確かめる10か所',
    page: '/kyutoki/mitsumori-mikata',
    files: [
      { label: 'エクセル', href: '/downloads/kyutoki-mitsumori-check.xlsx', icon: FileSpreadsheet },
      { label: 'PDF', href: '/downloads/kyutoki-mitsumori-check.pdf', icon: FileText },
    ],
  },
  gosu: {
    icon: Gauge,
    h: '号数の選び方の表',
    s: '人数と、同時に使う場所の数で',
    page: '/kyutoki/gosu-erabikata',
    files: [{ label: 'PDF', href: '/downloads/kyutoki-gosu.pdf', icon: FileText }],
  },
} as const;

export type HaifuKey = keyof typeof HAIFU;

/** ダウンロードの札（このページの表を大きく、ほかの2つは小さく） */
export function HaifuDownload({ main, others = [] }: { main: HaifuKey; others?: HaifuKey[] }) {
  const m = HAIFU[main];
  const MI = m.icon;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sky-700 ring-1 ring-sky-200">
            <MI size={24} aria-hidden="true" />
          </span>
          <span className="flex flex-col">
            <span className="text-[17px] font-black text-slate-900">{m.h}<span className="ml-1.5 text-[12px] font-bold text-sky-700">無料</span></span>
            <span className="text-[12px] text-slate-600">{m.s}</span>
          </span>
        </div>
        <div className="flex gap-2">
          {m.files.map(({ label, href, icon: FI }) => (
            <a
              key={href}
              href={href}
              download
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-700 px-3 py-3 text-[15px] font-bold text-white hover:bg-sky-800"
            >
              <FI size={18} aria-hidden="true" />
              {label}
              <Download size={16} aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">登録やメールアドレスの入力は要りません</p>
      </div>
      {others.length > 0 && (
        <ul className="grid gap-2" style={{ gridTemplateColumns: `repeat(${others.length}, minmax(0, 1fr))` }}>
          {others.map((k) => {
            const o = HAIFU[k];
            const OI = o.icon;
            return (
              <li key={k}>
                <Link href={o.page} className="flex h-full items-center gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200 hover:ring-slate-300">
                  <OI size={18} className="shrink-0 text-sky-700" aria-hidden="true" />
                  <span className="text-[13px] font-bold leading-tight text-slate-800">{o.h}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** B の受け皿への入口。見積もりの総額が妥当かを確かめる（/kyutoki/mitsumori の主題に合わせた言葉） */
export function ToMitsumori({ note }: { note?: string }) {
  return (
    <Link
      href="/kyutoki/mitsumori"
      className="flex items-center gap-3 rounded-2xl bg-slate-900 p-4 text-white hover:bg-slate-800"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
        <ClipboardCheck size={24} aria-hidden="true" />
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-[16px] font-black">見積もりの総額、妥当か確かめる</span>
        <span className="text-[12px] text-slate-300">{note ?? '10秒で、条件に合う目安と比べられます'}</span>
      </span>
      <span aria-hidden="true" className="text-[20px]">›</span>
    </Link>
  );
}
